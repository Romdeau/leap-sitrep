import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHero } from "@/components/ui/page-hero";
import { primaryNavigation } from "@/lib/routes/manifest";
import { Link } from "react-router-dom";

import { useReferenceData } from "@/features/reference/use-reference-data";

/**
 * DevStatusRoute — internal dashboard that surfaces dataset shape, packet
 * activation, and the full route manifest. Player-facing routes intentionally
 * no longer carry "Packet N" badges; this is where that information lives.
 */
export function DevStatusRoute() {
  const { forces, lore, rules, scenarios } = useReferenceData();

  return (
    <div className="space-y-6">
      <PageHero
        eyebrow="Dev / Status"
        title="Reference data status"
        description="Generated dataset counts, packet activation, and the full route manifest. Internal-only — player-facing pages no longer surface packet metadata."
        assetCode="DEV-STA-00"
        assetCodeSecondary="DATASETS"
        matrixSource="dev-status"
      />

      <Card>
        <CardHeader>
          <div className="flex flex-wrap gap-2">
            <Badge variant="accent">Packet 4 In Progress</Badge>
            <Badge variant="outline">Reference Slice</Badge>
          </div>
          <CardTitle>Seed slice reference data is live</CardTitle>
          <CardDescription>
            The seed vertical slice reads the generated Packet 1-3 datasets directly instead of placeholder scaffolding.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="sub-frame rounded-md border border-[color:var(--border)] p-4">
            <div className="text-sm font-semibold">Lore dataset</div>
            <p className="mt-2 text-sm text-[color:var(--muted-foreground)]">
              {lore.data.factions.length} factions and {lore.data.events.length} timeline events.
            </p>
          </div>
          <div className="sub-frame rounded-md border border-[color:var(--border)] p-4">
            <div className="text-sm font-semibold">Rules dataset</div>
            <p className="mt-2 text-sm text-[color:var(--muted-foreground)]">
              {rules.data.rules.length} rules and {rules.data.effectiveRules.length} effective overlays.
            </p>
          </div>
          <div className="sub-frame rounded-md border border-[color:var(--border)] p-4">
            <div className="text-sm font-semibold">Force slice</div>
            <p className="mt-2 text-sm text-[color:var(--muted-foreground)]">
              {forces.data.forces.length} verified force and {forces.data.units.length} verified units.
            </p>
          </div>
          <div className="sub-frame rounded-md border border-[color:var(--border)] p-4">
            <div className="text-sm font-semibold">Scenario coverage</div>
            <p className="mt-2 text-sm text-[color:var(--muted-foreground)]">
              {scenarios.data.scenarios.length} extracted core scenarios with citations.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Primary navigation</CardTitle>
          <CardDescription>
            Manifest of every nav-visible route, with packet activation. Used by /dev to verify all routes are reachable.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {primaryNavigation.map((route) => (
            <Link
              key={route.id}
              className="sub-frame rounded-md border border-[color:var(--border)] p-4 transition hover:bg-[color:var(--surface-muted)]"
              to={route.path}
            >
              <div className="flex items-center justify-between gap-3">
                <span className="font-medium">{route.label}</span>
                <Badge variant={route.activationPacket <= 4 ? "accent" : "outline"}>
                  Packet {route.activationPacket}
                </Badge>
              </div>
              <p className="mt-2 text-sm text-[color:var(--muted-foreground)]">{route.summary}</p>
            </Link>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
