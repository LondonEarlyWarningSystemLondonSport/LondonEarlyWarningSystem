"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import type {
  CSSProperties,
} from "react";

import Link from "next/link";

import AppShell from "../../components/AppShell";

type ProtectionCategory =
  | "all"
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

  category:
    Exclude<
      ProtectionCategory,
      "all"
    >;

  categoryLabel: string;

  reason: string | null;
  note: string | null;

  actionCategory: string | null;
  reconciliationStatus: string | null;

  runDate: string | null;
};

type ProtectionResponse = {
  success: boolean;

  counts: {
    total: number;
    currentAssessment: number;
    protectionWatchlist: number;
    manualReconciliation: number;
    outsidePlayingFieldScope: number;
    outsideCurrentAssessment: number;
  };

  records: ProtectionRecord[];

  error?: string;
};

export default function ProtectionPage() {
  const [
    data,
    setData,
  ] =
    useState<ProtectionResponse | null>(
      null
    );

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    error,
    setError,
  ] =
    useState<string | null>(
      null
    );

  const [
    search,
    setSearch,
  ] =
    useState("");

  const [
    category,
    setCategory,
  ] =
    useState<ProtectionCategory>(
      "all"
    );

  const [
    borough,
    setBorough,
  ] =
    useState("all");

  useEffect(() => {
    let cancelled = false;

    async function loadProtection() {
      try {
        setLoading(true);
        setError(null);

        const response =
          await fetch(
            "/api/protection",
            {
              cache:
                "no-store",
            }
          );

        const result:
          ProtectionResponse =
          await response.json();

        if (
          !response.ok ||
          !result.success
        ) {
          throw new Error(
            result.error ||
              "Unable to load protection and reconciliation information."
          );
        }

        if (!cancelled) {
          setData(result);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load protection and reconciliation information."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadProtection();

    return () => {
      cancelled = true;
    };
  }, []);

  const boroughs =
    useMemo(() => {
      if (!data) {
        return [];
      }

      return Array.from(
        new Set(
          data.records.map(
            (record) =>
              record.borough
          )
        )
      ).sort(
        (
          a,
          b
        ) =>
          a.localeCompare(b)
      );
    }, [data]);

  const filteredRecords =
    useMemo(() => {
      if (!data) {
        return [];
      }

      const query =
        search
          .trim()
          .toLowerCase();

      return data.records.filter(
        (record) => {
          const matchesCategory =
            category ===
              "all" ||
            record.category ===
              category;

          const matchesBorough =
            borough ===
              "all" ||
            record.borough ===
              borough;

          const searchable =
            [
              record.siteName,
              record.borough,
              record.assessedSiteName,
              record.currentPriority,
              record.currentRisk,
              record.currentPlayingFieldStatus,
              record.ownershipType,
              record.managementType,
              record.reason,
              record.categoryLabel,
            ]
              .filter(Boolean)
              .join(" ")
              .toLowerCase();

          const matchesSearch =
            !query ||
            searchable.includes(
              query
            );

          return (
            matchesCategory &&
            matchesBorough &&
            matchesSearch
          );
        }
      );
    }, [
      data,
      search,
      category,
      borough,
    ]);

  if (loading) {
    return (
      <AppShell>
        <main style={pageStyle}>
          <div style={loadingCardStyle}>
            <div style={loadingTitleStyle}>
              Loading protection
              records
            </div>

            <div style={loadingTextStyle}>
              Retrieving the latest
              protection and
              reconciliation
              information.
            </div>
          </div>
        </main>
      </AppShell>
    );
  }

  if (
    error ||
    !data
  ) {
    return (
      <AppShell>
        <main style={pageStyle}>
          <div style={errorStyle}>
            <strong>
              Protection and
              reconciliation data
              could not be loaded.
            </strong>

            <div
              style={{
                marginTop:
                  "8px",
              }}
            >
              {error ||
                "Data unavailable."}
            </div>
          </div>
        </main>
      </AppShell>
    );
  }

  const evidenceDate =
    getLatestRunDate(
      data.records
    );

  return (
    <AppShell>
      <main style={pageStyle}>
        <section style={heroStyle}>
          <div style={heroEyebrowStyle}>
            Protection &
            Reconciliation
          </div>

          <h1 style={heroTitleStyle}>
            Keep known at-risk
            sites visible,
            including those
            outside the current
            assessment.
          </h1>

          <p style={heroTextStyle}>
            Known protection
            concerns are retained
            even where a site
            cannot currently be
            treated as part of the
            assessed playing-field
            population. This keeps
            closed, unlisted and
            unresolved cases
            visible for monitoring
            and further
            investigation.
          </p>

          <div style={heroMetaStyle}>
            <span>
              {formatNumber(
                data.counts.total
              )}{" "}
              known at-risk
              records
            </span>

            <span style={metaDotStyle}>
              •
            </span>

            <span>
              {formatNumber(
                data.counts
                  .currentAssessment
              )}{" "}
              currently assessed
            </span>

            <span style={metaDotStyle}>
              •
            </span>

            <span>
              {formatNumber(
                data.counts
                  .outsideCurrentAssessment
              )}{" "}
              retained separately
            </span>

            {evidenceDate && (
              <>
                <span style={metaDotStyle}>
                  •
                </span>

                <span>
                  Evidence snapshot{" "}
                  {evidenceDate}
                </span>
              </>
            )}
          </div>
        </section>

        <section style={sectionStyle}>
          <SectionHeading
            eyebrow="Coverage assurance"
            title="A protection case does not disappear because it sits outside the current assessment"
            description="The current assessment focuses on the playing-field population that can be assessed consistently. Other known-at-risk records are retained separately so that coverage gaps, closed sites and unresolved matches remain visible."
          />

          <div style={summaryGridStyle}>
            <SummaryCard
              value={
                data.counts
                  .currentAssessment
              }
              title="Current assessed at-risk"
              text="Known at-risk records matched to a site in the current assessed population."
              accent="#e21b23"
            />

            <SummaryCard
              value={
                data.counts
                  .protectionWatchlist
              }
              title="Protection watchlist"
              text="Closed, dormant or derelict cases retained because protection relevance may continue."
              accent="#d97832"
            />

            <SummaryCard
              value={
                data.counts
                  .manualReconciliation
              }
              title="Manual reconciliation"
              text="Records requiring further matching or a current-status check before they can be assessed confidently."
              accent="#72528c"
            />

            <SummaryCard
              value={
                data.counts
                  .outsidePlayingFieldScope
              }
              title="Outside current playing-field scope"
              text="Records retained for traceability even though PPS does not currently identify them as playing fields."
              accent="#526d77"
            />
          </div>
        </section>

        <section style={processSectionStyle}>
          <div style={processIntroStyle}>
            <div style={eyebrowStyle}>
              How records are
              handled
            </div>

            <h2 style={processTitleStyle}>
              One known at-risk
              evidence set,
              different handling
              depending on current
              status.
            </h2>

            <p style={processTextStyle}>
              Reconciliation keeps
              the evidence complete
              without forcing every
              historic or unresolved
              record into a current
              priority category.
            </p>
          </div>

          <div style={processGridStyle}>
            <ProcessStep
              number="01"
              title="Known concern"
              text="A record is retained from existing playing-pitch and protection intelligence."
            />

            <ProcessStep
              number="02"
              title="Current match"
              text="The record is checked against the current assessed playing-field population."
            />

            <ProcessStep
              number="03"
              title="Assess or retain"
              text="Matched sites receive the normal assessment. Other cases remain separately visible."
            />

            <ProcessStep
              number="04"
              title="Review over time"
              text="Unresolved and historic cases can be revisited as source data or site status changes."
            />
          </div>
        </section>

        <section style={sectionStyle}>
          <SectionHeading
            eyebrow="Register"
            title="Known at-risk sites"
            description="Search the full known at-risk evidence set and see how each record is currently handled."
          />

          <div style={tabsStyle}>
            <CategoryButton
              active={
                category === "all"
              }
              onClick={() =>
                setCategory("all")
              }
              label="All records"
              count={
                data.counts.total
              }
            />

            <CategoryButton
              active={
                category ===
                "current-assessment"
              }
              onClick={() =>
                setCategory(
                  "current-assessment"
                )
              }
              label="Current assessed"
              count={
                data.counts
                  .currentAssessment
              }
            />

            <CategoryButton
              active={
                category ===
                "protection-watchlist"
              }
              onClick={() =>
                setCategory(
                  "protection-watchlist"
                )
              }
              label="Protection watchlist"
              count={
                data.counts
                  .protectionWatchlist
              }
            />

            <CategoryButton
              active={
                category ===
                "manual-reconciliation"
              }
              onClick={() =>
                setCategory(
                  "manual-reconciliation"
                )
              }
              label="Manual reconciliation"
              count={
                data.counts
                  .manualReconciliation
              }
            />

            <CategoryButton
              active={
                category ===
                "outside-playing-field-scope"
              }
              onClick={() =>
                setCategory(
                  "outside-playing-field-scope"
                )
              }
              label="Outside current scope"
              count={
                data.counts
                  .outsidePlayingFieldScope
              }
            />
          </div>

          <div style={filtersStyle}>
            <div style={searchFieldStyle}>
              <label
                htmlFor="protection-search"
                style={fieldLabelStyle}
              >
                Search
              </label>

              <input
                id="protection-search"
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
                placeholder="Search site, borough or status"
                style={inputStyle}
              />
            </div>

            <div style={boroughFieldStyle}>
              <label
                htmlFor="protection-borough"
                style={fieldLabelStyle}
              >
                Borough
              </label>

              <select
                id="protection-borough"
                value={borough}
                onChange={(event) =>
                  setBorough(
                    event.target.value
                  )
                }
                style={selectStyle}
              >
                <option value="all">
                  All boroughs
                </option>

                {boroughs.map(
                  (
                    boroughName
                  ) => (
                    <option
                      key={
                        boroughName
                      }
                      value={
                        boroughName
                      }
                    >
                      {
                        boroughName
                      }
                    </option>
                  )
                )}
              </select>
            </div>
          </div>

          <div style={resultsBarStyle}>
            Showing{" "}
            <strong>
              {
                filteredRecords.length
              }
            </strong>{" "}
            of{" "}
            <strong>
              {data.counts.total}
            </strong>{" "}
            records
          </div>

          <div style={recordGridStyle}>
            {filteredRecords.map(
              (
                record
              ) => (
                <ProtectionCard
                  key={
                    record.id
                  }
                  record={
                    record
                  }
                />
              )
            )}
          </div>

          {filteredRecords.length ===
            0 && (
            <div style={emptyStyle}>
              No records match
              the current filters.
            </div>
          )}
        </section>

        <section style={interpretationStyle}>
          <div>
            <div style={interpretationEyebrowStyle}>
              Interpretation
            </div>

            <h2 style={interpretationTitleStyle}>
              Reconciliation status
              describes how the
              record is handled,
              not how important the
              site is.
            </h2>

            <p style={interpretationLeadStyle}>
              A site outside the
              current assessment may
              still warrant
              protection,
              investigation or
              future monitoring.
            </p>
          </div>

          <div style={interpretationGridStyle}>
            <InterpretationItem
              title="Current assessed"
              text="The protection record is linked to a current assessed playing field and can be viewed through the normal site assessment."
            />

            <InterpretationItem
              title="Protection watchlist"
              text="The site is closed, dormant or derelict, but remains relevant to protection monitoring."
            />

            <InterpretationItem
              title="Manual reconciliation"
              text="The evidence is retained while the current site identity, Active Places coverage or present status is checked."
            />

            <InterpretationItem
              title="Outside current scope"
              text="The record remains visible for assurance even though it is not currently identified as a playing field in PPS."
            />
          </div>
        </section>

        <section style={ctaStyle}>
          <div>
            <div style={ctaEyebrowStyle}>
              Current assessment
            </div>

            <h2 style={ctaTitleStyle}>
              Explore the sites
              currently included in
              the assessment.
            </h2>

            <p style={ctaTextStyle}>
              View current priority,
              risk, strategic value
              and supporting evidence
              across the assessed
              playing-field
              population.
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
  description: string;
}) {
  return (
    <div style={sectionHeadingStyle}>
      <div>
        <div style={eyebrowStyle}>
          {eyebrow}
        </div>

        <h2 style={sectionTitleStyle}>
          {title}
        </h2>
      </div>

      <p style={sectionDescriptionStyle}>
        {description}
      </p>
    </div>
  );
}

function SummaryCard({
  value,
  title,
  text,
  accent,
}: {
  value: number;
  title: string;
  text: string;
  accent: string;
}) {
  return (
    <article style={summaryCardStyle}>
      <div
        style={{
          ...summaryAccentStyle,
          background:
            accent,
        }}
      />

      <div style={summaryBodyStyle}>
        <div style={summaryValueStyle}>
          {formatNumber(
            value
          )}
        </div>

        <div style={summaryTitleStyle}>
          {title}
        </div>

        <p style={summaryTextStyle}>
          {text}
        </p>
      </div>
    </article>
  );
}

function ProcessStep({
  number,
  title,
  text,
}: {
  number: string;
  title: string;
  text: string;
}) {
  return (
    <div style={processStepStyle}>
      <div style={processNumberStyle}>
        {number}
      </div>

      <div style={processStepTitleStyle}>
        {title}
      </div>

      <div style={processStepTextStyle}>
        {text}
      </div>
    </div>
  );
}

function CategoryButton({
  active,
  onClick,
  label,
  count,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  count: number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        ...tabButtonStyle,
        ...(active
          ? activeTabButtonStyle
          : {}),
      }}
    >
      <span>
        {label}
      </span>

      <span
        style={{
          ...tabCountStyle,
          ...(active
            ? activeTabCountStyle
            : {}),
        }}
      >
        {count}
      </span>
    </button>
  );
}

