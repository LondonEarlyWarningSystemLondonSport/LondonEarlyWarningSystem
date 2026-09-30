"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import type {
  CSSProperties,
} from "react";

import Link from "next/link";

import { useParams } from "next/navigation";

import AppShell from "../../../components/AppShell";

type TabKey =
  | "summary"
  | "risk"
  | "strategic"
  | "facilities"
  | "evidence";

type SiteDetail = {
  site_id: string | number | null;
  site_name: string | null;
  postcode: string | null;
  borough: string | null;

  latitude: number | null;
  longitude: number | null;

  playing_field_status: string | null;

  priority_category: string | null;
  priority_sort_order: number | null;

  strategic_value_score: number | null;
  strategic_value_band: string | null;

  risk_exposure_score: number | null;
  risk_band: string | null;
  risk_band_sort_order: number | null;

  sv1_multi_pitch_scale_score: number | null;
  sv2_full_size_3g_score: number | null;
  sv3_strategic_sport_score: number | null;
  sv4_share_of_borough_provision_score: number | null;
  sv5_inner_london_score: number | null;
  sv6_deprivation_score: number | null;

  adult_football_rugby_pitch_units: number | null;
  rugby_pitch_units: number | null;
  cricket_pitch_units: number | null;
  other_strategic_grass_pitch_units: number | null;
  full_size_3g_pitch_units: number | null;
  hockey_agp_pitch_units: number | null;

  owner_type: string | null;
  management_type: string | null;

  rf1_ownership_exposure_score: number | null;
  rf2_management_exposure_score: number | null;
  rf3_pps_at_risk_score: number | null;
  rf6_planning_pressure_score: number | null;

  pps_critical_site_flag: string | null;
  pps_community_use_flag: string | null;
  pps_security_of_tenure: string | null;
  pps_ownership_type: string | null;
  pps_management_type: string | null;

  planning_candidate_application_count: number | null;
  confirmed_rf6_application_count: number | null;
  nearest_planning_candidate_distance_metres: number | null;

  rf6_scoring_status: string | null;
  rf6_scoring_note: string | null;

  review_reason: string | null;

  possible_3g_data_quality_flag: string | null;

  sv4_single_recorded_provision_flag: string | null;
  sv4_review_note: string | null;

  missing_imd_flag: string | null;
  missing_owner_flag: string | null;
  missing_management_flag: string | null;

  phase1_3_scope_tag: string | null;
  phase1_3_source_note: string | null;
  phase1_3_methodology_note: string | null;
};

type SiteApiResponse =
  | SiteDetail
  | {
      success?: boolean;
      site?: SiteDetail;
      data?: SiteDetail;
      error?: string;
    };

