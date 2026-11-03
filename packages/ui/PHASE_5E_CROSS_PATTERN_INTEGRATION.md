# Phase 5E — Cross-pattern Integration and Examples

## Scope

Phase 5E validates that Luna's public Phase 1–5 APIs compose into one coherent
application flow. It adds an integration recipe and tests, not another page
framework, router, data layer, form engine, or exported package component.

## Audit and reuse decisions

| Integration need                         | Existing capability                                                                 | Decision                                                                                                            |
| ---------------------------------------- | ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| Application frame and navigation         | `SidebarProvider`, `Sidebar`, `SidebarMenuLink`, `SidebarTrigger`, and `PageHeader` | Reuse as a Storybook shell recipe; do not add `AppShell`.                                                           |
| Analytics summary and trend              | `DashboardGrid`, `DashboardWidget`, `KpiCard`, and `LineChart`                      | Reuse with one widget header and consumer-formatted data.                                                           |
| Operational search, filters, and records | `DataTableToolbar`, `DataTableSearch`, `DataTableFilter`, and `DataTable`           | Reuse controlled APIs; application owns filtering and selection of the active record.                               |
| Overview → detail → edit transition      | Native links and buttons plus application-owned React state                         | Keep navigation, focus movement, announcements, and persistence in the recipe; do not export a workflow controller. |
| Read-only record content                 | `DetailList`, `DetailField`, and Card composition                                   | Reuse without a detail-page wrapper.                                                                                |
| Record editing and validation            | `FormField`, `FormControl`, `Input`, `Textarea`, and Button                         | Reuse; application owns values, validation, and save/cancel behavior.                                               |
| Activity and approval context            | `ActivityLog` and `ApprovalTimeline`                                                | Reuse inside the detail composition without adding audit or workflow execution APIs.                                |

No public package export or runtime dependency is added in Phase 5E.

## Integration recipe

`CrossPatternApplication.stories.tsx` demonstrates:

- A router-neutral shell with skip navigation, banner, named primary navigation,
  and one focusable main landmark.
- An analytics and operations overview with a reporting-period control, KPI
  cards, a chart, controlled search/filter controls, and a responsive table.
- Application-owned navigation from overview to record detail and edit.
- A detail composition containing native description-list semantics, activity
  history, and consumer-labelled approval states.
- A controlled edit form with visible labels, associated help/error copy,
  first-error focus, save, cancel, and application-owned persistence.
- Loading, empty, unavailable/recovery, validation, long-content, and 320 px
  integration states.

All Luna imports use the public `@withalif/luna` package entry point.

## Ownership boundaries

### Application owns

- Routes, URL state, current page, focus policy after navigation, and live
  announcements for route-like changes.
- API requests, loading/error meaning, filtering, calculations, formatting,
  locale, and timezone.
- Form state, validation rules, persistence, cancellation, and unsaved-change
  policy.
- Authorization, approval execution, and the meaning of activity or workflow
  statuses.

### Luna owns

- Semantic presentation primitives and generic controlled interaction
  contracts.
- Responsive composition behavior within each exported component.
- Visible focus treatment, accessible field relationships, generic data states,
  and status styling that does not rely on color alone.

## Integration review criteria

- Exactly one banner and one primary main landmark in the application recipe.
- Coherent `h1` → `h2` heading order for overview, detail, and edit states.
- Native links for navigation and buttons for actions.
- Route-like transitions move focus to the main landmark and update a stable
  polite live region.
- Popover filters close with Escape and restore focus to their trigger.
- Charts retain titles/descriptions while duplicate visible widget headers are
  suppressed.
- Dense tables keep horizontal overflow inside their labelled region.
- No page-level overflow at 1440, 1024, 768, 375, or 320 px.
- Automated accessibility checks introduce zero regressions; manual keyboard
  and rendered responsive review supplement automation.

## Deferred beyond Phase 5E

Real router bindings, remote data orchestration, optimistic updates,
unsaved-change blocking, permissions enforcement, workflow execution, and a
production application template remain consumer or later-milestone concerns.
