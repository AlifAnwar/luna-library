# Phase 5D — Enterprise Workflow UI Primitives

## Scope

Phase 5D adds read-only presentation for chronological activity and approval
history. Applications continue to own workflow state, authorization, actor and
entity lookup, timestamp formatting, locale, persistence, and every transition.

## Audit and reuse decisions

| Need                             | Existing capability                                                                                                                             | Decision                                                                                          |
| -------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| Chronological application events | Cards and lists can contain events but do not provide timeline structure                                                                        | Add `ActivityLog` and `ActivityLogItem`.                                                          |
| Arbitrary approval history       | `Stepper` derives completed/current/upcoming state from one numeric step and cannot present rejected or non-linear history                      | Add `ApprovalTimeline` and `ApprovalTimelineItem` with consumer-provided labels and visual tones. |
| Structured audit records         | The same chronology plus `DetailList`, links, or other children covers the presentation need                                                    | Compose inside `ActivityLogItem`; do not add a near-duplicate `AuditLog`.                         |
| User, role, and entity selection | `Combobox`, `SearchableSelect`, and `MultiSelect` cover local selection, while directory fetching and authorization remain application concerns | Defer dedicated selectors until a generic remote-data and accessibility contract is approved.     |
| Permission administration        | A matrix needs a separate keyboard, table, bulk-edit, and enforcement-semantics proposal                                                        | Defer `PermissionMatrix`.                                                                         |

## Public API

### `ActivityLog` and `ActivityLogItem`

- Render native ordered-list semantics for chronological events.
- Require a complete event title and consumer-formatted timestamp.
- Accept an optional decorative marker and arbitrary message or structured
  details through children.
- Wrap long labels, identifiers, and messages without widening the page.

### `ApprovalTimeline` and `ApprovalTimelineItem`

- Render native ordered-list semantics for a sequence of review steps.
- Require visible consumer-provided title and status content.
- Offer neutral, info, success, warning, and danger visual tones without
  assigning business meaning or deriving state.
- Accept optional decorative markers, metadata, and explanatory content.
- Forward native list-item attributes such as `aria-current="step"` when the
  consumer wants to identify a current step.

## Accessibility and UI decisions

- Status text is required and visible, so tone is never the only state cue.
- Markers are decorative and hidden from assistive technology; the title and
  status remain the semantic source of truth.
- Both primitives are read-only and introduce no custom keyboard interaction or
  focus order.
- Timeline connectors use structural borders, while spacing remains the primary
  grouping mechanism.
- Logical inline positioning supports right-to-left layouts.
- Compact-medium density, Luna type tokens, semantic colors, and existing
  surface tokens are reused without new dependencies.

## Recipe coverage

- Activity history: default, long event message, empty history, and narrow
  layout.
- Approval timeline: complete and pending steps, rejected state, long labels,
  and narrow layout.
- Stories import only from the public `@withalif/luna` entry point.

## Acceptance criteria

- Application data determines every title, status, timestamp, actor, and tone.
- No component executes approvals or implies that visual state enforces access.
- Lists retain valid native semantics and do not add unnecessary ARIA roles.
- Visible status labels provide a non-color cue for every approval state.
- Long content reflows without page-level horizontal overflow at 320 px.
- Public props, semantics, class composition, and package exports are tested.
- No new runtime dependency is introduced.
