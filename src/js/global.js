theme.changeBtnState = function (btn, state, btnInner) {
  if (!btn) return
    (state === 'active')
        ? btn.removeAttribute('disabled')
        : btn.setAttribute('disabled', 'disabled')
  if (btnInner) btn.innerHTML = btnInner
}

theme.isHidden = function (el) {
  const style = window.getComputedStyle(el);
  return (style.display === 'none' || style.visibility === 'hidden')
}

theme.setAttributes = function (el, attrObj) {
  Object.keys(attrObj).forEach(key => el.setAttribute(key, attrObj[key]));
}

theme.hideElements = function (elArr) {
  elArr.forEach(el => {
    if (el) el.style.display = 'none'
  });
}

theme.showElements = function (elArr) {
  elArr.forEach(el => {
    if (el) el.style.display = 'block'
  });
}

theme.debounce = function (func, timeout = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => { func.apply(this, args); }, timeout);
  };
};

theme.addScripts = function (scriptObj) {
  return Promise.all(Object.keys(scriptObj).map(key => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.type = "text/javascript";
      script.src = scriptObj[key];
      document.getElementsByTagName("body")[0].appendChild(script);
      script.addEventListener('load', () => resolve());
    })
  }))
}

theme.serializeObject = function (form) {
  const formData = new FormData(form),
        bodyObj = {};
  for (const [name, value] of formData) bodyObj[name] = value;
  return bodyObj
}

theme.pdpErrorMessage = function (error) {
  if (error.status === 422) {
    let errorMessage = document.querySelector('.PdpErrorMessage')
    errorMessage.innerHTML = error.responseJSON.description
    errorMessage.style.display = 'block'
    setTimeout(() => {
      errorMessage.style.display = 'none'
      errorMessage.innerHTML = ''
    }, 3500);
  }
}

theme.disableScroll = function () {
  document.body.style.overflow = 'hidden';
}

theme.enableScroll = function () {
  document.body.style.removeProperty('overflow');
}

theme.handleize = function (str) {
  return str.toLowerCase().replace(/[^\w\u00C0-\u024f]+/g, "-").replace(/^-+|-+$/g, "");
};

theme.toggleSlickVideoPlay = function (slider, videoSlides) {
  function togglePlay(firstLoad) {
    videoSlides.each((i, video) => {
      if ($(video).parents('.slick-slide').hasClass('slick-active')) {
        video.play()
      } else {
        if (firstLoad) {
          setTimeout(()=> video.pause(), 500)
        } else {
          video.pause()
        }
      }
    })
  }
  togglePlay(true)

  slider.on('afterChange', (event, slick, currentSlide) => {
    togglePlay(false)
  })
}

theme.slickSlider = function () {
  $('[data-section-type="slick-slideshow"]').each(function () {
    const $slider = $(this).find('.jsSlickSlider');
    let config = {};

    if ($(this).attr('data-slick-config')) {
      config = $.parseJSON($(this).attr('data-slick-config'));

      if (config['arrows']) {
        config.prevArrow = $(this).find('.jsPrevSlide');
        config.nextArrow = $(this).find('.jsNextSlide');
      }
    }

    if ($slider.length) $slider.not('.slick-initialized').slick(config);

    const videoSlides = $slider.find('video')
    if (videoSlides.length) theme.toggleSlickVideoPlay($slider, videoSlides)
  });
}

theme.slickSlider()

theme.slickResponsive = function (selector, config, response, maxMedia) {
  if (!$(selector).length) return

  function checkSlider() {
    const videoSlides = $(selector).find('video')
    const condition = (maxMedia) ? $(window).width() < response : $(window).width() > response;
    if (condition) {
      const prevArrow = $(selector).parent().find('.jsPrevSlide');
      const nextArrow = $(selector).parent().find('.jsNextSlide');
      if (config['arrows']) {
        if (prevArrow.length) config.prevArrow = prevArrow;
        if (nextArrow.length) config.nextArrow = nextArrow;
      }
      $(selector).not('.slick-initialized').slick(config)
      if (videoSlides.length) theme.toggleSlickVideoPlay($(selector), videoSlides)
    } else {
      if ($(selector).hasClass('slick-initialized')) {
        $(selector).slick('unslick')
        if (videoSlides.length) videoSlides.each((i, video) => video.play())
      }
    }
  }

  checkSlider();
  $(window).resize(function () {
    checkSlider();
  });
}

