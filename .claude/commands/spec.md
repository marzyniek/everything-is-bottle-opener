# Feature Specification

Generate a thorough specification for a new feature so it can be handed directly to Claude Code for implementation.

**Feature request:** $ARGUMENTS

## Your task

1. Read `CLAUDE.md` to ground yourself in the project architecture.
2. Explore the codebase as needed to understand exactly where and how this feature fits — relevant schema, server actions, pages, components, and i18n keys.
3. Produce a self-contained spec (below) that a fresh Claude Code instance could implement without reading the rest of this conversation.

---

## Spec format to produce

### What & Why
One paragraph: what the feature does and why it is worth building. Be concrete — name the specific user action and the outcome.

### Scope
- **In:** what is being built
- **Out:** related things explicitly not being built in this change

### Data model changes
List any new tables, columns, or index changes required in `src/db/schema.ts`. If none, say "None."

For each change, write the Drizzle column definition snippet, e.g.:
```ts
rating: integer("rating").notNull().default(0),
```

### New / changed server actions (`src/app/[locale]/actions.ts`)
For each action: name, parameters, what it does, which paths it revalidates.

### New / changed API routes
For each route: method, path, auth requirement, request shape, response shape.

### Pages & components
For each new or significantly changed file:
- File path
- Server component or client component
- What it renders / what it does
- Props it receives

### i18n keys
List every new translation key that must be added to `messages/cz.json` (and mirrored in `messages/en.json`), grouped by namespace. Include the suggested Czech string.

### Middleware / routing changes
Any changes to `src/middleware.ts` or `src/i18n/routing.ts` (protected routes, new locales, etc.). If none, say "None."

### Edge cases & constraints
Bullet list of non-obvious constraints, validation rules, or failure modes that the implementation must handle.

### Implementation order
A numbered checklist of discrete steps in the order they should be done (schema → migration → actions → API → components → i18n → wiring). Each step should be small enough to verify independently.
