import { NextRequest, NextResponse } from "next/server";
import { fabricGraphQL } from "../../../lib/fabricGraphql";

export const runtime = "nodejs";

type SiteSummary = {
  site_id: number;
  site_name: string;
  postcode: string | null;
  borough: string;
  latitude: number | null;
  longitude: number | null;
  playing_field_status: string | null;
  priority_category: string;
  priority_sort_order: number | null;
  strategic_value_score: number | null;
  strategic_value_band: string | null;
  risk_exposure_score: number | null;
  risk_band: string;
  risk_band_sort_order: number | null;
  known_at_risk: string | null;
  pps_linked: string | null;
  owner_type: string | null;
  management_type: string | null;
  imd_decile: number | null;
  planning_candidate_count: number | null;
  confirmed_planning_count: number | null;
  planning_review_required: string | null;
  planning_contributed_to_score: string | null;
  review_required: string | null;
  priority_changed: string | null;
  risk_band_changed: string | null;
  priority_change_driver: string | null;
  priority_change_reason: string | null;
};

type SitesResponse = {
  app_site_summaries: {
    items: SiteSummary[];
    endCursor: string | null;
    hasNextPage: boolean;
  };
};

function buildFilter(
  borough: string | null,
  priority: string | null,
  risk: string | null,
  search: string | null
) {
  const conditions: Record<string, unknown>[] = [];

  if (borough) {
    conditions.push({
      borough: {
        eq: borough,
      },
    });
  }

  if (priority) {
    conditions.push({
      priority_category: {
        eq: priority,
      },
    });
  }

  if (risk) {
    conditions.push({
      risk_band: {
        eq: risk,
      },
    });
  }

  if (search) {
    conditions.push({
      site_name: {
        contains: search.toUpperCase(),
      },
    });
  }

  if (conditions.length === 0) {
    return null;
  }

  if (conditions.length === 1) {
    return conditions[0];
  }

  return {
    and: conditions,
  };
}

export async function GET(request: NextRequest): Promise<Response> {
  try {
    const { searchParams } = new URL(request.url);

    const pageSizeRaw = Number(searchParams.get("pageSize") ?? "25");
    const pageSize = Math.min(
      Math.max(Number.isFinite(pageSizeRaw) ? pageSizeRaw : 25, 1),
      100
    );

    const after = searchParams.get("after");
    const borough = searchParams.get("borough");
    const priority = searchParams.get("priority");
    const risk = searchParams.get("risk");
    const search = searchParams.get("search");

    const filter = buildFilter(
      borough,
      priority,
      risk,
      search
    );

    const query = `
      query GetSites(
        $first: Int
        $after: String
        $filter: app_site_summaryFilterInput
      ) {
        app_site_summaries(
          first: $first
          after: $after
          filter: $filter
          orderBy: {
            priority_sort_order: ASC
            site_name: ASC
          }
        ) {
          items {
            site_id
            site_name
            postcode
            borough
            latitude
            longitude
            playing_field_status
            priority_category
            priority_sort_order
            strategic_value_score
            strategic_value_band
            risk_exposure_score
            risk_band
            risk_band_sort_order
            known_at_risk
            pps_linked
            owner_type
            management_type
            imd_decile
            planning_candidate_count
            confirmed_planning_count
            planning_review_required
            planning_contributed_to_score
            review_required
            priority_changed
            risk_band_changed
            priority_change_driver
            priority_change_reason
          }
          endCursor
          hasNextPage
        }
      }
    `;

    const variables = {
      first: pageSize,
      after: after || null,
      filter,
    };

    const data = await fabricGraphQL<SitesResponse>(
      query,
      variables
    );

    const result = data.app_site_summaries;

    return NextResponse.json({
      success: true,

      page: {
        pageSize,
        returned: result.items.length,
        hasNextPage: result.hasNextPage,
        endCursor: result.endCursor,
      },

      filters: {
        borough,
        priority,
        risk,
        search,
      },

      sites: result.items,
    });
  } catch (error) {
    console.error("Sites API failed:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unknown sites API error",
      },
      {
        status: 500,
      }
    );
  }
}
