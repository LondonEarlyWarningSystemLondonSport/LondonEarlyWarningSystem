"use client";

import {
  useEffect,
  useState,
} from "react";
import Link from "next/link";
import AppShell from "../../components/AppShell";

type OverviewData = {
  assessedSites: number;
  boroughCount: number;

  priorities: {
    priorityA: number;
    priorityB: number;
    priorityC: number;
    strategicMonitor: number;
    riskReview: number;
    monitor: number;
  };

  risk: {
    high: number;
    medium: number;
    noCurrentRisk: number;
  };

  planning: {
    confirmedRf6Sites: number;
    planningReviewEvidenceSites: number;
  };

  evidence: {
    ppsLinkedSites: number;
    knownAtRiskSites: number;
    reviewRequiredSites: number;
    imdDecile1To3Sites: number;
  };
};

type OverviewResponse = {
  success: boolean;
  overview?: OverviewData;
  validation?: {
    boroughCount: number;
    categoryTotal: number;
    populationMatchesCategories: boolean;
  };
  error?: string;
};

type Tone =
  | "priorityA"
  | "priorityB"
  | "priorityC"
  | "strategic"
  | "review"
  | "monitor";

export default function AboutPage() {
  const [overview, setOverview] =
    useState<OverviewData | null>(null);

  const [validation, setValidation] =
    useState<OverviewResponse["validation"]>();

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  useEffect(() => {
    async function loadOverview() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          "/api/overview",
          {
            cache: "no-store",
          }
        );

        const data: OverviewResponse =
          await response.json();

        if (
          !response.ok ||
          !data.success ||
          !data.overview
        ) {
          throw new Error(
            data.error ||
              "Unable to load current assessment"
          );
        }

        setOverview(data.overview);
        setValidation(data.validation);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load assessment"
        );
      } finally {
        setLoading(false);
      }
    }

    loadOverview();
  }, []);

  if (loading) {
    return (
      <AppShell>
        <main style={pageStyle}>
          <div style={loadingStyle}>
            Loading current assessment...
          </div>
        </main>
      </AppShell>
    );
  }

  if (error || !overview) {
    return (
      <AppShell>
        <main style={pageStyle}>
          <div style={errorStyle}>
            <strong>
              We could not load the current
              assessment information.
            </strong>

            <div style={{ marginTop: "6px" }}>
              {error ||
                "Assessment information unavailable"}
            </div>
          </div>
        </main>
      </AppShell>
    );
  }

  const currentPriorityTotal =
    overview.priorities.priorityA +
    overview.priorities.priorityB +
    overview.priorities.priorityC;

  const monitoringTotal =
    overview.priorities.strategicMonitor +
    overview.priorities.riskReview +
    overview.priorities.monitor;

  /*
    The current overview API exposes High,
    Medium and No Current Risk directly.

    Low Risk is therefore derived as the
    remaining assessed population.
  */
  const lowRisk =
    overview.assessedSites -
    overview.risk.high -
    overview.risk.medium -
    overview.risk.noCurrentRisk;

  const planningReviewOnly =
    overview.planning
      .planningReviewEvidenceSites -
    overview.planning.confirmedRf6Sites;

  return (
    <AppShell>
      <main style={pageStyle}>
        {/* HERO */}

        <section style={heroStyle}>
          <div style={heroEyebrowStyle}>
            Assessment & assurance
          </div>

          <h1 style={heroTitleStyle}>
            How the London Early Warning
            System works
          </h1>

          <p style={heroTextStyle}>
            The system provides a consistent
            evidence-led assessment of current
            London playing-field sites. It
            identifies where risk signals are
            present, considers how strategically
            important each site is and then
            assigns an appropriate priority or
            monitoring outcome.
          </p>

          <div style={heroActionsStyle}>
            <a
              href="#method"
              style={primaryActionStyle}
            >
              Understand the assessment ↓
            </a>

            <Link
              href="/sites"
              style={secondaryActionStyle}
            >
              Explore Sites →
            </Link>
          </div>
        </section>

        {/* ASSESSMENT AT A GLANCE */}

        <section style={sectionWrapStyle}>
          <SectionHeading
            eyebrow="Current assessment"
            title="Assessment at a glance"
            description="These figures are taken from the same governed assessment data used by the rest of the system."
          />

          <div style={headlineGridStyle}>
            <HeadlineMetric
              value={overview.assessedSites}
              label="sites in the current assessed population"
            />

            <HeadlineMetric
              value={overview.boroughCount}
              label="London boroughs represented"
            />

            <HeadlineMetric
              value={currentPriorityTotal}
              label="sites currently in Priority A, B or C"
            />

            <HeadlineMetric
              value={monitoringTotal}
              label="sites in monitoring or review categories"
            />
          </div>

          <div style={validationPanelStyle}>
            <div>
              <div style={validationLabelStyle}>
                Population reconciliation
              </div>

              <div style={validationHeadlineStyle}>
                Every assessed site is accounted
                for in a current priority or
                monitoring category.
              </div>
            </div>

            <div style={validationMathStyle}>
              <strong>
                {formatNumber(
                  validation?.categoryTotal ??
                    overview.assessedSites
                )}
              </strong>

              <span>
                {" "}
                category records
              </span>

              <span style={validationEqualsStyle}>
                =
              </span>

              <strong>
                {formatNumber(
                  overview.assessedSites
                )}
              </strong>

              <span>
                {" "}
                assessed sites
              </span>
            </div>
          </div>
        </section>

        {/* SCOPE */}

        <section style={sectionWrapStyle}>
          <SectionHeading
            eyebrow="Coverage"
            title="What does the assessment cover?"
          />

          <div style={scopeGridStyle}>
            <div style={scopePrimaryStyle}>
              <div style={scopeNumberStyle}>
                {formatNumber(
                  overview.assessedSites
                )}
              </div>

              <div style={scopeLabelStyle}>
                current assessed sites
              </div>

              <p style={scopeTextStyle}>
                The current assessment covers
                identified playing-field sites
                across London that meet the
                current assessment scope. Each
                site has a unique record and is
                considered using the same
                risk-led framework.
              </p>
            </div>

            <div style={scopeSecondaryStyle}>
              <div style={cardEyebrowStyle}>
                Protection cases remain visible
              </div>

              <h3 style={cardTitleStyle}>
                Being outside the assessed
                population does not mean a site
                has been discarded.
              </h3>

              <p style={bodyTextStyle}>
                Known protection cases that do
                not sit within the current
                assessed population, including
                certain closed, dormant,
                unmatched or other exceptional
                records, are retained separately
                within the protection and
                reconciliation evidence.
              </p>

              <p style={bodyTextStyle}>
                This prevents unresolved cases
                from being forced into a ranking
                simply to make the numbers fit.
              </p>
            </div>
          </div>
        </section>

        {/* METHOD */}

        <section
          id="method"
          style={sectionWrapStyle}
        >
          <SectionHeading
            eyebrow="Risk-led methodology"
            title="How each site is assessed"
            description="Risk and Strategic Value are assessed as separate dimensions. Because this is an early-warning system, Risk is considered first when interpreting the result."
          />

          <div style={methodFlowStyle}>
            <MethodCard
              number="01"
              eyebrow="Risk assessment"
              title="What evidence suggests the site may be vulnerable?"
              text="Ownership, management, known at-risk intelligence and planning-pressure evidence are considered to establish the current Risk band."
              emphasis
            />

            <div style={methodPlusStyle}>
              +
            </div>

            <MethodCard
              number="02"
              eyebrow="Strategic value"
              title="How important is the site to playing-field provision?"
              text="The scale, type and strategic context of the recorded provision are assessed to establish the site's Strategic Value band."
            />

            <div style={methodArrowStyle}>
              →
            </div>

            <MethodCard
              number="03"
              eyebrow="Priority outcome"
              title="What level of attention does the evidence suggest?"
              text="Risk and Strategic Value are brought together through the risk-led priority matrix to produce the site's current outcome."
            />
          </div>

          <div style={methodPrincipleStyle}>
            <strong>
              Why risk-led?
            </strong>{" "}
            A site with strong risk evidence
            should not disappear simply because
            its Strategic Value score is lower.
            Risk determines the escalation
            pathway, while Strategic Value helps
            determine the level and type of
            response.
          </div>
        </section>

        {/* RISK FIRST */}

        <section style={sectionWrapStyle}>
          <SectionHeading
            eyebrow="1. Risk assessment"
            title="What current risk signals are present?"
            description="Four evidence areas contribute to the current Risk assessment. The codes are retained for traceability, but the assessment is presented here in plain language."
          />

          <div style={criteriaGridStyle}>
            <AssessmentCriterion
              code="RF1"
              title="Ownership exposure"
              question="Does the ownership arrangement indicate greater exposure to loss, reduced access or change?"
              source="Ownership evidence associated with the current site record."
              interpretation="Ownership categories are grouped according to their relative exposure within the current risk model."
            />

            <AssessmentCriterion
              code="RF2"
              title="Management exposure"
              question="Does the way the site is currently managed indicate additional exposure?"
              source="Management evidence associated with the current site record."
              interpretation="Management arrangements are classified consistently according to their relative risk exposure."
            />

            <AssessmentCriterion
              code="RF3"
              title="Known at-risk evidence"
              question="Has the site already been identified through established playing-pitch or protection intelligence as being at risk?"
              source="Playing Pitch Strategy and reconciled known at-risk evidence."
              interpretation="Relevant known at-risk evidence materially increases the current Risk assessment."
            />

            <AssessmentCriterion
              code="RF6"
              title="Planning pressure"
              question="Is there sufficiently strong site-linked planning evidence to contribute to the current risk assessment?"
              source="London planning application evidence linked to assessed sites."
              interpretation="Planning evidence is treated cautiously. Nearby applications alone do not automatically increase Risk."
            />
          </div>

          <div style={riskBandPanelStyle}>
            <div>
              <div style={cardEyebrowStyle}>
                Current Risk bands
              </div>

              <h3 style={riskBandTitleStyle}>
                The assessment distinguishes
                four current levels of Risk.
              </h3>
            </div>

            <div style={riskBandGridStyle}>
              <RiskBandCard
                label="High"
                value={overview.risk.high}
                tone="high"
              />

              <RiskBandCard
                label="Medium"
                value={overview.risk.medium}
                tone="medium"
              />

              <RiskBandCard
                label="Low"
                value={lowRisk}
                tone="low"
              />

              <RiskBandCard
                label="No current risk signal"
                value={
                  overview.risk.noCurrentRisk
                }
                tone="none"
              />
            </div>
          </div>
        </section>

        {/* STRATEGIC VALUE */}

        <section style={sectionWrapStyle}>
          <SectionHeading
            eyebrow="2. Strategic value"
            title="How important is the site to playing-field provision?"
            description="Strategic Value is assessed independently from Risk. It describes characteristics that make a site particularly important within the current playing-field network."
          />

          <div style={criteriaGridStyle}>
            <AssessmentCriterion
              code="SV1"
              title="Multi-pitch scale"
              question="Does the site provide a significant concentration of adult or senior grass-pitch provision?"
              source="Recorded playing-field provision."
              interpretation="Larger concentrations of relevant pitch provision increase strategic importance."
            />

            <AssessmentCriterion
              code="SV2"
              title="Full-size 3G provision"
              question="Does the site provide full-size 3G provision?"
              source="Recorded facility provision."
              interpretation="Full-size 3G provision is recognised because of its potential strategic role in capacity and community use."
            />

            <AssessmentCriterion
              code="SV3"
              title="Strategic sport provision"
              question="Does the site support strategically important pitch sports?"
              source="Recorded grass and artificial pitch provision."
              interpretation="The assessment recognises strategic sports and facility types that may be difficult to replace."
            />

            <AssessmentCriterion
              code="SV4"
              title="Share of borough provision"
              question="Does the site account for a significant share of relevant recorded provision within its borough?"
              source="Borough-level provision derived from the assessed population."
              interpretation="Sites making a larger contribution to local supply receive greater strategic consideration."
            />

            <AssessmentCriterion
              code="SV5"
              title="Inner London context"
              question="Is the site located where playing-field supply is particularly constrained?"
              source="London geographic classification."
              interpretation="Inner London context is recognised because alternative playing-field provision is generally more constrained."
            />

            <AssessmentCriterion
              code="SV6"
              title="Deprivation"
              question="Does the site serve a more deprived community context?"
              source="Index of Multiple Deprivation."
              interpretation="Deprivation provides an inequalities lens within the Strategic Value assessment."
            />
          </div>

          <div style={thresholdNoticeStyle}>
            <div style={thresholdIconStyle}>
              i
            </div>

            <div>
              <strong>
                Detailed scoring rules
              </strong>

              <div style={thresholdTextStyle}>
                The current system retains the
                underlying criterion scores for
                audit and site-level review.
                Detailed numerical thresholds
                should only be published here
                once they have been formally
                verified against the implemented
                calculation rules.
              </div>
            </div>
          </div>
        </section>

        {/* MATRIX */}

        <section style={sectionWrapStyle}>
          <SectionHeading
            eyebrow="3. Priority outcome"
            title="How Risk and Strategic Value determine the outcome"
            description="The matrix is deliberately presented with Risk first. Risk determines the escalation pathway; Strategic Value then distinguishes the appropriate level of attention."
          />

          <div style={matrixCardStyle}>
            <div style={matrixScrollStyle}>
              <table style={matrixTableStyle}>
                <thead>
                  <tr>
                    <th style={matrixCornerStyle}>
                      Risk ↓ / Strategic Value →
                    </th>

                    <th style={matrixHeaderStyle}>
                      High
                    </th>

                    <th style={matrixHeaderStyle}>
                      Medium
                    </th>

                    <th style={matrixHeaderStyle}>
                      Low
                    </th>

                    <th style={matrixHeaderStyle}>
                      Not flagged
                    </th>
                  </tr>
                </thead>

                <tbody>
                  <tr>
                    <th style={matrixRiskHeaderStyle}>
                      High Risk
                    </th>

                    <MatrixCell
                      label="Priority A"
                      tone="priorityA"
                    />

                    <MatrixCell
                      label="Priority A"
                      tone="priorityA"
                    />

                    <MatrixCell
                      label="Priority B"
                      tone="priorityB"
                    />

                    <MatrixCell
                      label="Priority B"
                      tone="priorityB"
                    />
                  </tr>

                  <tr>
                    <th style={matrixRiskHeaderStyle}>
                      Medium Risk
                    </th>

                    <MatrixCell
                      label="Priority C"
                      tone="priorityC"
                    />

                    <MatrixCell
                      label="Priority C"
                      tone="priorityC"
                    />

                    <MatrixCell
                      label="Risk Review"
                      tone="review"
                    />

                    <MatrixCell
                      label="Risk Review"
                      tone="review"
                    />
                  </tr>

                  <tr>
                    <th style={matrixRiskHeaderStyle}>
                      Low Risk
                    </th>

                    <MatrixCell
                      label="Strategic Monitor"
                      tone="strategic"
                    />

                    <MatrixCell
                      label="Monitor"
                      tone="monitor"
                    />

                    <MatrixCell
                      label="Monitor"
                      tone="monitor"
                    />

                    <MatrixCell
                      label="Monitor"
                      tone="monitor"
                    />
                  </tr>

                  <tr>
                    <th style={matrixRiskHeaderStyle}>
                      No current risk signal
                    </th>

                    <MatrixCell
                      label="Strategic Monitor"
                      tone="strategic"
                    />

                    <MatrixCell
                      label="Monitor"
                      tone="monitor"
                    />

                    <MatrixCell
                      label="Monitor"
                      tone="monitor"
                    />

                    <MatrixCell
                      label="Monitor"
                      tone="monitor"
                    />
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div style={priorityExplanationGridStyle}>
            <PriorityExplanation
              label="Priority A"
              tone="priorityA"
              value={
                overview.priorities.priorityA
              }
              text="High Risk combined with High or Medium Strategic Value. These sites represent the highest current strategic attention."
            />

            <PriorityExplanation
              label="Priority B"
              tone="priorityB"
              value={
                overview.priorities.priorityB
              }
              text="High Risk combined with lower Strategic Value. The risk-led approach keeps these sites within an active priority pathway."
            />

            <PriorityExplanation
              label="Priority C"
              tone="priorityC"
              value={
                overview.priorities.priorityC
              }
              text="Medium Risk combined with High or Medium Strategic Value."
            />

            <PriorityExplanation
              label="Risk Review"
              tone="review"
              value={
                overview.priorities.riskReview
              }
              text="Medium Risk combined with lower Strategic Value. The evidence warrants review without implying a confirmed site-loss threat."
            />

            <PriorityExplanation
              label="Strategic Monitor"
              tone="strategic"
              value={
                overview.priorities
                  .strategicMonitor
              }
              text="High Strategic Value with only Low or no current Risk signal. These important assets remain under observation."
            />

            <PriorityExplanation
              label="Monitor"
              tone="monitor"
              value={
                overview.priorities.monitor
              }
              text="The current combination of Risk and Strategic Value does not require escalation, but the site remains within the monitored population."
            />
          </div>
        </section>

        {/* PLANNING ASSURANCE */}

        <section style={sectionWrapStyle}>
          <SectionHeading
            eyebrow="Planning evidence assurance"
            title="Finding planning evidence does not automatically mean a site is at risk"
            description="Planning evidence is deliberately separated into evidence discovery, review and evidence strong enough to contribute to the RF6 risk factor."
          />

          <div style={planningAssuranceStyle}>
            <div style={planningMetricStyle}>
              <div style={planningMetricNumberStyle}>
                {formatNumber(
                  overview.planning
                    .planningReviewEvidenceSites
                )}
              </div>

              <div style={planningMetricTitleStyle}>
                sites with planning evidence
                identified
              </div>

              <div style={planningMetricTextStyle}>
                Potentially relevant planning
                evidence has been identified and
                retained for assessment or
                review.
              </div>
            </div>

            <div style={planningOperatorStyle}>
              →
            </div>

            <div style={planningMetricStyle}>
              <div style={planningMetricNumberStyle}>
                {formatNumber(
                  Math.max(
                    planningReviewOnly,
                    0
                  )
                )}
              </div>

              <div style={planningMetricTitleStyle}>
                review-only sites
              </div>

              <div style={planningMetricTextStyle}>
                Planning evidence is visible,
                but it does not currently
                contribute an RF6 planning-risk
                score.
              </div>
            </div>

            <div style={planningPlusStyle}>
              +
            </div>

            <div
              style={{
                ...planningMetricStyle,
                ...planningScoredStyle,
              }}
            >
              <div style={planningMetricNumberStyle}>
                {formatNumber(
                  overview.planning
                    .confirmedRf6Sites
                )}
              </div>

              <div style={planningMetricTitleStyle}>
                sites with scored RF6 evidence
              </div>

              <div style={planningMetricTextStyle}>
                Evidence met the cautious
                site-linked rules required to
                contribute to the Risk
                assessment.
              </div>
            </div>
          </div>

          <div style={planningStatementStyle}>
            <strong>
              Key assurance:
            </strong>{" "}
            a nearby planning application is not
            automatically treated as a planning
            threat. Only evidence meeting the
            defined RF6 rules contributes to the
            Risk score. Other potentially
            relevant evidence remains visible
            for review.
          </div>
        </section>

        {/* SOURCES */}

        <section style={sectionWrapStyle}>
          <SectionHeading
            eyebrow="Evidence base"
            title="What information supports the assessment?"
            description="The system brings together multiple evidence sources rather than relying on a single dataset."
          />

          <div style={sourceGridStyle}>
            <SourceCard
              title="Active Places"
              text="Provides the core site and facility evidence used to identify and describe current sports provision."
            />

            <SourceCard
              title="Playing Pitch Strategy evidence"
              text="Provides local playing-pitch context, known at-risk intelligence and supporting site evidence where available."
            />

            <SourceCard
              title="Planning evidence"
              text="London planning application evidence is linked cautiously to sites to support the RF6 planning-pressure assessment."
            />

            <SourceCard
              title="Index of Multiple Deprivation"
              text="Provides the deprivation context used within the Strategic Value assessment."
            />

            <SourceCard
              title="Geographic context"
              text="Borough and London geography are used to understand local supply and the constrained Inner London context."
            />

            <SourceCard
              title="Protection intelligence"
              text="Known protection and at-risk evidence is reconciled against the current assessed population rather than being discarded when records do not align perfectly."
            />
          </div>
        </section>

        {/* ASSURANCE */}

        <section style={sectionWrapStyle}>
          <SectionHeading
            eyebrow="Data assurance"
            title="How do we make the results auditable?"
          />

          <div style={assuranceGridStyle}>
            <AssuranceCard
              title="One site, one assessed record"
              value={overview.assessedSites}
              text="The current assessment is structured at site level so every assessed site has a single current outcome."
            />

            <AssuranceCard
              title="Categories reconcile"
              value={
                validation?.categoryTotal ??
                overview.assessedSites
              }
              text="The six current priority and monitoring categories reconcile back to the assessed population."
            />

            <AssuranceCard
              title="PPS-linked sites"
              value={
                overview.evidence
                  .ppsLinkedSites
              }
              text="Sites with a current link to Playing Pitch Strategy evidence."
            />

            <AssuranceCard
              title="Review required"
              value={
                overview.evidence
                  .reviewRequiredSites
              }
              text="Records where the current evidence indicates that additional review is required."
            />
          </div>

          <div style={assurancePrinciplesStyle}>
            <AssurancePrinciple
              title="Missing evidence is not hidden"
              text="Missing or uncertain data can be surfaced through explicit review and data-quality flags."
            />

            <AssurancePrinciple
              title="Evidence and outcome remain separate"
              text="Planning candidates, PPS evidence and other supporting signals remain visible rather than being collapsed into a single unexplained score."
            />

            <AssurancePrinciple
              title="Exceptions are retained"
              text="Known protection records that do not fit cleanly into the current assessed population remain available through reconciliation rather than being forced into a category."
            />

            <AssurancePrinciple
              title="The assessment can be traced"
              text="Site-level records expose the Risk factors, Strategic Value factors and evidence context behind the current outcome."
            />
          </div>
        </section>

        {/* INTERPRETATION */}

        <section style={interpretationStyle}>
          <div>
            <div style={interpretationEyebrowStyle}>
              How to interpret the result
            </div>

            <h2 style={interpretationTitleStyle}>
              This is an early-warning system,
              not a prediction of site loss.
            </h2>
          </div>

          <div style={interpretationTextWrapStyle}>
            <p style={interpretationTextStyle}>
              A Priority category means that
              the current combination of Risk
              and Strategic Value warrants a
              greater level of attention. It
              does not mean that redevelopment,
              closure or loss is certain.
            </p>

            <p style={interpretationTextStyle}>
              Likewise, a Monitor category does
              not mean that a site is
              unimportant. Monitoring is an
              explicit outcome within the
              framework and allows emerging
              evidence to be reviewed over time.
            </p>

            <p style={interpretationTextStyle}>
              The assessment supports
              professional judgement and
              prioritisation. It does not replace
              local planning assessment,
              Playing Pitch Strategies or
              stakeholder knowledge.
            </p>
          </div>
        </section>

        {/* CTA */}

        <section style={ctaStyle}>
          <div>
            <div style={ctaEyebrowStyle}>
              See the evidence in practice
            </div>

            <h2 style={ctaTitleStyle}>
              Explore the current site
              assessments.
            </h2>

            <p style={ctaTextStyle}>
              Search by site, borough, priority
              or risk and open an individual
              site record to see the evidence
              behind its current assessment.
            </p>
          </div>

          <Link
            href="/sites"
            style={ctaButtonStyle}
          >
            Explore Sites →
          </Link>
        </section>
      </main>
    </AppShell>
  );
}

