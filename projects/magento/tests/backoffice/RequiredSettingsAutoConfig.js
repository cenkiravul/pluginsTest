import { expect, test } from "@playwright/test";
import PaymentResources from "../../../data/PaymentResources.js";
import { loginAsAdmin } from "../../helpers/ScenarioHelper.js";
import { AdminAdyenConfigPage } from "../../pageObjects/plugin/AdminAdyenConfig.page.js";


const paymentResources = new PaymentResources();
const apiCredentials = paymentResources.apiCredentials;
const webhookCredentials = paymentResources.webhookCredentials;

let adyenConfigPage;


test.describe('Configure required settings @tag-test', () => {
    test.beforeEach(async ({ page }) => {
        await loginAsAdmin(page, paymentResources.magentoAdminUser);
        adyenConfigPage = new AdminAdyenConfigPage(page);
        await adyenConfigPage.closePopup();
        await adyenConfigPage.goToAdyenPluginConfigurationPage(page);
    });

    test("auto mode should be configured successfully", async ({ page }) => {
        adyenConfigPage = new AdminAdyenConfigPage(page);
        await adyenConfigPage.autoConfigureRequiredSettings(page, apiCredentials.apiKey,
            apiCredentials.clientKey, apiCredentials.merchantAccount, webhookCredentials.webhookUsername)
        await adyenConfigPage.waitForPageLoad(page);

        await expect(adyenConfigPage.successMessage).toContainText("You saved the configuration.");
    });

    test('auto mode fails with bad api key', async ({ page }) => {
        adyenConfigPage = new AdminAdyenConfigPage(page);
        await adyenConfigPage.autoConfigureRequiredSettings(page, "xyzabc")
        await expect(await adyenConfigPage.requiredSettingsWarningMessage).toContainText('Unable to load merchant accounts');
    });
});
