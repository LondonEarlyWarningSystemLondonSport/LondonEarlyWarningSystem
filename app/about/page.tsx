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

type OverviewResponse = {
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

type ProtectionResponse = {
  success: boolean;

  counts: {
    total: number;
    currentAssessment: number;
    protectionWatchlist: number;
    manualReconciliation: number;
    outsidePlayingFieldScope: number;
    outsideCurrentAssessment: number;
  };

  error?: string;
};

export default function AboutPage() {
  const [
    overview,
    setOverview,
  ] =
    useState<OverviewResponse | null>(
      null
    );

  const [
    protection,
    setProtection,
  ] =
    useState<ProtectionResponse | null>(
      null
    );

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    error,
    setError,
  ] =
    useState<string | null>(
      null
    );

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      try {
        setLoading(true);
        setError(null);

        const [
          overviewResponse,
          protectionResponse,
        ] =
          await Promise.all([
            fetch(
              "/api/overview",
              {
                cache:
                  "no-store",
              }
            ),

            fetch(
              "/api/protection",
              {
                cache:
                  "no-store",
              }
            ),
          ]);

        const overviewResult =
          await overviewResponse.json();

        const protectionResult:
          ProtectionResponse =
          await protectionResponse.json();

        if (!overviewResponse.ok) {
          throw new Error(
            overviewResult?.error ||
              "Unable to load assessment overview."
          );
        }

        if (
          !protectionResponse.ok ||
          !protectionResult.success
        ) {
          throw new Error(
            protectionResult.error ||
              "Unable to load protection information."
          );
        }

        if (!cancelled) {
          setOverview(
            normaliseOverview(
              overviewResult
            )
          );

          setProtection(
            protectionResult
          );
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load methodology information."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadData();

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <AppShell>
        <main style={pageStyle}>
          <div style={loadingCardStyle}>
            <div style={loadingTitleStyle}>
              Loading assessment
              methodology
            </div>

            <div style={loadingTextStyle}>
              Retrieving the latest
              governed assessment
              information.
            </div>
          </div>
        </main>
      </AppShell>
    );
  }

  if (
    error ||
    !overview ||
    !protection
  ) {
    return (
      <AppShell>
        <main style={pageStyle}>
          <div style={errorStyle}>
            <strong>
              Methodology information
              could not be loaded.
            </strong>

            <div
              style={{
                marginTop:
                  "8px",
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

  const activePriorities =
    overview.priorities
      .priorityA +
    overview.priorities
      .priorityB +
    overview.priorities
      .priorityC;

  const reviewOnlyPlanning =
    Math.max(
      0,
      overview.planning
        .planningReviewEvidenceSites -
        overview.planning
          .confirmedRf6Sites
    );

  return (
    <AppShell>
      <main style={pageStyle}>
        <section
          id="assessment"
          style={heroStyle}
        >
          <div style={heroEyebrowStyle}>
            About the assessment
          </div>

          <h1 style={heroTitleStyle}>
            How the London Early
            Warning System assesses
            playing fields.
          </h1>

          <p style={heroTextStyle}>
            The assessment combines
            evidence about current
            risk exposure with the
            strategic value of each
            playing field. The two
            dimensions are kept
            separate and then
            combined to determine
            the appropriate priority,
            review or monitoring
            outcome.
          </p>

          <div style={heroMetaStyle}>
            <span>
              {formatNumber(
                overview.assessedSites
              )}{" "}
              assessed sites
            </span>

            <span style={metaDotStyle}>
              •
            </span>

            <span>
              {formatNumber(
                overview.boroughCount
              )}{" "}
              London boroughs
            </span>

            <span style={metaDotStyle}>
              •
            </span>

            <span>
              {formatNumber(
                activePriorities
              )}{" "}
              current Priority A–C
              sites
            </span>
          </div>
        </section>

        <section style={sectionStyle}>
          <SectionHeading
            eyebrow="Assessment at a glance"
            title="A risk-led early warning view of London's playing fields"
            description="The system is designed to help partners identify where attention, review or monitoring may be warranted. It is not a prediction that a site will be lost, closed or developed."
          />

          <div style={summaryGridStyle}>
            <SummaryCard
              value={
                overview.assessedSites
              }
              title="Sites assessed"
              text="Current playing fields included in the assessment."
              accent="#e21b23"
            />

            <SummaryCard
              value={
                activePriorities
              }
              title="Priority A–C"
              text="Sites currently placed in an active priority category."
              accent="#b7252b"
            />

            <SummaryCard
              value={
                overview.planning
                  .planningReviewEvidenceSites
              }
              title="Planning evidence identified"
              text="Sites with planning evidence identified for assessment or review."
              accent="#d97832"
            />

            <SummaryCard
              value={
                overview.planning
                  .confirmedRf6Sites
              }
              title="Planning evidence contributes"
              text="Sites where sufficiently strong site-linked evidence contributes to the Planning Pressure assessment."
              accent="#72528c"
            />
          </div>
        </section>

        <section style={sectionStyle}>
          <SectionHeading
            eyebrow="Scope"
            title="What is included in the current assessment"
            description="The core assessment is built around the current playing-field population that can be assessed consistently using the available evidence."
          />

          <div style={twoColumnGridStyle}>
            <InfoPanel
              title="Included"
              text="Current playing fields that can be represented consistently in the assessment are scored for Risk Exposure and Strategic Value and assigned an outcome."
            >
              <MiniPoint>
                Operational playing
                fields
              </MiniPoint>

              <MiniPoint>
                Sites where pitches
                are not currently
                marked out but remain
                in the assessed
                population
              </MiniPoint>

              <MiniPoint>
                Sites linked to PPS
                evidence where
                available
              </MiniPoint>

              <MiniPoint>
                Sites with planning
                evidence, including
                evidence retained
                only for review
              </MiniPoint>
            </InfoPanel>

            <InfoPanel
              title="Handled separately"
              text="Some known protection cases are deliberately retained outside the current assessment rather than being forced into a priority category."
            >
              <MiniPoint>
                Closed, dormant or
                derelict protection
                cases
              </MiniPoint>

              <MiniPoint>
                Records not currently
                matched confidently
                to the assessed
                population
              </MiniPoint>

              <MiniPoint>
                Sites requiring an
                Active Places or
                current-status check
              </MiniPoint>

              <MiniPoint>
                Records not currently
                identified as playing
                fields in PPS
              </MiniPoint>
            </InfoPanel>
          </div>

          <div style={scopeLinkWrapStyle}>
            <Link
              href="/protection"
              style={inlineLinkStyle}
            >
              View Protection &
              Reconciliation →
            </Link>
          </div>
        </section>

        <section style={darkSectionStyle}>
          <div style={darkIntroStyle}>
            <div style={darkEyebrowStyle}>
              Assessment approach
            </div>

            <h2 style={darkTitleStyle}>
              Risk is considered
              first because it
              determines the
              escalation pathway.
            </h2>

            <p style={darkLeadStyle}>
              Strategic importance
              alone does not make a
              site an active
              priority. Likewise,
              background exposure
              alone does not mean a
              site is facing a
              confirmed threat. The
              outcome reflects the
              combination of both
              dimensions.
            </p>
          </div>

          <div style={approachStepsStyle}>
            <ApproachStep
              number="01"
              title="Define the current scope"
              text="Identify the playing fields that can be assessed consistently."
            />

            <ApproachStep
              number="02"
              title="Assess Risk Exposure"
              text="Consider known concerns, ownership and management exposure, and planning pressure."
            />

            <ApproachStep
              number="03"
              title="Assess Strategic Value"
              text="Consider the role and significance of the site's playing-field provision."
            />

            <ApproachStep
              number="04"
              title="Determine the outcome"
              text="Combine the Risk and Strategic Value bands using the governed priority matrix."
            />
          </div>
        </section>

        <section style={sectionStyle}>
          <SectionHeading
            eyebrow="Risk assessment"
            title="How exposed is the site to loss, decline, reduced access or change?"
            description="Risk indicators are used as early-warning evidence. They should not be interpreted as confirmation that a site will be lost or developed."
          />

          <div style={criteriaGridStyle}>
            <CriterionCard
              title="Ownership exposure"
              purpose="Identifies ownership arrangements that may create greater exposure to loss, reduced access or change."
              score="0–2"
            />

            <CriterionCard
              title="Management exposure"
              purpose="Identifies management arrangements that may create greater exposure to loss or reduced access."
              score="0–2"
            />

            <CriterionCard
              title="Known at-risk evidence"
              purpose="Recognises existing protection intelligence where a credible concern has already been recorded."
              score="0 or 5"
            />

            <CriterionCard
              title="Planning pressure"
              purpose="Uses sufficiently strong site-linked planning evidence as an early-warning signal, while retaining weaker evidence separately for review."
              score="0–3"
            />
          </div>

          <div style={bandPanelStyle}>
            <div>
              <div style={bandEyebrowStyle}>
                Risk bands
              </div>

              <h3 style={bandTitleStyle}>
                Risk Exposure is
                grouped into four
                bands.
              </h3>
            </div>

            <div style={bandItemsStyle}>
              <BandItem
                title="High"
                text="Strong current exposure or known concern."
              />

              <BandItem
                title="Medium"
                text="Meaningful exposure requiring attention or review."
              />

              <BandItem
                title="Low"
                text="Limited current exposure."
              />

              <BandItem
                title="No current risk signal"
                text="No current risk signal identified through the available criteria."
              />
            </div>
          </div>
        </section>

        <section style={sectionStyle}>
          <SectionHeading
            eyebrow="Strategic value"
            title="How important is the site to current or future sport and physical activity provision?"
            description="Strategic Value is assessed independently from risk. A strategically important site can therefore remain in monitoring if there is no current risk signal."
          />

          <div style={criteriaGridStyle}>
            <CriterionCard
              title="Multi-pitch scale"
              purpose="Recognises larger playing-field sites with multiple adult or senior football and rugby pitch units."
              score="0–3"
            />

            <CriterionCard
              title="Full-size 3G provision"
              purpose="Recognises sites providing one or more confirmed full-size third-generation artificial grass pitches."
              score="0–3"
            />

            <CriterionCard
              title="Strategic sport provision"
              purpose="Recognises provision supporting strategic playing-field sports including rugby, cricket and hockey."
              score="0–2"
            />

            <CriterionCard
              title="Share of borough provision"
              purpose="Recognises sites that account for a significant share of equivalent provision within their borough."
              score="0–3"
            />

            <CriterionCard
              title="Inner London"
              purpose="Recognises the additional strategic significance of playing-field provision in Inner London."
              score="0 or 2"
            />

            <CriterionCard
              title="Deprivation"
              purpose="Recognises provision serving areas with higher levels of deprivation using the Index of Multiple Deprivation."
              score="0–2"
            />
          </div>

          <div style={bandPanelStyle}>
            <div>
              <div style={bandEyebrowStyle}>
                Strategic Value bands
              </div>

              <h3 style={bandTitleStyle}>
                The combined
                Strategic Value
                score is grouped
                into four bands.
              </h3>
            </div>

            <div style={bandItemsStyle}>
              <BandItem
                title="High"
                text="Score 9–15"
              />

              <BandItem
                title="Medium"
                text="Score 5–8"
              />

              <BandItem
                title="Low"
                text="Score 1–4"
              />

              <BandItem
                title="Not flagged"
                text="Score 0"
              />
            </div>
          </div>
        </section>

        <section style={sectionStyle}>
          <SectionHeading
            eyebrow="Priority outcome"
            title="Risk and Strategic Value are combined using a risk-led matrix"
            description="The matrix determines whether a site sits in an active priority category, review category or monitoring category."
          />

          <div style={matrixWrapStyle}>
            <table style={matrixTableStyle}>
              <thead>
                <tr>
                  <th style={cornerHeaderStyle}>
                    Risk ↓ /
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
                  values={[
                    {
                      label:
                        "Priority A",
                      tone: "a",
                    },
                    {
                      label:
                        "Priority A",
                      tone: "a",
                    },
                    {
                      label:
                        "Priority B",
                      tone: "b",
                    },
                    {
                      label:
                        "Priority B",
                      tone: "b",
                    },
                  ]}
                />

                <MatrixRow
                  risk="Medium"
                  values={[
                    {
                      label:
                        "Priority C",
                      tone: "c",
                    },
                    {
                      label:
                        "Priority C",
                      tone: "c",
                    },
                    {
                      label:
                        "Risk Review",
                      tone: "review",
                    },
                    {
                      label:
                        "Risk Review",
                      tone: "review",
                    },
                  ]}
                />

                <MatrixRow
                  risk="Low"
                  values={[
                    {
                      label:
                        "Strategic Monitor",
                      tone: "strategic",
                    },
                    {
                      label:
                        "Monitor",
                      tone: "monitor",
                    },
                    {
                      label:
                        "Monitor",
                      tone: "monitor",
                    },
                    {
                      label:
                        "Monitor",
                      tone: "monitor",
                    },
                  ]}
                />

                <MatrixRow
                  risk="No current risk signal"
                  values={[
                    {
                      label:
                        "Strategic Monitor",
                      tone: "strategic",
                    },
                    {
                      label:
                        "Monitor",
                      tone: "monitor",
                    },
                    {
                      label:
                        "Monitor",
                      tone: "monitor",
                    },
                    {
                      label:
                        "Monitor",
                      tone: "monitor",
                    },
                  ]}
                />
              </tbody>
            </table>
          </div>

          <div style={outcomeGridStyle}>
            <OutcomeCard
              title="Priority A"
              count={
                overview.priorities
                  .priorityA
              }
              text="Highest current escalation category where high risk combines with high or medium strategic value."
            />

            <OutcomeCard
              title="Priority B"
              count={
                overview.priorities
                  .priorityB
              }
              text="High-risk sites with lower current strategic-value bands."
            />

            <OutcomeCard
              title="Priority C"
              count={
                overview.priorities
                  .priorityC
              }
              text="Medium-risk sites with high or medium strategic value."
            />

            <OutcomeCard
              title="Risk Review"
              count={
                overview.priorities
                  .riskReview
              }
              text="Sites with medium exposure where the evidence warrants review but not an active Priority A–C outcome."
            />

            <OutcomeCard
              title="Strategic Monitor"
              count={
                overview.priorities
                  .strategicMonitor
              }
              text="High strategic-value sites with low or no current risk signal."
            />

            <OutcomeCard
              title="Monitor"
              count={
                overview.priorities
                  .monitor
              }
              text="Sites retained within the assessed population without a current escalation outcome."
            />
          </div>
        </section>

        <section style={planningSectionStyle}>
          <div style={planningIntroStyle}>
            <div style={eyebrowStyle}>
              Planning evidence
            </div>

            <h2 style={planningHeadingStyle}>
              Planning evidence is
              screened before it can
              affect the Risk
              assessment.
            </h2>

            <p style={planningLeadStyle}>
              Nearby development
              activity is not treated
              automatically as a
              threat to a playing
              field. Evidence is
              separated between
              sufficiently strong
              site-linked evidence
              and evidence retained
              only for review.
            </p>
          </div>

          <div style={planningFlowStyle}>
            <PlanningStat
              value={
                overview.planning
                  .planningReviewEvidenceSites
              }
              title="Planning evidence identified"
              text="Sites where planning evidence has been identified."
            />

            <div style={arrowStyle}>
              →
            </div>

            <PlanningStat
              value={
                reviewOnlyPlanning
              }
              title="Review only"
              text="Evidence retained for manual review but not used directly in the Planning Pressure assessment."
            />

            <div style={plusStyle}>
              +
            </div>

            <PlanningStat
              value={
                overview.planning
                  .confirmedRf6Sites
              }
              title="Contributes to assessment"
              text="Sites where sufficiently strong site-linked evidence contributes to Planning Pressure."
            />
          </div>

          <div style={planningNoteStyle}>
            <strong>
              Important:
            </strong>{" "}
            the{" "}
            {formatNumber(
              overview.planning
                .planningReviewEvidenceSites
            )}{" "}
            sites with planning
            evidence should not be
            described as{" "}
            {formatNumber(
              overview.planning
                .planningReviewEvidenceSites
            )}{" "}
            sites “at planning risk”.
            Only the evidence that
            satisfies the governed
            Planning Pressure rules
            contributes directly to
            the Risk assessment.
          </div>
        </section>

        <section style={sectionStyle}>
          <SectionHeading
            eyebrow="Protection coverage"
            title="Known at-risk records remain visible even when they sit outside the current assessment"
            description="Protection and reconciliation is kept separate from the current priority assessment so that unresolved or historic cases are not silently discarded."
          />

          <div style={protectionGridStyle}>
            <ProtectionStat
              value={
                protection.counts
                  .total
              }
              title="Known at-risk records"
              text="Records retained from the current protection evidence base."
            />

            <ProtectionStat
              value={
                protection.counts
                  .currentAssessment
              }
              title="In current assessment"
              text="Records matched to sites in the assessed playing-field population."
            />

            <ProtectionStat
              value={
                protection.counts
                  .outsideCurrentAssessment
              }
              title="Retained separately"
              text="Protection cases outside the current assessed population."
            />
          </div>

          <div style={protectionBreakdownStyle}>
            <BreakdownItem
              value={
                protection.counts
                  .protectionWatchlist
              }
              title="Protection watchlist"
              text="Closed, dormant or derelict cases."
            />

            <BreakdownItem
              value={
                protection.counts
                  .manualReconciliation
              }
              title="Manual reconciliation"
              text="Records requiring matching or current-status review."
            />

            <BreakdownItem
              value={
                protection.counts
                  .outsidePlayingFieldScope
              }
              title="Outside current scope"
              text="Records not currently identified as playing fields in PPS."
            />
          </div>

          <div style={scopeLinkWrapStyle}>
            <Link
              href="/protection"
              style={inlineLinkStyle}
            >
              Explore the protection
              register →
            </Link>
          </div>
        </section>

        <section style={sectionStyle}>
          <SectionHeading
            eyebrow="Evidence and assurance"
            title="The assessment combines multiple sources and keeps uncertainty visible"
            description="Where evidence is missing, incomplete or requires interpretation, the system is designed to surface that limitation rather than silently treat it as confirmed information."
          />

          <div style={evidenceGridStyle}>
            <EvidenceCard
              title="Active Places"
              text="Provides the core current site and facility evidence used to define and describe the assessed playing-field population."
            />

            <EvidenceCard
              title="Playing Pitch Strategies"
              text="Provides linked playing-field, protection and contextual evidence where available."
            />

            <EvidenceCard
              title="Planning evidence"
              text="Provides early-warning evidence from planning applications, with stronger site-linked evidence separated from review-only evidence."
            />

            <EvidenceCard
              title="Deprivation"
              text="Index of Multiple Deprivation evidence contributes to the Strategic Value assessment."
            />

            <EvidenceCard
              title="Borough context"
              text="The assessment considers each site's share of equivalent playing-field provision within its borough."
            />

            <EvidenceCard
              title="Data quality and review"
              text="Missing, conflicting or uncertain evidence can be retained for review rather than being hidden or automatically converted into a risk conclusion."
            />
          </div>
        </section>

        <section style={interpretationSectionStyle}>
          <div>
            <div style={interpretationEyebrowStyle}>
              Interpretation
            </div>

            <h2 style={interpretationTitleStyle}>
              What the Early Warning
              System does — and does
              not — tell you.
            </h2>
          </div>

          <div style={interpretationGridStyle}>
            <InterpretationCard
              title="It is an early-warning tool"
              text="The assessment helps identify where further attention, investigation, engagement or monitoring may be appropriate."
            />

            <InterpretationCard
              title="It is not a prediction"
              text="A high-risk or priority outcome does not mean a site will necessarily be lost, closed or developed."
            />

            <InterpretationCard
              title="It is not a planning judgement"
              text="The system does not determine the acceptability of a planning proposal or replace statutory planning processes."
            />

            <InterpretationCard
              title="Evidence can change"
              text="Site status, planning evidence and other source information can change, so outcomes should be interpreted using the latest available evidence."
            />
          </div>
        </section>

        <section style={ctaStyle}>
          <div>
            <div style={ctaEyebrowStyle}>
              Explore the evidence
            </div>

            <h2 style={ctaTitleStyle}>
              See how the methodology
              applies to individual
              sites.
            </h2>

            <p style={ctaTextStyle}>
              Explore current
              priorities, risk,
              strategic value,
              planning evidence and
              site-level supporting
              information.
            </p>
          </div>

          <div style={ctaButtonsStyle}>
            <Link
              href="/sites"
              style={primaryButtonStyle}
            >
              Explore Sites →
            </Link>

            <Link
              href="/priority"
              style={secondaryButtonStyle}
            >
              Priority & Monitoring
            </Link>
          </div>
        </section>
      </main>
    </AppShell>
  );
}

function normaliseOverview(
  raw: unknown
): OverviewResponse {
  const candidate =
    (
      raw as {
        overview?: unknown;
        data?: unknown;
      }
    )?.overview ??
    (
      raw as {
        data?: unknown;
      }
    )?.data ??
    raw;

  const source =
    candidate as Partial<OverviewResponse>;

  return {
    assessedSites:
      Number(
        source.assessedSites ??
          0
      ),

    boroughCount:
      Number(
        source.boroughCount ??
          0
      ),

    priorities: {
      priorityA:
        Number(
          source.priorities
            ?.priorityA ??
            0
        ),

      priorityB:
        Number(
          source.priorities
            ?.priorityB ??
            0
        ),

      priorityC:
        Number(
          source.priorities
            ?.priorityC ??
            0
        ),

      strategicMonitor:
        Number(
          source.priorities
            ?.strategicMonitor ??
            0
        ),

      riskReview:
        Number(
          source.priorities
            ?.riskReview ??
            0
        ),

      monitor:
        Number(
          source.priorities
            ?.monitor ??
            0
        ),
    },

    risk: {
      high:
        Number(
          source.risk
            ?.high ??
            0
        ),

      medium:
        Number(
          source.risk
            ?.medium ??
            0
        ),

      noCurrentRisk:
        Number(
          source.risk
            ?.noCurrentRisk ??
            0
        ),
    },

    planning: {
      confirmedRf6Sites:
        Number(
          source.planning
            ?.confirmedRf6Sites ??
            0
        ),

      planningReviewEvidenceSites:
        Number(
          source.planning
            ?.planningReviewEvidenceSites ??
            0
        ),
    },

    evidence: {
      ppsLinkedSites:
        Number(
          source.evidence
            ?.ppsLinkedSites ??
            0
        ),

      knownAtRiskSites:
        Number(
          source.evidence
            ?.knownAtRiskSites ??
            0
        ),

      reviewRequiredSites:
        Number(
          source.evidence
            ?.reviewRequiredSites ??
            0
        ),

      imdDecile1To3Sites:
        Number(
          source.evidence
            ?.imdDecile1To3Sites ??
            0
        ),
    },
  };
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
        <div style={eyebrowStyle}>
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

function SummaryCard({
  value,
  title,
  text,
  accent,
}: {
  value: number;
  title: string;
  text: string;
  accent: string;
}) {
  return (
    <article style={summaryCardStyle}>
      <div
        style={{
          ...summaryAccentStyle,
          background:
            accent,
        }}
      />

      <div style={summaryBodyStyle}>
        <div style={summaryValueStyle}>
          {formatNumber(
            value
          )}
        </div>

        <div style={summaryTitleStyle}>
          {title}
        </div>

        <div style={summaryTextStyle}>
          {text}
        </div>
      </div>
    </article>
  );
}

function InfoPanel({
  title,
  text,
  children,
}: {
  title: string;
  text: string;
  children:
    React.ReactNode;
}) {
  return (
    <article style={infoPanelStyle}>
      <h3 style={infoPanelTitleStyle}>
        {title}
      </h3>

      <p style={infoPanelTextStyle}>
        {text}
      </p>

      <div style={miniPointsStyle}>
        {children}
      </div>
    </article>
  );
}

function MiniPoint({
  children,
}: {
  children:
    React.ReactNode;
}) {
  return (
    <div style={miniPointStyle}>
      <span style={miniDotStyle} />

      <span>
        {children}
      </span>
    </div>
  );
}

function ApproachStep({
  number,
  title,
  text,
}: {
  number: string;
  title: string;
  text: string;
}) {
  return (
    <div style={approachStepStyle}>
      <div style={approachNumberStyle}>
        {number}
      </div>

      <div style={approachTitleStyle}>
        {title}
      </div>

      <div style={approachTextStyle}>
        {text}
      </div>
    </div>
  );
}

function CriterionCard({
  title,
  purpose,
  score,
}: {
  title: string;
  purpose: string;
  score: string;
}) {
  return (
    <article style={criterionCardStyle}>
      <div style={criterionTopStyle}>
        <h3 style={criterionTitleStyle}>
          {title}
        </h3>

        <span style={scoreBadgeStyle}>
          {score}
        </span>
      </div>

      <p style={criterionTextStyle}>
        {purpose}
      </p>
    </article>
  );
}

function BandItem({
  title,
  text,
}: {
  title: string;
  text: string;
}) {
  return (
    <div style={bandItemStyle}>
      <div style={bandItemTitleStyle}>
        {title}
      </div>

      <div style={bandItemTextStyle}>
        {text}
      </div>
    </div>
  );
}

type MatrixTone =
  | "a"
  | "b"
  | "c"
  | "review"
  | "strategic"
  | "monitor";

function MatrixRow({
  risk,
  values,
}: {
  risk: string;

  values: {
    label: string;
    tone: MatrixTone;
  }[];
}) {
  return (
    <tr>
      <th style={riskHeaderStyle}>
        {risk}
      </th>

      {values.map(
        (
          value,
          index
        ) => (
          <td
            key={
              `${risk}-${index}`
            }
            style={matrixCellStyle}
          >
            <span
              style={{
                ...matrixBadgeStyle,
                ...getMatrixToneStyle(
                  value.tone
                ),
              }}
            >
              {value.label}
            </span>
          </td>
        )
      )}
    </tr>
  );
}

function getMatrixToneStyle(
  tone: MatrixTone
): CSSProperties {
  if (tone === "a") {
    return {
      background:
        "#e21b23",
      color:
        "#ffffff",
    };
  }

  if (tone === "b") {
    return {
      background:
        "#f3b7ba",
      color:
        "#6f171c",
    };
  }

  if (tone === "c") {
    return {
      background:
        "#f5d9ca",
      color:
        "#754025",
    };
  }

  if (tone === "review") {
    return {
      background:
        "#ece3f2",
      color:
        "#60417b",
    };
  }

  if (tone === "strategic") {
    return {
      background:
        "#dce8ea",
      color:
        "#355c65",
    };
  }

  return {
    background:
      "#efedeb",
    color:
      "#555555",
  };
}

function OutcomeCard({
  title,
  count,
  text,
}: {
  title: string;
  count: number;
  text: string;
}) {
  return (
    <article style={outcomeCardStyle}>
      <div style={outcomeTopStyle}>
        <div style={outcomeTitleStyle}>
          {title}
        </div>

        <div style={outcomeCountStyle}>
          {formatNumber(
            count
          )}
        </div>
      </div>

      <p style={outcomeTextStyle}>
        {text}
      </p>
    </article>
  );
}

function PlanningStat({
  value,
  title,
  text,
}: {
  value: number;
  title: string;
  text: string;
}) {
  return (
    <article style={planningStatStyle}>
      <div style={planningValueStyle}>
        {formatNumber(
          value
        )}
      </div>

      <div style={planningStatTitleStyle}>
        {title}
      </div>

      <div style={planningStatTextStyle}>
        {text}
      </div>
    </article>
  );
}

function ProtectionStat({
  value,
  title,
  text,
}: {
  value: number;
  title: string;
  text: string;
}) {
  return (
    <article style={protectionStatStyle}>
      <div style={protectionValueStyle}>
        {formatNumber(
          value
        )}
      </div>

      <div style={protectionTitleStyle}>
        {title}
      </div>

      <div style={protectionTextStyle}>
        {text}
      </div>
    </article>
  );
}

function BreakdownItem({
  value,
  title,
  text,
}: {
  value: number;
  title: string;
  text: string;
}) {
  return (
    <div style={breakdownItemStyle}>
      <div style={breakdownValueStyle}>
        {formatNumber(
          value
        )}
      </div>

      <div>
        <div style={breakdownTitleStyle}>
          {title}
        </div>

        <div style={breakdownTextStyle}>
          {text}
        </div>
      </div>
    </div>
  );
}

function EvidenceCard({
  title,
  text,
}: {
  title: string;
  text: string;
}) {
  return (
    <article style={evidenceCardStyle}>
      <div style={evidenceAccentStyle} />

      <h3 style={evidenceTitleStyle}>
        {title}
      </h3>

      <p style={evidenceTextStyle}>
        {text}
      </p>
    </article>
  );
}

function InterpretationCard({
  title,
  text,
}: {
  title: string;
  text: string;
}) {
  return (
    <div style={interpretationCardStyle}>
      <div style={interpretationCardTitleStyle}>
        {title}
      </div>

      <div style={interpretationCardTextStyle}>
        {text}
      </div>
    </div>
  );
}

function formatNumber(
  value: number
) {
  return Number(
    value
  ).toLocaleString(
    "en-GB"
  );
}

const pageStyle: CSSProperties = {
  maxWidth: "1440px",
  margin: "0 auto",
  padding: "34px 28px 80px",
};

const loadingCardStyle: CSSProperties = {
  marginTop: "30px",
  padding: "30px",
  background: "#ffffff",
  border: "1px solid #e2ded9",
  borderRadius: "16px",
};

const loadingTitleStyle: CSSProperties = {
  fontSize: "18px",
  fontWeight: 850,
};

const loadingTextStyle: CSSProperties = {
  marginTop: "6px",
  color: "#737373",
  fontSize: "12px",
};

const errorStyle: CSSProperties = {
  marginTop: "30px",
  padding: "22px",
  background: "#fff0f0",
  border: "1px solid #efb9bd",
  borderRadius: "14px",
  color: "#7b2026",
};

const heroStyle: CSSProperties = {
  background: "#171717",
  color: "#ffffff",
  borderRadius: "24px",
  padding: "46px 52px",
  marginBottom: "44px",
};

const heroEyebrowStyle: CSSProperties = {
  color: "#ef555b",
  fontSize: "10px",
  fontWeight: 900,
  letterSpacing: "0.1em",
  textTransform: "uppercase",
};

const heroTitleStyle: CSSProperties = {
  maxWidth: "1050px",
  margin: "11px 0 17px",
  fontSize:
    "clamp(38px, 5vw, 62px)",
  lineHeight: 1.02,
  fontWeight: 900,
  letterSpacing: "-0.05em",
};

const heroTextStyle: CSSProperties = {
  maxWidth: "850px",
  margin: 0,
  color: "#c6c6c6",
  fontSize: "15px",
  lineHeight: 1.65,
};

const heroMetaStyle: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  gap: "9px",
  marginTop: "24px",
  fontSize: "11px",
  fontWeight: 800,
};

const metaDotStyle: CSSProperties = {
  color: "#6c6c6c",
};

const sectionStyle: CSSProperties = {
  marginBottom: "48px",
};

const sectionHeadingStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(300px, 1fr))",
  gap: "30px",
  alignItems: "end",
  marginBottom: "21px",
};

const eyebrowStyle: CSSProperties = {
  color: "#e21b23",
  fontSize: "10px",
  fontWeight: 900,
  letterSpacing: "0.09em",
  textTransform: "uppercase",
};

const sectionTitleStyle: CSSProperties = {
  margin: "6px 0 0",
  fontSize: "30px",
  lineHeight: 1.15,
  fontWeight: 850,
  letterSpacing: "-0.035em",
};

const sectionDescriptionStyle: CSSProperties = {
  maxWidth: "700px",
  margin: 0,
  color: "#666666",
  fontSize: "12px",
  lineHeight: 1.65,
};

const summaryGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(220px, 1fr))",
  gap: "14px",
};

