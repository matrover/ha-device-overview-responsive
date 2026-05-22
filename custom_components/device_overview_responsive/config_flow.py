"""Config flow for Device Overview Responsive."""

from __future__ import annotations

from homeassistant import config_entries
from homeassistant.core import callback
import voluptuous as vol

from .const import CONF_MAX_WIDTH, DOMAIN, NAME


class DeviceOverviewResponsiveConfigFlow(config_entries.ConfigFlow, domain=DOMAIN):
    """Handle a config flow for Device Overview Responsive."""

    VERSION = 1

    @staticmethod
    @callback
    def async_get_options_flow(
        config_entry: config_entries.ConfigEntry,
    ) -> config_entries.OptionsFlow:
        """Create the options flow."""
        return DeviceOverviewResponsiveOptionsFlow(config_entry)

    async def async_step_user(self, user_input=None):
        """Handle the initial step."""
        if self._async_current_entries():
            return self.async_abort(reason="already_configured")

        return self.async_create_entry(title=NAME, data={})


class DeviceOverviewResponsiveOptionsFlow(config_entries.OptionsFlow):
    """Handle options for Device Overview Responsive."""

    def __init__(self, config_entry: config_entries.ConfigEntry) -> None:
        """Initialize options flow."""
        self._config_entry = config_entry

    async def async_step_init(self, user_input=None):
        """Manage the integration options."""
        if user_input is not None:
            max_width = int(user_input.get(CONF_MAX_WIDTH) or 0)
            options = {}
            if max_width > 0:
                options[CONF_MAX_WIDTH] = max_width
            return self.async_create_entry(title="", data=options)

        return self.async_show_form(
            step_id="init",
            data_schema=vol.Schema(
                {
                    vol.Optional(
                        CONF_MAX_WIDTH,
                        default=self._config_entry.options.get(CONF_MAX_WIDTH, 0),
                    ): vol.All(vol.Coerce(int), vol.Range(min=0, max=10000)),
                }
            ),
        )
