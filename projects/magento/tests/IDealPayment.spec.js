import { test } from "@playwright/test";
import PaymentResources from "../../data/PaymentResources.js";
import {
  goToShippingWithFullCart, makeIDeal2Payment,
  proceedToPaymentAs,
  verifyFailedPayment,
  verifySuccessfulPayment,
} from "../helpers/ScenarioHelper.js";

const paymentResources = new PaymentResources();
const users = paymentResources.guestUser;

test.describe.parallel("Payment with iDeal", () => {
  test.beforeEach(async ({ page }) => {
    await goToShippingWithFullCart(page);
    await proceedToPaymentAs(page, users.dutch);
  });

  test("should succeed via Test Issuer", async ({ page }) => {
    await makeIDeal2Payment(page, paymentResources.ideal2.issuer, true);
    await verifySuccessfulPayment(page, true);
  });

  test("should fail via Failing Test Issuer", async ({ page }) => {
    await makeIDeal2Payment(page, paymentResources.ideal2.issuer, false);
    await verifyFailedPayment(page, true);
  });
});
