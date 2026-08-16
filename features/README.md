# Feature architecture

Product code is organized by capability. Each feature owns its interface, workflow state, feature-specific stores, and local types.

```text
features/
  activity/       # Activity descriptions and presentation rules
  auth/           # Sign-in and account creation
  dashboard/      # Cross-workspace home and focus queue
  identity/       # Shared identity capabilities such as passkeys
  navigation/     # Product header, mobile dock, and command palette
  notifications/  # Notification UI and Novu adapter
  settings/       # Account profile, password, and passkey settings
  tasks/          # Task list, board, inspector, editor, timeline
  teams/          # Team directory, member details, and statistics
  workspaces/      # Workspace selection, overview, invitations, and settings
```

Each feature can contain:

```text
feature/
  components/     # Rendering and user interaction
  composables/    # Queries, mutations and derived workflow state
  stores/         # Persistent client state owned by this feature
  types.ts        # Types used only within this feature
  index.ts        # Public UI entry points used by routes or other features
```

## Dependency rules

1. Route files import a single feature entry component and contain route metadata only.
2. A feature uses relative imports for its own private files.
3. Cross-feature UI imports go through the owning feature's `index.ts`.
4. Store-only consumers import `features/<feature>/stores` so they do not load a feature's UI entry graph.
5. Shared UI primitives live in `components/ui`; shared application services live in top-level `composables`, `stores`, and `utils`.
6. Domain components and domain stores do not belong in top-level `components` or `stores`.

The remaining top-level components are deliberately domain-neutral application primitives: the brand mark, empty states, destructive actions, the spinner, shared form-field renderers, and loading skeletons.

## Component and composable boundary

Components should make the screen structure easy to scan. A composable owns behavior when it combines API state, mutations, URL state, non-trivial derived state, browser APIs, or a third-party integration lifecycle. It should expose a small interface in product language without leaking implementation details.

Examples:

- `useTaskWorkbench` owns task filters, board grouping, URL selection, and editor state.
- `useTaskEditor` owns form mapping, validation, and create or update mutations.
- `useTeamMemberDetails` owns member tasks, activity, and completion metrics.
- `useWorkspaceSettings` owns the settings draft, dirty state, and save lifecycle.
- `useAvatarCrop` owns browser image processing and temporary object URLs.
- `useNotificationInbox` owns Novu connections, listeners, unread state, and mounting.

## Design-system dependency direction

```text
assets/design-tokens.css
  -> assets/css/tailwind.css
    -> components/ui
      -> features/*
        -> pages/*
```

`assets/design-tokens.css` is the source of color and geometry values. Feature code uses semantic roles such as surfaces, text, borders, accent, success, warning, and danger. Theme changes should flow through tokens and primitives instead of requiring screen-by-screen color changes.

## Product flow decisions

- The task list, board, details, editor, comments, and delete flow share one workbench and URL context.
- Account settings is a route, not a global sheet.
- Workspace selection is a searchable switchboard; opening a workspace lands on its overview.
- The product uses one top navigation and a compact mobile dock. There is no persistent sidebar.