const summaryCardStyle: CSSProperties = {
  overflow: "hidden",
  background: "#ffffff",
  border: "1px solid #e2ded9",
  borderRadius: "16px",
};

const summaryAccentStyle: CSSProperties = {
  height: "5px",
};

const summaryBodyStyle: CSSProperties = {
  padding: "21px",
};

const summaryValueStyle: CSSProperties = {
  fontSize: "38px",
  fontWeight: 900,
  letterSpacing: "-0.05em",
};

const summaryTitleStyle: CSSProperties = {
  marginTop: "5px",
  fontSize: "12px",
  fontWeight: 850,
};

const summaryTextStyle: CSSProperties = {
  marginTop: "7px",
  color: "#6b6b6b",
  fontSize: "10px",
  lineHeight: 1.55,
};

const twoColumnGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(340px, 1fr))",
  gap: "14px",
};

const infoPanelStyle: CSSProperties = {
  background: "#ffffff",
  border: "1px solid #e2ded9",
  borderRadius: "16px",
  padding: "22px",
};

const infoPanelTitleStyle: CSSProperties = {
  margin: 0,
  fontSize: "18px",
  letterSpacing: "-0.02em",
};

const infoPanelTextStyle: CSSProperties = {
  margin: "8px 0 0",
  color: "#666666",
  fontSize: "11px",
  lineHeight: 1.6,
};

