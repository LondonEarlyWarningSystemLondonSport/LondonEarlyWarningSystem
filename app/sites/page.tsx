"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AppShell from "../../components/AppShell";

type SiteSummary = {
  site_id: number;
  site_name: string;
  postcode: string | null;
  borough: string;
  priority_category: string;
  strategic_value_score: number | null;
  strategic_value_band: string | null;
  risk_exposure_score: number | null;
  risk_band: string;
  planning_candidate_count: number | null;
  confirmed_planning_count: number | null;
  planning_review_required: string | null;
  planning_contributed_to_score?: string | null;
  known_at_risk?: string | null;
  review_required: string | null;
};

type SitesApiResponse = {
  success: boolean;
  page?: {
    pageSize: number;
    returned: number;
    hasNextPage: boolean;
    endCursor: string | null;
    nextPage: string | null;
  };
  filters?: {
    borough: string | null;
    priority: string | null;
    risk: string | null;
    search: string | null;
  };
  sites?: SiteSummary[];
  error?: string;
};

type PriorityTab = {
  label: string;
  value: string;
  description: string;
};

const priorityTabs: PriorityTab[] = [
  {
    label: "All Sites",
    value: "",
    description:
      "Explore the complete current playing field assessment.",
  },
  {
    label: "Priority A",
    value: "Priority A",
    description:
      "Sites requiring the highest level of current strategic attention.",
  },
  {
    label: "Priority B",
    value: "Priority B",
    description:
      "Sites with significant risk requiring active attention.",
  },
  {
    label: "Priority C",
    value: "Priority C",
    description:
      "Strategically important sites with relevant risk exposure.",
  },
  {
    label: "Strategic Monitor",
    value: "Strategic Monitor",
    description:
      "Strategically important assets that should remain under observation.",
  },
  {
    label: "Risk Review",
    value: "Risk Review",
    description:
      "Sites where risk evidence warrants further review.",
  },
  {
    label: "Monitor",
    value: "Monitor",
    description:
      "Sites retained within the monitoring population without current escalation.",
  },
];

const boroughOptions = [
  "Barking and Dagenham",
  "Barnet",
  "Bexley",
  "Brent",
  "Bromley",
  "Camden",
  "City of London",
  "Croydon",
  "Ealing",
  "Enfield",
  "Greenwich",
  "Hackney",
  "Hammersmith and Fulham",
  "Haringey",
  "Harrow",
  "Havering",
  "Hillingdon",
  "Hounslow",
  "Islington",
  "Kensington and Chelsea",
  "Kingston upon Thames",
  "Lambeth",
  "Lewisham",
  "Merton",
  "Newham",
  "Redbridge",
  "Richmond upon Thames",
  "Southwark",
  "Sutton",
  "Tower Hamlets",
  "Waltham Forest",
  "Wandsworth",
  "Westminster",
];

const riskOptions = [
  "High",
  "Medium",
  "No current risk signal",
];

