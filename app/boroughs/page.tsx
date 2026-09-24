"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import Link from "next/link";

import AppShell from "../../components/AppShell";

type Borough = {
  borough: string;
  total_sites: number;

  priority_a_count: number;
  priority_b_count: number;
  priority_c_count: number;

  strategic_monitor_count: number;
  risk_review_count: number;
  monitor_count: number;

  confirmed_planning_score_count: number;
  planning_review_count: number;

  high_risk_count: number;
  medium_risk_count: number;
  no_current_risk_count: number;

  pps_linked_count: number;
  known_at_risk_count: number;
  review_required_count: number;

  imd_decile_1_3_count: number;
};

type BoroughApiResponse = {
  success: boolean;

  boroughCount: number;

  totals: {
    sites: number;
    priority: number;
    planningReview: number;
    confirmedPlanning: number;
    knownAtRisk: number;
    reviewRequired: number;
  };

  boroughs: Borough[];

  error?: string;
};

type SortOption =
  | "borough"
  | "sites"
  | "priority"
  | "risk"
  | "planning";

export default function BoroughsPage() {
  const [data, setData] =
    useState<BoroughApiResponse | null>(
      null
    );

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(
      null
    );

  const [search, setSearch] =
    useState("");

  const [sortBy, setSortBy] =
    useState<SortOption>(
      "borough"
    );

  useEffect(() => {
    async function loadBoroughs() {
      try {
        setLoading(true);
        setError(null);

        const response =
          await fetch(
            "/api/boroughs",
            {
              cache: "no-store",
            }
          );

        const result:
          BoroughApiResponse =
          await response.json();

        if (
          !response.ok ||
          !result.success
        ) {
          throw new Error(
            result.error ||
              "Unable to load borough information."
          );
        }

        setData(result);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load borough information."
        );
      } finally {
        setLoading(false);
      }
    }

    loadBoroughs();
  }, []);

  const boroughs =
    useMemo(() => {
      if (!data) {
        return [];
      }

      const query =
        search
          .trim()
          .toLowerCase();

      const filtered =
        data.boroughs.filter(
          (borough) =>
            borough.borough
              .toLowerCase()
              .includes(query)
        );

      return [
        ...filtered,
      ].sort(
        (
          a,
          b
        ) => {
          if (
            sortBy === "sites"
          ) {
            return (
              b.total_sites -
              a.total_sites
            );
          }

          if (
            sortBy === "priority"
          ) {
            return (
              getPriorityCount(
                b
              ) -
              getPriorityCount(
                a
              )
            );
          }

          if (
            sortBy === "risk"
          ) {
            return (
              b.high_risk_count -
              a.high_risk_count
            );
          }

          if (
            sortBy === "planning"
          ) {
            return (
              b.planning_review_count -
              a.planning_review_count
            );
          }

          return a.borough.localeCompare(
            b.borough
          );
        }
      );
    }, [
      data,
      search,
      sortBy,
    ]);

  if (loading) {
    return (
      <AppShell>
        <main style={pageStyle}>
          <div style={loadingStyle}>
            Loading borough
            assessments...
          </div>
        </main>
      </AppShell>
    );
  }

  if (
    error ||
    !data
  ) {
    return (
      <AppShell>
        <main style={pageStyle}>
          <div style={errorStyle}>
            <strong>
              Borough information
              could not be loaded.
            </strong>

            <div
              style={{
                marginTop:
                  "6px",
              }}
            >
              {error ||
                "Data unavailable."}
            </div>
          </div>
        </main>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <main style={pageStyle}>
        {/* HERO */}

        <section style={heroStyle}>
          <div style={heroEyebrowStyle}>
            Borough overview
          </div>

          <h1 style={heroTitleStyle}>
            Understand the
            picture across
            London’s boroughs
          </h1>

          <p style={heroTextStyle}>
            Compare the current
            assessment across
            London, identify where
            sites require greater
            attention and move
            directly into the
            underlying site
            evidence for each
            borough.
          </p>

          <div style={heroMetaStyle}>
            <span>
              {formatNumber(
                data.boroughCount
              )}{" "}
              boroughs
            </span>

            <span style={metaDotStyle}>
              •
            </span>

            <span>
              {formatNumber(
                data.totals.sites
              )}{" "}
              assessed sites
            </span>
          </div>
        </section>

        {/* LONDON SUMMARY */}

        <section style={sectionStyle}>
          <div style={sectionHeadingStyle}>
            <div>
              <div style={eyebrowStyle}>
                London-wide position
              </div>

              <h2 style={sectionTitleStyle}>
                Assessment at a glance
              </h2>
            </div>

            <p style={sectionDescriptionStyle}>
              Borough figures are
              aggregated from the
              same current
              site-level assessment
              used throughout the
              Early Warning System.
            </p>
          </div>

          <div style={metricGridStyle}>
            <MetricCard
              value={
                data.totals.sites
              }
              label="Assessed sites"
              description="Current sites represented across the borough assessment."
            />

            <MetricCard
              value={
                data.totals.priority
              }
              label="Priority A, B or C"
              description="Sites currently within an active priority category."
            />

            <MetricCard
              value={
                data.totals
                  .planningReview
              }
              label="Planning evidence"
              description="Sites with planning evidence identified for assessment or review."
            />

            <MetricCard
              value={
                data.totals
                  .confirmedPlanning
              }
              label="Scored RF6 signal"
              description="Sites where planning evidence currently contributes to the Risk assessment."
            />
          </div>

          <div style={planningNoteStyle}>
            <strong>
              Planning evidence is
              not the same as
              planning risk.
            </strong>{" "}
            A planning record may
            be retained for review
            without contributing to
            a site’s current RF6
            score.
          </div>
        </section>

        {/* FIND BOROUGH */}

        <section style={sectionStyle}>
          <div style={sectionHeadingStyle}>
            <div>
              <div style={eyebrowStyle}>
                Borough comparison
              </div>

              <h2 style={sectionTitleStyle}>
                Find your borough
              </h2>
            </div>

            <p style={sectionDescriptionStyle}>
              Use this view to
              understand the
              current distribution
              of priorities, risk
              and planning evidence
              before opening the
              underlying sites.
            </p>
          </div>

          <div style={toolbarStyle}>
            <div style={searchWrapStyle}>
              <label
                htmlFor="borough-search"
                style={fieldLabelStyle}
              >
                Search borough
              </label>

              <input
                id="borough-search"
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
                placeholder="e.g. Lewisham"
                style={inputStyle}
              />
            </div>

            <div style={sortWrapStyle}>
              <label
                htmlFor="borough-sort"
                style={fieldLabelStyle}
              >
                Sort by
              </label>

              <select
                id="borough-sort"
                value={sortBy}
                onChange={(event) =>
                  setSortBy(
                    event.target
                      .value as SortOption
                  )
                }
                style={selectStyle}
              >
                <option value="borough">
                  Borough A–Z
                </option>

                <option value="sites">
                  Number of sites
                </option>

                <option value="priority">
                  Active priorities
                </option>

                <option value="risk">
                  High risk
                </option>

                <option value="planning">
                  Planning evidence
                </option>
              </select>
            </div>
          </div>

          <div style={resultBarStyle}>
            Showing{" "}
            <strong>
              {boroughs.length}
            </strong>{" "}
            of{" "}
            <strong>
              {data.boroughCount}
            </strong>{" "}
            boroughs
          </div>

          {/* BOROUGH TABLE */}

          <div style={tableCardStyle}>
            <div style={tableScrollStyle}>
              <table style={tableStyle}>
                <thead>
                  <tr>
                    <th style={leftHeaderStyle}>
                      Borough
                    </th>

                    <th style={headerStyle}>
                      Sites
                    </th>

                    <th style={headerStyle}>
                      Active
                      priorities
                    </th>

                    <th style={headerStyle}>
                      High risk
                    </th>

                    <th style={headerStyle}>
                      Risk review
                    </th>

                    <th style={headerStyle}>
                      Strategic
                      monitor
                    </th>

                    <th style={headerStyle}>
                      Planning
                      evidence
                    </th>

                    <th style={headerStyle}>
                      Scored RF6
                    </th>

                    <th style={headerStyle}>
                      Review
                      required
                    </th>

                    <th style={headerStyle}>
                      Sites
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {boroughs.map(
                    (
                      borough
                    ) => (
                      <BoroughRow
                        key={
                          borough.borough
                        }
                        borough={
                          borough
                        }
                      />
                    )
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {boroughs.length ===
            0 && (
            <div style={emptyStyle}>
              No boroughs match
              “{search}”.
            </div>
          )}
        </section>

        {/* HOW TO READ */}

        <section style={interpretationStyle}>
          <div>
            <div style={interpretationEyebrowStyle}>
              How to read this page
            </div>

            <h2 style={interpretationTitleStyle}>
              Borough totals
              provide context —
              the underlying site
              evidence remains the
              source of the
              assessment.
            </h2>
          </div>

          <div style={interpretationGridStyle}>
            <InterpretationItem
              title="Active priorities"
              text="The combined number of Priority A, Priority B and Priority C sites."
            />

            <InterpretationItem
              title="Risk Review"
              text="Sites where current risk evidence warrants review even though Strategic Value is lower."
            />

            <InterpretationItem
              title="Strategic Monitor"
              text="Highly strategic sites retained for observation where current risk is low or no current risk signal is present."
            />

            <InterpretationItem
              title="Planning evidence"
              text="Planning evidence identified for assessment or review. This does not by itself indicate a confirmed threat."
            />
          </div>
        </section>

        {/* CTA */}

        <section style={ctaStyle}>
          <div>
            <div style={ctaEyebrowStyle}>
              Need the
              site-level evidence?
            </div>

            <h2 style={ctaTitleStyle}>
              Explore all
              assessed sites.
            </h2>

            <p style={ctaTextStyle}>
              Search and filter
              the current site
              population by
              borough, priority
              and risk, then open
              individual site
              records to
              understand the
              evidence behind
              each assessment.
            </p>
          </div>

          <Link
            href="/sites"
            style={ctaButtonStyle}
          >
            Explore Sites →
          </Link>
        </section>
      </main>
    </AppShell>
  );
}

/* =========================================================
   COMPONENTS
   ========================================================= */

function MetricCard({
  value,
  label,
  description,
}: {
  value: number;
  label: string;
  description: string;
}) {
  return (
    <article style={metricCardStyle}>
      <div style={metricValueStyle}>
        {formatNumber(value)}
      </div>

      <div style={metricLabelStyle}>
        {label}
      </div>

      <p style={metricDescriptionStyle}>
        {description}
      </p>
    </article>
  );
}

function BoroughRow({
  borough,
}: {
  borough: Borough;
}) {
  const priorities =
    getPriorityCount(
      borough
    );

  const priorityShare =
    borough.total_sites > 0
      ? Math.round(
          (priorities /
            borough.total_sites) *
            100
        )
      : 0;

  const boroughUrl =
    `/sites?borough=${encodeURIComponent(
      borough.borough
    )}`;

  return (
    <tr>
      <td style={boroughCellStyle}>
        <Link
          href={boroughUrl}
          style={boroughLinkStyle}
        >
          {borough.borough}
        </Link>

        <div style={boroughSubStyle}>
          {priorityShare}%
          currently in Priority
          A–C
        </div>

        <div style={miniBarStyle}>
          <div
            style={{
              ...miniBarFillStyle,

              width:
                `${Math.min(
                  priorityShare,
                  100
                )}%`,
            }}
          />
        </div>
      </td>

      <td style={numberCellStyle}>
        <strong>
          {formatNumber(
            borough.total_sites
          )}
        </strong>
      </td>

      <td style={numberCellStyle}>
        <div style={priorityNumberStyle}>
          {formatNumber(
            priorities
          )}
        </div>

        <div style={microBreakdownStyle}>
          A{" "}
          {
            borough.priority_a_count
          }{" "}
          · B{" "}
          {
            borough.priority_b_count
          }{" "}
          · C{" "}
          {
            borough.priority_c_count
          }
        </div>
      </td>

      <td style={numberCellStyle}>
        {borough.high_risk_count >
        0 ? (
          <span style={highRiskBadgeStyle}>
            {
              borough.high_risk_count
            }
          </span>
        ) : (
          <span style={zeroStyle}>
            0
          </span>
        )}
      </td>

      <td style={numberCellStyle}>
        {formatNumber(
          borough.risk_review_count
        )}
      </td>

      <td style={numberCellStyle}>
        {formatNumber(
          borough
            .strategic_monitor_count
        )}
      </td>

      <td style={numberCellStyle}>
        {borough
          .planning_review_count >
        0 ? (
          <span style={planningBadgeStyle}>
            {
              borough
                .planning_review_count
            }
          </span>
        ) : (
          <span style={zeroStyle}>
            0
          </span>
        )}
      </td>

      <td style={numberCellStyle}>
        {borough
          .confirmed_planning_score_count >
        0 ? (
          <span style={rf6BadgeStyle}>
            {
              borough
                .confirmed_planning_score_count
            }
          </span>
        ) : (
          <span style={zeroStyle}>
            0
          </span>
        )}
      </td>

      <td style={numberCellStyle}>
        {borough
          .review_required_count >
        0 ? (
          <span style={reviewBadgeStyle}>
            {
              borough
                .review_required_count
            }
          </span>
        ) : (
          <span style={zeroStyle}>
            0
          </span>
        )}
      </td>

      <td style={actionCellStyle}>
        <Link
          href={boroughUrl}
          style={viewButtonStyle}
        >
          View sites →
        </Link>
      </td>
    </tr>
  );
}

function InterpretationItem({
  title,
  text,
}: {
  title: string;
  text: string;
}) {
  return (
    <div style={interpretationItemStyle}>
      <div style={interpretationItemTitleStyle}>
        {title}
      </div>

      <div style={interpretationItemTextStyle}>
        {text}
      </div>
    </div>
  );
}

/* =========================================================
   HELPERS
   ========================================================= */

function getPriorityCount(
  borough: Borough
) {
  return (
    (borough.priority_a_count ||
      0) +
    (borough.priority_b_count ||
      0) +
    (borough.priority_c_count ||
      0)
  );
}

function formatNumber(
  value: number
) {
  return value.toLocaleString(
    "en-GB"
  );
}

/* =========================================================
   STYLES
   ========================================================= */

const pageStyle: React.CSSProperties = {
  maxWidth: "1440px",
  margin: "0 auto",
  padding: "38px 28px 90px",
};

const loadingStyle: React.CSSProperties = {
  padding: "80px 0",
  color: "#666666",
};

const errorStyle: React.CSSProperties = {
  padding: "22px",
  marginTop: "30px",
  borderRadius: "14px",
  background: "#fff0f0",
  border: "1px solid #efb9bb",
  color: "#7d2025",
};

const heroStyle: React.CSSProperties = {
  background: "#171717",
  color: "#ffffff",
  borderRadius: "24px",
  padding: "52px",
  marginBottom: "52px",
};

const heroEyebrowStyle: React.CSSProperties = {
  color: "#ef5358",
  fontSize: "11px",
  fontWeight: 850,
  textTransform: "uppercase",
  letterSpacing: "0.1em",
};

const heroTitleStyle: React.CSSProperties = {
  maxWidth: "920px",
  margin: "12px 0 18px",
  fontSize:
    "clamp(42px, 5.5vw, 68px)",
  lineHeight: 1,
  letterSpacing: "-0.05em",
  fontWeight: 900,
};

const heroTextStyle: React.CSSProperties = {
  maxWidth: "800px",
  margin: 0,
  color: "#c4c4c4",
  fontSize: "16px",
  lineHeight: 1.65,
};

const heroMetaStyle: React.CSSProperties = {
  display: "flex",
  gap: "9px",
  alignItems: "center",
  marginTop: "26px",
  color: "#ffffff",
  fontSize: "12px",
  fontWeight: 800,
};

const metaDotStyle: React.CSSProperties = {
  color: "#777777",
};

const sectionStyle: React.CSSProperties = {
  marginBottom: "54px",
};

const sectionHeadingStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(300px, 1fr))",
  gap: "30px",
  alignItems: "end",
  marginBottom: "22px",
};

