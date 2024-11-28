import { CreditCardComponentsMagento } from "../checkout/CreditCardComponentsMagento.js";
import { AdminPanelPage } from "./AdminPanel.page.js";
import { expect } from "@playwright/test";

export class AdminOrderCreationPage extends AdminPanelPage {
  constructor(page) {
    super(page);
    this.page = page;

    // Sales > Orders Section
    this.createNewOrderButton = page.locator("#add");
    this.testUserNameSelector = page.locator(
      "//td[@data-column='name' and contains(text(),'Veronica Costello')]"
    );
    this.addProductsButton = page.locator("#add_products");

    this.productDataGrid = page.locator("#sales_order_create_search_grid_table");
    this.erikaRunningShorts = this.productDataGrid.getByRole('cell', { name: 'Erika Running Short-32-Red' });
    this.addProductsToOrderButton = page.locator(
      "button[title='Add Selected Product(s) to Order']"
    );
    this.shippingMethodCalculateLink = page
      .locator(".order-shipping-method a")
      .nth(0);
    this.shippingMethodSelector = page.locator("#s_method_flatrate_flatrate");

    this.payByLinkSelector = page.locator("#p_method_adyen_pay_by_link");
    this.motoSelector = page.locator("#p_method_adyen_moto");
    this.motoMerchantAccountDropdown = page.locator("#adyen_moto_merchant_accounts");

    this.submitOrderButton = page.locator("#submit_order_top_button");
    this.paymentLink = page.locator("a[rel='noopener']");
  }

  async createOrder(page) {
    await this.page.waitForLoadState();
    await this.goToOrdersPage();
    await this.waitForPageLoad(page);

    await this.createNewOrderButton.click();
    await this.waitForPageLoad(page);

    await this.testUserNameSelector.click();
    await expect(page.getByText("Customer's Activities")).toBeVisible();
    await this.page.waitForLoadState();

    await this.addProductsButton.click();
    await this.waitForPageLoad(page);

    await this.erikaRunningShorts.click();
    await this.waitForPageLoad(page);

    await this.addProductsToOrderButton.click();
    await this.waitForLoaderWithText(page);
    await this.waitForPageLoad(page);

    await this.shippingMethodCalculateLink.click();
    await this.waitForAdminPanelAnimation(page);
    await this.waitForPageLoad(page);

    await this.shippingMethodSelector.click();
    await this.waitForAdminPanelAnimation(page);
    await this.waitForPageLoad(page);
  }

  async createOrderPayBylink(page) {
    await this.createOrder(page);
    await this.payByLinkSelector.click();
    await this.waitForAdminPanelAnimation(page);
    await this.submitOrderButton.click();
    await this.waitForPageLoad(page);

    const linkToPayment = await this.paymentLink.getAttribute("href");
    return linkToPayment;
  }

  async createOrderMoto(page, cardNumber, cardExpirationDate, merchantAccount = undefined) {
    await this.createOrder(page);
    await this.motoSelector.click();
    await this.waitForAdminPanelAnimation(page);

    merchantAccount != undefined ?
      await this.motoMerchantAccountDropdown.selectOption({ value: `${merchantAccount}` }) :
      await this.motoMerchantAccountDropdown.selectOption({ index: 1 });

    // await this.waitForAdminPanelAnimation(page);
    await this.waitForPageLoad(page);

    const ccSection = new CreditCardComponentsMagento(page);
    await ccSection.fillCardNumber(cardNumber);
    await ccSection.fillExpDate(cardExpirationDate);
    await ccSection.fillHolderName("John Doe");

    await this.submitOrderButton.click();
    await this.waitForPageLoad(page);
  }

  async performModification(page, orderNumber, action) {
    await this.waitForPageLoad(page);
    await this.goToOrdersPage();
    await this.waitForPageLoad(page);
    await this.selectOrderToModify(orderNumber);
    await this.waitForPageLoad(page);
    await action(orderNumber);
    await this.waitForPageLoad(page);
  }

  async createCapture(page, orderNumber) {
    await this.performModification(page, orderNumber, async () => {
      await this.createInvoicesIndividually();
    });
  }

  async createRefund(page, orderNumber) {
    await this.performModification(page, orderNumber, this.createCreditMemo.bind(this));
  }
}