theme.checkAllSlidersResponse = function () {
  const allResponseSliders = document.querySelectorAll('[data-slick-responsive]')
  allResponseSliders.forEach(slider => {
    const sliderAttr = slider.getAttribute('data-slick-responsive');
    if (!sliderAttr) return
    const settings = JSON.parse(sliderAttr);
    theme.slickResponsive(settings.selector, settings.config, settings.response, settings.maxMedia)
  })
}

theme.checkAllSlidersResponse()

theme.formatMoney = function (cents, format) {
  if (typeof cents === 'string') {
    cents = cents.replace('.', '');
  }

  const defaultTo = function(value, defaultValue) {
    return (value == null || value !== value) ? defaultValue : value
  }

  let value = '';
  const placeholderRegex = /\{\{\s*(\w+)\s*\}\}/;
  const formatString = (format || theme.moneyFormat);

  function formatWithDelimiters(number, precision, thousands, decimal) {
    precision = defaultTo(precision, 2);
    thousands = defaultTo(thousands, ',');
    decimal = defaultTo(decimal, '.');

    if (isNaN(number) || number == null) {
      return 0;
    }

    number = (number / 100.0).toFixed(precision);

    const parts = number.split('.');
    const dollarsAmount = parts[0].replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1' + thousands);
    const centsAmount = (parts[1] !== '00') ? (decimal + parts[1]) : '';

    return dollarsAmount + centsAmount;
  }

  switch (formatString.match(placeholderRegex)[1]) {
    case 'amount':
      value = formatWithDelimiters(cents, 2);
      break;
    case 'amount_no_decimals':
      value = formatWithDelimiters(cents, 0);
      break;
    case 'amount_with_comma_separator':
      value = formatWithDelimiters(cents, 2, '.', ',');
      break;
    case 'amount_no_decimals_with_comma_separator':
      value = formatWithDelimiters(cents, 0, '.', ',');
      break;
  }

  return formatString.replace(placeholderRegex, value);
}

theme.slideUp = function (target, duration= 500) {
  target.classList.remove('active')
  target.style.transitionProperty = 'height, margin, padding';
  target.style.transitionDuration = duration + 'ms';
  target.style.boxSizing = 'border-box';
  target.style.height = target.offsetHeight + 'px';
  target.offsetHeight;
  target.style.overflow = 'hidden';
  target.style.height = 0;
  target.style.paddingTop = 0;
  target.style.paddingBottom = 0;
  target.style.marginTop = 0;
  target.style.marginBottom = 0;
  window.setTimeout( () => {
    target.style.display = 'none';
    target.style.removeProperty('height');
    target.style.removeProperty('padding-top');
    target.style.removeProperty('padding-bottom');
    target.style.removeProperty('margin-top');
    target.style.removeProperty('margin-bottom');
    target.style.removeProperty('overflow');
    target.style.removeProperty('transition-duration');
    target.style.removeProperty('transition-property');
  }, duration);
}

theme.slideDown = function (target, duration= 500) {

  target.classList.add('active')
  target.style.removeProperty('display');
  let display = window.getComputedStyle(target).display;
  if (display === 'none') display = 'block';
  target.style.display = display;
  let height = target.offsetHeight;
  target.style.overflow = 'hidden';
  target.style.height = 0;
  target.style.paddingTop = 0;
  target.style.paddingBottom = 0;
  target.style.marginTop = 0;
  target.style.marginBottom = 0;
  target.offsetHeight;
  target.style.boxSizing = 'border-box';
  target.style.transitionProperty = "height, margin, padding";
  target.style.transitionDuration = duration + 'ms';
  target.style.height = height + 'px';
  target.style.removeProperty('padding-top');
  target.style.removeProperty('padding-bottom');
  target.style.removeProperty('margin-top');
  target.style.removeProperty('margin-bottom');
  window.setTimeout( () => {
    target.style.removeProperty('height');
    target.style.removeProperty('overflow');
    target.style.removeProperty('transition-duration');
    target.style.removeProperty('transition-property');
  }, duration);
}

theme.slideToggle = function (target, duration = 250) {
  if (!target.classList.contains('active')) {
    return theme.slideDown(target, duration);
  } else {
    return theme.slideUp(target, duration);
  }
}

theme.objToStrUrlEncode = function(obj) {
  const str = [];
  for (var key in obj) {
    if (obj.hasOwnProperty(key) && typeof obj[key] !== 'undefined') {
      str.push(encodeURIComponent(key) + "=" + encodeURIComponent(obj[key]))
    }
  }
  return str.join('&')
}

