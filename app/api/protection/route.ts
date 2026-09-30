import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/* =========================================================
   TYPES
   ========================================================= */

type FabricProtectionRow = {
  kkp_pps_at_risk_source_row_id?: number | string | null;

  kkp_pps_at_risk_site_name?: string | null;
  kkp_pps_borough?: string | null;

  pps_site_id?: number | string | null;
  active_places_site_id?: number | string | null;

  pps_playing_field_flag?: string | null;
  pps_at_risk_flag?: string | null;

  pps_ownership_type?: string | null;
  pps_management_type?: string | null;

  pps_security_of_tenure?: string | null;
  pps_community_use_flag?: string | null;

  matched_to_phase1_3_ranked_flag?: string | null;

  phase1_3_site_id?: number | string | null;
  phase1_3_site_name?: string | null;
  phase1_3_site_postcode?: string | null;
  phase1_3_borough?: string | null;

  phase1_3_priority_category?: string | null;
  phase1_3_risk_band?: string | null;

  match_method?: string | null;

  outside_scope_reason_refined?: string | null;

  kkp_pps_action_category?: string | null;

  outside_scope_reason_inferred?: string | null;

  reconciliation_status?: string | null;
  reconciliation_note?: string | null;
};

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

  currentPriority: string | null;
  currentRisk: string | null;

  matchMethod: string | null;

  category:
    | "current-assessment"
    | "protection-watchlist"
    | "manual-reconciliation"
    | "outside-playing-field-scope";

  categoryLabel: string;

  reason: string | null;
  note: string | null;
};

/* =========================================================
   FABRIC AUTH
   ========================================================= */

async function getFabricAccessToken() {
  const tenantId =
    process.env.AZURE_TENANT_ID;

  const clientId =
    process.env.AZURE_CLIENT_ID;

  const clientSecret =
    process.env.AZURE_CLIENT_SECRET;

  if (
    !tenantId ||
    !clientId ||
    !clientSecret
  ) {
    throw new Error(
      "Azure service principal environment variables are missing."
    );
  }

  const tokenUrl =
    `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`;

  const body =
    new URLSearchParams();

  body.set(
    "grant_type",
    "client_credentials"
  );

  body.set(
    "client_id",
    clientId
  );

  body.set(
    "client_secret",
    clientSecret
  );

  body.set(
    "scope",
    "https://api.fabric.microsoft.com/.default"
  );

  const response =
    await fetch(
      tokenUrl,
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/x-www-form-urlencoded",
        },

        body,

        cache: "no-store",
      }
    );

  const data =
    await response.json();

  if (!response.ok) {
    throw new Error(
      data?.error_description ||
        data?.error ||
        "Unable to obtain Fabric access token."
    );
  }

  return data.access_token as string;
}

/* =========================================================
   GRAPHQL
   ========================================================= */

async function runGraphQL(
  query: string
) {
  const endpoint =
    process.env.FABRIC_GRAPHQL_ENDPOINT;

  if (!endpoint) {
    throw new Error(
      "FABRIC_GRAPHQL_ENDPOINT is missing."
    );
  }

  const token =
    await getFabricAccessToken();

  const response =
    await fetch(
      endpoint,
      {
        method: "POST",

        headers: {
          Authorization:
            `Bearer ${token}`,

          "Content-Type":
            "application/json",
        },

        body:
          JSON.stringify({
            query,
          }),

        cache: "no-store",
      }
    );

  const data =
    await response.json();

  if (!response.ok) {
    throw new Error(
      `Fabric GraphQL request failed: ${response.status}`
    );
  }

  if (data.errors?.length) {
    throw new Error(
      data.errors
        .map(
          (
            error: {
              message?: string;
            }
          ) =>
            error.message ||
            "Unknown GraphQL error"
        )
        .join("; ")
    );
  }

  return data.data;
}

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

/* =========================================================
   NORMALISATION
   ========================================================= */

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

