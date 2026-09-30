import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/* =========================================================
   TYPES
   ========================================================= */

type FabricProtectionRow = {
  reconciliation_id?: number | string | null;

  pps_source_site_name?: string | null;
  pps_borough?: string | null;

  pps_site_id?: string | null;
  active_places_site_id?: string | null;

  pps_playing_field_flag?: string | null;
  pps_at_risk_flag?: string | null;

  pps_ownership_type?: string | null;
  pps_management_type?: string | null;

  pps_security_of_tenure?: string | null;
  pps_community_use_flag?: string | null;

  matched_to_ranked_site?: string | null;

  current_site_id?: number | string | null;
  current_site_name?: string | null;
  current_site_postcode?: string | null;
  current_site_borough?: string | null;

  priority_category?: string | null;
  risk_band?: string | null;

  strategic_value_score?: number | null;
  strategic_value_band?: string | null;

  risk_exposure_score?: number | null;

  rf3_pps_at_risk_score?: number | null;
  rf6_planning_pressure_score?: number | null;
  rf6_scoring_status?: string | null;

  planning_review_required?: string | null;
  planning_candidate_application_count?: number | string | null;

  current_playing_field_status?: string | null;

  match_method?: string | null;

  reconciliation_status?: string | null;
  reconciliation_note?: string | null;

  outside_scope_reason?: string | null;
  action_category?: string | null;

  source_sheet_name?: string | null;
  run_date?: string | null;
};

type ProtectionCategory =
  | "current-assessment"
  | "protection-watchlist"
  | "manual-reconciliation"
  | "outside-playing-field-scope";

type ProtectionRecord = {
  id: string;

  siteName: string;
  borough: string;

  ppsSiteId: string | null;
  activePlacesSiteId: string | null;

  playingFieldInPps: string | null;
  knownAtRisk: string | null;

  ownershipType: string | null;
  managementType: string | null;

  securityOfTenure: string | null;
  communityUse: string | null;

  matchedToCurrentAssessment: boolean;

  assessedSiteId: string | null;
  assessedSiteName: string | null;
  postcode: string | null;
  assessedBorough: string | null;

  currentPriority: string | null;
  currentRisk: string | null;

  strategicValueScore: number | null;
  strategicValueBand: string | null;
  riskExposureScore: number | null;

  knownAtRiskScore: number | null;
  planningPressureScore: number | null;
  planningScoringStatus: string | null;

  planningReviewRequired: string | null;
  planningCandidateApplicationCount: number;

  currentPlayingFieldStatus: string | null;

  matchMethod: string | null;

  category: ProtectionCategory;
  categoryLabel: string;

  reason: string | null;
  note: string | null;

  actionCategory: string | null;
  reconciliationStatus: string | null;

  runDate: string | null;
   HELPERS
   ========================================================= */

function getItems(
  root: unknown
): FabricProtectionRow[] {
  if (!root) {
    return [];
  }

  if (Array.isArray(root)) {
    return root as FabricProtectionRow[];
  }

  if (
    typeof root === "object" &&
    root !== null &&
    "items" in root
  ) {
    const items =
      (
        root as {
          items?: FabricProtectionRow[];
        }
      ).items;

    return Array.isArray(items)
      ? items
      : [];
  }

  return [];
}

function cleanText(
  value:
    | string
    | number
    | null
    | undefined
) {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return null;
  }

  return String(value).trim();
}

function numberOrNull(
  value:
    | number
    | string
    | null
    | undefined
) {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return null;
  }

  const parsed =
    Number(value);

  return Number.isFinite(parsed)
    ? parsed
    : null;
}

function numberOrZero(
  value:
    | number
    | string
    | null
    | undefined
) {
  return numberOrNull(value) ?? 0;
}

function isYes(
  value:
    | string
    | null
    | undefined
) {
  return (
    value?.trim().toLowerCase() ===
    "yes"
  );
}

/* =========================================================
   CLASSIFICATION
   ========================================================= */