export default function SiteDetailPage() {
  const params =
    useParams();

  const siteId =
    Array.isArray(
      params?.site_id
    )
      ? params.site_id[0]
      : String(
          params?.site_id ||
            ""
        );

  const [
    site,
    setSite,
  ] =
    useState<SiteDetail | null>(
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

  const [
    activeTab,
    setActiveTab,
  ] =
    useState<TabKey>(
      "summary"
    );

  useEffect(() => {
    let cancelled = false;

    async function loadSite() {
      try {
        setLoading(true);
        setError(null);

        const response =
          await fetch(
            `/api/sites/${encodeURIComponent(
              siteId
            )}`,
            {
              cache:
                "no-store",
            }
          );

        const raw:
          SiteApiResponse =
          await response.json();

        if (!response.ok) {
          throw new Error(
            (
              raw as {
                error?: string;
              }
            )?.error ||
              "Unable to load site."
          );
        }

        const result =
          normaliseSiteResponse(
            raw
          );

        if (!result) {
          throw new Error(
            "No site record was returned."
          );
        }

        if (!cancelled) {
          setSite(result);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load site."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    if (siteId) {
      loadSite();
    }

    return () => {
      cancelled = true;
    };
  }, [siteId]);

  const qualityIssues =
    useMemo(() => {
      if (!site) {
        return [];
      }

      const issues: {
        title: string;
        text: string;
      }[] = [];

      if (
        isYes(
          site.missing_owner_flag
        )
      ) {
        issues.push({
          title:
            "Ownership data missing",
          text:
            "Current ownership information is not available for this site.",
        });
      }

      if (
        isYes(
          site.missing_management_flag
        )
      ) {
        issues.push({
          title:
            "Management data missing",
          text:
            "Current management information is not available for this site.",
        });
      }

      if (
        isYes(
          site.missing_imd_flag
        )
      ) {
        issues.push({
          title:
            "Deprivation evidence missing",
          text:
            "The deprivation element of Strategic Value could not be populated from the available evidence.",
        });
      }

      if (
        isYes(
          site.possible_3g_data_quality_flag
        )
      ) {
        issues.push({
          title:
            "3G evidence requires review",
          text:
            "The recorded 3G provision may require further data-quality checking.",
        });
      }

      if (
        isYes(
          site.sv4_single_recorded_provision_flag
        )
      ) {
        issues.push({
          title:
            "Borough provision evidence requires review",
          text:
            site.sv4_review_note ||
            "The borough provision evidence should be interpreted with care.",
        });
      }

      if (
        site.review_reason
      ) {
        issues.push({
          title:
            "Manual review flag",
          text:
            site.review_reason,
        });
      }

      return issues;
    }, [site]);

  if (loading) {
    return (
      <AppShell>
        <main style={pageStyle}>
          <div style={loadingCardStyle}>
            <div style={loadingTitleStyle}>
              Loading site
              assessment
            </div>

            <div style={loadingTextStyle}>
              Retrieving the latest
              site-level evidence.
            </div>
          </div>
        </main>
      </AppShell>
    );
  }

  if (
    error ||
    !site
  ) {
    return (
      <AppShell>
        <main style={pageStyle}>
          <div style={errorStyle}>
            <strong>
              Site assessment could
              not be loaded.
            </strong>

            <div
              style={{
                marginTop:
                  "8px",
              }}
            >
              {error ||
                "Site unavailable."}
            </div>

            <div
              style={{
                marginTop:
                  "16px",
              }}
            >
              <Link
                href="/sites"
                style={backLinkStyle}
              >
                ← Back to Explore
                Sites
              </Link>
            </div>
          </div>
        </main>
      </AppShell>
    );
  }

  const planningState =
    getPlanningState(
      site
    );

  return (
    <AppShell>
      <main style={pageStyle}>
        <div style={topLinksStyle}>
          <Link
            href="/sites"
            style={backLinkStyle}
          >
            ← Explore Sites
          </Link>

          <Link
            href="/about#assessment"
            style={methodLinkStyle}
          >
            How this assessment
            works →
          </Link>
        </div>

        <section style={heroStyle}>
          <div style={heroTopStyle}>
            <div>
              <div style={heroEyebrowStyle}>
                {
                  site.borough ||
                  "London"
                }
              </div>

              <h1 style={heroTitleStyle}>
                {site.site_name ||
                  "Unnamed site"}
              </h1>

              <div style={heroLocationStyle}>
                {[
                  site.postcode,
                  site.playing_field_status,
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </div>
            </div>

            <div style={priorityPanelStyle}>
              <div style={priorityLabelStyle}>
                Current outcome
              </div>

              <div style={priorityValueStyle}>
                {site.priority_category ||
                  "Not assigned"}
              </div>
            </div>
          </div>

          <div style={heroMetricsStyle}>
            <HeroMetric
              label="Risk Exposure"
              value={
                site.risk_band ||
                "Not recorded"
              }
              supporting={
                site.risk_exposure_score !==
                null
                  ? `Score ${site.risk_exposure_score}`
                  : undefined
              }
            />

            <HeroMetric
              label="Strategic Value"
              value={
                site.strategic_value_band ||
                "Not recorded"
              }
              supporting={
                site.strategic_value_score !==
                null
                  ? `Score ${site.strategic_value_score}`
                  : undefined
              }
            />

            <HeroMetric
              label="Planning evidence"
              value={
                planningState.shortLabel
              }
              supporting={
                planningState.supporting
              }
            />

            <HeroMetric
              label="Review status"
              value={
                qualityIssues.length >
                0
                  ? "Review flagged"
                  : "No additional review flag"
              }
              supporting={
                qualityIssues.length >
                0
                  ? `${qualityIssues.length} ${
                      qualityIssues.length ===
                      1
                        ? "item"
                        : "items"
                    }`
                  : undefined
              }
            />
          </div>
        </section>

        <div style={tabsWrapStyle}>
          <TabButton
            active={
              activeTab ===
              "summary"
            }
            onClick={() =>
              setActiveTab(
                "summary"
              )
            }
          >
            Summary
          </TabButton>

          <TabButton
            active={
              activeTab ===
              "risk"
            }
            onClick={() =>
              setActiveTab("risk")
            }
          >
            Risk & Planning
          </TabButton>

          <TabButton
            active={
              activeTab ===
              "strategic"
            }
            onClick={() =>
              setActiveTab(
                "strategic"
              )
            }
          >
            Strategic Value
          </TabButton>

          <TabButton
            active={
              activeTab ===
              "facilities"
            }
            onClick={() =>
              setActiveTab(
                "facilities"
              )
            }
          >
            Facilities
          </TabButton>

          <TabButton
            active={
              activeTab ===
              "evidence"
            }
            onClick={() =>
              setActiveTab(
                "evidence"
              )
            }
          >
            Evidence & Quality
          </TabButton>
        </div>

        {activeTab ===
          "summary" && (
          <SummaryTab
            site={site}
            planningState={
              planningState
            }
            qualityIssues={
              qualityIssues
            }
            onGoToRisk={() =>
              setActiveTab("risk")
            }
            onGoToStrategic={() =>
              setActiveTab(
                "strategic"
              )
            }
          />
        )}

        {activeTab ===
          "risk" && (
          <RiskTab
            site={site}
            planningState={
              planningState
            }
          />
        )}

        {activeTab ===
          "strategic" && (
          <StrategicTab
            site={site}
          />
        )}

        {activeTab ===
          "facilities" && (
          <FacilitiesTab
            site={site}
          />
        )}

        {activeTab ===
          "evidence" && (
          <EvidenceTab
            site={site}
            qualityIssues={
              qualityIssues
            }
          />
        )}
      </main>
    </AppShell>
  );
}

function SummaryTab({
  site,
  planningState,
  qualityIssues,
  onGoToRisk,
  onGoToStrategic,
}: {
  site: SiteDetail;
  planningState: PlanningState;
  qualityIssues: {
    title: string;
    text: string;
  }[];
  onGoToRisk: () => void;
  onGoToStrategic: () => void;
}) {
  return (
    <>
      <section style={sectionStyle}>
        <SectionHeading
          eyebrow="Current assessment"
          title="Why this site has its current outcome"
          description="The outcome reflects the combination of Risk Exposure and Strategic Value. These dimensions are assessed separately before being combined through the risk-led priority matrix."
        />

        <div style={summaryAssessmentGridStyle}>
          <button
            type="button"
            onClick={onGoToRisk}
            style={dimensionCardButtonStyle}
          >
            <div style={dimensionEyebrowStyle}>
              Risk Exposure
            </div>

            <div style={dimensionValueStyle}>
              {site.risk_band ||
                "Not recorded"}
            </div>

            <div style={dimensionScoreStyle}>
              {site.risk_exposure_score !==
              null
                ? `Score ${site.risk_exposure_score}`
                : "Score unavailable"}
            </div>

            <p style={dimensionTextStyle}>
              Based on ownership,
              management, known
              at-risk evidence and
              planning pressure.
            </p>

            <div style={dimensionLinkStyle}>
              View Risk & Planning
              →
            </div>
          </button>

          <div style={combineSymbolStyle}>
            +
          </div>

          <button
            type="button"
            onClick={
              onGoToStrategic
            }
            style={dimensionCardButtonStyle}
          >
            <div style={dimensionEyebrowStyle}>
              Strategic Value
            </div>

            <div style={dimensionValueStyle}>
              {site.strategic_value_band ||
                "Not recorded"}
            </div>

            <div style={dimensionScoreStyle}>
              {site.strategic_value_score !==
              null
                ? `Score ${site.strategic_value_score}`
                : "Score unavailable"}
            </div>

            <p style={dimensionTextStyle}>
              Based on scale,
              strategic provision,
              borough significance,
              Inner London and
              deprivation evidence.
            </p>

            <div style={dimensionLinkStyle}>
              View Strategic Value
              →
            </div>
          </button>

          <div style={combineSymbolStyle}>
            =
          </div>

          <div style={outcomeCardStyle}>
            <div style={outcomeEyebrowStyle}>
              Outcome
            </div>

            <div style={outcomeValueStyle}>
              {site.priority_category ||
                "Not assigned"}
            </div>

            <p style={outcomeDescriptionStyle}>
              {getOutcomeDescription(
                site.priority_category
              )}
            </p>
          </div>
        </div>
      </section>

      <section style={sectionStyle}>
        <SectionHeading
          eyebrow="Current evidence"
          title="Key evidence for this site"
          description="This summary highlights the information most relevant to interpreting the current assessment."
        />

        <div style={summaryInfoGridStyle}>
          <InfoCard
            title="Playing-field status"
            value={
              site.playing_field_status ||
              "Not recorded"
            }
            text="Current status in the assessed playing-field evidence."
          />

          <InfoCard
            title="Ownership"
            value={
              site.owner_type ||
              "Not recorded"
            }
            text="Current ownership evidence used in the Risk Exposure assessment."
          />

          <InfoCard
            title="Management"
            value={
              site.management_type ||
              "Not recorded"
            }
            text="Current management evidence used in the Risk Exposure assessment."
          />

          <InfoCard
            title="Planning evidence"
            value={
              planningState.shortLabel
            }
            text={
              planningState.description
            }
          />
        </div>
      </section>

      {qualityIssues.length >
        0 && (
        <section style={sectionStyle}>
          <SectionHeading
            eyebrow="Review"
            title="Evidence requiring attention"
            description="Review flags do not automatically change the site's outcome. They identify evidence that should be interpreted or checked with additional care."
          />

          <div style={issueGridStyle}>
            {qualityIssues.map(
              (
                issue
              ) => (
                <IssueCard
                  key={
                    `${issue.title}-${issue.text}`
                  }
                  title={
                    issue.title
                  }
                  text={
                    issue.text
                  }
                />
              )
            )}
          </div>
        </section>
      )}

      <MethodologyCallout />
    </>
  );
}

function RiskTab({
  site,
  planningState,
}: {
  site: SiteDetail;
  planningState: PlanningState;
}) {
  return (
    <>
      <section style={sectionStyle}>
        <SectionHeading
          eyebrow="Risk Exposure"
          title="How exposed is this site to loss, decline, reduced access or change?"
          description="Risk indicators are early-warning evidence. A risk score or band should not be interpreted as confirmation that the site will be lost, closed or developed."
        />

        <div style={bandSummaryStyle}>
          <div>
            <div style={bandSummaryLabelStyle}>
              Current Risk Exposure
            </div>

            <div style={bandSummaryValueStyle}>
              {site.risk_band ||
                "Not recorded"}
            </div>
          </div>

          <div>
            <div style={bandSummaryLabelStyle}>
              Risk score
            </div>

            <div style={bandSummaryNumberStyle}>
              {site.risk_exposure_score ??
                "—"}
            </div>
          </div>
        </div>

        <div style={criteriaGridStyle}>
          <AssessmentCriterion
            title="Ownership exposure"
            score={
              site.rf1_ownership_exposure_score
            }
            maxScore={2}
            evidence={
              site.owner_type ||
              "Ownership not recorded"
            }
            description="Assesses whether the current ownership arrangement creates greater exposure to loss, reduced access or change."
          />

          <AssessmentCriterion
            title="Management exposure"
            score={
              site.rf2_management_exposure_score
            }
            maxScore={2}
            evidence={
              site.management_type ||
              "Management not recorded"
            }
            description="Assesses whether the current management arrangement creates greater exposure to loss or reduced access."
          />

          <AssessmentCriterion
            title="Known at-risk evidence"
            score={
              site.rf3_pps_at_risk_score
            }
            maxScore={5}
            evidence={
              getKnownRiskEvidence(
                site
              )
            }
            description="Recognises existing protection intelligence where a credible concern has already been recorded."
          />

          <AssessmentCriterion
            title="Planning pressure"
            score={
              site.rf6_planning_pressure_score
            }
            maxScore={3}
            evidence={
              planningState.shortLabel
            }
            description="Uses sufficiently strong site-linked planning evidence as an early-warning signal while keeping weaker evidence separate for review."
          />
        </div>
      </section>

      <section style={sectionStyle}>
        <SectionHeading
          eyebrow="Planning evidence"
          title="How planning evidence is being treated for this site"
          description="Nearby development activity does not automatically create a planning risk signal. The evidence must meet the governed Planning Pressure rules before it can contribute directly to Risk Exposure."
        />

        <div
          style={{
            ...planningPanelStyle,
            borderColor:
              planningState.border,
            background:
              planningState.background,
          }}
        >
          <div style={planningStatusTopStyle}>
            <div>
              <div style={planningLabelStyle}>
                Current status
              </div>

              <div style={planningStatusTitleStyle}>
                {planningState.label}
              </div>
            </div>

            <span
              style={{
                ...planningBadgeStyle,
                color:
                  planningState.text,
                background:
                  planningState.badge,
              }}
            >
              {
                planningState.shortLabel
              }
            </span>
          </div>

          <p style={planningDescriptionStyle}>
            {
              planningState.description
            }
          </p>

          <div style={planningMetricsStyle}>
            <MetricBox
              label="Planning evidence records identified"
              value={
                site.planning_candidate_application_count ??
                0
              }
            />

            <MetricBox
              label="Evidence records contributing"
              value={
                site.confirmed_rf6_application_count ??
                0
              }
            />

            <MetricBox
              label="Nearest identified evidence"
              value={
                formatDistance(
                  site.nearest_planning_candidate_distance_metres
                )
              }
            />
          </div>
        </div>
      </section>

      <section style={sectionStyle}>
        <SectionHeading
          eyebrow="PPS context"
          title="Additional protection evidence"
          description="Playing Pitch Strategy evidence provides supporting context where a site has been successfully linked."
        />

        <div style={summaryInfoGridStyle}>
          <InfoCard
            title="Known critical / at-risk evidence"
            value={
              site.pps_critical_site_flag ||
              "Not recorded"
            }
            text="Whether linked PPS evidence identifies a protection concern."
          />

          <InfoCard
            title="Community use"
            value={
              site.pps_community_use_flag ||
              "Not recorded"
            }
            text="Community-use status recorded in the linked PPS evidence."
          />

          <InfoCard
            title="Security of tenure"
            value={
              site.pps_security_of_tenure ||
              "Not recorded"
            }
            text="Security-of-tenure information recorded in the linked PPS evidence."
          />

          <InfoCard
            title="PPS ownership / management"
            value={
              [
                site.pps_ownership_type,
                site.pps_management_type,
              ]
                .filter(Boolean)
                .join(" / ") ||
              "Not recorded"
            }
            text="Ownership and management context from the linked PPS evidence."
          />
        </div>
      </section>

      <MethodologyCallout />
    </>
  );
}

function StrategicTab({
  site,
}: {
  site: SiteDetail;
}) {
  return (
    <>
      <section style={sectionStyle}>
        <SectionHeading
          eyebrow="Strategic Value"
          title="How important is this site to current or future sport and physical activity provision?"
          description="Strategic Value is assessed independently from Risk Exposure. A strategically important site can therefore remain in monitoring if there is no current risk signal."
        />

        <div style={bandSummaryStyle}>
          <div>
            <div style={bandSummaryLabelStyle}>
              Strategic Value band
            </div>

            <div style={bandSummaryValueStyle}>
              {site.strategic_value_band ||
                "Not recorded"}
            </div>
          </div>

          <div>
            <div style={bandSummaryLabelStyle}>
              Strategic Value score
            </div>

            <div style={bandSummaryNumberStyle}>
              {site.strategic_value_score ??
                "—"}
              <span style={scoreMaxStyle}>
                / 15
              </span>
            </div>
          </div>
        </div>

        <div style={criteriaGridStyle}>
          <AssessmentCriterion
            title="Multi-pitch scale"
            score={
              site.sv1_multi_pitch_scale_score
            }
            maxScore={3}
            evidence={getMultiPitchEvidence(
              site
            )}
            description="Recognises larger playing-field sites with multiple adult or senior football and rugby pitch units."
          />

          <AssessmentCriterion
            title="Full-size 3G provision"
            score={
              site.sv2_full_size_3g_score
            }
            maxScore={3}
            evidence={`${formatNumberValue(
              site.full_size_3g_pitch_units
            )} full-size 3G ${
              site.full_size_3g_pitch_units ===
              1
                ? "pitch"
                : "pitches"
            }`}
            description="Recognises sites providing one or more confirmed full-size third-generation artificial grass pitches."
          />

          <AssessmentCriterion
            title="Strategic sport provision"
            score={
              site.sv3_strategic_sport_score
            }
            maxScore={2}
            evidence={getStrategicSportEvidence(
              site
            )}
            description="Recognises strategic playing-field sports including rugby, cricket and hockey provision."
          />

          <AssessmentCriterion
            title="Share of borough provision"
            score={
              site.sv4_share_of_borough_provision_score
            }
            maxScore={3}
            evidence={
              site.sv4_single_recorded_provision_flag ===
              "Yes"
                ? "Borough provision evidence requires review"
                : "Borough-level provision comparison"
            }
            description="Recognises sites that account for a significant share of equivalent playing-field provision within their borough."
          />

          <AssessmentCriterion
            title="Inner London"
            score={
              site.sv5_inner_london_score
            }
            maxScore={2}
            evidence={
              site.sv5_inner_london_score ===
              2
                ? "Inner London weighting applied"
                : "Inner London weighting not applied"
            }
            description="Recognises the additional strategic significance of playing-field provision in Inner London."
          />

          <AssessmentCriterion
            title="Deprivation"
            score={
              site.sv6_deprivation_score
            }
            maxScore={2}
            evidence={
              isYes(
                site.missing_imd_flag
              )
                ? "Deprivation evidence unavailable"
                : "Index of Multiple Deprivation evidence applied"
            }
            description="Recognises provision serving areas with higher levels of deprivation using the Index of Multiple Deprivation."
          />
        </div>
      </section>

      <section style={sectionStyle}>
        <SectionHeading
          eyebrow="Interpretation"
          title="What the Strategic Value band means"
          description="The score reflects the site's strategic role within the current evidence base. It does not, by itself, indicate that the site is currently at risk."
        />

        <div style={bandGuideGridStyle}>
          <BandGuide
            title="High"
            score="9–15"
          />

          <BandGuide
            title="Medium"
            score="5–8"
          />

          <BandGuide
            title="Low"
            score="1–4"
          />

          <BandGuide
            title="Not flagged"
            score="0"
          />
        </div>
      </section>

      <MethodologyCallout />
    </>
  );
}

function FacilitiesTab({
  site,
}: {
  site: SiteDetail;
}) {
  const facilityRows =
    [
      {
        label:
          "Adult football / rugby pitch units",
        value:
          site.adult_football_rugby_pitch_units,
      },
      {
        label:
          "Rugby pitch units",
        value:
          site.rugby_pitch_units,
      },
      {
        label:
          "Cricket pitch units",
        value:
          site.cricket_pitch_units,
      },
      {
        label:
          "Other strategic grass pitch units",
        value:
          site.other_strategic_grass_pitch_units,
      },
      {
        label:
          "Full-size 3G pitch units",
        value:
          site.full_size_3g_pitch_units,
      },
      {
        label:
          "Hockey artificial grass pitch units",
        value:
          site.hockey_agp_pitch_units,
      },
    ];

  return (
    <>
      <section style={sectionStyle}>
        <SectionHeading
          eyebrow="Facility evidence"
          title="Playing-field provision recorded for this site"
          description="Facility evidence supports the Strategic Value assessment. These values should be interpreted as the provision currently represented in the governed assessment data."
        />

        <div style={facilityGridStyle}>
          {facilityRows.map(
            (
              row
            ) => (
              <FacilityCard
                key={
                  row.label
                }
                label={
                  row.label
                }
                value={
                  row.value
                }
              />
            )
          )}
        </div>
      </section>

      <section style={sectionStyle}>
        <SectionHeading
          eyebrow="Site context"
          title="Current site information"
          description="Core site attributes used to describe the assessed playing field."
        />

        <div style={summaryInfoGridStyle}>
          <InfoCard
            title="Playing-field status"
            value={
              site.playing_field_status ||
              "Not recorded"
            }
            text="Current status represented in the assessment."
          />

          <InfoCard
            title="Owner"
            value={
              site.owner_type ||
              "Not recorded"
            }
            text="Current ownership classification."
          />

          <InfoCard
            title="Management"
            value={
              site.management_type ||
              "Not recorded"
            }
            text="Current management classification."
          />

          <InfoCard
            title="Borough"
            value={
              site.borough ||
              "Not recorded"
            }
            text="London borough used for borough-level context and provision comparisons."
          />
        </div>
      </section>
    </>
  );
}

function EvidenceTab({
  site,
  qualityIssues,
}: {
  site: SiteDetail;
  qualityIssues: {
    title: string;
    text: string;
  }[];
}) {
  return (
    <>
      <section style={sectionStyle}>
        <SectionHeading
          eyebrow="Evidence quality"
          title="What should be interpreted with additional care"
          description="Missing, conflicting or uncertain evidence is surfaced rather than silently treated as confirmed information."
        />

        {qualityIssues.length >
        0 ? (
          <div style={issueGridStyle}>
            {qualityIssues.map(
              (
                issue
              ) => (
                <IssueCard
                  key={
                    `${issue.title}-${issue.text}`
                  }
                  title={
                    issue.title
                  }
                  text={
                    issue.text
                  }
                />
              )
            )}
          </div>
        ) : (
          <div style={noIssuesStyle}>
            <div style={noIssuesTitleStyle}>
              No additional
              evidence-quality flag
              is currently shown.
            </div>

            <div style={noIssuesTextStyle}>
              This does not mean the
              underlying source data
              is complete in every
              respect; it means no
              additional site-level
              review flag is
              currently exposed
              through this assessment.
            </div>
          </div>
        )}
      </section>

      <section style={sectionStyle}>
        <SectionHeading
          eyebrow="Evidence sources"
          title="Evidence represented in this assessment"
          description="The site assessment combines current site and facility information with available PPS, planning, deprivation and borough-level context."
        />

        <div style={evidenceSourceGridStyle}>
          <EvidenceSource
            title="Active Places"
            text="Core site, facility, ownership and management evidence."
          />

          <EvidenceSource
            title="Playing Pitch Strategies"
            text="Protection, tenure, community-use and contextual evidence where a link is available."
          />

          <EvidenceSource
            title="Planning evidence"
            text="Site-linked planning evidence used either for assessment or manual review."
          />

          <EvidenceSource
            title="Deprivation"
            text="Index of Multiple Deprivation evidence used within Strategic Value."
          />

          <EvidenceSource
            title="Borough context"
            text="Provision comparisons used to understand the site's share of equivalent borough provision."
          />

          <EvidenceSource
            title="Manual review"
            text="Flags retained where evidence requires additional checking or interpretation."
          />
        </div>
      </section>

      <section style={sectionStyle}>
        <SectionHeading
          eyebrow="Site identifiers"
          title="Reference information"
          description="Reference details can help partners reconcile this assessment with other systems and datasets."
        />

        <div style={referenceGridStyle}>
          <ReferenceItem
            label="Site ID"
            value={
              String(
                site.site_id ||
                  "Not recorded"
              )
            }
          />

          <ReferenceItem
            label="Postcode"
            value={
              site.postcode ||
              "Not recorded"
            }
          />

          <ReferenceItem
            label="Borough"
            value={
              site.borough ||
              "Not recorded"
            }
          />

          <ReferenceItem
            label="Coordinates"
            value={
              site.latitude !==
                null &&
              site.longitude !==
                null
                ? `${site.latitude}, ${site.longitude}`
                : "Not recorded"
            }
          />
        </div>
      </section>

      <MethodologyCallout />
    </>
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

function HeroMetric({
  label,
  value,
  supporting,
}: {
  label: string;
  value: string;
  supporting?: string;
}) {
  return (
    <div style={heroMetricStyle}>
      <div style={heroMetricLabelStyle}>
        {label}
      </div>

      <div style={heroMetricValueStyle}>
        {value}
      </div>

      {supporting && (
        <div style={heroMetricSupportingStyle}>
          {supporting}
        </div>
      )}
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        ...tabButtonStyle,
        ...(active
          ? activeTabStyle
          : {}),
      }}
    >
      {children}
    </button>
  );
}

function InfoCard({
  title,
  value,
  text,
}: {
  title: string;
  value: string;
  text: string;
}) {
  return (
    <article style={infoCardStyle}>
      <div style={infoCardLabelStyle}>
        {title}
      </div>

      <div style={infoCardValueStyle}>
        {value}
      </div>

      <div style={infoCardTextStyle}>
        {text}
      </div>
    </article>
  );
}

function AssessmentCriterion({
  title,
  score,
  maxScore,
  evidence,
  description,
}: {
  title: string;
  score: number | null;
  maxScore: number;
  evidence: string;
  description: string;
}) {
  return (
    <article style={criterionCardStyle}>
      <div style={criterionTopStyle}>
        <h3 style={criterionTitleStyle}>
          {title}
        </h3>

        <span style={criterionScoreStyle}>
          {score ?? "—"} /{" "}
          {maxScore}
        </span>
      </div>

      <div style={criterionEvidenceStyle}>
        {evidence}
      </div>

      <p style={criterionDescriptionStyle}>
        {description}
      </p>
    </article>
  );
}

function MetricBox({
  label,
  value,
}: {
  label: string;
  value:
    | string
    | number;
}) {
  return (
    <div style={metricBoxStyle}>
      <div style={metricLabelStyle}>
        {label}
      </div>

      <div style={metricValueStyle}>
        {value}
      </div>
    </div>
  );
}

function BandGuide({
  title,
  score,
}: {
  title: string;
  score: string;
}) {
  return (
    <div style={bandGuideStyle}>
      <div style={bandGuideTitleStyle}>
        {title}
      </div>

      <div style={bandGuideScoreStyle}>
        Score {score}
      </div>
    </div>
  );
}

function FacilityCard({
  label,
  value,
}: {
  label: string;
  value: number | null;
}) {
  return (
    <article style={facilityCardStyle}>
      <div style={facilityValueStyle}>
        {formatNumberValue(
          value
        )}
      </div>

      <div style={facilityLabelStyle}>
        {label}
      </div>
    </article>
  );
}

function IssueCard({
  title,
  text,
}: {
  title: string;
  text: string;
}) {
  return (
    <article style={issueCardStyle}>
      <div style={issueEyebrowStyle}>
        Review
      </div>

      <div style={issueTitleStyle}>
        {title}
      </div>

      <div style={issueTextStyle}>
        {text}
      </div>
    </article>
  );
}

function EvidenceSource({
  title,
  text,
}: {
  title: string;
  text: string;
}) {
  return (
    <article style={evidenceSourceStyle}>
      <div style={evidenceAccentStyle} />

      <div style={evidenceSourceTitleStyle}>
        {title}
      </div>

      <div style={evidenceSourceTextStyle}>
        {text}
      </div>
    </article>
  );
}

function ReferenceItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div style={referenceItemStyle}>
      <div style={referenceLabelStyle}>
        {label}
      </div>

      <div style={referenceValueStyle}>
        {value}
      </div>
    </div>
  );
}

function MethodologyCallout() {
  return (
    <section style={methodologyCalloutStyle}>
      <div>
        <div style={methodologyEyebrowStyle}>
          Methodology
        </div>

        <div style={methodologyTitleStyle}>
          Want to understand how
          these scores and outcomes
          are produced?
        </div>
      </div>

      <Link
        href="/about#assessment"
        style={methodologyButtonStyle}
      >
        How this assessment works →
      </Link>
    </section>
  );
}

type PlanningState = {
  shortLabel: string;
  label: string;
  description: string;
  supporting?: string;
  background: string;
  border: string;
  badge: string;
  text: string;
};

function getPlanningState(
  site: SiteDetail
): PlanningState {
  const planningScore =
    site.rf6_planning_pressure_score ??
    0;

  const confirmed =
    site.confirmed_rf6_application_count ??
    0;

  const candidates =
    site.planning_candidate_application_count ??
    0;

  if (
    planningScore > 0 ||
    confirmed > 0
  ) {
    return {
      shortLabel:
        "Contributes",
      label:
        "Planning evidence contributes to the Planning Pressure assessment",
      description:
        "Sufficiently strong site-linked planning evidence has met the governed assessment rules and contributes directly to this site's Risk Exposure.",
      supporting:
        confirmed > 0
          ? `${confirmed} ${
              confirmed === 1
                ? "evidence record"
                : "evidence records"
            } contributing`
          : undefined,
      background:
        "#f9ecec",
      border:
        "#edcccc",
      badge:
        "#f3d8da",
      text:
        "#812329",
    };
  }

  if (
    candidates > 0 ||
    site.planning_review_required ===
      "Yes"
  ) {
    return {
      shortLabel:
        "Review only",
      label:
        "Planning evidence retained for review",
      description:
        "Planning evidence has been identified for this site, but it does not currently meet the rules required to contribute directly to the Planning Pressure assessment.",
      supporting:
        candidates > 0
          ? `${candidates} ${
              candidates === 1
                ? "evidence record"
                : "evidence records"
            } identified`
          : undefined,
      background:
        "#fff8e3",
      border:
        "#eadfb7",
      badge:
        "#f5ecc8",
      text:
        "#6b591a",
    };
  }

  return {
    shortLabel:
      "None identified",
    label:
      "No current planning evidence identified",
    description:
      "No planning evidence currently contributes to, or is retained for review within, the Planning Pressure assessment for this site.",
    background:
      "#f4f2ef",
    border:
      "#dfdbd6",
    badge:
      "#e9e6e2",
    text:
      "#555555",
  };
}

function getKnownRiskEvidence(
  site: SiteDetail
) {
  if (
    (site.rf3_pps_at_risk_score ??
      0) > 0
  ) {
    return "Known at-risk protection evidence recorded";
  }

  if (
    site.pps_critical_site_flag
  ) {
    return `PPS evidence: ${site.pps_critical_site_flag}`;
  }

  return "No scored known at-risk evidence";
}

function getMultiPitchEvidence(
  site: SiteDetail
) {
  const count =
    site.adult_football_rugby_pitch_units ??
    0;

  return `${formatNumberValue(
    count
  )} adult / senior football or rugby pitch ${
    count === 1
      ? "unit"
      : "units"
  }`;
}

function getStrategicSportEvidence(
  site: SiteDetail
) {
  const parts: string[] =
    [];

  if (
    (site.rugby_pitch_units ??
      0) > 0
  ) {
    parts.push(
      `${site.rugby_pitch_units} rugby`
    );
  }

  if (
    (site.cricket_pitch_units ??
      0) > 0
  ) {
    parts.push(
      `${site.cricket_pitch_units} cricket`
    );
  }

  if (
    (site.hockey_agp_pitch_units ??
      0) > 0
  ) {
    parts.push(
      `${site.hockey_agp_pitch_units} hockey`
    );
  }

  if (
    (site.other_strategic_grass_pitch_units ??
      0) > 0
  ) {
    parts.push(
      `${site.other_strategic_grass_pitch_units} other strategic grass`
    );
  }

  return parts.length >
    0
    ? parts.join(" · ")
    : "No strategic sport provision recorded";
}

function getOutcomeDescription(
  priority:
    | string
    | null
) {
  switch (
    priority
  ) {
    case "Priority A":
      return "High current escalation category where high Risk Exposure combines with high or medium Strategic Value.";

    case "Priority B":
      return "High Risk Exposure with lower current Strategic Value.";

    case "Priority C":
      return "Medium Risk Exposure combined with high or medium Strategic Value.";

    case "Risk Review":
      return "Medium Risk Exposure where the available evidence warrants review rather than an active Priority A–C outcome.";

    case "Strategic Monitor":
      return "High Strategic Value with low or no current risk signal.";

    case "Monitor":
      return "Retained in the assessed population without a current escalation outcome.";

    default:
      return "The current outcome is determined by combining the Risk Exposure and Strategic Value bands.";
  }
}

function formatDistance(
  value:
    | number
    | null
) {
  if (
    value === null ||
    value === undefined
  ) {
    return "Not recorded";
  }

  if (
    value < 1000
  ) {
    return `${Math.round(
      value
    )} m`;
  }

  return `${(
    value / 1000
  ).toFixed(1)} km`;
}

function formatNumberValue(
  value:
    | number
    | null
) {
  if (
    value === null ||
    value === undefined
  ) {
    return "0";
  }

  return Number(
    value
  ).toLocaleString(
    "en-GB"
  );
}

function isYes(
  value:
    | string
    | null
) {
  return (
    value
      ?.trim()
      .toLowerCase() ===
    "yes"
  );
}

function normaliseSiteResponse(
  raw: SiteApiResponse
): SiteDetail | null {
  if (
    !raw ||
    typeof raw !==
      "object"
  ) {
    return null;
  }

  if (
    "site" in raw &&
    raw.site
  ) {
    return raw.site;
  }

  if (
    "data" in raw &&
    raw.data
  ) {
    return raw.data;
  }

  if (
    "site_id" in raw
  ) {
    return raw as SiteDetail;
  }

  return null;
}

const pageStyle: CSSProperties = {
  maxWidth: "1440px",
  margin: "0 auto",
  padding: "28px 28px 80px",
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

const topLinksStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  flexWrap: "wrap",
  gap: "12px",
  marginBottom: "14px",
};

const backLinkStyle: CSSProperties = {
  color: "#171717",
  textDecoration: "none",
  fontSize: "10px",
  fontWeight: 850,
};

const methodLinkStyle: CSSProperties = {
  color: "#e21b23",
  textDecoration: "none",
  fontSize: "10px",
  fontWeight: 850,
};

const heroStyle: CSSProperties = {
  background: "#171717",
  color: "#ffffff",
  borderRadius: "22px",
  padding: "34px 38px",
  marginBottom: "18px",
};

const heroTopStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  flexWrap: "wrap",
  gap: "28px",
};

const heroEyebrowStyle: CSSProperties = {
  color: "#ef555b",
  fontSize: "9px",
  fontWeight: 900,
  letterSpacing: "0.09em",
  textTransform: "uppercase",
};

const heroTitleStyle: CSSProperties = {
  maxWidth: "900px",
  margin: "7px 0 0",
  fontSize:
    "clamp(31px, 4vw, 50px)",
  lineHeight: 1.04,
  letterSpacing: "-0.045em",
};

const heroLocationStyle: CSSProperties = {
  marginTop: "10px",
  color: "#bdbdbd",
  fontSize: "11px",
};

const priorityPanelStyle: CSSProperties = {
  minWidth: "180px",
  padding: "14px 16px",
  background: "#282828",
  borderRadius: "12px",
};

const priorityLabelStyle: CSSProperties = {
  color: "#9d9d9d",
  fontSize: "8px",
  fontWeight: 850,
  textTransform: "uppercase",
  letterSpacing: "0.06em",
};

const priorityValueStyle: CSSProperties = {
  marginTop: "5px",
  fontSize: "18px",
  fontWeight: 900,
};

const heroMetricsStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(180px, 1fr))",
  gap: "10px",
  marginTop: "27px",
};

