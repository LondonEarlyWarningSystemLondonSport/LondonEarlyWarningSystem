import Link from "next/link";
import AppShell from "../../components/AppShell";

export default function AboutPage() {
  return (
    <AppShell>
      <main style={pageStyle}>
        <section style={heroStyle}>
          <div style={heroEyebrowStyle}>
            About the assessment
          </div>

          <h1 style={heroTitleStyle}>
            How the London Early Warning System works
          </h1>

          <p style={heroTextStyle}>
            The assessment brings together strategic value,
            current risk evidence, planning pressure and
            playing field context to help identify which
            sites may require the greatest attention.
          </p>

          <div style={heroActionsStyle}>
            <a
              href="#assessment"
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

        <section
          id="assessment"
          style={sectionWrapStyle}
        >
          <SectionHeading
            eyebrow="The purpose"
            title="What is the assessment trying to do?"
          />

          <div style={introGridStyle}>
            <div style={introPrimaryStyle}>
              <h3 style={introPrimaryTitleStyle}>
                Identify where attention may be needed
              </h3>

              <p style={bodyLargeStyle}>
                The London Early Warning System is a
                prioritisation tool for London playing
                fields. It is designed to help partners
                understand which current sites are
                strategically important, where risk
                signals exist and where further review or
                intervention may be appropriate.
              </p>

              <p style={bodyTextStyle}>
                It is an early warning and decision-support
                framework. It does not replace detailed
                local knowledge, planning assessment,
                Playing Pitch Strategies or professional
                judgement.
              </p>
            </div>

            <div style={principlesCardStyle}>
              <div style={cardEyebrowStyle}>
                Core principle
              </div>

              <div style={principleHeadlineStyle}>
                Strategic importance and risk are assessed
                separately.
              </div>

              <p style={bodyTextStyle}>
                A strategically important site is not
                automatically considered at risk. Equally,
                a site with strong risk evidence can still
                require attention even when its strategic
                value score is lower.
              </p>
            </div>
          </div>
        </section>

        <section style={sectionWrapStyle}>
          <SectionHeading
            eyebrow="Assessment flow"
            title="How a site moves through the assessment"
          />

          <div style={flowGridStyle}>
            <FlowStep
              number="01"
              title="Define the population"
              text="Start with the current playing field sites included within the Phase 1.3 ranked population."
            />

            <FlowArrow />

            <FlowStep
              number="02"
              title="Assess strategic value"
              text="Use six strategic value criteria to understand how important the site is to current playing field provision."
            />

            <FlowArrow />

            <FlowStep
              number="03"
              title="Assess risk exposure"
              text="Use ownership, management, PPS intelligence and planning-pressure evidence to identify current risk signals."
            />

            <FlowArrow />

            <FlowStep
              number="04"
              title="Assign priority"
              text="Combine the strategic value band and risk band through the risk-led priority matrix."
            />
          </div>
        </section>

        <section style={sectionWrapStyle}>
          <SectionHeading
            eyebrow="Assessment population"
            title="Which sites are included?"
          />

          <div style={scopePanelStyle}>
            <div>
              <div style={scopeNumberStyle}>
                1,492
              </div>

              <div style={scopeNumberLabelStyle}>
                current playing field sites
              </div>
            </div>

            <div style={scopeTextWrapStyle}>
              <p style={bodyTextStyle}>
                Phase 1.3 ranks the current playing field
                population carried forward from the earlier
                phases of the project.
              </p>

              <p style={bodyTextStyle}>
                Closed, dormant, derelict and other
                outside-scope protection cases are not
                forced into the Priority A, B or C ranking.
                They are retained separately within the
                protection and reconciliation evidence so
                they remain visible.
              </p>
            </div>
          </div>
        </section>

        <section style={sectionWrapStyle}>
          <SectionHeading
            eyebrow="Strategic value"
            title="How strategically important is the site?"
            description="Strategic Value measures characteristics that make a playing field important to London's current provision. The six criteria are considered together to produce a Strategic Value score and band."
          />

          <div style={criteriaGridStyle}>
            <CriterionCard
              code="SV1"
              title="Multi-pitch scale"
              purpose="Recognises sites that provide a larger concentration of adult or senior grass pitch provision."
              scoring={[
                "2–3 qualifying pitch units: 1 point",
                "4–5 qualifying pitch units: 2 points",
                "6 or more qualifying pitch units: 3 points",
              ]}
            />

            <CriterionCard
              code="SV2"
              title="Full-size 3G provision"
              purpose="Recognises full-size 3G provision because of its potential strategic role in supporting wider community use and capacity."
              scoring={[
                "1 full-size 3G: 2 points",
                "2 or more full-size 3Gs: 3 points",
              ]}
            />

            <CriterionCard
              code="SV3"
              title="Strategic sport provision"
              purpose="Recognises strategically important pitch provision such as cricket, hockey, rugby and other agreed strategic pitch sports."
              scoring={[
                "Score reflects the presence of strategic facility types",
                "Multiple qualifying facility types can increase the score",
              ]}
            />

            <CriterionCard
              code="SV4"
              title="Share of borough provision"
              purpose="Identifies sites that account for a significant share of the relevant recorded playing field provision within their borough."
              scoring={[
                "5% or more of relevant borough supply: 1 point",
                "10% or more: 2 points",
                "15% or more: 3 points",
              ]}
            />

            <CriterionCard
              code="SV5"
              title="Inner London"
              purpose="Recognises the particularly constrained playing field supply and reduced availability of alternatives within Inner London."
              scoring={[
                "Inner London site: 2 points",
              ]}
            />

            <CriterionCard
              code="SV6"
              title="Deprivation"
              purpose="Introduces an inequalities lens by recognising sites located within more deprived communities."
              scoring={[
                "IMD deciles 1–3: 2 points",
                "IMD deciles 4–5: 1 point",
                "Other deciles: 0 points",
              ]}
            />
          </div>

          <div style={bandPanelStyle}>
            <div style={bandPanelIntroStyle}>
              <div style={cardEyebrowStyle}>
                Strategic Value bands
              </div>

              <h3 style={bandPanelTitleStyle}>
                The combined score is translated into a
                simple strategic band.
              </h3>
            </div>

            <div style={bandGridStyle}>
              <BandCard
                value="9–13"
                label="High"
              />

              <BandCard
                value="5–8"
                label="Medium"
              />

              <BandCard
                value="1–4"
                label="Low"
              />

              <BandCard
                value="0"
                label="Not flagged"
              />
            </div>
          </div>
        </section>

        <section style={sectionWrapStyle}>
          <SectionHeading
            eyebrow="Risk exposure"
            title="What current risk signals are present?"
            description="Risk is assessed separately from strategic importance. The model currently uses four risk factors."
          />

          <div style={criteriaGridStyle}>
            <CriterionCard
              code="RF1"
              title="Ownership exposure"
              purpose="Groups ownership types according to their relative exposure to potential loss, reduced access or change."
              scoring={[
                "Lower exposure: 0",
                "Medium exposure: 1",
                "Higher exposure: 2",
              ]}
            />

            <CriterionCard
              code="RF2"
              title="Management exposure"
              purpose="Considers whether the current management arrangement creates additional exposure to loss or reduced access."
              scoring={[
                "Lower exposure: 0",
                "Medium exposure: 1",
                "Higher exposure: 2",
              ]}
            />

            <CriterionCard
              code="RF3"
              title="PPS known at-risk evidence"
              purpose="Uses relevant Playing Pitch Strategy and known at-risk intelligence to identify sites where an active concern is already recorded."
              scoring={[
                "Known at-risk evidence materially increases the risk assessment",
                "No known at-risk evidence does not add an RF3 score",
              ]}
            />

            <CriterionCard
              code="RF6"
              title="Planning pressure"
              purpose="Uses Planning London Datahub evidence to identify credible site-linked planning pressure while avoiding over-escalation from general nearby development."
              scoring={[
                "Strong site-linked evidence: RF6 score 3",
                "Very close sport or playing-field context: RF6 score 1",
                "Weaker nearby evidence: retained for review only",
                "No relevant evidence: RF6 score 0",
              ]}
            />
          </div>
        </section>

        <section style={sectionWrapStyle}>
          <SectionHeading
            eyebrow="Risk-led prioritisation"
            title="How the final priority category is assigned"
            description="The final category is determined from the combination of Strategic Value and Risk. Risk is deliberately allowed to elevate sites even when strategic value is lower."
          />

          <div style={matrixCardStyle}>
            <div style={matrixScrollStyle}>
              <table style={matrixTableStyle}>
                <thead>
                  <tr>
                    <th style={matrixCornerStyle}>
                      Strategic Value
                    </th>

                    <th style={matrixHeaderStyle}>
                      High Risk
                    </th>

                    <th style={matrixHeaderStyle}>
                      Medium Risk
                    </th>

                    <th style={matrixHeaderStyle}>
                      Low Risk
                    </th>

                    <th style={matrixHeaderStyle}>
                      No current risk signal
                    </th>
                  </tr>
                </thead>

                <tbody>
                  <tr>
                    <th style={matrixRowHeaderStyle}>
                      High
                    </th>

                    <MatrixCell
                      category="Priority A"
                      tone="a"
                    />

                    <MatrixCell
                      category="Priority C"
                      tone="c"
                    />

                    <MatrixCell
                      category="Strategic Monitor"
                      tone="strategic"
                    />

                    <MatrixCell
                      category="Strategic Monitor"
                      tone="strategic"
                    />
                  </tr>

                  <tr>
                    <th style={matrixRowHeaderStyle}>
                      Medium
                    </th>

                    <MatrixCell
                      category="Priority A"
                      tone="a"
                    />

                    <MatrixCell
                      category="Priority C"
                      tone="c"
                    />

                    <MatrixCell
                      category="Monitor"
                      tone="monitor"
                    />

                    <MatrixCell
                      category="Monitor"
                      tone="monitor"
                    />
                  </tr>

                  <tr>
                    <th style={matrixRowHeaderStyle}>
                      Low / Not flagged
                    </th>

                    <MatrixCell
                      category="Priority B"
                      tone="b"
                    />

                    <MatrixCell
                      category="Risk Review"
                      tone="review"
                    />

                    <MatrixCell
                      category="Monitor"
                      tone="monitor"
                    />

                    <MatrixCell
                      category="Monitor"
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
              tone="a"
              text="High risk combined with Medium or High Strategic Value. These sites represent the highest current strategic attention."
            />

            <PriorityExplanation
              label="Priority B"
              tone="b"
              text="High risk combined with lower Strategic Value. The risk-led approach keeps these sites visible rather than excluding them."
            />

            <PriorityExplanation
              label="Priority C"
              tone="c"
              text="Medium risk combined with Medium or High Strategic Value."
            />

            <PriorityExplanation
              label="Strategic Monitor"
              tone="strategic"
              text="High Strategic Value with Low or no current risk signal. These assets remain important even without current escalation."
            />

            <PriorityExplanation
              label="Risk Review"
              tone="review"
              text="Medium risk with lower Strategic Value. The evidence warrants review but is not treated as a confirmed active priority."
            />

            <PriorityExplanation
              label="Monitor"
              tone="monitor"
              text="Sites retained in the monitoring population where the current combination of risk and strategic value does not require escalation."
            />
          </div>
        </section>

        <section style={sectionWrapStyle}>
          <SectionHeading
            eyebrow="Planning pressure"
            title="How planning evidence is treated"
            description="Planning evidence is intentionally handled cautiously because nearby development does not automatically mean a playing field is threatened."
          />

          <div style={planningFlowStyle}>
            <PlanningStep
              number="01"
              title="Planning evidence identified"
              text="Applications and planning records with potential relevance to a playing field are identified."
            />

            <PlanningStep
              number="02"
              title="Evidence reviewed"
              text="The relationship between the planning record and the site is assessed. General nearby development is not automatically treated as a risk."
            />

            <PlanningStep
              number="03"
              title="Cautious RF6 score"
              text="Only sufficiently strong or very close site-linked evidence contributes to the RF6 planning-pressure score."
            />

            <PlanningStep
              number="04"
              title="Review-only evidence retained"
              text="Weaker evidence remains visible for manual review without automatically increasing the site's risk score."
            />
          </div>

          <div style={planningExampleStyle}>
            <div style={planningExampleHeaderStyle}>
              Why this distinction matters
            </div>

            <div style={planningExampleGridStyle}>
              <div style={planningExampleItemStyle}>
                <div style={planningExampleNumberStyle}>
                  446
                </div>

                <div style={planningExampleLabelStyle}>
                  sites currently have planning evidence
                  identified for review
                </div>
              </div>

              <div style={planningDividerStyle}>
                ≠
              </div>

              <div style={planningExampleItemStyle}>
                <div style={planningExampleNumberStyle}>
                  28
                </div>

                <div style={planningExampleLabelStyle}>
                  sites currently have a scored RF6
                  planning signal
                </div>
              </div>
            </div>

            <p style={planningCautionTextStyle}>
              A planning candidate is therefore not the
              same as a confirmed planning threat. The
              system separates evidence discovery from
              evidence strong enough to contribute to the
              risk assessment.
            </p>
          </div>
        </section>

        <section style={sectionWrapStyle}>
          <SectionHeading
            eyebrow="Evidence transparency"
            title="What happens when evidence is incomplete or uncertain?"
          />

          <div style={transparencyGridStyle}>
            <TransparencyCard
              title="Review flags remain visible"
              text="Sites with missing, conflicting or unusual evidence can be flagged for further review rather than silently treated as complete."
            />

            <TransparencyCard
              title="Planning evidence is traceable"
              text="Detailed planning evidence is retained separately from the site-level priority so individual applications can be reviewed."
            />

            <TransparencyCard
              title="PPS evidence is reconciled"
              text="Known at-risk PPS records are reconciled against the current ranked population, including cases that sit outside the current ranking scope."
            />

            <TransparencyCard
              title="The model supports judgement"
              text="The priority category is an evidence-led starting point for discussion and action. It is not intended to replace local professional knowledge."
            />
          </div>
        </section>

        <section style={limitationsStyle}>
          <div>
            <div style={limitationsEyebrowStyle}>
              Important to understand
            </div>

            <h2 style={limitationsTitleStyle}>
              This is an early warning system, not a
              prediction of site loss.
            </h2>
          </div>

          <div style={limitationsTextWrapStyle}>
            <p style={limitationsTextStyle}>
              A high priority category means that the
              current combination of strategic importance
              and risk evidence warrants greater attention.
              It does not mean that loss or redevelopment is
              certain.
            </p>

            <p style={limitationsTextStyle}>
              Likewise, a Monitor category does not mean
              that a site is unimportant. The assessment is
              designed to support proportionate monitoring
              and help partners focus attention where the
              available evidence indicates it may be most
              useful.
            </p>
          </div>
        </section>

        <section style={ctaStyle}>
          <div>
            <div style={ctaEyebrowStyle}>
              See the assessment in practice
            </div>

            <h2 style={ctaTitleStyle}>
              Explore the current London playing field
              population.
            </h2>

            <p style={ctaTextStyle}>
              View current priorities, filter by borough or
              risk and open individual site records to see
              the evidence behind each assessment.
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

function FlowStep({
  number,
  title,
  text,
}: {
  number: string;
  title: string;
  text: string;
}) {
  return (
    <div style={flowStepStyle}>
      <div style={flowNumberStyle}>
        {number}
      </div>

      <h3 style={flowTitleStyle}>
        {title}
      </h3>

      <p style={flowTextStyle}>
        {text}
      </p>
    </div>
  );
}

function FlowArrow() {
  return (
    <div style={flowArrowStyle}>
      →
    </div>
  );
}

function CriterionCard({
  code,
  title,
  purpose,
  scoring,
}: {
  code: string;
  title: string;
  purpose: string;
  scoring: string[];
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

      <p style={criterionPurposeStyle}>
        {purpose}
      </p>

      <div style={criterionDividerStyle} />

      <div style={criterionScoringLabelStyle}>
        How it contributes
      </div>

      <ul style={criterionListStyle}>
        {scoring.map((item) => (
          <li
            key={item}
            style={criterionListItemStyle}
          >
            {item}
          </li>
        ))}
      </ul>
    </article>
  );
}

function BandCard({
  value,
  label,
}: {
  value: string;
  label: string;
}) {
  return (
    <div style={bandCardStyle}>
      <div style={bandValueStyle}>
        {value}
      </div>

      <div style={bandLabelStyle}>
        {label}
      </div>
    </div>
  );
}

function MatrixCell({
  category,
  tone,
}: {
  category: string;
  tone:
    | "a"
    | "b"
    | "c"
    | "strategic"
    | "review"
    | "monitor";
}) {
  return (
    <td style={matrixCellStyle}>
      <span
        style={{
          ...matrixBadgeBaseStyle,
          ...getPriorityTone(tone),
        }}
      >
        {category}
      </span>
    </td>
  );
}

function PriorityExplanation({
  label,
  text,
  tone,
}: {
  label: string;
  text: string;
  tone:
    | "a"
    | "b"
    | "c"
    | "strategic"
    | "review"
    | "monitor";
}) {
  return (
    <article style={priorityExplanationStyle}>
      <span
        style={{
          ...matrixBadgeBaseStyle,
          ...getPriorityTone(tone),
        }}
      >
        {label}
      </span>

      <p style={priorityExplanationTextStyle}>
        {text}
      </p>
    </article>
  );
}

function PlanningStep({
  number,
  title,
  text,
}: {
  number: string;
  title: string;
  text: string;
}) {
  return (
    <article style={planningStepStyle}>
      <div style={planningStepNumberStyle}>
        {number}
      </div>

      <h3 style={planningStepTitleStyle}>
        {title}
      </h3>

      <p style={planningStepTextStyle}>
        {text}
      </p>
    </article>
  );
}

function TransparencyCard({
  title,
  text,
}: {
  title: string;
  text: string;
}) {
  return (
    <article style={transparencyCardStyle}>
      <div style={transparencyIconStyle}>
        ✓
      </div>

      <h3 style={transparencyTitleStyle}>
        {title}
      </h3>

      <p style={transparencyTextStyle}>
        {text}
      </p>
    </article>
  );
}

function getPriorityTone(
  tone:
    | "a"
    | "b"
    | "c"
    | "strategic"
    | "review"
    | "monitor"
) {
  switch (tone) {
    case "a":
      return {
        background: "#242424",
        color: "#ffffff",
      };

    case "b":
      return {
        background: "#b96800",
        color: "#ffffff",
      };

    case "c":
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

const pageStyle: React.CSSProperties = {
  maxWidth: "1440px",
  margin: "0 auto",
  padding: "38px 28px 90px",
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
  maxWidth: "940px",
  margin: "12px 0 18px",
  fontSize: "clamp(42px, 6vw, 72px)",
  lineHeight: 0.99,
  letterSpacing: "-0.052em",
  fontWeight: 900,
};

const heroTextStyle: React.CSSProperties = {
  maxWidth: "820px",
  color: "#c4c4c4",
  fontSize: "17px",
  lineHeight: 1.65,
  margin: 0,
};

const heroActionsStyle: React.CSSProperties = {
  display: "flex",
  gap: "10px",
  flexWrap: "wrap",
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
  marginBottom: "54px",
};

const sectionHeadingStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns:
    "minmax(0, 1fr) minmax(300px, 0.75fr)",
  gap: "40px",
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
  margin: "6px 0 0",
  maxWidth: "800px",
  fontSize: "32px",
  lineHeight: 1.08,
  letterSpacing: "-0.036em",
};

const sectionDescriptionStyle: React.CSSProperties = {
  margin: 0,
  color: "#666666",
  fontSize: "13px",
  lineHeight: 1.65,
};

const introGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns:
    "minmax(0, 1.5fr) minmax(300px, 0.7fr)",
  gap: "20px",
};

const introPrimaryStyle: React.CSSProperties = {
  background: "#ffffff",
  border: "1px solid #e2ded9",
  borderRadius: "18px",
  padding: "30px",
};

const introPrimaryTitleStyle: React.CSSProperties = {
  fontSize: "24px",
  letterSpacing: "-0.03em",
  margin: "0 0 13px",
};

const principlesCardStyle: React.CSSProperties = {
  background: "#f1ede8",
  borderRadius: "18px",
  padding: "30px",
};

const cardEyebrowStyle: React.CSSProperties = {
  color: "#e21b23",
  fontSize: "10px",
  fontWeight: 850,
  textTransform: "uppercase",
  letterSpacing: "0.08em",
};

const principleHeadlineStyle: React.CSSProperties = {
  fontSize: "21px",
  lineHeight: 1.25,
  letterSpacing: "-0.025em",
  fontWeight: 850,
  margin: "8px 0 12px",
};

const bodyLargeStyle: React.CSSProperties = {
  color: "#444444",
  fontSize: "16px",
  lineHeight: 1.7,
};

const bodyTextStyle: React.CSSProperties = {
  color: "#626262",
  fontSize: "13px",
  lineHeight: 1.65,
};

const flowGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns:
    "1fr auto 1fr auto 1fr auto 1fr",
  gap: "12px",
  alignItems: "stretch",
};

const flowStepStyle: React.CSSProperties = {
  background: "#ffffff",
  border: "1px solid #e2ded9",
  borderRadius: "15px",
  padding: "22px",
};

const flowNumberStyle: React.CSSProperties = {
  color: "#e21b23",
  fontSize: "11px",
  fontWeight: 900,
  letterSpacing: "0.08em",
};

const flowTitleStyle: React.CSSProperties = {
  margin: "12px 0 7px",
  fontSize: "16px",
  letterSpacing: "-0.02em",
};

const flowTextStyle: React.CSSProperties = {
  color: "#666666",
  fontSize: "12px",
  lineHeight: 1.55,
  margin: 0,
};

const flowArrowStyle: React.CSSProperties = {
  alignSelf: "center",
  color: "#aaa59f",
  fontSize: "22px",
};

const scopePanelStyle: React.CSSProperties = {
  background: "#171717",
  color: "#ffffff",
  borderRadius: "19px",
  padding: "34px",
  display: "grid",
  gridTemplateColumns: "240px 1fr",
  gap: "40px",
  alignItems: "center",
};

const scopeNumberStyle: React.CSSProperties = {
  fontSize: "64px",
  lineHeight: 1,
  fontWeight: 900,
  letterSpacing: "-0.05em",
};

const scopeNumberLabelStyle: React.CSSProperties = {
  color: "#bbbbbb",
  marginTop: "7px",
  fontSize: "12px",
};

const scopeTextWrapStyle: React.CSSProperties = {
  maxWidth: "850px",
};

const criteriaGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns:
    "repeat(3, minmax(0, 1fr))",
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
  justifyContent: "space-between",
};