const miniPointsStyle: CSSProperties = {
  display: "grid",
  gap: "9px",
  marginTop: "17px",
};

const miniPointStyle: CSSProperties = {
  display: "flex",
  gap: "9px",
  alignItems: "flex-start",
  color: "#333333",
  fontSize: "10px",
  lineHeight: 1.5,
};

const miniDotStyle: CSSProperties = {
  width: "6px",
  height: "6px",
  borderRadius: "50%",
  background: "#e21b23",
  marginTop: "5px",
  flexShrink: 0,
};

const scopeLinkWrapStyle: CSSProperties = {
  marginTop: "15px",
};

const inlineLinkStyle: CSSProperties = {
  color: "#171717",
  textDecoration: "none",
  fontSize: "10px",
  fontWeight: 850,
};

const darkSectionStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns:
    "minmax(280px, 0.9fr) minmax(540px, 1.7fr)",
  gap: "32px",
  padding: "30px",
  marginBottom: "48px",
  background: "#171717",
  color: "#ffffff",
  borderRadius: "20px",
};

const darkIntroStyle: CSSProperties = {
  alignSelf: "center",
};

const darkEyebrowStyle: CSSProperties = {
  color: "#ef555b",
  fontSize: "9px",
  fontWeight: 900,
  textTransform: "uppercase",
  letterSpacing: "0.08em",
};