/* =========================================================
   COMPONENTS
   ========================================================= */

function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <div style={sectionHeadingStyle}>
      <div>
        <div style={sectionEyebrowStyle}>
          {eyebrow}
        </div>

        <h2 style={sectionTitleStyle}>
          {title}
        </h2>
      </div>

      {description && (
        <p style={sectionDescriptionStyle}>
          {description}
        </p>
      )}
    </div>
  );
}

function HeadlineMetric({
  value,
  label,
}: {
  value: number;
  label: string;
}) {
  return (
    <div style={headlineMetricStyle}>
      <div style={headlineValueStyle}>
        {formatNumber(value)}
      </div>

      <div style={headlineLabelStyle}>
        {label}
      </div>
    </div>
  );
}

function MethodCard({
  number,
  eyebrow,
  title,
  text,
  emphasis = false,
}: {
  number: string;
  eyebrow: string;
  title: string;
  text: string;
  emphasis?: boolean;
}) {
  return (
    <article
      style={{
        ...methodCardStyle,
        ...(emphasis
          ? methodCardEmphasisStyle
          : {}),
      }}
    >
      <div style={methodNumberStyle}>
        {number}
      </div>

      <div style={methodEyebrowStyle}>
        {eyebrow}
      </div>

      <h3 style={methodTitleStyle}>
        {title}
      </h3>

      <p style={methodTextStyle}>
        {text}
      </p>
    </article>
  );
}

