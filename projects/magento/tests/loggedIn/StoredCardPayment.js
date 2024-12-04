import { expect, test } from "@playwright/test";
import PaymentResources from "../../../data/PaymentResources.js";
import { PaymentDetailsPage } from "../../pageObjects/plugin/PaymentDetails.page.js";
import {
  goToShippingWithFullCart,
  proceedToPaymentAs,
  verifySuccessfulPayment,
  loginAs,
  placeOrder,
} from "../../helpers/ScenarioHelper.js";
import { CreditCardComponentsMagento } from "../../pageObjects/checkout/CreditCardComponentsMagento.js";
import { ThreeDS2PaymentPage } from "../../../common/redirect/ThreeDS2PaymentPage.js";

const paymentResources = new PaymentResources();
const magentoSampleUser = paymentResources.sampleRegisteredUser;
const users = paymentResources.guestUser;
const ibanDetails = paymentResources.sepaDirectDebit.nl;

/* No parallelism due to usage of same user account
since it will cause the cart to reset */
test.describe.serial("Payment via stored credit card", () => {
  
  test.beforeEach(async ({ page }) => {
    await loginAs(page, magentoSampleUser);
  });

  test("should succeed with 3Ds2", async ({ page }) => {
    await goToShippingWithFullCart(page);
    await proceedToPaymentAs(page, undefined, false);

    await makeCreditCardPayment(
      page,
      users.regular,
      paymentResources.masterCard3DS2,
      paymentResources.expDate,
      paymentResources.cvc,
      true
    );
    await new ThreeDS2PaymentPage(page).validate3DS2(
      paymentResources.threeDSCorrectPassword
    );
    await verifySuccessfulPayment(page);

    await goToShippingWithFullCart(page);
    await proceedToPaymentAs(page, undefined, false);

    await makeCCVaultPayment(page, paymentResources.masterCard3DS2, paymentResources.cvc);
    await new ThreeDS2PaymentPage(page).validate3DS2(
      paymentResources.threeDSCorrectPassword
    );
    await verifySuccessfulPayment(page);  
  });

  test("should succeed with removing the tokenized 3Ds2 card", async ({ page }) => {
    await page.goto("/vault/cards/listaction/");
    await page.waitForLoadState();

    await page.getByRole('button', { name: 'Delete' }).click();
    await page.locator(".my-credit-cards-popup .modal-inner-wrap").waitFor({ state: "visible", timeout: 10000 });
    await page.locator(".my-credit-cards-popup .modal-inner-wrap").getByRole('button', { name: 'Delete' }).click();

    await page.waitForLoadState();
    await expect(page.getByText('You have no stored payment methods.')).toBeVisible();
    await expect(page.getByText('Stored Payment Method was successfully removed')).toBeVisible();
  });

  test("should succeed with no 3Ds", async ({ page }) => {
    await goToShippingWithFullCart(page);
    await proceedToPaymentAs(page, undefined, false);

    await makeCreditCardPayment(
      page,
      users.regular,
      paymentResources.masterCardWithout3D,
      paymentResources.expDate,
      paymentResources.cvc,
      true
    );
    await verifySuccessfulPayment(page);

    await goToShippingWithFullCart(page);
    await proceedToPaymentAs(page, undefined, false);

    await makeCCVaultPayment(page, paymentResources.masterCardWithout3D, paymentResources.cvc);
    await verifySuccessfulPayment(page);
  });
  
});

test.describe.serial('Payment via stored SEPA token', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, magentoSampleUser);
  });

  test('should succeed', async ({ page }) => {
    await goToShippingWithFullCart(page);
    await proceedToPaymentAs(page, undefined, false);
    await makeSepaDirectDebitPayment(page, ibanDetails);

    await goToShippingWithFullCart(page);
    await proceedToPaymentAs(page, undefined, false);
    await makeSepaDirectDebitVaultPayment(page);
  });
});

async function makeCreditCardPayment(
  page,
  user,
  creditCardNumber,
  expDate,
  cvc,
  saveCard = false
) {
  const paymentDetailPage = new PaymentDetailsPage(page);
  const creditCardSection = await paymentDetailPage.selectCreditCard();

  await creditCardSection.fillCreditCardInfo(
    user.firstName,
    user.lastName,
    creditCardNumber,
    expDate,
    cvc
  );

  if (saveCard == true){
    await paymentDetailPage.savePaymentMethod();
  }

  await placeOrder(page);
}

async function makeCCVaultPayment(page, creditCardNumber, cvc) {
  await new PaymentDetailsPage(page).selectVaultCC(creditCardNumber.slice(-4));
  await new CreditCardComponentsMagento(page.locator(".payment-method._active")).fillCVC(cvc);

  await placeOrder(page);
}

async function makeSepaDirectDebitPayment(page, ibanDetails) {
  const paymentDetailsPage = new PaymentDetailsPage(page);
  const sepaPaymentSection = await paymentDetailsPage.selectSepaDirectDebit();
  await sepaPaymentSection.fillSepaDirectDebitInfo(
      ibanDetails.accountName,
      ibanDetails.iban
  );
  await placeOrder(page);

  await verifySuccessfulPayment(page);
}

async function makeSepaDirectDebitVaultPayment(page) {
  await new PaymentDetailsPage(page).selectVaultSepaDirectDebit();

  await placeOrder(page);

  await verifySuccessfulPayment(page);
}
