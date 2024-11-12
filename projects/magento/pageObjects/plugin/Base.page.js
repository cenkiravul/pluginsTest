import { TopBar } from "./TopBar.page.js";

export class BasePage extends TopBar {
  constructor(page) {
    super(page);
    this.page = page;
    this.storeLogo = page.locator(".logo img");
    this.searchInput = page.locator(".control #search");
    this.cartIcon = page.locator(".showcart");
    this.cartItemCount = page.locator(".qty .counter-number");
    this.shoppingCartLoaderMask = page.locator(".showcart .loading-mask");

    this.miniCartWrapper = page.locator(".block-minicart");
    this.buyWithGoogleViaCartButton = this.miniCartWrapper.locator(".adyen-checkout__paywithgoogle");
    this.buyWithGoogleViaCartButtonAnimation = this.miniCartWrapper.locator(".gpay-card-info-animated-progress-bar");
    this.buyWithPaypalViaCartButton = this.miniCartWrapper
        .frameLocator("iframe[title='PayPal']").last()
        .locator(".paypal-button");
  }

  async currentCartItemCount() {
    await this.shoppingCartLoaderMask.waitFor({
      state: "detached",
      timeout: 10000,
    });
    return this.cartItemCount.innerText();
  }

  async clickbuyWithGPayViaMiniCart(){
    await this.shoppingCartLoaderMask.waitFor({
      state: "detached",
      timeout: 10000,
    });
    await this.cartIcon.click();

    await (this.buyWithGoogleViaCartButton).waitFor({state: "visible"});
    await this.page.waitForLoadState();
    await this.buyWithGoogleViaCartButton.click();
  }

  async clickbuyWithPaypalViaMiniCart(){
    await this.shoppingCartLoaderMask.waitFor({
      state: "detached",
      timeout: 10000,
    });
    await this.cartIcon.click();

    await (this.buyWithPaypalViaCartButton).waitFor({state: "visible"});
    await this.page.waitForLoadState();
    await this.buyWithPaypalViaCartButton.click();
  }
}
