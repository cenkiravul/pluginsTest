import { test } from "@playwright/test";
import PaymentResources from "../../data/PaymentResources.js";
import {
  goToShippingWithFullCart,
  verifySuccessfulPayment,
} from "../helpers/ScenarioHelper.js";
import { proceedToPaymentAs } from "../helpers/ScenarioHelper.js";
import { PaymentDetailsPage } from "../pageObjects/plugin/PaymentDetails.page.js";
import { AmazonPayPaymentPage } from "../../common/redirect/AmazonPaymentPage.js";
import { ThreeDS2PaymentPage } from "../../common/redirect/ThreeDS2PaymentPage.js";

const paymentResources = new PaymentResources();
const users = paymentResources.guestUser;
const amazonCredentials = paymentResources.amazonCredentials;

async function amazonPayTestPreparation(page) {
  await goToShippingWithFullCart(page);
  await proceedToPaymentAs(page, users.dutch);

  const paymentDetailPage = new PaymentDetailsPage(page);
  const amazonPaySection = await paymentDetailPage.selectAmazonPay();

  await amazonPaySection.clickAmazonPayButton();
  await page.waitForLoadState();

  await new AmazonPayPaymentPage(page).doLogin(amazonCredentials);
}

test.describe("Payment via AmazonPay", () => {
  test.skip(!!process.env.CI, 'Skipped in CI due to human verification requirements.');

  test.beforeEach(async ({ page }) => {
    await amazonPayTestPreparation(page);
  });

  test("should succeed with default card payment @wallet", async ({ page }) => {
    await new AmazonPayPaymentPage(page).completePayment();

    await verifySuccessfulPayment(page);
  });

  test("should succeed with 3DS2 card payment @wallet", async ({ page }) => {
    await new AmazonPayPaymentPage(page).selectPaymentMethod('3ds2');
    await new AmazonPayPaymentPage(page).completePayment();

    await page.waitForLoadState();

    await new ThreeDS2PaymentPage(page).validate3DS2(
        paymentResources.threeDSCorrectPassword
    );

    await verifySuccessfulPayment(page);
  });

  test("should allow selecting payment method after refusal @wallet", async ({ page }) => {
    await new AmazonPayPaymentPage(page).selectPaymentMethod('declined');
    await new AmazonPayPaymentPage(page).completePayment();
    await page.waitForLoadState();

    // Click Amazon Pay button again in the checkout
    const paymentDetailPage = new PaymentDetailsPage(page);
    const amazonPaySection = await paymentDetailPage.selectAmazonPay();
    await amazonPaySection.clickAmazonPayButton();
    await page.waitForLoadState();

    await new AmazonPayPaymentPage(page).completePayment();

    await verifySuccessfulPayment(page);
  });

  test("should redirect to cart page after cancellation @wallet", async ({ page }) => {
    await new AmazonPayPaymentPage(page).cancelTransaction();
    await page.waitForURL("**/checkout/cart?**");
  });
});

test.describe("Smoke test: Amazon Pay component", () => {
  /*
   * This is the smoke asserting Amazon Pay component is mounted and
   * the shopper is redirected to Amazon Pay hosted payment page.
   *
   * Other test cases are skipped on GitHub Actions due to human verification requirements.
   */
  test("should be mounted and redirect the shopper", async ({ page }) => {
    await amazonPayTestPreparation(page);

    await new AmazonPayPaymentPage(page).isCaptchaMounted()
  });
})
