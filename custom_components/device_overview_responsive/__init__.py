"""Device Overview Responsive integration."""

from __future__ import annotations

from pathlib import Path

from homeassistant.components.frontend import add_extra_js_url, remove_extra_js_url
from homeassistant.components.http import StaticPathConfig
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant

from .const import CONF_MAX_WIDTH, DOMAIN, MODULE_FILENAME, MODULE_URL, URL_BASE


def _module_url(entry: ConfigEntry) -> str:
    """Build the frontend module URL for an entry."""
    max_width = int(entry.options.get(CONF_MAX_WIDTH) or 0)
    if max_width > 0:
        return f"{MODULE_URL}&max_width={max_width}"
    return MODULE_URL


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
    remove_extra_js_url(hass, data.get("module_url", _module_url(entry)))
    return True


async def _async_options_updated(hass: HomeAssistant, entry: ConfigEntry) -> None:
    """Reload the entry when options change."""
    await hass.config_entries.async_reload(entry.entry_id)


async def _async_register_frontend(hass: HomeAssistant, entry: ConfigEntry) -> None:
    """Register the frontend module globally."""
    data = hass.data.setdefault(DOMAIN, {})
    frontend_path = Path(__file__).parent / "frontend"

    if not data.get("static_path_registered"):
        await hass.http.async_register_static_paths(
            [StaticPathConfig(URL_BASE, str(frontend_path), True)]
        )
        data["static_path_registered"] = True

    module_url = _module_url(entry)
    add_extra_js_url(hass, module_url)
    data["module_url"] = module_url
    data["module_filename"] = MODULE_FILENAME
