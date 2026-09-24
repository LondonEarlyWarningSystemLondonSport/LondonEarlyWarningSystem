import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type BoroughRow = {
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
): BoroughRow[] {
  if (!root) {
    return [];
  }

  if (Array.isArray(root)) {
    return root as BoroughRow[];
  }

  if (
    typeof root === "object" &&
    root !== null &&
    "items" in root
  ) {
    const items =
      (
        root as {
          items?: BoroughRow[];
        }
      ).items;

    return Array.isArray(items)
      ? items
      : [];
  }

  return [];
}

export async function GET() {
  try {
    const query = `
      query BoroughSummary {
        boroughs: app_borough_summaries {
          items {
            borough
            total_sites

            priority_a_count
            priority_b_count
            priority_c_count

            strategic_monitor_count
            risk_review_count
            monitor_count

            confirmed_planning_score_count
            planning_review_count

            high_risk_count
            medium_risk_count
            no_current_risk_count

            pps_linked_count
            known_at_risk_count
            review_required_count

            imd_decile_1_3_count
          }
        }
      }
    `;

    const data =
      await runGraphQL(query);

    const boroughs =
      getItems(
        data?.boroughs
      );

    boroughs.sort(
      (a, b) =>
        a.borough.localeCompare(
          b.borough
        )
    );

    const totals =
      boroughs.reduce(
        (
          acc,
          borough
        ) => {
          acc.sites +=
            borough.total_sites ||
            0;

          acc.priority +=
            (borough.priority_a_count ||
              0) +
            (borough.priority_b_count ||
              0) +
            (borough.priority_c_count ||
              0);

          acc.planningReview +=
            borough.planning_review_count ||
            0;

          acc.confirmedPlanning +=
            borough.confirmed_planning_score_count ||
            0;

          acc.knownAtRisk +=
            borough.known_at_risk_count ||
            0;

          acc.reviewRequired +=
            borough.review_required_count ||
            0;

          return acc;
        },
        {
          sites: 0,
          priority: 0,
          planningReview: 0,
          confirmedPlanning: 0,
          knownAtRisk: 0,
          reviewRequired: 0,
        }
      );

    return NextResponse.json({
      success: true,

      boroughCount:
        boroughs.length,

      totals,

      boroughs,
    });
  } catch (error) {
    console.error(
      "Borough API error:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        error:
          error instanceof Error
            ? error.message
            : "Unable to load borough summary.",
      },
      {
        status: 500,
      }
    );
  }
}
