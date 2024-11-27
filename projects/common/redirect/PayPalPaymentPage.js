export class PayPalPaymentPage {
  constructor(page) {
    this.page = page;

    this.changeEmailAddressButton = page.locator(".notYouLink");
    this.emailInput = page.locator("#email");
    this.nextButton = page.locator("#btnNext");
    this.passwordInput = page.locator("#password");
    this.loginButton = page.locator("#btnLogin");
    this.agreeAndPayNowButton = page.locator("#payment-submit-btn");
    this.cancelButton = page.locator("#cancelLink");
    
    this.loggingInAnimation = page.locator("#app-loader");
    this.cookiesWrapper = page.locator("#ccpaCookieBanner");
    this.cookiesDeclineButton = this.cookiesWrapper.getByRole('button', { name: 'decline' });
  }

  async loginToPayPal(username, password) {
    /* Disabling this step since the PayPal HPP disabled this step for now
    await this.changeEmailAddressButton.click();
    */
    await this.emailInput.fill(username);
    await this.nextButton.click();
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  async agreeAndPay() {
    await this.agreeAndPayNowButton.click();
  }

  async makePayPalPayment(username, password) {
    await this.waitForPopupLoad(this.page);
    await this.loginToPayPal(username, password);
    
    await this.loggingInAnimation.waitFor({ state: "visible", timeout: 10000 });
    await this.loggingInAnimation.waitFor({ state: "hidden", timeout: 15000 });

    if (await this.cookiesDeclineButton.isVisible()) {
        await this.cookiesDeclineButton.click();
    }

    await this.agreeAndPay();
  }

  async cancelAndGoToStore() {
    await this.waitForPopupLoad(this.page);
    await this.cancelButton.click();
  }

  async waitForPopupLoad(page) {
    await page.waitForURL(/.*sandbox.paypal.com*/,
      {
      timeout: 10000,
      waitUntil:"load"
    });
  }
}
