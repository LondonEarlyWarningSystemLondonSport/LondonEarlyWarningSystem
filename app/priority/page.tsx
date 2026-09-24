"use client";

import {
  useEffect,
  useState,
} from "react";

import type {
  CSSProperties,
} from "react";

import Link from "next/link";

import AppShell from "../../components/AppShell";

type OverviewData = {
  assessedSites?: number;
  boroughCount?: number;

  priorities?: {
    priorityA?: number;
    priorityB?: number;
    priorityC?: number;
    strategicMonitor?: number;
    riskReview?: number;
    monitor?: number;
  };

  risk?: {
    high?: number;
    medium?: number;
    noCurrentRisk?: number;
  };

  planning?: {
    confirmedRf6Sites?: number;
    planningReviewEvidenceSites?: number;
  };

  evidence?: {
    ppsLinkedSites?: number;
    knownAtRiskSites?: number;
    reviewRequiredSites?: number;
    imdDecile1To3Sites?: number;
  };

  error?: string;
};

type PriorityCardProps = {
  name: string;
  count: number;
  summary: string;
  interpretation: string;
  href: string;
  emphasis?:
    | "highest"
    | "priority"
    | "review"
    | "monitor";
};

export default function PriorityPage() {
  const [overview, setOverview] =
    useState<OverviewData | null>(
      null
    );

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(
      null
    );

  useEffect(() => {
    async function loadOverview() {
      try {
        setLoading(true);
        setError(null);

        const response =
          await fetch(
            "/api/overview",
            {
              cache: "no-store",
            }
          );

        const result:
          OverviewData =
          await response.json();

        if (!response.ok) {
          throw new Error(
            result?.error ||
              "Unable to load overview information."
          );
        }

        setOverview(result);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load overview information."
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
            Loading priority and
            monitoring information...
          </div>
        </main>
      </AppShell>
    );
  }

  if (
    error ||
    !overview
  ) {
    return (
      <AppShell>
        <main style={pageStyle}>
          <div style={errorStyle}>
            <strong>
              Priority information
              could not be loaded.
            </strong>

            <div
              style={{
                marginTop: "6px",
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

  const priorityA =
    overview.priorities
      ?.priorityA ?? 0;

  const priorityB =
    overview.priorities
      ?.priorityB ?? 0;

  const priorityC =
    overview.priorities
      ?.priorityC ?? 0;

  const strategicMonitor =
    overview.priorities
      ?.strategicMonitor ?? 0;

  const riskReview =
    overview.priorities
      ?.riskReview ?? 0;

  const monitor =
    overview.priorities
      ?.monitor ?? 0;

  const assessedSites =
    overview.assessedSites ?? 0;

  const planningReviewEvidenceSites =
    overview.planning
      ?.planningReviewEvidenceSites ??
    0;

  const confirmedRf6Sites =
    overview.planning
      ?.confirmedRf6Sites ?? 0;

  const activePriorityTotal =
    priorityA +
    priorityB +
    priorityC;

  const monitoringTotal =
    strategicMonitor +
    riskReview +
    monitor;

  return (
    <AppShell>
      <main style={pageStyle}>
        {/* HERO */}

        <section style={heroStyle}>
          <div style={heroEyebrowStyle}>
            Priority & monitoring
          </div>

          <h1 style={heroTitleStyle}>
            Understand what each
            assessment outcome means.
          </h1>

          <p style={heroTextStyle}>
            Every site in the
            current assessment is
            considered on two
            dimensions: Risk Exposure
            and Strategic Value.
            Their combination
            determines whether a site
            appears as a current
            priority, review case or
            monitoring site.
          </p>

          <div style={heroMetaStyle}>
            <span>
              {formatNumber(
                assessedSites
              )}{" "}
              assessed sites
            </span>

            <span style={metaDotStyle}>
              •
            </span>

            <span>
              {formatNumber(
                activePriorityTotal
              )}{" "}
              Priority A–C
            </span>

            <span style={metaDotStyle}>
              •
            </span>

            <span>
              {formatNumber(
                monitoringTotal
              )}{" "}
              monitoring / review
            </span>
          </div>
        </section>

        {/* CURRENT POSITION */}

        <section style={sectionStyle}>
          <div style={sectionHeadingStyle}>
            <div>
              <div style={eyebrowStyle}>
                Current position
              </div>

              <h2 style={sectionTitleStyle}>
                Six assessment
                outcomes
              </h2>
            </div>

            <p style={sectionDescriptionStyle}>
              The categories
              distinguish sites
              requiring active
              attention from sites
              that should remain
              under review or
              strategic monitoring.
            </p>
          </div>

          <div style={summaryGridStyle}>
            <SummaryMetric
              value={
                activePriorityTotal
              }
              title="Priority A–C"
              text="Sites currently within an active priority category."
            />

            <SummaryMetric
              value={
                riskReview
              }
              title="Risk Review"
              text="Sites where current risk evidence warrants review but Strategic Value is lower."
            />

            <SummaryMetric
              value={
                strategicMonitor
              }
              title="Strategic Monitor"
              text="Highly strategic sites with low or no current risk signal."
            />

            <SummaryMetric
              value={
                monitor
              }
              title="Monitor"
              text="Sites retained within the system without a current escalation outcome."
            />
          </div>
        </section>

        {/* ACTIVE PRIORITIES */}

        <section style={sectionStyle}>
          <div style={sectionHeadingStyle}>
            <div>
              <div style={eyebrowStyle}>
                Active priorities
              </div>

              <h2 style={sectionTitleStyle}>
                Priority A, B and C
              </h2>
            </div>

            <p style={sectionDescriptionStyle}>
              These categories
              represent sites
              currently escalated by
              the risk-led
              assessment.
            </p>
          </div>

          <div style={priorityGridStyle}>
            <PriorityCard
              name="Priority A"
              count={priorityA}
              summary="High Risk with High or Medium Strategic Value."
              interpretation="These sites combine the strongest current risk signal with higher strategic importance."
              href="/sites?priority=Priority%20A"
              emphasis="highest"
            />

            <PriorityCard
              name="Priority B"
              count={priorityB}
              summary="High Risk with Low or Not Flagged Strategic Value."
              interpretation="Risk remains the reason for escalation even where the current Strategic Value score is lower."
              href="/sites?priority=Priority%20B"
              emphasis="priority"
            />

            <PriorityCard
              name="Priority C"
              count={priorityC}
              summary="Medium Risk with High or Medium Strategic Value."
              interpretation="These sites combine material risk exposure with stronger strategic importance."
              href="/sites?priority=Priority%20C"
              emphasis="priority"
            />
          </div>
        </section>

        {/* REVIEW AND MONITORING */}

        <section style={sectionStyle}>
          <div style={sectionHeadingStyle}>
            <div>
              <div style={eyebrowStyle}>
                Review & monitoring
              </div>

              <h2 style={sectionTitleStyle}>
                Sites that remain
                visible without an
                A–C priority
              </h2>
            </div>

            <p style={sectionDescriptionStyle}>
              A site does not need
              to be Priority A, B or
              C to remain important
              to the Early Warning
              System.
            </p>
          </div>

          <div style={priorityGridStyle}>
            <PriorityCard
              name="Risk Review"
              count={riskReview}
              summary="Medium Risk with Low or Not Flagged Strategic Value."
              interpretation="These sites retain a meaningful risk signal and remain visible for review."
              href="/sites?priority=Risk%20Review"
              emphasis="review"
            />

            <PriorityCard
              name="Strategic Monitor"
              count={strategicMonitor}
              summary="High Strategic Value with Low or No Current Risk Signal."
              interpretation="These sites are strategically significant and remain visible even though the current assessment does not indicate higher risk."
              href="/sites?priority=Strategic%20Monitor"
              emphasis="monitor"
            />

            <PriorityCard
              name="Monitor"
              count={monitor}
              summary="Other sites with Low or No Current Risk Signal."
              interpretation="Monitor does not mean unimportant. It means the current evidence does not require escalation through the risk-led priority framework."
              href="/sites?priority=Monitor"
              emphasis="monitor"
            />
          </div>
        </section>

        {/* MATRIX */}

        <section style={matrixSectionStyle}>
          <div style={sectionHeadingStyle}>
            <div>
              <div style={eyebrowStyle}>
                How outcomes are
                assigned
              </div>

              <h2 style={sectionTitleStyle}>
                Risk-led priority
                matrix
              </h2>
            </div>

            <p style={sectionDescriptionStyle}>
              Risk is shown first
              because it determines
              the escalation pathway.
              Strategic Value then
              determines which
              priority or monitoring
              outcome applies.
            </p>
          </div>

          <div style={matrixScrollStyle}>
            <table style={matrixTableStyle}>
              <thead>
                <tr>
                  <th style={matrixCornerStyle}>
                    Risk ↓
                    <br />
                    Strategic Value →
                  </th>

                  <th style={matrixHeaderStyle}>
                    High
                  </th>

                  <th style={matrixHeaderStyle}>
                    Medium
                  </th>

                  <th style={matrixHeaderStyle}>
                    Low
                  </th>

                  <th style={matrixHeaderStyle}>
                    Not flagged
                  </th>
                </tr>
              </thead>

              <tbody>
                <MatrixRow
                  risk="High"
                  cells={[
                    "Priority A",
                    "Priority A",
                    "Priority B",
                    "Priority B",
                  ]}
                />

                <MatrixRow
                  risk="Medium"
                  cells={[
                    "Priority C",
                    "Priority C",
                    "Risk Review",
                    "Risk Review",
                  ]}
                />

                <MatrixRow
                  risk="Low"
                  cells={[
                    "Strategic Monitor",
                    "Monitor",
                    "Monitor",
                    "Monitor",
                  ]}
                />

                <MatrixRow
                  risk="No current risk signal"
                  cells={[
                    "Strategic Monitor",
                    "Monitor",
                    "Monitor",
                    "Monitor",
                  ]}
                />
              </tbody>
            </table>
          </div>

          <div style={matrixNoteStyle}>
            <strong>
              Important:
            </strong>{" "}
            the outcome is an
            early-warning and
            prioritisation signal.
            It is not a prediction
            that a site will be lost
            or closed, and it is not
            a planning judgement.
          </div>
        </section>

        {/* PLANNING */}

        <section style={planningSectionStyle}>
          <div>
            <div style={planningEyebrowStyle}>
              Planning evidence
            </div>

            <h2 style={planningTitleStyle}>
              Planning evidence is
              handled separately from
              the priority label.
            </h2>

            <p style={planningTextStyle}>
              Planning records can
              be identified and
              retained for review
              without automatically
              increasing a site’s
              Risk score. Only
              evidence meeting the
              current RF6 scoring
              logic contributes
              directly to the
              assessment.
            </p>
          </div>

          <div style={planningMetricsStyle}>
            <div style={planningMetricStyle}>
              <div style={planningMetricValueStyle}>
                {formatNumber(
                  planningReviewEvidenceSites
                )}
              </div>

              <div style={planningMetricLabelStyle}>
                sites with planning
                evidence identified
              </div>
            </div>

            <div style={planningMetricStyle}>
              <div style={planningMetricValueStyle}>
                {formatNumber(
                  confirmedRf6Sites
                )}
              </div>

              <div style={planningMetricLabelStyle}>
                sites where planning
                evidence contributes
                to RF6
              </div>
            </div>
          </div>
        </section>

        {/* INTERPRETATION */}

        <section style={interpretationStyle}>
          <div>
            <div style={interpretationEyebrowStyle}>
              Interpretation
            </div>

            <h2 style={interpretationTitleStyle}>
              The categories indicate
              different kinds of
              attention, not a simple
              league table.
            </h2>
          </div>

          <div style={interpretationGridStyle}>
            <InterpretationItem
              title="Risk drives escalation"
              text="Higher current risk can move a site into an active priority even where Strategic Value is lower."
            />

            <InterpretationItem
              title="Strategic value still matters"
              text="Strategic Value differentiates the response within each level of risk and keeps highly strategic sites visible."
            />

            <InterpretationItem
              title="Monitor is not unimportant"
              text="Sites in Monitor remain part of the assessed population and can change category as evidence changes."
            />

            <InterpretationItem
              title="Evidence can change"
              text="The Early Warning System can be refreshed as site, PPS, planning and other evidence develops."
            />
          </div>
        </section>

        {/* CTA */}

        <section style={ctaStyle}>
          <div>
            <div style={ctaEyebrowStyle}>
              Explore the evidence
            </div>

            <h2 style={ctaTitleStyle}>
              View the sites behind
              each category.
            </h2>

            <p style={ctaTextStyle}>
              Search the full
              assessed population by
              priority, borough or
              risk and open
              individual site
              records for the
              supporting evidence.
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

function SummaryMetric({
  value,
  title,
  text,
}: {
  value: number;
  title: string;
  text: string;
}) {
  return (
    <article style={summaryCardStyle}>
      <div style={summaryValueStyle}>
        {formatNumber(value)}
      </div>

      <div style={summaryTitleStyle}>
        {title}
      </div>

      <p style={summaryTextStyle}>
        {text}
      </p>
    </article>
  );
}

function PriorityCard({
  name,
  count,
  summary,
  interpretation,
  href,
  emphasis = "monitor",
}: PriorityCardProps) {
  const accent =
    emphasis === "highest"
      ? "#e21b23"
      : emphasis === "priority"
      ? "#d56a29"
      : emphasis === "review"
      ? "#70528a"
      : "#506774";

  return (
    <article style={priorityCardStyle}>
      <div
        style={{
          ...priorityAccentStyle,
          background: accent,
        }}
      />

      <div style={priorityCardBodyStyle}>
        <div style={priorityCardHeaderStyle}>
          <div>
            <div style={priorityNameStyle}>
              {name}
            </div>

            <div style={priorityCountStyle}>
              {formatNumber(
                count
              )}
            </div>
          </div>

          <div
            style={{
              ...categoryDotStyle,
              background: accent,
            }}
          />
        </div>

        <div style={prioritySummaryStyle}>
          {summary}
        </div>

        <p style={priorityInterpretationStyle}>
          {interpretation}
        </p>

        <Link
          href={href}
          style={priorityLinkStyle}
        >
          View {name} sites →
        </Link>
      </div>
    </article>
  );
}

function MatrixRow({
  risk,
  cells,
}: {
  risk: string;
  cells: string[];
}) {
  return (
    <tr>
      <th style={matrixRiskHeaderStyle}>
        {risk}
      </th>

      {cells.map(
        (
          value,
          index
        ) => (
          <td
            key={`${risk}-${index}`}
            style={matrixCellStyle}
          >
            <span
              style={getMatrixBadgeStyle(
                value
              )}
            >
              {value}
            </span>
          </td>
        )
      )}
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

function formatNumber(
  value:
    | number
    | null
    | undefined
) {
  return Number(
    value ?? 0
  ).toLocaleString(
    "en-GB"
  );
}

function getMatrixBadgeStyle(
  value: string
): CSSProperties {
  let background =
    "#efeeeb";

  let color =
    "#333333";

  if (value === "Priority A") {
    background =
      "#f6d7d9";

    color =
      "#8a1c22";
  }

  if (value === "Priority B") {
    background =
      "#f8e3cf";

    color =
      "#7c4217";
  }

  if (value === "Priority C") {
    background =
      "#f5eccf";

    color =
      "#66551d";
  }

  if (value === "Risk Review") {
    background =
      "#eee4f4";

    color =
      "#674080";
  }

  if (
    value ===
    "Strategic Monitor"
  ) {
    background =
      "#dfeaed";

    color =
      "#355c67";
  }

  if (value === "Monitor") {
    background =
      "#eeeeec";

    color =
      "#555555";
  }

  return {
    display: "inline-flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "30px",
    padding: "6px 10px",
    borderRadius: "999px",
    background,
    color,
    fontSize: "9px",
    fontWeight: 850,
    whiteSpace: "nowrap",
  };
}

/* =========================================================
   STYLES
   ========================================================= */

const pageStyle: CSSProperties = {
  maxWidth: "1440px",
  margin: "0 auto",
  padding: "38px 28px 90px",
};

const loadingStyle: CSSProperties = {
  padding: "80px 0",
  color: "#666666",
};

const errorStyle: CSSProperties = {
  padding: "22px",
  marginTop: "30px",
  borderRadius: "14px",
  background: "#fff0f0",
  border:
    "1px solid #efb9bb",
  color: "#7d2025",
};

const heroStyle: CSSProperties = {
  background: "#171717",
  color: "#ffffff",
  borderRadius: "24px",
  padding: "52px",
  marginBottom: "52px",
};

const heroEyebrowStyle: CSSProperties = {
  color: "#ef5358",
  fontSize: "11px",
  fontWeight: 850,
  textTransform: "uppercase",
  letterSpacing: "0.1em",
};

const heroTitleStyle: CSSProperties = {
  maxWidth: "980px",
  margin: "12px 0 18px",
  fontSize:
    "clamp(42px, 5.5vw, 68px)",
  lineHeight: 1,
  letterSpacing: "-0.05em",
  fontWeight: 900,
};

const heroTextStyle: CSSProperties = {
  maxWidth: "810px",
  margin: 0,
  color: "#c4c4c4",
  fontSize: "16px",
  lineHeight: 1.65,
};

const heroMetaStyle: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: "9px",
  alignItems: "center",
  marginTop: "26px",
  fontSize: "12px",
  fontWeight: 800,
};

const metaDotStyle: CSSProperties = {
  color: "#777777",
};

const sectionStyle: CSSProperties = {
  marginBottom: "54px",
};

const sectionHeadingStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(300px, 1fr))",
  gap: "30px",
  alignItems: "end",
  marginBottom: "22px",
};

const eyebrowStyle: CSSProperties = {
  color: "#e21b23",
  fontSize: "10px",
  fontWeight: 850,
  textTransform: "uppercase",
  letterSpacing: "0.09em",
};

const sectionTitleStyle: CSSProperties = {
  margin: "6px 0 0",
  fontSize: "31px",
  letterSpacing: "-0.035em",
};

const sectionDescriptionStyle: CSSProperties = {
  maxWidth: "700px",
  margin: 0,
  color: "#666666",
  fontSize: "13px",
  lineHeight: 1.65,
};

const summaryGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(220px, 1fr))",
  gap: "14px",
};

const summaryCardStyle: CSSProperties = {
  background: "#ffffff",
  border:
    "1px solid #e2ded9",
  borderRadius: "16px",
  padding: "22px",
};

const summaryValueStyle: CSSProperties = {
  fontSize: "39px",
  fontWeight: 900,
  letterSpacing: "-0.045em",
};

const summaryTitleStyle: CSSProperties = {
  marginTop: "6px",
  fontSize: "13px",
  fontWeight: 850,
};

const summaryTextStyle: CSSProperties = {
  margin: "7px 0 0",
  color: "#6b6b6b",
  fontSize: "10px",
  lineHeight: 1.5,
};

const priorityGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(280px, 1fr))",
  gap: "16px",
};

const priorityCardStyle: CSSProperties = {
  position: "relative",
  overflow: "hidden",
  background: "#ffffff",
  border:
    "1px solid #e2ded9",
  borderRadius: "16px",
};

const priorityAccentStyle: CSSProperties = {
  height: "5px",
  width: "100%",
};

const priorityCardBodyStyle: CSSProperties = {
  padding: "22px",
};

const priorityCardHeaderStyle: CSSProperties = {
  display: "flex",
  justifyContent:
    "space-between",
  alignItems: "flex-start",
  gap: "15px",
};

const priorityNameStyle: CSSProperties = {
  color: "#555555",
  fontSize: "11px",
  fontWeight: 850,
};

const priorityCountStyle: CSSProperties = {
  marginTop: "2px",
  fontSize: "37px",
  fontWeight: 900,
  letterSpacing: "-0.04em",
};

const categoryDotStyle: CSSProperties = {
  width: "11px",
  height: "11px",
  borderRadius: "999px",
};

const prioritySummaryStyle: CSSProperties = {
  marginTop: "17px",
  color: "#222222",
  fontSize: "12px",
  fontWeight: 850,
  lineHeight: 1.45,
};

const priorityInterpretationStyle: CSSProperties = {
  margin: "8px 0 18px",
  color: "#666666",
  fontSize: "10px",
  lineHeight: 1.55,
};

const priorityLinkStyle: CSSProperties = {
  display: "inline-flex",
  color: "#1c1c1c",
  textDecoration: "none",
  fontSize: "10px",
  fontWeight: 850,
};

const matrixSectionStyle: CSSProperties = {
  marginBottom: "54px",
  padding: "30px",
  background: "#ffffff",
  border:
    "1px solid #e2ded9",
  borderRadius: "18px",
};

const matrixScrollStyle: CSSProperties = {
  overflowX: "auto",
};

const matrixTableStyle: CSSProperties = {
  width: "100%",
  minWidth: "740px",
  borderCollapse: "collapse",
};

const matrixCornerStyle: CSSProperties = {
  padding: "14px",
  background: "#171717",
  color: "#ffffff",
  textAlign: "left",
  fontSize: "9px",
  lineHeight: 1.4,
};

const matrixHeaderStyle: CSSProperties = {
  padding: "14px",
  background: "#f1eeea",
  color: "#444444",
  borderBottom:
    "1px solid #ddd8d2",
  fontSize: "9px",
  fontWeight: 850,
  textAlign: "center",
};

const matrixRiskHeaderStyle: CSSProperties = {
  padding: "15px",
  borderBottom:
    "1px solid #ece8e4",
  background: "#faf8f6",
  color: "#333333",
  textAlign: "left",
  fontSize: "10px",
  fontWeight: 850,
};

const matrixCellStyle: CSSProperties = {
  padding: "15px",
  borderBottom:
    "1px solid #ece8e4",
  textAlign: "center",
};

const matrixNoteStyle: CSSProperties = {
  marginTop: "17px",
  padding: "14px 16px",
  borderRadius: "10px",
  background: "#f4f1ed",
  color: "#555555",
  fontSize: "10px",
  lineHeight: 1.55,
};

const planningSectionStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(300px, 1fr))",
  gap: "30px",
  alignItems: "center",
  marginBottom: "54px",
  padding: "32px",
  background: "#fff7db",
  border:
    "1px solid #e7d89d",
  borderRadius: "18px",
};

const planningEyebrowStyle: CSSProperties = {
  color: "#76631c",
  fontSize: "10px",
  fontWeight: 850,
  textTransform: "uppercase",
  letterSpacing: "0.08em",
};

const planningTitleStyle: CSSProperties = {
  margin: "7px 0 10px",
  fontSize: "26px",
  lineHeight: 1.15,
  letterSpacing: "-0.03em",
};

const planningTextStyle: CSSProperties = {
  margin: 0,
  maxWidth: "650px",
  color: "#655c38",
  fontSize: "11px",
  lineHeight: 1.6,
};

const planningMetricsStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns:
    "repeat(2, minmax(0, 1fr))",
  gap: "12px",
};