function ProtectionCard({
  record,
}: {
  record: ProtectionRecord;
}) {
  const categoryColours =
    getCategoryColours(
      record.category
    );

  const sourceNameDiffers =
    record.assessedSiteName &&
    normaliseName(
      record.assessedSiteName
    ) !==
      normaliseName(
        record.siteName
      );

  return (
    <article style={recordCardStyle}>
      <div style={recordHeaderStyle}>
        <div style={recordHeadingStyle}>
          <div style={boroughStyle}>
            {record.borough}
          </div>

          <h3 style={recordTitleStyle}>
            {record.siteName}
          </h3>

          {record.postcode && (
            <div style={postcodeStyle}>
              {record.postcode}
            </div>
          )}
        </div>

        <span
          style={{
            ...statusBadgeStyle,
            background:
              categoryColours.background,
            color:
              categoryColours.text,
          }}
        >
          {record.categoryLabel}
        </span>
      </div>

      {record.matchedToCurrentAssessment ? (
        <>
          {sourceNameDiffers && (
            <div style={matchedSiteBoxStyle}>
              <div style={miniEyebrowStyle}>
                Current matched site
              </div>

              <div style={matchedSiteNameStyle}>
                {
                  record.assessedSiteName
                }
              </div>

              <div style={matchedExplanationStyle}>
                The known at-risk
                source record has
                been matched to this
                current assessed
                site.
              </div>
            </div>
          )}

          <div style={assessmentPanelStyle}>
            <div style={assessmentPanelHeadingStyle}>
              Current assessment
            </div>

            <div style={assessmentGridStyle}>
              <DataPoint
                label="Priority"
                value={
                  record.currentPriority ||
                  "Not recorded"
                }
              />

              <DataPoint
                label="Risk"
                value={
                  record.currentRisk ||
                  "Not recorded"
                }
              />

              <DataPoint
                label="Strategic value"
                value={
                  record.strategicValueBand ||
                  "Not recorded"
                }
              />

              <DataPoint
                label="Site status"
                value={
                  friendlySiteStatus(
                    record.currentPlayingFieldStatus
                  )
                }
              />
            </div>
          </div>

          <PlanningEvidence
            record={record}
          />
        </>
      ) : (
        <div style={outsidePanelStyle}>
          <div style={miniEyebrowStyle}>
            Why this record is
            handled separately
          </div>

          <div style={outsideReasonStyle}>
            {friendlyReason(
              record
            )}
          </div>
        </div>
      )}

      <div style={contextGridStyle}>
        <DataPoint
          label="PPS playing field"
          value={
            record.playingFieldInPps ||
            "Not recorded"
          }
        />

        <DataPoint
          label="Known at-risk evidence"
          value={
            record.knownAtRisk ||
            "Not recorded"
          }
        />

        <DataPoint
          label="Ownership"
          value={
            record.ownershipType ||
            "Not recorded"
          }
        />

        <DataPoint
          label="Management"
          value={
            record.managementType ||
            "Not recorded"
          }
        />

        {record.securityOfTenure && (
          <DataPoint
            label="Security of tenure"
            value={
              record.securityOfTenure
            }
          />
        )}

        {record.communityUse && (
          <DataPoint
            label="Community use"
            value={
              record.communityUse
            }
          />
        )}
      </div>

      {!record.matchedToCurrentAssessment &&
        record.activePlacesSiteId &&
        record.activePlacesSiteId !==
          "Unlisted" && (
          <div style={sourceContextStyle}>
            An Active Places ID is
            recorded, but the site is
            not currently included in
            the assessed
            playing-field population.
          </div>
        )}

      {!record.matchedToCurrentAssessment &&
        record.activePlacesSiteId ===
          "Unlisted" && (
          <div style={sourceContextStyle}>
            No Active Places site ID
            is currently recorded for
            this protection case.
          </div>
        )}

      <div style={recordFooterStyle}>
        {record.assessedSiteId ? (
          <Link
            href={`/site/${encodeURIComponent(
              record.assessedSiteId
            )}`}
            style={siteLinkStyle}
          >
            View current site
            assessment →
          </Link>
        ) : (
          <span style={notLinkedStyle}>
            No current assessed-site
            record
          </span>
        )}
      </div>
    </article>
  );
}