const eyebrowStyle: React.CSSProperties = {
  color: "#e21b23",
  fontSize: "10px",
  fontWeight: 850,
  textTransform: "uppercase",
  letterSpacing: "0.09em",
};

const sectionTitleStyle: React.CSSProperties = {
  margin: "6px 0 0",
  fontSize: "31px",
  letterSpacing: "-0.035em",
};

const sectionDescriptionStyle: React.CSSProperties = {
  maxWidth: "700px",
  margin: 0,
  color: "#666666",
  fontSize: "13px",
  lineHeight: 1.65,
};

const metricGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(220px, 1fr))",
  gap: "14px",
};

const metricCardStyle: React.CSSProperties = {
  background: "#ffffff",
  border: "1px solid #e2ded9",
  borderRadius: "16px",
  padding: "22px",
};

const metricValueStyle: React.CSSProperties = {
  fontSize: "40px",
  fontWeight: 900,
  letterSpacing: "-0.045em",
};

const metricLabelStyle: React.CSSProperties = {
  marginTop: "7px",
  fontSize: "13px",
  fontWeight: 850,
};

const metricDescriptionStyle: React.CSSProperties = {
  color: "#6a6a6a",
  fontSize: "10px",
  lineHeight: 1.5,
  margin: "7px 0 0",
};

