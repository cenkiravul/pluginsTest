import { test } from "@playwright/test";
import PaymentResources from "../../data/PaymentResources.js";
import {
  goToShippingWithFullCart,
  verifySuccessfulPayment,
} from "../helpers/ScenarioHelper.js";
import { proceedToPaymentAs } from "../helpers/ScenarioHelper.js";
import { PaymentDetailsPage } from "../pageObjects/plugin/PaymentDetails.page.js";
import { PayPalComponentsMagentoPage } from "../pageObjects/checkout/PayPalComponentsMagento.page.js";

const paymentResources = new PaymentResources();
const users = paymentResources.guestUser;

test.describe("Payment via PayPal", () => {
  test.beforeEach(async ({ page }) => {
    await goToShippingWithFullCart(page);
    await proceedToPaymentAs(page, users.dutch);
  });

  test("should succeed", async ({ page }) => {
    await new PayPalComponentsMagentoPage(page).payViaPayPal(
      paymentResources.payPalUserName,
      paymentResources.payPalPassword
    );

    await verifySuccessfulPayment(page);
  });

  test("should fail if shopper cancels", async ({ page }) => {
    await new PayPalComponentsMagentoPage(page).cancelPayPal(page);

    const paymentDetailPage = new PaymentDetailsPage(page);
    await paymentDetailPage.verifyPaymentRefusal();
  });
});