const darkTitleStyle: CSSProperties = {
  margin: "7px 0 10px",
  fontSize: "27px",
  lineHeight: 1.16,
  letterSpacing: "-0.035em",
};

const darkLeadStyle: CSSProperties = {
  margin: 0,
  color: "#bdbdbd",
  fontSize: "10px",
  lineHeight: 1.6,
};

const approachStepsStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns:
    "repeat(2, minmax(0, 1fr))",
  gap: "11px",
};

const approachStepStyle: CSSProperties = {
  padding: "15px",
  background: "#262626",
  borderRadius: "11px",
};

const approachNumberStyle: CSSProperties = {
  color: "#ef555b",
  fontSize: "9px",
  fontWeight: 900,
};

const approachTitleStyle: CSSProperties = {
  marginTop: "7px",
  fontSize: "10px",
  fontWeight: 850,
};

const approachTextStyle: CSSProperties = {
  marginTop: "5px",
  color: "#bdbdbd",
  fontSize: "9px",
  lineHeight: 1.5,
};

const criteriaGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(250px, 1fr))",
  gap: "14px",
};

const criterionCardStyle: CSSProperties = {
  background: "#ffffff",
  border: "1px solid #e2ded9",
  borderRadius: "15px",
  padding: "19px",
};

const criterionTopStyle: CSSProperties = {
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "space-between",
  gap: "12px",
};

