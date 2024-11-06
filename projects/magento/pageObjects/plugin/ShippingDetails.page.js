import { AnimationHelper } from "../../helpers/AnimationHelper.js";

export class ShippingDetails {
  constructor(page, formWrapper = page.locator("#checkout-step-shipping")) {
    this.page = page;

    // Shipping Section Locators
    this.shippingForm = formWrapper
    this.emailInput = this.shippingForm.locator("#customer-email");
    this.firstNameInput = this.shippingForm.locator("input[name='firstname']");
    this.lastNameInput = this.shippingForm.locator("input[name='lastname']");
    this.addressInput = this.shippingForm.locator("input[name='street[0]']");
    this.countrySelector = this.shippingForm.locator("select[name='country_id']");
    this.stateProvinceDropdown = this.shippingForm.locator("select[name='region_id']");
    this.stateProvinceField = this.shippingForm.locator("input[name='region']");
    this.cityInput = this.shippingForm.locator("input[name='city']");
    this.postCodeInput = this.shippingForm.locator("input[name='postcode']");
    this.phoneNumberInput = this.shippingForm.locator("input[name='telephone']");
    this.shippingMethodRadioButton = page
      .locator("#checkout-shipping-method-load input[type='radio']")
      .first();
    this.nextButton = page.locator(
      "#checkout-step-shipping_method button[type=submit]"
    );
  }

  async goTo(waitForAnimation = true) {
    // Only works with a non-empty shopping cart
    await this.page.goto("/checkout/#shipping");
    if (waitForAnimation != false) {
      await new AnimationHelper(this.page).waitForAnimation();
    }
  }

  async fillShippingDetails(user, fillEmail = true) {
    const typeDelay = 50;

    if (fillEmail === true) {
      await this.emailInput.fill(user.email);
    }

    await this.firstNameInput.fill(user.firstName);
    await this.lastNameInput.fill(user.lastName);
    await this.addressInput.fill(user.street);

    await this.countrySelector.selectOption(user.countryCode);

    if (user.stateOrProvince != undefined) {
      const dropdownValue = await this.stateProvinceDropdown
      .locator(`//option[contains(text(),'${user.stateOrProvince}')]`).first().getAttribute("value");
      await this.stateProvinceDropdown.selectOption(dropdownValue);
    } else if (user.stateCode != undefined) {
      await this.stateProvinceField.fill(user.stateCode);
    }

    await this.cityInput.type(user.city, { delay: typeDelay });
    await this.postCodeInput.type(user.postCode, { delay: typeDelay });

    await this.phoneNumberInput.type(user.phoneNumber, { delay: typeDelay });
    
    if (fillEmail === true) {
      await this.shippingMethodRadioButton.check();
    }
  }

  async clickNextButton() {
    await this.nextButton.click();
  }

  async fillShippingDetailsAndProceedToPayment(user) {
    await this.fillShippingDetails(user);
    await this.page.waitForLoadState();

    await this.clickNextButton();
    await new AnimationHelper(this.page).waitForAnimation();
  }

  async proceedToPaymentWithSavedAddress() {
    await this.shippingMethodRadioButton.check();
    await this.page.waitForLoadState();

    await this.clickNextButton();
  }
}
