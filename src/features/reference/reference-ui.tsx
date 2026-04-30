import { Search, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";

import { Badge } from "@/components/ui/badge";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FilterChips } from "@/components/ui/filter-chips";
import { PageHero } from "@/components/ui/page-hero";
import { RecentList, type RecentListItem } from "@/components/ui/recent-list";
import { SectionTabs } from "@/components/ui/section-tabs";
import { SideRail } from "@/components/ui/side-rail";
import { TopicTOC } from "@/components/ui/topic-toc";
import type {
  ArmoryItem,
  CitationBackedText,
  EffectiveRuleRecord,
  GlossaryTerm,
  RuleSection,
  RuleSubsection,
  SourceCitation,
  SourceDocument,
  WeaponProfile,
} from "@/lib/types/domain";
import type { RulesDatasetFile, SearchIndexRecord } from "@/lib/types/generated";

import { loadStoredRosters } from "@/features/builder/roster-builder";
import { loadStoredMatches } from "@/features/matches/match-tracker";

import { useReferenceData } from "./use-reference-data";

function sortSearchResults(records: SearchIndexRecord[], query: string) {
  const normalizedQuery = query.trim().toLowerCase();

  return [...records].sort((left, right) => {
    const leftStarts = left.title.toLowerCase().startsWith(normalizedQuery) ? 0 : 1;
    const rightStarts = right.title.toLowerCase().startsWith(normalizedQuery) ? 0 : 1;

    if (leftStarts !== rightStarts) {
      return leftStarts - rightStarts;
    }

    return left.title.localeCompare(right.title);
  });
}

function splitClauses(text: string) {
  return text
    .split(/\s*[|•]\s*/)
    .map((part) => part.trim())
    .filter(Boolean);
}

function normalizeInlineWhitespace(text: string) {
  return text.replace(/\s+/g, " ").trim();
}

function summarizeText(text: string, limit = 220) {
  const normalized = text.replace(/\s+/g, " ").trim();

  if (normalized.length <= limit) {
    return normalized;
  }

  return `${normalized.slice(0, limit - 1).trimEnd()}…`;
}

function citationKey(citation: SourceCitation) {
  return [citation.documentId, citation.sectionId, citation.lineStart, citation.lineEnd, citation.label].join("::");
}

