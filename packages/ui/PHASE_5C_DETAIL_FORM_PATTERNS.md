# Phase 5C — Detail Page & Form Workflow Patterns

## Scope

Phase 5C validates that Luna's existing page, card, form, and feedback
primitives can compose generic record detail and edit workflows. Application
code continues to own routing, data, validation rules, persistence, and
unsaved-change policy.

## Audit and reuse decisions

| Need                          | Existing capability                                                           | Decision                                                                 |
| ----------------------------- | ----------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| Detail or edit page heading   | `PageHeader`, breadcrumb, and button primitives                               | Reuse; do not add `DetailPageHeader`.                                    |
| Section surface and hierarchy | `Card` composition primitives                                                 | Reuse in recipes; do not add a competing section card.                   |
| Read-only label/value layout  | `MetricComparison` is metric-specific and requires emphasized numeric values  | Add `DetailList` and `DetailField` with native `dl`/`dt`/`dd` semantics. |
| Form field relationships      | `FormField`, `FormLabel`, `FormControl`, `FormDescription`, and `FormMessage` | Reuse without introducing a form engine.                                 |
| Form section grouping         | Card header/content composition                                               | Reuse in the edit recipe; do not add `FormSection`.                      |
| Form action placement         | Button primitives plus responsive layout utilities                            | Document as a recipe; do not add a one-layout `FormActions` wrapper.     |

## Public API

### `DetailList`

- Renders a semantic description list.
- Supports one, two, or three responsive columns.
- Supports default and compact density.
- Uses container queries so it responds to its own available width.

### `DetailField`

- Renders one `dt`/`dd` pair inside a wrapper.
- Accepts a visible label and arbitrary read-only value content.
- Provides consumer-overridable empty-value copy.
- Supports full-row spanning for long values.
- Wraps long identifiers and unbroken values without widening the page.

## Recipe coverage

- Record detail: default, empty values, long values, compact density, and
  narrow layout.
- Record edit: default interaction, inline validation errors, save pending,
  and narrow action layout.
- Recipes import only from the public `@withalif/luna` entry point.

## Acceptance criteria

- One coherent `h1` → `h2` heading hierarchy per recipe.
- Read-only values use native description-list semantics.
- Every form control has a visible programmatic label; help and error copy are
  associated through the existing form-field primitives.
- Submit remains available for validation and keeps its label while pending.
- The first invalid field receives focus after an invalid submission.
- Long values and 320 px compositions do not introduce page-level overflow.
- Consumer callbacks own edit, cancel, submit, and persistence behavior.
- No new runtime dependencies or application-specific business rules.
