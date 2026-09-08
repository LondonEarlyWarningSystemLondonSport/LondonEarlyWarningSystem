"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AppShell from "../components/AppShell";

type BoroughSummary = {
  borough: string | null;

  total_sites: number | null;

  priority_a_count: number | null;
  priority_b_count: number | null;
  priority_c_count: number | null;

  strategic_monitor_count: number | null;
  risk_review_count: number | null;
  monitor_count: number | null;

  confirmed_planning_score_count: number | null;
  planning_review_count: number | null;

  high_risk_count: number | null;
  medium_risk_count: number | null;
  no_current_risk_count: number | null;

  pps_linked_count: number | null;
  known_at_risk_count: number | null;
  review_required_count: number | null;
  imd_decile_1_3_count: number | null;
};

type OverviewData = {
  assessedSites: number;
  boroughCount: number;

  priorities: {
    priorityA: number;
    priorityB: number;
    priorityC: number;
    strategicMonitor: number;
    riskReview: number;
    monitor: number;
  };

  risk: {
    high: number;
    medium: number;
    noCurrentRisk: number;
  };

  planning: {
    confirmedRf6Sites: number;
    planningReviewEvidenceSites: number;
  };

  evidence: {
    ppsLinkedSites: number;
    knownAtRiskSites: number;
    reviewRequiredSites: number;
    imdDecile1To3Sites: number;
  };
};

type OverviewApiResponse = {
  success: boolean;

  overview?: OverviewData;

  validation?: {
    boroughCount: number;
    categoryTotal: number;
    populationMatchesCategories: boolean;
  };

  boroughs?: BoroughSummary[];

  error?: string;
};

type PriorityCardConfig = {
  label: string;
  description: string;
  value: number;
  href: string;
  style: React.CSSProperties;
};

