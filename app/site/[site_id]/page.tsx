"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import AppShell from "../../../components/AppShell";

type SiteDetail = {
  site_id: number;
  site_name: string;
  postcode: string | null;
  borough: string;
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

  possible_3g_data_quality_flag: number | string | null;
  sv4_single_recorded_provision_flag: string | null;
  sv4_review_note: string | null;
  missing_imd_flag: string | null;
  missing_owner_flag: string | null;
  missing_management_flag: string | null;

  phase1_3_scope_tag: string | null;
  phase1_3_source_note: string | null;
  phase1_3_methodology_note: string | null;
};

type SiteApiResponse = {
  success: boolean;
  site?: SiteDetail;
  error?: string;
};

type TabName =
  | "summary"
  | "strategic"
  | "risk"
  | "facilities"
  | "evidence";

const tabs: {
  id: TabName;
  label: string;
}[] = [
  {
    id: "summary",
    label: "Summary",
  },
  {
    id: "strategic",
    label: "Strategic Value",
  },
  {
    id: "risk",
    label: "Risk & Planning",
  },
  {
    id: "facilities",
    label: "Facilities",
  },
  {
    id: "evidence",
    label: "Evidence & Quality",
  },
];

export default function SiteDetailPage() {
  const params = useParams<{ site_id: string }>();
  const siteId = params.site_id;

  const [site, setSite] = useState<SiteDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeTab, setActiveTab] =
    useState<TabName>("summary");

  useEffect(() => {
    async function loadSite() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          `/api/sites/${siteId}`,
          {
            cache: "no-store",
          }
        );

        const data: SiteApiResponse =
          await response.json();

        if (
          !response.ok ||
          !data.success ||
          !data.site
        ) {
          throw new Error(
            data.error || "Unable to load site"
          );
        }

        setSite(data.site);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load site"
        );
      } finally {
        setLoading(false);
      }
    }

    if (siteId) {
      loadSite();
    }
  }, [siteId]);

  if (loading) {
    return (
      <AppShell>
        <main style={pageStyle}>
          <div style={loadingStyle}>
            Loading site assessment...
          </div>
        </main>
      </AppShell>
    );
  }

  if (error || !site) {
    return (
      <AppShell>
        <main style={pageStyle}>
          <Link
            href="/sites"
            style={backLinkStyle}
          >
            ← Back to Explore Sites
          </Link>

          <div style={errorStyle}>
            <strong>
              We could not load this site.
            </strong>

            <div style={{ marginTop: "6px" }}>
              {error || "Site not found"}
            </div>
          </div>
        </main>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <main style={pageStyle}>
        <div style={backRowStyle}>
          <Link
            href="/sites"
            style={backLinkStyle}
          >
            ← Explore Sites
          </Link>

          <span style={siteIdStyle}>
            Site ID {site.site_id}
          </span>
        </div>

        <SiteHero site={site} />

        <section style={workspaceStyle}>
          <div style={tabScrollStyle}>
            <div style={tabsStyle}>
              {tabs.map((tab) => {
                const active =
                  activeTab === tab.id;

                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() =>
                      setActiveTab(tab.id)
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

          <div style={tabContentStyle}>
            {activeTab === "summary" && (
              <SummaryTab site={site} />
            )}

            {activeTab === "strategic" && (
              <StrategicTab site={site} />
            )}

            {activeTab === "risk" && (
              <RiskTab site={site} />
            )}

            {activeTab === "facilities" && (
              <FacilitiesTab site={site} />
            )}

            {activeTab === "evidence" && (
              <EvidenceTab site={site} />
            )}
          </div>
        </section>
      </main>
    </AppShell>
  );
}

function SiteHero({
  site,
}: {
  site: SiteDetail;
}) {
  return (
    <section style={heroStyle}>
      <div style={heroTopStyle}>
        <div>
          <div style={eyebrowStyle}>
            Current playing field assessment
          </div>

          <h1 style={heroTitleStyle}>
            {formatSiteName(site.site_name)}
          </h1>

          <div style={locationStyle}>
            {site.borough}

            {site.postcode &&
              ` · ${site.postcode}`}

            {site.playing_field_status &&
              ` · ${site.playing_field_status}`}
          </div>
        </div>

        <div style={heroPriorityStyle}>
          <div style={priorityLabelStyle}>
            Current priority
          </div>

          <PriorityBadge
            value={
              site.priority_category ||
              "Not classified"
            }
            large
          />
        </div>
      </div>

      <div style={heroMetricsStyle}>
        <HeroMetric
          label="Risk"
          value={site.risk_band || "Not available"}
          detail={
            site.risk_exposure_score !== null
              ? `Risk score ${site.risk_exposure_score}`
              : undefined
          }
          type="risk"
        />

        <HeroMetric
          label="Strategic value"
          value={
            site.strategic_value_band ||
            "Not available"
          }
          detail={
            site.strategic_value_score !== null
              ? `Strategic score ${site.strategic_value_score}`
              : undefined
          }
        />

        <HeroMetric
          label="Planning pressure"
          value={
            (site.rf6_planning_pressure_score ??
              0) > 0
              ? `RF6 score ${site.rf6_planning_pressure_score}`
              : "No RF6 score"
          }
          detail={
            (site.confirmed_rf6_application_count ??
              0) > 0
              ? `${site.confirmed_rf6_application_count} confirmed RF6 evidence ${
                  site.confirmed_rf6_application_count ===
                  1
                    ? "record"
                    : "records"
                }`
              : "No confirmed RF6 application"
          }
        />

        <HeroMetric
          label="Assessment scope"
          value={
            site.phase1_3_scope_tag ||
            "Current Playing Field"
          }
        />
      </div>
    </section>
  );
}

function SummaryTab({
  site,
}: {
  site: SiteDetail;
}) {
  const candidates =
    site.planning_candidate_application_count ??
    0;

  const confirmed =
    site.confirmed_rf6_application_count ?? 0;

  const rf6 =
    site.rf6_planning_pressure_score ?? 0;

  return (
    <>
      <section style={attentionPanelStyle}>
        <div style={attentionLabelStyle}>
          Why this site matters
        </div>

        <h2 style={attentionTitleStyle}>
          {getSummaryHeadline(site)}
        </h2>

        <p style={attentionTextStyle}>
          {getWhyThisSiteMatters(site)}
        </p>
      </section>

      <div style={twoColumnGridStyle}>
        <SectionCard
          eyebrow="Current position"
          title="Assessment at a glance"
        >
          <InfoRow
            label="Priority category"
            value={
              site.priority_category
            }
          />

          <InfoRow
            label="Risk band"
            value={site.risk_band}
          />

          <InfoRow
            label="Strategic value"
            value={
              site.strategic_value_band
            }
          />

          <InfoRow
            label="Playing field status"
            value={
              site.playing_field_status
            }
          />

          <InfoRow
            label="Owner type"
            value={cleanValue(
              site.owner_type
            )}
          />

          <InfoRow
            label="Management"
            value={cleanValue(
              site.management_type
            )}
          />
        </SectionCard>

        <SectionCard
          eyebrow="Evidence signals"
          title="What is contributing?"
        >
          <SignalRow
            label="Ownership exposure"
            code="RF1"
            score={
              site.rf1_ownership_exposure_score
            }
          />

          <SignalRow
            label="Management exposure"
            code="RF2"
            score={
              site.rf2_management_exposure_score
            }
          />

          <SignalRow
            label="PPS at-risk evidence"
            code="RF3"
            score={
              site.rf3_pps_at_risk_score
            }
          />

          <SignalRow
            label="Planning pressure"
            code="RF6"
            score={
              site.rf6_planning_pressure_score
            }
          />
        </SectionCard>
      </div>

      <section style={sectionStyle}>
        <div style={sectionHeaderStyle}>
          <div>
            <div style={sectionEyebrowStyle}>
              Planning evidence
            </div>

            <h2 style={sectionTitleStyle}>
              Planning-pressure context
            </h2>
          </div>
        </div>

        <div style={metricGridStyle}>
          <MetricCard
            value={candidates}
            label="Planning candidates identified"
          />

          <MetricCard
            value={confirmed}
            label="Confirmed RF6 applications"
          />

          <MetricCard
            value={
              site.nearest_planning_candidate_distance_metres !==
              null
                ? `${site.nearest_planning_candidate_distance_metres} m`
                : "N/A"
            }
            label="Nearest planning candidate"
          />

          <MetricCard
            value={rf6}
            label="RF6 planning-pressure score"
          />
        </div>

        <PlanningInterpretation
          site={site}
        />
      </section>

      <div style={twoColumnGridStyle}>
        <SectionCard
          eyebrow="Playing field"
          title="Provision snapshot"
        >
          <ProvisionSummary site={site} />
        </SectionCard>

        <SectionCard
          eyebrow="Evidence source"
          title="PPS context"
        >
          <InfoRow
            label="PPS critical site"
            value={
              site.pps_critical_site_flag
            }
          />

          <InfoRow
            label="PPS ownership"
            value={
              site.pps_ownership_type
            }
          />

          <InfoRow
            label="PPS management"
            value={
              site.pps_management_type
            }
          />

          <InfoRow
            label="Security of tenure"
            value={
              site.pps_security_of_tenure
            }
          />

          <InfoRow
            label="Community use"
            value={
              site.pps_community_use_flag
            }
          />
        </SectionCard>
      </div>
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
      <section style={introPanelStyle}>
        <div>
          <div style={sectionEyebrowStyle}>
            Strategic value
          </div>

          <h2 style={introTitleStyle}>
            Why is this site strategically
            important?
          </h2>

          <p style={introTextStyle}>
            Strategic value is assessed separately
            from risk. The factors below describe the
            characteristics that determine the site&apos;s
            strategic importance within the current
            Phase 1.3 assessment.
          </p>
        </div>

        <div style={scoreHeroStyle}>
          <div style={scoreHeroLabelStyle}>
            Strategic value
          </div>

          <div style={scoreHeroValueStyle}>
            {site.strategic_value_score ??
              "N/A"}
          </div>

          <div style={scoreHeroBandStyle}>
            {site.strategic_value_band ||
              "Not available"}
          </div>
        </div>
      </section>

      <div style={factorGridStyle}>
        <FactorCard
          code="SV1"
          title="Multi-pitch scale"
          score={
            site.sv1_multi_pitch_scale_score
          }
          explanation="Recognises the scale of adult football and rugby provision recorded at the site."
        />

        <FactorCard
          code="SV2"
          title="Full-size 3G provision"
          score={
            site.sv2_full_size_3g_score
          }
          explanation="Identifies strategic full-size 3G provision within the current playing field evidence."
        />

        <FactorCard
          code="SV3"
          title="Strategic sport"
          score={
            site.sv3_strategic_sport_score
          }
          explanation="Reflects the presence of strategic sport provision within the assessment."
        />

        <FactorCard
          code="SV4"
          title="Share of borough provision"
          score={
            site.sv4_share_of_borough_provision_score
          }
          explanation="Assesses the site's relative contribution to recorded provision within its borough."
        />

        <FactorCard
          code="SV5"
          title="Inner London"
          score={
            site.sv5_inner_london_score
          }
          explanation="Recognises the additional strategic context associated with constrained Inner London provision."
        />

        <FactorCard
          code="SV6"
          title="Deprivation"
          score={
            site.sv6_deprivation_score
          }
          explanation="Reflects the deprivation context associated with the site."
        />
      </div>

      {site.sv4_review_note && (
        <section style={sectionStyle}>
          <div style={sectionEyebrowStyle}>
            SV4 evidence note
          </div>

          <p style={bodyTextStyle}>
            {site.sv4_review_note}
          </p>
        </section>
      )}
    </>
  );
}

function RiskTab({
  site,
}: {
  site: SiteDetail;
}) {
  return (
    <>
      <section style={introPanelStyle}>
        <div>
          <div style={sectionEyebrowStyle}>
            Risk-led assessment
          </div>

          <h2 style={introTitleStyle}>
            What risk signals are present?
          </h2>

          <p style={introTextStyle}>
            Risk is assessed independently from
            strategic value. The final priority combines
            the two dimensions using the Phase 1.3
            risk-led category model.
          </p>
        </div>

        <div style={scoreHeroStyle}>
          <div style={scoreHeroLabelStyle}>
            Risk exposure
          </div>

          <div style={scoreHeroValueStyle}>
            {site.risk_exposure_score ??
              "N/A"}
          </div>

          <div style={scoreHeroBandStyle}>
            {site.risk_band ||
              "Not available"}
          </div>
        </div>
      </section>

      <div style={factorGridStyle}>
        <FactorCard
          code="RF1"
          title="Ownership exposure"
          score={
            site.rf1_ownership_exposure_score
          }
          explanation="Risk evidence associated with the site's current ownership type."
        />

        <FactorCard
          code="RF2"
          title="Management exposure"
          score={
            site.rf2_management_exposure_score
          }
          explanation="Risk evidence associated with the site's current management arrangement."
        />

        <FactorCard
          code="RF3"
          title="PPS at-risk evidence"
          score={
            site.rf3_pps_at_risk_score
          }
          explanation="Reflects relevant at-risk evidence available from Playing Pitch Strategy data."
        />

        <FactorCard
          code="RF6"
          title="Planning pressure"
          score={
            site.rf6_planning_pressure_score
          }
          explanation="Uses cautious site-linked planning-pressure evidence. Planning candidates alone do not automatically create an RF6 score."
        />
      </div>

      <section style={sectionStyle}>
        <div style={sectionHeaderStyle}>
          <div>
            <div style={sectionEyebrowStyle}>
              RF6
            </div>

            <h2 style={sectionTitleStyle}>
              Planning-pressure evidence
            </h2>
          </div>

          <RiskBadge
            value={
              site.risk_band ||
              "Not available"
            }
          />
        </div>

        <div style={metricGridStyle}>
          <MetricCard
            value={
              site.planning_candidate_application_count ??
              0
            }
            label="Applications identified for consideration"
          />

          <MetricCard
            value={
              site.confirmed_rf6_application_count ??
              0
            }
            label="Confirmed RF6 applications"
          />

          <MetricCard
            value={
              site.nearest_planning_candidate_distance_metres !==
              null
                ? `${site.nearest_planning_candidate_distance_metres} m`
                : "N/A"
            }
            label="Nearest candidate"
          />

          <MetricCard
            value={
              site.rf6_planning_pressure_score ??
              0
            }
            label="RF6 score"
          />
        </div>

        <PlanningInterpretation
          site={site}
        />

        {site.rf6_scoring_status && (
          <div style={evidenceBoxStyle}>
            <div style={evidenceLabelStyle}>
              RF6 assessment status
            </div>

            <div style={evidenceValueStyle}>
              {site.rf6_scoring_status}
            </div>

            {site.rf6_scoring_note && (
              <div style={evidenceNoteStyle}>
                {site.rf6_scoring_note}
              </div>
            )}
          </div>
        )}
      </section>
    </>
  );
}

function FacilitiesTab({
  site,
}: {
  site: SiteDetail;
}) {
  const totalRecordedProvision =
    numberValue(
      site.adult_football_rugby_pitch_units
    ) +
    numberValue(site.rugby_pitch_units) +
    numberValue(site.cricket_pitch_units) +
    numberValue(
      site.other_strategic_grass_pitch_units
    ) +
    numberValue(
      site.full_size_3g_pitch_units
    ) +
    numberValue(
      site.hockey_agp_pitch_units
    );

  return (
    <>
      <section style={introPanelStyle}>
        <div>
          <div style={sectionEyebrowStyle}>
            Playing field provision
          </div>

          <h2 style={introTitleStyle}>
            What provision is recorded at this
            site?
          </h2>

          <p style={introTextStyle}>
            The figures below show the provision
            used by the current strategic assessment.
            They are assessment inputs rather than a
            replacement for detailed facility or PPS
            records.
          </p>
        </div>

        <div style={scoreHeroStyle}>
          <div style={scoreHeroLabelStyle}>
            Recorded units
          </div>

          <div style={scoreHeroValueStyle}>
            {totalRecordedProvision}
          </div>

          <div style={scoreHeroBandStyle}>
            Assessment provision
          </div>
        </div>
      </section>

      <div style={facilityGridStyle}>
        <FacilityCard
          value={
            site.adult_football_rugby_pitch_units ??
            0
          }
          label="Adult football / rugby pitch units"
        />

        <FacilityCard
          value={
            site.rugby_pitch_units ?? 0
          }
          label="Rugby pitch units"
        />

        <FacilityCard
          value={
            site.cricket_pitch_units ?? 0
          }
          label="Cricket pitch units"
        />

        <FacilityCard
          value={
            site.other_strategic_grass_pitch_units ??
            0
          }
          label="Other strategic grass pitch units"
        />

        <FacilityCard
          value={
            site.full_size_3g_pitch_units ??
            0
          }
          label="Full-size 3G pitch units"
        />

        <FacilityCard
          value={
            site.hockey_agp_pitch_units ?? 0
          }
          label="Hockey AGP pitch units"
        />
      </div>

      <div style={twoColumnGridStyle}>
        <SectionCard
          eyebrow="Current evidence"
          title="Ownership & management"
        >
          <InfoRow
            label="Owner type"
            value={cleanValue(
              site.owner_type
            )}
          />

          <InfoRow
            label="Management type"
            value={cleanValue(
              site.management_type
            )}
          />
        </SectionCard>

        <SectionCard
          eyebrow="PPS evidence"
          title="Recorded context"
        >
          <InfoRow
            label="Ownership"
            value={
              site.pps_ownership_type
            }
          />

          <InfoRow
            label="Management"
            value={
              site.pps_management_type
            }
          />

          <InfoRow
            label="Security of tenure"
            value={
              site.pps_security_of_tenure
            }
          />

          <InfoRow
            label="Community use"
            value={
              site.pps_community_use_flag
            }
          />
        </SectionCard>
      </div>
    </>
  );
}

function EvidenceTab({
  site,
}: {
  site: SiteDetail;
}) {
  const possible3GIssue =
    site.possible_3g_data_quality_flag === 1 ||
    site.possible_3g_data_quality_flag === "1";

  return (
    <>
      <section style={introPanelStyle}>
        <div>
          <div style={sectionEyebrowStyle}>
            Evidence governance
          </div>

          <h2 style={introTitleStyle}>
            How complete is the evidence?
          </h2>

          <p style={introTextStyle}>
            This section makes review flags and
            evidence limitations visible so the
            assessment is not presented with false
            certainty.
          </p>
        </div>
      </section>

      <div style={twoColumnGridStyle}>
        <SectionCard
          eyebrow="Data quality"
          title="Completeness checks"
        >
          <QualityRow
            label="Missing IMD"
            value={site.missing_imd_flag}
          />

          <QualityRow
            label="Missing owner"
            value={site.missing_owner_flag}
          />

          <QualityRow
            label="Missing management"
            value={
              site.missing_management_flag
            }
          />

          <QualityRow
            label="Possible 3G data-quality issue"
            value={
              possible3GIssue
                ? "Yes"
                : "No"
            }
          />

          <QualityRow
            label="SV4 single recorded provision"
            value={
              site.sv4_single_recorded_provision_flag
            }
          />
        </SectionCard>

        <SectionCard
          eyebrow="Review"
          title="Assessment review"
        >
          <InfoRow
            label="Review reason"
            value={
              site.review_reason?.trim()
                ? site.review_reason
                : "No review reason recorded"
            }
          />

          <InfoRow
            label="Assessment scope"
            value={
              site.phase1_3_scope_tag
            }
          />
        </SectionCard>
      </div>

      <section style={sectionStyle}>
        <div style={sectionEyebrowStyle}>
          Assessment context
        </div>

        {site.phase1_3_source_note && (
          <div style={contextBlockStyle}>
            <h3 style={contextTitleStyle}>
              Source context
            </h3>

            <p style={bodyTextStyle}>
              {site.phase1_3_source_note}
            </p>
          </div>
        )}

        {site.phase1_3_methodology_note && (
          <div style={contextBlockStyle}>
            <h3 style={contextTitleStyle}>
              Methodology
            </h3>

            <p style={bodyTextStyle}>
              {site.phase1_3_methodology_note}
            </p>
          </div>
        )}

        {site.sv4_review_note && (
          <div style={contextBlockStyle}>
            <h3 style={contextTitleStyle}>
              SV4 review note
            </h3>

            <p style={bodyTextStyle}>
              {site.sv4_review_note}
            </p>
          </div>
        )}
      </section>
    </>
  );
}

function PlanningInterpretation({
  site,
}: {
  site: SiteDetail;
}) {
  const candidates =
    site.planning_candidate_application_count ??
    0;

  const confirmed =
    site.confirmed_rf6_application_count ??
    0;

  const rf6 =
    site.rf6_planning_pressure_score ?? 0;

  if (rf6 > 0) {
    return (
      <div style={planningAppliedStyle}>
        <div style={planningTitleStyle}>
          Planning pressure contributes to
          the RF6 assessment
        </div>

        <div style={planningTextStyle}>
          {confirmed > 0
            ? `${confirmed} application${
                confirmed === 1 ? "" : "s"
              } met the cautious RF6 evidence threshold. `
            : ""}
          The current RF6 planning-pressure
          score is {rf6}.
        </div>
      </div>
    );
  }

  if (candidates > 0) {
    return (
      <div style={planningReviewStyle}>
        <div style={planningTitleStyle}>
          Planning evidence identified for
          review
        </div>

        <div style={planningTextStyle}>
          {candidates} planning{" "}
          {candidates === 1
            ? "candidate has"
            : "candidates have"}{" "}
          been identified, but this evidence
          does not currently produce an RF6
          planning-pressure score.
        </div>
      </div>
    );
  }

  return (
    <div style={planningNeutralStyle}>
      <div style={planningTitleStyle}>
        No current planning-pressure signal
      </div>

      <div style={planningTextStyle}>
        No planning candidates are currently
        identified within the Phase 1.3
        evidence for this site.
      </div>
    </div>
  );
}

function ProvisionSummary({
  site,
}: {
  site: SiteDetail;
}) {
  return (
    <>
      <InfoRow
        label="Adult football / rugby"
        value={
          site.adult_football_rugby_pitch_units
        }
      />

      <InfoRow
        label="Rugby"
        value={site.rugby_pitch_units}
      />

      <InfoRow
        label="Cricket"
        value={site.cricket_pitch_units}
      />

      <InfoRow
        label="Other strategic grass"
        value={
          site.other_strategic_grass_pitch_units
        }
      />

      <InfoRow
        label="Full-size 3G"
        value={
          site.full_size_3g_pitch_units
        }
      />

      <InfoRow
        label="Hockey AGP"
        value={
          site.hockey_agp_pitch_units
        }
      />
    </>
  );
}

function HeroMetric({
  label,
  value,
  detail,
  type,
}: {
  label: string;
  value: string;
  detail?: string;
  type?: "risk";
}) {
  return (
    <div style={heroMetricStyle}>
      <div style={heroMetricLabelStyle}>
        {label}
      </div>

      <div style={heroMetricValueStyle}>
        {type === "risk" ? (
          <RiskBadge value={value} />
        ) : (
          value
        )}
      </div>

      {detail && (
        <div style={heroMetricDetailStyle}>
          {detail}
        </div>
      )}
    </div>
  );
}

function SectionCard({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section style={sectionStyle}>
      <div style={sectionEyebrowStyle}>
        {eyebrow}
      </div>

      <h2 style={sectionTitleStyle}>
        {title}
      </h2>

      {children}
    </section>
  );
}

function InfoRow({
  label,
  value,
}: {
  label: string;
  value:
    | string
    | number
    | null
    | undefined;
}) {
  const display =
    value === null ||
    value === undefined ||
    value === ""
      ? "Not available"
      : value;

  return (
    <div style={infoRowStyle}>
      <div style={infoLabelStyle}>
        {label}
      </div>

      <div style={infoValueStyle}>
        {display}
      </div>
    </div>
  );
}

function SignalRow({
  label,
  code,
  score,
}: {
  label: string;
  code: string;
  score: number | null;
}) {
  return (
    <div style={signalRowStyle}>
      <div>
        <div style={signalLabelStyle}>
          {label}
        </div>

        <div style={signalCodeStyle}>
          {code}
        </div>
      </div>

      <div style={signalScoreStyle}>
        {score ?? 0}
      </div>
    </div>
  );
}

function QualityRow({
  label,
  value,
}: {
  label: string;
  value: string | null;
}) {
  const issue =
    value?.toLowerCase() === "yes";

  return (
    <div style={infoRowStyle}>
      <div style={infoLabelStyle}>
        {label}
      </div>

      <span
        style={{
          ...qualityBadgeStyle,
          ...(issue
            ? qualityIssueStyle
            : qualityGoodStyle),
        }}
      >
        {value || "Not available"}
      </span>
    </div>
  );
}

function MetricCard({
  value,
  label,
}: {
  value: string | number;
  label: string;
}) {
  return (
    <div style={metricCardStyle}>
      <div style={metricValueStyle}>
        {value}
      </div>

      <div style={metricLabelStyle}>
        {label}
      </div>
    </div>
  );
}

function FactorCard({
  code,
  title,
  score,
  explanation,
}: {
  code: string;
  title: string;
  score: number | null;
  explanation: string;
}) {
  return (
    <div style={factorCardStyle}>
      <div style={factorTopStyle}>
        <span style={codeBadgeStyle}>
          {code}
        </span>

        <span style={factorScoreStyle}>
          {score ?? 0}
        </span>
      </div>

      <h3 style={factorTitleStyle}>
        {title}
      </h3>

      <p style={factorTextStyle}>
        {explanation}
      </p>
    </div>
  );
}

function FacilityCard({
  value,
  label,
}: {
  value: number;
  label: string;
}) {
  return (
    <div style={facilityCardStyle}>
      <div style={facilityValueStyle}>
        {value}
      </div>

      <div style={facilityLabelStyle}>
        {label}
      </div>
    </div>
  );
}

function PriorityBadge({
  value,
  large = false,
}: {
  value: string;
  large?: boolean;
}) {
  return (
    <span
      style={{
        ...badgeBaseStyle,
        ...(large
          ? largePriorityStyle
          : {}),
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

function getWhyThisSiteMatters(
  site: SiteDetail
) {
  const priority =
    site.priority_category ||
    "the current assessment";

  const strategic =
    site.strategic_value_band ||
    "unclassified";

  const risk =
    site.risk_band ||
    "unclassified";

  const rf6 =
    site.rf6_planning_pressure_score ??
    0;

  const confirmed =
    site.confirmed_rf6_application_count ??
    0;

  if (rf6 > 0 && confirmed > 0) {
    return `${formatSiteName(
      site.site_name
    )} is classified as ${priority}, with ${strategic.toLowerCase()} strategic value and ${risk.toLowerCase()} current risk. Planning-pressure evidence is contributing to the RF6 assessment: ${confirmed} application${
      confirmed === 1 ? "" : "s"
    } met the cautious RF6 evidence threshold, producing an RF6 score of ${rf6}.`;
  }

  if (rf6 > 0) {
    return `${formatSiteName(
      site.site_name
    )} is classified as ${priority}, with ${strategic.toLowerCase()} strategic value and ${risk.toLowerCase()} current risk. The current assessment includes an RF6 planning-pressure score of ${rf6}.`;
  }

  if (
    (site.planning_candidate_application_count ??
      0) > 0
  ) {
    return `${formatSiteName(
      site.site_name
    )} is classified as ${priority}, with ${strategic.toLowerCase()} strategic value and ${risk.toLowerCase()} current risk. Planning evidence has been identified for review, but it does not currently generate an RF6 planning-pressure score.`;
  }

  return `${formatSiteName(
    site.site_name
  )} is classified as ${priority}, with ${strategic.toLowerCase()} strategic value and ${risk.toLowerCase()} current risk. Its current classification is based on the wider strategic-value and risk evidence available within the Phase 1.3 assessment.`;
}

function getSummaryHeadline(
  site: SiteDetail
) {
  switch (site.priority_category) {
    case "Priority A":
      return "Highest current strategic attention";

    case "Priority B":
      return "Significant risk requiring active attention";

    case "Priority C":
      return "Strategically important with relevant risk exposure";

    case "Strategic Monitor":
      return "Strategically important and retained under observation";

    case "Risk Review":
      return "Risk evidence warrants further review";

    case "Monitor":
      return "Retained within the monitoring population";

    default:
      return "Current site assessment";
  }
}

function formatSiteName(
  value: string
) {
  if (!value) {
    return value;
  }

  return value
    .toLowerCase()
    .replace(/\b\w/g, (character) =>
      character.toUpperCase()
    );
}

function cleanValue(
  value: string | null
) {
  return value?.trim() || null;
}

function numberValue(
  value: number | null
) {
  return value ?? 0;
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
  maxWidth: "1380px",
  margin: "0 auto",
  padding: "34px 28px 80px",
};

const loadingStyle: React.CSSProperties = {
  padding: "70px 0",
  color: "#666",
};

const backRowStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "20px",
};

const backLinkStyle: React.CSSProperties = {
  color: "#333",
  textDecoration: "none",
  fontSize: "13px",
  fontWeight: 800,
};

const siteIdStyle: React.CSSProperties = {
  fontSize: "11px",
  color: "#888",
  fontWeight: 700,
};

const heroStyle: React.CSSProperties = {
  background: "#171717",
  color: "#fff",
  borderRadius: "22px",
  overflow: "hidden",
  marginBottom: "24px",
  boxShadow:
    "0 18px 50px rgba(20,20,20,0.12)",
};

const heroTopStyle: React.CSSProperties = {
  padding: "38px 42px 34px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: "35px",
};

const eyebrowStyle: React.CSSProperties = {
  color: "#ef5358",
  textTransform: "uppercase",
  letterSpacing: "0.09em",
  fontWeight: 850,
  fontSize: "11px",
  marginBottom: "11px",
};

const heroTitleStyle: React.CSSProperties = {
  fontSize: "clamp(34px, 5vw, 58px)",
  lineHeight: 0.99,
  letterSpacing: "-0.045em",
  margin: 0,
  maxWidth: "900px",
  fontWeight: 900,
};

const locationStyle: React.CSSProperties = {
  marginTop: "17px",
  color: "#bbb",
  fontSize: "15px",
};

const heroPriorityStyle: React.CSSProperties = {
  flexShrink: 0,
  textAlign: "right",
};

const priorityLabelStyle: React.CSSProperties = {
  textTransform: "uppercase",
  fontSize: "10px",
  letterSpacing: "0.08em",
  color: "#aaa",
  fontWeight: 800,
  marginBottom: "8px",
};

const heroMetricsStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(190px, 1fr))",
  borderTop: "1px solid #383838",
};

const heroMetricStyle: React.CSSProperties = {
  padding: "20px 24px",
  borderRight: "1px solid #383838",
  minHeight: "90px",
};

const heroMetricLabelStyle: React.CSSProperties = {
  color: "#999",
  fontSize: "10px",
  fontWeight: 800,
  textTransform: "uppercase",
  letterSpacing: "0.07em",
};

const heroMetricValueStyle: React.CSSProperties = {
  marginTop: "7px",
  fontSize: "18px",
  fontWeight: 850,
};

const heroMetricDetailStyle: React.CSSProperties = {
  color: "#aaa",
  fontSize: "11px",
  marginTop: "5px",
};

const workspaceStyle: React.CSSProperties = {
  background: "#fff",
  border: "1px solid #e1ddd8",
  borderRadius: "20px",
  overflow: "hidden",
  boxShadow:
    "0 10px 35px rgba(20,20,20,0.04)",
};

const tabScrollStyle: React.CSSProperties = {
  overflowX: "auto",
  borderBottom: "1px solid #e7e3de",
  background: "#faf9f7",
};

const tabsStyle: React.CSSProperties = {
  display: "flex",
  padding: "0 24px",
  minWidth: "max-content",
};

const tabStyle: React.CSSProperties = {
  background: "transparent",
  border: 0,
  borderBottom:
    "3px solid transparent",
  padding: "19px 16px 15px",
  fontSize: "13px",
  color: "#686868",
  fontWeight: 800,
  cursor: "pointer",
};

const activeTabStyle: React.CSSProperties = {
  borderBottomColor: "#e21b23",
  color: "#171717",
};

const tabContentStyle: React.CSSProperties = {
  padding: "30px",
};

const attentionPanelStyle: React.CSSProperties = {
  padding: "30px",
  background: "#f6f2ee",
  borderRadius: "16px",
  marginBottom: "22px",
  borderLeft: "5px solid #e21b23",
};

const attentionLabelStyle: React.CSSProperties = {
  color: "#e21b23",
  fontWeight: 850,
  fontSize: "11px",
  textTransform: "uppercase",
  letterSpacing: "0.08em",
};

const attentionTitleStyle: React.CSSProperties = {
  margin: "8px 0 10px",
  fontSize: "28px",
  letterSpacing: "-0.03em",
};

const attentionTextStyle: React.CSSProperties = {
  margin: 0,
  maxWidth: "980px",
  color: "#4d4d4d",
  lineHeight: 1.65,
  fontSize: "15px",
};

const twoColumnGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(350px, 1fr))",
  gap: "20px",
};

const sectionStyle: React.CSSProperties = {
  border: "1px solid #e3dfda",
  borderRadius: "15px",
  padding: "24px",
  marginBottom: "20px",
  background: "#fff",
};

const sectionHeaderStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: "20px",
  alignItems: "flex-start",
  marginBottom: "20px",
};

const sectionEyebrowStyle: React.CSSProperties = {
  color: "#e21b23",
  fontSize: "10px",
  fontWeight: 850,
  textTransform: "uppercase",
  letterSpacing: "0.08em",
};

const sectionTitleStyle: React.CSSProperties = {
  margin: "5px 0 17px",
  fontSize: "21px",
  letterSpacing: "-0.02em",
};

const infoRowStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "22px",
  padding: "11px 0",
  borderBottom: "1px solid #efedea",
};

