class cartDrawer extends HTMLElement {
  constructor() {
    super();
    theme.cart = document.getElementById('cartDrawer')
    this.drawerOverlay = document.getElementById('js-cart-drawer-overlay')
    this.drawerOpener = document.querySelector('.js-cart-drawer-open')

    this.drawerOpener.addEventListener('click', this.openDrawer.bind(this))
    this.drawerOverlay.addEventListener('click', this.closeDrawer.bind(this))

    this.addEventListener('click', (e) => {
      if (e.target.closest('.js-cart-drawer-close')) this.closeDrawer()
      if (e.target.closest('.cart-checkout__button')) this.checkoutEvent(e)
    });
    this.checkGwpState(this)
  }

  openDrawer () {
    const attributes = {
      "aria-pressed": "true",
      "aria-expanded": "true",
      "tabindex": "0"
    }
    theme.disableScroll()
    this.drawerOverlay.classList.add('is-active')
    theme.setAttributes(this, attributes)
    this.classList.add('is-visible')
  }

  closeDrawer () {
    const attributes = {
      "aria-pressed": "false",
      "aria-expanded": "false",
      "tabindex": "-1"
    }
    theme.enableScroll()
    this.drawerOverlay.classList.remove('is-active')
    theme.setAttributes(this, attributes)
    this.classList.remove('is-visible')
  }

  checkGwpState(html) {
    const headerDrawer = html.querySelector('#cart-drawer__header')
    if (localStorage.getItem('_firstGwp') === 'true') headerDrawer.classList.add('hide-gwp-1')
    if (localStorage.getItem('_secondGwp') === 'true') headerDrawer.classList.add('hide-gwp-2')
    if (headerDrawer.hasAttribute('data-cart-empty')) {
      headerDrawer.classList.remove('hide-gwp-1', 'hide-gwp-2')
      if (localStorage.getItem('_firstGwp')) localStorage.removeItem('_firstGwp')
      if (localStorage.getItem('_secondGwp')) localStorage.removeItem('_secondGwp')
    }
  }

  renderContent(responseHtml, sectionId) {
    const cartContent = document.getElementById(sectionId)
    const parseDiv = responseHtml.getElementById(sectionId)
    const cartCount = responseHtml.querySelector('[data-cart-count]').getAttribute('data-cart-count')
    this.checkGwpState(parseDiv)
    cartContent.innerHTML = parseDiv.innerHTML
    document.querySelectorAll('.js-cart-count').forEach(el => el.innerHTML = cartCount)
  }

  // All cart events

  cartEvent(url, bodyObj, openDrawer, errorCallback) {
    const sectionId = 'cart-drawer-content'

    const config = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/javascript',
        'X-Requested-With': 'XMLHttpRequest'
      }
    }
    bodyObj = bodyObj ? bodyObj : {}
    bodyObj.sections = sectionId
    bodyObj.sections_url = window.location.pathname
    config.body = JSON.stringify(bodyObj)

    fetch(`${url}`, config)
        .then((response) => {
          return response.json()
        })
        .then((json) => {
          const responseHtml = new DOMParser().parseFromString(json.sections[sectionId], 'text/html')
          this.renderContent(responseHtml, sectionId)
          if (openDrawer) this.openDrawer()
        })
        .catch((error) => {
          if (errorCallback) errorCallback(error)
          console.error(error);
        })
  }

  getCartState() {
    return fetch('/cart.js')
        .then(response => response.json())
        .then(data => { return data });
  }

  // Remove all bundle properties if the bundle is not full
  checkoutEvent(e) {
    e.preventDefault();
    this.updateObj = this.querySelector('[data-checkout-update]');

      if (!this.updateObj) {
        window.location = '/checkout'
      } else {
        const updateData = {updates: JSON.parse(this.querySelector('[data-checkout-update]').textContent)},
            addData = {items: JSON.parse(this.querySelector('[data-checkout-add]').textContent)};
        let configUpdate, configAdd,
            headers = {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/javascript',
                'X-Requested-With': 'XMLHttpRequest'
              }
            };

        configUpdate = {...headers}
        configAdd = {...headers}

        configUpdate.body = JSON.stringify(updateData)
        configAdd.body = JSON.stringify(addData)

        fetch('/cart/update.js', configUpdate)
            .then(() => {
              fetch('/cart/add.js', configAdd)
                  .then(() => window.location = '/checkout')
                  .catch(() => window.location = '/checkout')
            })
            .catch(() => window.location = '/checkout')
      }
  }
}

