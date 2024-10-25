import { CreditCardComponentsMagento } from "../checkout/CreditCardComponentsMagento.js";
import { PayPalComponents } from "../../../common/checkoutComponents/PayPalComponents.js"
import { SepaDirectDebitComponents } from "../../../common/checkoutComponents/SepaDirectDebitComponents.js";
import { BoletoComponents } from "../../../common/checkoutComponents/BoletoComponents.js";
import { IDealComponents } from "../../../common/checkoutComponents/iDealComponents.js";
import { OneyComponents } from "../../../common/checkoutComponents/OneyComponents.js";
import { GiftcardComponentsMagento } from "../checkout/GiftcardComponentsMagento.js";
import { AmazonPayComponents } from "../../../common/checkoutComponents/AmazonPayComponents.js";
import { expect } from "@playwright/test";

export class PaymentDetailsPage {
  constructor(page) {
    this.page = page;

    this.emailField = page.locator("#customer-email");
    this.errorMessage = page.locator(".message-error");

    this.creditCardRadioButton = page.locator("#adyen_cc");
    this.idealWrapper = page.locator("#adyen-ideal-form");
    this.idealRadioButton = page.locator("#adyen_ideal");
    this.payPalRadioButton = page.locator("#adyen_paypal");
    this.klarnaPayLaterRadioButton = page.locator("#adyen_klarna");
    this.klarnaPayOverTimeRadioButton = page.locator("#adyen_klarna_account");
    this.klarnaPayNowRadioButton = page.locator("#adyen_klarna_paynow");
    this.sepaWrapper = page.locator("#adyen-sepadirectdebit-form");
    this.sepaDirectDebitRadioButton = page.locator("#adyen_sepadirectdebit");
    this.giftcardRadioButton = page.locator("#adyen_giftcard");
    this.oney3RadioButton = page.locator("#adyen_facilypay_3x");
    this.clearPayRadioButton = page.locator("#adyen_clearpay");
    this.boletoRadioButton = page.locator("#adyen_boleto");
    this.bancontactRadioButton = page.locator("#adyen_bcmc_mobile");
    this.bancontactCardRadioButton = page.locator("#adyen_bcmc");
    this.multiBancoRadioButton = page.locator("#adyen_multibanco");
    this.amazonPayRadioButton = page.locator("#adyen_amazonpay");
    this.amazonWrapper = page.locator("#adyen-amazonpay-form");

    this.paymentSummaryLoadingSpinner = page.locator(
      ".opc-sidebar .loading-mask"
    );
    this.activePaymentMethod = page.locator(".payment-method._active");
    this.paymentMethodSaveCheckBox = this.activePaymentMethod.locator(
      ".adyen-checkout__checkbox__label"
    );
  }

  async fillEmailAddress(user){
    this.emailField.fill(user.email);
  }

  async savePaymentMethod() {
    await this.paymentMethodSaveCheckBox.click();
  }

  async selectVaultCC(lastFourDigits) {
    // Not ideal way of selecting saved card due to vault UI structure
    lastFourDigits != undefined ?
    await this.page.locator(`text=Ending ${lastFourDigits} ( expires: 3/2030 )`).click()
    : await page.locator("input#adyen_cc_vault_1").first().click();
    await this.waitForPaymentMethodReady();
  }

  async selectVaultSepaDirectDebit() {
    const d = new Date();
    const formattedDate = d.toISOString().split('T')[0];
    await this.page.locator(`text=SEPA Direct Debit token created on ${formattedDate}`).first().click();
    await this.waitForPaymentMethodReady();
  }

  async selectCreditCard() {
    await this.creditCardRadioButton.click();
    await this.waitForPaymentMethodReady();
    return new CreditCardComponentsMagento(this.page.locator(".payment-method._active"));
  }

  async selectIDeal() {
    await this.idealRadioButton.click();
    await this.waitForPaymentMethodReady();
    return new IDealComponents(this.idealWrapper);
  }

  async selectAmazonPay() {
    await this.amazonPayRadioButton.click();
    await this.waitForPaymentMethodReady();
    return new AmazonPayComponents(this.amazonWrapper);
  }

  async selectPayPal() {
    await this.payPalRadioButton.click();
    await this.waitForPaymentMethodReady();
    return new PayPalComponents(this.page);
  }

  async selectKlarnaPayLater() {
    await this.klarnaPayLaterRadioButton.click();
    await this.waitForPaymentMethodReady();
  }

  async selectKlarnaPayOverTime() {
    await this.klarnaPayOverTimeRadioButton.click();
    await this.waitForPaymentMethodReady();
  }

  async selectKlarnaPayNow() {
    await this.klarnaPayNowRadioButton.click();
    await this.waitForPaymentMethodReady();
  }

  async selectSepaDirectDebit() {
    await this.sepaDirectDebitRadioButton.click();
    await this.waitForPaymentMethodReady();
    return new SepaDirectDebitComponents(this.sepaWrapper);
  }

  async selectGiftCard() {
    await this.giftcardRadioButton.click();
    await this.waitForPaymentMethodReady();

    return new GiftcardComponentsMagento(this.page.locator(".payment-method._active"));
  }

  async selectOney() {
    await this.oney3RadioButton.click();
    await this.waitForPaymentMethodReady();
    return new OneyComponents(this.page.locator(".payment-method._active"));
  }

  async selectClearPay() {
    await this.clearPayRadioButton.click();
    await this.waitForPaymentMethodReady();
  }

  async selectBoleto() {
    await this.boletoRadioButton.click();
    await this.waitForPaymentMethodReady();
    return new BoletoComponents(this.page);
  }

  async selectBancontactMobile() {
    await this.bancontactRadioButton.click();
    await this.waitForPaymentMethodReady();
  }

  async selectBancontactCard() {
    await this.bancontactCardRadioButton.click();
    await this.waitForPaymentMethodReady();
  }

  async selectMultiBanco() {
    await this.multiBancoRadioButton.click();
    await this.waitForPaymentMethodReady();
  }

  async waitForPaymentMethodReady() {
    await this.page.waitForLoadState("domcontentloaded", { timeout: 15000 });
    await this.activePaymentMethod.scrollIntoViewIfNeeded();
  }

  async verifyPaymentRefusal() {
    await this.page.waitForLoadState("domcontentloaded", { timeout: 15000 });
    expect(await this.errorMessage.innerText()).toContain(
        "The payment is REFUSED."
    );
  }
}
