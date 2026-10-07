"use client";

import { useEffect, useMemo, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import AppShell from "../../../components/AppShell";

type TabKey =
  | "summary"
  | "risk"
  | "strategic"
  | "facilities"
  | "evidence";

type NumericValue = number | string | null;
type FlagValue = string | number | boolean | null;

type SiteDetail = {
  site_id: string | number | null;
  site_name: string | null;
  postcode: string | null;
  borough: string | null;
  latitude: NumericValue;
  longitude: NumericValue;

  playing_field_status: string | null;
  priority_category: string | null;
  priority_sort_order: NumericValue;

  strategic_value_score: NumericValue;
  strategic_value_band: string | null;
  risk_exposure_score: NumericValue;
  risk_band: string | null;
  risk_band_sort_order: NumericValue;

  sv1_multi_pitch_scale_score: NumericValue;
  sv2_full_size_3g_score: NumericValue;
  sv3_strategic_sport_score: NumericValue;
  sv4_share_of_borough_provision_score: NumericValue;
  sv4_basis_category: string | null;
  sv4_highest_valid_borough_share: NumericValue;
  sv4_basis_borough_units: NumericValue;
  sv5_inner_london_score: NumericValue;
  sv6_deprivation_score: NumericValue;
  imd_decile: NumericValue;

  adult_football_rugby_pitch_units: NumericValue;
  rugby_pitch_units: NumericValue;
  cricket_pitch_units: NumericValue;
  other_strategic_grass_pitch_units: NumericValue;
  full_size_3g_pitch_units: NumericValue;
  hockey_agp_pitch_units: NumericValue;

  owner_type: string | null;
  management_type: string | null;

  rf1_ownership_exposure_score: NumericValue;
  rf2_management_exposure_score: NumericValue;
  rf3_pps_at_risk_score: NumericValue;
  rf6_planning_pressure_score: NumericValue;

  pps_critical_site_flag: FlagValue;
  pps_community_use_flag: FlagValue;
  pps_security_of_tenure: string | null;
  pps_ownership_type: string | null;
  pps_management_type: string | null;

  planning_candidate_application_count: NumericValue;
  confirmed_rf6_application_count: NumericValue;
  nearest_planning_candidate_distance_metres: NumericValue;

  planning_review_required?: FlagValue;

  rf6_scoring_status: string | null;
  rf6_scoring_note: string | null;
  review_reason: string | null;

  possible_3g_data_quality_flag: FlagValue;
  sv4_single_recorded_provision_flag: FlagValue;
  sv4_review_note: string | null;
  missing_imd_flag: FlagValue;
  missing_owner_flag: FlagValue;
  missing_management_flag: FlagValue;

  phase1_3_scope_tag: string | null;
  phase1_3_source_note: string | null;
  phase1_3_methodology_note: string | null;
};

type Issue = {
  title: string;
  text: string;
};

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

const BLACK = "#171717";
const ACTIVE_PLACES_BASE_URL =
  "https://experience.arcgis.com/experience/8f02fc06a2f24a7e834b13209b38aa22/";
const RED = "#e21b23";
const BORDER = "#e2ded9";
const MUTED = "#6d6d6d";

const pageStyle: CSSProperties = {
  maxWidth: 1440,
  margin: "0 auto",
  padding: "28px 28px 80px",
};

const cardStyle: CSSProperties = {
  padding: 19,
  background: "#ffffff",
  border: `1px solid ${BORDER}`,
  borderRadius: 14,
};

const gridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(min(100%, 250px), 1fr))",
  gap: 13,
};

const sectionStyle: CSSProperties = {
  marginBottom: 42,
};

const eyebrowStyle: CSSProperties = {
  color: RED,
  fontSize: 10,
  fontWeight: 900,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
};

const linkStyle: CSSProperties = {
  color: BLACK,
  textDecoration: "none",
  fontWeight: 850,
  fontSize: 11,
};

const darkBandStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  flexWrap: "wrap",
  gap: 20,
  padding: 20,
  marginBottom: 14,
  background: BLACK,
  color: "#ffffff",
  borderRadius: 14,
};

// ---------------------------------------------------------
// SAFE DATA HELPERS
// ---------------------------------------------------------

function isYes(value: unknown): boolean {
  if (value === null || value === undefined) {
    return false;
  }

  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "number") {
    return value === 1;
  }

  if (typeof value === "string") {
    const normalised = value.trim().toLowerCase();

    return (
      normalised === "yes" ||
      normalised === "true" ||
      normalised === "1"
    );
  }

  return false;
}

function activePlacesUrl(siteId: string | number | null | undefined) {
  if (siteId === null || siteId === undefined) return null;
  const value = String(siteId).trim();
  if (!/^\d+$/.test(value)) return null;
  return `${ACTIVE_PLACES_BASE_URL}?siteid=${encodeURIComponent(value)}`;
}

function safeText(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }

  if (typeof value === "string") {
    return value.trim();
  }

  if (
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return String(value);
  }

  return "";
}

function displayText(value: unknown): string {
  const text = safeText(value);

  return text || "Not recorded";
}

function numericValue(value: unknown): number | null {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  if (typeof value === "boolean") {
    return null;
  }

  const result = Number(value);

  return Number.isFinite(result) ? result : null;
}

function numericOrZero(value: unknown): number {
  return numericValue(value) ?? 0;
}

function formatNumber(value: unknown): string {
  const number = numericValue(value);

  if (number === null) {
    return "Not recorded";
  }

  return number.toLocaleString("en-GB");
}

function formatDistance(value: unknown): string {
  const metres = numericValue(value);

  if (metres === null) {
    return "Not recorded";
  }

  if (metres < 1000) {
    return `${Math.round(metres)} m`;
  }

  return `${(metres / 1000).toFixed(1)} km`;
}

function normaliseSiteResponse(raw: unknown): SiteDetail | null {
  if (!raw || typeof raw !== "object") {
    return null;
  }

  const response = raw as {
    success?: boolean;
    site?: unknown;
    data?: unknown;
    site_id?: unknown;
  };

  if (response.success === false) {
    return null;
  }

  const candidates = [
    response.site,
    response.data,
    raw,
  ];

  for (const candidate of candidates) {
    if (
      candidate &&
      typeof candidate === "object" &&
      "site_id" in candidate &&
      candidate.site_id !== null &&
      candidate.site_id !== undefined
    ) {
      return candidate as SiteDetail;
    }
  }

  return null;
}