function PlanningEvidence({
  record,
}: {
  record: ProtectionRecord;
}) {
  const candidateCount =
    record.planningCandidateApplicationCount ||
    0;

  if (
    (record.planningPressureScore ||
      0) > 0
  ) {
    return (
      <div style={planningScoredStyle}>
        <div style={planningLabelStyle}>
          Planning evidence
        </div>

        <div style={planningTitleStyle}>
          Contributes to the
          Planning Pressure
          assessment
        </div>

        <div style={planningTextStyle}>
          {candidateCount >
          0
            ? `${candidateCount} planning evidence ${
                candidateCount ===
                1
                  ? "record was"
                  : "records were"
              } identified for this site.`
            : "Site-linked planning evidence contributes to the current risk assessment."}
        </div>
      </div>
    );
  }

  if (
    candidateCount > 0 ||
    record.planningReviewRequired ===
      "Yes"
  ) {
    return (
      <div style={planningReviewStyle}>
        <div style={planningLabelStyle}>
          Planning evidence
        </div>

        <div style={planningTitleStyle}>
          Retained for review
        </div>

        <div style={planningTextStyle}>
          {candidateCount}{" "}
          {candidateCount === 1
            ? "planning evidence record has"
            : "planning evidence records have"}{" "}
          been identified, but this
          evidence does not currently
          contribute directly to the
          Planning Pressure
          assessment.
        </div>
      </div>
    );
  }

  return null;
}

