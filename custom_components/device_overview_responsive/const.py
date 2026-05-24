"""Constants for Device Overview Responsive."""

DOMAIN = "device_overview_responsive"
NAME = "Device Overview Responsive"
VERSION = "0.3.9"
CONF_MAX_WIDTH = "max_width"

URL_BASE = f"/{DOMAIN}"
MODULE_FILENAME = "device-overview-responsive.js"
MODULE_URL = f"{URL_BASE}/{MODULE_FILENAME}?v={VERSION}"
CONFIG_URL = f"{URL_BASE}/config.json"