const planningNoteStyle: React.CSSProperties = {
  marginTop: "14px",
  padding: "15px 17px",
  borderRadius: "11px",
  background: "#fff8dc",
  border: "1px solid #eadb99",
  color: "#5d541e",
  fontSize: "11px",
  lineHeight: 1.55,
};

const toolbarStyle: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: "14px",
  marginBottom: "12px",
};

const searchWrapStyle: React.CSSProperties = {
  flex: "1 1 300px",
};

const sortWrapStyle: React.CSSProperties = {
  width: "220px",
  maxWidth: "100%",
};

const fieldLabelStyle: React.CSSProperties = {
  display: "block",
  marginBottom: "6px",
  color: "#555555",
  fontSize: "10px",
  fontWeight: 850,
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  padding: "12px 13px",
  border: "1px solid #d8d3ce",
  borderRadius: "9px",
  background: "#ffffff",
  color: "#222222",
  fontSize: "13px",
  outline: "none",
};

const selectStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px 13px",
  border: "1px solid #d8d3ce",
  borderRadius: "9px",
  background: "#ffffff",
  color: "#222222",
  fontSize: "13px",
};

const resultBarStyle: React.CSSProperties = {
  margin: "14px 0",
  color: "#777777",
  fontSize: "11px",
};

const tableCardStyle: React.CSSProperties = {
  background: "#ffffff",
  border: "1px solid #e2ded9",
  borderRadius: "16px",
  overflow: "hidden",
};