theme.klaviyoFetch = function (id, email, phone, listID = '') {

  const data = {
    g: listID,
    '$fields': '$source,$email,$phone,$consent_method',
    '$list_fields': '',
    '$timezone_offset': Math.abs(new Date().getTimezoneOffset() / 60),
    '$source': (id) ? id : 'Shopify',
    '$email': (email) ? email.value : '',
    '$phone_number': (phone) ? phone.value : '',
    '$consent_method': 'Klaviyo Form',
    '$origin': 'origin'
  }

  return fetch("https://a.klaviyo.com/ajax/subscriptions/subscribe", {
    "headers": {
      "accept": "*/*",
      "accept-language": "en-US,en;q=0.9",
      "content-type": "application/x-www-form-urlencoded",
    },
    "body": theme.objToStrUrlEncode(data),
    "method": "POST",
    "mode": "cors",
    "credentials": "omit"
  }).then(response => response.json())
      .then(response => {
        console.log(response)
      })
      .catch(err => {
        console.error(err)
      });
}

document.addEventListener("DOMContentLoaded", ()=> {
  if ($('form[action^="htpps://www.facebook.com"]').length) {
    $('form[action^="htpps://www.facebook.com"]').attr('aria-hidden', 'true')
  }
})

class quantityStepper extends HTMLElement {
  constructor() {
    super();
    this.singleStepper = this.getAttribute('data-single-stepper')
    this.quantityInput = this.querySelector('.js-quantity')
    this.minusBtn = this.querySelector('.js-minus')
    this.plusBtn = this.querySelector('.js-plus')

    if (this.minusBtn) this.minusBtn.addEventListener('click', () => this.quantityStepper('minus'))
    if (this.plusBtn) this.plusBtn.addEventListener('click', () => this.quantityStepper('plus'))
    if (this.quantityInput) this.quantityInput.addEventListener('change', () => this.quantityCheck())
  }

  quantityStepper(action) {
    this.quantityInput.value = (action === 'minus')
        ? Number(this.quantityInput.value) - 1
        : Number(this.quantityInput.value) + 1;
    if (this.singleStepper === 'true') this.quantitySingle()
    const evt = new Event('change');
    this.quantityInput.dispatchEvent(evt)
  }

  quantitySingle() {
    theme.changeBtnState(this.minusBtn, 'disabled')
    theme.changeBtnState(this.plusBtn, 'disabled')
  }

  quantityCheck() {
    const min = Number(this.quantityInput.min),
          max = Number(this.quantityInput.max);
    let val = Number(this.quantityInput.value);
    if (max && (val > max)) this.quantityInput.value = max
    if (val < min) this.quantityInput.value = min
  }
}

customElements.define('quantity-stepper', quantityStepper);


class ModalDialog extends HTMLElement {
  constructor() {
    super();
    this.content = this.querySelector('[role="dialog"]')
    this.querySelectorAll('[id^="ModalClose-"]').forEach(el => el.addEventListener(
        'click',
        this.hide.bind(this)
    ));
    this.addEventListener('keyup', (event) => {
      if (event.code.toUpperCase() === 'ESCAPE') this.hide()
    });
    this.addEventListener('click', (event) => {
      if (event.target.nodeName === 'MODAL-DIALOG') this.hide()
    });
  }

  show(opener) {
    const attributes = {
      'tabindex': '0',
      'aria-hidden': 'false'
    }
    this.openedBy = opener
    theme.disableScroll()
    theme.setAttributes(this.content, attributes)
    this.setAttribute('open', '')
    setTimeout(() => this.content.focus(), 500)
  }

  hide() {
    const attributes = {
      'tabindex': '-1',
      'aria-hidden': 'true'
    }
    theme.enableScroll()
    theme.setAttributes(this.content, attributes)
    this.removeAttribute('open')
    this.content.blur()

    if (this.id === 'PopupModal--quick-add') this.closeQuickAdd()
  }

  closeQuickAdd() {
    this.querySelector('#modalContent').innerHTML = ''
    this.querySelector('#emptyQvModal').classList.remove('is-hidden')
  }
}
customElements.define('modal-dialog', ModalDialog);

class ModalOpener extends HTMLElement {
  constructor() {
    super();

    const button = this.querySelector('button');

    if (!button) return;
    button.addEventListener('click', () => {
      const modal = document.querySelector(this.getAttribute('data-modal'));
      if (modal) modal.show(button);
    });
  }
}
customElements.define('modal-opener', ModalOpener);

