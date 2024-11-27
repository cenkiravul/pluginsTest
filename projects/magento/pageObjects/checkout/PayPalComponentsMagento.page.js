import { PayPalComponents } from "../../../common/checkoutComponents/PayPalComponents.js";
import { PayPalPaymentPage } from "../../../common/redirect/PayPalPaymentPage.js";
import { PaymentDetailsPage } from "../plugin/PaymentDetails.page.js";

export class PayPalComponentsMagentoPage extends PayPalComponents {
    constructor(page) {
        super(page);
        this.page = page;
    }

    async payViaPayPal(username, password) {
        const popup = await this.initiatePayPalPopup()
        await new PayPalPaymentPage(popup).makePayPalPayment(username, password);
    }

    async cancelPayPal() {
        const popup = await this.initiatePayPalPopup();
        await new PayPalPaymentPage(popup).cancelAndGoToStore();
    }

    async initiatePayPalPopup() {
        const paymentDetailPage = new PaymentDetailsPage(this.page);
        const payPalSection = await paymentDetailPage.selectPayPal();

        await this.page.waitForLoadState("load", { timeout: 15000 });

        const [popup] = await Promise.all([
            this.page.waitForEvent("popup"),
            payPalSection.proceedToPayPal(),
        ]);

        return popup;
    }
}
