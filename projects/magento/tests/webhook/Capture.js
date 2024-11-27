import { expect, test } from "@playwright/test";
import PaymentResources from "../../../data/PaymentResources.js";
import { AdminOrderCreationPage } from "../../pageObjects/plugin/AdminOrderCreation.page.js";
import SharedState from "./SharedState.js";
import { loginAsAdmin } from "../../helpers/ScenarioHelper.js";

const paymentResources = new PaymentResources();
const webhookCredentials = paymentResources.webhookCredentials;
const randomPspNumber = Math.random().toString().slice(2, 7);
const username = webhookCredentials.webhookUsername;
const password = webhookCredentials.webhookPassword;

const base64Credentials = Buffer.from(`${username}:${password}`).toString("base64");
const headers = {
  Authorization: `Basic ${base64Credentials}`,
};

let adminOrderCreationPage;

async function processCaptureWebhook(request, captureData) {
  const processWebhookResponse = await request.post("/adyen/webhook", {
    headers,
    data: {
      live: "false",
      notificationItems: [
        {
          NotificationRequestItem: captureData,
        },
      ],
    },
  });

  expect(processWebhookResponse.status()).toBe(200);

  const processedNotificationResponse = await request.get(
    `/adyentest/test?orderId=${SharedState.orderNumber}&eventCode=CAPTURE`
  );
  expect(processedNotificationResponse.status()).toBe(200);

  const processedNotificationBody = await processedNotificationResponse.json();
  expect(processedNotificationBody[0].status).toBe("adyen_authorized");
}

test.describe("Process CAPTURE webhook notifications - Full and Partial Capture", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page, paymentResources.magentoAdminUser);
    adminOrderCreationPage = new AdminOrderCreationPage(page);
    await adminOrderCreationPage.closePopup();
  });

  test("should process full CAPTURE webhooks", async ({ request, page }) => {
    await adminOrderCreationPage.createCapture(page, SharedState.orderNumber);

    const captureData = {
      amount: {
        currency: "EUR",
        value: 3900,
      },
      eventCode: "CAPTURE",
      eventDate: "2023-09-18T15:51:21+02:00",
      merchantAccountCode: `${paymentResources.apiCredentials.merchantAccount}`,
      merchantReference: `${SharedState.orderNumber}`,
      originalReference: "DGSVMDS3N3RZNN82",
      paymentMethod: "visa",
      pspReference: `LVL9PX2ZPQR${randomPspNumber}`,
      reason: "",
      success: "true",
    };

    await processCaptureWebhook(request, captureData);
  });

  test("should process partial CAPTURE webhooks", async ({ request, page }) => {
    await adminOrderCreationPage.goToOrdersPage();
    await adminOrderCreationPage.selectOrderToModify(SharedState.orderNumber);
    await adminOrderCreationPage.createCapture(page, SharedState.orderNumber);

    const captureData = {
      amount: {
        currency: "USD",
        value: 4500,
      },
      eventCode: "CAPTURE",
      eventDate: "2023-09-18T15:51:21+02:00",
      merchantAccountCode: `${paymentResources.apiCredentials.merchantAccount}`,
      merchantReference: `${SharedState.orderNumber}`,
      originalReference: "DGSVMDS3N3RZNN82",
      paymentMethod: "mastercard",
      pspReference: `LVL9PX2ZPQR${randomPspNumber}`,
      reason: "",
      success: "true",
    };

    await processCaptureWebhook(request, captureData);
  });
});
