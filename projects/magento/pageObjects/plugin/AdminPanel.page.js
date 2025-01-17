export class AdminPanelPage {
  constructor(page) {
    this.page = page;

    //Security Patch Message Selectors
    this.securityMessageHeader = page.locator("//*[contains(@class, 'modal-title') and contains(text(),'Incoming Message')]/..");
    this.securityMessageCloseButton = this.securityMessageHeader.locator(".action-close");
    this.infoPopupLoader = this.page.locator("#container .admin__form-loading-mask .spinner").first();

    //Adobe Data collection popup button
    this.usageStatsTrackerPopupCloser = page.locator(".modal-footer .action-secondary");

    //General Buttons
    this.saveConfigButton = page.locator("#save");

    //Messages
    this.successMessage = page.locator("#messages .message-success");
    this.errorMessage = page.locator("#messages .message-error");
    this.orderErrorMessage = page.locator("#order-message .message-error");

    // Sidebar locators
    this.salesLink = page.locator("#menu-magento-sales-sales");
    this.storesLink = page.locator("#menu-magento-backend-stores");

    // Sidebar > Sales Submenu locators
    this.salesSideMenu = page.locator(".item-sales-operation");
    this.orderLink = this.salesSideMenu.locator("//span[text()='Orders']");

    // Sidebar > Stores Submenu locators
    this.storesSettingsSection = page.locator(".item-stores-settings");
    this.configurationLink = this.storesSettingsSection.locator("//span[text()='Configuration']");

    //Configuration Screen Section
    this.configurationMenuWrapper = page.locator("#system_config_tabs");

    //Configuration Screen > Menu Links
    this.generalConfigLink = this.configurationMenuWrapper.locator("//strong[text()='General']");
    this.salesConfigLink = this.configurationMenuWrapper.locator("//strong[text()='Sales']");

    //Configuration Screen > General Subsection
    this.generalConfigMenu = this.generalConfigLink.locator("..").locator("..");
    this.generalConfigMenuLinkWrapper = this.generalConfigMenu.locator("ul").first();

    //Configuration Screen > Sales Subsection
    this.salesConfigMenu = this.salesConfigLink.locator("..").locator("..");
    this.paymentMethodsLink = this.salesConfigMenu.locator("//span[text()='Payment Methods']");

    //Order details page
    this.invoicesSidebar = this.page.locator("#sales_order_view_tabs_order_invoices").getByRole('link', { name: 'Invoices' })
    this.invoicesSpinner = this.page.locator(".admin__data-grid-loading-mask").nth(1);
    this.getInvoiceLink = (orderNumber, invoiceId = null) => {
      let locator;

      if (invoiceId !== null) {
        locator = this.page.locator(".data-grid.data-grid-draggable").getByRole('cell', { name:`${invoiceId}` });
      } else {
        locator = this.page.locator(".data-grid.data-grid-draggable").getByRole('cell', { name:`${orderNumber}` });
      }

      return locator;
    };
    this.invoiceActionLink = this.page.locator(".page-actions-buttons").getByRole('button', { name: 'Invoice' });
    this.submitInvoice = this.page.locator(".order-totals-actions").getByRole('button', { name: 'Submit Invoice' });
    this.creditMemoLink = this.page.locator(".page-actions-buttons").getByRole('button', { name: 'Credit Memo' });
    this.refundButton = this.page.locator('[data-ui-id="order-items-submit-button"]');
  }

  modificationOrderLink(orderNumber) {
    return this.page.locator(`text=${orderNumber}`);
  }

  async closePopup() {
    await this.waitForPageLoad(this.page);
    await this.infoPopupLoader.waitFor({ state: "hidden", timeout: 15000 });
    if (await this.securityMessageHeader.isVisible()) {
      await this.securityMessageCloseButton.click();
    }
    if (await this.usageStatsTrackerPopupCloser.isVisible()) {
      await this.usageStatsTrackerPopupCloser.click();
    }
  }

  async waitForAdminPanelAnimation(page) {
    const loadingLayer = page.locator(".loading-mask");
    await loadingLayer.waitFor({ state: "visible", timeout: 5000 });
    await loadingLayer.waitFor({ state: "hidden", timeout: 15000 });
  }

  async waitForLoaderWithText(page) {
    const loadingLayer = page.locator(".popup-loading");
    await loadingLayer.waitFor({ state: "visible", timeout: 5000 });
    await loadingLayer.waitFor({ state: "hidden", timeout: 15000 });
  }

  async waitForPageLoad(page) {
    await page.waitForLoadState();
  }

  async goToOrdersPage() {
    await this.salesLink.click();
    await this.orderLink.click();
  }

  async selectOrderToModify(orderNumber) {
    const locator = this.modificationOrderLink(orderNumber);
    await locator.click();
  }

  async createInvoice() {
    await this.invoiceActionLink.click();
    await this.submitInvoice.click();
  }

  async createInvoicesIndividually() {
    await this.invoiceActionLink.click();

    const itemRows = this.page.locator('.order-invoice-tables > tbody');
    let rowCount = await itemRows.count();

    if(rowCount > 1) {
      const currentRow = itemRows.nth(0);
      const qtyInput = currentRow.locator('input[name^="invoice[items]"]');

      await qtyInput.fill('0');
      await this.page.locator('body').click();
      await this.page.locator('.update-button').evaluate((button) => {
        button.removeAttribute('disabled');
        button.classList.remove('disabled');
      });
      const updateQtyButton = this.page.locator('.update-button');

      // Click the button
      await updateQtyButton.click();
    }
    // Submit the invoice
    await this.submitInvoice.click();

    // Wait for the success message (or handle errors)
    await this.successMessage.waitFor({ state: "visible", timeout: 15000 });
  }

  async createCreditMemo(orderNumber, invoiceId = null) {
    await this.invoicesSidebar.click();
    const invoiceLink = this.getInvoiceLink(orderNumber, invoiceId);
    await invoiceLink.click();
    await this.creditMemoLink.click();
    this.refundButton.click();
  }

  async goToAdyenPluginConfigurationPage(page) {
    await this.waitForPageLoad(page);
    await this.storesLink.click();
    await this.configurationLink.click();
    await this.waitForPageLoad(page);
    await this.generalConfigMenuLinkWrapper.waitFor({ state: "visible", timeout: 2000 });
    await this.salesConfigLink.scrollIntoViewIfNeeded();
    await this.salesConfigLink.click();
    await this.paymentMethodsLink.scrollIntoViewIfNeeded();
    await this.paymentMethodsLink.click();
    await this.waitForPageLoad(page);
  }

  async getInvoices(page) {
    await this.invoicesSidebar.click();
    await this.waitForPageLoad(page);

    await this.invoicesSpinner.waitFor({ state: "hidden", timeout: 15000 });

    let rows = page.locator(".data-row");
    let count = await rows.count();
    let invoices = [];

    for (let i = 0; i < count; i++) {
      let invoiceId = await rows.nth(i).locator("td").nth(1).innerText();
      let amount = await rows.nth(i).locator("td").nth(7).innerText();
      let amountInMinorUnits = amount.replace(/€(\d+)\.(\d+)/, (_, euros, cents) => euros + cents);

      invoices.push({
        invoiceId: invoiceId,
        amount: amountInMinorUnits
      })
    }

    return invoices;
  }
}