function DataPoint({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <div style={dataLabelStyle}>
        {label}
      </div>

      <div style={dataValueStyle}>
        {value}
      </div>
    </div>
  );
}

function InterpretationItem({
  title,
  text,
}: {
  title: string;
  text: string;
}) {
  return (
    <div style={interpretationItemStyle}>
      <div style={interpretationItemTitleStyle}>
        {title}
      </div>

      <div style={interpretationItemTextStyle}>
        {text}
      </div>
    </div>
  );
}

function friendlyReason(
  record: ProtectionRecord
) {
  const reason =
    (
      record.reason ||
      ""
    ).toLowerCase();

  if (
    record.category ===
    "protection-watchlist"
  ) {
    return "The site is recorded as closed, dormant or derelict. It is retained as a protection case rather than being forced into the current site assessment.";
  }

  if (
    record.category ===
    "outside-playing-field-scope"
  ) {
    return "The record is known to the protection evidence base but is not currently identified as a playing field in PPS.";
  }

  if (
    reason.includes(
      "unlisted in active places"
    )
  ) {
    return "The site is not currently listed in Active Places and requires further reconciliation before it can be linked confidently to the current assessment.";
  }

  if (
    reason.includes(
      "active places id present"
    )
  ) {
    return "An Active Places site ID exists, but the record is outside the current assessed playing-field population. Its current status therefore requires manual review.";
  }

  return "The site cannot currently be matched confidently into the assessed playing-field population and requires further reconciliation.";
}