function AssessmentCriterion({
  code,
  title,
  question,
  source,
  interpretation,
}: {
  code: string;
  title: string;
  question: string;
  source: string;
  interpretation: string;
}) {
  return (
    <article style={criterionCardStyle}>
      <div style={criterionHeaderStyle}>
        <span style={criterionCodeStyle}>
          {code}
        </span>
      </div>

      <h3 style={criterionTitleStyle}>
        {title}
      </h3>

      <div style={criterionQuestionStyle}>
        {question}
      </div>

      <div style={criterionDividerStyle} />

      <CriterionDetail
        label="Evidence"
        value={source}
      />

      <CriterionDetail
        label="How it is interpreted"
        value={interpretation}
      />
    </article>
  );
}

function CriterionDetail({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div style={criterionDetailStyle}>
      <div style={criterionDetailLabelStyle}>
        {label}
      </div>

      <div style={criterionDetailValueStyle}>
        {value}
      </div>
    </div>
  );
}

function RiskBandCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "high" | "medium" | "low" | "none";
}) {
  return (
    <div
      style={{
        ...riskBandCardStyle,
        ...getRiskTone(tone),
      }}
    >
      <div style={riskBandValueStyle}>
        {formatNumber(value)}
      </div>

      <div style={riskBandLabelStyle}>
        {label}
      </div>
    </div>
  );
}