// ---------------------------------------------------------
// PLANNING EVIDENCE
// ---------------------------------------------------------

function getPlanningState(site: SiteDetail): PlanningState {
  const score = numericOrZero(
    site.rf6_planning_pressure_score
  );

  const confirmed = numericOrZero(
    site.confirmed_rf6_application_count
  );

  const candidates = numericOrZero(
    site.planning_candidate_application_count
  );

  const status = safeText(
    site.rf6_scoring_status
  ).toLowerCase();

  const contributed =
    score > 0 ||
    confirmed > 0 ||
    status.includes("score applied");

  const reviewOnly =
    candidates > 0 ||
    isYes(site.planning_review_required) ||
    status.includes("manual review");

  if (contributed) {
    return {
      shortLabel: "Contributes",
      label:
        "Planning evidence contributes to Planning Pressure",
      description:
        "Site-linked planning evidence has met the applicable assessment rules and contributes to this site's Risk Exposure. This is an early-warning signal, not confirmation that the site will be lost or developed.",
      supporting:
        confirmed > 0
          ? `${confirmed} contributing ${
              confirmed === 1
                ? "application"
                : "applications"
            }`
          : undefined,
      background: "#f9ecec",
      border: "#edcccc",
      badge: "#f3d8da",
      text: "#812329",
    };
  }

  if (reviewOnly) {
    return {
      shortLabel: "Review only",
      label:
        "Planning evidence retained for review",
      description:
        "Potentially relevant planning evidence has been identified, but it does not currently contribute directly to the Planning Pressure assessment.",
      supporting:
        candidates > 0
          ? `${candidates} candidate ${
              candidates === 1
                ? "application"
                : "applications"
            } identified`
          : undefined,
      background: "#fff8e3",
      border: "#eadfb7",
      badge: "#f5ecc8",
      text: "#6b591a",
    };
  }

  return {
    shortLabel: "None identified",
    label: "No current planning evidence identified",
    description:
      "No planning evidence is currently identified as contributing to, or being retained for review within, this site's Planning Pressure assessment. This does not establish the absence of all planning activity.",
    background: "#f4f2ef",
    border: "#dfdbd6",
    badge: "#e9e6e2",
    text: "#555555",
  };
}

// ---------------------------------------------------------
// QUALITY AND ASSESSMENT HELPERS
// ---------------------------------------------------------

function getQualityIssues(site: SiteDetail): Issue[] {
  const issues: Issue[] = [];

  if (isYes(site.missing_owner_flag)) {
    issues.push({
      title: "Ownership information missing",
      text:
        "Current ownership information is not available in the assessment data.",
    });
  }

  if (isYes(site.missing_management_flag)) {
    issues.push({
      title: "Management information missing",
      text:
        "Current management information is not available in the assessment data.",
    });
  }

  if (isYes(site.missing_imd_flag)) {
    issues.push({
      title: "Deprivation evidence missing",
      text:
        "The deprivation element could not be fully populated from available evidence.",
    });
  }

  if (isYes(site.possible_3g_data_quality_flag)) {
    issues.push({
      title: "3G facility information requires review",
      text:
        "Recorded full-size 3G provision may require an additional data-quality check.",
    });
  }

  if (isYes(site.sv4_single_recorded_provision_flag)) {
    issues.push({
      title: "Single recorded provider site",
      text:
        "This site is flagged as the only recorded provider of its assessed provision category in the borough. The finding is limited to the available assessment records and is not, by itself, a data-quality failure.",
    });
  }

  if (safeText(site.review_reason)) {
    issues.push({
      title: "Additional manual review",
      text:
        "An additional review reason is recorded for this site. Further evidence checking may be required.",
    });
  }

  return issues;
}

function getOutcomeDescription(priority: string | null) {
  switch (priority) {
    case "Priority A":
      return "High Risk Exposure combined with high or medium Strategic Value.";

    case "Priority B":
      return "High Risk Exposure with low or not-flagged Strategic Value.";

    case "Priority C":
      return "Medium Risk Exposure combined with high or medium Strategic Value.";

    case "Risk Review":
      return "Medium Risk Exposure with low or not-flagged Strategic Value. The site remains in the review category.";

    case "Strategic Monitor":
      return "High Strategic Value with low or no current risk signal.";

    case "Monitor":
      return "The site remains in the assessed population without a current priority or review outcome.";

    default:
      return "The outcome is determined by combining Risk Exposure and Strategic Value.";
  }
}

function getKnownRiskEvidence(site: SiteDetail): string {
  if (numericOrZero(site.rf3_pps_at_risk_score) > 0) {
    return "KKP/PPS at-risk designation recorded — contributes to Risk Exposure";
  }

  return "No KKP/PPS at-risk contribution recorded in this assessment";
}

function getMultiPitchEvidence(site: SiteDetail): string {
  const count = numericValue(
    site.adult_football_rugby_pitch_units
  );

  if (count === null) {
    return "Pitch units not recorded";
  }

  return `${formatNumber(count)} adult or senior football/rugby pitch ${
    count === 1 ? "unit" : "units"
  }`;
}

function getStrategicSportEvidence(site: SiteDetail): string {
  const parts: string[] = [];

  const rugby = numericOrZero(site.rugby_pitch_units);
  const cricket = numericOrZero(site.cricket_pitch_units);
  const hockey = numericOrZero(site.hockey_agp_pitch_units);
  const other = numericOrZero(
    site.other_strategic_grass_pitch_units
  );

  if (rugby > 0) {
    parts.push(`${rugby} rugby`);
  }

  if (cricket > 0) {
    parts.push(`${cricket} cricket`);
  }

  if (hockey > 0) {
    parts.push(`${hockey} hockey`);
  }

  if (other > 0) {
    parts.push(`${other} other strategic grass`);
  }

  return parts.length
    ? parts.join(" · ")
    : "No strategic sport pitch units recorded";
}