const heroMetricStyle: CSSProperties = {
  padding: "13px",
  background: "#222222",
  borderRadius: "10px",
};

const heroMetricLabelStyle: CSSProperties = {
  color: "#9d9d9d",
  fontSize: "8px",
  fontWeight: 800,
  textTransform: "uppercase",
};

const heroMetricValueStyle: CSSProperties = {
  marginTop: "4px",
  fontSize: "12px",
  fontWeight: 850,
};

const heroMetricSupportingStyle: CSSProperties = {
  marginTop: "3px",
  color: "#bbbbbb",
  fontSize: "8px",
};

const tabsWrapStyle: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: "7px",
  padding: "8px",
  marginBottom: "30px",
  background: "#ffffff",
  border: "1px solid #e2ded9",
  borderRadius: "13px",
};

const tabButtonStyle: CSSProperties = {
  border: 0,
  background: "transparent",
  color: "#555555",
  borderRadius: "8px",
  padding: "9px 13px",
  cursor: "pointer",
  fontSize: "9px",
  fontWeight: 850,
};

const activeTabStyle: CSSProperties = {
  background: "#171717",
  color: "#ffffff",
};

const sectionStyle: CSSProperties = {
  marginBottom: "42px",
};

const sectionHeadingStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(300px, 1fr))",
  gap: "28px",
  alignItems: "end",
  marginBottom: "18px",
};

