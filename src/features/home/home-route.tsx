import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { loadPublicJson } from "@/lib/data/json-loader";
import { appRouteManifest } from "@/lib/routes/manifest";
import type { AppBootstrapFixtureFile, SourceRegistryFile } from "@/lib/types/generated";

const APP_FIXTURE_PATH = "data/bootstrap/app-fixture.json";
const SOURCE_REGISTRY_PATH = "data/source-registry.json";

type HomeState =
  | { status: "loading" }
  | { status: "ready"; fixture: AppBootstrapFixtureFile; sourceRegistry: SourceRegistryFile }
  | { status: "error"; message: string };

const routeSections = ["Hub", "Reference", "Play"] as const;

export function HomeRoute() {
  const [state, setState] = useState<HomeState>({ status: "loading" });

  useEffect(() => {
    let isMounted = true;

    void Promise.all([
      loadPublicJson<AppBootstrapFixtureFile>(APP_FIXTURE_PATH),
      loadPublicJson<SourceRegistryFile>(SOURCE_REGISTRY_PATH),
    ])
      .then(([fixture, sourceRegistry]) => {
        if (!isMounted) {
          return;
        }

        setState({
          status: "ready",
          fixture,
          sourceRegistry,
        });
      })
      .catch((error: unknown) => {
        if (!isMounted) {
          return;
        }

        setState({
          status: "error",
          message: error instanceof Error ? error.message : "Unknown bootstrap load failure.",
        });
      });

    return () => {
      isMounted = false;
    };
  }, []);

  if (state.status === "loading") {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading bootstrap fixtures</CardTitle>
          <CardDescription>Reading Packet 0 sample generated data from `public/data/`.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (state.status === "error") {
    return (
      <Card>
        <CardHeader>
          <Badge variant="outline">Bootstrap Error</Badge>
          <CardTitle>Fixture load failed</CardTitle>
          <CardDescription>{state.message}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const canonicalDocuments = state.sourceRegistry.data.documents.filter((document) => document.isCanonical);
  const planningDocuments = state.sourceRegistry.data.documents.filter((document) => !document.isCanonical);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-wrap gap-2">
            <Badge variant="accent">Packet 0 Complete Slice</Badge>
            <Badge variant="outline">Stable Routes</Badge>
            <Badge variant="outline">Typed Contracts</Badge>
          </div>
          <CardTitle>Foundation and contracts are live</CardTitle>
          <CardDescription>
            The app shell now reserves the full product route structure, loads sample generated JSON, and exposes the
            shared types that later packets will fill with canonical BLKOUT data.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {state.fixture.data.contracts.map((contract) => (
            <div key={contract.name} className="rounded-2xl border border-[color:var(--border)] p-4">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-sm font-semibold">{contract.name}</h3>
                <Badge>{contract.status}</Badge>
              </div>
              <p className="mt-3 text-sm leading-6 text-[color:var(--muted-foreground)]">{contract.notes}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardHeader>
            <CardTitle>Preferred First Vertical Slice</CardTitle>
            <CardDescription>
              Seed names come directly from the workflow document so later packets can fill them in without changing ids.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-[color:var(--muted-foreground)]">
                Lore
              </h3>
              <div className="mt-3 flex flex-wrap gap-3">
                {state.fixture.data.seedSlice.lorePages.map((page) => (
                  <Link
                    key={page.id}
                    className="rounded-2xl border border-[color:var(--border)] px-4 py-3 text-sm transition hover:bg-[color:var(--surface-muted)]"
                    to={page.route}
                  >
                    {page.title}
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-[color:var(--muted-foreground)]">
                Rules
              </h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {state.fixture.data.seedSlice.ruleTopics.map((topic) => (
                  <Badge key={topic} variant="outline">
                    {topic}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-[color:var(--muted-foreground)]">
                Force, Units, Scenario
              </h3>
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                <Link
                  className="rounded-2xl border border-[color:var(--border)] px-4 py-4 transition hover:bg-[color:var(--surface-muted)]"
                  to={state.fixture.data.seedSlice.force.route}
                >
                  <div className="font-medium">{state.fixture.data.seedSlice.force.name}</div>
                  <div className="mt-1 text-sm text-[color:var(--muted-foreground)]">Seed force route</div>
                </Link>

                <Link
                  className="rounded-2xl border border-[color:var(--border)] px-4 py-4 transition hover:bg-[color:var(--surface-muted)]"
                  to={state.fixture.data.seedSlice.scenario.route}
                >
                  <div className="font-medium">{state.fixture.data.seedSlice.scenario.title}</div>
                  <div className="mt-1 text-sm text-[color:var(--muted-foreground)]">Seed scenario route</div>
                </Link>
              </div>
              <div className="mt-3 flex flex-wrap gap-3">
                {state.fixture.data.seedSlice.units.map((unit) => (
                  <Link
                    key={unit.id}
                    className="rounded-2xl border border-[color:var(--border)] px-4 py-3 text-sm transition hover:bg-[color:var(--surface-muted)]"
                    to={unit.route}
                  >
                    {unit.name}
                  </Link>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Source Registry</CardTitle>
            <CardDescription>Canonical game documents are separated from planning inputs before ETL starts.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-[color:var(--muted-foreground)]">
                Canonical Inputs
              </h3>
              <div className="mt-3 space-y-3">
                {canonicalDocuments.map((document) => (
                  <div key={document.id} className="rounded-2xl border border-[color:var(--border)] p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="font-medium">{document.title}</div>
                      {document.precedenceRank !== undefined ? (
                        <Badge variant="outline">P{document.precedenceRank}</Badge>
                      ) : null}
                    </div>
                    <div className="mt-1 text-sm text-[color:var(--muted-foreground)]">{document.fileName}</div>
                    <div className="mt-3 text-sm leading-6 text-[color:var(--muted-foreground)]">{document.notes}</div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-[color:var(--muted-foreground)]">
                Planning Inputs
              </h3>
              <div className="mt-3 space-y-3">
                {planningDocuments.map((document) => (
                  <div key={document.id} className="rounded-2xl border border-[color:var(--border)] p-4">
                    <div className="font-medium">{document.title}</div>
                    <div className="mt-1 text-sm text-[color:var(--muted-foreground)]">{document.fileName}</div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Route Skeleton</CardTitle>
          <CardDescription>The full information architecture is reserved now so later packets can attach data without route churn.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 xl:grid-cols-3">
          {routeSections.map((section) => (
            <div key={section} className="space-y-3 rounded-2xl border border-[color:var(--border)] p-4">
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-medium">{section}</h3>
                <Badge variant="outline">
                  {appRouteManifest.filter((route) => route.section === section).length} routes
                </Badge>
              </div>
              <div className="space-y-2">
                {appRouteManifest
                  .filter((route) => route.section === section)
                  .map((route) => (
                    <Link
                      key={route.id}
                      className="block rounded-xl border border-[color:var(--border)] px-3 py-3 text-sm transition hover:bg-[color:var(--surface-muted)]"
                      to={route.path.replace(/:([A-Za-z]+)/g, "sample")}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="font-medium">{route.label}</span>
                        <Badge variant="outline">Packet {route.activationPacket}</Badge>
                      </div>
                      <div className="mt-1 text-[color:var(--muted-foreground)]">{route.path}</div>
                    </Link>
                  ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
