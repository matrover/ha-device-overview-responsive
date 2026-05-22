"""Device Overview Responsive integration."""

from __future__ import annotations

from pathlib import Path

from homeassistant.components.frontend import add_extra_js_url, remove_extra_js_url
from homeassistant.components.http import HomeAssistantView, StaticPathConfig
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant

from .const import CONF_MAX_WIDTH, CONFIG_URL, DOMAIN, MODULE_FILENAME, MODULE_URL, URL_BASE


def _max_width(entry: ConfigEntry) -> int:
    """Return the configured maximum width."""
    max_width = int(entry.options.get(CONF_MAX_WIDTH) or 0)
    return max(0, max_width)


async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
) -> bool:
    """Set up Device Overview Responsive from a config entry."""
    entry.async_on_unload(entry.add_update_listener(_async_options_updated))
    await _async_register_frontend(hass, entry)
    return True


async def async_unload_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
) -> bool:
    """Unload Device Overview Responsive."""
    data = hass.data.setdefault(DOMAIN, {})
    remove_extra_js_url(hass, data.get("module_url", MODULE_URL))
    return True


async def _async_options_updated(hass: HomeAssistant, entry: ConfigEntry) -> None:
    """Update runtime options when options change."""
    hass.data.setdefault(DOMAIN, {})[CONF_MAX_WIDTH] = _max_width(entry)


async def _async_register_frontend(hass: HomeAssistant, entry: ConfigEntry) -> None:
    """Register the frontend module globally."""
    data = hass.data.setdefault(DOMAIN, {})
    frontend_path = Path(__file__).parent / "frontend"
    data[CONF_MAX_WIDTH] = _max_width(entry)

    if not data.get("static_path_registered"):
        await hass.http.async_register_static_paths(
            [StaticPathConfig(URL_BASE, str(frontend_path), True)]
        )
        data["static_path_registered"] = True

    if not data.get("config_view_registered"):
        hass.http.register_view(DeviceOverviewResponsiveConfigView)
        data["config_view_registered"] = True

    add_extra_js_url(hass, MODULE_URL)
    data["module_url"] = MODULE_URL
    data["module_filename"] = MODULE_FILENAME


class DeviceOverviewResponsiveConfigView(HomeAssistantView):
    """Expose frontend runtime configuration."""

    url = CONFIG_URL
    name = "api:device_overview_responsive:config"
    requires_auth = False

    async def get(self, request):
        """Return runtime configuration for the frontend module."""
        hass: HomeAssistant = request.app["hass"]
        data = hass.data.setdefault(DOMAIN, {})
        return self.json({CONF_MAX_WIDTH: int(data.get(CONF_MAX_WIDTH) or 0)})