function classifyRecord(
  row: FabricProtectionRow
): {
  category:
    ProtectionRecord["category"];
  categoryLabel: string;
} {
  if (
    isYes(
      row.matched_to_phase1_3_ranked_flag
    )
  ) {
    return {
      category:
        "current-assessment",

      categoryLabel:
        "Current assessed at-risk site",
    };
  }

  const action =
    (
      row.kkp_pps_action_category ||
      row.reconciliation_status ||
      ""
    ).toLowerCase();

  const reason =
    (
      row.outside_scope_reason_refined ||
      row.outside_scope_reason_inferred ||
      ""
    ).toLowerCase();

  if (
    action.includes(
      "closed"
    ) ||
    action.includes(
      "dormant"
    ) ||
    action.includes(
      "derelict"
    ) ||
    reason.includes(
      "closed"
    ) ||
    reason.includes(
      "dormant"
    ) ||
    reason.includes(
      "derelict"
    )
  ) {
    return {
      category:
        "protection-watchlist",

      categoryLabel:
        "Protection watchlist",
    };
  }

  if (
    action.includes(
      "not pps playing field"
    ) ||
    reason.includes(
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

function normaliseRecord(
  row: FabricProtectionRow,
  index: number
): ProtectionRecord {
  const classification =
    classifyRecord(row);

  const sourceId =
    cleanText(
      row.kkp_pps_at_risk_source_row_id
    );

  const ppsId =
    cleanText(
      row.pps_site_id
    );

  return {
    id:
      sourceId ||
      ppsId ||
      `protection-${index}`,

    siteName:
      cleanText(
        row.kkp_pps_at_risk_site_name
      ) ||
      cleanText(
        row.phase1_3_site_name
      ) ||
      "Unnamed site",

    borough:
      cleanText(
        row.kkp_pps_borough
      ) ||
      cleanText(
        row.phase1_3_borough
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
        row.matched_to_phase1_3_ranked_flag
      ),

    assessedSiteId:
      cleanText(
        row.phase1_3_site_id
      ),

    assessedSiteName:
      cleanText(
        row.phase1_3_site_name
      ),

    postcode:
      cleanText(
        row.phase1_3_site_postcode
      ),

    currentPriority:
      cleanText(
        row.phase1_3_priority_category
      ),

    currentRisk:
      cleanText(
        row.phase1_3_risk_band
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
        row.outside_scope_reason_refined
      ) ||
      cleanText(
        row.outside_scope_reason_inferred
      ),

    note:
      cleanText(
        row.reconciliation_note
      ),
  };
}

/* =========================================================
   ROUTE
   ========================================================= */

export async function GET() {
  try {
    /*
      This follows the same plural GraphQL naming
      pattern as app_borough_summaries.

      SQL view:
      dbo.app_pps_reconciliation

      GraphQL root expected:
      app_pps_reconciliations
    */

    const query = `
      query ProtectionReconciliation {
        protection: app_pps_reconciliations {
          items {
            kkp_pps_at_risk_source_row_id
            kkp_pps_at_risk_site_name
            kkp_pps_borough

            pps_site_id
            active_places_site_id

            pps_playing_field_flag
            pps_at_risk_flag

            pps_ownership_type
            pps_management_type

            pps_security_of_tenure
            pps_community_use_flag

            matched_to_phase1_3_ranked_flag

            phase1_3_site_id
            phase1_3_site_name
            phase1_3_site_postcode
            phase1_3_borough

            phase1_3_priority_category
            phase1_3_risk_band

            match_method

            outside_scope_reason_refined
            kkp_pps_action_category
            outside_scope_reason_inferred

            reconciliation_status
            reconciliation_note
          }
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
              boroughSort !==
              0
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

    const outsideCurrentAssessment =
      counts.total -
      counts.currentAssessment;

    return NextResponse.json({
      success: true,

      counts: {
        ...counts,
        outsideCurrentAssessment,
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
