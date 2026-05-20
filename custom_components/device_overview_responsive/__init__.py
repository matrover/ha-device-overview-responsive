"""Device Overview Responsive integration."""

from __future__ import annotations

from pathlib import Path

from homeassistant.components.frontend import add_extra_js_url, remove_extra_js_url
from homeassistant.components.http import StaticPathConfig
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant

from .const import DOMAIN, MODULE_FILENAME, MODULE_URL, URL_BASE


async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
) -> bool:
    """Set up Device Overview Responsive from a config entry."""
    await _async_register_frontend(hass)
    return True


async def async_unload_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
) -> bool:
    """Unload Device Overview Responsive."""
    remove_extra_js_url(hass, MODULE_URL)
    return True


async def _async_register_frontend(hass: HomeAssistant) -> None:
    """Register the frontend module globally."""
    data = hass.data.setdefault(DOMAIN, {})
    frontend_path = Path(__file__).parent / "frontend"

    if not data.get("static_path_registered"):
        await hass.http.async_register_static_paths(
            [StaticPathConfig(URL_BASE, str(frontend_path), True)]
        )
        data["static_path_registered"] = True

    add_extra_js_url(hass, MODULE_URL)
    data["module_url"] = MODULE_URL
    data["module_filename"] = MODULE_FILENAME
