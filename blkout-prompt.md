# BLKOUT LLM Working Prompt

Use this file as the working instructions for any LLM continuing implementation of this repository.

## Source Documents And Their Roles

- `blkout-app.md`
  - Product intent and overall goals for `LEAP Sitrep`
  - Use this for what the app is supposed to do and what qualities it should prioritize
- `blkout-implementation.md`
  - The master implementation plan
  - Use this for packet order, validation gates, review checkpoints, escalation rules, and completion standards
- `blkout-progress.md`
  - The running implementation status
  - Use this to determine what has already been completed, what is in progress, what important findings exist, and what the next packet should be
- `session-log.md`
  - The chronological history of meaningful implementation sessions
  - Use this for historical decisions, validation context, previous blockers, and why earlier work changed

Do not treat `blkout-progress.md` as a replacement for `blkout-implementation.md`.
Do not treat `blkout-implementation.md` as a replacement for `blkout-app.md`.

## Primary Responsibility

Continue implementing the project packet-by-packet with the smallest complete vertical slice first.

Follow the plan in `blkout-implementation.md`.
Use `blkout-progress.md` to resume from the latest known state.
Use `blkout-app.md` to stay aligned with the product goals.

## Required Session Start Workflow

At the start of each implementation session:

1. Read `blkout-app.md`.
2. Read `blkout-implementation.md`.
3. Read `blkout-progress.md`.
4. Read `session-log.md`.
5. Inspect the current codebase and confirm whether the recorded progress still matches reality.
6. Identify the highest fully completed packet.
7. Continue the first incomplete packet unless the user explicitly reprioritizes.

If `blkout-progress.md` is stale or inaccurate, correct it as part of the session.

The default session invocation can be minimal:

`Read and follow blkout-prompt.md as the operating instructions for this session, and pick up from the next piece of work.`

That instruction should be treated as enough to begin. The LLM should gather the rest of the needed context from the tracked project documents above.

## Progress Tracking Rules

`blkout-progress.md` is the persistent running record of implementation progress.

Update `blkout-progress.md` whenever one of these happens:

- a packet is completed
- a meaningful sub-slice is completed
- a major validation result changes confidence in the current state
- a blocker, risk, or important limitation is discovered
- the recommended next step changes
- the highest completed packet changes

Progress updates should be factual and concise.
They should reflect what is actually implemented in the repository, not what was merely discussed.

## Implementation Rules

- Follow the packet order in `blkout-implementation.md`.
- Do not skip ahead unless the current packet is blocked or the user explicitly changes priorities.
- Build the smallest correct slice inside the current packet.
- Prefer trustworthiness over speed.
- Prefer a complete vertical slice over broader but partial implementation.
- Do not invent rules, stats, units, handlers, weapon data, or other unsupported game content.
- Preserve citations and source metadata in data pipelines and important user-facing rule surfaces.
- Keep the app local-first unless the user explicitly approves broader infrastructure.

## Source And Rules Discipline

Use the markdown sources as the primary machine-readable inputs.
Treat OCR-derived or visually extracted material as verification support unless the project explicitly marks it as curated and verified.

When sources conflict, use the precedence model defined in `blkout-app.md` and `blkout-implementation.md`:

1. supplemental rulings and verified support documents
2. mode-specific overlays such as matched play
3. force card and unit card text
4. core rulebook text
5. quick reference summaries only after manual verification

If a conflict still cannot be resolved safely, stop and ask the user.

## Validation Expectations

Every meaningful implementation step should include relevant validation.

Use the repository scripts when available, especially:

- `bun run build:data`
- `bun run build`
- `bun run lint`
- `bun run test`
- `bun run typecheck`

If only targeted validation is appropriate for the current change, run the smallest relevant command set and record the result accurately.

## Manual QA Expectations

When a packet requires source verification, compare the generated or curated output against the appropriate source material and record the result in the relevant QA notes.

If a task materially changes project status, also reflect that change in `blkout-progress.md`.

## User Escalation Rules

Ask the user when:

- source conflicts remain ambiguous after applying precedence
- a required datum is missing and would need to be invented
- OCR or card verification remains unreadable or ambiguous
- a major UX or IA decision has multiple materially valid directions
- a new architecture would be required beyond the documented stack
- backend, auth, sync, multiplayer, or other out-of-scope systems would be required

Do not ask the user about small local implementation choices that are reversible and already aligned with the plan.

## Definition Of Done For A Session

A productive implementation session should usually end with all of the following:

1. code or data changes completed for the targeted slice
2. relevant validation run
3. manual QA recorded if required by the packet
4. `blkout-progress.md` updated to reflect the new state
5. open risks or blockers clearly noted

## Practical Reminder

`blkout-implementation.md` is the roadmap.
`blkout-progress.md` is the handoff state.
`session-log.md` is the historical trail.
`blkout-app.md` is the product north star.

Use all four together.
