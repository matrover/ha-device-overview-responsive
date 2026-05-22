# Test Plan

## Scope

Validate that Device Overview Responsive expands Home Assistant device overview columns to the viewport width with side margins equal to the card gap.

## Scenarios

1. Wide desktop device page
   - Open a device page with at least three device columns.
   - Expected: left and right grid margins equal the vertical card gap, normally about `16px`.
   - Expected: three device columns stay side by side when there is enough room.

2. Medium desktop/tablet width
   - Test around 900-1200px viewport width.
   - Expected: columns reduce to the number that fits the minimum column width.
   - Expected: no horizontal clipping of card content.

3. Narrow/mobile width
   - Test below 870px.
   - Expected: one column.
   - Expected: side margins remain about the same as the card gap.

4. SPA navigation
   - Navigate from a non-device page to a device page and back.
   - Expected: styles apply only on `/config/devices/device/...`.
   - Expected: no stale grid class remains on other pages.

5. Different device content
   - Test a sparse device page and a dense device page.
   - Expected: header/full-width rows span the full grid.
   - Expected: controls, sensors, activity, scripts, automations and scenes remain readable.

6. Edge cases
   - Device page with an empty middle column.
   - Device page with a warning/repair card before the main device info.
   - Device page with disabled entities or configuration cards.
   - Device page where controls are rendered in a column without a plain light-DOM `ha-card`.
   - Very wide viewport.
   - Browser resize after page load.
   - Hard refresh/new tab after HACS update.
   - Expected: no frontend console errors from `device-overview-responsive.js`.

## Automated Checks

- JavaScript syntax check.
- Python compile check for the integration files.
- Home Assistant integration state is `loaded`.
- HACS installed version matches the release.
- Home Assistant error log contains no `device_overview` errors.
