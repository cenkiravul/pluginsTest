import { chromium, expect, test } from "@playwright/test";
import PaymentResources from "../../../data/PaymentResources.js";
import { loginAsAdmin } from "../../helpers/ScenarioHelper.js";
import { CreditCardComponentsMagento } from "../../pageObjects/checkout/CreditCardComponentsMagento.js";
import { AdminOrderCreationPage } from "../../pageObjects/plugin/AdminOrderCreation.page.js";

const paymentResources = new PaymentResources();
const magentoAdminUser = paymentResources.magentoAdminUser;
let paymentLink;
let adminPage;

test.describe("Payment via PayByLink", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page, magentoAdminUser);
    adminPage = new AdminOrderCreationPage(page);

    await adminPage.closePopup();
    paymentLink = await adminPage.createOrderPayBylink(page);
  });

  test("should succeed", async ({ page }) => {
    // Launching a new browser with different context
    const browser = await chromium.launch();
    const context = await browser.newContext();
    const userSession = await context.newPage();

    await userSession.goto(paymentLink);

    /* Passing the outer page object to the constructor instead of
    the object "page" since we need an additional wrapper locator
    to be able to find the elements on checkout page. */
    const creditCardSection = new CreditCardComponentsMagento(
      userSession.locator(".adyen-checkout__payment-method--selected")
    );
    await userSession.click("button:has-text('Cards')");
    await userSession.waitForLoadState();
    await creditCardSection.fillCardNumber(
      paymentResources.masterCardWithout3D
    );
    await creditCardSection.fillExpDate(paymentResources.expDate);
    await creditCardSection.fillCVC(paymentResources.cvc);

    await userSession.click(
      ".adyen-checkout__payment-method--selected .adyen-checkout__button--pay"
    );

    const successMessage = await userSession
      .locator(".pay-by-link__payment-result")
      .textContent();
    expect(successMessage).toContain("Payment successful!");
    // Expect the payment to be successful
  });
});