function MatrixCell({
  label,
  tone,
}: {
  label: string;
  tone: Tone;
}) {
  return (
    <td style={matrixCellStyle}>
      <span
        style={{
          ...matrixBadgeStyle,
          ...getPriorityTone(tone),
        }}
      >
        {label}
      </span>
    </td>
  );
}

function PriorityExplanation({
  label,
  tone,
  value,
  text,
}: {
  label: string;
  tone: Tone;
  value: number;
  text: string;
}) {
  return (
    <article style={priorityExplanationStyle}>
      <div style={priorityExplanationHeaderStyle}>
        <span
          style={{
            ...matrixBadgeStyle,
            ...getPriorityTone(tone),
          }}
        >
          {label}
        </span>

        <strong style={priorityCountStyle}>
          {formatNumber(value)}
        </strong>
      </div>

      <p style={priorityExplanationTextStyle}>
        {text}
      </p>
    </article>
  );
}

function SourceCard({
  title,
  text,
}: {
  title: string;
  text: string;
}) {
  return (
    <article style={sourceCardStyle}>
      <h3 style={sourceTitleStyle}>
        {title}
      </h3>

      <p style={sourceTextStyle}>
        {text}
      </p>
    </article>
  );
}

function AssuranceCard({
  title,
  value,
  text,
}: {
  title: string;
  value: number;
  text: string;
}) {
  return (
    <article style={assuranceCardStyle}>
      <div style={assuranceValueStyle}>
        {formatNumber(value)}
      </div>

      <h3 style={assuranceTitleStyle}>
        {title}
      </h3>

      <p style={assuranceTextStyle}>
        {text}
      </p>
    </article>
  );
}