class Dropdown extends HTMLElement {
  constructor() {
    super();
    this.addEventListener('click', (e) => this.dropdownToggle(e))
  }

  dropdownToggle(e) {
    if (!e.target.closest('[data-dropdown-content]')) {
      this.classList.toggle('active')
    } else {
      this.classList.remove('active')
    }
  }
}

customElements.define('dropdown-toggle', Dropdown);

class SlideToggle extends HTMLElement {
  constructor() {
    super();
    this.duration = this.dataset.duration || 250;
    this.slideTargetName = this.getAttribute('data-slide-target');
    this.slideTarget = document.querySelector('[data-slide-content="'+ this.slideTargetName + '"]')
    if (this.slideTarget) {
      this.addEventListener('click', (e) => {
        e.preventDefault();
        this.classList.toggle('active')
        theme.slideToggle(this.slideTarget, this.duration)
      });
    }
  }
}

customElements.define('slide-toggle', SlideToggle);

class ToggleTabs extends HTMLElement {
  // Required button element: data-selected='true/false'; aria-controls='TAB_ID'; data-action='toggle-tab'
  // Required tab element: data-selected='true/false'; data-tab='TAB_ID'
  constructor() {
    super();
    this.buttons = this.querySelectorAll('[data-action="toggle-tab"]')
    this.tabs = this.querySelectorAll('[data-tab]')

    this.buttons.forEach(button => {
      button.addEventListener('click', ()=> this.toggleTab(button))
    })
  }

  toggleTab(button) {
    if (button.dataset.selected === 'true') return
    const tabId = button.getAttribute('aria-controls'),
          tabToShow = Array.from(this.tabs).find(tab => tab.dataset.tab === tabId);
      this.buttons.forEach(el => el.dataset.selected = 'false')
      this.tabs.forEach(tab => tab.dataset.selected = 'false')
      button.dataset.selected = 'true'
      tabToShow.dataset.selected = 'true'
  }
}

customElements.define('toggle-tabs', ToggleTabs);

class ProductHelper extends HTMLElement {
  constructor() {
    super();
  }

  getSelectedVariant(optionsArr) {
    return this.productVariants.find((variant) => {
      return !variant.options.map((option, index) => {
        let optionValue = option;
        if (optionValue.includes(':')) optionValue = optionValue.split(':')[1].trim();
        return optionsArr[index] === theme.handleize(optionValue);
      }).includes(false);
    });
  }

  getOptions() {
    return this.radioGroups.map((radioGroup) => {
      return Array.from(radioGroup.querySelectorAll('input')).find((radio) => radio.checked).value;
    });
  }

  changeSelectedOption() {
    if (this.selectedVariant) {
      this.select.removeAttribute('data-unavailable')
      this.options.forEach(option => option.removeAttribute('selected'))
      this.selectedOption = this.querySelector(`option[value='${this.selectedVariant.id}']`);
      (this.selectedOption.getAttribute('data-variant-preorder'))
          ? this.selectedOption.parentElement.setAttribute('data-selected-variant-preorder', 'true')
          : this.selectedOption.parentElement.removeAttribute('data-selected-variant-preorder');
      this.selectedOption.setAttribute('selected', 'selected')
      this.select.setAttribute('value', this.selectedVariant.id)
    } else {
      this.select.setAttribute('data-unavailable', 'true')
    }
  }

  disableUnavailableVariants() {
    this.radios.forEach((radio) => radio.classList.remove('unavailable'))
    for (let i = 0; i < this.selectedOptions.length; i++) {
      const groupRadios = this.radioGroups[i].querySelectorAll('.radio input');
      groupRadios.forEach(radio => {
        const options = [...this.selectedOptions]
        options.splice(i,1, radio.value)
        if (!this.getSelectedVariant(options)) radio.parentElement.classList.add('unavailable');
      })
    }
  }

  checkVariantTitle() {
    this.optionTitles.forEach(title => title.innerHTML = '')
    this.checkedOptions = this.form.querySelectorAll('input:checked')
    this.checkedOptions.forEach((option) => {
      const optionGroup = option.closest('.option-groups__item'),
          optionSingle = option.closest('.pdp__options-item'),
          optionSelector = (optionGroup) ? optionGroup : optionSingle,
          optionTitle = optionSelector.querySelector('.option-title-value');
      if (optionTitle) optionTitle.innerHTML = `${option.title}`
    })
  }

