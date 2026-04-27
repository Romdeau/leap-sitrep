import { useMemo } from "react";
import { Link, useLocation, useParams } from "react-router-dom";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { appRouteManifest, getRouteManifestEntry } from "@/lib/routes/manifest";

export function PlaceholderRoute({ routeId }: { routeId: string }) {
  const location = useLocation();
  const params = useParams();
  const route = getRouteManifestEntry(routeId);

  const relatedRoutes = useMemo(
    () =>
      appRouteManifest.filter(
        (candidate) =>
          candidate.section === route?.section &&
          candidate.id !== route?.id &&
          candidate.activationPacket === route?.activationPacket,
      ),
    [route?.activationPacket, route?.id, route?.section],
  );

  if (route === undefined) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Unknown route placeholder</CardTitle>
          <CardDescription>The route manifest entry for this placeholder was not found.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">Packet {route.activationPacket}</Badge>
            <Badge>{route.section}</Badge>
          </div>
          <CardTitle>{route.label}</CardTitle>
          <CardDescription>{route.summary}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-[color:var(--muted-foreground)]">
                Stable Route
              </h3>
              <p className="mt-2 text-sm">{location.pathname}</p>
            </div>

            <div>
              <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-[color:var(--muted-foreground)]">
                Required Contracts
              </h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {route.dataContracts.map((contract) => (
                  <Badge key={contract} variant="outline">
                    {contract}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-[color:var(--muted-foreground)]">
                Route Params
              </h3>
              {Object.keys(params).length === 0 ? (
                <p className="mt-2 text-sm text-[color:var(--muted-foreground)]">No dynamic params on this route.</p>
              ) : (
                <ul className="mt-2 space-y-2 text-sm">
                  {Object.entries(params).map(([key, value]) => (
                    <li key={key}>
                      <span className="font-medium">{key}</span>: {value}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div>
              <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-[color:var(--muted-foreground)]">
                Next Fill-In
              </h3>
              <p className="mt-2 text-sm leading-6 text-[color:var(--muted-foreground)]">
                This path is intentionally live in Packet 0 so later packets can attach lore, rules, builder, and
                tracker features without inventing new URLs or data boundaries.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {relatedRoutes.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Related Routes</CardTitle>
            <CardDescription>Nearby placeholders scheduled for the same implementation packet.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2">
            {relatedRoutes.map((relatedRoute) => (
              <Link
                key={relatedRoute.id}
                className="rounded-2xl border border-[color:var(--border)] px-4 py-4 text-sm transition hover:bg-[color:var(--surface-muted)]"
                to={relatedRoute.path.replace(/:([A-Za-z]+)/g, "sample")}
              >
                <div className="font-medium">{relatedRoute.label}</div>
                <div className="mt-1 text-[color:var(--muted-foreground)]">{relatedRoute.path}</div>
              </Link>
            ))}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