const criterionCodeStyle: React.CSSProperties = {
  background: "#171717",
  color: "#ffffff",
  borderRadius: "7px",
  padding: "6px 8px",
  fontSize: "10px",
  fontWeight: 900,
  letterSpacing: "0.05em",
};

const criterionTitleStyle: React.CSSProperties = {
  margin: "16px 0 7px",
  fontSize: "18px",
  letterSpacing: "-0.025em",
};

const criterionPurposeStyle: React.CSSProperties = {
  minHeight: "66px",
  margin: 0,
  color: "#666666",
  fontSize: "12px",
  lineHeight: 1.55,
};

const criterionDividerStyle: React.CSSProperties = {
  height: "1px",
  background: "#ece8e3",
  margin: "17px 0",
};

const criterionScoringLabelStyle: React.CSSProperties = {
  color: "#777777",
  fontSize: "9px",
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  fontWeight: 850,
};

const criterionListStyle: React.CSSProperties = {
  margin: "9px 0 0",
  paddingLeft: "17px",
};

const criterionListItemStyle: React.CSSProperties = {
  color: "#555555",
  fontSize: "11px",
  lineHeight: 1.55,
  marginBottom: "5px",
};

const bandPanelStyle: React.CSSProperties = {
  marginTop: "18px",
  background: "#f1ede8",
  borderRadius: "16px",
  padding: "24px",
  display: "grid",
  gridTemplateColumns:
    "minmax(250px, 0.8fr) minmax(0, 1.5fr)",
  gap: "25px",
  alignItems: "center",
};

