import { NextResponse } from "next/server";
import { fabricGraphQL } from "../../../lib/fabricGraphql";

export const runtime = "nodejs";

type BoroughSummary = {
  borough: string;

  current_playing_field_sites: number | null;

  priority_a_sites: number | null;
  priority_b_sites: number | null;
  priority_c_sites: number | null;
  strategic_monitor_sites: number | null;
  risk_review_sites: number | null;
  monitor_sites: number | null;

  sites_with_confirmed_rf6_score: number | null;
  sites_with_planning_review_evidence: number | null;

  high_risk_count: number | null;
  medium_risk_count: number | null;
  no_current_risk_count: number | null;

  pps_linked_count: number | null;
  known_at_risk_count: number | null;
  review_required_count: number | null;
  imd_decile_1_3_count: number | null;
};

type BoroughSummaryGraphQLResponse = {
  app_borough_summaries: {
    items: BoroughSummary[];
  };
};

function value(input: number | null | undefined) {
  return input ?? 0;
}

export async function GET(): Promise<Response> {
  try {
    const query = `
      query GetOverview {
        app_borough_summaries(first: 100) {
          items {
            borough

            current_playing_field_sites

            priority_a_sites
            priority_b_sites
            priority_c_sites
            strategic_monitor_sites
            risk_review_sites
            monitor_sites

            sites_with_confirmed_rf6_score
            sites_with_planning_review_evidence

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
      await fabricGraphQL<BoroughSummaryGraphQLResponse>(
        query
      );

    const boroughs =
      data.app_borough_summaries.items || [];

    const totals = boroughs.reduce(
      (accumulator, borough) => {
        accumulator.currentPlayingFieldSites +=
          value(borough.current_playing_field_sites);

        accumulator.priorityA +=
          value(borough.priority_a_sites);

        accumulator.priorityB +=
          value(borough.priority_b_sites);

        accumulator.priorityC +=
          value(borough.priority_c_sites);

        accumulator.strategicMonitor +=
          value(borough.strategic_monitor_sites);

        accumulator.riskReview +=
          value(borough.risk_review_sites);

        accumulator.monitor +=
          value(borough.monitor_sites);

        accumulator.confirmedRf6Sites +=
          value(
            borough.sites_with_confirmed_rf6_score
          );

        accumulator.planningReviewEvidenceSites +=
          value(
            borough.sites_with_planning_review_evidence
          );

        accumulator.highRisk +=
          value(borough.high_risk_count);

        accumulator.mediumRisk +=
          value(borough.medium_risk_count);

        accumulator.noCurrentRisk +=
          value(borough.no_current_risk_count);

        accumulator.ppsLinked +=
          value(borough.pps_linked_count);

        accumulator.knownAtRisk +=
          value(borough.known_at_risk_count);

        accumulator.reviewRequired +=
          value(borough.review_required_count);

        accumulator.imdDecile1To3 +=
          value(borough.imd_decile_1_3_count);

        return accumulator;
      },
      {
        currentPlayingFieldSites: 0,

        priorityA: 0,
        priorityB: 0,
        priorityC: 0,
        strategicMonitor: 0,
        riskReview: 0,
        monitor: 0,

        confirmedRf6Sites: 0,
        planningReviewEvidenceSites: 0,

        highRisk: 0,
        mediumRisk: 0,
        noCurrentRisk: 0,

        ppsLinked: 0,
        knownAtRisk: 0,
        reviewRequired: 0,
        imdDecile1To3: 0,
      }
    );

    const priorityCategoryTotal =
      totals.priorityA +
      totals.priorityB +
      totals.priorityC +
      totals.strategicMonitor +
      totals.riskReview +
      totals.monitor;

    const validation = {
      boroughCount: boroughs.length,

      categoryTotal: priorityCategoryTotal,

      populationMatchesCategories:
        priorityCategoryTotal ===
        totals.currentPlayingFieldSites,
    };

    const sortedBoroughs = [...boroughs].sort(
      (a, b) =>
        value(b.priority_a_sites) -
          value(a.priority_a_sites) ||
        value(b.priority_b_sites) -
          value(a.priority_b_sites) ||
        a.borough.localeCompare(b.borough)
    );

    return NextResponse.json({
      success: true,

      overview: {
        assessedSites:
          totals.currentPlayingFieldSites,

        boroughCount: boroughs.length,

        priorities: {
          priorityA: totals.priorityA,
          priorityB: totals.priorityB,
          priorityC: totals.priorityC,
          strategicMonitor:
            totals.strategicMonitor,
          riskReview: totals.riskReview,
          monitor: totals.monitor,
        },

        risk: {
          high: totals.highRisk,
          medium: totals.mediumRisk,
          noCurrentRisk:
            totals.noCurrentRisk,
        },

        planning: {
          confirmedRf6Sites:
            totals.confirmedRf6Sites,

          planningReviewEvidenceSites:
            totals.planningReviewEvidenceSites,
        },

        evidence: {
          ppsLinkedSites:
            totals.ppsLinked,

          knownAtRiskSites:
            totals.knownAtRisk,

          reviewRequiredSites:
            totals.reviewRequired,

          imdDecile1To3Sites:
            totals.imdDecile1To3,
        },
      },

      validation,

      boroughs: sortedBoroughs,
    });
  } catch (error) {
    console.error(
      "Overview API failed:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unknown overview API error",
      },
      {
        status: 500,
      }
    );
  }
}