// ---------------------------------------------------------
// SHARED PRESENTATION COMPONENTS
// ---------------------------------------------------------

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
    <div
      style={{
        display: "grid",
        gridTemplateColumns:
          "repeat(auto-fit, minmax(min(100%, 300px), 1fr))",
        alignItems: "end",
        gap: 28,
        marginBottom: 19,
      }}
    >
      <div>
        <div style={eyebrowStyle}>{eyebrow}</div>

        <h2
          style={{
            margin: "6px 0 0",
            fontSize: 29,
            lineHeight: 1.15,
            letterSpacing: "-0.035em",
          }}
        >
          {title}
        </h2>
      </div>

      <p
        style={{
          margin: 0,
          color: MUTED,
          fontSize: 12,
          lineHeight: 1.65,
        }}
      >
        {description}
      </p>
    </div>
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
    <article style={cardStyle}>
      <div
        style={{
          color: "#858585",
          fontSize: 9,
          fontWeight: 850,
          textTransform: "uppercase",
        }}
      >
        {title}
      </div>

      <div
        style={{
          marginTop: 6,
          fontSize: 15,
          fontWeight: 850,
          overflowWrap: "anywhere",
        }}
      >
        {value}
      </div>

      <p
        style={{
          margin: "8px 0 0",
          color: MUTED,
          fontSize: 11,
          lineHeight: 1.5,
        }}
      >
        {text}
      </p>
    </article>
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
    <div
      style={{
        padding: 14,
        background: "#242424",
        borderRadius: 10,
        minWidth: 0,
      }}
    >
      <div
        style={{
          color: "#aaa",
          fontSize: 9,
          fontWeight: 850,
          textTransform: "uppercase",
        }}
      >
        {label}
      </div>

      <div
        style={{
          marginTop: 5,
          fontSize: 15,
          fontWeight: 850,
        }}
      >
        {value}
      </div>

      {supporting && (
        <div
          style={{
            marginTop: 4,
            fontSize: 10,
            color: "#bbb",
          }}
        >
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
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      style={{
        padding: "11px 15px",
        border: 0,
        borderRadius: 9,
        background: active ? BLACK : "transparent",
        color: active ? "#ffffff" : "#555555",
        cursor: "pointer",
        fontSize: 11,
        fontWeight: 850,
      }}
    >
      {children}
    </button>
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
  score: NumericValue;
  maxScore: number;
  evidence: string;
  description: string;
}) {
  const actualScore = numericValue(score);

  return (
    <article style={cardStyle}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 10,
        }}
      >
        <h3
          style={{
            margin: 0,
            fontSize: 15,
            lineHeight: 1.3,
          }}
        >
          {title}
        </h3>

        <span
          style={{
            padding: "5px 8px",
            borderRadius: 100,
            background: "#f0ede9",
            color: "#555",
            fontSize: 10,
            fontWeight: 850,
            whiteSpace: "nowrap",
          }}
        >
          {actualScore ?? "—"} / {maxScore}
        </span>
      </div>

      <div
        style={{
          marginTop: 13,
          fontSize: 12,
          fontWeight: 850,
        }}
      >
        {evidence}
      </div>

      <p
        style={{
          margin: "8px 0 0",
          fontSize: 11,
          lineHeight: 1.6,
          color: MUTED,
        }}
      >
        {description}
      </p>
    </article>
  );
}

function BoroughShareCriterion({ site }: { site: SiteDetail }) {
  const share = numericValue(site.sv4_highest_valid_borough_share);
  const units = numericValue(site.sv4_basis_borough_units);
  const category = safeText(site.sv4_basis_category);
  const singleProvider = isYes(site.sv4_single_recorded_provision_flag);
  const sourceNote = safeText(site.sv4_review_note);
  const validShare = share !== null && share >= 0 && share <= 1;
  const displayedShare = validShare && share !== null
    ? `${(share * 100).toLocaleString("en-GB", {
        maximumFractionDigits: 2,
      })}%`
    : "Not recorded";

  return (
    <article style={{ ...cardStyle, gridColumn: "1 / -1" }}>
      <div style={{
        display: "flex", justifyContent: "space-between",
        gap: 12, alignItems: "flex-start", flexWrap: "wrap",
      }}>
        <div>
          <h3 style={{ margin: 0, fontSize: 15 }}>Share of borough provision</h3>
          <p style={{ margin: "6px 0 0", color: MUTED, fontSize: 11, lineHeight: 1.6 }}>
            Share of equivalent recorded provision in the borough, for the category used in this assessment.
          </p>
        </div>
        <span style={{
          background: "#f0ede9", color: "#555", borderRadius: 100,
          padding: "6px 10px", fontSize: 10, fontWeight: 850,
        }}>
          {numericValue(site.sv4_share_of_borough_provision_score) ?? "—"} / 3
        </span>
      </div>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 170px), 1fr))",
        gap: 12, marginTop: 17,
      }}>
        <InfoCard
          title="Provision category"
          value={category || "Not recorded"}
          text="Category used for the borough-share comparison."
        />
        <InfoCard
          title="Recorded borough share"
          value={displayedShare}
          text="Share of the borough's recorded provision in this category."
        />
        <InfoCard
          title="Borough provision"
          value={units === null ? "Not recorded" : `${formatNumber(units)} ${units === 1 ? "unit" : "units"}`}
          text="Total recorded borough units in the selected category, not the number of provider sites."
        />
        <InfoCard
          title="Provider-site status"
          value={singleProvider ? "Only recorded provider" : "Not flagged as sole provider"}
          text="Based on available recorded sites within the borough."
        />
      </div>

      {singleProvider && (
        <div style={{
          marginTop: 13, padding: "13px 15px", borderRadius: 10,
          background: "#fff8e3", border: "1px solid #eadfb7",
          color: "#66551f", fontSize: 11, lineHeight: 1.65,
        }}>
          <strong>Recorded provision note. </strong>
          {sourceNote || `This site is flagged as the only recorded provider for ${category || "the assessed category"} in the borough.`}
          {" "}This reflects the assessment dataset, not independent confirmation that no other provision exists.
        </div>
      )}
      {!singleProvider && sourceNote && (
        <p style={{ color: MUTED, fontSize: 11, lineHeight: 1.6, margin: "13px 0 0" }}>
          <strong>Assessment note:</strong> {sourceNote}
        </p>
      )}
      <p style={{ color: MUTED, fontSize: 10, lineHeight: 1.6, margin: "14px 0 0" }}>
        Recorded borough share is category-specific and does not represent a share of all sports facilities.
        A single recorded provider site may account for multiple provision units.
      </p>
    </article>
  );
}

