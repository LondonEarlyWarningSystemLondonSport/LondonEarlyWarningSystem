import { NextResponse } from "next/server";
import { fabricGraphQL } from "@/lib/fabricGraphql";

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
  };
};

export async function GET(): Promise<Response> {
  try {
    const query = `
      query {
        app_site_summaries(first: 2000) {
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
        }
      }
    `;

    const data = await fabricGraphQL<SitesResponse>(query);

    return NextResponse.json({
      success: true,
      count: data.app_site_summaries.items.length,
      sites: data.app_site_summaries.items,
    });
  } catch (error) {
    console.error("Sites API failed:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown sites API error",
      },
      { status: 500 }
    );
  }
}
