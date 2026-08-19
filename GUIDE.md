# Working in this codebase

This guide is binding for everyone and every agent touching `taskgid` or
`taskgid-api`.

**Deviating from anything here requires Abdullah's approval before the work is
done, not after.** If a rule blocks you, stop and ask. A deviation shipped
without approval gets reverted regardless of merit.

---

## 1. Comments

Write a comment only where the code cannot say the thing itself. That means
non-obvious runtime behaviour, a constraint imposed from outside, or a trap the
next reader would otherwise fall into.

Do not write comments that:

- restate what the line below does;
- narrate a decision, a discussion, a plan, or a phase;
- justify why an alternative was rejected;
- record what changed relative to some earlier version.

That reasoning belongs in the commit message or the pull request, which is where
someone goes looking for it. Code comments are read by people trying to change
the line, not by people auditing how it came to exist.

```js
// Good — the reader cannot infer this.
// RFC 5545. Must carry an explicit DTSTART; without one rrule takes the
// time-of-day from the moment of parsing.

// Bad — restates the code.
// Set the parent id to null to promote the subtask.

// Bad — narrates a decision.
// We chose SET NULL here rather than CASCADE because deleting a parent
// should not silently discard work, which was the failure mode we wanted
// to avoid when we settled the subtask semantics.
```

The same applies to `README.md` and every other document. State what a thing
does and the facts a reader cannot infer. Do not restate trade-offs, alternatives
considered, or the history of a decision.

### README is not a changelog

Shipping a feature is not, by itself, a reason to add a section to `README.md`.
The README describes the system as it stands today, for someone who was not
here for any of the work that produced it. Before adding to it, ask: does this
belong in *reference documentation for the current system*, or does it belong
in the PR description, which is where "what shipped and why" is supposed to
live?

If it's reference material, it still has to earn a place: point at the source
of truth instead of duplicating values that will drift, and write it so it
reads the same whether the feature shipped an hour ago or three years ago — no
"now supports," no "recently added," no explaining the alternative that was
rejected. When a new capability changes an existing section's meaning, edit
that section in place rather than appending a new one next to it.

## 2. Commits and pull requests

Subject line: `(type): lowercase summary`, imperative, describing the change.

```
(fix): paginate tasks by task, not by joined row
(feat): add task checklists, start dates and effort estimates
(chore): untrack the docs directory
```

Types in use: `feat`, `fix`, `chore`, `refactor`, `docs`, `test`.

The body explains the defect and the mechanism — what was wrong, what now
happens instead. Pull request titles and descriptions follow the same rule.

Never:

- credit Claude or any agent (`Co-Authored-By`, "Generated with…" footers);
- reference internal conversations, plans, phase numbers, or session history;
- describe what you intend to do next.

Branch from the default branch (`master` in `taskgid`, `main` in `taskgid-api`)
and name branches `feat/…`, `fix/…`, or `chore/…`. One concern per pull request.

## 3. Frontend components

### Build on Reka UI

Interactive primitives in `components/ui` wrap [Reka UI](https://reka-ui.com).
Do not hand-roll behaviour Reka already provides — menus, dialogs, popovers,
tooltips, tabs, selects, checkboxes, switches, calendars and their focus
management, keyboard handling and ARIA wiring.

The established wrapper pattern:

```vue
<script setup lang="ts">
import { DialogContent, type DialogContentEmits, type DialogContentProps, useForwardPropsEmits } from "reka-ui";
import { cn } from "@/lib/utils";

const props = defineProps<DialogContentProps & { class?: HTMLAttributes["class"] }>();
const emits = defineEmits<DialogContentEmits>();

const delegatedProps = computed(() => {
	const { class: _, ...delegated } = props;
	return delegated;
});
const forwarded = useForwardPropsEmits(delegatedProps, emits);
</script>

<template>
	<DialogContent data-slot="dialog-content" v-bind="forwarded" :class="cn('…base classes…', props.class)">
		<slot />
	</DialogContent>
</template>
```

Rules that follow from it:

1. Re-export Reka's own prop and emit types rather than redeclaring them.
2. Strip `class` out of delegated props and merge it through `cn()` last, so a
	consumer can always override.
3. Carry a `data-slot` attribute for styling and test hooks.
4. Use `asChild` to change the rendered element instead of adding a wrapper.

### Never write a raw `<button>`

ESLint enforces this. Use `Button` for conventional actions and `Pressable` for
custom-shaped controls.

### Where code goes

`features/README.md` owns the module architecture and its dependency rules.
Read it before adding a file. In short: product code lives in
`features/<capability>/`, shared primitives in `components/ui`, and a route file
imports one feature entry component and nothing else.

A composable owns behaviour whenever it combines API state, mutations, URL
state, non-trivial derived state, browser APIs, or a third-party lifecycle.
Components should stay scannable as structure.

Server state goes through TanStack Query and `useApiFetch`, never a bare
`$fetch` in a component. Endpoint paths come from `utils/endpoints.ts`.

## 4. Styling

`assets/design-tokens.css` is the source of colour and geometry. Use semantic
roles — `text-text-primary`, `bg-surface-1`, `border-border`, `text-success`,
`text-danger` — and never a raw Tailwind palette colour (`text-gray-500`) or a
hex value in a component. A theme change must be possible by editing tokens
alone.

Tokens also cover motion (`--duration-fast`, `--ease-out`) and stacking
(`--z-modal`, `--z-toast`). Do not invent z-index numbers.

Class order is handled by `prettier-plugin-tailwindcss`. Do not reorder by hand.

## 5. Code style

Both repos are formatted by tooling; run it rather than matching by eye.

**`taskgid`** — Prettier with tabs, width 4, print width 200, double quotes,
semicolons, ES5 trailing commas. TypeScript throughout; `any` needs a reason.

**`taskgid-api`** — ESLint `google` config: 4-space indent, 120-column lines,
single quotes, and JSDoc on exported functions with `@param` and `@return`.

Before opening a pull request:

```bash
pnpm check        # taskgid: lint, typecheck, format:check
pnpm lint         # taskgid-api
```

## 6. Backend specifics

- Schema changes need a migration in `migrations/`. `sequelize.sync({force:false})`
	creates missing tables but never missing columns, so migrations run before the
	server, not after.
- Use the helpers in `scripts/migration-helpers.cjs` (`addColumnIfMissing`,
	`addIndexIfMissing`, …). The database predates migrations and drifts.
- Respond through `successResponse` / `errorResponse`, and paginate through
	`getPaginationParams` / `createPaginatedResponse`.
- Postgres returns `COUNT(*)` as a string. Cast `::int`, or `"0"` is truthy.
- The API is serverless. Nothing may rely on a long-lived process, in-memory
	state shared between requests, or a persistent connection; realtime goes
	through Pusher and scheduled work through a cron-invoked script.

## 7. Verification

Claims about behaviour must be backed by having run it. Typechecking is not
evidence that a feature works. Exercise the change against a running stack, and
state plainly what you could not verify rather than implying coverage you do not
have.