function MetricBox({
  label,
  value,
  description,
}: {
  label: string;
  value: string | number;
  description?: string;
}) {
  return (
    <div
      style={{
        padding: 14,
        background: "rgba(255,255,255,0.8)",
        borderRadius: 10,
      }}
    >
      <div
        style={{
          fontSize: 10,
          color: MUTED,
          fontWeight: 750,
        }}
      >
        {label}
      </div>

      <div
        style={{
          marginTop: 6,
          fontSize: 24,
          fontWeight: 900,
        }}
      >
        {value}
      </div>
      {description && (
        <p style={{ margin: "8px 0 0", color: MUTED, fontSize: 11, lineHeight: 1.55 }}>
          {description}
        </p>
      )}
    </div>
  );
}

function IssueCard({ issue }: { issue: Issue }) {
  return (
    <article
      style={{
        padding: 19,
        border: "1px solid #eadfb7",
        background: "#fff8e3",
        borderRadius: 13,
      }}
    >
      <div
        style={{
          color: "#8b7118",
          fontSize: 9,
          fontWeight: 900,
          textTransform: "uppercase",
        }}
      >
        Review
      </div>

      <h3
        style={{
          fontSize: 14,
          margin: "7px 0",
        }}
      >
        {issue.title}
      </h3>

      <p
        style={{
          color: "#675b28",
          fontSize: 11,
          lineHeight: 1.55,
          margin: 0,
        }}
      >
        {issue.text}
      </p>
    </article>
  );
}

function MethodologyCallout() {
  return (
    <section
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: 20,
        padding: 24,
        marginBottom: 40,
        color: "#ffffff",
        background: BLACK,
        borderRadius: 15,
      }}
    >
      <div>
        <div
          style={{
            color: "#ef555b",
            fontSize: 9,
            fontWeight: 900,
            textTransform: "uppercase",
          }}
        >
          Methodology
        </div>

        <h3
          style={{
            fontSize: 17,
            margin: "6px 0 0",
          }}
        >
          How are these scores and outcomes determined?
        </h3>
      </div>

      <Link
        href="/about#assessment"
        style={{
          padding: "12px 16px",
          color: BLACK,
          background: "#ffffff",
          borderRadius: 9,
          textDecoration: "none",
          fontWeight: 850,
          fontSize: 11,
        }}
      >
        How this assessment works →
      </Link>
    </section>
  );
}

// ---------------------------------------------------------
// SUMMARY TAB
// ---------------------------------------------------------

function SummaryTab({
  site,
  planning,
  issues,
  onGoToRisk,
  onGoToStrategic,
}: {
  site: SiteDetail;
  planning: PlanningState;
  issues: Issue[];
  onGoToRisk: () => void;
  onGoToStrategic: () => void;
}) {
  const dimensionButton: CSSProperties = {
    ...cardStyle,
    textAlign: "left",
    cursor: "pointer",
    color: BLACK,
  };

  return (
    <>
      <section style={sectionStyle}>
        <SectionHeading
          eyebrow="Current assessment"
          title="Why this site has its current outcome"
          description="Risk Exposure and Strategic Value are assessed separately and combined using the risk-led priority matrix."
        />

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(min(100%, 230px), 1fr))",
            gap: 13,
            alignItems: "stretch",
          }}
        >
          <button
            type="button"
            onClick={onGoToRisk}
            style={dimensionButton}
          >
            <div style={eyebrowStyle}>Risk Exposure</div>

            <div
              style={{
                fontSize: 29,
                fontWeight: 900,
                marginTop: 9,
              }}
            >
              {displayText(site.risk_band)}
            </div>

            <div
              style={{
                color: MUTED,
                fontSize: 11,
                marginTop: 3,
              }}
            >
              Score {numericValue(site.risk_exposure_score) ?? "—"}
            </div>

            <p
              style={{
                fontSize: 11,
                lineHeight: 1.6,
                color: MUTED,
              }}
            >
              Ownership, management, known at-risk evidence
              and planning pressure.
            </p>

            <strong style={{ fontSize: 11 }}>
              View Risk & Planning →
            </strong>
          </button>

          <button
            type="button"
            onClick={onGoToStrategic}
            style={dimensionButton}
          >
            <div style={eyebrowStyle}>Strategic Value</div>

            <div
              style={{
                fontSize: 29,
                fontWeight: 900,
                marginTop: 9,
              }}
            >
              {displayText(site.strategic_value_band)}
            </div>

            <div
              style={{
                color: MUTED,
                fontSize: 11,
                marginTop: 3,
              }}
            >
              Score {numericValue(site.strategic_value_score) ?? "—"} / 15
            </div>

            <p
              style={{
                fontSize: 11,
                lineHeight: 1.6,
                color: MUTED,
              }}
            >
              Scale, strategic provision, borough context,
              Inner London and deprivation.
            </p>

            <strong style={{ fontSize: 11 }}>
              View Strategic Value →
            </strong>
          </button>

          <div
            style={{
              ...cardStyle,
              color: "#ffffff",
              background: BLACK,
              borderColor: BLACK,
            }}
          >
            <div
              style={{
                ...eyebrowStyle,
                color: "#ef555b",
              }}
            >
              Priority outcome
            </div>

            <div
              style={{
                fontSize: 29,
                fontWeight: 900,
                marginTop: 9,
              }}
            >
              {displayText(site.priority_category)}
            </div>

            <p
              style={{
                fontSize: 11,
                lineHeight: 1.6,
                color: "#c1c1c1",
              }}
            >
              {getOutcomeDescription(site.priority_category)}
            </p>
          </div>
        </div>
      </section>

      <section style={sectionStyle}>
        <SectionHeading
          eyebrow="Current evidence"
          title="Key evidence for this site"
          description="The most relevant supporting information for understanding the current assessment."
        />

        <div style={gridStyle}>
          <InfoCard
            title="Playing-field status"
            value={displayText(site.playing_field_status)}
            text="Status recorded in the assessed playing-field evidence."
          />

          <InfoCard
            title="Ownership"
            value={displayText(site.owner_type)}
            text="Ownership classification used in the Risk Exposure assessment."
          />

          <InfoCard
            title="Management"
            value={displayText(site.management_type)}
            text="Management classification used in the Risk Exposure assessment."
          />

          <InfoCard
            title="Planning evidence"
            value={planning.shortLabel}
            text={planning.description}
          />
        </div>
      </section>

      {issues.length > 0 && (
        <section style={sectionStyle}>
          <SectionHeading
            eyebrow="Evidence review"
            title="Information requiring attention"
            description="Review flags highlight uncertainty. They do not automatically change the priority outcome."
          />

          <div style={gridStyle}>
            {issues.map((issue, index) => (
              <IssueCard key={index} issue={issue} />
            ))}
          </div>
        </section>
      )}

      <MethodologyCallout />
    </>
  );
}

