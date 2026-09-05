import { NextRequest, NextResponse } from "next/server";
import { fabricGraphQL } from "../../../../lib/fabricGraphql";

export const runtime = "nodejs";

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

  possible_3g_data_quality_flag: string | null;
  sv4_single_recorded_provision_flag: string | null;
  sv4_review_note: string | null;
  missing_imd_flag: string | null;
  missing_owner_flag: string | null;
  missing_management_flag: string | null;

  phase1_3_priority_change_flag: string | null;
  phase1_3_risk_band_change_flag: string | null;
  rf6_contributed_to_score_flag: string | null;
  rf6_changed_risk_band_flag: string | null;
  phase1_3_priority_change_driver: string | null;
  phase1_3_priority_change_reason_final: string | null;

  phase1_3_scope_tag: string | null;
  phase1_3_source_note: string | null;
  phase1_3_methodology_note: string | null;
};

type SiteDetailResponse = {
  app_site_details: {
    items: SiteDetail[];
  };
};

export async function GET(
  request: NextRequest,
  context: {
    params: Promise<{
      site_id: string;
    }>;
  }
): Promise<Response> {
  try {
    const { site_id } = await context.params;

    const siteId = Number(site_id);

    if (!Number.isInteger(siteId) || siteId <= 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid site ID",
        },
        {
          status: 400,
        }
      );
    }

    const query = `
      query GetSiteDetail(
        $filter: app_site_detailFilterInput
      ) {
        app_site_details(
          first: 1
          filter: $filter
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

            sv1_multi_pitch_scale_score
            sv2_full_size_3g_score
            sv3_strategic_sport_score
            sv4_share_of_borough_provision_score
            sv5_inner_london_score
            sv6_deprivation_score

            adult_football_rugby_pitch_units
            rugby_pitch_units
            cricket_pitch_units
            other_strategic_grass_pitch_units
            full_size_3g_pitch_units
            hockey_agp_pitch_units

            owner_type
            management_type

            rf1_ownership_exposure_score
            rf2_management_exposure_score
            rf3_pps_at_risk_score
            rf6_planning_pressure_score

            pps_critical_site_flag
            pps_community_use_flag
            pps_security_of_tenure
            pps_ownership_type
            pps_management_type

            planning_candidate_application_count
            confirmed_rf6_application_count
            nearest_planning_candidate_distance_metres
            rf6_scoring_status
            rf6_scoring_note

            review_reason

            possible_3g_data_quality_flag
            sv4_single_recorded_provision_flag
            sv4_review_note
            missing_imd_flag
            missing_owner_flag
            missing_management_flag

            phase1_3_priority_change_flag
            phase1_3_risk_band_change_flag
            rf6_contributed_to_score_flag
            rf6_changed_risk_band_flag
            phase1_3_priority_change_driver
            phase1_3_priority_change_reason_final

            phase1_3_scope_tag
            phase1_3_source_note
            phase1_3_methodology_note
          }
        }
      }
    `;

    const variables = {
      filter: {
        site_id: {
          eq: siteId,
        },
      },
    };

    const data =
      await fabricGraphQL<SiteDetailResponse>(
        query,
        variables
      );

    const site = data.app_site_details.items[0];

    if (!site) {
      return NextResponse.json(
        {
          success: false,
          error: "Site not found",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json({
      success: true,
      site,
    });
  } catch (error) {
    console.error("Site detail API failed:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unknown site detail API error",
      },
      {
        status: 500,
      }
    );
  }
}