const bandPanelIntroStyle: React.CSSProperties = {
  maxWidth: "420px",
};

const bandPanelTitleStyle: React.CSSProperties = {
  fontSize: "18px",
  lineHeight: 1.4,
  margin: "7px 0 0",
};

const bandGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns:
    "repeat(4, minmax(0, 1fr))",
  gap: "10px",
};

const bandCardStyle: React.CSSProperties = {
  background: "#ffffff",
  borderRadius: "11px",
  padding: "16px",
};

const bandValueStyle: React.CSSProperties = {
  fontSize: "24px",
  fontWeight: 900,
  letterSpacing: "-0.03em",
};

const bandLabelStyle: React.CSSProperties = {
  marginTop: "4px",
  color: "#666666",
  fontSize: "11px",
  fontWeight: 750,
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
  borderCollapse: "separate",
  borderSpacing: "5px",
  minWidth: "880px",
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

const matrixRowHeaderStyle: React.CSSProperties = {
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

const matrixBadgeBaseStyle: React.CSSProperties = {
  display: "inline-flex",
  borderRadius: "999px",
  padding: "7px 10px",
  fontSize: "10px",
  lineHeight: 1.2,
  fontWeight: 850,
};

const priorityExplanationGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns:
    "repeat(3, minmax(0, 1fr))",
  gap: "12px",
  marginTop: "15px",
};

const priorityExplanationStyle: React.CSSProperties = {
  background: "#ffffff",
  border: "1px solid #e2ded9",
  borderRadius: "13px",
  padding: "17px",
};

const priorityExplanationTextStyle: React.CSSProperties = {
  margin: "11px 0 0",
  color: "#666666",
  fontSize: "11px",
  lineHeight: 1.55,
};

const planningFlowStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns:
    "repeat(4, minmax(0, 1fr))",
  gap: "13px",
};