function friendlySiteStatus(
  value: string | null
) {
  if (!value) {
    return "Not recorded";
  }

  return value;
}

function getLatestRunDate(
  records: ProtectionRecord[]
) {
  const dates =
    records
      .map(
        (record) =>
          record.runDate
      )
      .filter(
        (
          value
        ): value is string =>
          Boolean(value)
      );

  if (
    dates.length === 0
  ) {
    return null;
  }

  const latest =
    [...dates].sort().at(-1);

  if (
    !latest ||
    !/^\d{8}$/.test(
      latest
    )
  ) {
    return latest || null;
  }

  const year =
    Number(
      latest.slice(0, 4)
    );

  const month =
    Number(
      latest.slice(4, 6)
    );

  const day =
    Number(
      latest.slice(6, 8)
    );

  const date =
    new Date(
      Date.UTC(
        year,
        month - 1,
        day
      )
    );

  return new Intl.DateTimeFormat(
    "en-GB",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
      timeZone: "UTC",
    }
  ).format(date);
}

function normaliseName(
  value: string
) {
  return value
    .trim()
    .toUpperCase()
    .replace(
      /\s+/g,
      " "
    );
}

function getCategoryColours(
  category:
    ProtectionRecord["category"]
) {
  if (
    category ===
    "current-assessment"
  ) {
    return {
      background:
        "#f5d8da",
      text:
        "#8c1c22",
    };
  }

  if (
    category ===
    "protection-watchlist"
  ) {
    return {
      background:
        "#f7e3cf",
      text:
        "#804617",
    };
  }

  if (
    category ===
    "manual-reconciliation"
  ) {
    return {
      background:
        "#ece3f2",
      text:
        "#60417b",
    };
  }

  return {
    background:
      "#dfe9ec",
    text:
      "#385b65",
  };
}

function formatNumber(
  value: number
) {
  return value.toLocaleString(
    "en-GB"
  );
}