  checkSizeSelected() {
    if (this.sizeSelected) return
    this.querySelectorAll('[data-disabled-size="true"]').forEach(el => {
      el.removeAttribute('data-disabled-size')
    })
    if (this.personalizeBtn) this.personalizeBtn.querySelector('.customize-btn').style.display = 'block'
    this.sizeSelected = true
  }

  toggleAddButton(buttonsArr) {
    const preOrder = this.select.hasAttribute('data-selected-variant-preorder');

    if (theme.isHidden(this.addToCartBtn) && this.klaviyoOOS) {
      this.addToCartBtn.classList.remove('is-hidden')
      this.klaviyoOOS.parentElement.classList.add('is-hidden')
    }

    buttonsArr.forEach(btn => {
      if (!btn) return
      if (!this.selectedVariant) {
        theme.changeBtnState(btn, 'disabled', 'Unavailable')
      } else if (preOrder) {
        theme.changeBtnState(btn, 'active', 'Pre-order')
      } else if (!this.selectedVariant.available) {
        theme.changeBtnState(btn, 'disabled', 'Out Of Stock')
        if (this.klaviyoOOS) this.outOfStock()
      }  else {
        theme.changeBtnState(btn, 'active', 'Add to Cart')
      }
    })
  }

  outOfStock() {
    if (this.stickyAtc) this.stickyAtc.removeAttribute('disabled')
    this.addToCartBtn.classList.add('is-hidden')
    this.klaviyoOOS.parentElement.classList.remove('is-hidden')
  }

  addToCart(e) {
    e.preventDefault()
    const bodyObj = theme.serializeObject(this.form),
        prop = {};
    if (window.theme.product_is_recommended) prop["_recommended_product"] = true
    if (this.select.hasAttribute('data-selected-variant-preorder')) prop["pre-order"] = true
    if (Object.keys(prop).length) bodyObj.properties = prop
    theme.cart.cartEvent('/cart/add.js', bodyObj, true, theme.pdpErrorMessage)
  }

  priceChange() {
    let priceInner =
        `<h2 class="ml1 pdpCopy__header-price">
          ${theme.formatMoney(this.currentPrice, '${{amount}}')}
        </h2>`

    if (this.currentComparePrice > this.currentPrice) {
      priceInner =
          `<div class="pdpCopy__price f aic">
          <span class="strike card__price--regular ml1 pdpCopy__header-price rel pr025">
            ${theme.formatMoney(this.currentComparePrice, '${{amount}}')}
            <div class="price-round-arrow">
              <svg xmlns="http://www.w3.org/2000/svg" width="25" height="14" viewBox="0 0 25 14" fill="none">
                <path d="M21.8717 2.55273L22.064 7.23249L17.2605 7.54226" stroke="black" stroke-width="1.5" 
                stroke-linecap="round" stroke-linejoin="round"></path>
                <path d="M21 6.49951C21 6.49951 16.3627 1.55385 10.0543 3.38802C3.74592 5.22219 1.9372 10.8949 1.9372 10.8949" 
                stroke="black" stroke-width="1.5" stroke-linecap="round"></path>
              </svg>
            </div>
          </span>
          <h2 class="card__price--sale ml1 pdpCopy__header-price">
            ${theme.formatMoney(this.currentPrice, '${{amount}}')}
          </h2>
        </div>`
    }
    this.productPrice.innerHTML = priceInner
  }
}

class ProductCard extends ProductHelper {
  constructor() {
    super();
    this.options = this.querySelector('.productCard__options')
    this.colorSelectors = this.querySelectorAll('.js-color-update input')
    this.productLinks = this.querySelectorAll('.js-product-link')
    this.productView = this.querySelector('.js-product-view')
    this.productPrice = this.querySelector('.productCard__price-wrapper')
    this.variantImages = this.querySelectorAll('.js-variant-image')

   if (this.options) this.options.addEventListener('change', () => this.cardOptionChange())
    if (this.productView) this.productView.addEventListener('click', () => this.quickAdd())
  }

  cardOptionChange() {
    this.currentOpt = this.options.querySelector('input:checked')
    this.currentOptID = this.currentOpt.dataset.variantId
    this.currentOptLink = this.currentOpt.dataset.variantUrl
    this.currentPrice = this.currentOpt.dataset.variantPrice
    this.currentComparePrice = this.currentOpt.dataset.variantComparePrice

    this.colorSelectors.forEach(i => i.classList.remove('active'))
    this.currentOpt.classList.add('active')

    this.priceChange()
    this.cardLinksChange()
    this.cardImageChange()
  }

