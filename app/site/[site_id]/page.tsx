"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

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

export default function SiteDetailPage() {
  const params = useParams<{ site_id: string }>();
  const siteId = params.site_id;

  const [site, setSite] = useState<SiteDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadSite() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/sites/${siteId}`, {
          cache: "no-store",
        });

        const data: SiteApiResponse = await response.json();

        if (!response.ok || !data.success || !data.site) {
          throw new Error(data.error || "Unable to load site");
        }

        setSite(data.site);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Unable to load site"
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
      <main style={pageStyle}>
        <p>Loading site...</p>
      </main>
    );
  }

  if (error || !site) {
    return (
      <main style={pageStyle}>
        <a href="/sites" style={backLinkStyle}>
          ← Back to Explore Sites
        </a>

        <div style={errorStyle}>
          {error || "Site not found"}
        </div>
      </main>
    );
  }

  const planningEvidenceIdentified =
    (site.planning_candidate_application_count ?? 0) > 0;

  const planningEvidenceConfirmed =
    (site.confirmed_rf6_application_count ?? 0) > 0;

  return (
    <main style={pageStyle}>
      <a href="/sites" style={backLinkStyle}>
        ← Back to Explore Sites
      </a>

      <header style={{ marginTop: "24px", marginBottom: "32px" }}>
        <p style={eyebrowStyle}>
          London Early Warning System
        </p>

        <h1 style={titleStyle}>{site.site_name}</h1>

        <p style={subtitleStyle}>
          {site.borough}
          {site.postcode ? ` · ${site.postcode}` : ""}
          {site.playing_field_status
            ? ` · ${site.playing_field_status}`
            : ""}
        </p>

        <div style={summaryGridStyle}>
          <SummaryCard
            label="Priority"
            value={site.priority_category || "Not available"}
          />

          <SummaryCard
            label="Risk"
            value={site.risk_band || "Not available"}
            detail={
              site.risk_exposure_score !== null
                ? `Score ${site.risk_exposure_score}`
                : undefined
            }
          />

          <SummaryCard
            label="Strategic value"
            value={site.strategic_value_band || "Not available"}
            detail={
              site.strategic_value_score !== null
                ? `Score ${site.strategic_value_score}`
                : undefined
            }
          />

          <SummaryCard
            label="Scope"
            value={site.phase1_3_scope_tag || "Current site"}
          />
        </div>
      </header>

      <section style={sectionStyle}>
        <h2 style={sectionTitleStyle}>Current assessment</h2>

        <p style={bodyStyle}>
          This site is currently classified as{" "}
          <strong>{site.priority_category || "unclassified"}</strong>.
          Its strategic value is{" "}
          <strong>
            {site.strategic_value_band || "not available"}
          </strong>
          {site.strategic_value_score !== null
            ? ` with a score of ${site.strategic_value_score}`
            : ""}
          , while its current risk band is{" "}
          <strong>{site.risk_band || "not available"}</strong>
          {site.risk_exposure_score !== null
            ? ` with a score of ${site.risk_exposure_score}`
            : ""}
          .
        </p>

        {planningEvidenceConfirmed && (
          <div style={noticeStyle}>
            Confirmed planning-pressure evidence contributes to the
            current assessment.
          </div>
        )}

        {!planningEvidenceConfirmed &&
          planningEvidenceIdentified && (
            <div style={neutralNoticeStyle}>
              Planning evidence has been identified for review, but
              it is not currently confirmed as contributing to the
              RF6 score.
            </div>
          )}
      </section>

      <section style={twoColumnGridStyle}>
        <div style={sectionStyle}>
          <h2 style={sectionTitleStyle}>Strategic importance</h2>

          <DataRow
            label="SV1 Multi-pitch scale"
            value={site.sv1_multi_pitch_scale_score}
          />
          <DataRow
            label="SV2 Full-size 3G"
            value={site.sv2_full_size_3g_score}
          />
          <DataRow
            label="SV3 Strategic sport"
            value={site.sv3_strategic_sport_score}
          />
          <DataRow
            label="SV4 Borough provision"
            value={site.sv4_share_of_borough_provision_score}
          />
          <DataRow
            label="SV5 Inner London"
            value={site.sv5_inner_london_score}
          />
          <DataRow
            label="SV6 Deprivation"
            value={site.sv6_deprivation_score}
          />
        </div>

        <div style={sectionStyle}>
          <h2 style={sectionTitleStyle}>Risk exposure</h2>

          <DataRow
            label="RF1 Ownership exposure"
            value={site.rf1_ownership_exposure_score}
          />
          <DataRow
            label="RF2 Management exposure"
            value={site.rf2_management_exposure_score}
          />
          <DataRow
            label="RF3 PPS at-risk evidence"
            value={site.rf3_pps_at_risk_score}
          />
          <DataRow
            label="RF6 Planning pressure"
            value={site.rf6_planning_pressure_score}
          />
        </div>
      </section>

      <section style={sectionStyle}>
        <h2 style={sectionTitleStyle}>Planning pressure</h2>

        <div style={threeColumnGridStyle}>
          <MetricBox
            label="Planning candidates"
            value={
              site.planning_candidate_application_count ?? 0
            }
          />

          <MetricBox
            label="Confirmed RF6 applications"
            value={site.confirmed_rf6_application_count ?? 0}
          />

          <MetricBox
            label="Nearest candidate"
            value={
              site.nearest_planning_candidate_distance_metres !==
              null
                ? `${site.nearest_planning_candidate_distance_metres} m`
                : "Not available"
            }
          />
        </div>

        {site.rf6_scoring_status && (
          <div style={{ marginTop: "20px" }}>
            <DataRow
              label="RF6 status"
              value={site.rf6_scoring_status}
            />
          </div>
        )}

        {site.rf6_scoring_note && (
          <p style={bodyStyle}>{site.rf6_scoring_note}</p>
        )}
      </section>

      <section style={twoColumnGridStyle}>
        <div style={sectionStyle}>
          <h2 style={sectionTitleStyle}>
            Playing field provision
          </h2>

          <DataRow
            label="Adult football / rugby units"
            value={site.adult_football_rugby_pitch_units}
          />
          <DataRow
            label="Rugby units"
            value={site.rugby_pitch_units}
          />
          <DataRow
            label="Cricket units"
            value={site.cricket_pitch_units}
          />
          <DataRow
            label="Other strategic grass pitches"
            value={site.other_strategic_grass_pitch_units}
          />
          <DataRow
            label="Full-size 3G pitches"
            value={site.full_size_3g_pitch_units}
          />
          <DataRow
            label="Hockey AGP pitches"
            value={site.hockey_agp_pitch_units}
          />
        </div>

        <div style={sectionStyle}>
          <h2 style={sectionTitleStyle}>
            Ownership and management
          </h2>

          <DataRow
            label="Current owner type"
            value={site.owner_type}
          />
          <DataRow
            label="Current management type"
            value={site.management_type}
          />
          <DataRow
            label="PPS ownership type"
            value={site.pps_ownership_type}
          />
          <DataRow
            label="PPS management type"
            value={site.pps_management_type}
          />
          <DataRow
            label="PPS security of tenure"
            value={site.pps_security_of_tenure}
          />
          <DataRow
            label="PPS community use"
            value={site.pps_community_use_flag}
          />
          <DataRow
            label="PPS critical site"
            value={site.pps_critical_site_flag}
          />
        </div>
      </section>

      <section style={sectionStyle}>
        <h2 style={sectionTitleStyle}>
          Review and data quality
        </h2>

        <div style={twoColumnGridStyle}>
          <div>
            <DataRow
              label="Possible 3G data quality issue"
              value={
                site.possible_3g_data_quality_flag === 1 ||
                site.possible_3g_data_quality_flag === "1"
                  ? "Yes"
                  : "No"
              }
            />
            <DataRow
              label="SV4 single recorded provision"
              value={site.sv4_single_recorded_provision_flag}
            />
            <DataRow
              label="Missing IMD"
              value={site.missing_imd_flag}
            />
          </div>

          <div>
            <DataRow
              label="Missing owner"
              value={site.missing_owner_flag}
            />
            <DataRow
              label="Missing management"
              value={site.missing_management_flag}
            />
            <DataRow
              label="Review reason"
              value={
                site.review_reason?.trim()
                  ? site.review_reason
                  : "No review reason recorded"
              }
            />
          </div>
        </div>

        {site.sv4_review_note && (
          <p style={bodyStyle}>{site.sv4_review_note}</p>
        )}
      </section>

      <section style={sectionStyle}>
        <h2 style={sectionTitleStyle}>
          Assessment context
        </h2>

        {site.phase1_3_source_note && (
          <>
            <h3 style={subheadingStyle}>Source context</h3>
            <p style={bodyStyle}>
              {site.phase1_3_source_note}
            </p>
          </>
        )}

        {site.phase1_3_methodology_note && (
          <>
            <h3 style={subheadingStyle}>Methodology</h3>
            <p style={bodyStyle}>
              {site.phase1_3_methodology_note}
            </p>
          </>
        )}
      </section>
    </main>
  );
}

function SummaryCard({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail?: string;
}) {
  return (
    <div style={summaryCardStyle}>
      <div style={cardLabelStyle}>{label}</div>
      <div style={cardValueStyle}>{value}</div>
      {detail && (
        <div style={cardDetailStyle}>{detail}</div>
      )}
    </div>
  );
}

function MetricBox({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div style={metricStyle}>
      <div style={cardLabelStyle}>{label}</div>
      <div style={metricValueStyle}>{value}</div>
    </div>
  );
}

function DataRow({
  label,
  value,
}: {
  label: string;
  value: string | number | null | undefined;
}) {
  const displayValue =
    value === null ||
    value === undefined ||
    value === ""
      ? "Not available"
      : value;

  return (
    <div style={dataRowStyle}>
      <span style={dataLabelStyle}>{label}</span>
      <span style={dataValueStyle}>
        {displayValue}
      </span>
    </div>
  );
}

const pageStyle: React.CSSProperties = {
  maxWidth: "1200px",
  margin: "0 auto",
  padding: "40px 24px 80px",
  fontFamily: "Arial, sans-serif",
};

const backLinkStyle: React.CSSProperties = {
  color: "#333",
  textDecoration: "none",
  fontWeight: 700,
  fontSize: "14px",
};

const eyebrowStyle: React.CSSProperties = {
  margin: 0,
  fontSize: "13px",
  fontWeight: 700,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: "#666",
};

const titleStyle: React.CSSProperties = {
  margin: "8px 0 8px",
  fontSize: "42px",
  lineHeight: 1.1,
};

const subtitleStyle: React.CSSProperties = {
  margin: 0,
  color: "#666",
  fontSize: "16px",
};

const summaryGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(190px, 1fr))",
  gap: "14px",
  marginTop: "26px",
};

const summaryCardStyle: React.CSSProperties = {
  border: "1px solid #ddd",
  borderRadius: "12px",
  padding: "18px",
  background: "#fafafa",
};

const cardLabelStyle: React.CSSProperties = {
  color: "#666",
  fontSize: "12px",
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.05em",
};

const cardValueStyle: React.CSSProperties = {
  marginTop: "8px",
  fontSize: "22px",
  fontWeight: 700,
};

const cardDetailStyle: React.CSSProperties = {
  marginTop: "4px",
  color: "#666",
  fontSize: "13px",
};

const sectionStyle: React.CSSProperties = {
  border: "1px solid #ddd",
  borderRadius: "12px",
  padding: "24px",
  marginBottom: "20px",
  background: "#fff",
};

const sectionTitleStyle: React.CSSProperties = {
  margin: "0 0 18px",
  fontSize: "22px",
};

const subheadingStyle: React.CSSProperties = {
  fontSize: "15px",
  marginTop: "20px",
  marginBottom: "6px",
};

const bodyStyle: React.CSSProperties = {
  color: "#444",
  lineHeight: 1.65,
  fontSize: "15px",
};

const twoColumnGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(320px, 1fr))",
  gap: "20px",
};

const threeColumnGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(180px, 1fr))",
  gap: "12px",
};

const dataRowStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: "20px",
  padding: "10px 0",
  borderBottom: "1px solid #eee",
};

const dataLabelStyle: React.CSSProperties = {
  color: "#666",
  fontSize: "14px",
};

const dataValueStyle: React.CSSProperties = {
  fontWeight: 600,
  textAlign: "right",
  fontSize: "14px",
};

const metricStyle: React.CSSProperties = {
  padding: "16px",
  border: "1px solid #ddd",
  borderRadius: "10px",
  background: "#fafafa",
};

const metricValueStyle: React.CSSProperties = {
  marginTop: "8px",
  fontWeight: 700,
  fontSize: "24px",
};

const noticeStyle: React.CSSProperties = {
  marginTop: "18px",
  padding: "14px 16px",
  border: "1px solid #999",
  borderRadius: "8px",
  fontWeight: 600,
};

const neutralNoticeStyle: React.CSSProperties = {
  marginTop: "18px",
  padding: "14px 16px",
  border: "1px solid #ccc",
  borderRadius: "8px",
  color: "#555",
};

const errorStyle: React.CSSProperties = {
  marginTop: "24px",
  border: "1px solid #d66",
  padding: "18px",
  borderRadius: "8px",
};
