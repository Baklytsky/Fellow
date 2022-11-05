class PdpStickyBar extends ProductHelper {
  constructor() {
    super();
    this.product = window.theme.product
    this.productVariants = this.product['variants']
    this.pdpContainer = this.closest('.pdpMain__container')
    this.radioGroups = this.querySelectorAll('.option-groups')
    this.radios = this.querySelectorAll('.radio')
    this.selectSizeBtn = this.querySelector('.cart__button--select-size')
    this.sizeLabel = this.querySelector('[data-option-label="Size"] .option-title strong')
    this.sizeCheckedLabel = this.querySelector('[data-option-size] label.checked')

    document.addEventListener('scroll', () => this.showStickyBar())
    if (this.selectSizeBtn) {
      this.selectSizeBtn.addEventListener('click', () => this.scrollToTop())
    }
  }

  stickyBarVariantChange(selectedOptions, sizeSelected) {
    this.selectedOptions = selectedOptions
    this.selectedVariant = this.getSelectedVariant(this.selectedOptions)
    this.checkActiveRadios()
    this.disableUnavailableVariants()
    if (sizeSelected) this.changeSizeLabel()
  }

  changeSizeLabel() {
    this.sizeCheckedLabel = this.querySelector('[data-option-size] label.checked')
    this.sizeLabel.innerHTML = this.sizeCheckedLabel.querySelector('input').title
  }

  checkActiveRadios() {
    this.radioGroups.forEach((optionGroup, i) => {
      const groupRadios = optionGroup.querySelectorAll('.radio'),
          checkedRadio = optionGroup.querySelector('[for="' + this.selectedOptions[i] + '"]')
      groupRadios.forEach(radio => radio.classList.remove('checked'))
      checkedRadio.classList.add('checked')
    })
  }

  showStickyBar() {
    const pdpDetailsPosition = this.pdpContainer.getBoundingClientRect();
    (pdpDetailsPosition.bottom < 0)
        ? this.classList.add('show')
        : this.classList.remove('show')
  }

  scrollToTop() {
    if (window.innerWidth < 1200) {
      const topPosition = this.pdpContainer.offsetTop;
      window.scrollTo({ top: topPosition, behavior: 'smooth'});
    }
  }
}

customElements.define('pdp-sticky-bar', PdpStickyBar);

class PdpMain extends ProductHelper {
  constructor() {
    super();
    this.product = window.theme.product
    this.productVariants = this.product['variants']
    this.media = this.querySelector('.pdpMain__Media')
    this.price = this.querySelectorAll('.pdpCopy__price')
    this.form = this.querySelector('.pdpForm')
    this.optionTitles = this.form.querySelectorAll('.option-title-value')
    this.quantity = this.form.querySelector('[name="quantity"]')
    this.sizeOptions = this.form.querySelectorAll('[data-option-size] .radio')
    this.select = this.form.querySelector('.select-wrapper select')
    this.options = this.select.querySelectorAll('option')
    this.radioGroups = Array.from(this.form.querySelectorAll('[data-option-radio]'))
    this.radios = this.form.querySelectorAll('.radio')
    this.addToCartBtn = this.form.querySelector('.js-add-to-cart')
    this.stickyAtc = this.querySelector('#pdp-sticky-atc')
    this.klaviyoOOS = this.querySelector('.klaviyo-bis-trigger')
    this.stickyBar = this.querySelector('pdp-sticky-bar')
    this.personalizeBtn = this.form.querySelector('.pdpDetails__personalize')
    this.upsell = this.querySelector('.upsell-product')

    this.onVariantChange()

    this.form.addEventListener('change', () => {
      this.onVariantChange()
      this.changeContent()
      this.changeUrl()
    })
    this.addToCartBtn.addEventListener('click', (e) => this.addToCart(e))
    if (this.stickyAtc) this.stickyAtc.addEventListener('click', (e) => {
      theme.isHidden(this.addToCartBtn) ? this.klaviyoOOS.click() : this.addToCart(e)
    })
    if (this.sizeOptions.length) {
      this.sizeOptions.forEach(radio => radio.addEventListener('click', () => {
        this.checkSizeSelected()
        if (this.stickyBar) this.stickyBar.stickyBarVariantChange(this.selectedOptions, this.sizeSelected)
      }))
    }
  }

