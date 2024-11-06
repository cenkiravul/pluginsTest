import { test } from "@playwright/test";
import PaymentResources from "../../data/PaymentResources.js";
import { PaymentDetailsPage } from "../../magento/pageObjects/plugin/PaymentDetails.page.js";
import {
  goToShippingWithFullCart,
  proceedToPaymentAs,
  placeOrder
} from "../helpers/ScenarioHelper.js";
import { QRPage } from "../../common/redirect/QRPage.js";

const paymentResources = new PaymentResources();
const user = paymentResources.guestUser.belgian;

test.describe.skip("Payment via Bancontact Mobile", () => {
  test.beforeEach(async ({ page }) => {
    await goToShippingWithFullCart(page);
    await proceedToPaymentAs(page, user);
    await page.waitForLoadState()
    await new PaymentDetailsPage(page).selectBancontactMobile();
    await page.waitForLoadState()
    await placeOrder(page);
  });

  test("should succeed with showing the QR code", async ({ page }) => {

    await new QRPage(page).verifySuccessfulQRCode();
  });
});
