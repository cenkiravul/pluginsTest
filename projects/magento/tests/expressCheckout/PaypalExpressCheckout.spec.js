import { test } from "@playwright/test";
import { ProductDetailsPage } from "../../pageObjects/plugin/ProductDetail.page.js";
import { waitForInitApiCall } from "../../helpers/ExpressHelper.js";
import { PayPalPaymentPage } from "../../../common/redirect/PayPalPaymentPage.js";
import PaymentResources from "../../../data/PaymentResources.js";
import {goToShippingWithFullCart, verifySuccessfulPayment} from "../../helpers/ScenarioHelper.js";

const paymentResources = new PaymentResources();
let paypalPopup = null;

test.describe("Payment via Express Checkout with PayPal from product detail page", () => {
    test.beforeEach(async ({ page }) => {
        const productPage = new ProductDetailsPage(page);
        await productPage.navigateToItemPage();

        // Wait for express init call to be completed
        await waitForInitApiCall(page);

        [paypalPopup] = await Promise.all([
            page.waitForEvent("popup"),
            productPage.clickBuyWithPaypal(),
        ]);

        await new PayPalPaymentPage(paypalPopup).loginToPayPalAndHandleCookies(
            paymentResources.payPalUserName,
            paymentResources.payPalPassword
        );
    });

    test("should work as expected", async ({ page }) => {
        await new PayPalPaymentPage(paypalPopup).agreeAndPay();
        await verifySuccessfulPayment(page, true, 20000);
    });

    test("should work as expected after updating the shipping address", async ({ page }) => {
        const paypalPaymentPage =  new PayPalPaymentPage(paypalPopup);

        await paypalPaymentPage.changeShippingAddress()
        await paypalPaymentPage.agreeAndPay()

        await verifySuccessfulPayment(page, true, 20000);
    });
});

// This test needs to be enabled and fixed after ECP-9551.
test.describe.skip("Payment via Express Checkout with PayPal from mini cart", () => {
    test.beforeEach(async ({ page }) => {
        await goToShippingWithFullCart(page);
        const productPage = new ProductDetailsPage(page);

        // Wait for express init call to be completed
        await waitForInitApiCall(page);

        [paypalPopup] = await Promise.all([
            page.waitForEvent("popup"),
            productPage.clickbuyWithPaypalViaMiniCart(),
        ]);

        await new PayPalPaymentPage(paypalPopup).loginToPayPalAndHandleCookies(
            paymentResources.payPalUserName,
            paymentResources.payPalPassword
        );
    });

    test("should work as expected", async ({ page }) => {
        await new PayPalPaymentPage(paypalPopup).agreeAndPay();
        await verifySuccessfulPayment(page, true, 20000);
    });

    test("should work as expected after updating the shipping address", async ({ page }) => {
        const paypalPaymentPage =  new PayPalPaymentPage(paypalPopup);

        await paypalPaymentPage.changeShippingAddress()
        await paypalPaymentPage.agreeAndPay()

        await verifySuccessfulPayment(page, true, 20000);
    });
});
