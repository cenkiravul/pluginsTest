import { test } from "@playwright/test";
import PaymentResources from "../../../data/PaymentResources.js";
import {
    goToShippingWithFullCart,
    loginAs
} from "../../helpers/ScenarioHelper.js";
import {
    completeFinalAction,
    fillCreditCardForm, fillIdeal2Form, fillIdealForm,
    proceedToMultishippingAs,
    proceedToOrderReviewPageAndPlaceOrder,
    verifyPayment,
    verifyRefusedPayment,
    verifyRefusedPaymentWithAction
} from "../../helpers/MultishippingHelper.js";

const paymentResources = new PaymentResources();
const magentoSampleUser = paymentResources.sampleRegisteredUser;
const users = paymentResources.guestUser;

test.describe("Payment with multiple shipping address", () => {
    test.beforeEach(async ({page}) => {
        await loginAs(page, magentoSampleUser);
        await goToShippingWithFullCart(page, 1);
        await proceedToMultishippingAs(page, users.dutch);
    });

    test("should succeed without 3Ds2", async ({ page }) => {
        await fillCreditCardForm(
            page,
            users.dutch,
            paymentResources.masterCardWithout3D,
            paymentResources.expDate,
            paymentResources.cvc
        );

        await proceedToOrderReviewPageAndPlaceOrder(page);

        await verifyPayment(page);
    });

    test("should fail with wrong expiry date", async ({ page }) => {
        await fillCreditCardForm(
            page,
            users.dutch,
            paymentResources.masterCardWithout3D,
            paymentResources.wrongExpDate,
            paymentResources.cvc
        );

        await proceedToOrderReviewPageAndPlaceOrder(page);

        await verifyRefusedPayment(page);
    });

    test("should succeed with 3Ds2", async ({ page }) => {
        await fillCreditCardForm(
            page,
            users.dutch,
            paymentResources.masterCard3DS2,
            paymentResources.expDate,
            paymentResources.cvc
        );

        await proceedToOrderReviewPageAndPlaceOrder(page);
        await completeFinalAction(page, "3ds")

        await verifyPayment(page);
    });

    test("should fail with wrong 3Ds2 credentials", async ({ page }) => {
        await fillCreditCardForm(
            page,
            users.dutch,
            paymentResources.masterCard3DS2,
            paymentResources.expDate,
            paymentResources.cvc
        );

        await proceedToOrderReviewPageAndPlaceOrder(page);
        await completeFinalAction(page, "3ds", true)

        await verifyRefusedPaymentWithAction(page);
    });

    test("should succeed with iDeal", async ({ page }) => {
        await fillIdeal2Form(page);

        await proceedToOrderReviewPageAndPlaceOrder(page);
        await completeFinalAction(page, "ideal", false, paymentResources.ideal2.issuer);

        await verifyPayment(page);
    });

    test("should fail with iDeal failing issuer", async ({ page }) => {
        await fillIdeal2Form(page);

        await proceedToOrderReviewPageAndPlaceOrder(page);
        await completeFinalAction(page, "ideal", true, paymentResources.ideal2.issuer);

        await verifyRefusedPaymentWithAction(page);
    });
});
