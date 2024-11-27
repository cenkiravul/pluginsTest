import { test } from "@playwright/test";
import PaymentResources from "../../data/PaymentResources.js";
import {
  goToShippingWithFullCart,
  verifySuccessfulPayment,
} from "../helpers/ScenarioHelper.js";
import { proceedToPaymentAs } from "../helpers/ScenarioHelper.js";
import { PaymentDetailsPage } from "../pageObjects/plugin/PaymentDetails.page.js";
import { PayPalPaymentPage } from "../../common/redirect/PayPalPaymentPage.js";

const paymentResources = new PaymentResources();
const users = paymentResources.guestUser;

test.describe("Payment via PayPal", () => {
  test.beforeEach(async ({ page }) => {
    await goToShippingWithFullCart(page);
  });

  test("should succeed", async ({ page }) => {
    await proceedToPaymentAs(page, users.dutch);

    await payViaPayPal(
      page,
      paymentResources.payPalUserName,
      paymentResources.payPalPassword
    );

    await verifySuccessfulPayment(page);
  });

  async function payViaPayPal(page, username, password) {
    const paymentDetailPage = new PaymentDetailsPage(page);
    const payPalSection = await paymentDetailPage.selectPayPal();

    await page.waitForLoadState("load", { timeout: 15000 });

    const [popup] = await Promise.all([
      page.waitForEvent("popup"),
      payPalSection.proceedToPayPal(),
    ]);

    await new PayPalPaymentPage(popup).makePayPalPayment(username, password);
  }
});
