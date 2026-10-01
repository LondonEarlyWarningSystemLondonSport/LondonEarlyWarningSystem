"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import type { CSSProperties, FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import AppShell from "../../components/AppShell";

type Flag = string | number | boolean | null | undefined;
type Value = number | string | null | undefined;
type Site = {
  site_id: number | string;
  site_name: string;
  postcode: string | null;
  borough: string;
  priority_category: string;
  strategic_value_score: Value;
  strategic_value_band: string | null;
  risk_exposure_score: Value;
  risk_band: string;
  planning_candidate_count: Value;
  confirmed_planning_count: Value;
  planning_review_required?: Flag;
  planning_contributed_to_score?: Flag;
};
type ApiResult = {
  success: boolean;
  sites?: Site[];
  page?: { nextPage?: string | null; hasNextPage?: boolean };
  error?: string;
};

type Priority = { value: string; description: string };
const priorities: Priority[] = [
  { value: "", description: "Explore the current London playing-field assessment." },
  { value: "Priority A", description: "High Risk Exposure combined with high or medium Strategic Value." },
  { value: "Priority B", description: "High Risk Exposure combined with low or not-flagged Strategic Value." },
  { value: "Priority C", description: "Medium Risk Exposure combined with high or medium Strategic Value." },
  { value: "Strategic Monitor", description: "High Strategic Value with low or no current risk signal." },
  { value: "Risk Review", description: "Medium Risk Exposure with low or not-flagged Strategic Value." },
  { value: "Monitor", description: "Sites retained for monitoring without a current priority or review outcome." },
];

const boroughs = [
  "Barking and Dagenham", "Barnet", "Bexley", "Brent", "Bromley", "Camden",
  "City of London", "Croydon", "Ealing", "Enfield", "Greenwich", "Hackney",
  "Hammersmith and Fulham", "Haringey", "Harrow", "Havering", "Hillingdon",
  "Hounslow", "Islington", "Kensington and Chelsea", "Kingston upon Thames",
  "Lambeth", "Lewisham", "Merton", "Newham", "Redbridge",
  "Richmond upon Thames", "Southwark", "Sutton", "Tower Hamlets",
  "Waltham Forest", "Wandsworth", "Westminster",
];

// Keep the API values unchanged. 'Low' is now included in the selector.
const risks = ["High", "Medium", "Low", "No current risk signal"];
const RED = "#e21b23";
const BLACK = "#171717";
const BORDER = "#e3dfda";
const muted: CSSProperties = { color: "#696969", fontSize: 12, lineHeight: 1.5 };
const input: CSSProperties = {
  width: "100%", minHeight: 43, boxSizing: "border-box", padding: "10px 12px",
  border: "1px solid #d6d1ca", borderRadius: 9, background: "white",
  color: BLACK, fontSize: 12,
};