export default function HomePage() {
  const [overview, setOverview] =
    useState<OverviewData | null>(null);

  const [boroughs, setBoroughs] =
    useState<BoroughSummary[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  useEffect(() => {
    async function loadOverview() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          "/api/overview",
          {
            cache: "no-store",
          }
        );

        const data: OverviewApiResponse =
          await response.json();

        if (
          !response.ok ||
          !data.success ||
          !data.overview
        ) {
          throw new Error(
            data.error ||
              "Unable to load the London overview"
          );
        }

        setOverview(data.overview);
        setBoroughs(data.boroughs || []);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load overview"
        );
      } finally {
        setLoading(false);
      }
    }

    loadOverview();
  }, []);

  if (loading) {
    return (
      <AppShell>
        <main style={pageStyle}>
          <div style={loadingStyle}>
            Loading London-wide assessment...
          </div>
        </main>
      </AppShell>
    );
  }

  if (error || !overview) {
    return (
      <AppShell>
        <main style={pageStyle}>
          <div style={errorStyle}>
            <strong>
              We could not load the London-wide
              assessment.
            </strong>

            <div style={{ marginTop: "6px" }}>
              {error || "Overview unavailable"}
            </div>
          </div>
        </main>
      </AppShell>
    );
  }

  const priorityCards: PriorityCardConfig[] = [
    {
      label: "Priority A",
      value:
        overview.priorities.priorityA,
      description:
        "Highest current strategic attention",
      href:
        "/sites?priority=Priority%20A",
      style: {
        background: "#202020",
        color: "#ffffff",
      },
    },

    {
      label: "Priority B",
      value:
        overview.priorities.priorityB,
      description:
        "Significant risk requiring active attention",
      href:
        "/sites?priority=Priority%20B",
      style: {
        background: "#b96800",
        color: "#ffffff",
      },
    },

    {
      label: "Priority C",
      value:
        overview.priorities.priorityC,
      description:
        "Strategically important with relevant risk exposure",
      href:
        "/sites?priority=Priority%20C",
      style: {
        background: "#f2d7a7",
        color: "#5f3900",
      },
    },

    {
      label: "Strategic Monitor",
      value:
        overview.priorities
          .strategicMonitor,
      description:
        "Strategically important assets retained under observation",
      href:
        "/sites?priority=Strategic%20Monitor",
      style: {
        background: "#dfe9f7",
        color: "#174f8a",
      },
    },

    {
      label: "Risk Review",
      value:
        overview.priorities.riskReview,
      description:
        "Risk evidence warrants further review",
      href:
        "/sites?priority=Risk%20Review",
      style: {
        background: "#eee4f4",
        color: "#674080",
      },
    },

    {
      label: "Monitor",
      value:
        overview.priorities.monitor,
      description:
        "Retained within the monitoring population",
      href:
        "/sites?priority=Monitor",
      style: {
        background: "#ebe9e6",
        color: "#555555",
      },
    },
  ];

  const priorityAB =
    overview.priorities.priorityA +
    overview.priorities.priorityB;

  const topBoroughs = boroughs
    .map((borough) => ({
      ...borough,

      attentionCount:
        numberValue(
          borough.priority_a_count
        ) +
        numberValue(
          borough.priority_b_count
        ),
    }))
    .sort(
      (a, b) =>
        b.attentionCount -
          a.attentionCount ||
        numberValue(
          b.confirmed_planning_score_count
        ) -
          numberValue(
            a.confirmed_planning_score_count
          ) ||
        (a.borough || "").localeCompare(
          b.borough || ""
        )
    )
    .slice(0, 6);

  return (
    <AppShell>
      <main style={pageStyle}>
        <section style={heroStyle}>
          <div style={heroContentStyle}>
            <div style={heroEyebrowStyle}>
              London playing field intelligence
            </div>

            <h1 style={heroTitleStyle}>
              What needs attention across
              London?
            </h1>

            <p style={heroTextStyle}>
              The London Early Warning System
              brings strategic value, risk,
              planning-pressure evidence and
              playing field context together to
              help partners understand where
              attention may be needed.
            </p>

            <div style={heroActionsStyle}>
              <Link
                href="/sites"
                style={primaryActionStyle}
              >
                Explore all sites →
              </Link>

              <Link
                href="/about"
                style={secondaryActionStyle}
              >
                About the assessment
              </Link>
            </div>
          </div>

          <div style={populationPanelStyle}>
            <div style={populationLabelStyle}>
              Current playing field assessment
            </div>

            <div style={populationValueStyle}>
              {formatNumber(
                overview.assessedSites
              )}
            </div>

            <div style={populationTextStyle}>
              sites across{" "}
              <strong>
                {overview.boroughCount}
              </strong>{" "}
              London boroughs
            </div>

            <div style={populationDividerStyle} />

            <div style={populationMetaStyle}>
              <div>
                <strong>{priorityAB}</strong>
                <span>
                  {" "}
                  Priority A + B sites
                </span>
              </div>

              <div>
                <strong>
                  {
                    overview.planning
                      .confirmedRf6Sites
                  }
                </strong>
                <span>
                  {" "}
                  sites with scored RF6
                  planning evidence
                </span>
              </div>
            </div>
          </div>
        </section>

        <section style={sectionWrapStyle}>
          <SectionHeading
            eyebrow="Current priorities"
            title="London-wide priority picture"
            description="Priority categories are produced by the Phase 1.3 risk-led model. Select a category to explore the sites within it."
          />

          <div style={priorityGridStyle}>
            {priorityCards.map((card) => (
              <Link
                key={card.label}
                href={card.href}
                style={{
                  ...priorityCardStyle,
                  ...card.style,
                }}
              >
                <div
                  style={priorityCardTopStyle}
                >
                  <div
                    style={
                      priorityCardLabelStyle
                    }
                  >
                    {card.label}
                  </div>

                  <div
                    style={
                      priorityCardArrowStyle
                    }
                  >
                    ↗
                  </div>
                </div>

                <div
                  style={priorityCardValueStyle}
                >
                  {formatNumber(card.value)}
                </div>

                <div
                  style={
                    priorityCardDescriptionStyle
                  }
                >
                  {card.description}
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section style={snapshotGridStyle}>
          <SnapshotPanel
            eyebrow="Risk"
            title="Current risk exposure"
          >
            <div style={riskStackStyle}>
              <RiskRow
                label="High"
                value={overview.risk.high}
                total={
                  overview.assessedSites
                }
                tone="high"
              />

              <RiskRow
                label="Medium"
                value={
                  overview.risk.medium
                }
                total={
                  overview.assessedSites
                }
                tone="medium"
              />

              <RiskRow
                label="No current risk signal"
                value={
                  overview.risk.noCurrentRisk
                }
                total={
                  overview.assessedSites
                }
                tone="none"
              />
            </div>

            <div style={panelFootnoteStyle}>
              Risk bands are considered
              separately from strategic value
              before the final priority category
              is assigned.
            </div>
          </SnapshotPanel>

          <SnapshotPanel
            eyebrow="Planning pressure"
            title="RF6 evidence"
          >
            <div style={bigMetricRowStyle}>
              <div style={bigMetricStyle}>
                <div
                  style={bigMetricValueStyle}
                >
                  {
                    overview.planning
                      .confirmedRf6Sites
                  }
                </div>

                <div
                  style={bigMetricLabelStyle}
                >
                  sites with scored RF6
                  planning evidence
                </div>
              </div>

              <div style={bigMetricStyle}>
                <div
                  style={bigMetricValueStyle}
                >
                  {
                    overview.planning
                      .planningReviewEvidenceSites
                  }
                </div>

                <div
                  style={bigMetricLabelStyle}
                >
                  sites with planning evidence
                  identified for review
                </div>
              </div>
            </div>

            <div
              style={planningCautionStyle}
            >
              Planning evidence identified does
              not automatically mean a site is
              at planning risk. Only cautious,
              site-linked evidence contributes
              to RF6 scoring.
            </div>
          </SnapshotPanel>
        </section>

        <section style={sectionWrapStyle}>
          <SectionHeading
            eyebrow="Borough picture"
            title="Where is the highest-attention population?"
            description="The boroughs below currently contain the greatest number of Priority A and Priority B sites. This is an assessment view rather than a ranking of borough performance."
          />

          <div style={boroughGridStyle}>
            {topBoroughs.map(
              (borough, index) => (
                <div
                  key={
                    borough.borough ||
                    `borough-${index}`
                  }
                  style={boroughCardStyle}
                >
                  <div
                    style={boroughRankStyle}
                  >
                    {String(index + 1).padStart(
                      2,
                      "0"
                    )}
                  </div>

                  <div
                    style={boroughNameStyle}
                  >
                    {borough.borough ||
                      "Unknown borough"}
                  </div>

                  <div
                    style={boroughTotalStyle}
                  >
                    {numberValue(
                      borough.total_sites
                    )}{" "}
                    assessed sites
                  </div>

                  <div
                    style={boroughMetricsStyle}
                  >
                    <MiniMetric
                      value={numberValue(
                        borough.priority_a_count
                      )}
                      label="Priority A"
                    />

                    <MiniMetric
                      value={numberValue(
                        borough.priority_b_count
                      )}
                      label="Priority B"
                    />

                    <MiniMetric
                      value={numberValue(
                        borough.confirmed_planning_score_count
                      )}
                      label="Scored RF6"
                    />
                  </div>
                </div>
              )
            )}
          </div>
        </section>

        <section style={evidenceSectionStyle}>
          <div style={evidenceIntroStyle}>
            <div style={sectionEyebrowStyle}>
              Evidence coverage
            </div>

            <h2 style={evidenceTitleStyle}>
              Understand the evidence behind
              the assessment
            </h2>

            <p style={evidenceTextStyle}>
              The system keeps strategic value,
              risk, planning evidence and data
              quality visible rather than
              presenting the classifications
              with false precision.
            </p>
          </div>

          <div style={evidenceMetricsStyle}>
            <EvidenceMetric
              value={
                overview.evidence
                  .ppsLinkedSites
              }
              label="sites linked to PPS evidence"
            />

            <EvidenceMetric
              value={
                overview.evidence
                  .knownAtRiskSites
              }
              label="sites identified as known at risk"
            />

            <EvidenceMetric
              value={
                overview.evidence
                  .reviewRequiredSites
              }
              label="sites currently requiring review"
            />

            <EvidenceMetric
              value={
                overview.evidence
                  .imdDecile1To3Sites
              }
              label="sites within IMD deciles 1–3"
            />
          </div>
        </section>

        <section style={ctaStyle}>
          <div>
            <div style={ctaEyebrowStyle}>
              Explore the evidence
            </div>

            <h2 style={ctaTitleStyle}>
              Move from the London picture to
              individual sites.
            </h2>

            <p style={ctaTextStyle}>
              Search by site, borough, current
              priority or risk and drill into
              the evidence supporting each
              assessment.
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

function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div style={sectionHeadingStyle}>
      <div>
        <div style={sectionEyebrowStyle}>
          {eyebrow}
        </div>

        <h2 style={sectionTitleStyle}>
          {title}
        </h2>
      </div>

      <p style={sectionDescriptionStyle}>
        {description}
      </p>
    </div>
  );
}

function SnapshotPanel({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section style={snapshotPanelStyle}>
      <div style={sectionEyebrowStyle}>
        {eyebrow}
      </div>

      <h2 style={snapshotTitleStyle}>
        {title}
      </h2>

      {children}
    </section>
  );
}

function RiskRow({
  label,
  value,
  total,
  tone,
}: {
  label: string;
  value: number;
  total: number;
  tone: "high" | "medium" | "none";
}) {
  const percentage =
    total > 0
      ? Math.round((value / total) * 100)
      : 0;

  return (
    <div style={riskRowStyle}>
      <div style={riskRowTopStyle}>
        <div style={riskLabelWrapStyle}>
          <span
            style={{
              ...riskDotStyle,
              ...getRiskDotStyle(tone),
            }}
          />

          <span style={riskLabelStyle}>
            {label}
          </span>
        </div>

        <div style={riskCountStyle}>
          {formatNumber(value)}
          <span style={riskPercentStyle}>
            {" "}
            · {percentage}%
          </span>
        </div>
      </div>

      <div style={barTrackStyle}>
        <div
          style={{
            ...barFillStyle,
            ...getRiskBarStyle(tone),
            width: `${Math.min(
              percentage,
              100
            )}%`,
          }}
        />
      </div>
    </div>
  );
}

function MiniMetric({
  value,
  label,
}: {
  value: number;
  label: string;
}) {
  return (
    <div style={miniMetricStyle}>
      <div style={miniMetricValueStyle}>
        {value}
      </div>

      <div style={miniMetricLabelStyle}>
        {label}
      </div>
    </div>
  );
}

function EvidenceMetric({
  value,
  label,
}: {
  value: number;
  label: string;
}) {
  return (
    <div style={evidenceMetricStyle}>
      <div style={evidenceMetricValueStyle}>
        {formatNumber(value)}
      </div>

      <div style={evidenceMetricLabelStyle}>
        {label}
      </div>
    </div>
  );
}

function numberValue(
  value: number | null | undefined
) {
  return value ?? 0;
}

function formatNumber(value: number) {
  return value.toLocaleString("en-GB");
}

function getRiskDotStyle(
  tone: "high" | "medium" | "none"
): React.CSSProperties {
  switch (tone) {
    case "high":
      return {
        background: "#b55316",
      };

    case "medium":
      return {
        background: "#d6a620",
      };

    default:
      return {
        background: "#60806d",
      };
  }
}

function getRiskBarStyle(
  tone: "high" | "medium" | "none"
): React.CSSProperties {
  switch (tone) {
    case "high":
      return {
        background: "#b55316",
      };

    case "medium":
      return {
        background: "#d6a620",
      };

    default:
      return {
        background: "#60806d",
      };
  }
}

const pageStyle: React.CSSProperties = {
  maxWidth: "1440px",
  margin: "0 auto",
  padding: "38px 28px 90px",
};

const loadingStyle: React.CSSProperties = {
  padding: "80px 0",
  color: "#666",
};

const errorStyle: React.CSSProperties = {
  marginTop: "30px",
  padding: "20px",
  borderRadius: "12px",
  border: "1px solid #efb9bb",
  background: "#fff0f0",
  color: "#7d2025",
};

const heroStyle: React.CSSProperties = {
  background: "#171717",
  color: "#ffffff",
  borderRadius: "24px",
  overflow: "hidden",
  display: "grid",
  gridTemplateColumns:
    "minmax(0, 1.7fr) minmax(320px, 0.75fr)",
  marginBottom: "44px",
  boxShadow:
    "0 22px 60px rgba(20,20,20,0.14)",
};

const heroContentStyle: React.CSSProperties = {
  padding: "54px 52px",
};

const heroEyebrowStyle: React.CSSProperties = {
  color: "#ef5358",
  fontSize: "11px",
  fontWeight: 850,
  textTransform: "uppercase",
  letterSpacing: "0.1em",
};

const heroTitleStyle: React.CSSProperties = {
  margin: "12px 0 18px",
  maxWidth: "850px",
  fontSize: "clamp(44px, 6vw, 76px)",
  lineHeight: 0.98,
  letterSpacing: "-0.055em",
  fontWeight: 900,
};

const heroTextStyle: React.CSSProperties = {
  color: "#c5c5c5",
  maxWidth: "760px",
  margin: 0,
  fontSize: "17px",
  lineHeight: 1.65,
};

const heroActionsStyle: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: "10px",
  marginTop: "28px",
};

const primaryActionStyle: React.CSSProperties = {
  textDecoration: "none",
  background: "#e21b23",
  color: "#fff",
  padding: "13px 18px",
  borderRadius: "9px",
  fontWeight: 850,
  fontSize: "13px",
};

const secondaryActionStyle: React.CSSProperties = {
  textDecoration: "none",
  color: "#fff",
  padding: "12px 18px",
  borderRadius: "9px",
  border: "1px solid #555",
  fontWeight: 750,
  fontSize: "13px",
};

const populationPanelStyle: React.CSSProperties = {
  background: "#242424",
  borderLeft: "1px solid #393939",
  padding: "46px 38px",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
};

const populationLabelStyle: React.CSSProperties = {
  color: "#999",
  fontSize: "10px",
  textTransform: "uppercase",
  letterSpacing: "0.09em",
  fontWeight: 850,
};

const populationValueStyle: React.CSSProperties = {
  fontSize: "70px",
  lineHeight: 1,
  fontWeight: 900,
  letterSpacing: "-0.055em",
  marginTop: "10px",
};

const populationTextStyle: React.CSSProperties = {
  color: "#ccc",
  marginTop: "8px",
  fontSize: "13px",
};

const populationDividerStyle: React.CSSProperties = {
  height: "1px",
  background: "#414141",
  margin: "26px 0",
};

const populationMetaStyle: React.CSSProperties = {
  display: "grid",
  gap: "11px",
  color: "#aaa",
  fontSize: "12px",
  lineHeight: 1.5,
};

const sectionWrapStyle: React.CSSProperties = {
  marginBottom: "44px",
};

const sectionHeadingStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns:
    "minmax(0, 1fr) minmax(300px, 0.7fr)",
  gap: "40px",
  alignItems: "end",
  marginBottom: "20px",
};