const planningMetricStyle: CSSProperties = {
  padding: "18px",
  background: "#ffffff",
  borderRadius: "12px",
};

const planningMetricValueStyle: CSSProperties = {
  fontSize: "34px",
  fontWeight: 900,
  letterSpacing: "-0.04em",
};

const planningMetricLabelStyle: CSSProperties = {
  marginTop: "5px",
  color: "#655c38",
  fontSize: "9px",
  lineHeight: 1.45,
  fontWeight: 750,
};

const interpretationStyle: CSSProperties = {
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

const interpretationEyebrowStyle: CSSProperties = {
  color: "#ef5358",
  fontSize: "10px",
  fontWeight: 850,
  textTransform: "uppercase",
  letterSpacing: "0.08em",
};

const interpretationTitleStyle: CSSProperties = {
  margin: "7px 0 0",
  maxWidth: "520px",
  fontSize: "25px",
  lineHeight: 1.2,
  letterSpacing: "-0.03em",
};

const interpretationGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns:
    "repeat(2, minmax(0, 1fr))",
  gap: "12px",
};

const interpretationItemStyle: CSSProperties = {
  padding: "14px",
  borderRadius: "10px",
  background: "#242424",
};

const interpretationItemTitleStyle: CSSProperties = {
  fontSize: "10px",
  fontWeight: 850,
};

const interpretationItemTextStyle: CSSProperties = {
  marginTop: "5px",
  color: "#bbbbbb",
  fontSize: "9px",
  lineHeight: 1.5,
};

const ctaStyle: CSSProperties = {
  background: "#e21b23",
  color: "#ffffff",
  borderRadius: "20px",
  padding: "32px",
  display: "flex",
  flexWrap: "wrap",
  justifyContent:
    "space-between",
  gap: "30px",
  alignItems: "center",
};

const ctaEyebrowStyle: CSSProperties = {
  fontSize: "9px",
  fontWeight: 850,
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  opacity: 0.8,
};

const ctaTitleStyle: CSSProperties = {
  margin: "6px 0 8px",
  fontSize: "28px",
  letterSpacing: "-0.035em",
};

const ctaTextStyle: CSSProperties = {
  maxWidth: "690px",
  margin: 0,
  color: "#ffd5d7",
  fontSize: "11px",
  lineHeight: 1.6,
};

const ctaButtonStyle: CSSProperties = {
  background: "#ffffff",
  color: "#171717",
  textDecoration: "none",
  padding: "13px 18px",
  borderRadius: "9px",
  fontSize: "11px",
  fontWeight: 850,
};