function classifyRecord(
  row: FabricProtectionRow
): {
  category: ProtectionCategory;
  categoryLabel: string;
} {
  if (
    isYes(
      row.matched_to_ranked_site
    )
  ) {
    return {
      category:
        "current-assessment",

      categoryLabel:
        "Current assessed at-risk site",
    };
  }

  const combined =
    [
      row.action_category,
      row.reconciliation_status,
      row.outside_scope_reason,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

  if (
    combined.includes("closed") ||
    combined.includes("dormant") ||
    combined.includes("derelict")
  ) {
    return {
      category:
        "protection-watchlist",

      categoryLabel:
        "Protection watchlist",
    };
  }

  if (
    combined.includes(
      "not pps playing field"
    ) ||
    combined.includes(
      "not current playing field"
    ) ||
    combined.includes(
      "not marked as playing field"
    )
  ) {
    return {
      category:
        "outside-playing-field-scope",

      categoryLabel:
        "Outside current playing-field scope",
    };
  }

  return {
    category:
      "manual-reconciliation",

    categoryLabel:
      "Manual reconciliation",
  };
}

/* =========================================================
   NORMALISATION
   ========================================================= */

function normaliseRecord(
  row: FabricProtectionRow,
  index: number
): ProtectionRecord {
  const classification =
    classifyRecord(row);

  const reconciliationId =
    cleanText(
      row.reconciliation_id
    );

  const ppsSiteId =
    cleanText(
      row.pps_site_id
    );

  return {
    id:
      reconciliationId ||
      ppsSiteId ||
      `protection-${index}`,

    siteName:
      cleanText(
        row.pps_source_site_name
      ) ||
      cleanText(
        row.current_site_name
      ) ||
      "Unnamed site",

    borough:
      cleanText(
        row.pps_borough
      ) ||
      cleanText(
        row.current_site_borough
      ) ||
      "Borough not recorded",

    ppsSiteId:
      cleanText(
        row.pps_site_id
      ),

    activePlacesSiteId:
      cleanText(
        row.active_places_site_id
      ),

    playingFieldInPps:
      cleanText(
        row.pps_playing_field_flag
      ),

    knownAtRisk:
      cleanText(
        row.pps_at_risk_flag
      ),

    ownershipType:
      cleanText(
        row.pps_ownership_type
      ),

    managementType:
      cleanText(
        row.pps_management_type
      ),

    securityOfTenure:
      cleanText(
        row.pps_security_of_tenure
      ),

    communityUse:
      cleanText(
        row.pps_community_use_flag
      ),

    matchedToCurrentAssessment:
      isYes(
        row.matched_to_ranked_site
      ),

    assessedSiteId:
      cleanText(
        row.current_site_id
      ),

    assessedSiteName:
      cleanText(
        row.current_site_name
      ),

    postcode:
      cleanText(
        row.current_site_postcode
      ),

    assessedBorough:
      cleanText(
        row.current_site_borough
      ),

    currentPriority:
      cleanText(
        row.priority_category
      ),

    currentRisk:
      cleanText(
        row.risk_band
      ),

    strategicValueScore:
      numberOrNull(
        row.strategic_value_score
      ),

    strategicValueBand:
      cleanText(
        row.strategic_value_band
      ),

    riskExposureScore:
      numberOrNull(
        row.risk_exposure_score
      ),

    knownAtRiskScore:
      numberOrNull(
        row.rf3_pps_at_risk_score
      ),

    planningPressureScore:
      numberOrNull(
        row.rf6_planning_pressure_score
      ),

    planningScoringStatus:
      cleanText(
        row.rf6_scoring_status
      ),

    planningReviewRequired:
      cleanText(
        row.planning_review_required
      ),

    planningCandidateApplicationCount:
      numberOrZero(
        row.planning_candidate_application_count
      ),

    currentPlayingFieldStatus:
      cleanText(
        row.current_playing_field_status
      ),

    matchMethod:
      cleanText(
        row.match_method
      ),

    category:
      classification.category,

    categoryLabel:
      classification.categoryLabel,

    reason:
      cleanText(
        row.outside_scope_reason
      ),

    note:
      cleanText(
        row.reconciliation_note
      ),

    actionCategory:
      cleanText(
        row.action_category
      ),

    reconciliationStatus:
      cleanText(
        row.reconciliation_status
      ),

    runDate:
      cleanText(
        row.run_date
      ),
  };
}

/* =========================================================
   ROUTE
   ========================================================= */

export async function GET() {
  try {
    const query = `
      query ProtectionReconciliation {
        protection: app_pps_reconciliations(first: 100) {
          items {
            reconciliation_id

            pps_source_site_name
            pps_borough

            pps_site_id
            active_places_site_id

            pps_playing_field_flag
            pps_at_risk_flag

            pps_ownership_type
            pps_management_type

            pps_security_of_tenure
            pps_community_use_flag

            matched_to_ranked_site

            current_site_id
            current_site_name
            current_site_postcode
            current_site_borough

            priority_category
            risk_band

            strategic_value_score
            strategic_value_band
            risk_exposure_score

            rf3_pps_at_risk_score
            rf6_planning_pressure_score
            rf6_scoring_status

            planning_review_required
            planning_candidate_application_count

            current_playing_field_status

            match_method

            reconciliation_status
            reconciliation_note

            outside_scope_reason
            action_category

            source_sheet_name
            run_date
          }

          hasNextPage
          endCursor
        }
      }
    `;

    const data =
      await runGraphQL(
        query
      );

    const rawRows =
      getItems(
        data?.protection
      );

    const records =
      rawRows
        .map(
          normaliseRecord
        )
        .sort(
          (
            a,
            b
          ) => {
            const boroughSort =
              a.borough.localeCompare(
                b.borough
              );

            if (
              boroughSort !== 0
            ) {
              return boroughSort;
            }

            return a.siteName.localeCompare(
              b.siteName
            );
          }
        );

    const counts = {
      total:
        records.length,

      currentAssessment:
        records.filter(
          (record) =>
            record.category ===
            "current-assessment"
        ).length,

      protectionWatchlist:
        records.filter(
          (record) =>
            record.category ===
            "protection-watchlist"
        ).length,

      manualReconciliation:
        records.filter(
          (record) =>
            record.category ===
            "manual-reconciliation"
        ).length,

      outsidePlayingFieldScope:
        records.filter(
          (record) =>
            record.category ===
            "outside-playing-field-scope"
        ).length,
    };

    return NextResponse.json({
      success: true,

      counts: {
        ...counts,

        outsideCurrentAssessment:
          counts.total -
          counts.currentAssessment,
      },

      records,
    });
  } catch (error) {
    console.error(
      "Protection API error:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        error:
          error instanceof Error
            ? error.message
            : "Unable to load protection and reconciliation data.",
      },
      {
        status: 500,
      }
    );
  }
}
