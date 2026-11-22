# Phase 6C — Manual Accessibility Review

Status: **not run**. This record must be completed by a human reviewer before
Phase 6C can close.

## Review environment

| Field                  | Required value                         | Actual value |
| ---------------------- | -------------------------------------- | ------------ |
| Review date            | `YYYY-MM-DD`                           | —            |
| Reviewer               | Name or team handle                    | —            |
| Operating system       | macOS `26.6.2` arm64                   | —            |
| Browser                | Chrome `158.0.8127.36`                 | —            |
| Assistive technology   | macOS VoiceOver                        | —            |
| Storybook origin       | `http://localhost:6006`                | —            |
| Browser zoom           | `100%` and `200%`                      | —            |
| Appearance/direction   | light/LTR and dark/RTL                 | —            |
| Accessibility settings | default, reduced motion, forced colors | —            |

Start Storybook with `pnpm storybook`. Use the iframe links so the browser and
assistive technology review only the rendered story.

## Required stories

- Cross-pattern flow:
  `http://localhost:6006/iframe.html?id=patterns-cross-pattern-application--overview-detail-edit-flow&viewMode=story`
- Dark/RTL interaction matrix:
  `http://localhost:6006/iframe.html?id=patterns-cross-pattern-application--dark-rtl-matrix&viewMode=story`
- Narrow cross-pattern layout:
  `http://localhost:6006/iframe.html?id=patterns-cross-pattern-application--narrow-viewport&viewMode=story`
- Invalid field:
  `http://localhost:6006/iframe.html?id=luna-form-field--invalid&viewMode=story`
- Dialog:
  `http://localhost:6006/iframe.html?id=luna-dialog--default&viewMode=story`
- Responsive data-table controls:
  `http://localhost:6006/iframe.html?id=luna-datatable-controls--responsive-table-controls&viewMode=story`

## Checklist

Record **Pass**, **Fail**, or **Blocked** and add a short note for every row.

| Review                 | Procedure                                                                                                                                                                                                                                  | Result | Notes |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------ | ----- |
| Keyboard order         | Use only Tab and Shift+Tab through the cross-pattern flow. Focus order follows the visual/reading order and every focused control has a visible indicator.                                                                                 | —      | —     |
| Keyboard overlays      | Open select, searchable select, menu/submenu, popover, dialog, sheet, date picker, and tooltip from the dark/RTL matrix. Arrow keys work in the current direction, Escape closes, focus returns to the trigger, and no focus trap remains. | —      | —     |
| VoiceOver structure    | With VoiceOver enabled, inspect landmarks, headings, buttons, form controls, table, and pagination using the rotor. Names, roles, levels, and states are understandable without visual context.                                            | —      | —     |
| VoiceOver validation   | In the invalid-field and edit-flow stories, the field name, required/invalid state, description, and error are announced together.                                                                                                         | —      | —     |
| VoiceOver live regions | Trigger validation/status changes and the success toast. Updates are announced once with appropriate urgency and do not move focus unexpectedly.                                                                                           | —      | —     |
| VoiceOver dialog       | Open the dialog. Its role, title, and description are announced; focus starts inside, remains contained, and returns to the trigger after Escape.                                                                                          | —      | —     |
| Table navigation       | Read the operational table with VoiceOver. Caption/name, headers, row context, selection state, and labelled horizontal scroll guidance are available.                                                                                     | —      | —     |
| 200% zoom              | Set Chrome zoom to 200% on the cross-pattern flow and dark/RTL matrix. Text reflows, controls remain reachable, and the page has no horizontal overflow except labelled table regions.                                                     | —      | —     |
| 320 px layout          | Use Chrome responsive mode at 320 CSS px on the narrow story. Content is readable, actions wrap, the desktop sidebar is replaced appropriately, and dense tables scroll internally.                                                        | —      | —     |
| Forced colors          | In Chrome DevTools Rendering, emulate `forced-colors: active`. Focus, selected, invalid, disabled, status, and chart states remain distinguishable without relying on color alone.                                                         | —      | —     |
| Reduced motion         | Enable macOS Reduce Motion or emulate `prefers-reduced-motion: reduce`. Overlays still close, state changes remain clear, and sidebar/chart/disclosure movement is removed without hiding feedback.                                        | —      | —     |
| Theme and RTL          | Repeat the highest-risk portal, table, chart, and navigation checks in dark/RTL. Text contrast, logical alignment, directional keys, and portal placement remain correct.                                                                  | —      | —     |

## Findings

Record every failure with the story URL, exact control, reproduction steps, and
expected behavior. Phase 6C remains open until each finding is fixed and
retested or explicitly removed from the support claim.

| ID  | Severity | Story and element | Reproduction | Expected behavior | Resolution |
| --- | -------- | ----------------- | ------------ | ----------------- | ---------- |
| —   | —        | —                 | —            | —                 | —          |

## Sign-off

- [ ] Every checklist row is marked **Pass**.
- [ ] All findings are resolved and retested.
- [ ] Reviewer, date, OS, browser, assistive technology, and URLs are recorded.
- [ ] `PHASE_6C_COMPATIBILITY_ACCESSIBILITY.md` is updated with this evidence.

Reviewer: —  
Date: —