function AssurancePrinciple({
  title,
  text,
}: {
  title: string;
  text: string;
}) {
  return (
    <div style={assurancePrincipleStyle}>
      <div style={assuranceTickStyle}>
        ✓
      </div>

      <div>
        <div style={assurancePrincipleTitleStyle}>
          {title}
        </div>

        <div style={assurancePrincipleTextStyle}>
          {text}
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   HELPERS
   ========================================================= */

function formatNumber(value: number) {
  return value.toLocaleString("en-GB");
}

function getPriorityTone(
  tone: Tone
): React.CSSProperties {
  switch (tone) {
    case "priorityA":
      return {
        background: "#242424",
        color: "#ffffff",
      };

    case "priorityB":
      return {
        background: "#b96800",
        color: "#ffffff",
      };

    case "priorityC":
      return {
        background: "#f2d7a7",
        color: "#5f3900",
      };

    case "strategic":
      return {
        background: "#dfe9f7",
        color: "#174f8a",
      };

    case "review":
      return {
        background: "#eee4f4",
        color: "#674080",
      };

    default:
      return {
        background: "#ebe9e6",
        color: "#555555",
      };
  }
}

function getRiskTone(
  tone: "high" | "medium" | "low" | "none"
): React.CSSProperties {
  switch (tone) {
    case "high":
      return {
        background: "#ffe5cf",
        color: "#803600",
      };

    case "medium":
      return {
        background: "#fff2c7",
        color: "#665100",
      };

    case "low":
      return {
        background: "#e9eef4",
        color: "#40566d",
      };

    default:
      return {
        background: "#e7efea",
        color: "#365746",
      };
  }
}

/* =========================================================
   STYLES
   ========================================================= */

const pageStyle: React.CSSProperties = {
  maxWidth: "1440px",
  margin: "0 auto",
  padding: "38px 28px 90px",
};

const loadingStyle: React.CSSProperties = {
  padding: "80px 0",
  color: "#666666",
};

const errorStyle: React.CSSProperties = {
  marginTop: "30px",
  padding: "20px",
  borderRadius: "12px",
  background: "#fff0f0",
  border: "1px solid #efb9bb",
  color: "#7d2025",
};

const heroStyle: React.CSSProperties = {
  background: "#171717",
  color: "#ffffff",
  borderRadius: "24px",
  padding: "54px 52px",
  marginBottom: "52px",
  boxShadow:
    "0 22px 60px rgba(20,20,20,0.14)",
};

const heroEyebrowStyle: React.CSSProperties = {
  color: "#ef5358",
  fontSize: "11px",
  fontWeight: 850,
  textTransform: "uppercase",
  letterSpacing: "0.1em",
};

const heroTitleStyle: React.CSSProperties = {
  maxWidth: "980px",
  margin: "12px 0 18px",
  fontSize: "clamp(42px, 6vw, 72px)",
  lineHeight: 0.99,
  letterSpacing: "-0.052em",
  fontWeight: 900,
};

const heroTextStyle: React.CSSProperties = {
  maxWidth: "850px",
  margin: 0,
  color: "#c4c4c4",
  fontSize: "17px",
  lineHeight: 1.65,
};

const heroActionsStyle: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: "10px",
  marginTop: "28px",
};

const primaryActionStyle: React.CSSProperties = {
  background: "#e21b23",
  color: "#ffffff",
  textDecoration: "none",
  padding: "13px 18px",
  borderRadius: "9px",
  fontWeight: 850,
  fontSize: "13px",
};

const secondaryActionStyle: React.CSSProperties = {
  color: "#ffffff",
  textDecoration: "none",
  padding: "12px 18px",
  border: "1px solid #555555",
  borderRadius: "9px",
  fontWeight: 750,
  fontSize: "13px",
};

const sectionWrapStyle: React.CSSProperties = {
  marginBottom: "56px",
};

const sectionHeadingStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(300px, 1fr))",
  gap: "32px",
  alignItems: "end",
  marginBottom: "22px",
};