const pageStyle: CSSProperties = {
  maxWidth: "1440px",
  margin: "0 auto",
  padding: "34px 28px 80px",
};

const loadingCardStyle: CSSProperties = {
  background: "#ffffff",
  border: "1px solid #e3dfdb",
  borderRadius: "16px",
  padding: "30px",
  marginTop: "30px",
};

const loadingTitleStyle: CSSProperties = {
  fontSize: "18px",
  fontWeight: 850,
};

const loadingTextStyle: CSSProperties = {
  marginTop: "6px",
  color: "#707070",
  fontSize: "12px",
};

const errorStyle: CSSProperties = {
  marginTop: "30px",
  background: "#fff0f0",
  border: "1px solid #efb9bd",
  color: "#7b2026",
  borderRadius: "14px",
  padding: "22px",
};

const heroStyle: CSSProperties = {
  background: "#171717",
  color: "#ffffff",
  borderRadius: "24px",
  padding: "46px 52px",
  marginBottom: "44px",
};

const heroEyebrowStyle: CSSProperties = {
  color: "#ef555b",
  fontSize: "10px",
  fontWeight: 900,
  letterSpacing: "0.1em",
  textTransform: "uppercase",
};

const heroTitleStyle: CSSProperties = {
  maxWidth: "1050px",
  margin: "11px 0 17px",
  fontSize:
    "clamp(38px, 5vw, 62px)",
  lineHeight: 1.02,
  fontWeight: 900,
  letterSpacing: "-0.05em",
};

const heroTextStyle: CSSProperties = {
  maxWidth: "850px",
  margin: 0,
  color: "#c6c6c6",
  fontSize: "15px",
  lineHeight: 1.65,
};

const heroMetaStyle: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  gap: "9px",
  marginTop: "24px",
  fontSize: "11px",
  fontWeight: 800,
};

const metaDotStyle: CSSProperties = {
  color: "#6c6c6c",
};

const sectionStyle: CSSProperties = {
  marginBottom: "46px",
};

const sectionHeadingStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(300px, 1fr))",
  gap: "28px",
  alignItems: "end",
  marginBottom: "20px",
};

const eyebrowStyle: CSSProperties = {
  color: "#e21b23",
  fontSize: "10px",
  fontWeight: 900,
  letterSpacing: "0.09em",
  textTransform: "uppercase",
};

const sectionTitleStyle: CSSProperties = {
  margin: "6px 0 0",
  fontSize: "30px",
  lineHeight: 1.15,
  fontWeight: 850,
  letterSpacing: "-0.035em",
};

const sectionDescriptionStyle: CSSProperties = {
  maxWidth: "690px",
  margin: 0,
  color: "#666666",
  fontSize: "12px",
  lineHeight: 1.65,
};

const summaryGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(220px, 1fr))",
  gap: "14px",
};

const summaryCardStyle: CSSProperties = {
  overflow: "hidden",
  background: "#ffffff",
  border: "1px solid #e3dfdb",
  borderRadius: "16px",
};

const summaryAccentStyle: CSSProperties = {
  height: "5px",
};

const summaryBodyStyle: CSSProperties = {
  padding: "21px",
};

const summaryValueStyle: CSSProperties = {
  fontSize: "38px",
  fontWeight: 900,
  letterSpacing: "-0.05em",
};

const summaryTitleStyle: CSSProperties = {
  marginTop: "5px",
  fontSize: "12px",
  fontWeight: 850,
};

const summaryTextStyle: CSSProperties = {
  margin: "7px 0 0",
  color: "#6b6b6b",
  fontSize: "10px",
  lineHeight: 1.55,
};

const processSectionStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns:
    "minmax(260px, 0.8fr) minmax(500px, 1.7fr)",
  gap: "30px",
  padding: "28px",
  background: "#ffffff",
  border: "1px solid #e3dfdb",
  borderRadius: "18px",
  marginBottom: "46px",
};

const processIntroStyle: CSSProperties = {
  alignSelf: "center",
};

const processTitleStyle: CSSProperties = {
  margin: "7px 0 10px",
  fontSize: "27px",
  lineHeight: 1.17,
  letterSpacing: "-0.035em",
};

const processTextStyle: CSSProperties = {
  margin: 0,
  color: "#696969",
  fontSize: "11px",
  lineHeight: 1.6,
};

const processGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(150px, 1fr))",
  gap: "11px",
};

const processStepStyle: CSSProperties = {
  background: "#f7f4f0",
  borderRadius: "12px",
  padding: "16px",
};

const processNumberStyle: CSSProperties = {
  color: "#e21b23",
  fontSize: "9px",
  fontWeight: 900,
};