const sectionEyebrowStyle: React.CSSProperties = {
  color: "#e21b23",
  fontSize: "10px",
  fontWeight: 850,
  textTransform: "uppercase",
  letterSpacing: "0.09em",
};

const sectionTitleStyle: React.CSSProperties = {
  margin: "6px 0 0",
  fontSize: "30px",
  lineHeight: 1.1,
  letterSpacing: "-0.035em",
};

const sectionDescriptionStyle: React.CSSProperties = {
  margin: 0,
  color: "#666",
  fontSize: "13px",
  lineHeight: 1.6,
};

const priorityGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns:
    "repeat(3, minmax(0, 1fr))",
  gap: "14px",
};

const priorityCardStyle: React.CSSProperties = {
  borderRadius: "16px",
  minHeight: "178px",
  padding: "22px",
  textDecoration: "none",
  display: "flex",
  flexDirection: "column",
  boxSizing: "border-box",
};

const priorityCardTopStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: "20px",
};

const priorityCardLabelStyle: React.CSSProperties = {
  fontWeight: 850,
  fontSize: "13px",
};

const priorityCardArrowStyle: React.CSSProperties = {
  fontSize: "17px",
  opacity: 0.7,
};

const priorityCardValueStyle: React.CSSProperties = {
  fontSize: "48px",
  fontWeight: 900,
  letterSpacing: "-0.045em",
  lineHeight: 1,
  marginTop: "23px",
};