  onVariantChange() {
    this.selectedOptions = this.getOptions()
    this.selectedVariant = this.getSelectedVariant(this.selectedOptions)
    this.changeSelectedOption()
    this.disableUnavailableVariants()
    this.checkVariantTitle()
    this.toggleAddButton([this.addToCartBtn, this.stickyAtc])
    if (this.personalizeBtn) this.setVariantForPersonalization()
    if (this.stickyBar) this.stickyBar.stickyBarVariantChange(this.selectedOptions, this.sizeSelected)
  }

  changeUrl() {
    if (!this.selectedVariant) return;
    const searchParams = new URLSearchParams(window.location.search);
    let url = `${window.location.origin}/products/${this.product.handle}?variant=${this.selectedVariant.id}`

    if (searchParams) {
      searchParams.delete('variant')
      url += (searchParams.toString().length) ? `&${searchParams}` : ''
    }

    window.history.replaceState({}, '', url);
  }

  setVariantForPersonalization() {
    window.localStorage.setItem('changeVariant', 'true');
    window.localStorage.setItem('variantId', this.selectedVariant.id);
  }

  changeContent() {
    if (!this.selectedVariant) return;
    fetch(window.location.origin + window.location.pathname + '?variant=' + this.selectedVariant.id + '&view=ajax-media')
        .then(response => response.text())
        .then(data => {
          const html = new DOMParser().parseFromString(data, 'text/html')
          this.media.innerHTML = html.querySelector('.pdpMain__Media').innerHTML
          this.price.forEach(price => {
            price.innerHTML = html.querySelector('.pdpCopy__price').innerHTML
          })
          const upsell = html.querySelector('.upsell-product')
          this.upsell.innerHTML = (upsell.hasChildNodes()) ? upsell.innerHTML : ''
          theme.slickSlider()
        })
  }
}
customElements.define('pdp-main', PdpMain);

class PdpGallery extends HTMLElement {
  constructor () {
    super()
    this.container = this.closest('.pdpMain__Media')
    this.variantImages = this.querySelectorAll('.pdpMain__variant-image')
    this.thumbnailsGallery = this.querySelectorAll('.pdpMain__gallery-thumbnails')
    this.thumbnails = this.querySelectorAll('.pdpMain__gallery-thumbnails-item')
    this.gallery = this.querySelector('.pdpMain__gallery-wrapper')

    this.mainGallery()
    this.thumbnails.forEach(thumbnail => {
      thumbnail.addEventListener('click', () => this.thumbnailScrollOnClick(thumbnail))
    })
    document.addEventListener('scroll', (e) => {
      if (e.cancelable) e.preventDefault();
      setTimeout(() => this.changeActiveThumbnail(), 400)
    })
  }

  thumbnailScrollOnClick (thumbnail) {
    if (thumbnail.classList.contains('current-thumbnail')) return
    const id = thumbnail.getAttribute('data-variant-img'),
        scrollElement = this.querySelector('[data-variant-media="' + id + '"]'),
        headerHeight = document.getElementById('MainHeader').offsetHeight,
        topPosition = scrollElement.offsetTop + headerHeight;
    window.scrollTo({ top: topPosition, behavior: 'smooth'});
    this.thumbnails.forEach(item => item.classList.remove('current-thumbnail'))
    thumbnail.classList.add('current-thumbnail')
  }

  changeActiveThumbnail() {
    this.variantImages.forEach(image => {
      let imagePosition = image.getBoundingClientRect();
      if (imagePosition.top < 300) {
        const id = image.getAttribute('data-variant-media')
        const thumbnailImage = this.querySelector('[data-variant-img="' + id + '"]')
        let slideIndex = thumbnailImage.dataset.slickIndex
        this.thumbnails.forEach(item => item.classList.remove('current-thumbnail'))
        thumbnailImage.classList.add('current-thumbnail')
        $(this.thumbnailsGallery).slick('slickGoTo', parseInt(slideIndex), true);
      }
    })
  }

  mainGallery() {
    const config = JSON.parse(this.gallery.getAttribute('data-slick-config'))
    theme.slickResponsive('.pdpMain__gallery-wrapper', config, 992, true)
  }
}

customElements.define('pdp-gallery', PdpGallery);