// ---------------------------------------------------------
// RISK AND PLANNING TAB
// ---------------------------------------------------------

function RiskTab({
  site,
  planning,
}: {
  site: SiteDetail;
  planning: PlanningState;
}) {
  return (
    <>
      <section style={sectionStyle}>
        <SectionHeading
          eyebrow="Risk assessment"
          title="How exposed is the site to loss, decline, reduced access or change?"
          description="The risk criteria provide early-warning evidence. A high-risk band is not confirmation of loss, closure or development."
        />

        <div style={darkBandStyle}>
          <div>
            <div style={{ fontSize: 10, color: "#aaa" }}>
              Risk Exposure band
            </div>

            <div
              style={{
                fontSize: 29,
                fontWeight: 900,
                marginTop: 5,
              }}
            >
              {displayText(site.risk_band)}
            </div>
          </div>

          <div>
            <div style={{ fontSize: 10, color: "#aaa" }}>
              Risk Exposure score
            </div>

            <div
              style={{
                fontSize: 29,
                fontWeight: 900,
                marginTop: 5,
              }}
            >
              {numericValue(site.risk_exposure_score) ?? "—"}
            </div>
          </div>
        </div>

        <div style={gridStyle}>
          <AssessmentCriterion
            title="Ownership exposure"
            score={site.rf1_ownership_exposure_score}
            maxScore={2}
            evidence={displayText(site.owner_type)}
            description="Assesses exposure associated with current ownership arrangements."
          />

          <AssessmentCriterion
            title="Management exposure"
            score={site.rf2_management_exposure_score}
            maxScore={2}
            evidence={displayText(site.management_type)}
            description="Assesses exposure associated with current management arrangements."
          />

          <AssessmentCriterion
            title="Known at-risk evidence"
            score={site.rf3_pps_at_risk_score}
            maxScore={5}
            evidence={getKnownRiskEvidence(site)}
            description="Awards points for an affirmative at-risk designation in linked KKP/PPS protection evidence. The designation records a source concern; it does not independently verify that the same threat is active today. A zero score does not establish that the site is free from protection concerns."
          />

          <AssessmentCriterion
            title="Planning pressure"
            score={site.rf6_planning_pressure_score}
            maxScore={3}
            evidence={planning.shortLabel}
            description="Uses appropriately screened site-linked planning evidence. Review-only evidence does not directly contribute to the score."
          />
        </div>
      </section>

      <section style={sectionStyle}>
        <SectionHeading
          eyebrow="Planning evidence"
          title="How planning evidence is being treated"
          description="Planning applications identified near a site do not automatically establish a threat. Evidence must satisfy the assessment rules before contributing to Planning Pressure."
        />

        <div
          style={{
            background: planning.background,
            border: `1px solid ${planning.border}`,
            padding: 21,
            borderRadius: 15,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 14,
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 10,
                  color: MUTED,
                  textTransform: "uppercase",
                  fontWeight: 850,
                }}
              >
                Current planning status
              </div>

              <h3
                style={{
                  fontSize: 18,
                  margin: "7px 0 0",
                }}
              >
                {planning.label}
              </h3>
            </div>

            <span
              style={{
                alignSelf: "flex-start",
                padding: "7px 11px",
                background: planning.badge,
                color: planning.text,
                fontWeight: 850,
                fontSize: 10,
                borderRadius: 30,
              }}
            >
              {planning.shortLabel}
            </span>
          </div>

          <p
            style={{
              maxWidth: 850,
              fontSize: 12,
              lineHeight: 1.65,
              color: "#555",
              marginTop: 12,
            }}
          >
            {planning.description}
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(min(100%, 190px), 1fr))",
              gap: 11,
              marginTop: 17,
            }}
          >
            <MetricBox
              label="Candidate applications identified"
              value={numericOrZero(
                site.planning_candidate_application_count
              )}
            />

            <MetricBox
              label="Applications contributing to assessment"
              value={numericOrZero(
                site.confirmed_rf6_application_count
              )}
            />

            <MetricBox
              label="Nearest identified planning candidate"
              value={formatDistance(
                site.nearest_planning_candidate_distance_metres
              )}
              description="Distance to the nearest candidate application, which is not necessarily an application contributing to the Planning Pressure score. Proximity alone does not establish a threat to the site."
            />
          </div>
        </div>
      </section>

      <section style={sectionStyle}>
        <SectionHeading
          eyebrow="KKP / Playing Pitch Strategy context"
          title="Supporting protection evidence"
          description="Linked KKP/PPS records provide protection and strategic context where available. Designations are source-recorded and may require current verification."
        />

        <div style={gridStyle}>
          <InfoCard
            title="Critical-site flag"
            value={displayText(site.pps_critical_site_flag)}
            text="Critical-site designation in the linked KKP/PPS source record. This is separate from the at-risk designation and does not automatically award Known at-risk points."
          />

          <InfoCard
            title="Community use"
            value={displayText(site.pps_community_use_flag)}
            text="Community-use information recorded in linked PPS evidence."
          />

          <InfoCard
            title="Security of tenure"
            value={displayText(site.pps_security_of_tenure)}
            text="Tenure information available from linked PPS evidence."
          />

          <InfoCard
            title="PPS ownership and management"
            value={
              [
                safeText(site.pps_ownership_type),
                safeText(site.pps_management_type),
              ]
                .filter(Boolean)
                .join(" / ") || "Not recorded"
            }
            text="Ownership and management details from linked PPS evidence."
          />
        </div>

        <div
          style={{
            marginTop: 14,
            padding: "16px 18px",
            borderRadius: 12,
            border: `1px solid ${BORDER}`,
            background: "#f8f6f3",
          }}
        >
          <h3 style={{ fontSize: 13, margin: "0 0 7px", color: BLACK }}>
            How to interpret these KKP/PPS designations
          </h3>
          <p style={{ fontSize: 11, lineHeight: 1.65, color: MUTED, margin: 0 }}>
            A critical-site designation describes strategic importance in the
            linked source evidence; it is not the same as a recorded at-risk
            concern. The Known at-risk score is based on a separate affirmative
            at-risk designation in that evidence. A missing or non-affirmative
            designation does not prove that a site faces no risk. Source-recorded
            concerns may also need checking against current site circumstances.
          </p>
        </div>
      </section>

      <MethodologyCallout />
    </>
  );
}