const priorityCardDescriptionStyle: React.CSSProperties = {
  fontSize: "12px",
  lineHeight: 1.45,
  marginTop: "8px",
  opacity: 0.85,
};

const snapshotGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns:
    "repeat(2, minmax(0, 1fr))",
  gap: "20px",
  marginBottom: "44px",
};

const snapshotPanelStyle: React.CSSProperties = {
  background: "#fff",
  border: "1px solid #e2ded9",
  borderRadius: "18px",
  padding: "28px",
};

const snapshotTitleStyle: React.CSSProperties = {
  fontSize: "24px",
  letterSpacing: "-0.03em",
  margin: "6px 0 24px",
};

const riskStackStyle: React.CSSProperties = {
  display: "grid",
  gap: "20px",
};

const riskRowStyle: React.CSSProperties = {
  display: "grid",
  gap: "7px",
};

const riskRowTopStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "20px",
};

const riskLabelWrapStyle: React.CSSProperties = {
  display: "flex",
  gap: "8px",
  alignItems: "center",
};

const riskDotStyle: React.CSSProperties = {
  width: "9px",
  height: "9px",
  borderRadius: "50%",
};

const riskLabelStyle: React.CSSProperties = {
  fontSize: "13px",
  fontWeight: 750,
};

const riskCountStyle: React.CSSProperties = {
  fontSize: "13px",
  fontWeight: 850,
};