function uniqueCitations(citations: SourceCitation[]) {
  const seen = new Set<string>();

  return citations.filter((citation) => {
    const key = citationKey(citation);

    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

function parseEffectiveRuleText(effectiveRule: EffectiveRuleRecord) {
  const sections = effectiveRule.effectiveText.match(/Core:\s*([\s\S]*?)(?=\s+Override\s+\d+:|$)|Override\s+(\d+):\s*([\s\S]*?)(?=\s+Override\s+\d+:|$)/g) ?? [];

  const coreSection = sections.find((section) => section.startsWith("Core:")) ?? null;
  const overrideSections = sections.filter((section) => section.startsWith("Override"));

  return {
    coreText: coreSection ? normalizeInlineWhitespace(coreSection.replace(/^Core:\s*/, "")) : effectiveRule.originalText,
    overrides: overrideSections.map((section, index) => ({
      id: `${effectiveRule.id}-override-${index + 1}`,
      title: `Override ${index + 1}`,
      text: normalizeInlineWhitespace(section.replace(/^Override\s+\d+:\s*/, "")),
    })),
  };
}

function splitDiffSegments(text: string) {
  return text
    .split(/(?<=[.!?])\s+|\s*[|•]\s*/)
    .map((segment) => normalizeInlineWhitespace(segment))
    .filter(Boolean);
}

function getInlineAddedSegments(coreText: string, overrideText: string) {
  const coreSegments = new Set(splitDiffSegments(coreText).map((segment) => segment.toLowerCase()));

  return splitDiffSegments(overrideText).map((segment) => ({
    text: segment,
    isAdded: !coreSegments.has(segment.toLowerCase()),
  }));
}

function displayEntityType(entityType: SearchIndexRecord["entityType"]) {
  switch (entityType) {
    case "rule":
      return "Rule";
    case "rule-subsection":
      return "Rule Section";
    case "effective-rule":
      return "Effective Rule";
    case "faq":
      return "FAQ";
    case "errata":
      return "Errata";
    case "usr":
      return "USR";
    case "lore-faction":
      return "Lore";
    case "lore-event":
      return "Timeline";
    case "lore-location":
      return "Location";
    case "lore-species":
      return "Species";
    case "glossary":
      return "Glossary";
    case "scenario":
      return "Scenario";
    case "force":
      return "Force";
    case "unit":
      return "Unit";
  }
}

function getRuleSubsectionAnchorId(subsection: RuleSubsection) {
  return `rule-subsection-${subsection.id}`;
}

function getCitationDocumentMap(documents: SourceDocument[]) {
  return new Map(documents.map((document) => [document.id, document]));
}

function CitationList({ citations }: { citations: SourceCitation[] }) {
  const { sourceRegistry } = useReferenceData();
  const documentMap = useMemo(() => getCitationDocumentMap(sourceRegistry.data.documents), [sourceRegistry.data.documents]);
  const items = uniqueCitations(citations);

  if (items.length === 0) {
    return <p className="text-sm text-[color:var(--muted-foreground)]">No citations recorded.</p>;
  }

  return (
    <div className="space-y-3">
      {items.map((citation) => {
        const document = documentMap.get(citation.documentId);
        const lines = citation.lineStart !== undefined ? `Lines ${citation.lineStart}-${citation.lineEnd ?? citation.lineStart}` : null;

        return (
          <div key={citationKey(citation)} className="rounded-md border border-[color:var(--border)] p-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline">{document?.title ?? citation.documentId}</Badge>
              {citation.sectionId ? <Badge variant="outline">{citation.sectionId}</Badge> : null}
              {lines ? <Badge variant="outline">{lines}</Badge> : null}
            </div>
            <p className="mt-3 text-sm font-medium">{citation.label}</p>
            {citation.excerpt ? (
              <p className="mt-2 text-sm leading-6 text-[color:var(--muted-foreground)]">{citation.excerpt}</p>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

function ReferenceStatusCard() {
  // Moved to /dev/status as part of Phase A. Removed in Phase E.
  return null;
}
void ReferenceStatusCard;

export function SearchOverlay({ buttonClassName, buttonLabel = "Search" }: { buttonClassName?: string; buttonLabel?: string } = {}) {
  const navigate = useNavigate();
  const { searchIndex } = useReferenceData();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setIsOpen((open) => !open);
      }

      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  const allRecords = useMemo(
    () =>
      searchIndex.data.records.filter((record) =>
        [
          "lore-faction",
          "lore-event",
          "glossary",
          "scenario",
          "force",
          "unit",
          "rule",
          "rule-subsection",
          "effective-rule",
          "usr",
        ].includes(record.entityType),
      ),
    [searchIndex.data.records],
  );

  const results = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (normalizedQuery.length === 0) {
      return allRecords.slice(0, 8);
    }

    const expandedTerms = new Set<string>([normalizedQuery]);

    const aliasExpansions = searchIndex.data.aliasMap[normalizedQuery];
    if (aliasExpansions !== undefined) {
      aliasExpansions.forEach((term) => expandedTerms.add(term.toLowerCase()));
    }

    const filtered = allRecords.filter((record) => {
      const haystack = [record.title, record.summary, ...record.keywords, ...record.aliases].join(" ").toLowerCase();
      return [...expandedTerms].some((term) => haystack.includes(term));
    });

    return sortSearchResults(filtered, normalizedQuery).slice(0, 10);
  }, [allRecords, query, searchIndex.data.aliasMap]);

  const navigateToRecord = (record: SearchIndexRecord) => {
    void navigate(record.route);
    setIsOpen(false);
    setQuery("");
  };

  return (
    <>
      <Button className={buttonClassName ?? "gap-2"} variant="outline" onClick={() => setIsOpen(true)}>
        <Search className="size-4" />
        {buttonLabel}
      </Button>

      {isOpen ? (
        <div className="fixed inset-0 z-50 bg-[color:color-mix(in_srgb,var(--foreground)_24%,transparent)] p-4 backdrop-blur-sm sm:p-8">
          <div className="mx-auto max-w-3xl rounded-md border border-[color:var(--border)] bg-[color:var(--surface)] shadow-[var(--shadow)]">
            <div className="flex items-center gap-3 border-b border-[color:var(--border)] p-4 sm:p-5">
              <Search className="size-4 text-[color:var(--muted-foreground)]" />
              <input
                autoFocus
                className="w-full border-0 bg-transparent text-sm outline-none"
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search rules, lore, forces, units, scenarios, or glossary terms"
                value={query}
              />
              <Button aria-label="Close search" className="px-3" variant="ghost" onClick={() => setIsOpen(false)}>
                <X className="size-4" />
              </Button>
            </div>

            <div className="max-h-[70vh] overflow-y-auto p-4 sm:p-5">
              <div className="mb-4 flex flex-wrap gap-2 text-xs text-[color:var(--muted-foreground)]">
                <Badge variant="outline">Cmd/Ctrl+K</Badge>
                <span>Seed alias examples: Authority, Harlow, smoke, return fire, Dockyard Assault, UTG.</span>
              </div>

              <div className="space-y-3">
                {results.map((record) => (
                  <button
                    key={`${record.entityType}-${record.id}`}
                    className="block w-full rounded-md border border-[color:var(--border)] p-4 text-left transition hover:bg-[color:var(--surface-muted)]"
                    onClick={() => navigateToRecord(record)}
                    type="button"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium">{record.title}</span>
                      <Badge variant="outline">{displayEntityType(record.entityType)}</Badge>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-[color:var(--muted-foreground)]">{summarizeText(record.summary)}</p>
                  </button>
                ))}

                {results.length === 0 ? (
                  <div className="rounded-md border border-dashed border-[color:var(--border)] p-6 text-sm text-[color:var(--muted-foreground)]">
                    No search results matched this query.
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

export function MobileSearchButton() {
  return <SearchOverlay buttonClassName="w-full gap-1 px-2 py-2 text-xs" buttonLabel="Search" />;
}

function KeyValueGrid({ items }: { items: Array<{ label: string; value: string | null | undefined }> }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
      {items.map((item) => (
        <div key={item.label} className="rounded-md border border-[color:var(--border)] p-4">
          <div className="text-xs uppercase tracking-[0.16em] text-[color:var(--muted-foreground)]">{item.label}</div>
          <div className="mt-2 text-lg font-semibold">{item.value ?? "-"}</div>
        </div>
      ))}
    </div>
  );
}

function TextListCard({
  title,
  description,
  items,
}: {
  title: string;
  description?: string;
  items: string[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {items.map((item, index) => (
            <div key={`${title}-${index}`} className="rounded-md border border-[color:var(--border)] p-4 text-sm leading-6">
              {item}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function CitationBackedCard({ title, items }: { title: string; items: CitationBackedText[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {items.map((item) => (
          <div key={item.id} className="rounded-md border border-[color:var(--border)] p-4">
            <div className="font-medium">{item.label}</div>
            <p className="mt-2 text-sm leading-6 text-[color:var(--muted-foreground)]">{item.text}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function RuleSubsectionList({ subsections }: { subsections: RuleSubsection[] }) {
  return (
    <div className="space-y-4">
      {subsections.map((subsection) => (
        <div id={getRuleSubsectionAnchorId(subsection)} key={subsection.id} className="scroll-mt-24 rounded-md border border-[color:var(--border)] p-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline">{subsection.number}</Badge>
            <h4 className="text-base font-semibold">{subsection.title}</h4>
          </div>
          <div className="mt-3 space-y-2 text-sm leading-6 text-[color:var(--muted-foreground)]">
            {splitClauses(subsection.body).map((clause, index) => (
              <p key={`${subsection.id}-${index}`}>{clause}</p>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function EffectiveRuleDiff({ effectiveRule }: { effectiveRule: EffectiveRuleRecord }) {
  const parsed = parseEffectiveRuleText(effectiveRule);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 text-xs text-[color:var(--muted-foreground)]">
        <Badge variant="outline">Baseline</Badge>
        <Badge variant="accent">Changed or added</Badge>
      </div>

      <div className="rounded-md border border-[color:var(--border)] bg-[color:var(--surface-muted)] p-4">
        <div className="text-sm font-semibold">Core rulebook baseline</div>
        <div className="mt-3 space-y-2 text-sm leading-6 text-[color:var(--muted-foreground)]">
          {splitClauses(parsed.coreText).map((clause, index) => (
            <p key={`${effectiveRule.id}-baseline-${index}`}>{clause}</p>
          ))}
        </div>
      </div>

      {parsed.overrides.map((override) => (
        <div
          key={override.id}
          className="rounded-md border border-[color:var(--accent)] bg-[color:color-mix(in_srgb,var(--accent)_10%,var(--surface))] p-4"
        >
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="accent">Changed or added</Badge>
            <div className="text-sm font-semibold">{override.title}</div>
          </div>
          <div className="mt-3 space-y-2 text-sm leading-6">
            {getInlineAddedSegments(parsed.coreText, override.text).map((segment, index) => (
              <p key={`${override.id}-${index}`}>
                <span
                  className={
                    segment.isAdded
                      ? "rounded-md bg-[color:color-mix(in_srgb,var(--accent)_22%,transparent)] px-1.5 py-0.5 font-medium text-[color:var(--foreground)]"
                      : "text-[color:var(--muted-foreground)]"
                  }
                >
                  {segment.text}
                </span>
              </p>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function WeaponList({ weapons }: { weapons: WeaponProfile[] }) {
  return (
    <div className="space-y-3">
      {weapons.map((weapon) => (
        <div key={weapon.id} className="rounded-md border border-[color:var(--border)] p-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-medium">{weapon.name}</span>
            {weapon.carrier ? <Badge variant="outline">{weapon.carrier}</Badge> : null}
          </div>
          <div className="mt-3 flex flex-wrap gap-2 text-sm">
            {weapon.range ? <Badge variant="outline">Range {weapon.range}</Badge> : null}
            {weapon.damage ? <Badge variant="outline">Damage {weapon.damage}</Badge> : null}
            {weapon.keywords.map((keyword) => (
              <Badge key={`${weapon.id}-${keyword}`} variant="outline">
                {keyword}
              </Badge>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function ArmoryList({ items }: { items: ArmoryItem[] }) {
  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div key={item.id} className="rounded-md border border-[color:var(--border)] p-4">
          <div className="font-medium">{item.name}</div>
          <p className="mt-2 text-sm leading-6 text-[color:var(--muted-foreground)]">{item.text}</p>
          {item.profile ? (
            <div className="mt-3 flex flex-wrap gap-2 text-sm">
              {item.profile.range ? <Badge variant="outline">Range {item.profile.range}</Badge> : null}
              {item.profile.keywords.map((keyword) => (
                <Badge key={`${item.profile?.id}-${keyword}`} variant="outline">
                  {keyword}
                </Badge>
              ))}
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
}

function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
    </Card>
  );
}

export function ReferenceHomeRoute() {
  const { forces, lore, scenarios } = useReferenceData();
  const authority = lore.data.factions.find((faction) => faction.id === "the-authority");
  const harlow = forces.data.forces.find((force) => force.id === "harlow-1st-reaction-force");
  const dockyardAssault = scenarios.data.scenarios.find((scenario) => scenario.id === "dockyard-assault");

  const [recentRosters, setRecentRosters] = useState<RecentListItem[]>([]);
  const [recentMatches, setRecentMatches] = useState<RecentListItem[]>([]);

  useEffect(() => {
    const refreshRecents = () => {
      const rosters = loadStoredRosters();
      const matches = loadStoredMatches();

      const forceById = new Map(forces.data.forces.map((force) => [force.id, force]));
      const scenarioById = new Map(scenarios.data.scenarios.map((scenario) => [scenario.id, scenario]));

      const sortedRosters = [...rosters]
        .sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1))
        .slice(0, 4);
      const sortedMatches = [...matches]
        .sort((a, b) => (a.savedAt < b.savedAt ? 1 : -1))
        .slice(0, 4);

      setRecentRosters(
        sortedRosters.map((roster) => {
          const force = forceById.get(roster.forceId);
          return {
            id: roster.id,
            title: force?.name ?? roster.forceId,
            subtitle: `${roster.unitIds.length} units · ${roster.mode}`,
            trailing: new Date(roster.updatedAt).toLocaleDateString(),
            to: "/builder",
          };
        }),
      );
      setRecentMatches(
        sortedMatches.map((match) => {
          const scenario = scenarioById.get(match.scenarioId);
          return {
            id: match.id,
            title: scenario?.title ?? match.scenarioId,
            subtitle: `Round ${match.round}`,
            trailing: new Date(match.savedAt).toLocaleDateString(),
            to: `/matches/${match.id}`,
          };
        }),
      );
    };

    refreshRecents();

    const onStorage = (event: StorageEvent) => {
      if (
        event.key === null ||
        event.key === "leap-sitrep.matches.v1" ||
        event.key === "leap-sitrep.rosters.v1"
      ) {
        refreshRecents();
      }
    };

    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [forces.data.forces, scenarios.data.scenarios]);

  return (
    <div className="space-y-6">
      <PageHero
        eyebrow="Hub"
        title="Reference hub"
        description="Active match, recent rosters, quick lookup, and the seed-slice featured pages — everything you need at the table."
        assetCode="HUB-00"
        assetCodeSecondary="TABLE"
        matrixSource="hub"
        actions={
          <>
            <Button asChild variant="outline">
              <Link to="/builder">New roster</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/matches">Matches</Link>
            </Button>
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <RecentList
          title="Recent rosters"
          description="Last touched roster drafts saved on this device."
          items={recentRosters}
          emptyState="No saved rosters yet — open the builder to draft one."
          headerAction={
            <Button asChild size="sm" variant="outline">
              <Link to="/builder">Open builder</Link>
            </Button>
          }
        />
        <RecentList
          title="Recent matches"
          description="Saved live-tracker matches, most recent first."
          items={recentMatches}
          emptyState="No active or saved matches yet."
          headerAction={
            <Button asChild size="sm" variant="outline">
              <Link to="/matches">Open matches</Link>
            </Button>
          }
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick lookup</CardTitle>
          <CardDescription>
            Search rules, lore, forces, units, scenarios, and glossary terms in one step. Press{" "}
            <kbd className="rounded border border-[color:var(--border)] px-1.5 py-0.5 text-xs">Ctrl</kbd>
            {" / "}
            <kbd className="rounded border border-[color:var(--border)] px-1.5 py-0.5 text-xs">⌘</kbd>
            {" + "}
            <kbd className="rounded border border-[color:var(--border)] px-1.5 py-0.5 text-xs">K</kbd>{" "}
            anywhere to open the palette.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SearchOverlay buttonClassName="w-full justify-start text-sm" buttonLabel="Open quick lookup" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Featured</CardTitle>
          <CardDescription>The verified seed slice — Authority lore, Harlow force, Dockyard Assault scenario.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <Link className="rounded-md border border-[color:var(--border)] p-4 transition hover:bg-[color:var(--surface-muted)]" to="/lore/factions/the-authority">
            <div className="font-medium">Authority overview</div>
            <p className="mt-2 text-sm text-[color:var(--muted-foreground)]">
              {authority ? summarizeText(authority.summary, 120) : "The main political and military power on ABOL."}
            </p>
          </Link>
          <Link className="rounded-md border border-[color:var(--border)] p-4 transition hover:bg-[color:var(--surface-muted)]" to="/forces/harlow-1st-reaction-force">
            <div className="font-medium">{harlow?.name ?? "Harlow 1st Reaction Force"}</div>
            <p className="mt-2 text-sm text-[color:var(--muted-foreground)]">Verified force card and unit links.</p>
          </Link>
          <Link className="rounded-md border border-[color:var(--border)] p-4 transition hover:bg-[color:var(--surface-muted)]" to="/scenarios/dockyard-assault">
            <div className="font-medium">{dockyardAssault?.title ?? "Dockyard Assault"}</div>
            <p className="mt-2 text-sm text-[color:var(--muted-foreground)]">Core scenario setup, special rules, and overrun scoring.</p>
          </Link>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Section index</CardTitle>
          <CardDescription>Top-level destinations across reference and play.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <Link className="rounded-md border border-[color:var(--border)] p-4 transition hover:bg-[color:var(--surface-muted)]" to="/lore">
            <div className="font-medium">Lore</div>
            <p className="mt-2 text-sm text-[color:var(--muted-foreground)]">Factions, timeline, glossary anchors.</p>
          </Link>
          <Link className="rounded-md border border-[color:var(--border)] p-4 transition hover:bg-[color:var(--surface-muted)]" to="/forces">
            <div className="font-medium">Forces</div>
            <p className="mt-2 text-sm text-[color:var(--muted-foreground)]">Playable force browser and unit cards.</p>
          </Link>
          <Link className="rounded-md border border-[color:var(--border)] p-4 transition hover:bg-[color:var(--surface-muted)]" to="/rules">
            <div className="font-medium">Rules</div>
            <p className="mt-2 text-sm text-[color:var(--muted-foreground)]">Core, matched play, USRs.</p>
          </Link>
          <Link className="rounded-md border border-[color:var(--border)] p-4 transition hover:bg-[color:var(--surface-muted)]" to="/scenarios">
            <div className="font-medium">Scenarios</div>
            <p className="mt-2 text-sm text-[color:var(--muted-foreground)]">Setup, scoring, special rules.</p>
          </Link>
          <Link className="rounded-md border border-[color:var(--border)] p-4 transition hover:bg-[color:var(--surface-muted)]" to="/builder">
            <div className="font-medium">Builder</div>
            <p className="mt-2 text-sm text-[color:var(--muted-foreground)]">Roster builder and legality checks.</p>
          </Link>
          <Link className="rounded-md border border-[color:var(--border)] p-4 transition hover:bg-[color:var(--surface-muted)]" to="/matches">
            <div className="font-medium">Matches</div>
            <p className="mt-2 text-sm text-[color:var(--muted-foreground)]">Saved matches and live tracker.</p>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}

export function LoreHubRoute() {
  const { lore } = useReferenceData();
  const factions = [...lore.data.factions].sort((left, right) => left.name.localeCompare(right.name));
  const glossaryHighlights = lore.data.glossary.filter((term) => ["abol", "leap", "sssa", "utg"].includes(term.id));

  return (
    <div className="space-y-6">
      <PageHero
        eyebrow="Reference / Lore"
        title="Lore"
        description="World guide coverage starts with the Authority thread and the timeline that explains how ABOL got here."
        assetCode="LORE-00"
        assetCodeSecondary="WORLD"
        matrixSource="lore-hub"
        actions={
          <>
            <Button asChild variant="outline">
              <Link to="/lore/timeline">Open timeline</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/glossary">Open glossary</Link>
            </Button>
          </>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Factions</CardTitle>
          <CardDescription>
            {factions.length} extracted faction{factions.length === 1 ? "" : "s"}. Tap a card to read its primer.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {factions.map((faction) => (
            <Link
              key={faction.id}
              className="block rounded-md border border-[color:var(--border)] p-4 transition hover:bg-[color:var(--surface-muted)]"
              to={`/lore/factions/${faction.id}`}
            >
              <div className="font-medium">{faction.name}</div>
              <p className="mt-2 text-sm leading-6 text-[color:var(--muted-foreground)]">{summarizeText(faction.summary, 240)}</p>
            </Link>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Glossary anchors</CardTitle>
          <CardDescription>Terms that recur throughout the Authority and ABOL slice.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
          {glossaryHighlights.map((term) => (
            <Link
              key={term.id}
              className="block rounded-md border border-[color:var(--border)] p-4 transition hover:bg-[color:var(--surface-muted)]"
              to="/glossary"
            >
              <div className="font-medium">{term.term}</div>
              <p className="mt-2 text-sm leading-6 text-[color:var(--muted-foreground)]">{term.meaning}</p>
            </Link>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

export function TimelineRoute() {
  const { lore } = useReferenceData();
  const events = [...lore.data.events].sort((left, right) => Number(left.year) - Number(right.year));

  return (
    <div className="space-y-6">
      <PageHero
        eyebrow="Reference / Lore / Timeline"
        title="ABOL timeline"
        description="A chronological reading surface for ABOL history, starting with the discovery signal and moving into the landing wars."
        assetCode="LORE-TML-00"
        assetCodeSecondary="CHRONOLOGY"
        matrixSource="lore-timeline"
      />

      <Card>
        <CardHeader>
          <CardTitle>Chronology</CardTitle>
          <CardDescription>{events.length} extracted events from the lore primer.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {events.map((event) => (
            <article key={event.id} className="rounded-md border border-[color:var(--border)] p-4">
              <div className="flex flex-wrap items-center gap-3">
                <Badge variant="accent">{event.year}</Badge>
                <h3 className="text-base font-semibold">{event.title}</h3>
              </div>
              <p className="mt-3 text-sm leading-6 text-[color:var(--muted-foreground)]">{event.summary}</p>
            </article>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

export function LoreFactionDetailRoute() {
  const { slug } = useParams();
  const { forces, lore } = useReferenceData();

  const faction = lore.data.factions.find((candidate) => candidate.id === slug);
  const relatedForces = forces.data.forces.filter((force) => force.parentLoreFactionId === faction?.id);

  if (faction === undefined) {
    return <EmptyState description="No lore faction matched this route parameter." title="Faction not found" />;
  }

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: "Reference", to: "/lore" },
          { label: "Lore", to: "/lore" },
          { label: faction.name },
        ]}
      />

      <PageHero
        eyebrow="Reference / Lore / Faction"
        title={faction.name}
        description={faction.ideology}
        assetCode={`LORE-FAC-${faction.id.slice(0, 8).toUpperCase()}`}
        assetCodeSecondary={faction.id}
        matrixSource={`lore-${faction.id}`}
        actions={
          relatedForces.length > 0 ? (
            <Button asChild variant="outline">
              <Link to={`/forces/${relatedForces[0]?.id}`}>Open related force</Link>
            </Button>
          ) : undefined
        }
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Overview</CardTitle>
              <CardDescription>This summary comes directly from the extracted lore primer dataset.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm leading-7 text-[color:var(--muted-foreground)]">{faction.summary}</p>
              <div className="flex flex-wrap gap-2">
                {faction.regions.map((region) => (
                  <Badge key={region} variant="outline">
                    {region}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {relatedForces.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>Related playable forces</CardTitle>
                <CardDescription>This route distinguishes lore factions from tabletop force cards.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3 md:grid-cols-2">
                {relatedForces.map((force) => (
                  <Link
                    key={force.id}
                    className="rounded-md border border-[color:var(--border)] p-4 transition hover:bg-[color:var(--surface-muted)]"
                    to={`/forces/${force.id}`}
                  >
                    <div className="font-medium">{force.name}</div>
                    <div className="mt-2 text-sm text-[color:var(--muted-foreground)]">{force.cardId}</div>
                  </Link>
                ))}
              </CardContent>
            </Card>
          ) : null}
        </div>

        <SideRail
          sections={[
            {
              id: "regions",
              title: "Regions",
              children:
                faction.regions.length > 0 ? (
                  <ul className="flex flex-wrap gap-2">
                    {faction.regions.map((region) => (
                      <li key={region}>
                        <Badge variant="outline">{region}</Badge>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-[color:var(--muted-foreground)]">No regions recorded.</p>
                ),
            },
            {
              id: "related-forces",
              title: "Playable forces",
              children:
                relatedForces.length > 0 ? (
                  <ul className="space-y-2">
                    {relatedForces.map((force) => (
                      <li key={force.id}>
                        <Link
                          className="block rounded-md border border-[color:var(--border)] p-2 transition hover:bg-[color:var(--surface-muted)]"
                          to={`/forces/${force.id}`}
                        >
                          <div className="font-medium">{force.name}</div>
                          <div className="mt-1 text-xs text-[color:var(--muted-foreground)]">{force.cardId}</div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-[color:var(--muted-foreground)]">No related forces yet.</p>
                ),
            },
            {
              id: "citations",
              title: "Citations",
              children: <CitationList citations={faction.citations} />,
            },
          ]}
        />
      </div>
    </div>
  );
}

function ruleTopicIds() {
  return ["movement", "combat", "reactions", "smoke", "control-points", "data-attacks"];
}

function getRuleTopicRecords(rules: RulesDatasetFile["data"]) {
  const ids = new Set(ruleTopicIds());
  const baseRules = rules.rules.filter((rule) => ids.has(rule.id));
  const effectiveRules = rules.effectiveRules.filter((rule) => ids.has(rule.originalRuleId));

  return baseRules.map((rule) => ({
    rule,
    effectiveRule: effectiveRules.find((effective) => effective.originalRuleId === rule.id),
  }));
}

function RuleTopicCard({ rule, effectiveRule }: { rule: RuleSection; effectiveRule?: EffectiveRuleRecord }) {
  const effectiveSummary = effectiveRule ? summarizeText(effectiveRule.effectiveText, 300) : null;

  return (
    <div className="rounded-md border border-[color:var(--border)] p-4">
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="text-base font-semibold">{rule.title}</h3>
        <Badge variant="outline">{rule.category}</Badge>
        {effectiveRule ? <Badge variant="accent">Effective text available</Badge> : null}
      </div>
      {rule.overview ? (
        <div className="mt-3 space-y-2 text-sm leading-6 text-[color:var(--muted-foreground)]">
          {splitClauses(rule.overview).map((clause, index) => (
            <p key={`${rule.id}-overview-${index}`}>{clause}</p>
          ))}
        </div>
      ) : null}
      {rule.subsections.length > 0 ? (
        <div className="mt-4 flex flex-wrap gap-2 text-sm">
          {rule.subsections.map((subsection) => (
            <Badge key={subsection.id} variant="outline">
              {subsection.number} {subsection.title}
            </Badge>
          ))}
        </div>
      ) : null}
      {effectiveSummary ? <p className="mt-4 text-sm leading-6 text-[color:var(--muted-foreground)]">{effectiveSummary}</p> : null}
      <div className="mt-4">
        <Button asChild variant="outline">
          <Link to={`/rules/core#${rule.id}`}>Jump to detail</Link>
        </Button>
      </div>
    </div>
  );
}

export function RulesLandingRoute() {
  const { rules } = useReferenceData();
  const topics = getRuleTopicRecords(rules.data);
  const universalSpecialRules = [...rules.data.universalSpecialRules].sort((left, right) => left.name.localeCompare(right.name));

  return (
    <div className="space-y-6">
      <PageHero
        eyebrow="Reference / Rules"
        title="Rules"
        description="The first practical rules browser centers on movement, shooting, reactions, smoke, control points, and data attacks."
        assetCode="RUL-00"
        assetCodeSecondary="EFFECTIVE"
        matrixSource="rules-landing"
        actions={
          <Button asChild variant="outline">
            <Link to="/rules/core">Open core rules browser</Link>
          </Button>
        }
      />

      <SectionTabs
        ariaLabel="Rules sections"
        tabs={[
          { id: "overview", label: "Overview", to: "/rules", end: true },
          { id: "core", label: "Core", to: "/rules/core" },
          { id: "matched-play", label: "Matched Play", to: "/rules/matched-play" },
          { id: "usr", label: "USR", to: "/rules#usr" },
        ]}
      />

      <Card>
        <CardHeader>
          <CardTitle>Seed topics</CardTitle>
          <CardDescription>The topic areas covered by the seed reference slice.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 lg:grid-cols-2">
          {topics.map(({ rule, effectiveRule }) => (
            <RuleTopicCard key={rule.id} effectiveRule={effectiveRule} rule={rule} />
          ))}
        </CardContent>
      </Card>

      <Card id="usr">
        <CardHeader>
          <CardTitle>Universal special rules</CardTitle>
          <CardDescription>
            Special rules from the dedicated reference source are merged into the generated rules dataset and retain their own citations.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {universalSpecialRules.map((rule) => (
            <Link
              key={rule.id}
              className="rounded-md border border-[color:var(--border)] p-4 transition hover:bg-[color:var(--surface-muted)]"
              to={`/rules/usr/${rule.id}`}
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-medium">{rule.name}</span>
                {rule.citations.some((citation) => citation.documentId === "blkout-special-rules") ? (
                  <Badge variant="accent">Special rules source</Badge>
                ) : null}
              </div>
              <p className="mt-2 text-sm leading-6 text-[color:var(--muted-foreground)]">{summarizeText(rule.currentText, 180)}</p>
            </Link>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

export function RulesCoreRoute() {
  const location = useLocation();
  const { rules } = useReferenceData();
  const topics = getRuleTopicRecords(rules.data);
  const faqByTopic = (() => {
    const entries = new Map<string, typeof rules.data.faq>();

    rules.data.faq.forEach((entry) => {
      const list = entries.get(entry.topic) ?? [];
      list.push(entry);
      entries.set(entry.topic, list);
    });

    return entries;
  })();

  useEffect(() => {
    if (location.hash.length <= 1) {
      return;
    }

    const targetId = decodeURIComponent(location.hash.slice(1));

    window.requestAnimationFrame(() => {
      const target = document.getElementById(targetId);
      target?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, [location.hash, topics]);

  return (
    <div className="space-y-6">
      <PageHero
        eyebrow="Reference / Rules / Core"
        title="Core rules"
        description="Each topic surfaces the extracted core rule, the current effective overlay when present, and the linked citations."
        assetCode="RUL-COR-00"
        assetCodeSecondary="MERGED"
        matrixSource="rules-core"
      />

      <SectionTabs
        ariaLabel="Rules sections"
        tabs={[
          { id: "overview", label: "Overview", to: "/rules", end: true },
          { id: "core", label: "Core", to: "/rules/core" },
          { id: "matched-play", label: "Matched Play", to: "/rules/matched-play" },
        ]}
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_240px]">
        <div className="space-y-6">
          {topics.map(({ rule, effectiveRule }) => {
            const faqEntries = faqByTopic.get(rule.id) ?? [];
            const combinedCitations = [...rule.citations, ...(effectiveRule?.citations ?? [])];

            return (
              <Card id={rule.id} key={rule.id}>
                <CardHeader>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">{rule.category}</Badge>
                    {effectiveRule ? <Badge variant="accent">Effective text</Badge> : null}
                  </div>
                  <CardTitle>{rule.title}</CardTitle>
                  <CardDescription>{effectiveRule?.precedenceReason ?? "No supplemental override is currently attached."}</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-[color:var(--muted-foreground)]">Core text</h3>
                      {rule.overview ? (
                        <div className="mt-3 space-y-2 text-sm leading-6 text-[color:var(--muted-foreground)]">
                          {splitClauses(rule.overview).map((clause, index) => (
                            <p key={`${rule.id}-overview-${index}`}>{clause}</p>
                          ))}
                        </div>
                      ) : (
                        <p className="mt-3 text-sm text-[color:var(--muted-foreground)]">No standalone overview paragraph is present for this rule.</p>
                      )}
                    </div>

                    <div>
                      <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-[color:var(--muted-foreground)]">Subsections</h3>
                      <div className="mt-3">
                        {rule.subsections.length > 0 ? (
                          <RuleSubsectionList subsections={rule.subsections} />
                        ) : (
                          <p className="text-sm text-[color:var(--muted-foreground)]">No numbered subsections were extracted for this rule.</p>
                        )}
                      </div>
                    </div>

                    {effectiveRule ? (
                      <div>
                        <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-[color:var(--muted-foreground)]">Effective ruling</h3>
                        <div className="mt-3">
                          <EffectiveRuleDiff effectiveRule={effectiveRule} />
                        </div>
                      </div>
                    ) : null}
                  </div>

                  <div className="space-y-6">
                    <div>
                      <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-[color:var(--muted-foreground)]">Linked FAQ</h3>
                      <div className="mt-3 space-y-3">
                        {faqEntries.slice(0, 4).map((entry) => (
                          <div key={entry.id} className="rounded-md border border-[color:var(--border)] p-4">
                            <div className="font-medium">{entry.question}</div>
                            <p className="mt-2 text-sm leading-6 text-[color:var(--muted-foreground)]">{entry.answer}</p>
                          </div>
                        ))}
                        {faqEntries.length === 0 ? (
                          <p className="text-sm text-[color:var(--muted-foreground)]">No linked FAQ extracted for this topic.</p>
                        ) : null}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-[color:var(--muted-foreground)]">Citations</h3>
                      <div className="mt-3">
                        <CitationList citations={combinedCitations} />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <aside className="hidden lg:sticky lg:top-6 lg:block lg:self-start">
          <TopicTOC
            entries={topics.map(({ rule }) => ({ id: rule.id, label: rule.title }))}
            title="Topics"
          />
        </aside>
      </div>
    </div>
  );
}

export function RulesMatchedPlayRoute() {
  const { supplemental } = useReferenceData();
  const matchedPlayRules = supplemental.data.rules.filter((rule) => rule.mode === "matched-play");
  const groupBuilding = matchedPlayRules.find((rule) => rule.id === "matched-play-group-building");

  return (
    <div className="space-y-6">
      <PageHero
        eyebrow="Reference / Rules / Matched Play"
        title="Matched play"
        description="Source-backed matched play rules from the supplemental are available for reference. Builder support remains limited until handler and BLKLIST data are verified."
        assetCode="RUL-MTC-00"
        assetCodeSecondary="SUPPLEMENTAL"
        matrixSource="rules-matched-play"
      />

      <SectionTabs
        ariaLabel="Rules sections"
        tabs={[
          { id: "overview", label: "Overview", to: "/rules", end: true },
          { id: "core", label: "Core", to: "/rules/core" },
          { id: "matched-play", label: "Matched Play", to: "/rules/matched-play" },
        ]}
      />

      {groupBuilding ? (
        <Card>
          <CardHeader>
            <div className="flex flex-wrap gap-2">
              <Badge variant="accent">Builder Gate</Badge>
              <Badge variant="outline">Source-backed structure</Badge>
            </div>
            <CardTitle>{groupBuilding.title}</CardTitle>
            <CardDescription>
              The app can display the sourced matched-play group structure, but it does not create matched-play rosters until handlers and replacement-unit data are verified.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 xl:grid-cols-[1fr_0.85fr]">
            <div className="space-y-2 text-sm leading-6 text-[color:var(--muted-foreground)]">
              {splitClauses(groupBuilding.body).map((clause, index) => (
                <p key={`${groupBuilding.id}-${index}`}>{clause}</p>
              ))}
            </div>
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-[color:var(--muted-foreground)]">Citations</h3>
              <div className="mt-3">
                <CitationList citations={groupBuilding.citations} />
              </div>
            </div>
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Matched play rules</CardTitle>
          <CardDescription>Extracted supplemental sections with citations preserved.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {matchedPlayRules.map((rule) => (
            <div key={rule.id} className="rounded-md border border-[color:var(--border)] p-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-medium">{rule.title}</span>
                <Badge variant="outline">{rule.category}</Badge>
              </div>
              <div className="mt-3 space-y-2 text-sm leading-6 text-[color:var(--muted-foreground)]">
                {splitClauses(rule.body).slice(0, rule.id === "matched-play-group-building" ? 6 : 10).map((clause, index) => (
                  <p key={`${rule.id}-summary-${index}`}>{clause}</p>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

export function UsrDetailRoute() {
  const { slug } = useParams();
  const { rules } = useReferenceData();
  const usr = rules.data.universalSpecialRules.find((candidate) => candidate.id === slug);

  if (usr === undefined) {
    return <EmptyState description="No universal special rule matched this route." title="USR not found" />;
  }

  const relatedRules = rules.data.rules.filter((rule) => usr.relatedRuleIds.includes(rule.id));

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: "Reference", to: "/rules" },
          { label: "Rules", to: "/rules" },
          { label: "USR", to: "/rules" },
          { label: usr.name },
        ]}
      />

      <PageHero
        eyebrow="Reference / Rules / USR"
        title={usr.name}
        description={summarizeText(usr.currentText, 180)}
        assetCode={`USR-${usr.id.slice(0, 8).toUpperCase()}`}
        assetCodeSecondary={usr.id}
        matrixSource={`usr-${usr.id}`}
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Current text</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm leading-6 text-[color:var(--muted-foreground)]">
              {splitClauses(usr.currentText).map((clause, index) => (
                <p key={`${usr.id}-${index}`}>{clause}</p>
              ))}
            </CardContent>
          </Card>

          {usr.notes.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>Examples and notes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {usr.notes.map((note) => (
                  <div key={note.id} className="rounded-md border border-[color:var(--border)] p-4">
                    <div className="font-medium">{note.label}</div>
                    <p className="mt-2 text-sm leading-6 text-[color:var(--muted-foreground)]">{note.text}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          ) : null}
        </div>

        <SideRail
          sections={[
            {
              id: "aliases",
              title: "Aliases",
              children:
                usr.aliases.length > 0 ? (
                  <ul className="flex flex-wrap gap-2">
                    {usr.aliases.map((alias) => (
                      <li key={alias}>
                        <Badge variant="outline">{alias}</Badge>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-[color:var(--muted-foreground)]">No aliases recorded.</p>
                ),
            },
            {
              id: "related-rules",
              title: "Related rules",
              children:
                relatedRules.length > 0 ? (
                  <ul className="space-y-2">
                    {relatedRules.map((rule) => (
                      <li key={rule.id}>
                        <Link
                          className="block rounded-md border border-[color:var(--border)] p-2 transition hover:bg-[color:var(--surface-muted)]"
                          to={`/rules/core#${rule.id}`}
                        >
                          <div className="font-medium">{rule.title}</div>
                          <div className="mt-1 text-xs text-[color:var(--muted-foreground)]">{rule.category}</div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-[color:var(--muted-foreground)]">No related rules linked yet.</p>
                ),
            },
            {
              id: "citations",
              title: "Citations",
              children: <CitationList citations={usr.citations} />,
            },
          ]}
        />
      </div>
    </div>
  );
}

export function ForcesRoute() {
  const { forces, lore } = useReferenceData();
  const [confidenceFilter, setConfidenceFilter] = useState<string | null>(null);

  const allForces = forces.data.forces;

  const confidenceOptions = useMemo(() => {
    const counts = new Map<string, number>();
    for (const force of allForces) {
      counts.set(force.confidence, (counts.get(force.confidence) ?? 0) + 1);
    }
    return Array.from(counts.entries()).map(([confidence, count]) => ({
      id: confidence,
      label: confidence,
      count,
    }));
  }, [allForces]);

  const filteredForces = confidenceFilter
    ? allForces.filter((force) => force.confidence === confidenceFilter)
    : allForces;

  // Group filtered forces by parent lore faction so the index reflects who fields each force.
  const grouped = useMemo(() => {
    const byFaction = new Map<string, { factionName: string; forces: typeof allForces }>();
    for (const force of filteredForces) {
      const faction = lore.data.factions.find((candidate) => candidate.id === force.parentLoreFactionId);
      const key = force.parentLoreFactionId || "__unaligned";
      const factionName = faction?.name ?? "Unaligned";
      const bucket = byFaction.get(key);
      if (bucket) {
        bucket.forces.push(force);
      } else {
        byFaction.set(key, { factionName, forces: [force] });
      }
    }
    return Array.from(byFaction.entries()).sort((left, right) =>
      left[1].factionName.localeCompare(right[1].factionName),
    );
  }, [filteredForces, lore.data.factions]);

  return (
    <div className="space-y-6">
      <PageHero
        eyebrow="Reference / Forces"
        title="Forces"
        description="The first trusted tabletop slice is Harlow 1st Reaction Force and its three verified unit cards."
        assetCode="FOR-00"
        assetCodeSecondary="VERIFIED"
        matrixSource="forces-hub"
      />

      <FilterChips
        label="Confidence"
        options={confidenceOptions}
        value={confidenceFilter}
        onChange={setConfidenceFilter}
        allCount={allForces.length}
      />

      {grouped.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-[color:var(--muted-foreground)]">
            No forces match the current filter.
          </CardContent>
        </Card>
      ) : (
        grouped.map(([key, { factionName, forces: bucketForces }]) => (
          <Card key={key}>
            <CardHeader>
              <CardTitle>{factionName}</CardTitle>
              <CardDescription>
                {bucketForces.length} force{bucketForces.length === 1 ? "" : "s"}
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {bucketForces.map((force) => (
                <Link
                  key={force.id}
                  className="rounded-md border border-[color:var(--border)] p-4 transition hover:bg-[color:var(--surface-muted)]"
                  to={`/forces/${force.id}`}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium">{force.name}</span>
                    <Badge variant="accent">{force.confidence}</Badge>
                  </div>
                  <p className="mt-2 text-sm text-[color:var(--muted-foreground)]">{force.cardId}</p>
                  <p className="mt-2 text-sm leading-6 text-[color:var(--muted-foreground)]">{summarizeText(force.forceRules[0]?.text ?? "No force rule text available.")}</p>
                </Link>
              ))}
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}

export function ForceDetailRoute() {
  const { forceId } = useParams();
  const { forces, lore } = useReferenceData();
  const force = forces.data.forces.find((candidate) => candidate.id === forceId);

  if (force === undefined) {
    return <EmptyState description="No curated force matched this route parameter." title="Force not found" />;
  }

  const units = forces.data.units.filter((unit) => unit.forceId === force.id);
  const parentFaction = lore.data.factions.find((faction) => faction.id === force.parentLoreFactionId);

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: "Reference", to: "/forces" },
          { label: "Forces", to: "/forces" },
          { label: force.name },
        ]}
      />

      <PageHero
        eyebrow="Reference / Forces / Detail"
        title={force.name}
        description={parentFaction ? `Lore alignment: ${parentFaction.name}` : "Curated, citation-backed force card."}
        assetCode={force.cardId}
        assetCodeSecondary={force.id}
        matrixSource={`force-${force.id}`}
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-6">
          <div className="grid gap-6 xl:grid-cols-2">
            <CitationBackedCard items={force.forceRules} title="Force rules" />
            <CitationBackedCard items={force.battleDrills} title="Battle drills" />
          </div>

          <Card id="armory">
            <CardHeader>
              <CardTitle>Armory</CardTitle>
              <CardDescription>Armory options stay attached to the force card, with weapon profile metadata preserved where available.</CardDescription>
            </CardHeader>
            <CardContent>
              <ArmoryList items={force.armory} />
            </CardContent>
          </Card>

          <Card id="units">
            <CardHeader>
              <CardTitle>Units in this force</CardTitle>
              <CardDescription>All seed units link directly into the verified unit detail routes.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-3">
              {units.map((unit) => (
                <Link
                  key={unit.id}
                  className="rounded-md border border-[color:var(--border)] p-4 transition hover:bg-[color:var(--surface-muted)]"
                  to={`/units/${unit.id}`}
                >
                  <div className="font-medium">{unit.name}</div>
                  <div className="mt-2 text-sm text-[color:var(--muted-foreground)]">{unit.cardId}</div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Badge variant="outline">Move {unit.stats.move ?? "-"}</Badge>
                    <Badge variant="outline">Shoot {unit.stats.shoot ?? "-"}</Badge>
                    <Badge variant="outline">Armor {unit.stats.armor ?? "-"}</Badge>
                  </div>
                </Link>
              ))}
            </CardContent>
          </Card>
        </div>

        <SideRail
          sections={[
            {
              id: "lore-alignment",
              title: "Lore alignment",
              children: parentFaction ? (
                <Link
                  className="block rounded-md border border-[color:var(--border)] p-2 transition hover:bg-[color:var(--surface-muted)]"
                  to={`/lore/${parentFaction.id}`}
                >
                  <div className="font-medium">{parentFaction.name}</div>
                  <div className="mt-1 text-xs text-[color:var(--muted-foreground)]">{summarizeText(parentFaction.summary, 100)}</div>
                </Link>
              ) : (
                <p className="text-[color:var(--muted-foreground)]">No parent faction recorded.</p>
              ),
            },
            {
              id: "units-rail",
              title: `Units (${units.length})`,
              children:
                units.length > 0 ? (
                  <ul className="space-y-2">
                    {units.map((unit) => (
                      <li key={unit.id}>
                        <Link
                          className="block rounded-md border border-[color:var(--border)] p-2 transition hover:bg-[color:var(--surface-muted)]"
                          to={`/units/${unit.id}`}
                        >
                          <div className="font-medium">{unit.name}</div>
                          <div className="mt-1 text-xs text-[color:var(--muted-foreground)]">{unit.cardId}</div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-[color:var(--muted-foreground)]">No units linked.</p>
                ),
            },
            {
              id: "armory-rail",
              title: "Armory",
              children: (
                <a
                  className="block rounded-md border border-[color:var(--border)] p-2 transition hover:bg-[color:var(--surface-muted)]"
                  href="#armory"
                >
                  <div className="font-medium">Jump to armory</div>
                  <div className="mt-1 text-xs text-[color:var(--muted-foreground)]">{force.armory.length} entries</div>
                </a>
              ),
            },
            {
              id: "citations",
              title: "Citations",
              children: <CitationList citations={force.citations} />,
            },
          ]}
        />
      </div>
    </div>
  );
}

export function UnitDetailRoute() {
  const { unitId } = useParams();
  const { forces } = useReferenceData();
  const unit = forces.data.units.find((candidate) => candidate.id === unitId);

  if (unit === undefined) {
    return <EmptyState description="No curated unit matched this route parameter." title="Unit not found" />;
  }

  const force = forces.data.forces.find((candidate) => candidate.id === unit.forceId);

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: "Reference", to: "/forces" },
          { label: "Forces", to: "/forces" },
          ...(force ? [{ label: force.name, to: `/forces/${force.id}` }] : []),
          { label: unit.name },
        ]}
      />

      <PageHero
        eyebrow="Reference / Forces / Unit"
        title={unit.name}
        description={force ? `Force: ${force.name}` : "Curated, citation-backed unit record."}
        assetCode={unit.cardId}
        assetCodeSecondary={unit.id}
        matrixSource={`unit-${unit.id}`}
        actions={
          force ? (
            <Button asChild variant="outline">
              <Link to={`/forces/${force.id}`}>Back to force</Link>
            </Button>
          ) : undefined
        }
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-6">
          <KeyValueGrid
            items={[
              { label: "Models", value: String(unit.modelCount) },
              { label: "Move", value: unit.stats.move },
              { label: "Shoot", value: unit.stats.shoot },
              { label: "Armor", value: unit.stats.armor },
              { label: "Hack", value: unit.stats.hack },
            ]}
          />

          <div className="grid gap-6 xl:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Weapons</CardTitle>
              </CardHeader>
              <CardContent>
                <WeaponList weapons={unit.weapons} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Specialists</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {unit.specialists.length > 0 ? (
                  unit.specialists.map((specialist) => (
                    <div key={specialist.id} className="rounded-md border border-[color:var(--border)] p-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-medium">Slot {specialist.slot}</span>
                        <Badge variant="outline">{specialist.name}</Badge>
                      </div>
                      {specialist.description ? (
                        <p className="mt-2 text-sm leading-6 text-[color:var(--muted-foreground)]">{specialist.description}</p>
                      ) : null}
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-[color:var(--muted-foreground)]">No specialist slots are recorded on this unit.</p>
                )}
              </CardContent>
            </Card>
          </div>

          <CitationBackedCard items={unit.abilities} title="Abilities and traits" />
        </div>

        <SideRail
          sections={[
            {
              id: "parent-force",
              title: "Parent force",
              children: force ? (
                <Link
                  className="block rounded-md border border-[color:var(--border)] p-2 transition hover:bg-[color:var(--surface-muted)]"
                  to={`/forces/${force.id}`}
                >
                  <div className="font-medium">{force.name}</div>
                  <div className="mt-1 text-xs text-[color:var(--muted-foreground)]">{force.cardId}</div>
                </Link>
              ) : (
                <p className="text-[color:var(--muted-foreground)]">No parent force recorded.</p>
              ),
            },
            {
              id: "use-in-builder",
              title: "Use in builder",
              children: force ? (
                <Button asChild className="w-full" variant="outline">
                  <Link to={`/builder?force=${force.id}`}>Open in builder</Link>
                </Button>
              ) : (
                <p className="text-[color:var(--muted-foreground)]">Builder requires a parent force.</p>
              ),
            },
            {
              id: "citations",
              title: "Citations",
              children: <CitationList citations={unit.citations} />,
            },
          ]}
        />
      </div>
    </div>
  );
}

export function ScenariosRoute() {
  const { scenarios } = useReferenceData();
  const [modeFilter, setModeFilter] = useState<string | null>(null);

  const allScenarios = scenarios.data.scenarios;
  const modeOptions = useMemo(() => {
    const counts = new Map<string, number>();
    for (const scenario of allScenarios) {
      counts.set(scenario.mode, (counts.get(scenario.mode) ?? 0) + 1);
    }
    return Array.from(counts.entries()).map(([mode, count]) => ({
      id: mode,
      label: mode,
      count,
    }));
  }, [allScenarios]);

  const filteredScenarios = modeFilter
    ? allScenarios.filter((scenario) => scenario.mode === modeFilter)
    : allScenarios;

  return (
    <div className="space-y-6">
      <PageHero
        eyebrow="Reference / Scenarios"
        title="Scenarios"
        description="The seed slice starts with Dockyard Assault, but the browser also exposes the other extracted core scenarios for comparison."
        assetCode="SCN-00"
        assetCodeSecondary="CORE"
        matrixSource="scenarios-hub"
      />

      <FilterChips
        label="Mode"
        options={modeOptions}
        value={modeFilter}
        onChange={setModeFilter}
        allCount={allScenarios.length}
      />

      <Card>
        <CardHeader>
          <CardTitle>Core scenarios</CardTitle>
          <CardDescription>
            {filteredScenarios.length} of {allScenarios.length} scenario{allScenarios.length === 1 ? "" : "s"}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          {filteredScenarios.map((scenario) => (
            <Link
              key={scenario.id}
              className="rounded-md border border-[color:var(--border)] p-4 transition hover:bg-[color:var(--surface-muted)]"
              to={`/scenarios/${scenario.id}`}
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-medium">{scenario.title}</span>
                <Badge variant={scenario.id === "dockyard-assault" ? "accent" : "outline"}>{scenario.mode}</Badge>
              </div>
              <p className="mt-2 text-sm text-[color:var(--muted-foreground)]">Table size {scenario.tableSize}</p>
              <p className="mt-2 text-sm leading-6 text-[color:var(--muted-foreground)]">{summarizeText(scenario.specialRules.join(" "))}</p>
            </Link>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

export function ScenarioDetailRoute() {
  const { scenarioId } = useParams();
  const { scenarios } = useReferenceData();
  const scenario = scenarios.data.scenarios.find((candidate) => candidate.id === scenarioId);

  if (scenario === undefined) {
    return <EmptyState description="No extracted scenario matched this route parameter." title="Scenario not found" />;
  }

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: "Reference", to: "/scenarios" },
          { label: "Scenarios", to: "/scenarios" },
          { label: scenario.title },
        ]}
      />

      <PageHero
        eyebrow="Reference / Scenarios / Detail"
        title={scenario.title}
        description="Scenario setup, scoring, and special rules are displayed from the generated rulebook extraction with citations attached."
        assetCode={`SCN-${scenario.id.slice(0, 8).toUpperCase()}`}
        assetCodeSecondary={scenario.tableSize}
        matrixSource={`scenario-${scenario.id}`}
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-6">
          <KeyValueGrid
            items={[
              { label: "Mode", value: scenario.mode },
              { label: "Table", value: scenario.tableSize },
              { label: "Hardpoints", value: scenario.hardpoints.join(", ") || "0" },
              { label: "Points of interest", value: scenario.pointsOfInterest.join(", ") || "0" },
            ]}
          />

          <div className="grid gap-6 xl:grid-cols-3">
            <TextListCard description="Deployment and table setup steps." items={scenario.setup} title="Setup" />
            <TextListCard description="Overrun and win-condition text." items={scenario.scoringRules} title="Scoring" />
            <TextListCard description="Scenario-specific twists and flavor." items={scenario.specialRules} title="Special rules" />
          </div>
        </div>

        <SideRail
          sections={[
            {
              id: "summary",
              title: "Summary",
              children: (
                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between gap-2">
                    <dt className="text-[color:var(--muted-foreground)]">Mode</dt>
                    <dd className="font-medium">{scenario.mode}</dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt className="text-[color:var(--muted-foreground)]">Table</dt>
                    <dd className="font-medium">{scenario.tableSize}</dd>
                  </div>
                </dl>
              ),
            },
            {
              id: "hardpoints",
              title: `Hardpoints (${scenario.hardpoints.length})`,
              children:
                scenario.hardpoints.length > 0 ? (
                  <ul className="flex flex-wrap gap-2">
                    {scenario.hardpoints.map((hp) => (
                      <li key={hp}>
                        <Badge variant="outline">{hp}</Badge>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-[color:var(--muted-foreground)]">None recorded.</p>
                ),
            },
            {
              id: "pois",
              title: `Points of interest (${scenario.pointsOfInterest.length})`,
              children:
                scenario.pointsOfInterest.length > 0 ? (
                  <ul className="flex flex-wrap gap-2">
                    {scenario.pointsOfInterest.map((poi) => (
                      <li key={poi}>
                        <Badge variant="outline">{poi}</Badge>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-[color:var(--muted-foreground)]">None recorded.</p>
                ),
            },
            {
              id: "citations",
              title: "Citations",
              children: <CitationList citations={scenario.citations} />,
            },
          ]}
        />
      </div>
    </div>
  );
}

export function GlossaryRoute() {
  const { lore } = useReferenceData();

  return (
    <div className="space-y-6">
      <PageHero
        eyebrow="Reference / Glossary"
        title="Glossary"
        description="Acronyms and key BLKOUT vocabulary stay visible as first-class reference data, not hidden inside search only."
        assetCode="GLS-00"
        assetCodeSecondary="VOCAB"
        matrixSource="glossary"
      />

      <Card>
        <CardHeader>
          <CardTitle>Terms</CardTitle>
          <CardDescription>This slice includes ABOL, LEAP, SSSA, UTG, Killwager, and Abolite.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {lore.data.glossary.map((term: GlossaryTerm) => (
            <div key={term.id} className="rounded-md border border-[color:var(--border)] p-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-medium">{term.term}</span>
                {term.aliases.map((alias) => (
                  <Badge key={`${term.id}-${alias}`} variant="outline">
                    {alias}
                  </Badge>
                ))}
              </div>
              <p className="mt-2 text-sm leading-6 text-[color:var(--muted-foreground)]">{term.meaning}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

