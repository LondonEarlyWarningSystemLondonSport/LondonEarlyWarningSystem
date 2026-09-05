"use client";

import { useEffect, useState } from "react";

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

const priorityOptions = [
  "Priority A",
  "Priority B",
  "Priority C",
  "Strategic Monitor",
  "Risk Review",
  "Monitor",
];

const riskOptions = [
  "High",
  "Medium",
  "Low",
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

      const data: SitesApiResponse = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Unable to load sites");
      }

      setSites(data.sites || []);
      setNextPage(data.page?.nextPage || null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to load sites"
      );
    } finally {
      setLoading(false);
    }
  }

  async function loadMore() {
    if (!nextPage) return;

    try {
      setLoadingMore(true);
      setError(null);

      const response = await fetch(nextPage, {
        cache: "no-store",
      });

      const data: SitesApiResponse = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Unable to load more sites");
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

    setTimeout(() => {
      window.location.href = "/sites";
    }, 0);
  }

  return (
    <main
      style={{
        maxWidth: "1400px",
        margin: "0 auto",
        padding: "40px 24px 80px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <header style={{ marginBottom: "32px" }}>
        <p
          style={{
            margin: 0,
            fontSize: "14px",
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "#666",
          }}
        >
          London Early Warning System
        </p>

        <h1
          style={{
            margin: "8px 0 8px",
            fontSize: "40px",
            lineHeight: 1.1,
          }}
        >
          Explore Sites
        </h1>

        <p
          style={{
            margin: 0,
            maxWidth: "760px",
            color: "#555",
            fontSize: "16px",
            lineHeight: 1.6,
          }}
        >
          Explore current playing field sites by borough,
          priority category and risk band.
        </p>
      </header>

      <section
        style={{
          border: "1px solid #ddd",
          borderRadius: "12px",
          padding: "20px",
          marginBottom: "28px",
          background: "#fafafa",
        }}
      >
        <form onSubmit={handleSearchSubmit}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "minmax(240px, 2fr) repeat(3, minmax(180px, 1fr))",
              gap: "12px",
            }}
          >
            <input
              type="search"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search site name"
              style={{
                width: "100%",
                padding: "12px",
                border: "1px solid #bbb",
                borderRadius: "8px",
                fontSize: "15px",
              }}
            />

            <select
              value={borough}
              onChange={(event) =>
                setBorough(event.target.value)
              }
              style={{
                padding: "12px",
                border: "1px solid #bbb",
                borderRadius: "8px",
                fontSize: "15px",
              }}
            >
              <option value="">All boroughs</option>
              {boroughOptions.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>

            <select
              value={priority}
              onChange={(event) =>
                setPriority(event.target.value)
              }
              style={{
                padding: "12px",
                border: "1px solid #bbb",
                borderRadius: "8px",
                fontSize: "15px",
              }}
            >
              <option value="">All priorities</option>
              {priorityOptions.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>

            <select
              value={risk}
              onChange={(event) =>
                setRisk(event.target.value)
              }
              style={{
                padding: "12px",
                border: "1px solid #bbb",
                borderRadius: "8px",
                fontSize: "15px",
              }}
            >
              <option value="">All risk bands</option>
              {riskOptions.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <div
            style={{
              display: "flex",
              gap: "10px",
              marginTop: "14px",
            }}
          >
            <button
              type="submit"
              style={{
                padding: "10px 18px",
                borderRadius: "8px",
                border: "none",
                background: "#111",
                color: "#fff",
                cursor: "pointer",
                fontWeight: 700,
              }}
            >
              Search
            </button>

            <button
              type="button"
              onClick={clearFilters}
              style={{
                padding: "10px 18px",
                borderRadius: "8px",
                border: "1px solid #bbb",
                background: "#fff",
                cursor: "pointer",
              }}
            >
              Clear filters
            </button>
          </div>
        </form>
      </section>

      {error && (
        <div
          style={{
            padding: "14px 16px",
            border: "1px solid #d66",
            borderRadius: "8px",
            marginBottom: "20px",
          }}
        >
          {error}
        </div>
      )}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "14px",
        }}
      >
        <strong>
          {loading
            ? "Loading sites..."
            : `${sites.length} sites shown`}
        </strong>
      </div>

      {!loading && sites.length === 0 && !error && (
        <div
          style={{
            border: "1px solid #ddd",
            padding: "30px",
            borderRadius: "10px",
          }}
        >
          No sites found for the selected filters.
        </div>
      )}

      {sites.length > 0 && (
        <div
          style={{
            overflowX: "auto",
            border: "1px solid #ddd",
            borderRadius: "12px",
          }}
        >
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              minWidth: "900px",
            }}
          >
            <thead>
              <tr
                style={{
                  background: "#f4f4f4",
                  textAlign: "left",
                }}
              >
                <th style={thStyle}>Site</th>
                <th style={thStyle}>Borough</th>
                <th style={thStyle}>Priority</th>
                <th style={thStyle}>Risk</th>
                <th style={thStyle}>Strategic value</th>
                <th style={thStyle}>Planning</th>
              </tr>
            </thead>

            <tbody>
              {sites.map((site) => (
                <tr
                  key={site.site_id}
                  style={{
                    borderTop: "1px solid #eee",
                  }}
                >
                  <td style={tdStyle}>
                    <div
                      style={{
                        fontWeight: 700,
                        marginBottom: "4px",
                      }}
                    >
                      {site.site_name}
                    </div>

                    <div
                      style={{
                        color: "#666",
                        fontSize: "13px",
                      }}
                    >
                      {site.postcode || "No postcode"} · ID{" "}
                      {site.site_id}
                    </div>
                  </td>

                  <td style={tdStyle}>
                    {site.borough}
                  </td>

                  <td style={tdStyle}>
                    <strong>
                      {site.priority_category}
                    </strong>
                  </td>

                  <td style={tdStyle}>
                    <div>{site.risk_band}</div>

                    {site.risk_exposure_score !== null && (
                      <div
                        style={{
                          color: "#666",
                          fontSize: "13px",
                        }}
                      >
                        Score {site.risk_exposure_score}
                      </div>
                    )}
                  </td>

                  <td style={tdStyle}>
                    <div>
                      {site.strategic_value_band ||
                        "Not available"}
                    </div>

                    {site.strategic_value_score !== null && (
                      <div
                        style={{
                          color: "#666",
                          fontSize: "13px",
                        }}
                      >
                        Score {site.strategic_value_score}
                      </div>
                    )}
                  </td>

                  <td style={tdStyle}>
                    {site.confirmed_planning_count &&
                    site.confirmed_planning_count > 0 ? (
                      <div>
                        <strong>
                          {site.confirmed_planning_count}
                        </strong>{" "}
                        confirmed
                      </div>
                    ) : site.planning_candidate_count &&
                      site.planning_candidate_count > 0 ? (
                      <div>
                        {site.planning_candidate_count} for
                        review
                      </div>
                    ) : (
                      <span style={{ color: "#666" }}>
                        None identified
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {nextPage && !loading && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginTop: "24px",
          }}
        >
          <button
            type="button"
            onClick={loadMore}
            disabled={loadingMore}
            style={{
              padding: "12px 24px",
              borderRadius: "8px",
              border: "1px solid #222",
              background: loadingMore ? "#eee" : "#fff",
              cursor: loadingMore ? "default" : "pointer",
              fontWeight: 700,
            }}
          >
            {loadingMore ? "Loading..." : "Load more"}
          </button>
        </div>
      )}
    </main>
  );
}

const thStyle: React.CSSProperties = {
  padding: "14px 16px",
  fontSize: "13px",
  textTransform: "uppercase",
  letterSpacing: "0.04em",
  color: "#555",
};

const tdStyle: React.CSSProperties = {
  padding: "16px",
  verticalAlign: "top",
  fontSize: "14px",
  lineHeight: 1.45,
};