const planningStepStyle: React.CSSProperties = {
  background: "#ffffff",
  border: "1px solid #e2ded9",
  borderRadius: "15px",
  padding: "21px",
};

const planningStepNumberStyle: React.CSSProperties = {
  color: "#e21b23",
  fontSize: "10px",
  fontWeight: 900,
};

const planningStepTitleStyle: React.CSSProperties = {
  margin: "10px 0 7px",
  fontSize: "15px",
};

const planningStepTextStyle: React.CSSProperties = {
  margin: 0,
  color: "#666666",
  fontSize: "11px",
  lineHeight: 1.55,
};

const planningExampleStyle: React.CSSProperties = {
  marginTop: "16px",
  background: "#fff8dc",
  border: "1px solid #eadb99",
  borderRadius: "15px",
  padding: "24px",
};

const planningExampleHeaderStyle: React.CSSProperties = {
  fontWeight: 850,
  fontSize: "13px",
  color: "#5f541f",
};

const planningExampleGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr auto 1fr",
  gap: "22px",
  alignItems: "center",
  marginTop: "16px",
};

const planningExampleItemStyle: React.CSSProperties = {
  background: "#ffffff",
  borderRadius: "11px",
  padding: "18px",
};

const planningExampleNumberStyle: React.CSSProperties = {
  fontSize: "34px",
  fontWeight: 900,
};

