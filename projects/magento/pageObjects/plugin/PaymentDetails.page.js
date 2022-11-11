import { BancontactCardComponentsMagento } from "../checkout/BancontactCardComponentsMagento.js";
import { CreditCardComponentsMagento } from "../checkout/CreditCardComponentsMagento.js";
import { GenericGiftCardComponentsMagento } from "../checkout/GenericGiftCardComponentsMagento.js";
import { IDealComponentsMagento } from "../checkout/iDealComponentsMagento.js";
import { KlarnaPayLaterComponentsMagento } from "../checkout/KlarnaPayLaterComponentsMagento.js";
import { OneyComponentsMagento } from "../checkout/OneyComponentsMagento.js";
import { PayPalComponents } from "../../../common/checkoutComponents/PayPalComponents.js"
import { SepaDirectDebitComponents } from "../checkout/SepaDirectDebitComponentsMagento.js";
import { ClearPayComponents } from "../checkout/ClearPayComponentsMagento.js";
import { BoletoComponentsMagento } from "../checkout/BoletoComponentsMagento.js";
import { MultiBancoComponentsMagento } from "../checkout/MultiBancoComponentsMagento.js";
import { KlarnaPayNowComponentsMagento } from "../checkout/KlarnaPayNowComponentsMagento.js";
import { KlarnaPayOverTimeComponentsMagento } from "../checkout/KlarnaPayOverTimeComponentsMagento.js";
import { VaultComponents } from "../checkout/VaultComponents.js";

export class PaymentDetailsPage {
  constructor(page) {
    this.page = page;

    this.vaultRadioButton = page.locator("[id*='adyen_cc_vault']").last();
    this.creditCardRadioButton = page.locator("#adyen_cc");
    this.idealRadioButton = page.locator("#adyen_ideal");
    this.payPalRadioButton = page.locator("#adyen_paypal");
    this.klarnaPayLaterRadioButton = page.locator("#adyen_klarna");
    this.klarnaPayOverTimeRadioButton = page.locator("#adyen_klarna_account");
    this.klarnaPayNowRadioButton = page.locator("#adyen_klarna_paynow");
    this.bancontactCardRadioButton = page.locator("#adyen_bcmc");
    this.sepaDirectDebitRadioButton = page.locator("#adyen_sepadirectdebit");
    this.genericGiftCardRadioButton = page.locator("#adyen_genericgiftcard");
    this.oney3RadioButton = page.locator("#adyen_facilypay_3x");
    this.clearPayRadioButton = page.locator("#adyen_clearpay");
    this.boletoRadioButton = page.locator("#adyen_boleto");
    this.multiBancoRadioButton = page.locator("#adyen_multibanco");

    this.paymentSummaryLoadingSpinner = page.locator(
      ".opc-sidebar .loading-mask"
    );
    this.activePaymentMethod = page.locator(".payment-method._active");
    this.paymentMethodSaveCheckBox = this.activePaymentMethod.locator(
      ".adyen-checkout__checkbox__label"
    );
  }

  async savePaymentMethod() {
    await this.paymentMethodSaveCheckBox.click();
  }

  async selectVault() {
    await this.vaultRadioButton.click();
    await this.waitForPaymentMethodReady();
    return new VaultComponents(this.page);
  }

  async selectCreditCard() {
    await this.creditCardRadioButton.click();
    await this.waitForPaymentMethodReady();
    return new CreditCardComponentsMagento(this.page);
  }

  async selectIDeal() {
    await this.idealRadioButton.click();
    await this.waitForPaymentMethodReady();
    return new IDealComponentsMagento(this.page);
  }

  async selectPayPal() {
    await this.payPalRadioButton.click();
    await this.waitForPaymentMethodReady();
    return new PayPalComponents(this.page);
  }

  async selectKlarnaPayLater() {
    await this.klarnaPayLaterRadioButton.click();
    await this.waitForPaymentMethodReady();
    return new KlarnaPayLaterComponentsMagento(this.page);
  }

  async selectKlarnaPayOverTime() {
    await this.klarnaPayOverTimeRadioButton.click();
    await this.waitForPaymentMethodReady();
    return new KlarnaPayOverTimeComponentsMagento(this.page);
  }

  async selectKlarnaPayNow() {
    await this.klarnaPayNowRadioButton.click();
    await this.waitForPaymentMethodReady();
    return new KlarnaPayNowComponentsMagento(this.page);
  }

  async selectBancontactCard() {
    await this.bancontactCardRadioButton.click();
    await this.waitForPaymentMethodReady();
    return new BancontactCardComponentsMagento(this.page);
  }

  async selectSepaDirectDebit() {
    await this.sepaDirectDebitRadioButton.click();
    await this.waitForPaymentMethodReady();
    return new SepaDirectDebitComponents(this.page);
  }

  async selectGiftCard() {
    await this.genericGiftCardRadioButton.click();
    await this.waitForPaymentMethodReady();
    return new GenericGiftCardComponentsMagento(this.page);
  }

  async selectOney() {
    await this.oney3RadioButton.click();
    await this.waitForPaymentMethodReady();
    return new OneyComponentsMagento(this.page);
  }

  async selectClearPay() {
    await this.clearPayRadioButton.click();
    await this.waitForPaymentMethodReady();
    return new ClearPayComponents(this.page);
  }

  async selectBoleto() {
    await this.boletoRadioButton.click();
    await this.waitForPaymentMethodReady();
    return new BoletoComponentsMagento(this.page);
  }

  async selectMultiBanco() {
    await this.multiBancoRadioButton.click();
    await this.waitForPaymentMethodReady();
    return new MultiBancoComponentsMagento(this.page);
  }

  async waitForPaymentMethodReady() {
    await this.waitForPaymentSummaryLoader();
    await this.activePaymentMethod.scrollIntoViewIfNeeded();
  }

  async waitForPaymentSummaryLoader() {
    await this.paymentSummaryLoadingSpinner.waitFor({
      state: "attached",
      timeout: 15000,
    });
    await this.paymentSummaryLoadingSpinner.waitFor({
      state: "detached",
      timeout: 20000,
    });
  }
}