const sectionEyebrowStyle: React.CSSProperties = {
  color: "#e21b23",
  fontSize: "10px",
  fontWeight: 850,
  textTransform: "uppercase",
  letterSpacing: "0.09em",
};

const sectionTitleStyle: React.CSSProperties = {
  maxWidth: "820px",
  margin: "6px 0 0",
  fontSize: "32px",
  lineHeight: 1.08,
  letterSpacing: "-0.036em",
};

const sectionDescriptionStyle: React.CSSProperties = {
  maxWidth: "720px",
  margin: 0,
  color: "#666666",
  fontSize: "13px",
  lineHeight: 1.65,
};

const headlineGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(210px, 1fr))",
  gap: "14px",
};

const headlineMetricStyle: React.CSSProperties = {
  background: "#ffffff",
  border: "1px solid #e2ded9",
  borderRadius: "15px",
  padding: "22px",
};

const headlineValueStyle: React.CSSProperties = {
  fontSize: "42px",
  lineHeight: 1,
  fontWeight: 900,
  letterSpacing: "-0.045em",
};

const headlineLabelStyle: React.CSSProperties = {
  marginTop: "8px",
  color: "#666666",
  fontSize: "12px",
  lineHeight: 1.45,
};

const validationPanelStyle: React.CSSProperties = {
  marginTop: "14px",
  background: "#e7efea",
  color: "#365746",
  border: "1px solid #cadbce",
  borderRadius: "14px",
  padding: "20px 22px",
  display: "flex",
  flexWrap: "wrap",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "22px",
};

const validationLabelStyle: React.CSSProperties = {
  textTransform: "uppercase",
  fontSize: "9px",
  fontWeight: 850,
  letterSpacing: "0.08em",
};

const validationHeadlineStyle: React.CSSProperties = {
  marginTop: "4px",
  fontWeight: 800,
  fontSize: "13px",
};

const validationMathStyle: React.CSSProperties = {
  fontSize: "12px",
};

const validationEqualsStyle: React.CSSProperties = {
  padding: "0 10px",
  fontWeight: 900,
};

const scopeGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(320px, 1fr))",
  gap: "18px",
};

const scopePrimaryStyle: React.CSSProperties = {
  background: "#171717",
  color: "#ffffff",
  borderRadius: "18px",
  padding: "30px",
};

const scopeSecondaryStyle: React.CSSProperties = {
  background: "#f1ede8",
  borderRadius: "18px",
  padding: "30px",
};

const scopeNumberStyle: React.CSSProperties = {
  fontSize: "58px",
  fontWeight: 900,
  letterSpacing: "-0.05em",
};

const scopeLabelStyle: React.CSSProperties = {
  color: "#bcbcbc",
  fontSize: "12px",
};

const scopeTextStyle: React.CSSProperties = {
  marginTop: "20px",
  color: "#bdbdbd",
  fontSize: "13px",
  lineHeight: 1.65,
};

const cardEyebrowStyle: React.CSSProperties = {
  color: "#e21b23",
  fontSize: "10px",
  fontWeight: 850,
  textTransform: "uppercase",
  letterSpacing: "0.08em",
};

const cardTitleStyle: React.CSSProperties = {
  margin: "8px 0 12px",
  fontSize: "21px",
  lineHeight: 1.25,
  letterSpacing: "-0.025em",
};

const bodyTextStyle: React.CSSProperties = {
  color: "#626262",
  fontSize: "13px",
  lineHeight: 1.65,
};

const methodFlowStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns:
    "minmax(220px, 1fr) auto minmax(220px, 1fr) auto minmax(220px, 1fr)",
  gap: "12px",
  alignItems: "stretch",
  overflowX: "auto",
};

const methodCardStyle: React.CSSProperties = {
  minWidth: "220px",
  background: "#ffffff",
  border: "1px solid #e2ded9",
  borderRadius: "16px",
  padding: "22px",
};