const processStepTitleStyle: CSSProperties = {
  marginTop: "8px",
  fontSize: "11px",
  fontWeight: 850,
};

const processStepTextStyle: CSSProperties = {
  marginTop: "6px",
  color: "#666666",
  fontSize: "9px",
  lineHeight: 1.5,
};

const tabsStyle: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: "7px",
  marginBottom: "14px",
};

const tabButtonStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
  border: "1px solid #ddd8d3",
  background: "#ffffff",
  color: "#444444",
  borderRadius: "999px",
  padding: "8px 11px",
  cursor: "pointer",
  fontSize: "9px",
  fontWeight: 800,
};

const activeTabButtonStyle: CSSProperties = {
  background: "#171717",
  color: "#ffffff",
  borderColor: "#171717",
};

const tabCountStyle: CSSProperties = {
  minWidth: "19px",
  padding: "2px 6px",
  borderRadius: "999px",
  background: "#f1eeeb",
  color: "#666666",
  textAlign: "center",
  fontSize: "8px",
};

const activeTabCountStyle: CSSProperties = {
  background: "#343434",
  color: "#ffffff",
};

const filtersStyle: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: "14px",
  alignItems: "end",
  background: "#ffffff",
  border: "1px solid #e3dfdb",
  borderRadius: "14px",
  padding: "15px",
};

const searchFieldStyle: CSSProperties = {
  flex: "1 1 380px",
};

const boroughFieldStyle: CSSProperties = {
  flex: "0 1 280px",
};

const fieldLabelStyle: CSSProperties = {
  display: "block",
  marginBottom: "6px",
  color: "#555555",
  fontSize: "9px",
  fontWeight: 850,
};

const inputStyle: CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  padding: "11px 12px",
  border: "1px solid #d7d2cd",
  borderRadius: "8px",
  background: "#ffffff",
  fontSize: "11px",
};

const selectStyle: CSSProperties = {
  width: "100%",
  padding: "11px 12px",
  border: "1px solid #d7d2cd",
  borderRadius: "8px",
  background: "#ffffff",
  fontSize: "11px",
};

const resultsBarStyle: CSSProperties = {
  margin: "13px 0",
  color: "#787878",
  fontSize: "10px",
};

const recordGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(350px, 1fr))",
  gap: "14px",
};

const recordCardStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  background: "#ffffff",
  border: "1px solid #e3dfdb",
  borderRadius: "16px",
  padding: "20px",
};

const recordHeaderStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: "14px",
};

const recordHeadingStyle: CSSProperties = {
  minWidth: 0,
};

const boroughStyle: CSSProperties = {
  color: "#e21b23",
  fontSize: "8px",
  fontWeight: 900,
  letterSpacing: "0.07em",
  textTransform: "uppercase",
};

const recordTitleStyle: CSSProperties = {
  margin: "5px 0 0",
  fontSize: "18px",
  lineHeight: 1.2,
  letterSpacing: "-0.025em",
};

const postcodeStyle: CSSProperties = {
  marginTop: "4px",
  color: "#858585",
  fontSize: "9px",
};

const statusBadgeStyle: CSSProperties = {
  flexShrink: 0,
  maxWidth: "150px",
  padding: "6px 9px",
  borderRadius: "999px",
  textAlign: "center",
  fontSize: "8px",
  lineHeight: 1.25,
  fontWeight: 850,
};

const matchedSiteBoxStyle: CSSProperties = {
  marginTop: "15px",
  padding: "12px",
  background: "#f4f1ed",
  borderRadius: "10px",
};

const miniEyebrowStyle: CSSProperties = {
  color: "#858585",
  fontSize: "8px",
  fontWeight: 850,
  textTransform: "uppercase",
  letterSpacing: "0.05em",
};

const matchedSiteNameStyle: CSSProperties = {
  marginTop: "5px",
  fontSize: "11px",
  fontWeight: 850,
};

const matchedExplanationStyle: CSSProperties = {
  marginTop: "4px",
  color: "#777777",
  fontSize: "9px",
  lineHeight: 1.45,
};

const assessmentPanelStyle: CSSProperties = {
  marginTop: "15px",
  padding: "13px",
  borderRadius: "11px",
  background: "#f7f4f0",
};

const assessmentPanelHeadingStyle: CSSProperties = {
  fontSize: "9px",
  fontWeight: 850,
};

const assessmentGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns:
    "repeat(2, minmax(0, 1fr))",
  gap: "13px",
  marginTop: "10px",
};

const planningScoredStyle: CSSProperties = {
  marginTop: "12px",
  padding: "12px",
  background: "#fbe8e9",
  border: "1px solid #efc5c7",
  borderRadius: "10px",
};

