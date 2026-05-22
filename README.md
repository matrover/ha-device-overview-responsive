# Device Overview Responsive

<p align="center">
  <a href="https://my.home-assistant.io/redirect/hacs_repository/?owner=matrover&repository=ha-device-overview-responsive&category=integration">
    <img src="https://my.home-assistant.io/badges/hacs_repository.svg" alt="Open this repository in HACS">
  </a>
  <a href="https://my.home-assistant.io/redirect/integrations/">
    <img src="https://my.home-assistant.io/badges/integrations.svg" alt="Open integrations in Home Assistant">
  </a>
</p>

Make Home Assistant device overview pages use the full browser width.
Device Overview Responsive is a small HACS custom integration that registers
a frontend module globally. It improves the built-in device detail pages under
Settings by widening the narrow card columns on desktop screens.

It is built for Home Assistant setups with wide monitors, wall panels,
large device pages, ESPHome devices, Z-Wave devices, Zigbee devices,
diagnostic-heavy integrations, and dashboards where the default device overview
leaves too much empty space.

<img width="1564" height="816" alt="image" src="https://github.com/user-attachments/assets/7723093a-1ef0-439c-b9f4-6f09941dde03" />

## Search keywords

- Home Assistant device overview
- HACS device overview
- responsive device page
- wide device page
- Home Assistant frontend module
- device columns
- Home Assistant settings layout
- ESPHome device overview
- Z-Wave device overview
- Zigbee device overview
- custom integration
- frontend integration
- HACS custom integration

## Features

- Detects Home Assistant device overview pages automatically.
- Uses the available viewport width instead of keeping narrow default columns.
- Applies a `2/8 - 4/8 - 2/8` distribution for three-column layouts.
- Keeps the middle Controls/Sensors column wider on desktop screens.
- Lets warning and repair cards span the full width.
- Uses one column on narrow screens.
- Re-applies after Home Assistant route changes and browser resizing.
- Requires no dashboard YAML, Lovelace resources, entities, helpers, or automations.

## Installation

### HACS

Add this repository to HACS with My Home Assistant:

<p>
  <a href="https://my.home-assistant.io/redirect/hacs_repository/?owner=matrover&repository=ha-device-overview-responsive&category=integration">
    <img src="https://my.home-assistant.io/badges/hacs_repository.svg" alt="Add Device Overview Responsive to HACS">
  </a>
</p>

Or install manually:

1. Open HACS in Home Assistant.
2. Open the menu and choose `Custom repositories`.
3. Add this repository URL:

   ```text
   https://github.com/matrover/ha-device-overview-responsive
   ```

4. Select category `Integration`.
5. Install `Device Overview Responsive`.
6. Restart Home Assistant.
7. Add `Device Overview Responsive` under Settings > Devices & services.
8. Hard refresh the browser, clear frontend cache, or restart the Home Assistant companion app.

The integration serves and registers this frontend module automatically:

```text
/device_overview_responsive/device-overview-responsive.js
```

The registered URL includes a version query string, for example:

```text
/device_overview_responsive/device-overview-responsive.js?v=0.3.5
```

## How It Works

When a Home Assistant device page opens, the module searches the rendered page
for the built-in device overview card container. It then applies a responsive
wrapping layout to that container.

On wide screens, three-column pages use weighted columns: the outer columns get
2 parts each and the middle column gets 4 parts. On smaller screens, the columns
wrap naturally, and below the mobile breakpoint they stack into one column.

## Supported Use Cases

- Device overview pages on wide desktop monitors.
- Device pages with Controls, Sensors, Activity, Automations, Scenes, Scripts, or Configuration cards.
- Device pages with warning or repair cards above the main content.
- ESPHome, Z-Wave, Zigbee, MQTT, UniFi, Shelly, Tuya, and other integration device pages.
- Home Assistant instances where the default device page wastes horizontal space.

## Limitations

- This is a frontend layout integration. It does not create entities, helpers, automations, or dashboards.
- It only targets built-in Home Assistant device overview pages under `/config/devices/device/...`.
- Home Assistant frontend internals can change between releases, so layout detection may need updates after major frontend changes.
- HACS, reverse proxies, Cloudflare, browsers, and companion apps may cache old frontend modules until a hard refresh or app restart.

## Troubleshooting

- Layout unchanged: confirm the integration is installed and added under Settings > Devices & services.
- Old layout still visible: hard refresh the browser or restart the Home Assistant companion app.
- Still seeing an old version: check that the loaded module URL contains the current `?v=` version.
- Columns look wrong after resizing: wait a second or refresh; the module reapplies after route changes and resize events.
- A column disappears or clips: update to the latest release and hard refresh the browser.

## HACS Metadata

Device Overview Responsive is a HACS custom integration for Home Assistant.
It registers a global frontend module with `frontend.add_extra_js_url()`.

Useful discovery terms include: `home-assistant`, `hacs`, `custom-integration`,
`frontend`, `device-overview`, `responsive-layout`, `settings`, `device-page`,
`esphome`, `zigbee`, `zwave`, and `wide-screen`.