const infoLabelStyle: React.CSSProperties = {
  color: "#666",
  fontSize: "13px",
};

const infoValueStyle: React.CSSProperties = {
  fontWeight: 750,
  fontSize: "13px",
  textAlign: "right",
};

const signalRowStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "12px 0",
  borderBottom: "1px solid #efedea",
};

const signalLabelStyle: React.CSSProperties = {
  fontWeight: 750,
  fontSize: "13px",
};

const signalCodeStyle: React.CSSProperties = {
  color: "#888",
  fontSize: "10px",
  marginTop: "3px",
};

const signalScoreStyle: React.CSSProperties = {
  width: "34px",
  height: "34px",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  borderRadius: "50%",
  background: "#f1efec",
  fontWeight: 900,
};

const metricGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(190px, 1fr))",
  gap: "12px",
  marginBottom: "18px",
};

const metricCardStyle: React.CSSProperties = {
  background: "#f7f5f2",
  border: "1px solid #ebe7e2",
  borderRadius: "12px",
  padding: "18px",
};

const metricValueStyle: React.CSSProperties = {
  fontSize: "28px",
  fontWeight: 900,
  letterSpacing: "-0.03em",
};

const metricLabelStyle: React.CSSProperties = {
  color: "#6c6c6c",
  fontSize: "11px",
  marginTop: "6px",
  lineHeight: 1.4,
};