const criterionTitleStyle: CSSProperties = {
  margin: 0,
  fontSize: "14px",
  letterSpacing: "-0.02em",
};

const scoreBadgeStyle: CSSProperties = {
  flexShrink: 0,
  padding: "4px 7px",
  borderRadius: "999px",
  background: "#f1eeeb",
  color: "#555555",
  fontSize: "8px",
  fontWeight: 850,
};

const criterionTextStyle: CSSProperties = {
  margin: "8px 0 0",
  color: "#666666",
  fontSize: "10px",
  lineHeight: 1.55,
};

const bandPanelStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns:
    "minmax(220px, 0.7fr) minmax(500px, 1.7fr)",
  gap: "24px",
  marginTop: "15px",
  padding: "20px",
  background: "#f2efeb",
  borderRadius: "14px",
};

const bandEyebrowStyle: CSSProperties = {
  color: "#e21b23",
  fontSize: "8px",
  fontWeight: 900,
  textTransform: "uppercase",
};

const bandTitleStyle: CSSProperties = {
  margin: "5px 0 0",
  fontSize: "18px",
  lineHeight: 1.2,
};

const bandItemsStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns:
    "repeat(2, minmax(0, 1fr))",
  gap: "9px",
};

const bandItemStyle: CSSProperties = {
  background: "#ffffff",
  borderRadius: "9px",
  padding: "11px",
};