const eyebrowStyle: CSSProperties = {
  color: "#e21b23",
  fontSize: "9px",
  fontWeight: 900,
  textTransform: "uppercase",
  letterSpacing: "0.08em",
};

const sectionTitleStyle: CSSProperties = {
  margin: "6px 0 0",
  fontSize: "28px",
  lineHeight: 1.15,
  letterSpacing: "-0.035em",
};

const sectionDescriptionStyle: CSSProperties = {
  margin: 0,
  color: "#666666",
  fontSize: "11px",
  lineHeight: 1.6,
};

const summaryAssessmentGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns:
    "minmax(220px, 1fr) auto minmax(220px, 1fr) auto minmax(220px, 1fr)",
  gap: "12px",
  alignItems: "stretch",
};

const dimensionCardButtonStyle: CSSProperties = {
  textAlign: "left",
  border: "1px solid #e2ded9",
  background: "#ffffff",
  borderRadius: "15px",
  padding: "19px",
  cursor: "pointer",
};

const dimensionEyebrowStyle: CSSProperties = {
  color: "#e21b23",
  fontSize: "8px",
  fontWeight: 900,
  textTransform: "uppercase",
};

const dimensionValueStyle: CSSProperties = {
  marginTop: "6px",
  fontSize: "24px",
  fontWeight: 900,
};