const tableScrollStyle: React.CSSProperties = {
  overflowX: "auto",
};

const tableStyle: React.CSSProperties = {
  width: "100%",
  minWidth: "1180px",
  borderCollapse: "collapse",
};

const headerStyle: React.CSSProperties = {
  background: "#f2efeb",
  color: "#5d5d5d",
  padding: "14px 12px",
  borderBottom:
    "1px solid #ddd8d2",
  textAlign: "center",
  fontSize: "9px",
  fontWeight: 850,
  textTransform: "uppercase",
  letterSpacing: "0.045em",
};

const leftHeaderStyle: React.CSSProperties = {
  ...headerStyle,
  textAlign: "left",
  paddingLeft: "18px",
};

const boroughCellStyle: React.CSSProperties = {
  minWidth: "245px",
  padding: "16px 18px",
  borderBottom:
    "1px solid #eeeae6",
};

const boroughLinkStyle: React.CSSProperties = {
  color: "#202020",
  textDecoration: "none",
  fontSize: "13px",
  fontWeight: 850,
};

const boroughSubStyle: React.CSSProperties = {
  marginTop: "5px",
  color: "#8a8a8a",
  fontSize: "9px",
};

const miniBarStyle: React.CSSProperties = {
  width: "110px",
  maxWidth: "100%",
  height: "4px",
  marginTop: "8px",
  borderRadius: "999px",
  background: "#ece9e6",
  overflow: "hidden",
};