const bandItemTitleStyle: CSSProperties = {
  fontSize: "9px",
  fontWeight: 850,
};

const bandItemTextStyle: CSSProperties = {
  marginTop: "3px",
  color: "#727272",
  fontSize: "8px",
  lineHeight: 1.4,
};

const matrixWrapStyle: CSSProperties = {
  overflowX: "auto",
  background: "#ffffff",
  border: "1px solid #e2ded9",
  borderRadius: "16px",
};

const matrixTableStyle: CSSProperties = {
  width: "100%",
  minWidth: "820px",
  borderCollapse: "collapse",
};

const cornerHeaderStyle: CSSProperties = {
  padding: "15px",
  textAlign: "left",
  background: "#f4f1ed",
  borderBottom: "1px solid #e2ded9",
  borderRight: "1px solid #e2ded9",
  fontSize: "9px",
  fontWeight: 850,
};

const matrixHeaderStyle: CSSProperties = {
  padding: "15px",
  background: "#f4f1ed",
  borderBottom: "1px solid #e2ded9",
  fontSize: "9px",
  fontWeight: 850,
  textAlign: "center",
};

const riskHeaderStyle: CSSProperties = {
  width: "180px",
  padding: "15px",
  textAlign: "left",
  borderRight: "1px solid #eeeae6",
  borderBottom: "1px solid #eeeae6",
  fontSize: "9px",
  fontWeight: 850,
};

