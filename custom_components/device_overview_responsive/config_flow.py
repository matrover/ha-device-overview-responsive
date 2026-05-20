"""Config flow for Device Overview Responsive."""

from __future__ import annotations

from homeassistant import config_entries

from .const import DOMAIN, NAME


class DeviceOverviewResponsiveConfigFlow(config_entries.ConfigFlow, domain=DOMAIN):
    """Handle a config flow for Device Overview Responsive."""

    VERSION = 1

    async def async_step_user(self, user_input=None):
        """Handle the initial step."""
        if self._async_current_entries():
            return self.async_abort(reason="already_configured")

        return self.async_create_entry(title=NAME, data={})
