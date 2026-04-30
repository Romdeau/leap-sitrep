import { Navigate, Route, Routes } from "react-router-dom";

import { AppShell } from "@/app/app-shell";
import { BuilderRoute } from "@/features/builder/builder-route";
import { DevComponentsRoute } from "@/features/dev/components-route";
import { MatchDetailRoute, MatchesRoute } from "@/features/matches/matches-route";
import {
  ForceDetailRoute,
  ForcesRoute,
  GlossaryRoute,
  LoreFactionDetailRoute,
  LoreHubRoute,
  ReferenceHomeRoute,
  RulesCoreRoute,
  RulesLandingRoute,
  RulesMatchedPlayRoute,
  ScenarioDetailRoute,
  ScenariosRoute,
  TimelineRoute,
  UnitDetailRoute,
  UsrDetailRoute,
} from "@/features/reference/reference-ui";

export function AppRouter() {
  return (
    <Routes>
      <Route element={<AppShell />} path="/">
        <Route index element={<ReferenceHomeRoute />} />
        <Route element={<LoreHubRoute />} path="lore" />
        <Route element={<TimelineRoute />} path="lore/timeline" />
        <Route element={<LoreFactionDetailRoute />} path="lore/factions/:slug" />
        <Route element={<ForcesRoute />} path="forces" />
        <Route element={<ForceDetailRoute />} path="forces/:forceId" />
        <Route element={<UnitDetailRoute />} path="units/:unitId" />
        <Route element={<RulesLandingRoute />} path="rules" />
        <Route element={<RulesCoreRoute />} path="rules/core" />
        <Route element={<RulesMatchedPlayRoute />} path="rules/matched-play" />
        <Route element={<UsrDetailRoute />} path="rules/usr/:slug" />
        <Route element={<ScenariosRoute />} path="scenarios" />
        <Route element={<ScenarioDetailRoute />} path="scenarios/:scenarioId" />
        <Route element={<BuilderRoute />} path="builder" />
        <Route element={<MatchesRoute />} path="matches" />
        <Route element={<MatchDetailRoute />} path="matches/:matchId" />
        <Route element={<GlossaryRoute />} path="glossary" />
        <Route element={<DevComponentsRoute />} path="dev/components" />
        <Route element={<Navigate replace to="/" />} path="*" />
      </Route>
    </Routes>
  );
}