const planningAppliedStyle: React.CSSProperties = {
  background: "#fff2e8",
  border: "1px solid #f0c7a5",
  padding: "16px",
  borderRadius: "11px",
};

const planningReviewStyle: React.CSSProperties = {
  background: "#fff8db",
  border: "1px solid #eedb8c",
  padding: "16px",
  borderRadius: "11px",
};

const planningNeutralStyle: React.CSSProperties = {
  background: "#edf3ef",
  border: "1px solid #cedcd2",
  padding: "16px",
  borderRadius: "11px",
};

const planningTitleStyle: React.CSSProperties = {
  fontWeight: 850,
  fontSize: "13px",
};

const planningTextStyle: React.CSSProperties = {
  marginTop: "5px",
  color: "#555",
  fontSize: "12px",
  lineHeight: 1.55,
};

const introPanelStyle: React.CSSProperties = {
  background: "#f6f3ef",
  padding: "28px",
  borderRadius: "15px",
  marginBottom: "22px",
  display: "flex",
  justifyContent: "space-between",
  gap: "30px",
  alignItems: "center",
};

const introTitleStyle: React.CSSProperties = {
  margin: "6px 0 8px",
  fontSize: "27px",
  letterSpacing: "-0.03em",
};

const introTextStyle: React.CSSProperties = {
  margin: 0,
  maxWidth: "750px",
  color: "#606060",
  fontSize: "14px",
  lineHeight: 1.6,
};

