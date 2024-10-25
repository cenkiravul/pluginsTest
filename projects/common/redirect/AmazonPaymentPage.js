export class AmazonPayPaymentPage {
  constructor(page) {
    this.page = page;

    this.emailInput = this.page.locator("#ap_email");
    this.passwordInput = this.page.locator("#ap_password");
    this.loginButton = this.page.locator("#signInSubmit");
    this.payNowButton = this.page.locator('#continue-button');

    this.changePaymentButton = this.page.locator("#change-payment-button");
    this.confirmPaymentChangeButton = this.page.locator("#a-autoid-8");
    this.amazonCaptcha = this.page.locator('//img[contains(@alt,"captcha")]')

  }

  async proceedWithAmazonPay(username, password){

    await this.emailInput.click();
    await this.emailInput.type(username);
    await this.passwordInput.click();
    await this.passwordInput.type(password);
    await this.loginButton.click();
    await this.page.waitForLoadState();

    await this.payNowButton.click();
  }
}