// ---------------------------------------------------------
// STRATEGIC VALUE TAB
// ---------------------------------------------------------

function StrategicTab({ site }: { site: SiteDetail }) {
  const criteria = [
    {
      title: "Multi-pitch scale",
      score: site.sv1_multi_pitch_scale_score,
      max: 3,
      evidence: getMultiPitchEvidence(site),
      description:
        "Recognises larger sites with multiple adult or senior football/rugby pitch units.",
    },
    {
      title: "Full-size 3G provision",
      score: site.sv2_full_size_3g_score,
      max: 3,
      evidence:
        numericValue(site.full_size_3g_pitch_units) === null
          ? "Provision not recorded"
          : `${formatNumber(
              site.full_size_3g_pitch_units
            )} full-size 3G pitch units`,
      description:
        "Recognises confirmed full-size third-generation artificial grass pitch provision.",
    },
    {
      title: "Strategic sport provision",
      score: site.sv3_strategic_sport_score,
      max: 2,
      evidence: getStrategicSportEvidence(site),
      description:
        "Recognises strategically relevant rugby, cricket, hockey and other grass-pitch provision.",
    },
    {
      title: "Share of borough provision",
      score: site.sv4_share_of_borough_provision_score,
      max: 3,
      evidence: "Recorded borough-share evidence",
      description:
        "Recognises sites accounting for a significant share of equivalent provision within the borough.",
    },
    {
      title: "Inner London",
      score: site.sv5_inner_london_score,
      max: 2,
      evidence:
        numericValue(site.sv5_inner_london_score) === null
          ? "Not recorded"
          : numericOrZero(site.sv5_inner_london_score) === 2
          ? "Inner London weighting applied"
          : "Inner London weighting not applied",
      description:
        "Recognises the additional strategic significance of playing-field provision in Inner London.",
    },
    {
      title: "Deprivation",
      score: site.sv6_deprivation_score,
      max: 2,
      evidence: isYes(site.missing_imd_flag)
        ? "Deprivation evidence unavailable"
        : numericValue(site.imd_decile) !== null
        ? `IMD decile ${formatNumber(site.imd_decile)} of 10`
        : "IMD decile not recorded",
      description:
        "Uses the recorded Index of Multiple Deprivation decile to assess local deprivation context. Decile 1 represents the most deprived 10% of areas nationally; decile 10 the least deprived 10%.",
    },
  ];

  return (
    <>
      <section style={sectionStyle}>
        <SectionHeading
          eyebrow="Strategic Value"
          title="How important is this site to sport and physical activity provision?"
          description="Strategic Value is assessed independently of Risk Exposure. High strategic importance alone does not create an active priority outcome."
        />

        <div style={darkBandStyle}>
          <div>
            <div style={{ fontSize: 10, color: "#aaa" }}>
              Strategic Value band
            </div>

            <div
              style={{
                marginTop: 5,
                fontSize: 29,
                fontWeight: 900,
              }}
            >
              {displayText(site.strategic_value_band)}
            </div>
          </div>

          <div>
            <div style={{ fontSize: 10, color: "#aaa" }}>
              Strategic Value score
            </div>

            <div
              style={{
                marginTop: 5,
                fontSize: 29,
                fontWeight: 900,
              }}
            >
              {numericValue(site.strategic_value_score) ?? "—"}

              <span
                style={{
                  color: "#aaa",
                  fontSize: 15,
                  marginLeft: 5,
                }}
              >
                / 15
              </span>
            </div>
          </div>
        </div>

        <div style={gridStyle}>
          {criteria.map((criterion) =>
            criterion.title === "Share of borough provision" ? (
              <BoroughShareCriterion key={criterion.title} site={site} />
            ) : (
              <AssessmentCriterion
                key={criterion.title}
                title={criterion.title}
                score={criterion.score}
                maxScore={criterion.max}
                evidence={criterion.evidence}
                description={criterion.description}
              />
            )
          )}
        </div>
      </section>

      <section style={sectionStyle}>
        <SectionHeading
          eyebrow="Strategic Value bands"
          title="How the combined score is interpreted"
          description="The overall Strategic Value band is determined by the combined score across the six criteria."
        />

        <div style={gridStyle}>
          {[
            ["High", "9–15"],
            ["Medium", "5–8"],
            ["Low", "1–4"],
            ["Not flagged", "0"],
          ].map(([title, range]) => (
            <article key={title} style={cardStyle}>
              <div
                style={{
                  fontSize: 15,
                  fontWeight: 850,
                }}
              >
                {title}
              </div>

              <div
                style={{
                  fontSize: 11,
                  marginTop: 7,
                  color: MUTED,
                }}
              >
                Score {range}
              </div>
            </article>
          ))}
        </div>
      </section>

      <MethodologyCallout />
    </>
  );
}

// ---------------------------------------------------------
// FACILITIES TAB
// ---------------------------------------------------------