customElements.define('cart-drawer', cartDrawer);

class cartDrawerContent extends HTMLElement {
  constructor() {
    super();
    this.personalization = this.querySelector('[data-personalization]')
    this.firstGwp = this.querySelector('[data-first-gwp]')
    this.secondGwp = this.querySelector('[data-second-gwp]')

    if (this.personalization) this.personalizeEvent()
    if (this.firstGwp) this.gwpEvent(this.firstGwp, '_firstGwp')
    if (this.secondGwp) this.gwpEvent(this.secondGwp, '_secondGwp')
  }

  personalizeEvent() {
    this.perObj = JSON.parse(this.personalization.textContent)
    if (this.perObj.available === 'true' && this.perObj.action !== 'false') {
      const bodyObj = {
        id: this.perObj.id,
        quantity: Number(this.perObj.quantity)
      }
      theme.cart.cartEvent(this.perObj.action, bodyObj, true)
    }
  }

  gwpEvent(obj, gwpProp) {
    const gwp = JSON.parse(obj.textContent)
    if (gwp.action === 'false') return
    if (gwp.action === '/cart/add.js' && localStorage.getItem(gwpProp) === 'true') return;
    let properties = {},
        bodyObj = {
          id: gwp.key,
          quantity: 0
        };
    if (gwp.action === '/cart/add.js' && !localStorage.getItem(gwpProp)) {
      properties[gwpProp] = true
      bodyObj = {
        id: gwp.id,
        quantity: 1,
        properties: properties
      }
    }
    theme.cart.cartEvent(gwp.action, bodyObj, true)
  }

}

customElements.define('cart-drawer-content', cartDrawerContent);

class cartDrawerItem extends HTMLElement {
  constructor() {
    super();
    this.lineItem = JSON.parse(this.querySelector('[type="application/json"]').textContent)
    this.quantityInput = this.querySelector('.js-quantity')
    this.price = this.querySelector('.cart-item__price')
    this.drawerOpenItemRemovePopup = this.querySelector('[data-action="open-item-remove-popup"]')
    this.drawerRemoveItemPopup = this.querySelector('.js-cart-drawer-popup')

    if (this.quantityInput) this.quantityInput.addEventListener('change', this.changeQuantity.bind(this))
    this.addEventListener('click', (e) => {
      if (e.target.closest('[data-action="open-item-remove-popup"]')) this.openItemRemovePopup()
      if (e.target.closest('[data-action="close-item-remove-popup"]')) this.closeItemRemovePopup()
      if (e.target.closest('.js-remove-item-trigger')) this.removeItem()
    });
  }

  changeQuantity() {
    this.price.classList.add('show-loader')
    if (Number(this.quantityInput.value) === 0
        &&
        this.drawerOpenItemRemovePopup.getAttribute('data-gift-product')) {
      localStorage.setItem(this.drawerOpenItemRemovePopup.getAttribute('data-gift-product'), 'true')
    }
    const bodyObj = {
      id: this.lineItem.key,
      quantity: Number(this.quantityInput.value)
    }
    theme.cart.cartEvent('/cart/change.js', bodyObj, true)
  }

  openItemRemovePopup() {
    const attrObj = {
      "aria-expanded": "true",
      "aria-hidden": "false",
      "tabindex": '0'
    }
    theme.setAttributes(this.drawerRemoveItemPopup, attrObj)
  }