  cardLinksChange() {
    this.productLinks.forEach(link => {
      link.setAttribute('href', this.currentOptLink);
    })

    if (!this.productView) return
    const searchParam = (!this.currentOptLink.includes('variant=')) ? '?view=quick-view' : '&view=quick-view',
        viewLink = this.currentOptLink + searchParam;
    this.productView.setAttribute('data-quick-view', viewLink);
  }

  cardImageChange() {
    this.currentOptionImage = this.querySelector('.productCard__img [data-variant-id="'+ this.currentOptID +'"]')
    if (!this.currentOptionImage) return
    this.variantImages.forEach(image => image.classList.remove('is-visible'))
    this.currentOptionImage.classList.add('is-visible')
  }

  quickAdd() {
    const quickAddUrl = this.productView.dataset.quickView,
        quickAddModal = document.querySelector('#PopupModal--quick-add'),
        quickAddContent = quickAddModal.querySelector('#modalContent'),
        quickAddSkeleton = quickAddModal.querySelector('#emptyQvModal');

    fetch(quickAddUrl)
        .then(response => response.text())
        .then(html => {
          quickAddSkeleton.classList.add('is-hidden')
          quickAddContent.innerHTML = html
        })
  }
}

customElements.define('product-card', ProductCard);

class ProductQuickView extends ProductHelper {
  constructor() {
    super();
    this.product = JSON.parse(this.querySelector('[type="application/json"]').textContent)
    this.productVariants = this.product['variants']
    this.thumbnails = this.querySelector('.pdpMain__gallery-thumbnails')
    this.gallery = this.querySelector('.pdpMain__gallery-wrapper')
    this.productPrice = this.querySelector('.QuickView__Price')
    this.form = this.querySelector('form')
    this.optionTitles = this.form.querySelectorAll('.option-title-value')
    this.quantity = this.form.querySelector('[name="quantity"]')
    this.sizeOptions = this.form.querySelectorAll('[data-option-size] .radio')
    this.select = this.form.querySelector('.select-wrapper select')
    this.options = this.select.querySelectorAll('option')
    this.radioGroups = Array.from(this.form.querySelectorAll('[data-option-radio]'))
    this.radios = this.form.querySelectorAll('.radio')
    this.addToCartBtn = this.form.querySelector('.js-add-to-cart')

    this.initGallery().then(() => this.quickViewVariantChange())

    this.form.addEventListener('change', () => {
      this.quickViewVariantChange()
    })

    if (this.sizeOptions.length) {
      this.sizeOptions.forEach(radio => radio.addEventListener('click', () => this.checkSizeSelected()))
    }

    this.addToCartBtn.addEventListener('click', (e) => {
      this.addToCart(e)
      this.closest('#PopupModal--quick-add').hide()
    })
  }

  initGallery() {
    return new Promise(resolve => {
      $(this.thumbnails).slick(JSON.parse(this.thumbnails.dataset.slickConfig));
      resolve()
    }).then(() => {
      $(this.gallery).slick(JSON.parse(this.gallery.dataset.slickConfig));
    })
  }

  quickViewVariantChange() {
    this.selectedOptions = this.getOptions()
    this.selectedVariant = this.getSelectedVariant(this.selectedOptions)
    this.currentPrice = this.selectedVariant['price']
    this.currentComparePrice = this.selectedVariant['compare_at_price']
    this.changeSelectedOption()
    this.disableUnavailableVariants()
    this.checkVariantTitle()
    this.priceChange()
    this.toggleAddButton([this.addToCartBtn])
    this.quickViewSlideChange()
  }

  quickViewSlideChange() {
    if (!this.selectedVariant) return
    const currentImage = this.thumbnails.querySelector('[data-variant-img="'+ this.selectedVariant.id +'"]')
    if (currentImage) {
      const index = currentImage.dataset.slickIndex
      $(this.thumbnails).slick('slickGoTo', index)
    }
  }
}

customElements.define('product-quick-view', ProductQuickView);

class MarketplaceCard extends HTMLElement {
  constructor() {
    super()
    this.form = this.querySelector('form')
    this.addToCartBtn = this.querySelector('[data-marketplace-atc]')

    this.addToCartBtn.addEventListener('click', (e)=> this.marketplaceATC(e))
  }

  marketplaceATC(e) {
    e.preventDefault()
    const bodyObj = theme.serializeObject(this.form);
    theme.cart.cartEvent('/cart/add.js', bodyObj, true, theme.pdpErrorMessage)
  }
}

customElements.define('marketplace-card', MarketplaceCard);