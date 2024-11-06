import { expect } from "@playwright/test";
import { ThreeDS2PaymentPage } from "../../../common/redirect/ThreeDS2PaymentPage.js";
import PaymentResources from "../../../data/PaymentResources.js";
import { IdealIssuerPage } from "../../../common/redirect/IdealIssuerPage.js";

const paymentResources = new PaymentResources();

export class MultishippingSuccess {
    constructor(page) {
        this.page = page;
        this.paymentCompletedButton = page.locator(".adyen-payment-finished");
        this.completePaymentButton = page.locator(".adyen-payment-unfinished");
        this.errorDescription = page.locator(".error-description");
    }

    async verifyPaymentWithoutAction() {
        let paymentSuccessLabel = this.page.getByText("Payment Completed");
        expect(await paymentSuccessLabel.count()).toEqual(2);
    }

    async verifyRefusalWithAction() {
        let paymentFailedLabel = this.page.getByText("Payment Failed");
        expect(await paymentFailedLabel.count()).toEqual(2);
    }

    async verifyRefusal() {
        expect(await this.errorDescription.first().innerText()).toEqual("The payment is REFUSED.");
    }

    async complete3dsAction(simulateFailure = false) {
        let threeDSPassword;

        if (simulateFailure) {
            threeDSPassword =  paymentResources.threeDSWrongPassword;
        } else {
            threeDSPassword =  paymentResources.threeDSCorrectPassword;
        }

        await new Promise(r => setTimeout(r, 500));

        await this.completePaymentButton.first().click();
        await new ThreeDS2PaymentPage(this.page).validate3DS2(threeDSPassword);

        await this.paymentCompletedButton.first().waitFor({ state: "visible", timeout: 5000 });

        await this.page.waitForLoadState();

        await this.completePaymentButton.first().click();
        await new ThreeDS2PaymentPage(this.page).validate3DS2(threeDSPassword);

        await this.completePaymentButton.last().waitFor({ state: "hidden", timeout: 5000 });
    }

    async completeIdealAction(page, simulateFailure, issuer) {
        await new Promise(r => setTimeout(r, 500));

        let numberOfOrders = 2;

        for (let i = 0; i < numberOfOrders; i++) {
            const idealIssuerPage = new IdealIssuerPage(page, issuer);

            await this.completePaymentButton.first().click();
            await idealIssuerPage.proceedWithSelectedBank();
            if (!simulateFailure) {
                await idealIssuerPage.simulateSuccess();
            } else {
                await idealIssuerPage.simulateFailure();
            }
            await page.waitForLoadState();
            await this.page.waitForURL("**/checkout/success/**",{timeout:25000, waitUntil:"load"});
        }

        await this.completePaymentButton.last().waitFor({ state: "hidden", timeout: 5000 });
    }
}