  closeItemRemovePopup() {
    const attrObj = {
      "aria-expanded": "false",
      "aria-hidden": "true",
      "tabindex": '-1'
    }
    theme.setAttributes(this.drawerRemoveItemPopup, attrObj)
  }

  removeItem() {
    const bodyObj = {
      id: this.lineItem.key,
      quantity: 0
    };
    if (this.drawerOpenItemRemovePopup.getAttribute('data-gift-product')) {
      localStorage.setItem(this.drawerOpenItemRemovePopup.getAttribute('data-gift-product'), 'true')
    }
    if (this.hasAttribute('data-cart-gift-note')) bodyObj.attributes = {'Gift note': ''}
    theme.cart.cartEvent('/cart/change.js', bodyObj, true)

    this.closeItemRemovePopup()
  }

}

customElements.define('cart-drawer-item', cartDrawerItem);

class cartRecommendedProduct extends HTMLElement {
  constructor() {
    super();
    this.radios = this.querySelectorAll('.js-productCard-option')
    this.atcBtn = this.querySelector('[data-action="add-to-cart-recommended"]')

    this.radios.forEach(option => {
      option.addEventListener('click', (e) => {
        e.preventDefault()
        this.atcBtn.setAttribute('data-variant-id', option.getAttribute('data-variant-id'))
      })
    })

    this.atcBtn.addEventListener('click', (e) => {
      this.addRecommendedProduct(e)
    })

    theme.updateSwatches(this)
  }

  addRecommendedProduct(e) {
    e.preventDefault()
    const bodyObj = {
      id: this.atcBtn.getAttribute('data-variant-id'),
      quantity: 1
    };
    function errorCallback(error) {
      const errorMessage = document.querySelector('#CartRecommendedErrorMessage')
      errorMessage.innerHTML = error.responseJSON.description
      errorMessage.style.display = 'block'
      setTimeout(() => {
        errorMessage.style.display = 'none'
        errorMessage.innerHTML = ''
      }, 3500);
    }
    theme.cart.cartEvent('/cart/add.js', bodyObj, true, errorCallback)
  }

}

customElements.define('cart-recommended-product', cartRecommendedProduct);

class cartGiftWrapping extends HTMLElement {
  constructor() {
    super();
    this.giftWrappingModal = this.querySelector('.cart-gift-wrapping-modal')
    this.addWrappingBtn = this.querySelector('[data-add-gift-note]')
    this.noteArea = this.querySelector('#cart-note')
    this.noteLength = this.querySelector('.note-length')
    this.giftBoxInCart = this.getAttribute('data-gift-box-in-cart')

    if (this.addWrappingBtn) this.addWrappingBtn.addEventListener('click', this.changeGiftWrappingNote.bind(this))
    document.addEventListener('click', (e) => {
      if (e.target.closest('[data-gift-note-trigger]')) this.triggerGiftWrappingModal()
    });
    this.addEventListener('input', this.checkNoteLength.bind(this))
  }

  triggerGiftWrappingModal() {
    const wrappingModalStatus = this.giftWrappingModal.getAttribute('aria-expanded'),
        triggerAttr = (wrappingModalStatus === 'false') ? 'true' : 'false';
    this.giftWrappingModal.setAttribute('aria-expanded', triggerAttr)
  }

  checkNoteLength() {
    const maxLength = this.noteArea.getAttribute("maxlength"),
        currentLength = this.noteArea.value.length;
    this.noteLength.innerHTML = `${maxLength - currentLength} Characters Remaining`
  }

  changeGiftWrappingNote() {
    const bodyObj = {
      attributes: {
        'Gift note': this.noteArea.value,
      }
    };

    if (this.giftBoxInCart === 'false') {
      bodyObj.id = window.theme.giftWrapping.giftWrappingProductID
      bodyObj.quantity = 1
      theme.cart.cartEvent('/cart/add.js', bodyObj, true)
    } else {
      theme.cart.cartEvent('/cart/update.js', bodyObj, true)
    }
  }

}

customElements.define('cart-gift-wrapping', cartGiftWrapping);