const dimensionScoreStyle: CSSProperties = {
  marginTop: "3px",
  color: "#777777",
  fontSize: "9px",
};

const dimensionTextStyle: CSSProperties = {
  color: "#666666",
  fontSize: "9px",
  lineHeight: 1.5,
};

const dimensionLinkStyle: CSSProperties = {
  marginTop: "12px",
  color: "#171717",
  fontSize: "9px",
  fontWeight: 850,
};

const combineSymbolStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#999999",
  fontSize: "23px",
  fontWeight: 900,
};

const outcomeCardStyle: CSSProperties = {
  padding: "19px",
  background: "#171717",
  color: "#ffffff",
  borderRadius: "15px",
};

const outcomeEyebrowStyle: CSSProperties = {
  color: "#ef555b",
  fontSize: "8px",
  fontWeight: 900,
  textTransform: "uppercase",
};

const outcomeValueStyle: CSSProperties = {
  marginTop: "6px",
  fontSize: "24px",
  fontWeight: 900,
};

const outcomeDescriptionStyle: CSSProperties = {
  color: "#bdbdbd",
  fontSize: "9px",
  lineHeight: 1.5,
};

const summaryInfoGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(230px, 1fr))",
  gap: "13px",
};

const infoCardStyle: CSSProperties = {
  padding: "17px",
  background: "#ffffff",
  border: "1px solid #e2ded9",
  borderRadius: "13px",
};

