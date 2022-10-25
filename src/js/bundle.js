class bundleMixCard extends ProductHelper {
  constructor() {
    super();
    this.pdpContainer = this.closest('.pdpMain__container')
    this.product = JSON.parse(this.querySelector('[type="application/json"]').textContent)
    this.productVariants = this.product['variants']
    this.optionTitles = this.querySelectorAll('.option-title-value')
    this.form = this
    this.select = this.querySelector('.select-wrapper select')
    this.options = this.select.querySelectorAll('option')
    this.radioGroups = Array.from(this.querySelectorAll('.bundle-product__option-group'));
    this.radios = this.querySelectorAll('.bundle-radio')
    this.addToCartBtn = this.pdpContainer.querySelector('.js-pick-mix-add-to-cart')

    this.onCardVariantChange()
    this.addEventListener('change', () => this.onCardVariantChange())
  }

  onCardVariantChange() {
    this.selectedOptions = this.getOptions()
    this.selectedVariant = this.getSelectedVariant(this.selectedOptions)
    this.changeSelectedOption()
    this.disableUnavailableVariants()
    this.checkVariantTitle()
    this.changeBundleMedia()
    this.toggleBundleAddButton()
    this.checkBundlePrice()
  }

  changeBundleMedia() {
    if (!this.selectedVariant) return
    // Change PDP Main Gallery Image
    const mainImageId = this.selectedOption.getAttribute('data-variant-uniq_id'),
        mediaSelector = '[data-variant-media="' + mainImageId + '"]',
        selectedImage = this.pdpContainer.querySelector(mediaSelector);
    this.showImage(selectedImage, 'data-variant-media')
    // Change Bundle Mix Card Image
    const cardImageId = this.selectedVariant.id,
        selectedCardImage = this.querySelector('[data-mix-card-media-id="' + cardImageId + '"]');
    this.showImage(selectedCardImage, 'data-mix-card-media-id')
  }

  showImage(imageToShow, mediaAttr) {
    if (!imageToShow) return
    const imageSelector = `.visible[${mediaAttr}]`,
        visibleImage = imageToShow.parentElement.querySelector(imageSelector);
    if (visibleImage) visibleImage.classList.remove('visible');
    imageToShow.classList.add('visible');
  }

  toggleBundleAddButton() {
    const disabledOptions = this.pdpContainer.querySelectorAll('.js-bundle-variant option:disabled'),
        disabled = Array.from(disabledOptions).filter((i) => i.hasAttribute('selected')),
        unavailable = Array.from(this.pdpContainer.querySelectorAll('.js-bundle-variant select[data-unavailable]')),
        preOrder = Array.from(this.pdpContainer.querySelectorAll('.js-bundle-variant select[data-selected-variant-preorder]'));

    if (unavailable.length) {
      theme.changeBtnState(this.addToCartBtn, 'disabled', 'Unavailable')
    } else if (preOrder.length) {
      theme.changeBtnState(this.addToCartBtn, 'active', 'Pre-order')
    } else if (disabled.length) {
      theme.changeBtnState(this.addToCartBtn, 'disabled', 'Out Of Stock')
    }  else {
      theme.changeBtnState(this.addToCartBtn, 'active', 'Add to Cart')
    }
  }

  checkBundlePrice() {
    let priceDiffSum = 0;
    const selectedMixVariants = this.pdpContainer.querySelectorAll('.js-bundle-variant option[selected]'),
        priceDiffArray = Array.from(selectedMixVariants).map((variant) => {
          return Number(variant.dataset.bundlePriceDifference)
        });

    priceDiffArray.forEach(priceDiff => priceDiffSum += priceDiff);

    const newCompareAtPrice = (window.theme.product.compare_at_price * 0.01) + priceDiffSum,
        newPrice = (window.theme.product.price * 0.01) + priceDiffSum,
        priceInner = this.pdpContainer.querySelectorAll('[data-product-price]'),
        compareAtPriceInner = this.pdpContainer.querySelectorAll('[data-compare-at-price] span');

    priceInner.forEach(element => element.innerHTML = '$' + newPrice)
    if (compareAtPriceInner.length) {
      compareAtPriceInner.forEach(element => element.innerHTML = '$' + newCompareAtPrice)
    }
  }

}

customElements.define('bundle-mix-card', bundleMixCard);

class bundle extends HTMLElement {
  constructor() {
    super();
    this.pdpContainer = this.closest('.pdpMain')
    this.gallery = this.pdpContainer.querySelector('.pdpMain__bundle-gallery')
    this.addToCartBtn = this.querySelector('.js-pick-mix-add-to-cart');
    this.bundleName = this.addToCartBtn.getAttribute('data-bundle-name');
    this.selects = this.querySelectorAll('.js-bundle-variant .js-select');
    this.addToCartBtn.addEventListener('click', this.addBundle.bind(this));
    this.variantsId = [];
    this.variantsData = [];
    if (this.gallery) this.bundleGallery()
  }

  bundleGallery() {
    const config = JSON.parse(this.gallery.getAttribute('data-slick-config'))
    theme.slickResponsive('.pdpMain__bundle-gallery-wrapper', config, 992, true)
  }

  addBundle(e) {
    e.preventDefault();
    this.selects.forEach((select) => {
      const variant_id = select.getAttribute('value');
      this.variantsId.push(variant_id);
    });

    this.variantsId.sort();
    let current = null,
        cnt = 0;
    for (let i = 0; i < this.variantsId.length; i++) {
      if (this.variantsId[i] !== current) {
        if (cnt > 0) this.getProperty(current, cnt)
        current = this.variantsId[i];
        cnt = 1;
      } else {
        cnt++;
      }
    }
    if (cnt > 0) this.getProperty(current, cnt)

    theme.cart.cartEvent('/cart/add.js', {items: this.variantsData}, true, theme.pdpErrorMessage)
  }

  getProperty(current, cnt) {
    const select = this.querySelector('.js-select[value="' + current + '"]')
    const prop = {
      "_bundles": true,
      "_Bundle_Name": this.bundleName
    }

    if (select.hasAttribute('data-selected-variant-preorder')) prop["pre-order"] = true
    if (window.theme.product_is_recommended) prop["_recommended_product"] = true;

    this.variantsData.push({
      quantity: cnt,
      id: current,
      properties: prop
    })
  }
}

customElements.define('bundle-mix', bundle);