const methodCardEmphasisStyle: React.CSSProperties = {
  borderTop: "5px solid #e21b23",
};

const methodNumberStyle: React.CSSProperties = {
  color: "#e21b23",
  fontSize: "10px",
  fontWeight: 900,
};

const methodEyebrowStyle: React.CSSProperties = {
  marginTop: "10px",
  color: "#777777",
  fontSize: "9px",
  fontWeight: 850,
  textTransform: "uppercase",
  letterSpacing: "0.08em",
};

const methodTitleStyle: React.CSSProperties = {
  margin: "7px 0",
  fontSize: "17px",
  lineHeight: 1.35,
};

const methodTextStyle: React.CSSProperties = {
  color: "#666666",
  fontSize: "11px",
  lineHeight: 1.55,
  margin: 0,
};

const methodPlusStyle: React.CSSProperties = {
  alignSelf: "center",
  fontSize: "24px",
  fontWeight: 900,
  color: "#aaa39d",
};

const methodArrowStyle: React.CSSProperties = {
  alignSelf: "center",
  fontSize: "24px",
  color: "#aaa39d",
};

const methodPrincipleStyle: React.CSSProperties = {
  marginTop: "16px",
  padding: "18px",
  borderLeft: "5px solid #e21b23",
  background: "#f4f1ed",
  borderRadius: "10px",
  color: "#555555",
  fontSize: "12px",
  lineHeight: 1.6,
};

const criteriaGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(280px, 1fr))",
  gap: "15px",
};

const criterionCardStyle: React.CSSProperties = {
  background: "#ffffff",
  border: "1px solid #e2ded9",
  borderRadius: "16px",
  padding: "22px",
};

const criterionHeaderStyle: React.CSSProperties = {
  display: "flex",
};

const criterionCodeStyle: React.CSSProperties = {
  background: "#171717",
  color: "#ffffff",
  borderRadius: "7px",
  padding: "6px 8px",
  fontSize: "10px",
  fontWeight: 900,
};

const criterionTitleStyle: React.CSSProperties = {
  margin: "16px 0 7px",
  fontSize: "18px",
};

const criterionQuestionStyle: React.CSSProperties = {
  color: "#444444",
  fontSize: "13px",
  fontWeight: 700,
  lineHeight: 1.5,
};

const criterionDividerStyle: React.CSSProperties = {
  height: "1px",
  background: "#ece8e3",
  margin: "17px 0",
};

const criterionDetailStyle: React.CSSProperties = {
  marginBottom: "13px",
};

const criterionDetailLabelStyle: React.CSSProperties = {
  color: "#888888",
  fontSize: "9px",
  fontWeight: 850,
  textTransform: "uppercase",
  letterSpacing: "0.07em",
};

const criterionDetailValueStyle: React.CSSProperties = {
  marginTop: "4px",
  color: "#606060",
  fontSize: "11px",
  lineHeight: 1.55,
};

const riskBandPanelStyle: React.CSSProperties = {
  marginTop: "18px",
  background: "#f1ede8",
  borderRadius: "16px",
  padding: "24px",
  display: "grid",
  gridTemplateColumns:
    "minmax(240px, 0.7fr) minmax(0, 1.4fr)",
  gap: "24px",
};

const riskBandTitleStyle: React.CSSProperties = {
  margin: "7px 0 0",
  fontSize: "19px",
};

const riskBandGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(120px, 1fr))",
  gap: "10px",
};

const riskBandCardStyle: React.CSSProperties = {
  borderRadius: "11px",
  padding: "16px",
};

const riskBandValueStyle: React.CSSProperties = {
  fontSize: "28px",
  fontWeight: 900,
};

const riskBandLabelStyle: React.CSSProperties = {
  fontSize: "10px",
  fontWeight: 750,
  marginTop: "4px",
};

const thresholdNoticeStyle: React.CSSProperties = {
  marginTop: "16px",
  padding: "17px",
  borderRadius: "12px",
  background: "#eef3f7",
  border: "1px solid #d5e0e8",
  display: "flex",
  gap: "12px",
};

const thresholdIconStyle: React.CSSProperties = {
  width: "24px",
  height: "24px",
  borderRadius: "50%",
  background: "#40566d",
  color: "#ffffff",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
  fontWeight: 900,
};

const thresholdTextStyle: React.CSSProperties = {
  marginTop: "4px",
  color: "#566270",
  fontSize: "11px",
  lineHeight: 1.55,
};

const matrixCardStyle: React.CSSProperties = {
  background: "#ffffff",
  border: "1px solid #e2ded9",
  borderRadius: "18px",
  padding: "18px",
};

const matrixScrollStyle: React.CSSProperties = {
  overflowX: "auto",
};

const matrixTableStyle: React.CSSProperties = {
  width: "100%",
  minWidth: "900px",
  borderCollapse: "separate",
  borderSpacing: "5px",
};

const matrixCornerStyle: React.CSSProperties = {
  background: "#171717",
  color: "#ffffff",
  borderRadius: "9px",
  padding: "16px",
  textAlign: "left",
  fontSize: "11px",
};

const matrixHeaderStyle: React.CSSProperties = {
  background: "#f1eeea",
  borderRadius: "9px",
  padding: "16px",
  textAlign: "center",
  fontSize: "11px",
  fontWeight: 850,
};

const matrixRiskHeaderStyle: React.CSSProperties = {
  background: "#f1eeea",
  borderRadius: "9px",
  padding: "16px",
  textAlign: "left",
  fontSize: "11px",
  fontWeight: 850,
};

const matrixCellStyle: React.CSSProperties = {
  background: "#faf9f7",
  borderRadius: "9px",
  padding: "20px 12px",
  textAlign: "center",
};

const matrixBadgeStyle: React.CSSProperties = {
  display: "inline-flex",
  borderRadius: "999px",
  padding: "7px 10px",
  fontSize: "10px",
  fontWeight: 850,
  whiteSpace: "nowrap",
};

const priorityExplanationGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(280px, 1fr))",
  gap: "12px",
  marginTop: "15px",
};

