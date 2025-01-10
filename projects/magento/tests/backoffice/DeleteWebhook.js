import { expect, test } from "@playwright/test";
import PaymentResources from "../../../data/PaymentResources.js";

const paymentResources = new PaymentResources();

test.describe("Webhook Management", () => {
    test("delete webhook successfully", async ({ request }) => {
        // Send the GET request to delete the webhook
        const response = await request.get("/adyentest/deletewebhook");

        // Assert that the response is successful
        expect(response.status()).toBe(200);

        // Parse the JSON response
        const responseBody = await response.json();
        console.log("Response Message:", responseBody.message);

        // Validate the JSON response structure and values
        expect(responseBody.message).toContain("Webhook with ID");
    });


});
