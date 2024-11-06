import { MultishippingShippingDetails } from "../pageObjects/plugin/MultishippingShippingDetails.page.js";
import { MultishippingNewAddress } from "../pageObjects/plugin/MultishippingNewAddress.page.js";
import { MultishippingShippingMethods } from "../pageObjects/plugin/MultishippingShippingMethods.page.js";
import { MultishippingBillingInformation } from "../pageObjects/plugin/MultishippingBillingInformation.page.js";
import { MultishippingSuccess } from "../pageObjects/plugin/MultishippingSuccess.page.js";

export async function proceedToMultishippingAs(page, user) {
  const multishippingShippingDetailsPage = new MultishippingShippingDetails(page);
  const multishippingNewAddressPage = new MultishippingNewAddress(page, user);
  const multishippingShippingMethodsPage = new MultishippingShippingMethods(page);

  await multishippingShippingDetailsPage.goTo();
  await page.waitForLoadState();
  let addressCount = await multishippingShippingDetailsPage.getAddressCount()

  if (addressCount < 2) {
    await multishippingShippingDetailsPage.enterNewAddress();
    await multishippingNewAddressPage.fillNewAddressForm();
  }

  await multishippingShippingDetailsPage.updateItemAddress();
  await multishippingShippingDetailsPage.proceedToShippingInformation();

  await multishippingShippingMethodsPage.selectShippingMethods();
  await multishippingShippingMethodsPage.proceedToBillingInformation();
}

export async function fillCreditCardForm(page, user, creditCardNumber, expDate, cvc) {
  const multishippingBillingInformationPage = new MultishippingBillingInformation(page);
  const creditCardComponent = await multishippingBillingInformationPage.selectCreditCardPaymentMethod();

  await creditCardComponent.fillCreditCardInfo(
      user.firstName,
      user.lastName,
      creditCardNumber,
      expDate,
      cvc
  );
}

/** @deprecated on Ideal 2.0 */
export async function fillIdealForm(page, issuerName) {
  const multishippingBillingInformationPage = new MultishippingBillingInformation(page);

  await multishippingBillingInformationPage.selectIdealPaymentMethod();
  await multishippingBillingInformationPage.selectIdealIssuer(issuerName)
}

export async function fillIdeal2Form(page) {
  const multishippingBillingInformationPage = new MultishippingBillingInformation(page);

  await multishippingBillingInformationPage.selectIdealPaymentMethod();
}

export async function proceedToOrderReviewPageAndPlaceOrder(page) {
  const multishippingBillingInformationPage = new MultishippingBillingInformation(page);
  await multishippingBillingInformationPage.proceedToOrderReviewPageAndPlaceOrder();
}

export async function verifyPayment(page) {
  const multishippingSuccessPage = new MultishippingSuccess(page);
  await multishippingSuccessPage.verifyPaymentWithoutAction();
}

export async function verifyRefusedPaymentWithAction(page) {
  const multishippingSuccessPage = new MultishippingSuccess(page);
  await multishippingSuccessPage.verifyRefusalWithAction();
}

export async function verifyRefusedPayment(page) {
  const multishippingSuccessPage = new MultishippingSuccess(page);
  await multishippingSuccessPage.verifyRefusal();
}

export async function completeFinalAction(page, actionType, simulateFailure = false, issuer = null) {
  const multishippingSuccessPage = new MultishippingSuccess(page);
  await page.waitForLoadState();

  switch (actionType) {
    case "3ds":
      await multishippingSuccessPage.complete3dsAction(simulateFailure);
      break;
    case "ideal":
      await multishippingSuccessPage.completeIdealAction(page, simulateFailure, issuer)
      break;
    default:
      break;
  }
}