const miniBarFillStyle: React.CSSProperties = {
  height: "100%",
  background: "#e21b23",
  borderRadius: "999px",
};

const numberCellStyle: React.CSSProperties = {
  padding: "14px 12px",
  borderBottom:
    "1px solid #eeeae6",
  textAlign: "center",
  color: "#444444",
  fontSize: "12px",
};

const priorityNumberStyle: React.CSSProperties = {
  fontWeight: 900,
  color: "#222222",
};

const microBreakdownStyle: React.CSSProperties = {
  marginTop: "4px",
  color: "#999999",
  fontSize: "8px",
  whiteSpace: "nowrap",
};

const highRiskBadgeStyle: React.CSSProperties = {
  display: "inline-flex",
  minWidth: "24px",
  justifyContent: "center",
  padding: "5px 7px",
  borderRadius: "999px",
  background: "#ffe5cf",
  color: "#803600",
  fontWeight: 850,
};

const planningBadgeStyle: React.CSSProperties = {
  display: "inline-flex",
  minWidth: "24px",
  justifyContent: "center",
  padding: "5px 7px",
  borderRadius: "999px",
  background: "#fff2c7",
  color: "#665100",
  fontWeight: 850,
};

const rf6BadgeStyle: React.CSSProperties = {
  display: "inline-flex",
  minWidth: "24px",
  justifyContent: "center",
  padding: "5px 7px",
  borderRadius: "999px",
  background: "#f2d7a7",
  color: "#5f3900",
  fontWeight: 850,
};

