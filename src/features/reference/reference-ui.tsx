import { Search, X } from "lucide-react";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { appRouteManifest, primaryNavigation } from "@/lib/routes/manifest";
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

function routeMatches(pathname: string, routePath: string) {
  const routeSegments = routePath.split("/").filter(Boolean);
  const pathSegments = pathname.split("/").filter(Boolean);

  if (routeSegments.length !== pathSegments.length) {
    return false;
  }

  return routeSegments.every((segment, index) => segment.startsWith(":") || segment === pathSegments[index]);
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
          <div key={citationKey(citation)} className="rounded-2xl border border-[color:var(--border)] p-4">
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
  const { forces, lore, rules, scenarios } = useReferenceData();

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap gap-2">
          <Badge variant="accent">Packet 4 In Progress</Badge>
          <Badge variant="outline">Reference Slice</Badge>
        </div>
        <CardTitle>Seed slice reference data is live</CardTitle>
        <CardDescription>
          This vertical slice now reads the generated Packet 1-3 datasets directly instead of placeholder scaffolding.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-[color:var(--border)] p-4">
          <div className="text-sm font-semibold">Lore dataset</div>
          <p className="mt-2 text-sm text-[color:var(--muted-foreground)]">
            {lore.data.factions.length} factions and {lore.data.events.length} timeline events.
          </p>
        </div>
        <div className="rounded-2xl border border-[color:var(--border)] p-4">
          <div className="text-sm font-semibold">Rules dataset</div>
          <p className="mt-2 text-sm text-[color:var(--muted-foreground)]">
            {rules.data.rules.length} rules and {rules.data.effectiveRules.length} effective overlays.
          </p>
        </div>
        <div className="rounded-2xl border border-[color:var(--border)] p-4">
          <div className="text-sm font-semibold">Force slice</div>
          <p className="mt-2 text-sm text-[color:var(--muted-foreground)]">
            {forces.data.forces.length} verified force and {forces.data.units.length} verified units.
          </p>
        </div>
        <div className="rounded-2xl border border-[color:var(--border)] p-4">
          <div className="text-sm font-semibold">Scenario coverage</div>
          <p className="mt-2 text-sm text-[color:var(--muted-foreground)]">
            {scenarios.data.scenarios.length} extracted core scenarios with citations.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export function SearchOverlay() {
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
      <Button className="gap-2" variant="outline" onClick={() => setIsOpen(true)}>
        <Search className="size-4" />
        Search
      </Button>

      {isOpen ? (
        <div className="fixed inset-0 z-50 bg-[color:color-mix(in_srgb,var(--foreground)_24%,transparent)] p-4 backdrop-blur-sm sm:p-8">
          <div className="mx-auto max-w-3xl rounded-3xl border border-[color:var(--border)] bg-[color:var(--surface)] shadow-[var(--shadow)]">
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
                    className="block w-full rounded-2xl border border-[color:var(--border)] p-4 text-left transition hover:bg-[color:var(--surface-muted)]"
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
                  <div className="rounded-2xl border border-dashed border-[color:var(--border)] p-6 text-sm text-[color:var(--muted-foreground)]">
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

function SectionIntro({
  badges,
  title,
  description,
  actions,
}: {
  badges?: ReactNode;
  title: string;
  description: string;
  actions?: ReactNode;
}) {
  return (
    <Card>
      <CardHeader>
        {badges ? <div className="flex flex-wrap gap-2">{badges}</div> : null}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-2">
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
        </div>
      </CardHeader>
    </Card>
  );
}

function KeyValueGrid({ items }: { items: Array<{ label: string; value: string | null | undefined }> }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
      {items.map((item) => (
        <div key={item.label} className="rounded-2xl border border-[color:var(--border)] p-4">
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
            <div key={`${title}-${index}`} className="rounded-2xl border border-[color:var(--border)] p-4 text-sm leading-6">
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
          <div key={item.id} className="rounded-2xl border border-[color:var(--border)] p-4">
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
        <div id={getRuleSubsectionAnchorId(subsection)} key={subsection.id} className="scroll-mt-24 rounded-2xl border border-[color:var(--border)] p-4">
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

function WeaponList({ weapons }: { weapons: WeaponProfile[] }) {
  return (
    <div className="space-y-3">
      {weapons.map((weapon) => (
        <div key={weapon.id} className="rounded-2xl border border-[color:var(--border)] p-4">
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
        <div key={item.id} className="rounded-2xl border border-[color:var(--border)] p-4">
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

function routeLabelForPath(pathname: string) {
  const route = appRouteManifest.find((candidate) => routeMatches(pathname, candidate.path));
  return route?.label ?? "Reference";
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

  return (
    <div className="space-y-6">
      <SectionIntro
        badges={
          <>
            <Badge variant="accent">Packet 4 Seed Slice</Badge>
            <Badge variant="outline">Citations Visible</Badge>
            <Badge variant="outline">Local-first Data</Badge>
          </>
        }
        description="Authority lore, Harlow force data, effective rules, and Dockyard Assault now connect through the same generated datasets."
        title="Reference hub"
      />

      <ReferenceStatusCard />

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader>
            <CardTitle>Seed slice jump points</CardTitle>
            <CardDescription>Direct paths for the first complete read-only vertical slice.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            <Link className="rounded-2xl border border-[color:var(--border)] p-4 transition hover:bg-[color:var(--surface-muted)]" to="/lore/factions/the-authority">
              <div className="font-medium">Authority overview</div>
              <p className="mt-2 text-sm text-[color:var(--muted-foreground)]">The main political and military power on ABOL.</p>
            </Link>
            <Link className="rounded-2xl border border-[color:var(--border)] p-4 transition hover:bg-[color:var(--surface-muted)]" to="/lore/timeline">
              <div className="font-medium">Timeline</div>
              <p className="mt-2 text-sm text-[color:var(--muted-foreground)]">Chronology from discovery through the ABOL conflicts.</p>
            </Link>
            <Link className="rounded-2xl border border-[color:var(--border)] p-4 transition hover:bg-[color:var(--surface-muted)]" to="/forces/harlow-1st-reaction-force">
              <div className="font-medium">Harlow 1st Reaction Force</div>
              <p className="mt-2 text-sm text-[color:var(--muted-foreground)]">Verified Packet 3 force card and unit links.</p>
            </Link>
            <Link className="rounded-2xl border border-[color:var(--border)] p-4 transition hover:bg-[color:var(--surface-muted)]" to="/scenarios/dockyard-assault">
              <div className="font-medium">Dockyard Assault</div>
              <p className="mt-2 text-sm text-[color:var(--muted-foreground)]">Core scenario setup, special rules, and overrun scoring.</p>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Slice summary</CardTitle>
            <CardDescription>Fast-read context for the current working reference set.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm leading-6 text-[color:var(--muted-foreground)]">
            <p>{authority?.summary}</p>
            <p>
              {harlow?.name} is linked into this slice as the first manually verified tabletop force, and {dockyardAssault?.title} anchors the scenario reference route.
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Primary navigation</CardTitle>
          <CardDescription>Packet 4 routes are now active for the seed slice; later play flows remain reserved.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {primaryNavigation.map((route) => (
            <Link
              key={route.id}
              className="rounded-2xl border border-[color:var(--border)] p-4 transition hover:bg-[color:var(--surface-muted)]"
              to={route.path}
            >
              <div className="flex items-center justify-between gap-3">
                <span className="font-medium">{route.label}</span>
                <Badge variant={route.activationPacket <= 4 ? "accent" : "outline"}>Packet {route.activationPacket}</Badge>
              </div>
              <p className="mt-2 text-sm text-[color:var(--muted-foreground)]">{route.summary}</p>
            </Link>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

export function LoreHubRoute() {
  const { lore } = useReferenceData();
  const highlightedFactions = lore.data.factions.filter((faction) => ["the-authority", "harlow-1st-assault-battalion"].includes(faction.id));
  const glossaryHighlights = lore.data.glossary.filter((term) => ["abol", "leap", "sssa", "utg"].includes(term.id));

  return (
    <div className="space-y-6">
      <SectionIntro
        badges={
          <>
            <Badge variant="accent">Lore Slice</Badge>
            <Badge variant="outline">Authority Focus</Badge>
          </>
        }
        description="World guide coverage starts with the Authority thread and the timeline that explains how ABOL got here."
        title="Lore"
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

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader>
            <CardTitle>Faction starting points</CardTitle>
            <CardDescription>The seed slice begins with the Authority power structure and its Harlow enforcement arm.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {highlightedFactions.map((faction) => (
              <Link
                key={faction.id}
                className="block rounded-2xl border border-[color:var(--border)] p-4 transition hover:bg-[color:var(--surface-muted)]"
                to={`/lore/factions/${faction.id}`}
              >
                <div className="font-medium">{faction.name}</div>
                <p className="mt-2 text-sm leading-6 text-[color:var(--muted-foreground)]">{summarizeText(faction.summary, 300)}</p>
              </Link>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Glossary anchors</CardTitle>
            <CardDescription>Terms that recur throughout the Authority and ABOL slice.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {glossaryHighlights.map((term) => (
              <Link
                key={term.id}
                className="block rounded-2xl border border-[color:var(--border)] p-4 transition hover:bg-[color:var(--surface-muted)]"
                to="/glossary"
              >
                <div className="font-medium">{term.term}</div>
                <p className="mt-2 text-sm leading-6 text-[color:var(--muted-foreground)]">{term.meaning}</p>
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export function TimelineRoute() {
  const { lore } = useReferenceData();
  const events = [...lore.data.events].sort((left, right) => Number(left.year) - Number(right.year));

  return (
    <div className="space-y-6">
      <SectionIntro
        badges={
          <>
            <Badge variant="accent">Timeline</Badge>
            <Badge variant="outline">Lore Dataset</Badge>
          </>
        }
        description="A chronological reading surface for ABOL history, starting with the discovery signal and moving into the landing wars."
        title="ABOL timeline"
      />

      <Card>
        <CardHeader>
          <CardTitle>Chronology</CardTitle>
          <CardDescription>{events.length} extracted events from the lore primer.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {events.map((event) => (
            <article key={event.id} className="rounded-2xl border border-[color:var(--border)] p-4">
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
  const relatedForces = forces.data.forces.filter((force) =>
    [faction?.id, faction?.id === "the-authority" ? "authority" : undefined].includes(force.parentLoreFactionId),
  );

  if (faction === undefined) {
    return <EmptyState description="No lore faction matched this route parameter." title="Faction not found" />;
  }

  return (
    <div className="space-y-6">
      <SectionIntro
        badges={
          <>
            <Badge variant="accent">Lore Faction</Badge>
            <Badge variant="outline">{faction.id}</Badge>
          </>
        }
        description={faction.ideology}
        title={faction.name}
        actions={
          relatedForces.length > 0 ? (
            <Button asChild variant="outline">
              <Link to={`/forces/${relatedForces[0]?.id}`}>Open related force</Link>
            </Button>
          ) : undefined
        }
      />

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
                className="rounded-2xl border border-[color:var(--border)] p-4 transition hover:bg-[color:var(--surface-muted)]"
                to={`/forces/${force.id}`}
              >
                <div className="font-medium">{force.name}</div>
                <div className="mt-2 text-sm text-[color:var(--muted-foreground)]">{force.cardId}</div>
              </Link>
            ))}
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Citations</CardTitle>
          <CardDescription>Visible source anchors are part of the product contract for important rules and lore.</CardDescription>
        </CardHeader>
        <CardContent>
          <CitationList citations={faction.citations} />
        </CardContent>
      </Card>
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
    <div className="rounded-2xl border border-[color:var(--border)] p-4">
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

  return (
    <div className="space-y-6">
      <SectionIntro
        badges={
          <>
            <Badge variant="accent">Rules Slice</Badge>
            <Badge variant="outline">Effective Overlays</Badge>
          </>
        }
        description="The first practical rules browser centers on movement, shooting, reactions, smoke, control points, and data attacks."
        title="Rules"
        actions={
          <Button asChild variant="outline">
            <Link to="/rules/core">Open core rules browser</Link>
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Seed topics</CardTitle>
          <CardDescription>These are the exact topic areas called out in the Packet 4 seed slice.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 lg:grid-cols-2">
          {topics.map(({ rule, effectiveRule }) => (
            <RuleTopicCard key={rule.id} effectiveRule={effectiveRule} rule={rule} />
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
      <SectionIntro
        badges={
          <>
            <Badge variant="accent">Core Rules Browser</Badge>
            <Badge variant="outline">Packet 2 Merge Layer</Badge>
          </>
        }
        description="Each topic surfaces the extracted core rule, the current effective overlay when present, and the linked citations."
        title="Core rules"
      />

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
                    <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-[color:var(--muted-foreground)]">Effective text</h3>
                    <div className="mt-3 space-y-2 text-sm leading-6 text-[color:var(--muted-foreground)]">
                      {splitClauses(effectiveRule.effectiveText).map((clause, index) => (
                        <p key={`${rule.id}-effective-${index}`}>{clause}</p>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-[color:var(--muted-foreground)]">Linked FAQ</h3>
                  <div className="mt-3 space-y-3">
                    {faqEntries.slice(0, 4).map((entry) => (
                      <div key={entry.id} className="rounded-2xl border border-[color:var(--border)] p-4">
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
  );
}

export function RulesMatchedPlayRoute() {
  return (
    <EmptyState
      description="Matched play reference pages are scheduled for Packet 7 after the seed slice is complete. The effective rule overlays shown in core routes already surface the current matched-play overrides where they affect this slice."
      title="Matched play browser reserved"
    />
  );
}

export function UsrDetailRoute() {
  const { slug } = useParams();
  const { rules } = useReferenceData();
  const usr = rules.data.universalSpecialRules.find((candidate) => candidate.id === slug);

  if (usr === undefined) {
    return <EmptyState description="No universal special rule matched this route." title="USR not found" />;
  }

  return (
    <div className="space-y-6">
      <SectionIntro
        badges={
          <>
            <Badge variant="accent">Universal Special Rule</Badge>
            <Badge variant="outline">{usr.id}</Badge>
          </>
        }
        description={summarizeText(usr.currentText, 180)}
        title={usr.name}
      />

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

      <Card>
        <CardHeader>
          <CardTitle>Citations</CardTitle>
        </CardHeader>
        <CardContent>
          <CitationList citations={usr.citations} />
        </CardContent>
      </Card>
    </div>
  );
}

export function ForcesRoute() {
  const { forces } = useReferenceData();

  return (
    <div className="space-y-6">
      <SectionIntro
        badges={
          <>
            <Badge variant="accent">Force Browser</Badge>
            <Badge variant="outline">Verified Packet 3 Data</Badge>
          </>
        }
        description="The first trusted tabletop slice is Harlow 1st Reaction Force and its three verified unit cards."
        title="Forces"
      />

      <Card>
        <CardHeader>
          <CardTitle>Verified forces</CardTitle>
          <CardDescription>Packet 3 output remains the authoritative tabletop seed slice for Packet 4.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {forces.data.forces.map((force) => (
            <Link
              key={force.id}
              className="rounded-2xl border border-[color:var(--border)] p-4 transition hover:bg-[color:var(--surface-muted)]"
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
  const parentFaction = lore.data.factions.find((faction) => [faction.id, faction.id.replace(/^the-/, "")].includes(force.parentLoreFactionId));

  return (
    <div className="space-y-6">
      <SectionIntro
        badges={
          <>
            <Badge variant="accent">Verified force</Badge>
            <Badge variant="outline">{force.cardId}</Badge>
          </>
        }
        description={parentFaction ? `Lore alignment: ${parentFaction.name}` : "Curated force card verified in Packet 3."}
        title={force.name}
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
        <CitationBackedCard items={force.forceRules} title="Force rules" />
        <CitationBackedCard items={force.battleDrills} title="Battle drills" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Armory</CardTitle>
          <CardDescription>Armory options stay attached to the force card, with weapon profile metadata preserved where available.</CardDescription>
        </CardHeader>
        <CardContent>
          <ArmoryList items={force.armory} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Units in this force</CardTitle>
          <CardDescription>All three seed units link directly into the verified unit detail routes.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-3">
          {units.map((unit) => (
            <Link
              key={unit.id}
              className="rounded-2xl border border-[color:var(--border)] p-4 transition hover:bg-[color:var(--surface-muted)]"
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

      <Card>
        <CardHeader>
          <CardTitle>Citations</CardTitle>
        </CardHeader>
        <CardContent>
          <CitationList citations={force.citations} />
        </CardContent>
      </Card>
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
      <SectionIntro
        badges={
          <>
            <Badge variant="accent">Verified unit</Badge>
            <Badge variant="outline">{unit.cardId}</Badge>
          </>
        }
        description={force ? `Force: ${force.name}` : "Curated Packet 3 unit record."}
        title={unit.name}
        actions={
          force ? (
            <Button asChild variant="outline">
              <Link to={`/forces/${force.id}`}>Back to force</Link>
            </Button>
          ) : undefined
        }
      />

      <KeyValueGrid
        items={[
          { label: "Models", value: String(unit.modelCount) },
          { label: "Move", value: unit.stats.move },
          { label: "Shoot", value: unit.stats.shoot },
          { label: "Armor", value: unit.stats.armor },
          { label: "Hack", value: unit.stats.hack },
        ]}
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
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
                <div key={specialist.id} className="rounded-2xl border border-[color:var(--border)] p-4">
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

      <Card>
        <CardHeader>
          <CardTitle>Citations</CardTitle>
        </CardHeader>
        <CardContent>
          <CitationList citations={unit.citations} />
        </CardContent>
      </Card>
    </div>
  );
}

export function ScenariosRoute() {
  const { scenarios } = useReferenceData();

  return (
    <div className="space-y-6">
      <SectionIntro
        badges={
          <>
            <Badge variant="accent">Scenario Browser</Badge>
            <Badge variant="outline">Core Scenarios</Badge>
          </>
        }
        description="The seed slice starts with Dockyard Assault, but the browser also exposes the other extracted core scenarios for comparison."
        title="Scenarios"
      />

      <Card>
        <CardHeader>
          <CardTitle>Core scenarios</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          {scenarios.data.scenarios.map((scenario) => (
            <Link
              key={scenario.id}
              className="rounded-2xl border border-[color:var(--border)] p-4 transition hover:bg-[color:var(--surface-muted)]"
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
      <SectionIntro
        badges={
          <>
            <Badge variant={scenario.id === "dockyard-assault" ? "accent" : "outline"}>Scenario detail</Badge>
            <Badge variant="outline">{scenario.tableSize}</Badge>
          </>
        }
        description="Scenario setup, scoring, and special rules are displayed from the generated rulebook extraction with citations attached."
        title={scenario.title}
      />

      <KeyValueGrid
        items={[
          { label: "Mode", value: scenario.mode },
          { label: "Table", value: scenario.tableSize },
          { label: "Hardpoints", value: scenario.hardpoints.join(", ") || "0" },
          { label: "Points of interest", value: scenario.pointsOfInterest.join(", ") || "0" },
          { label: "Seed slice", value: scenario.id === "dockyard-assault" ? "Yes" : "No" },
        ]}
      />

      <div className="grid gap-6 xl:grid-cols-3">
        <TextListCard description="Deployment and table setup steps." items={scenario.setup} title="Setup" />
        <TextListCard description="Overrun and win-condition text." items={scenario.scoringRules} title="Scoring" />
        <TextListCard description="Scenario-specific twists and flavor." items={scenario.specialRules} title="Special rules" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Citations</CardTitle>
        </CardHeader>
        <CardContent>
          <CitationList citations={scenario.citations} />
        </CardContent>
      </Card>
    </div>
  );
}

export function GlossaryRoute() {
  const { lore } = useReferenceData();

  return (
    <div className="space-y-6">
      <SectionIntro
        badges={
          <>
            <Badge variant="accent">Glossary</Badge>
            <Badge variant="outline">Search Support</Badge>
          </>
        }
        description="Acronyms and key BLKOUT vocabulary stay visible as first-class reference data, not hidden inside search only."
        title="Glossary"
      />

      <Card>
        <CardHeader>
          <CardTitle>Terms</CardTitle>
          <CardDescription>This slice includes ABOL, LEAP, SSSA, UTG, Killwager, and Abolite.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {lore.data.glossary.map((term: GlossaryTerm) => (
            <div key={term.id} className="rounded-2xl border border-[color:var(--border)] p-4">
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

export function ReservedRouteNotice() {
  const location = useLocation();
  const label = routeLabelForPath(location.pathname);

  return (
    <EmptyState
      description={`${label} is still reserved for a later packet in the implementation plan. Packet 4 only activates the read-only reference slice; builder and match workflows remain intentionally deferred.`}
      title="Route reserved for later work"
    />
  );
}
