import { test, expect } from "@playwright/test";
import PaymentResources from "../../../data/PaymentResources.js";
import { loginAsAdmin } from "../../helpers/ScenarioHelper.js";
import { AdminAdyenConfigPage } from "../../pageObjects/plugin/AdminAdyenConfig.page.js";
import { AdminOrderCreationPage } from "../../pageObjects/plugin/AdminOrderCreation.page.js";


const paymentResources = new PaymentResources();
const magentoAdminUser = paymentResources.magentoAdminUser;
const apiCredentials = paymentResources.apiCredentials;

const cardNumber = paymentResources.visa3DS1;
const cardExpirationDate = paymentResources.expDate;
const wrongExpirationDate = paymentResources.wrongExpDate;

let adyenConfigPage;
let adminOrderCreationPage;


test.describe.serial("MOTO Orders", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page, magentoAdminUser);

    adyenConfigPage = new AdminAdyenConfigPage(page);
    await adyenConfigPage.closePopup();
  });

  test("should successfully be created and paid with a valid CC", async ({ page }) => {
    await adyenConfigPage.goToAdyenPluginConfigurationPage(page);

    adyenConfigPage = new AdminAdyenConfigPage(page);
    await adyenConfigPage.enableMOTO(page, apiCredentials.merchantAccount, apiCredentials.clientKey, apiCredentials.apiKey);

    adminOrderCreationPage = new AdminOrderCreationPage(page);
    await adminOrderCreationPage.createOrderMoto(page, cardNumber, cardExpirationDate);

    expect(await adminOrderCreationPage.successMessage.innerText()).toContain("You created the order.");
  });

  test("should fail without a valid CC", async ({ page }) => {
    adminOrderCreationPage = new AdminOrderCreationPage(page);
    await adminOrderCreationPage.createOrderMoto(page, cardNumber, wrongExpirationDate);

    expect(await adminOrderCreationPage.orderErrorMessage.innerText()).toContain("The payment is REFUSED.");
  });
});