function n(value: Value) {
  if (value == null || value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}
function yes(value: Flag) {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value === 1;
  if (typeof value !== "string") return false;
  return ["yes", "true", "1"].includes(value.trim().toLowerCase());
}
function displayNumber(value: Value) {
  const result = n(value);
  return result == null ? "—" : result.toLocaleString("en-GB");
}
function pill(value: string, kind: "priority" | "risk") {
  const priorityColors: Record<string, [string, string]> = {
    "Priority A": ["#202020", "#ffffff"],
    "Priority B": ["#f2d0d1", "#791f25"],
    "Priority C": ["#f6ddcd", "#754025"],
    "Strategic Monitor": ["#dce8ea", "#355c65"],
    "Risk Review": ["#ece3f2", "#60417b"],
    Monitor: ["#eeece9", "#555555"],
  };
  const riskColors: Record<string, [string, string]> = {
    High: ["#f6d8d9", "#82252a"],
    Medium: ["#f8e9ce", "#815415"],
    Low: ["#e5eaf5", "#385579"],
    "No current risk signal": ["#e5eee7", "#365746"],
    "No current risk": ["#e5eee7", "#365746"],
  };
  const colors = (kind === "priority" ? priorityColors : riskColors)[value] || ["#eee", "#555"];
  return <span style={{ display: "inline-block", borderRadius: 30, padding: "6px 10px", background: colors[0], color: colors[1], fontSize: 10, fontWeight: 850, lineHeight: 1.25 }}>{value || "Not recorded"}</span>;
}
function Planning({ site }: { site: Site }) {
  const candidates = n(site.planning_candidate_count) ?? 0;
  const confirmed = n(site.confirmed_planning_count) ?? 0;
  const contributed = confirmed > 0 || yes(site.planning_contributed_to_score);
  const forReview = candidates > 0 || yes(site.planning_review_required);
  if (contributed) {
    return <div><strong style={{ fontSize: 11, color: "#8a252b" }}>Contributes to Planning Pressure</strong><div style={muted}>{confirmed > 0 ? `${confirmed} contributing ${confirmed === 1 ? "application" : "applications"}` : "Site-linked evidence contributes"}</div>{candidates > 0 && <div style={muted}>{candidates} candidate {candidates === 1 ? "application" : "applications"} identified</div>}</div>;
  }
  if (forReview) {
    return <div><strong style={{ fontSize: 11, color: "#80601a" }}>Retained for review</strong><div style={muted}>{candidates ? `${candidates} candidate ${candidates === 1 ? "application" : "applications"} identified` : "Planning review flag recorded"}</div></div>;
  }
  return <span style={muted}>None identified</span>;
}

function PageLoading() {
  return <AppShell><main style={{ maxWidth: 1380, padding: "30px 24px", margin: "auto" }}>Loading the current playing-field register…</main></AppShell>;
}
export default function SitesPage() {
  return <Suspense fallback={<PageLoading />}><SitesPageContent /></Suspense>;
}

function SitesPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const paramString = searchParams.toString();
  const priority = searchParams.get("priority") || "";
  const borough = searchParams.get("borough") || "";
  const risk = searchParams.get("risk") || "";
  const submittedSearch = searchParams.get("search") || "";
  const [searchDraft, setSearchDraft] = useState(submittedSearch);
  const [sites, setSites] = useState<Site[]>([]);
  const [nextPage, setNextPage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestVersion = useRef(0);
  const morePending = useRef(false);

  useEffect(() => { setSearchDraft(submittedSearch); }, [submittedSearch]);

  // Server-side filtering and cursor pagination are retained from the existing API.
  useEffect(() => {
    const version = ++requestVersion.current;
    const controller = new AbortController();
    const params = new URLSearchParams(paramString);
    params.delete("after");
    params.set("pageSize", "25");
    setLoading(true);
    setError(null);
    setSites([]);
    setNextPage(null);
    setLoadingMore(false);
    morePending.current = false;
    fetch(`/api/sites?${params.toString()}`, { cache: "no-store", signal: controller.signal })
      .then(async (response) => {
        const json: ApiResult = await response.json();
        if (!response.ok || !json.success) throw new Error(json.error || "Unable to load sites");
        return json;
      })
      .then((data) => {
        if (version !== requestVersion.current) return;
        setSites(data.sites || []);
        setNextPage(data.page?.nextPage || null);
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted || version !== requestVersion.current) return;
        setError(err instanceof Error ? err.message : "Unable to load sites");
      })
      .finally(() => {
        if (version === requestVersion.current) setLoading(false);
      });
    return () => { controller.abort(); };
  }, [paramString]);

  function updateFilters(changes: Record<string, string>) {
    const params = new URLSearchParams(paramString);
    Object.entries(changes).forEach(([key, value]) => {
      if (value) params.set(key, value);
      else params.delete(key);
    });
    params.delete("after");
    const query = params.toString();
    router.replace(query ? `/sites?${query}` : "/sites", { scroll: false });
  }

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    updateFilters({ search: searchDraft.trim() });
  }

  async function loadMore() {
    if (!nextPage || loading || loadingMore || morePending.current) return;
    const version = requestVersion.current;
    morePending.current = true;
    setLoadingMore(true);
    setError(null);
    try {
      const url = new URL(nextPage, window.location.origin);
      if (url.origin !== window.location.origin || url.pathname !== "/api/sites") {
        throw new Error("Unexpected pagination URL");
      }
      const response = await fetch(url.toString(), { cache: "no-store" });
      const data: ApiResult = await response.json();
      if (!response.ok || !data.success) throw new Error(data.error || "Unable to load more sites");
      if (version !== requestVersion.current) return;
      setSites((current) => {
        const known = new Set(current.map((site) => String(site.site_id)));
        const extra = (data.sites || []).filter((site) => !known.has(String(site.site_id)));
        return [...current, ...extra];
      });
      setNextPage(data.page?.nextPage || null);
    } catch (err) {
      if (version === requestVersion.current) setError(err instanceof Error ? err.message : "Unable to load more sites");
    } finally {
      morePending.current = false;
      if (version === requestVersion.current) setLoadingMore(false);
    }
  }

  const currentPriority = priorities.find((option) => option.value === priority) || priorities[0];
  return (
    <AppShell>
      <main style={{ maxWidth: 1440, margin: "auto", padding: "30px 28px 75px" }}>
        <section style={{ borderRadius: 22, background: BLACK, color: "white", padding: "36px clamp(22px, 4vw, 50px)", marginBottom: 24 }}>
          <div style={{ color: "#ef555b", fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: ".09em" }}>London playing-field assessment</div>
          <h1 style={{ fontSize: "clamp(34px, 5vw, 56px)", lineHeight: 1.06, letterSpacing: "-.045em", margin: "8px 0 12px" }}>Explore Sites</h1>
          <p style={{ color: "#d0d0d0", maxWidth: 760, fontSize: 13, lineHeight: 1.65, margin: 0 }}>Explore current playing fields across London by priority outcome, borough and Risk Exposure. Open a site to see its Strategic Value, Risk & Planning evidence and review information.</p>
        </section>

        <section style={{ borderRadius: 17, background: "white", border: `1px solid ${BORDER}`, overflow: "hidden" }}>
          <div style={{ padding: "17px 20px 0", background: "#faf8f5", borderBottom: `1px solid ${BORDER}` }}>
            <div style={{ display: "flex", gap: 7, overflowX: "auto", paddingBottom: 14 }}>
              {priorities.map((option) => {
                const active = priority === option.value;
                return <button key={option.value} type="button" onClick={() => updateFilters({ priority: option.value })} aria-pressed={active} style={{ whiteSpace: "nowrap", border: active ? `1px solid ${BLACK}` : `1px solid ${BORDER}`, color: active ? "white" : BLACK, background: active ? BLACK : "white", borderRadius: 28, padding: "9px 12px", fontSize: 11, fontWeight: 800, cursor: "pointer" }}>{option.value || "All Sites"}</button>;
              })}
            </div>
          </div>
          <div style={{ padding: "21px 24px 15px", borderBottom: `1px solid ${BORDER}` }}>
            <strong style={{ fontSize: 18 }}>{currentPriority.value || "All assessed sites"}</strong>
            <p style={{ ...muted, margin: "5px 0 0" }}>{currentPriority.description}</p>
          </div>
          <form onSubmit={submitSearch} style={{ padding: "20px 24px", background: "#f8f6f3", borderBottom: `1px solid ${BORDER}` }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 205px), 1fr))", gap: 12, alignItems: "end" }}>
              <label style={{ display: "grid", gap: 7, fontSize: 11, fontWeight: 850 }}>Search site name
                <input type="search" value={searchDraft} onChange={(event) => setSearchDraft(event.target.value)} placeholder="Enter site name" style={input} />
              </label>
              <label style={{ display: "grid", gap: 7, fontSize: 11, fontWeight: 850 }}>Borough
                <select value={borough} onChange={(event) => updateFilters({ borough: event.target.value })} style={input}>
                  <option value="">All boroughs</option>
                  {boroughs.map((name) => <option value={name} key={name}>{name}</option>)}
                </select>
              </label>
              <label style={{ display: "grid", gap: 7, fontSize: 11, fontWeight: 850 }}>Risk Exposure
                <select value={risk} onChange={(event) => updateFilters({ risk: event.target.value })} style={input}>
                  <option value="">All risk bands</option>
                  {risks.map((name) => <option key={name} value={name}>{name}</option>)}
                </select>
              </label>
              <div style={{ display: "flex", gap: 8 }}>
                <button type="submit" style={{ cursor: "pointer", background: RED, color: "white", border: 0, borderRadius: 9, padding: "12px 18px", minHeight: 43, fontWeight: 850, fontSize: 11 }}>Search</button>
                <button type="button" onClick={() => { setSearchDraft(""); router.replace("/sites", { scroll: false }); }} style={{ cursor: "pointer", background: "white", border: `1px solid ${BORDER}`, borderRadius: 9, padding: "12px 15px", fontWeight: 800, fontSize: 11 }}>Reset</button>
              </div>
            </div>
          </form>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12, padding: "19px 24px 14px" }}>
            <div>
              <strong style={{ fontSize: 15 }}>{loading ? "Loading sites…" : `${sites.length.toLocaleString("en-GB")} sites loaded`}</strong>
              <div style={{ ...muted, marginTop: 4 }}>{nextPage ? "Additional matching sites are available using Load more." : "Results reflect the selected filters."}</div>
            </div>
            <Link href="/about#assessment" style={{ color: RED, fontSize: 11, fontWeight: 850, textDecoration: "none" }}>How this assessment works →</Link>
          </div>

          {error && <div role="alert" style={{ margin: "0 24px 16px", padding: 15, background: "#fff0f0", border: "1px solid #efc1c3", borderRadius: 10, fontSize: 12, color: "#812329" }}>{error}</div>}
          {!loading && !error && sites.length === 0 && <div style={{ textAlign: "center", padding: "40px 20px", color: "#696969" }}>No sites match these filters. Try a different search, borough, priority or risk band.</div>}

          {!loading && sites.length > 0 && <div style={{ margin: "0 24px 20px", border: `1px solid ${BORDER}`, borderRadius: 12, overflowX: "auto" }}>
            <table style={{ width: "100%", minWidth: 1000, borderCollapse: "collapse", textAlign: "left" }}>
              <thead><tr style={{ background: "#f4f1ed" }}>{["Site", "Borough", "Priority", "Risk Exposure", "Strategic Value", "Planning evidence"].map((heading) => <th key={heading} style={{ padding: "13px 14px", fontSize: 10, textTransform: "uppercase", letterSpacing: ".04em", color: "#555" }}>{heading}</th>)}</tr></thead>
              <tbody>{sites.map((site) => <tr key={String(site.site_id)} style={{ borderTop: `1px solid ${BORDER}` }}>
                <td style={{ padding: "16px 14px", width: "29%", verticalAlign: "top" }}><Link href={`/site/${encodeURIComponent(String(site.site_id))}`} style={{ color: BLACK, textDecoration: "none" }}><strong style={{ display: "block", fontSize: 13, lineHeight: 1.4 }}>{site.site_name}</strong><span style={{ ...muted, display: "block", marginTop: 5 }}>{site.postcode || "Postcode not recorded"} · Site ID {site.site_id}</span><span style={{ display: "block", color: RED, fontSize: 11, fontWeight: 850, marginTop: 7 }}>View site →</span></Link></td>
                <td style={{ padding: "16px 14px", verticalAlign: "top", fontSize: 12 }}>{site.borough}</td>
                <td style={{ padding: "16px 14px", verticalAlign: "top" }}>{pill(site.priority_category, "priority")}</td>
                <td style={{ padding: "16px 14px", verticalAlign: "top" }}>{pill(site.risk_band, "risk")}<div style={{ ...muted, marginTop: 7 }}>Score {displayNumber(site.risk_exposure_score)}</div></td>
                <td style={{ padding: "16px 14px", verticalAlign: "top" }}><strong style={{ fontSize: 12 }}>{site.strategic_value_band || "Not recorded"}</strong><div style={{ ...muted, marginTop: 7 }}>Score {displayNumber(site.strategic_value_score)} / 15</div></td>
                <td style={{ padding: "16px 14px", verticalAlign: "top" }}><Planning site={site} /></td>
              </tr>)}</tbody>
            </table>
          </div>}
          {nextPage && !loading && <div style={{ display: "flex", justifyContent: "center", padding: "3px 24px 25px" }}><button type="button" disabled={loadingMore} onClick={loadMore} style={{ cursor: loadingMore ? "wait" : "pointer", border: `1px solid ${BLACK}`, background: "white", borderRadius: 9, padding: "12px 19px", fontWeight: 850, fontSize: 11, opacity: loadingMore ? .65 : 1 }}>{loadingMore ? "Loading more…" : "Load more sites"}</button></div>}
        </section>
      </main>
    </AppShell>
  );
}