const riskPercentStyle: React.CSSProperties = {
  color: "#888",
  fontWeight: 600,
};

const barTrackStyle: React.CSSProperties = {
  height: "7px",
  background: "#efedea",
  borderRadius: "999px",
  overflow: "hidden",
};

const barFillStyle: React.CSSProperties = {
  height: "100%",
  borderRadius: "999px",
};

const panelFootnoteStyle: React.CSSProperties = {
  borderTop: "1px solid #ece8e4",
  paddingTop: "17px",
  marginTop: "22px",
  color: "#777",
  fontSize: "11px",
  lineHeight: 1.55,
};

const bigMetricRowStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns:
    "repeat(2, minmax(0, 1fr))",
  gap: "14px",
};

const bigMetricStyle: React.CSSProperties = {
  background: "#f6f3ef",
  borderRadius: "13px",
  padding: "20px",
};

const bigMetricValueStyle: React.CSSProperties = {
  fontSize: "38px",
  lineHeight: 1,
  fontWeight: 900,
  letterSpacing: "-0.04em",
};

const bigMetricLabelStyle: React.CSSProperties = {
  color: "#666",
  fontSize: "11px",
  lineHeight: 1.45,
  marginTop: "8px",
};

const planningCautionStyle: React.CSSProperties = {
  marginTop: "17px",
  background: "#fff8dc",
  border: "1px solid #eddd98",
  color: "#5d521d",
  padding: "14px",
  borderRadius: "10px",
  fontSize: "11px",
  lineHeight: 1.55,
};

const boroughGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns:
    "repeat(3, minmax(0, 1fr))",
  gap: "14px",
};

const boroughCardStyle: React.CSSProperties = {
  background: "#fff",
  border: "1px solid #e2ded9",
  borderRadius: "15px",
  padding: "20px",
};

const boroughRankStyle: React.CSSProperties = {
  color: "#e21b23",
  fontSize: "10px",
  fontWeight: 850,
  letterSpacing: "0.08em",
};

const boroughNameStyle: React.CSSProperties = {
  marginTop: "8px",
  fontSize: "18px",
  fontWeight: 850,
  letterSpacing: "-0.02em",
};

const boroughTotalStyle: React.CSSProperties = {
  color: "#777",
  fontSize: "11px",
  marginTop: "4px",
};

const boroughMetricsStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns:
    "repeat(3, minmax(0, 1fr))",
  gap: "7px",
  marginTop: "18px",
};

const miniMetricStyle: React.CSSProperties = {
  background: "#f7f5f2",
  borderRadius: "8px",
  padding: "10px",
};

const miniMetricValueStyle: React.CSSProperties = {
  fontSize: "18px",
  fontWeight: 900,
};

const miniMetricLabelStyle: React.CSSProperties = {
  color: "#777",
  fontSize: "9px",
  marginTop: "3px",
};