const scoreHeroStyle: React.CSSProperties = {
  flexShrink: 0,
  minWidth: "145px",
  textAlign: "center",
  padding: "18px",
  borderRadius: "13px",
  background: "#fff",
  border: "1px solid #e3dfda",
};

const scoreHeroLabelStyle: React.CSSProperties = {
  fontSize: "9px",
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  color: "#777",
  fontWeight: 850,
};

const scoreHeroValueStyle: React.CSSProperties = {
  fontSize: "38px",
  fontWeight: 900,
  marginTop: "3px",
};

const scoreHeroBandStyle: React.CSSProperties = {
  fontSize: "12px",
  fontWeight: 750,
  color: "#555",
};

const factorGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(270px, 1fr))",
  gap: "16px",
  marginBottom: "20px",
};

const factorCardStyle: React.CSSProperties = {
  border: "1px solid #e3dfda",
  borderRadius: "14px",
  padding: "20px",
  background: "#fff",
};

const factorTopStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
};

const codeBadgeStyle: React.CSSProperties = {
  background: "#f0ede9",
  borderRadius: "6px",
  padding: "5px 7px",
  fontSize: "10px",
  fontWeight: 850,
};

const factorScoreStyle: React.CSSProperties = {
  fontSize: "24px",
  fontWeight: 900,
};