const infoCardLabelStyle: CSSProperties = {
  color: "#888888",
  fontSize: "8px",
  fontWeight: 850,
  textTransform: "uppercase",
};

const infoCardValueStyle: CSSProperties = {
  marginTop: "5px",
  fontSize: "13px",
  fontWeight: 850,
};

const infoCardTextStyle: CSSProperties = {
  marginTop: "6px",
  color: "#6d6d6d",
  fontSize: "9px",
  lineHeight: 1.5,
};

const bandSummaryStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  flexWrap: "wrap",
  gap: "18px",
  padding: "18px",
  marginBottom: "14px",
  background: "#171717",
  color: "#ffffff",
  borderRadius: "14px",
};

const bandSummaryLabelStyle: CSSProperties = {
  color: "#a7a7a7",
  fontSize: "8px",
  fontWeight: 850,
  textTransform: "uppercase",
};

const bandSummaryValueStyle: CSSProperties = {
  marginTop: "4px",
  fontSize: "23px",
  fontWeight: 900,
};

const bandSummaryNumberStyle: CSSProperties = {
  marginTop: "4px",
  fontSize: "23px",
  fontWeight: 900,
};

const scoreMaxStyle: CSSProperties = {
  color: "#8d8d8d",
  fontSize: "12px",
  marginLeft: "3px",
};

const criteriaGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(250px, 1fr))",
  gap: "13px",
};

const criterionCardStyle: CSSProperties = {
  padding: "18px",
  background: "#ffffff",
  border: "1px solid #e2ded9",
  borderRadius: "14px",
};

const criterionTopStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: "10px",
};

const criterionTitleStyle: CSSProperties = {
  margin: 0,
  fontSize: "13px",
};

const criterionScoreStyle: CSSProperties = {
  flexShrink: 0,
  padding: "4px 7px",
  background: "#f0ede9",
  borderRadius: "999px",
  color: "#555555",
  fontSize: "8px",
  fontWeight: 850,
};

const criterionEvidenceStyle: CSSProperties = {
  marginTop: "9px",
  color: "#222222",
  fontSize: "10px",
  fontWeight: 800,
};

const criterionDescriptionStyle: CSSProperties = {
  margin: "7px 0 0",
  color: "#707070",
  fontSize: "9px",
  lineHeight: 1.5,
};

const planningPanelStyle: CSSProperties = {
  border: "1px solid",
  borderRadius: "15px",
  padding: "19px",
};

const planningStatusTopStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  flexWrap: "wrap",
  gap: "12px",
};

const planningLabelStyle: CSSProperties = {
  color: "#777777",
  fontSize: "8px",
  fontWeight: 850,
  textTransform: "uppercase",
};

