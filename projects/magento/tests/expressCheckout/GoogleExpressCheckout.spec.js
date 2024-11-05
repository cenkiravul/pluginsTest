import { test } from "@playwright/test";
import PaymentResources from "../../../data/PaymentResources.js";
import { goToShippingWithFullCart, verifySuccessfulPayment } from "../../helpers/ScenarioHelper.js";
import { ProductDetailsPage } from "../../pageObjects/plugin/ProductDetail.page.js";
import { GooglePayPage } from "../../../common/redirect/GooglePayPage.js";

const googleCredentials = new PaymentResources().googleCredentials;

test.describe("Payment via Express Checkout with Google Pay", () => {
  test.skip(!!process.env.CI, 'Skipped in CI due to human verification requirements.');

  test("should work as expected from mini cart", async ({ page }) => {
    await goToShippingWithFullCart(page);
    const productPage = new ProductDetailsPage(page);

    await page.waitForLoadState();

    const [popup] = await Promise.all([
      page.waitForEvent("popup"),
      await productPage.clickbuyWithGPayViaMiniCart(),
    ]);

    const activePopup = new GooglePayPage(popup);
    await activePopup.assertNavigation();
    await activePopup.fillGoogleCredentials(googleCredentials.username, googleCredentials.password);
    await activePopup.pay()
    await verifySuccessfulPayment(page, true, 20000);
  });
  
  test("should work as expected from product detail page", async ({ page }) => {
    const productPage = new ProductDetailsPage(page);
    await productPage.navigateToItemPage("joust-duffle-bag.html");

    await page.waitForLoadState();

    const [popup] = await Promise.all([
      page.waitForEvent("popup", {timeout:25000}),
      await productPage.clickBuyWithGPay()
    ]);
    
    const activePopup = new GooglePayPage(popup);
    await activePopup.assertNavigation();
    await activePopup.fillGoogleCredentials(googleCredentials.username, googleCredentials.password);
    await activePopup.pay()
    await verifySuccessfulPayment(page, true, 20000);
  });
});

test.describe("Smoke test: Google Pay component", () => {
  /*
   * This is the smoke asserting Google Pay component is mounted and payment pop-up is loaded.
   *
   * Other test cases are skipped on GitHub Actions due to human verification requirements.
   */
  test("should be mounted and pop-up needs to be loaded", async ({ page }) => {
    const productPage = new ProductDetailsPage(page);
    await productPage.navigateToItemPage("joust-duffle-bag.html");

    await page.waitForLoadState();

    const [popup] = await Promise.all([
      page.waitForEvent("popup"),
      await productPage.clickBuyWithGPay()
    ]);

    const activePopup = new GooglePayPage(popup);
    await activePopup.assertNavigation();
  });
})
