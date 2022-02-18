import { test, expect } from "@playwright/test";
import PaymentResources from "../../data/PaymentResources.js";
import { goToShippingWithFullCart } from "../helpers/ScenarioHelper.js";
import { proceedToPaymentAs } from "../helpers/ScenarioHelper.js";
import { PaymentDetailsPage } from "../pageObjects/checkout/PaymentDetails.page.js";
import { SuccessfulCheckoutPage } from "../pageObjects/checkout/SuccessfulCheckout.page.js";
import { PayPalPaymentPage } from "../../common/PayPalPaymentPage.js";

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

    await verifySuccessfulCheckout(page);
  });

  async function payViaPayPal(page, username, password) {
    const paymentDetailPage = new PaymentDetailsPage(page);
    const payPalSection = await paymentDetailPage.selectPayPal();

    const [popup] = await Promise.all([
      page.waitForEvent("popup"),
      payPalSection.proceedToPayPal(),
    ]);

    await new PayPalPaymentPage(popup).makePayPalPayment(username, password);
  }

  async function verifySuccessfulCheckout(page) {
    const successfulCheckoutPage = new SuccessfulCheckoutPage(page);
    await successfulCheckoutPage.waitForRedirection();
    await expect(await successfulCheckoutPage.pageTitle.innerText()).toEqual(
      "Thank you for your purchase!"
    );
  }
});
