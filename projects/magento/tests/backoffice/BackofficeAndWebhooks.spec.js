/* Since we use multiple workers for E2E tests and
Magento doesn't allow multiple administrator sessions,
we are running them through this file to allow consequent runs */

/* Webhook Tests are also run through this file
since they also require usage of Admin Panel */

import "../webhook/Authorisation.js";
import "../webhook/Capture.js";
import "../webhook/Refund.js";

// Backoffice Tests
import "./MOTO.js";
import "./RequiredSettingsAutoConfig.js"
import "./RequiredSettingsManualConfig.js"
import "./PayByLink.js"

