import { test } from "@playwright/test";
import PaymentResources from "../../data/PaymentResources.js";
import {
  goToShippingWithFullCart,
  verifySuccessfulPayment,
} from "../helpers/ScenarioHelper.js";
import { proceedToPaymentAs } from "../helpers/ScenarioHelper.js";
import { PaymentDetailsPage } from "../pageObjects/plugin/PaymentDetails.page.js";
import { AmazonPayPaymentPage } from "../../common/redirect/AmazonPaymentPage.js";

const paymentResources = new PaymentResources();
const users = paymentResources.guestUser;
const amazonCredentials = paymentResources.amazonCredentials;

test.describe("Payment via AmazonPay", () => {
  test.beforeEach(async ({ page }) => {
    await goToShippingWithFullCart(page);
  });

  test("should succeed", async ({ page }) => {
    await proceedToPaymentAs(page, users.dutch);

    await payViaAmazon(
      page,
      amazonCredentials.username,
      amazonCredentials.password
    );

    await verifySuccessfulPayment(page);
  });

  async function payViaAmazon(page, username, password) {
    const paymentDetailPage = new PaymentDetailsPage(page);
    const amazonPaySection = await paymentDetailPage.selectAmazonPay();

    await amazonPaySection.clickAmazonPayButton();
    await page.waitForLoadState("load", { timeout: 15000 });
    
    await new AmazonPayPaymentPage(page).proceedWithAmazonPay(username, password);
  }
});