const planningStatusTitleStyle: CSSProperties = {
  marginTop: "5px",
  fontSize: "15px",
  fontWeight: 850,
};

const planningBadgeStyle: CSSProperties = {
  padding: "6px 9px",
  borderRadius: "999px",
  fontSize: "8px",
  fontWeight: 850,
};

const planningDescriptionStyle: CSSProperties = {
  maxWidth: "900px",
  color: "#606060",
  fontSize: "10px",
  lineHeight: 1.55,
};

const planningMetricsStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(190px, 1fr))",
  gap: "10px",
  marginTop: "15px",
};

const metricBoxStyle: CSSProperties = {
  padding: "12px",
  background: "rgba(255,255,255,0.72)",
  borderRadius: "9px",
};

const metricLabelStyle: CSSProperties = {
  color: "#777777",
  fontSize: "8px",
  fontWeight: 800,
};

const metricValueStyle: CSSProperties = {
  marginTop: "4px",
  fontSize: "17px",
  fontWeight: 900,
};

const bandGuideGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns:
    "repeat(4, minmax(0, 1fr))",
  gap: "10px",
};

const bandGuideStyle: CSSProperties = {
  padding: "14px",
  background: "#ffffff",
  border: "1px solid #e2ded9",
  borderRadius: "11px",
};

const bandGuideTitleStyle: CSSProperties = {
  fontSize: "10px",
  fontWeight: 850,
};

const bandGuideScoreStyle: CSSProperties = {
  marginTop: "4px",
  color: "#777777",
  fontSize: "8px",
};

const facilityGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(190px, 1fr))",
  gap: "13px",
};

const facilityCardStyle: CSSProperties = {
  padding: "18px",
  background: "#ffffff",
  border: "1px solid #e2ded9",
  borderRadius: "13px",
};

const facilityValueStyle: CSSProperties = {
  fontSize: "28px",
  fontWeight: 900,
};

const facilityLabelStyle: CSSProperties = {
  marginTop: "5px",
  color: "#666666",
  fontSize: "9px",
  lineHeight: 1.4,
};

const issueGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(250px, 1fr))",
  gap: "12px",
};

const issueCardStyle: CSSProperties = {
  padding: "16px",
  background: "#fff8e3",
  border: "1px solid #eadfb7",
  borderRadius: "12px",
};

const issueEyebrowStyle: CSSProperties = {
  color: "#8b7118",
  fontSize: "8px",
  fontWeight: 900,
  textTransform: "uppercase",
};

const issueTitleStyle: CSSProperties = {
  marginTop: "5px",
  fontSize: "11px",
  fontWeight: 850,
};

const issueTextStyle: CSSProperties = {
  marginTop: "5px",
  color: "#675b28",
  fontSize: "9px",
  lineHeight: 1.5,
};

const noIssuesStyle: CSSProperties = {
  padding: "20px",
  background: "#ffffff",
  border: "1px solid #e2ded9",
  borderRadius: "13px",
};

const noIssuesTitleStyle: CSSProperties = {
  fontSize: "12px",
  fontWeight: 850,
};

const noIssuesTextStyle: CSSProperties = {
  maxWidth: "800px",
  marginTop: "6px",
  color: "#6e6e6e",
  fontSize: "9px",
  lineHeight: 1.55,
};

const evidenceSourceGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(230px, 1fr))",
  gap: "12px",
};

const evidenceSourceStyle: CSSProperties = {
  position: "relative",
  overflow: "hidden",
  padding: "16px",
  background: "#ffffff",
  border: "1px solid #e2ded9",
  borderRadius: "12px",
};

const evidenceAccentStyle: CSSProperties = {
  position: "absolute",
  top: 0,
  left: 0,
  bottom: 0,
  width: "4px",
  background: "#e21b23",
};

const evidenceSourceTitleStyle: CSSProperties = {
  fontSize: "11px",
  fontWeight: 850,
};

const evidenceSourceTextStyle: CSSProperties = {
  marginTop: "5px",
  color: "#6d6d6d",
  fontSize: "9px",
  lineHeight: 1.5,
};

const referenceGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(220px, 1fr))",
  gap: "10px",
};

const referenceItemStyle: CSSProperties = {
  padding: "13px",
  background: "#f2efeb",
  borderRadius: "10px",
};

const referenceLabelStyle: CSSProperties = {
  color: "#777777",
  fontSize: "8px",
  fontWeight: 850,
  textTransform: "uppercase",
};

const referenceValueStyle: CSSProperties = {
  marginTop: "4px",
  fontSize: "10px",
  fontWeight: 800,
};

const methodologyCalloutStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  flexWrap: "wrap",
  gap: "18px",
  padding: "22px",
  background: "#171717",
  color: "#ffffff",
  borderRadius: "15px",
  marginBottom: "42px",
};

const methodologyEyebrowStyle: CSSProperties = {
  color: "#ef555b",
  fontSize: "8px",
  fontWeight: 900,
  textTransform: "uppercase",
};

const methodologyTitleStyle: CSSProperties = {
  marginTop: "5px",
  fontSize: "15px",
  fontWeight: 850,
};

const methodologyButtonStyle: CSSProperties = {
  padding: "10px 13px",
  background: "#ffffff",
  color: "#171717",
  textDecoration: "none",
  borderRadius: "8px",
  fontSize: "9px",
  fontWeight: 850,
};