const planningReviewStyle: CSSProperties = {
  marginTop: "12px",
  padding: "12px",
  background: "#fff7dc",
  border: "1px solid #eadc9d",
  borderRadius: "10px",
};

const planningLabelStyle: CSSProperties = {
  color: "#777777",
  fontSize: "8px",
  fontWeight: 850,
  textTransform: "uppercase",
};

const planningTitleStyle: CSSProperties = {
  marginTop: "4px",
  fontSize: "10px",
  fontWeight: 850,
};

const planningTextStyle: CSSProperties = {
  marginTop: "4px",
  color: "#666666",
  fontSize: "9px",
  lineHeight: 1.5,
};

const outsidePanelStyle: CSSProperties = {
  marginTop: "15px",
  padding: "13px",
  background: "#fff7dc",
  border: "1px solid #eadc9d",
  borderRadius: "10px",
};

const outsideReasonStyle: CSSProperties = {
  marginTop: "6px",
  color: "#5f561f",
  fontSize: "10px",
  lineHeight: 1.55,
};

const contextGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns:
    "repeat(2, minmax(0, 1fr))",
  gap: "14px",
  marginTop: "17px",
};

const dataLabelStyle: CSSProperties = {
  color: "#8a8a8a",
  fontSize: "8px",
  fontWeight: 800,
  textTransform: "uppercase",
  letterSpacing: "0.04em",
};

const dataValueStyle: CSSProperties = {
  marginTop: "4px",
  color: "#292929",
  fontSize: "10px",
  fontWeight: 750,
  lineHeight: 1.4,
};

const sourceContextStyle: CSSProperties = {
  marginTop: "15px",
  paddingTop: "12px",
  borderTop: "1px solid #eeeae6",
  color: "#777777",
  fontSize: "9px",
  lineHeight: 1.5,
};

const recordFooterStyle: CSSProperties = {
  marginTop: "auto",
  paddingTop: "18px",
};

const siteLinkStyle: CSSProperties = {
  color: "#171717",
  textDecoration: "none",
  fontSize: "10px",
  fontWeight: 850,
};

const notLinkedStyle: CSSProperties = {
  color: "#999999",
  fontSize: "9px",
};

const emptyStyle: CSSProperties = {
  padding: "34px",
  textAlign: "center",
  color: "#777777",
  fontSize: "11px",
};

const interpretationStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(300px, 1fr))",
  gap: "30px",
  padding: "29px",
  marginBottom: "42px",
  background: "#171717",
  color: "#ffffff",
  borderRadius: "20px",
};

const interpretationEyebrowStyle: CSSProperties = {
  color: "#ef555b",
  fontSize: "9px",
  fontWeight: 900,
  textTransform: "uppercase",
  letterSpacing: "0.08em",
};

const interpretationTitleStyle: CSSProperties = {
  margin: "7px 0 9px",
  maxWidth: "560px",
  fontSize: "25px",
  lineHeight: 1.2,
  letterSpacing: "-0.035em",
};

const interpretationLeadStyle: CSSProperties = {
  maxWidth: "500px",
  margin: 0,
  color: "#bbbbbb",
  fontSize: "10px",
  lineHeight: 1.6,
};

const interpretationGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns:
    "repeat(2, minmax(0, 1fr))",
  gap: "11px",
};

const interpretationItemStyle: CSSProperties = {
  padding: "13px",
  background: "#252525",
  borderRadius: "10px",
};

const interpretationItemTitleStyle: CSSProperties = {
  fontSize: "9px",
  fontWeight: 850,
};

const interpretationItemTextStyle: CSSProperties = {
  marginTop: "5px",
  color: "#bdbdbd",
  fontSize: "9px",
  lineHeight: 1.5,
};

const ctaStyle: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "28px",
  padding: "29px",
  background: "#e21b23",
  color: "#ffffff",
  borderRadius: "20px",
};

const ctaEyebrowStyle: CSSProperties = {
  fontSize: "9px",
  fontWeight: 850,
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  opacity: 0.82,
};

const ctaTitleStyle: CSSProperties = {
  margin: "6px 0 8px",
  fontSize: "27px",
  letterSpacing: "-0.035em",
};

const ctaTextStyle: CSSProperties = {
  maxWidth: "700px",
  margin: 0,
  color: "#ffd8da",
  fontSize: "10px",
  lineHeight: 1.6,
};

const ctaButtonStyle: CSSProperties = {
  padding: "13px 18px",
  background: "#ffffff",
  color: "#171717",
  textDecoration: "none",
  borderRadius: "9px",
  fontSize: "10px",
  fontWeight: 850,
};