const priorityExplanationStyle: React.CSSProperties = {
  background: "#ffffff",
  border: "1px solid #e2ded9",
  borderRadius: "13px",
  padding: "17px",
};

const priorityExplanationHeaderStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: "15px",
  alignItems: "center",
};

const priorityCountStyle: React.CSSProperties = {
  fontSize: "20px",
};

const priorityExplanationTextStyle: React.CSSProperties = {
  margin: "11px 0 0",
  color: "#666666",
  fontSize: "11px",
  lineHeight: 1.55,
};

const planningAssuranceStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns:
    "minmax(200px, 1fr) auto minmax(200px, 1fr) auto minmax(200px, 1fr)",
  gap: "12px",
  alignItems: "stretch",
  overflowX: "auto",
};

const planningMetricStyle: React.CSSProperties = {
  minWidth: "200px",
  background: "#ffffff",
  border: "1px solid #e2ded9",
  borderRadius: "15px",
  padding: "21px",
};

const planningScoredStyle: React.CSSProperties = {
  borderTop: "5px solid #e21b23",
};

const planningMetricNumberStyle: React.CSSProperties = {
  fontSize: "38px",
  fontWeight: 900,
  letterSpacing: "-0.04em",
};

const planningMetricTitleStyle: React.CSSProperties = {
  marginTop: "8px",
  fontWeight: 850,
  fontSize: "12px",
};

const planningMetricTextStyle: React.CSSProperties = {
  marginTop: "6px",
  color: "#666666",
  fontSize: "10px",
  lineHeight: 1.5,
};

const planningOperatorStyle: React.CSSProperties = {
  alignSelf: "center",
  color: "#aaa39d",
  fontSize: "23px",
};

const planningPlusStyle: React.CSSProperties = {
  alignSelf: "center",
  color: "#aaa39d",
  fontSize: "23px",
  fontWeight: 900,
};

const planningStatementStyle: React.CSSProperties = {
  marginTop: "16px",
  padding: "17px",
  background: "#fff8dc",
  border: "1px solid #eadb99",
  borderRadius: "12px",
  color: "#5d541e",
  fontSize: "12px",
  lineHeight: 1.6,
};

const sourceGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(250px, 1fr))",
  gap: "13px",
};

const sourceCardStyle: React.CSSProperties = {
  background: "#ffffff",
  border: "1px solid #e2ded9",
  borderRadius: "14px",
  padding: "19px",
};

const sourceTitleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: "15px",
};

const sourceTextStyle: React.CSSProperties = {
  margin: "7px 0 0",
  color: "#666666",
  fontSize: "11px",
  lineHeight: 1.55,
};

const assuranceGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(220px, 1fr))",
  gap: "13px",
};

const assuranceCardStyle: React.CSSProperties = {
  background: "#ffffff",
  border: "1px solid #e2ded9",
  borderRadius: "15px",
  padding: "20px",
};

const assuranceValueStyle: React.CSSProperties = {
  fontSize: "31px",
  fontWeight: 900,
};

const assuranceTitleStyle: React.CSSProperties = {
  margin: "7px 0",
  fontSize: "14px",
};

const assuranceTextStyle: React.CSSProperties = {
  color: "#666666",
  fontSize: "10px",
  lineHeight: 1.5,
};

const assurancePrinciplesStyle: React.CSSProperties = {
  marginTop: "15px",
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(280px, 1fr))",
  gap: "11px",
};

const assurancePrincipleStyle: React.CSSProperties = {
  background: "#f1ede8",
  borderRadius: "12px",
  padding: "16px",
  display: "flex",
  gap: "10px",
};

const assuranceTickStyle: React.CSSProperties = {
  width: "24px",
  height: "24px",
  borderRadius: "50%",
  background: "#e7efea",
  color: "#365746",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
  fontSize: "10px",
  fontWeight: 900,
};

const assurancePrincipleTitleStyle: React.CSSProperties = {
  fontWeight: 850,
  fontSize: "11px",
};

const assurancePrincipleTextStyle: React.CSSProperties = {
  marginTop: "4px",
  color: "#686868",
  fontSize: "10px",
  lineHeight: 1.5,
};

const interpretationStyle: React.CSSProperties = {
  background: "#171717",
  color: "#ffffff",
  borderRadius: "20px",
  padding: "34px",
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(300px, 1fr))",
  gap: "40px",
  marginBottom: "50px",
};

const interpretationEyebrowStyle: React.CSSProperties = {
  color: "#ef5358",
  fontSize: "10px",
  fontWeight: 850,
  textTransform: "uppercase",
  letterSpacing: "0.08em",
};

const interpretationTitleStyle: React.CSSProperties = {
  margin: "7px 0 0",
  fontSize: "28px",
  lineHeight: 1.15,
  letterSpacing: "-0.035em",
};

const interpretationTextWrapStyle: React.CSSProperties = {
  alignSelf: "center",
};

const interpretationTextStyle: React.CSSProperties = {
  color: "#bdbdbd",
  fontSize: "12px",
  lineHeight: 1.65,
};

const ctaStyle: React.CSSProperties = {
  background: "#e21b23",
  color: "#ffffff",
  borderRadius: "20px",
  padding: "34px",
  display: "flex",
  flexWrap: "wrap",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "35px",
};

const ctaEyebrowStyle: React.CSSProperties = {
  fontSize: "10px",
  fontWeight: 850,
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  opacity: 0.8,
};

const ctaTitleStyle: React.CSSProperties = {
  margin: "6px 0 9px",
  fontSize: "29px",
  letterSpacing: "-0.035em",
};

const ctaTextStyle: React.CSSProperties = {
  maxWidth: "720px",
  margin: 0,
  color: "#ffd5d7",
  fontSize: "12px",
  lineHeight: 1.6,
};

const ctaButtonStyle: React.CSSProperties = {
  background: "#ffffff",
  color: "#171717",
  textDecoration: "none",
  padding: "13px 19px",
  borderRadius: "9px",
  fontSize: "12px",
  fontWeight: 850,
  whiteSpace: "nowrap",
};