export default function SitesPage() {
  const [sites, setSites] = useState<SiteSummary[]>([]);

  const [search, setSearch] = useState("");
  const [borough, setBorough] = useState("");
  const [priority, setPriority] = useState("");
  const [risk, setRisk] = useState("");

  const [nextPage, setNextPage] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const activeTab =
    priorityTabs.find((tab) => tab.value === priority) ??
    priorityTabs[0];

  function buildApiUrl() {
    const params = new URLSearchParams();

    params.set("pageSize", "25");

    if (search.trim()) {
      params.set("search", search.trim());
    }

    if (borough) {
      params.set("borough", borough);
    }

    if (priority) {
      params.set("priority", priority);
    }

    if (risk) {
      params.set("risk", risk);
    }

    return `/api/sites?${params.toString()}`;
  }

  async function loadSites() {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(buildApiUrl(), {
        cache: "no-store",
      });

      const data: SitesApiResponse =
        await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.error || "Unable to load sites"
        );
      }

      setSites(data.sites || []);
      setNextPage(data.page?.nextPage || null);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load sites"
      );
    } finally {
      setLoading(false);
    }
  }

  async function loadMore() {
    if (!nextPage) {
      return;
    }

    try {
      setLoadingMore(true);
      setError(null);

      const response = await fetch(nextPage, {
        cache: "no-store",
      });

      const data: SitesApiResponse =
        await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.error || "Unable to load more sites"
        );
      }

      setSites((current) => [
        ...current,
        ...(data.sites || []),
      ]);

      setNextPage(data.page?.nextPage || null);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load more sites"
      );
    } finally {
      setLoadingMore(false);
    }
  }

  useEffect(() => {
    loadSites();
  }, [borough, priority, risk]);

  function handleSearchSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    loadSites();
  }

  function clearFilters() {
    setSearch("");
    setBorough("");
    setPriority("");
    setRisk("");

    window.location.href = "/sites";
  }

  return (
    <AppShell>
      <main style={pageStyle}>
        <section style={heroStyle}>
          <div style={heroEyebrowStyle}>
            London playing field intelligence
          </div>

          <h1 style={heroTitleStyle}>
            Explore Sites
          </h1>

          <p style={heroTextStyle}>
            Explore London&apos;s current playing field
            assessment by priority, borough and risk.
            Understand which sites require attention and
            why.
          </p>
        </section>

        <section style={workspaceStyle}>
          <div style={tabScrollStyle}>
            <div style={tabsStyle}>
              {priorityTabs.map((tab) => {
                const active =
                  priority === tab.value;

                return (
                  <button
                    key={tab.label}
                    type="button"
                    onClick={() =>
                      setPriority(tab.value)
                    }
                    style={{
                      ...tabStyle,
                      ...(active
                        ? activeTabStyle
                        : {}),
                    }}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div style={tabContextStyle}>
            <div>
              <div style={tabContextTitleStyle}>
                {activeTab.label}
              </div>

              <div style={tabContextTextStyle}>
                {activeTab.description}
              </div>
            </div>

            {priority && (
              <PriorityBadge value={priority} />
            )}
          </div>

          <form
            onSubmit={handleSearchSubmit}
            style={filterPanelStyle}
          >
            <div style={filterGridStyle}>
              <div style={filterFieldStyle}>
                <label style={labelStyle}>
                  Search sites
                </label>

                <input
                  type="search"
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                  placeholder="Search by site name"
                  style={inputStyle}
                />
              </div>

              <div style={filterFieldStyle}>
                <label style={labelStyle}>
                  Borough
                </label>

                <select
                  value={borough}
                  onChange={(event) =>
                    setBorough(event.target.value)
                  }
                  style={inputStyle}
                >
                  <option value="">
                    All boroughs
                  </option>

                  {boroughOptions.map((item) => (
                    <option
                      key={item}
                      value={item}
                    >
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              <div style={filterFieldStyle}>
                <label style={labelStyle}>
                  Risk
                </label>

                <select
                  value={risk}
                  onChange={(event) =>
                    setRisk(event.target.value)
                  }
                  style={inputStyle}
                >
                  <option value="">
                    All risk bands
                  </option>

                  {riskOptions.map((item) => (
                    <option
                      key={item}
                      value={item}
                    >
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              <div style={filterActionsStyle}>
                <button
                  type="submit"
                  style={primaryButtonStyle}
                >
                  Search
                </button>

                <button
                  type="button"
                  onClick={clearFilters}
                  style={secondaryButtonStyle}
                >
                  Reset
                </button>
              </div>
            </div>
          </form>

          <div style={resultsHeaderStyle}>
            <div>
              <div style={resultsTitleStyle}>
                {loading
                  ? "Loading sites..."
                  : `${sites.length} sites shown`}
              </div>

              {!loading && (
                <div style={resultsSubtextStyle}>
                  Results are ordered by current
                  priority and site name.
                </div>
              )}
            </div>
          </div>

          {error && (
            <div style={errorStyle}>
              <strong>
                We could not load the sites.
              </strong>

              <div style={{ marginTop: "4px" }}>
                {error}
              </div>
            </div>
          )}

          {!loading &&
            sites.length === 0 &&
            !error && (
              <div style={emptyStyle}>
                <div style={emptyTitleStyle}>
                  No sites found
                </div>

                <div style={emptyTextStyle}>
                  Try changing the priority,
                  borough, risk or search term.
                </div>
              </div>
            )}

          {sites.length > 0 && (
            <div style={tableCardStyle}>
              <div style={tableScrollStyle}>
                <table style={tableStyle}>
                  <thead>
                    <tr style={tableHeaderRowStyle}>
                      <th style={thStyle}>
                        Site
                      </th>

                      <th style={thStyle}>
                        Borough
                      </th>

                      <th style={thStyle}>
                        Priority
                      </th>

                      <th style={thStyle}>
                        Risk
                      </th>

                      <th style={thStyle}>
                        Strategic value
                      </th>

                      <th style={thStyle}>
                        Planning evidence
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {sites.map((site) => (
                      <tr
                        key={site.site_id}
                        style={tableRowStyle}
                      >
                        <td style={siteTdStyle}>
                          <Link
                            href={`/site/${site.site_id}`}
                            style={siteLinkStyle}
                          >
                            <div
                              style={siteNameStyle}
                            >
                              {site.site_name}
                            </div>

                            <div
                              style={siteMetaStyle}
                            >
                              {site.postcode ||
                                "No postcode"}{" "}
                              · Site ID{" "}
                              {site.site_id}
                            </div>

                            <div
                              style={
                                viewRecordStyle
                              }
                            >
                              View site →
                            </div>
                          </Link>
                        </td>

                        <td style={tdStyle}>
                          {site.borough}
                        </td>

                        <td style={tdStyle}>
                          <PriorityBadge
                            value={
                              site.priority_category
                            }
                          />
                        </td>

                        <td style={tdStyle}>
                          <RiskBadge
                            value={
                              site.risk_band
                            }
                          />

                          {site.risk_exposure_score !==
                            null && (
                            <div
                              style={
                                scoreTextStyle
                              }
                            >
                              Score{" "}
                              {
                                site.risk_exposure_score
                              }
                            </div>
                          )}
                        </td>

                        <td style={tdStyle}>
                          <div
                            style={{
                              fontWeight: 700,
                            }}
                          >
                            {site.strategic_value_band ||
                              "Not available"}
                          </div>

                          {site.strategic_value_score !==
                            null && (
                            <div
                              style={
                                scoreTextStyle
                              }
                            >
                              Score{" "}
                              {
                                site.strategic_value_score
                              }
                            </div>
                          )}
                        </td>

                        <td style={tdStyle}>
                          <PlanningEvidence
                            candidateCount={
                              site.planning_candidate_count ??
                              0
                            }
                            confirmedCount={
                              site.confirmed_planning_count ??
                              0
                            }
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {nextPage && !loading && (
            <div style={loadMoreWrapStyle}>
              <button
                type="button"
                onClick={loadMore}
                disabled={loadingMore}
                style={{
                  ...loadMoreButtonStyle,
                  opacity: loadingMore
                    ? 0.6
                    : 1,
                }}
              >
                {loadingMore
                  ? "Loading more sites..."
                  : "Load more sites"}
              </button>
            </div>
          )}
        </section>
      </main>
    </AppShell>
  );
}

function PriorityBadge({
  value,
}: {
  value: string;
}) {
  return (
    <span
      style={{
        ...badgeBaseStyle,
        ...getPriorityStyle(value),
      }}
    >
      {value}
    </span>
  );
}

function RiskBadge({
  value,
}: {
  value: string;
}) {
  return (
    <span
      style={{
        ...badgeBaseStyle,
        ...getRiskStyle(value),
      }}
    >
      {value}
    </span>
  );
}

function PlanningEvidence({
  candidateCount,
  confirmedCount,
}: {
  candidateCount: number;
  confirmedCount: number;
}) {
  if (confirmedCount > 0) {
    return (
      <div>
        <div style={planningConfirmedStyle}>
          {confirmedCount} confirmed RF6
        </div>

        <div style={scoreTextStyle}>
          {candidateCount} planning{" "}
          {candidateCount === 1
            ? "candidate"
            : "candidates"}{" "}
          identified
        </div>
      </div>
    );
  }

  if (candidateCount > 0) {
    return (
      <div>
        <div style={planningReviewStyle}>
          Evidence for review
        </div>

        <div style={scoreTextStyle}>
          {candidateCount} planning{" "}
          {candidateCount === 1
            ? "candidate"
            : "candidates"}{" "}
          identified
        </div>
      </div>
    );
  }

  return (
    <span style={mutedStyle}>
      None identified
    </span>
  );
}

function getPriorityStyle(
  value: string
): React.CSSProperties {
  switch (value) {
    case "Priority A":
      return {
        background: "#242424",
        color: "#fff",
      };

    case "Priority B":
      return {
        background: "#b96800",
        color: "#fff",
      };

    case "Priority C":
      return {
        background: "#f2d7a7",
        color: "#5f3900",
      };

    case "Strategic Monitor":
      return {
        background: "#dfe9f7",
        color: "#174f8a",
      };

    case "Risk Review":
      return {
        background: "#eee4f4",
        color: "#674080",
      };

    default:
      return {
        background: "#ebe9e6",
        color: "#555",
      };
  }
}

function getRiskStyle(
  value: string
): React.CSSProperties {
  switch (value) {
    case "High":
      return {
        background: "#ffe5cf",
        color: "#803600",
      };

    case "Medium":
      return {
        background: "#fff2c7",
        color: "#665100",
      };

    case "No current risk signal":
      return {
        background: "#e7efea",
        color: "#365746",
      };

    default:
      return {
        background: "#eeeeee",
        color: "#555",
      };
  }
}

const pageStyle: React.CSSProperties = {
  maxWidth: "1440px",
  margin: "0 auto",
  padding: "44px 28px 80px",
};

const heroStyle: React.CSSProperties = {
  marginBottom: "30px",
  maxWidth: "920px",
};

const heroEyebrowStyle: React.CSSProperties = {
  color: "#e21b23",
  fontWeight: 800,
  fontSize: "13px",
  letterSpacing: "0.09em",
  textTransform: "uppercase",
  marginBottom: "12px",
};

const heroTitleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: "clamp(42px, 6vw, 68px)",
  lineHeight: 0.98,
  letterSpacing: "-0.045em",
  fontWeight: 900,
};

const heroTextStyle: React.CSSProperties = {
  marginTop: "18px",
  marginBottom: 0,
  maxWidth: "720px",
  fontSize: "18px",
  lineHeight: 1.55,
  color: "#595959",
};

const workspaceStyle: React.CSSProperties = {
  background: "#fff",
  border: "1px solid #e2ded9",
  borderRadius: "20px",
  overflow: "hidden",
  boxShadow:
    "0 12px 40px rgba(25, 20, 15, 0.05)",
};

const tabScrollStyle: React.CSSProperties = {
  overflowX: "auto",
  borderBottom: "1px solid #e4e0dc",
  background: "#fbfaf8",
};

const tabsStyle: React.CSSProperties = {
  display: "flex",
  minWidth: "max-content",
  padding: "0 22px",
};

const tabStyle: React.CSSProperties = {
  border: 0,
  borderBottom: "3px solid transparent",
  background: "transparent",
  padding: "20px 15px 16px",
  fontSize: "13px",
  fontWeight: 800,
  color: "#666",
  cursor: "pointer",
};

const activeTabStyle: React.CSSProperties = {
  color: "#171717",
  borderBottomColor: "#e21b23",
};

const tabContextStyle: React.CSSProperties = {
  padding: "24px 28px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "20px",
  borderBottom: "1px solid #eeeae6",
};

const tabContextTitleStyle: React.CSSProperties = {
  fontSize: "23px",
  fontWeight: 850,
  letterSpacing: "-0.02em",
};

const tabContextTextStyle: React.CSSProperties = {
  color: "#686868",
  fontSize: "14px",
  marginTop: "5px",
  lineHeight: 1.5,
};

const filterPanelStyle: React.CSSProperties = {
  padding: "22px 28px",
  background: "#f8f6f3",
  borderBottom: "1px solid #e8e4df",
};

const filterGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns:
    "minmax(260px, 2fr) repeat(2, minmax(180px, 1fr)) auto",
  gap: "14px",
  alignItems: "end",
};

const filterFieldStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "7px",
};

const labelStyle: React.CSSProperties = {
  fontSize: "12px",
  fontWeight: 800,
  color: "#555",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  minHeight: "44px",
  boxSizing: "border-box",
  border: "1px solid #d4d0ca",
  borderRadius: "9px",
  padding: "0 12px",
  fontSize: "14px",
  background: "#fff",
  color: "#171717",
};

const filterActionsStyle: React.CSSProperties = {
  display: "flex",
  gap: "8px",
};

const primaryButtonStyle: React.CSSProperties = {
  minHeight: "44px",
  padding: "0 19px",
  border: 0,
  borderRadius: "9px",
  background: "#e21b23",
  color: "#fff",
  fontWeight: 800,
  cursor: "pointer",
};

const secondaryButtonStyle: React.CSSProperties = {
  minHeight: "44px",
  padding: "0 17px",
  border: "1px solid #cbc6c0",
  borderRadius: "9px",
  background: "#fff",
  color: "#333",
  fontWeight: 750,
  cursor: "pointer",
};

const resultsHeaderStyle: React.CSSProperties = {
  padding: "23px 28px 15px",
};

const resultsTitleStyle: React.CSSProperties = {
  fontSize: "17px",
  fontWeight: 850,
};

const resultsSubtextStyle: React.CSSProperties = {
  marginTop: "4px",
  fontSize: "12px",
  color: "#777",
};

const tableCardStyle: React.CSSProperties = {
  margin: "0 28px 28px",
  border: "1px solid #dfdbd6",
  borderRadius: "13px",
  overflow: "hidden",
};

const tableScrollStyle: React.CSSProperties = {
  overflowX: "auto",
};

const tableStyle: React.CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
  minWidth: "1050px",
};

const tableHeaderRowStyle: React.CSSProperties = {
  background: "#f3f1ee",
  textAlign: "left",
};

const tableRowStyle: React.CSSProperties = {
  borderTop: "1px solid #ebe8e4",
};

const thStyle: React.CSSProperties = {
  padding: "13px 16px",
  fontSize: "11px",
  textTransform: "uppercase",
  letterSpacing: "0.06em",
  color: "#666",
  fontWeight: 850,
};

const tdStyle: React.CSSProperties = {
  padding: "17px 16px",
  verticalAlign: "top",
  fontSize: "14px",
  lineHeight: 1.45,
};

const siteTdStyle: React.CSSProperties = {
  ...tdStyle,
  width: "30%",
};

const siteLinkStyle: React.CSSProperties = {
  color: "inherit",
  textDecoration: "none",
  display: "block",
};

const siteNameStyle: React.CSSProperties = {
  fontWeight: 850,
  lineHeight: 1.3,
};

const siteMetaStyle: React.CSSProperties = {
  marginTop: "5px",
  fontSize: "12px",
  color: "#777",
};

const viewRecordStyle: React.CSSProperties = {
  marginTop: "8px",
  color: "#e21b23",
  fontSize: "12px",
  fontWeight: 800,
};

const badgeBaseStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  borderRadius: "999px",
  padding: "6px 9px",
  fontSize: "11px",
  lineHeight: 1,
  fontWeight: 850,
  whiteSpace: "nowrap",
};

const scoreTextStyle: React.CSSProperties = {
  color: "#777",
  fontSize: "12px",
  marginTop: "5px",
};

const planningConfirmedStyle: React.CSSProperties = {
  fontWeight: 800,
  color: "#8b3100",
};

const planningReviewStyle: React.CSSProperties = {
  fontWeight: 800,
  color: "#67521b",
};

const mutedStyle: React.CSSProperties = {
  color: "#888",
};

const errorStyle: React.CSSProperties = {
  margin: "0 28px 25px",
  padding: "16px",
  borderRadius: "10px",
  background: "#fff0f0",
  color: "#7a1f23",
  border: "1px solid #f1c5c7",
  fontSize: "14px",
};

const emptyStyle: React.CSSProperties = {
  margin: "0 28px 28px",
  padding: "55px 20px",
  textAlign: "center",
  border: "1px dashed #ccc6bf",
  borderRadius: "12px",
};

const emptyTitleStyle: React.CSSProperties = {
  fontSize: "18px",
  fontWeight: 850,
};

const emptyTextStyle: React.CSSProperties = {
  marginTop: "6px",
  color: "#777",
  fontSize: "14px",
};

const loadMoreWrapStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "center",
  padding: "0 28px 30px",
};

const loadMoreButtonStyle: React.CSSProperties = {
  border: "1px solid #242424",
  borderRadius: "9px",
  background: "#fff",
  padding: "12px 22px",
  fontWeight: 800,
  cursor: "pointer",
};
