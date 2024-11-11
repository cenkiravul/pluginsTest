import { BasePage } from "../plugin/Base.page.js";
import { AnimationHelper } from "../../helpers/AnimationHelper.js";

export class ProductDetailsPage extends BasePage {
  constructor(page) {
    super(page);
    this.page = page;

    this.firstColorOption = page
      .locator("//*[contains(@class,'swatch-option color')]")
      .first();
    this.quantityField = page.locator("input[name='qty']");
    this.addToCartButton = page.locator("#product-addtocart-button");
  
    this.productDetailActionsWrapper = page.locator(".box-tocart");

    this.buyWithGoogleViaProductPageButton = this.productDetailActionsWrapper
        .locator(".adyen-checkout__paywithgoogle");
    this.buyWithGoogleViaProductPageButtonAnimation = this.productDetailActionsWrapper
        .locator(".gpay-card-info-animated-progress-bar");

    this.buyWithPaypalViaProductPageButton = this.productDetailActionsWrapper
        .frameLocator("iframe[title='PayPal']").last()
        .locator(".paypal-button");
  }

  async navigateToItemPage(itemURL = "joust-duffle-bag.html"){
    await this.page.goto(`/${itemURL}`);
  }

  async addToCart(){
    await this.addToCartButton.click();
    await this.page.waitForResponse(
        async (response) => await this.isAddToCartCallFinished(response)
    );
  }

  async isAddToCartCallFinished(response) {
    return response.url().includes('checkout/cart/add') && response.status() === 200;
  }

  async addItemToCart(itemURL) {
    await this.navigateToItemPage(itemURL);
    await this.addToCart();
  }

  async addItemWithOptionsToCart(itemURL, itemSize = "S", howMany = 1) {
    await this.navigateToItemPage(itemURL);
    await this.page.locator(`[aria-label='${itemSize.toUpperCase()}']`).click();
    await this.firstColorOption.click();
    await this.quantityField.fill(howMany.toString());

    await this.addToCart();

  }

  async clickBuyWithGPay(){
    await (this.buyWithGoogleViaProductPageButton).waitFor({state: "visible"});
    await this.page.waitForLoadState();
    await this.buyWithGoogleViaProductPageButton.click();
  }

  async clickBuyWithPaypal() {
    if (!!(await this.buyWithPaypalViaProductPageButton.isVisible())) {
      await (this.buyWithPaypalViaProductPageButton).waitFor({state: "visible"});
    }

    await this.page.waitForLoadState();

    await this.buyWithPaypalViaProductPageButton.hover();
    await this.buyWithPaypalViaProductPageButton.click();
  }
}