const factorTitleStyle: React.CSSProperties = {
  fontSize: "16px",
  margin: "15px 0 6px",
};

const factorTextStyle: React.CSSProperties = {
  margin: 0,
  color: "#666",
  fontSize: "12px",
  lineHeight: 1.55,
};

const facilityGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(190px, 1fr))",
  gap: "14px",
  marginBottom: "22px",
};

const facilityCardStyle: React.CSSProperties = {
  border: "1px solid #e2ded9",
  borderRadius: "14px",
  padding: "22px",
  background: "#fff",
};

const facilityValueStyle: React.CSSProperties = {
  fontSize: "34px",
  fontWeight: 900,
};

const facilityLabelStyle: React.CSSProperties = {
  marginTop: "7px",
  color: "#666",
  fontSize: "12px",
  lineHeight: 1.45,
};

const evidenceBoxStyle: React.CSSProperties = {
  marginTop: "18px",
  padding: "17px",
  borderRadius: "11px",
  background: "#f6f4f1",
};

const evidenceLabelStyle: React.CSSProperties = {
  fontSize: "9px",
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  color: "#777",
  fontWeight: 850,
};

const evidenceValueStyle: React.CSSProperties = {
  marginTop: "5px",
  fontWeight: 850,
  fontSize: "14px",
};