const reviewBadgeStyle: React.CSSProperties = {
  display: "inline-flex",
  minWidth: "24px",
  justifyContent: "center",
  padding: "5px 7px",
  borderRadius: "999px",
  background: "#eee4f4",
  color: "#674080",
  fontWeight: 850,
};

const zeroStyle: React.CSSProperties = {
  color: "#aaaaaa",
};

const actionCellStyle: React.CSSProperties = {
  padding: "14px 15px",
  borderBottom:
    "1px solid #eeeae6",
  textAlign: "right",
};

const viewButtonStyle: React.CSSProperties = {
  display: "inline-flex",
  padding: "8px 10px",
  borderRadius: "8px",
  background: "#f1eeea",
  color: "#222222",
  textDecoration: "none",
  fontSize: "9px",
  fontWeight: 850,
  whiteSpace: "nowrap",
};

const emptyStyle: React.CSSProperties = {
  padding: "35px",
  textAlign: "center",
  color: "#777777",
};

const interpretationStyle: React.CSSProperties = {
  background: "#171717",
  color: "#ffffff",
  borderRadius: "20px",
  padding: "32px",
  marginBottom: "48px",
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(300px, 1fr))",
  gap: "35px",
};

const interpretationEyebrowStyle: React.CSSProperties = {
  color: "#ef5358",
  fontSize: "10px",
  fontWeight: 850,
  textTransform: "uppercase",
  letterSpacing: "0.08em",
};

const interpretationTitleStyle: React.CSSProperties = {
  margin: "7px 0 0",
  maxWidth: "520px",
  fontSize: "25px",
  lineHeight: 1.2,
  letterSpacing: "-0.03em",
};

const interpretationGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns:
    "repeat(2, minmax(0, 1fr))",
  gap: "12px",
};

const interpretationItemStyle: React.CSSProperties = {
  padding: "14px",
  borderRadius: "10px",
  background: "#242424",
};

const interpretationItemTitleStyle: React.CSSProperties = {
  fontSize: "10px",
  fontWeight: 850,
};

const interpretationItemTextStyle: React.CSSProperties = {
  marginTop: "5px",
  color: "#bbbbbb",
  fontSize: "9px",
  lineHeight: 1.5,
};

const ctaStyle: React.CSSProperties = {
  background: "#e21b23",
  color: "#ffffff",
  borderRadius: "20px",
  padding: "32px",
  display: "flex",
  flexWrap: "wrap",
  justifyContent: "space-between",
  gap: "30px",
  alignItems: "center",
};

const ctaEyebrowStyle: React.CSSProperties = {
  fontSize: "9px",
  fontWeight: 850,
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  opacity: 0.8,
};

const ctaTitleStyle: React.CSSProperties = {
  margin: "6px 0 8px",
  fontSize: "28px",
  letterSpacing: "-0.035em",
};

const ctaTextStyle: React.CSSProperties = {
  maxWidth: "690px",
  margin: 0,
  color: "#ffd5d7",
  fontSize: "11px",
  lineHeight: 1.6,
};

const ctaButtonStyle: React.CSSProperties = {
  background: "#ffffff",
  color: "#171717",
  textDecoration: "none",
  padding: "13px 18px",
  borderRadius: "9px",
  fontSize: "11px",
  fontWeight: 850,
};