const matrixCellStyle: CSSProperties = {
  padding: "13px",
  textAlign: "center",
  borderBottom: "1px solid #eeeae6",
};

const matrixBadgeStyle: CSSProperties = {
  display: "inline-block",
  minWidth: "105px",
  padding: "7px 9px",
  borderRadius: "999px",
  fontSize: "8px",
  fontWeight: 850,
};

const outcomeGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(220px, 1fr))",
  gap: "12px",
  marginTop: "15px",
};

const outcomeCardStyle: CSSProperties = {
  background: "#ffffff",
  border: "1px solid #e2ded9",
  borderRadius: "13px",
  padding: "16px",
};

const outcomeTopStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: "10px",
};

const outcomeTitleStyle: CSSProperties = {
  fontSize: "10px",
  fontWeight: 850,
};

const outcomeCountStyle: CSSProperties = {
  fontSize: "18px",
  fontWeight: 900,
};

const outcomeTextStyle: CSSProperties = {
  margin: "8px 0 0",
  color: "#696969",
  fontSize: "9px",
  lineHeight: 1.5,
};

const planningSectionStyle: CSSProperties = {
  marginBottom: "48px",
  padding: "28px",
  background: "#ffffff",
  border: "1px solid #e2ded9",
  borderRadius: "18px",
};

const planningIntroStyle: CSSProperties = {
  maxWidth: "780px",
};

const planningHeadingStyle: CSSProperties = {
  margin: "7px 0 10px",
  fontSize: "29px",
  lineHeight: 1.17,
  letterSpacing: "-0.035em",
};

const planningLeadStyle: CSSProperties = {
  margin: 0,
  color: "#666666",
  fontSize: "11px",
  lineHeight: 1.6,
};

const planningFlowStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns:
    "1fr auto 1fr auto 1fr",
  gap: "10px",
  alignItems: "center",
  marginTop: "22px",
};

const planningStatStyle: CSSProperties = {
  padding: "18px",
  background: "#f7f4f0",
  borderRadius: "12px",
};

const planningValueStyle: CSSProperties = {
  fontSize: "34px",
  fontWeight: 900,
  letterSpacing: "-0.04em",
};

const planningStatTitleStyle: CSSProperties = {
  marginTop: "5px",
  fontSize: "10px",
  fontWeight: 850,
};

const planningStatTextStyle: CSSProperties = {
  marginTop: "5px",
  color: "#6d6d6d",
  fontSize: "9px",
  lineHeight: 1.5,
};

const arrowStyle: CSSProperties = {
  color: "#999999",
  fontSize: "22px",
  fontWeight: 900,
};

const plusStyle: CSSProperties = {
  color: "#999999",
  fontSize: "18px",
  fontWeight: 900,
};

const planningNoteStyle: CSSProperties = {
  marginTop: "15px",
  padding: "13px",
  background: "#fff8e3",
  border: "1px solid #eadfb7",
  borderRadius: "10px",
  color: "#62581e",
  fontSize: "9px",
  lineHeight: 1.55,
};

const protectionGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns:
    "repeat(3, minmax(0, 1fr))",
  gap: "14px",
};

const protectionStatStyle: CSSProperties = {
  padding: "20px",
  background: "#ffffff",
  border: "1px solid #e2ded9",
  borderRadius: "14px",
};

const protectionValueStyle: CSSProperties = {
  fontSize: "36px",
  fontWeight: 900,
};

const protectionTitleStyle: CSSProperties = {
  marginTop: "4px",
  fontSize: "11px",
  fontWeight: 850,
};

const protectionTextStyle: CSSProperties = {
  marginTop: "5px",
  color: "#6b6b6b",
  fontSize: "9px",
  lineHeight: 1.5,
};

const protectionBreakdownStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns:
    "repeat(3, minmax(0, 1fr))",
  gap: "10px",
  marginTop: "12px",
};

const breakdownItemStyle: CSSProperties = {
  display: "flex",
  gap: "10px",
  alignItems: "center",
  padding: "13px",
  background: "#f2efeb",
  borderRadius: "10px",
};

const breakdownValueStyle: CSSProperties = {
  fontSize: "23px",
  fontWeight: 900,
};

const breakdownTitleStyle: CSSProperties = {
  fontSize: "9px",
  fontWeight: 850,
};

const breakdownTextStyle: CSSProperties = {
  marginTop: "3px",
  color: "#707070",
  fontSize: "8px",
  lineHeight: 1.4,
};

const evidenceGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(240px, 1fr))",
  gap: "13px",
};

const evidenceCardStyle: CSSProperties = {
  position: "relative",
  overflow: "hidden",
  background: "#ffffff",
  border: "1px solid #e2ded9",
  borderRadius: "14px",
  padding: "18px",
};

const evidenceAccentStyle: CSSProperties = {
  position: "absolute",
  top: 0,
  left: 0,
  bottom: 0,
  width: "4px",
  background: "#e21b23",
};

const evidenceTitleStyle: CSSProperties = {
  margin: 0,
  fontSize: "12px",
};

const evidenceTextStyle: CSSProperties = {
  margin: "7px 0 0",
  color: "#6b6b6b",
  fontSize: "9px",
  lineHeight: 1.55,
};

const interpretationSectionStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns:
    "minmax(280px, 0.8fr) minmax(540px, 1.7fr)",
  gap: "30px",
  padding: "29px",
  marginBottom: "42px",
  background: "#171717",
  color: "#ffffff",
  borderRadius: "20px",
};

const interpretationEyebrowStyle: CSSProperties = {
  color: "#ef555b",
  fontSize: "9px",
  fontWeight: 900,
  textTransform: "uppercase",
  letterSpacing: "0.08em",
};

const interpretationTitleStyle: CSSProperties = {
  margin: "7px 0 0",
  fontSize: "25px",
  lineHeight: 1.2,
  letterSpacing: "-0.035em",
};

const interpretationGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns:
    "repeat(2, minmax(0, 1fr))",
  gap: "11px",
};

const interpretationCardStyle: CSSProperties = {
  padding: "13px",
  background: "#262626",
  borderRadius: "10px",
};

const interpretationCardTitleStyle: CSSProperties = {
  fontSize: "9px",
  fontWeight: 850,
};

const interpretationCardTextStyle: CSSProperties = {
  marginTop: "5px",
  color: "#bdbdbd",
  fontSize: "9px",
  lineHeight: 1.5,
};

const ctaStyle: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "28px",
  padding: "29px",
  background: "#e21b23",
  color: "#ffffff",
  borderRadius: "20px",
};

const ctaEyebrowStyle: CSSProperties = {
  fontSize: "9px",
  fontWeight: 850,
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  opacity: 0.82,
};

const ctaTitleStyle: CSSProperties = {
  margin: "6px 0 8px",
  fontSize: "27px",
  letterSpacing: "-0.035em",
};

const ctaTextStyle: CSSProperties = {
  maxWidth: "700px",
  margin: 0,
  color: "#ffd8da",
  fontSize: "10px",
  lineHeight: 1.6,
};

const ctaButtonsStyle: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: "9px",
};

const primaryButtonStyle: CSSProperties = {
  padding: "13px 18px",
  background: "#ffffff",
  color: "#171717",
  textDecoration: "none",
  borderRadius: "9px",
  fontSize: "10px",
  fontWeight: 850,
};

const secondaryButtonStyle: CSSProperties = {
  padding: "13px 18px",
  background: "transparent",
  color: "#ffffff",
  border: "1px solid #f48589",
  textDecoration: "none",
  borderRadius: "9px",
  fontSize: "10px",
  fontWeight: 850,
};