const evidenceNoteStyle: React.CSSProperties = {
  color: "#666",
  fontSize: "12px",
  marginTop: "6px",
  lineHeight: 1.5,
};

const qualityBadgeStyle: React.CSSProperties = {
  borderRadius: "999px",
  padding: "5px 8px",
  fontSize: "10px",
  fontWeight: 850,
};

const qualityIssueStyle: React.CSSProperties = {
  background: "#ffe4e4",
  color: "#812222",
};

const qualityGoodStyle: React.CSSProperties = {
  background: "#e7f0ea",
  color: "#365746",
};

const contextBlockStyle: React.CSSProperties = {
  marginTop: "20px",
  maxWidth: "950px",
};

const contextTitleStyle: React.CSSProperties = {
  margin: "0 0 6px",
  fontSize: "14px",
};

const bodyTextStyle: React.CSSProperties = {
  color: "#606060",
  margin: 0,
  fontSize: "13px",
  lineHeight: 1.65,
};

const badgeBaseStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  borderRadius: "999px",
  padding: "6px 9px",
  fontSize: "11px",
  fontWeight: 850,
  whiteSpace: "nowrap",
};

const largePriorityStyle: React.CSSProperties = {
  fontSize: "14px",
  padding: "10px 15px",
};

const errorStyle: React.CSSProperties = {
  marginTop: "25px",
  padding: "18px",
  borderRadius: "12px",
  border: "1px solid #efb8bb",
  background: "#fff0f0",
  color: "#7d2025",
};
