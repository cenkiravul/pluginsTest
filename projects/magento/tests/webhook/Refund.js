import {expect, test} from "@playwright/test";
import PaymentResources from "../../../data/PaymentResources.js";
import {AdminOrderCreationPage} from "../../pageObjects/plugin/AdminOrderCreation.page.js";
import SharedState from "./SharedState.js";
import {loginAsAdmin} from "../../helpers/ScenarioHelper.js";

const paymentResources = new PaymentResources();
const webhookCredentials = paymentResources.webhookCredentials;
const magentoAdminUser = paymentResources.magentoAdminUser;
const randomPspNumber = Math.random().toString().slice(2,7);
const username = webhookCredentials.webhookUsername;
const password = webhookCredentials.webhookPassword;

const base64Credentials = Buffer.from(`${username}:${password}`).toString('base64');
const headers = {
    Authorization: `Basic ${base64Credentials}`
};

let adminOrderCreationPage;
let invoices;

async function refundAndProcessWebhook(page, request, refundOrder) {
    let invoiceToRefund = invoices[refundOrder];
    adminOrderCreationPage = new AdminOrderCreationPage(page);

    await adminOrderCreationPage.createRefund(page, SharedState.orderNumber, invoiceToRefund.invoiceId);

    // Wait until the invoice is created
    await new Promise(resolve => setTimeout(resolve, 1000));

    const processWebhookResponse = await request.post("/adyen/webhook", {
        headers,
        data: {
            "live": "false",
            "notificationItems": [
                {
                    "NotificationRequestItem": {
                        "amount": {
                            "currency": "EUR",
                            "value": parseInt(invoiceToRefund.amount)
                        },
                        "eventCode": "REFUND",
                        "eventDate": "2023-09-15T15:52:17+02:00",
                        "merchantAccountCode": `${paymentResources.apiCredentials.merchantAccount}`,
                        "merchantReference": `${SharedState.orderNumber}`,
                        "originalReference": "DGSVMDS3N3RZNN82",
                        "paymentMethod": "visa",
                        "pspReference": `LVL9PX2ZPQR${randomPspNumber}`,
                        "reason": "",
                        "success": "true"
                    }
                }
            ]
        }
    });

    expect(processWebhookResponse.status()).toBe(200);

    const processedNotificationResponse = await request.get(`/adyentest/test?orderId=${SharedState.orderNumber}&eventCode=REFUND&processOrder=${refundOrder}`);
    expect(processedNotificationResponse.status()).toBe(200);

    return await processedNotificationResponse.json();
}

test.describe("Process REFUND webhook notifications", () => {
    test.beforeEach(async ({ page }) => {
        await loginAsAdmin(page, magentoAdminUser)
        adminOrderCreationPage = new AdminOrderCreationPage(page);
        await adminOrderCreationPage.closePopup();

        await adminOrderCreationPage.goToOrderDetailPage(page, SharedState.orderNumber);
        invoices = await adminOrderCreationPage.getInvoices(page);
    });

    test("should be able to process first partial REFUND webhook", async ({ request, page }) => {
        let invoiceToRefund = invoices[0];
        let processedNotificationBody = await refundAndProcessWebhook(page, request, 0);

        expect((parseFloat(invoiceToRefund.amount) / 100)).toEqual(parseFloat(processedNotificationBody[0].total_refunded));
        expect(processedNotificationBody[0].status).toBe("processing");
    });

    test("should be able to process second partial REFUND webhook", async ({ request, page }) => {
        let processedNotificationBody = await refundAndProcessWebhook(page, request, 1);

        expect(parseFloat(processedNotificationBody[0].total_refunded)).toEqual(parseFloat(processedNotificationBody[0].grand_total));
        expect(processedNotificationBody[0].status).toBe("closed");
    });
});
