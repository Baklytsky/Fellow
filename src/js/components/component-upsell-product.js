class UpsellProduct extends ProductHelper {
  constructor() {
    super();
    this.product = JSON.parse(this.querySelector('[type="application/json"]').textContent)
    this.productVariants = this.product['variants']
    this.optionTitles = this.querySelectorAll('.option-title-value')
    this.form = this
    this.price = this.querySelector('.upsell-product__content-price')
    this.select = this.querySelector('.js-product-upsell-variant select')
    this.options = this.select.querySelectorAll('option')
    this.radioGroups = Array.from(this.querySelectorAll('.upsell-product__option-group'));
    this.radios = this.querySelectorAll('.upsell-radio')
    this.addToCartBtn = this.querySelector('.js-upsell-add-to-cart')

    this.onUpsellVariantChange()
    this.addEventListener('change', () => this.onUpsellVariantChange())
    this.addToCartBtn.addEventListener('click', (e) => this.upsellAddToCart(e))
  }

  onUpsellVariantChange() {
    this.selectedOptions = this.getOptions()
    this.selectedVariant = this.getSelectedVariant(this.selectedOptions)
    this.disableUnavailableVariants()
    this.changeUpsellImage()
    this.checkVariantTitle()
    this.changePrice()
    this.changeSelectedOption()
    this.toggleAddButton([this.addToCartBtn])
  }

  changeUpsellImage() {
    if (!this.selectedVariant) return
    const selectedImage = this.querySelector('[data-upsell-variant-media="' + this.selectedVariant.id + '"]');
    this.querySelector('[data-upsell-variant-media].visible').classList.remove('visible');
    selectedImage.classList.add('visible')
  }

  changePrice() {
    if (!this.selectedVariant) return
    this.price.innerHTML = theme.formatMoney(this.selectedVariant.price, '${{amount}}')
  }

  upsellAddToCart(e) {
    e.preventDefault()
    const bodyObj = {id: this.selectedVariant.id, quantity: 1};
    if (this.select.hasAttribute('data-selected-variant-preorder')) {
      bodyObj.properties = {
        'pre-order': true
      }
    }
    theme.cart.cartEvent('/cart/add.js', bodyObj, true, theme.pdpErrorMessage)
  }

}

customElements.define('upsell-product', UpsellProduct);