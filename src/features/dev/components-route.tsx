import { useState, type ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { DamageTrack } from "@/components/ui/damage-track";
import { DataMatrixMark } from "@/components/ui/data-matrix-mark";
import { EyebrowLabel } from "@/components/ui/eyebrow-label";
import { PageHero } from "@/components/ui/page-hero";
import { RegistrationFrame } from "@/components/ui/registration-frame";
import { StatBlock } from "@/components/ui/stat-block";
import { useTheme } from "@/app/providers/use-theme";
import { FACTION_LABELS, FACTION_VALUES } from "@/app/providers/theme-types";

export function DevComponentsRoute() {
  const { theme, setFaction } = useTheme();
  const faction = theme.faction;
  const [damage, setDamage] = useState(2);

  return (
    <div className="space-y-6">
      <PageHero
        eyebrow="Dev / Components"
        title="BLKOUT primitive harness"
        description="A non-production gallery to QA every primitive across the active mode and faction. Switch factions below to verify accent tints stay legible."
        assetCode="DEV-CMP-00"
        assetCodeSecondary="HARNESS"
        matrixSource="dev-components"
      />

      <Section title="Faction tint switcher" description="Match tokens flow off the active <html data-faction>.">
        <div className="flex flex-wrap gap-2">
          {FACTION_VALUES.map((value) => (
            <Button
              key={value}
              variant={faction === value ? "default" : "outline"}
              onClick={() => setFaction(value)}
            >
              {FACTION_LABELS[value]}
            </Button>
          ))}
        </div>
      </Section>

      <Section title="Buttons" description="Variants × sizes.">
        <div className="space-y-3">
          <Row label="default">
            <Button size="sm">small</Button>
            <Button>medium</Button>
            <Button size="lg">large</Button>
            <Button disabled>disabled</Button>
          </Row>
          <Row label="outline">
            <Button size="sm" variant="outline">small</Button>
            <Button variant="outline">medium</Button>
            <Button size="lg" variant="outline">large</Button>
          </Row>
          <Row label="ghost">
            <Button variant="ghost">ghost</Button>
            <Button size="sm" variant="ghost">small</Button>
          </Row>
          <Row label="destructive">
            <Button variant="destructive">destructive</Button>
          </Row>
        </div>
      </Section>

      <Section title="Badges" description="Variants & shapes.">
        <div className="flex flex-wrap gap-2">
          <Badge>default</Badge>
          <Badge variant="accent">accent</Badge>
          <Badge variant="outline">outline</Badge>
          <Badge variant="ghost">ghost</Badge>
          <Badge variant="danger">danger</Badge>
          <Badge shape="square">square</Badge>
          <Badge shape="square" variant="accent">FM-001</Badge>
        </div>
      </Section>

      <Section title="Eyebrow label">
        <EyebrowLabel>Field manual / sample eyebrow</EyebrowLabel>
      </Section>

      <Section title="Data matrix mark" description="Procedural 5×5 mark, deterministic per source string.">
        <div className="flex flex-wrap items-center gap-4">
          <DataMatrixMark size={32} source="blkout" />
          <DataMatrixMark size={48} source="dusters-recon" />
          <DataMatrixMark size={64} source="harlow-1st-reaction" />
          <DataMatrixMark size={28} source={String(Date.now())} />
        </div>
      </Section>

      <Section title="Stat block" description="Mirrors the unit-card stat cluster.">
        <div className="space-y-3">
          <StatBlock stats={{ move: 6, shoot: "4+", armor: 5 }} />
          <StatBlock keys={["move", "shoot", "armor", "hack", "wounds"]} stats={{ move: 5, shoot: "3+", armor: 4, hack: "5+", wounds: 3 }} />
        </div>
      </Section>

      <Section title="Damage track" description="Click pips or use [/] keys.">
        <DamageTrack onChange={setDamage} size={5} value={damage} />
      </Section>

      <Section title="Registration frame">
        <div className="grid gap-3 sm:grid-cols-2">
          <RegistrationFrame className="rounded-sm border border-[color:var(--border)] bg-[color:var(--surface)] p-4">
            <p className="text-sm">Plain registration frame with corner ticks.</p>
          </RegistrationFrame>
          <RegistrationFrame accent className="rounded-sm border border-[color:var(--border)] bg-[color:var(--surface)] p-4">
            <p className="text-sm">Accent variant — corner ticks pick up the faction accent.</p>
          </RegistrationFrame>
        </div>
      </Section>

      <Section title="Card" description="With CardHeader / CardContent / CardFooter.">
        <Card>
          <CardHeader>
            <CardTitle>Sample card title</CardTitle>
            <CardDescription>Description copy explaining the card content.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-[color:var(--muted-foreground)]">Body content sits here. Cards now ship with built-in registration ticks, so wrapping in <code className="font-mono">RegistrationFrame</code> is unnecessary.</p>
          </CardContent>
          <CardFooter>
            <Button>Primary</Button>
            <Button variant="outline">Secondary</Button>
          </CardFooter>
        </Card>
      </Section>
    </div>
  );
}

function Section({ children, description, title }: { children: ReactNode; description?: string; title: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

function Row({ children, label }: { children: ReactNode; label: string }) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <EyebrowLabel className="w-24">{label}</EyebrowLabel>
      <div className="flex flex-wrap items-center gap-2">{children}</div>
    </div>
  );
}