const planningExampleLabelStyle: React.CSSProperties = {
  color: "#68604a",
  fontSize: "11px",
  marginTop: "4px",
};

const planningDividerStyle: React.CSSProperties = {
  fontSize: "25px",
  fontWeight: 900,
  color: "#9a8735",
};

const planningCautionTextStyle: React.CSSProperties = {
  margin: "16px 0 0",
  color: "#5d541e",
  fontSize: "12px",
  lineHeight: 1.6,
};

const transparencyGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns:
    "repeat(4, minmax(0, 1fr))",
  gap: "13px",
};

const transparencyCardStyle: React.CSSProperties = {
  background: "#ffffff",
  border: "1px solid #e2ded9",
  borderRadius: "15px",
  padding: "20px",
};

const transparencyIconStyle: React.CSSProperties = {
  width: "28px",
  height: "28px",
  borderRadius: "50%",
  background: "#e7efea",
  color: "#365746",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontWeight: 900,
  fontSize: "12px",
};

const transparencyTitleStyle: React.CSSProperties = {
  margin: "13px 0 7px",
  fontSize: "15px",
};

const transparencyTextStyle: React.CSSProperties = {
  margin: 0,
  color: "#666666",
  fontSize: "11px",
  lineHeight: 1.55,
};

const limitationsStyle: React.CSSProperties = {
  background: "#171717",
  color: "#ffffff",
  borderRadius: "20px",
  padding: "34px",
  display: "grid",
  gridTemplateColumns:
    "minmax(280px, 0.8fr) minmax(0, 1.3fr)",
  gap: "40px",
  marginBottom: "50px",
};

const limitationsEyebrowStyle: React.CSSProperties = {
  color: "#ef5358",
  fontSize: "10px",
  fontWeight: 850,
  textTransform: "uppercase",
  letterSpacing: "0.08em",
};

const limitationsTitleStyle: React.CSSProperties = {
  margin: "7px 0 0",
  fontSize: "28px",
  lineHeight: 1.15,
  letterSpacing: "-0.035em",
};

const limitationsTextWrapStyle: React.CSSProperties = {
  alignSelf: "center",
};

const limitationsTextStyle: React.CSSProperties = {
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