function FacilitiesTab({ site }: { site: SiteDetail }) {
  const facilities = [
    {
      title: "Adult football / rugby pitch units",
      value: site.adult_football_rugby_pitch_units,
    },
    {
      title: "Rugby pitch units",
      value: site.rugby_pitch_units,
    },
    {
      title: "Cricket pitch units",
      value: site.cricket_pitch_units,
    },
    {
      title: "Other strategic grass pitch units",
      value: site.other_strategic_grass_pitch_units,
    },
    {
      title: "Full-size 3G pitch units",
      value: site.full_size_3g_pitch_units,
    },
    {
      title: "Hockey artificial grass pitch units",
      value: site.hockey_agp_pitch_units,
    },
  ];

  return (
    <>
      <section style={sectionStyle}>
        <SectionHeading
          eyebrow="Facility evidence"
          title="Playing-field provision recorded for this site"
          description="These figures represent the pitch units held in the assessment evidence. They are not necessarily a live inventory of playable or available pitches."
        />

        <div style={gridStyle}>
          {facilities.map((facility) => (
            <article key={facility.title} style={cardStyle}>
              <div
                style={{
                  fontSize: 35,
                  fontWeight: 900,
                }}
              >
                {numericValue(facility.value) === null
                  ? "—"
                  : formatNumber(facility.value)}
              </div>

              <div
                style={{
                  marginTop: 7,
                  color: MUTED,
                  fontSize: 11,
                  lineHeight: 1.5,
                }}
              >
                {facility.title}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section style={sectionStyle}>
        <SectionHeading
          eyebrow="Site context"
          title="Current site information"
          description="Supporting site characteristics represented in the assessment."
        />

        <div style={gridStyle}>
          <InfoCard
            title="Playing-field status"
            value={displayText(site.playing_field_status)}
            text="Current status in the assessment data."
          />

          <InfoCard
            title="Owner"
            value={displayText(site.owner_type)}
            text="Recorded ownership classification."
          />

          <InfoCard
            title="Management"
            value={displayText(site.management_type)}
            text="Recorded management classification."
          />

          <InfoCard
            title="Borough"
            value={displayText(site.borough)}
            text="Borough used for local provision comparisons."
          />
        </div>
      </section>
    </>
  );
}

// ---------------------------------------------------------
// EVIDENCE AND QUALITY TAB
// ---------------------------------------------------------

function EvidenceTab({
  site,
  issues,
}: {
  site: SiteDetail;
  issues: Issue[];
}) {
  const sources = [
    [
      "Active Places",
      "Core site, facility, ownership and management information.",
    ],
    [
      "Playing Pitch Strategies",
      "Protection, community-use, ownership and tenure context where linked.",
    ],
    [
      "Planning evidence",
      "Candidate and site-linked planning evidence used for assessment or review.",
    ],
    [
      "Deprivation",
      "Index of Multiple Deprivation evidence used in Strategic Value.",
    ],
    [
      "Borough context",
      "Provision comparisons used in the Strategic Value assessment.",
    ],
    [
      "Data-quality review",
      "Flags and limitations retained for further checking.",
    ],
  ];

  const latitude = numericValue(site.latitude);
  const longitude = numericValue(site.longitude);

  return (
    <>
      <section style={sectionStyle}>
        <SectionHeading
          eyebrow="Evidence quality"
          title="What should be interpreted with additional care?"
          description="Missing, incomplete or uncertain information is surfaced rather than treated as confirmed evidence."
        />

        {issues.length > 0 ? (
          <div style={gridStyle}>
            {issues.map((issue, index) => (
              <IssueCard key={index} issue={issue} />
            ))}
          </div>
        ) : (
          <article style={cardStyle}>
            <h3
              style={{
                fontSize: 15,
                margin: "0 0 8px",
              }}
            >
              No additional evidence-quality flag is currently shown.
            </h3>

            <p
              style={{
                fontSize: 11,
                color: MUTED,
                lineHeight: 1.6,
                margin: 0,
              }}
            >
              This does not establish that all underlying
              information is complete. It means no additional
              site-level review flag is currently identified
              through the displayed assessment fields.
            </p>
          </article>
        )}
      </section>

      <section style={sectionStyle}>
        <SectionHeading
          eyebrow="Evidence sources"
          title="Sources represented in the assessment"
          description="These sources contribute different types of evidence. Availability and completeness can vary between sites."
        />

        <div style={gridStyle}>
          {sources.map(([title, description]) => (
            <article
              key={title}
              style={{
                ...cardStyle,
                borderLeft: `4px solid ${RED}`,
              }}
            >
              <h3
                style={{
                  margin: 0,
                  fontSize: 14,
                }}
              >
                {title}
              </h3>

              <p
                style={{
                  margin: "8px 0 0",
                  fontSize: 11,
                  lineHeight: 1.6,
                  color: MUTED,
                }}
              >
                {description}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section style={sectionStyle}>
        <SectionHeading
          eyebrow="Reference information"
          title="Site identifiers and location"
          description="These references help partners reconcile records across data sources."
        />

        <div style={gridStyle}>
          <InfoCard
            title="Site ID"
            value={displayText(site.site_id)}
            text="Current assessed-site identifier."
          />

          <InfoCard
            title="Postcode"
            value={displayText(site.postcode)}
            text="Postcode associated with the site."
          />

          <InfoCard
            title="Borough"
            value={displayText(site.borough)}
            text="Borough associated with the site."
          />

          <InfoCard
            title="Coordinates"
            value={
              latitude !== null && longitude !== null
                ? `${latitude}, ${longitude}`
                : "Not recorded"
            }
            text="Coordinates recorded in the site evidence."
          />
        </div>
      </section>

      <MethodologyCallout />
    </>
  );
}

// ---------------------------------------------------------
// MAIN PAGE
// ---------------------------------------------------------

export default function SiteDetailPage() {
  const params = useParams();

  const siteId = Array.isArray(params.site_id)
    ? params.site_id[0]
    : typeof params.site_id === "string"
    ? params.site_id
    : "";

  const [site, setSite] = useState<SiteDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] =
    useState<TabKey>("summary");

  useEffect(() => {
    if (!siteId) {
      setLoading(false);
      setError("No site identifier was provided.");
      return;
    }

    let cancelled = false;

    async function loadSite() {
      try {
        setLoading(true);
        setError(null);
        setSite(null);

        const response = await fetch(
          `/api/sites/${encodeURIComponent(siteId)}`,
          {
            cache: "no-store",
          }
        );

        const raw: unknown = await response.json();

        if (!response.ok) {
          const result = raw as {
            error?: string;
          };

          throw new Error(
            result.error ||
              "Unable to load the site assessment."
          );
        }

        const result = normaliseSiteResponse(raw);

        if (!result) {
          throw new Error("No site record was returned.");
        }

        if (!cancelled) {
          setSite(result);
          setActiveTab("summary");
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load the site assessment."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadSite();

    return () => {
      cancelled = true;
    };
  }, [siteId]);

  const issues = useMemo(() => {
    if (!site) {
      return [];
    }

    return getQualityIssues(site);
  }, [site]);

  if (loading) {
    return (
      <AppShell>
        <main style={pageStyle}>
          <article style={cardStyle}>
            <h2>Loading site assessment</h2>

            <p style={{ color: MUTED }}>
              Retrieving the latest site-level evidence.
            </p>
          </article>
        </main>
      </AppShell>
    );
  }

  if (error || !site) {
    return (
      <AppShell>
        <main style={pageStyle}>
          <article
            style={{
              ...cardStyle,
              background: "#fff0f0",
              borderColor: "#efb9bd",
            }}
          >
            <h2>Site assessment could not be loaded</h2>

            <p>{error || "Site unavailable."}</p>

            <Link href="/sites" style={linkStyle}>
              ← Back to Explore Sites
            </Link>
          </article>
        </main>
      </AppShell>
    );
  }

  const planning = getPlanningState(site);

  const tabs: {
    key: TabKey;
    label: string;
  }[] = [
    {
      key: "summary",
      label: "Summary",
    },
    {
      key: "risk",
      label: "Risk & Planning",
    },
    {
      key: "strategic",
      label: "Strategic Value",
    },
    {
      key: "facilities",
      label: "Facilities",
    },
    {
      key: "evidence",
      label: "Evidence & Quality",
    },
  ];

  return (
    <AppShell>
      <main style={pageStyle}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 15,
            flexWrap: "wrap",
            marginBottom: 17,
          }}
        >
          <Link href="/sites" style={linkStyle}>
            ← Explore Sites
          </Link>

          <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
            {activePlacesUrl(site.site_id) && (
              <a
                href={activePlacesUrl(site.site_id) || undefined}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Open ${displayText(site.site_name)} in Sport England Active Places`}
                style={{ ...linkStyle, color: "#555" }}
              >
                Sport England Active Places ↗
              </a>
            )}

            <Link
              href="/about#assessment"
              style={{
                ...linkStyle,
                color: RED,
              }}
            >
              How this assessment works →
            </Link>
          </div>
        </div>

        <section
          style={{
            background: BLACK,
            color: "#ffffff",
            borderRadius: 23,
            padding: "35px 39px",
            marginBottom: 19,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              flexWrap: "wrap",
              gap: 26,
            }}
          >
            <div
              style={{
                flex: "1 1 450px",
                minWidth: 0,
              }}
            >
              <div
                style={{
                  ...eyebrowStyle,
                  color: "#ef555b",
                }}
              >
                {displayText(site.borough)}
              </div>

              <h1
                style={{
                  maxWidth: 950,
                  margin: "9px 0 0",
                  fontSize: "clamp(31px, 4vw, 52px)",
                  lineHeight: 1.04,
                  letterSpacing: "-0.045em",
                  overflowWrap: "anywhere",
                }}
              >
                {displayText(site.site_name)}
              </h1>

              <div
                style={{
                  marginTop: 13,
                  color: "#bdbdbd",
                  fontSize: 12,
                }}
              >
                {[
                  safeText(site.postcode),
                  safeText(site.playing_field_status),
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </div>
            </div>

            <div
              style={{
                padding: "16px 20px",
                background: "#282828",
                borderRadius: 13,
              }}
            >
              <div
                style={{
                  fontSize: 9,
                  color: "#aaa",
                  fontWeight: 850,
                  textTransform: "uppercase",
                }}
              >
                Current outcome
              </div>

              <div
                style={{
                  marginTop: 7,
                  fontWeight: 900,
                  fontSize: 21,
                }}
              >
                {displayText(site.priority_category)}
              </div>
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(min(100%, 180px), 1fr))",
              gap: 11,
              marginTop: 28,
            }}
          >
            <HeroMetric
              label="Risk Exposure"
              value={displayText(site.risk_band)}
              supporting={
                numericValue(site.risk_exposure_score) !== null
                  ? `Score ${formatNumber(
                      site.risk_exposure_score
                    )}`
                  : undefined
              }
            />

            <HeroMetric
              label="Strategic Value"
              value={displayText(site.strategic_value_band)}
              supporting={
                numericValue(site.strategic_value_score) !== null
                  ? `Score ${formatNumber(
                      site.strategic_value_score
                    )} / 15`
                  : undefined
              }
            />

            <HeroMetric
              label="Planning evidence"
              value={planning.shortLabel}
              supporting={planning.supporting}
            />

            <HeroMetric
              label="Evidence review"
              value={
                issues.length > 0
                  ? "Review flagged"
                  : "No additional flag"
              }
              supporting={
                issues.length > 0
                  ? `${issues.length} review ${
                      issues.length === 1
                        ? "item"
                        : "items"
                    }`
                  : undefined
              }
            />
          </div>
        </section>

        <nav
          aria-label="Site assessment sections"
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 7,
            padding: 9,
            background: "#ffffff",
            border: `1px solid ${BORDER}`,
            borderRadius: 13,
            marginBottom: 31,
          }}
        >
          {tabs.map((tab) => (
            <TabButton
              key={tab.key}
              active={activeTab === tab.key}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </TabButton>
          ))}
        </nav>

        {activeTab === "summary" && (
          <SummaryTab
            site={site}
            planning={planning}
            issues={issues}
            onGoToRisk={() => setActiveTab("risk")}
            onGoToStrategic={() => setActiveTab("strategic")}
          />
        )}

        {activeTab === "risk" && (
          <RiskTab
            site={site}
            planning={planning}
          />
        )}

        {activeTab === "strategic" && (
          <StrategicTab site={site} />
        )}

        {activeTab === "facilities" && (
          <FacilitiesTab site={site} />
        )}

        {activeTab === "evidence" && (
          <EvidenceTab
            site={site}
            issues={issues}
          />
        )}
      </main>
    </AppShell>
  );
}