const evidenceSectionStyle: React.CSSProperties = {
  background: "#efebe7",
  borderRadius: "20px",
  display: "grid",
  gridTemplateColumns:
    "minmax(300px, 0.8fr) minmax(0, 1.5fr)",
  gap: "35px",
  padding: "34px",
  marginBottom: "44px",
};

const evidenceIntroStyle: React.CSSProperties = {
  alignSelf: "center",
};

const evidenceTitleStyle: React.CSSProperties = {
  margin: "7px 0 10px",
  fontSize: "27px",
  letterSpacing: "-0.03em",
};

const evidenceTextStyle: React.CSSProperties = {
  margin: 0,
  color: "#666",
  fontSize: "12px",
  lineHeight: 1.6,
};

const evidenceMetricsStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns:
    "repeat(2, minmax(0, 1fr))",
  gap: "12px",
};

const evidenceMetricStyle: React.CSSProperties = {
  background: "#fff",
  borderRadius: "12px",
  padding: "18px",
};

const evidenceMetricValueStyle: React.CSSProperties = {
  fontSize: "29px",
  fontWeight: 900,
  letterSpacing: "-0.035em",
};

const evidenceMetricLabelStyle: React.CSSProperties = {
  color: "#666",
  fontSize: "10px",
  lineHeight: 1.45,
  marginTop: "5px",
};

const ctaStyle: React.CSSProperties = {
  background: "#e21b23",
  color: "#fff",
  borderRadius: "20px",
  padding: "34px",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "35px",
};

const ctaEyebrowStyle: React.CSSProperties = {
  fontSize: "10px",
  fontWeight: 850,
  textTransform: "uppercase",
  letterSpacing: "0.09em",
  opacity: 0.78,
};

const ctaTitleStyle: React.CSSProperties = {
  margin: "6px 0 9px",
  fontSize: "30px",
  letterSpacing: "-0.035em",
};

const ctaTextStyle: React.CSSProperties = {
  margin: 0,
  maxWidth: "700px",
  color: "#ffd6d7",
  fontSize: "12px",
  lineHeight: 1.6,
};

const ctaButtonStyle: React.CSSProperties = {
  background: "#fff",
  color: "#171717",
  textDecoration: "none",
  borderRadius: "9px",
  padding: "13px 19px",
  fontSize: "12px",
  fontWeight: 850,
  whiteSpace: "nowrap",
};
