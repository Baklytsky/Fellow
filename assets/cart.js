class cartDrawer extends HTMLElement {
  constructor() {
    super();
    theme.cart = document.getElementById('cartDrawer')
    $(document).off('click', '.js-cart-drawer-toggle')
    $(document).off('click', '.js-close')
    $(document).off('click', '.page-overlay')
    $(document).off('click', '.cart-checkout__button')

    $(document).on('click', '.js-cart-drawer-toggle', (e) => {
      e.preventDefault();
      this.openDrawer();
    })

    $(document).on('click', '.js-close, .page-overlay', (e) => {
      e.preventDefault();
      this.closeDrawer();
    })

    $(document).on('click', '.cart-checkout__button', (e) => {
      e.preventDefault();
      this.checkoutEvent()
    })
    this.checkGwpState(this)
  }

  openDrawer () {
    theme.disableScroll()
    document.getElementById('page-overlay').classList.add('is-active')
    this.setAttribute("aria-pressed", "true")
    this.setAttribute("aria-expanded", "true")
    this.setAttribute("tabindex", "0")
    this.classList.add('is-visible')
  }

  closeDrawer () {
    theme.enableScroll()
    document.getElementById('page-overlay').classList.remove('is-active')
    this.setAttribute("aria-pressed", "false")
    this.setAttribute("aria-expanded", "false")
    this.setAttribute("tabindex", "-1")
    this.classList.remove('is-visible')
  }

  checkGwpState(html) {
    let headerDrawer = html.querySelector('#cart-drawer__header')
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

  cartEvent(url, id, quantity, openDrawer, property, errorCallback) {
    property = (property) ? property : {};
    const sectionId = 'cart-drawer-content'

    const config = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/javascript',
        'X-Requested-With': 'XMLHttpRequest'
      }
    }

    if (id) {
      config.body = JSON.stringify({
        id: id,
        quantity: quantity,
        properties: property,
        sections: sectionId,
        sections_url: window.location.pathname
      });
    } else {
      config.body = JSON.stringify({
        sections: sectionId,
        sections_url: window.location.pathname
      });
    }

    fetch(`${url}`, config)
        .then((response) => {
          return response.json()
        })
        .then((json) => {
          console.log(json)
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
  checkoutEvent() {
    let updateData = {},
        addData = [];

    this.getCartState().then((cart) => {
      cart.items.forEach(lineItem => {
        if (lineItem.properties._bundles && lineItem.discounts.length === 0) {
          updateData[`${lineItem.key}`] = 0
          let prop = lineItem.properties;
          delete prop['_bundles']
          delete prop['_Bundle_Name']
          addData.push({
            id: lineItem.variant_id,
            quantity: lineItem.quantity,
            properties: prop
          })
        }
      })
    }).then(() => {
      if ($.isEmptyObject(updateData)) {
        window.location = '/checkout'
      } else {
        $.ajax({
          type: 'POST',
          url: '/cart/update.js',
          data: {
            updates: updateData
          },
          dataType: 'json',
          success: () => {
            $.ajax({
              type: 'post',
              url: '/cart/add.js',
              data: {items: addData},
              dataType: 'json',
              success: () => {
                window.location = '/checkout'
              }
            })
          },
          error: function (err) {
            console.error(err)
            window.location = '/checkout'
          }
        })
      }
    })
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
      theme.cart.cartEvent(this.perObj.action, this.perObj.id, Number(this.perObj.quantity), true)
    }
  }

  gwpEvent(obj, gwpProp) {
    const gwp = JSON.parse(obj.textContent)
    if (gwp.action !== 'false') {
      if (gwp.action === '/cart/add.js' && !localStorage.getItem(gwpProp)) {
        let property = {}
        property[gwpProp] = true
        theme.cart.cartEvent(gwp.action, gwp.id, 1, true, property)
      }
      if (gwp.action === '/cart/change.js') {
        theme.cart.cartEvent(gwp.action, gwp.key, 0, true)
      }
    }
  }

}

customElements.define('cart-drawer-content', cartDrawerContent);

class cartDrawerItem extends HTMLElement {
  constructor() {
    super();
    this.lineItem = JSON.parse(this.querySelector('[type="application/json"]').textContent)
    this.quantityInput = this.querySelector('.js-single-quantity')
    this.removeQtyBtn = this.querySelector('.js-remove-single')
    this.addQtyBtn = this.querySelector('.js-add-single')
    this.price = this.querySelector('.cart-item__price')
    this.cartDrwerRemovePopupOpenBtn = this.querySelector('[data-action="open-item-remove-popup"]')
    this.cartDrwerRemovePopupCloseBtn = this.querySelector('[data-action="close-item-remove-popup"]')
    this.cartDrwerRemoveBtn = this.querySelector('.js-remove-item-trigger')
    this.cartDrwerRemovePopup = this.querySelector('.js-cart-drawer-popup')
    this.addEventListener('input', this.changeQuantity.bind(this))

    if (this.removeQtyBtn) {
      this.removeQtyBtn.addEventListener('click', () => {
        this.quantityInput.value = Number(this.quantityInput.value) - 1
        this.removeQtyBtn.setAttribute('disabled', 'disabled')
        this.changeQuantity()
      })
    }

    if (this.addQtyBtn) {
      this.addQtyBtn.addEventListener('click', () => {
        this.quantityInput.value = Number(this.quantityInput.value) + 1
        this.addQtyBtn.setAttribute('disabled', 'disabled')
        this.changeQuantity()
      })
    }

    if (this.cartDrwerRemovePopupOpenBtn) {
      this.cartDrwerRemovePopupOpenBtn.addEventListener('click', this.openItemRemovePopup.bind(this))
    }

    if (this.cartDrwerRemovePopupCloseBtn) {
      this.cartDrwerRemovePopupCloseBtn.addEventListener('click', this.closeItemRemovePopup.bind(this))
    }

    if (this.cartDrwerRemoveBtn) {
      this.cartDrwerRemoveBtn.addEventListener('click', this.removeItem.bind(this))
    }

  }

  changeQuantity() {
    this.price.classList.add('show-loader')
    if (Number(this.quantityInput.value) === 0
        &&
        this.cartDrwerRemovePopupOpenBtn.getAttribute('data-gift-product')) {
      localStorage.setItem(this.cartDrwerRemovePopupOpenBtn.getAttribute('data-gift-product'), 'true')
    }
    theme.cart.cartEvent('/cart/change.js', this.lineItem.key, Number(this.quantityInput.value), true)
  }

  openItemRemovePopup() {
    this.cartDrwerRemovePopup.setAttribute('aria-expanded', 'true')
    this.cartDrwerRemovePopup.setAttribute('tabindex', '0')
    this.cartDrwerRemovePopup.setAttribute('aria-hidden', 'false');
  }

  closeItemRemovePopup() {
    this.cartDrwerRemovePopup.setAttribute('aria-expanded', 'false')
    this.cartDrwerRemovePopup.setAttribute('tabindex', '1')
    this.cartDrwerRemovePopup.setAttribute('aria-hidden', 'true');
  }

  removeItem(e) {
    e.preventDefault();
    if (this.cartDrwerRemovePopupOpenBtn.getAttribute('data-gift-product')) {
      localStorage.setItem(this.cartDrwerRemovePopupOpenBtn.getAttribute('data-gift-product'), 'true')
    }
    if (this.hasAttribute('data-cart-gift-note')) {
      this.removeGiftNote().then(() => {
        theme.cart.cartEvent('/cart/change.js', this.lineItem.key, 0, true)
      })
    } else {
      theme.cart.cartEvent('/cart/change.js', this.lineItem.key, 0, true)
    }

    this.closeItemRemovePopup()
  }

  removeGiftNote() {
    const config = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/javascript',
        'X-Requested-With': 'XMLHttpRequest'
      }
    }
    config.body = JSON.stringify({
      attributes: {
        'Gift note': '',
      }
    });

    return fetch('/cart/update.js', config).then(() => console.log('Gift note removed'))
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
    const id = this.atcBtn.getAttribute('data-variant-id').split('cart-')[1];
    function errorCallback(error) {
      $('#CartRecommendedErrorMessage').text(error.responseJSON.description).fadeIn('slow');
      setTimeout(function () {$('#CartRecommendedErrorMessage').fadeOut('slow').text('');}, 3500);
    }
    theme.cart.cartEvent('/cart/add.js', id, 1, true, errorCallback)
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

    if (this.addWrappingBtn) this.addWrappingBtn.addEventListener('click', this.changeGiftWrappingNote.bind(this))
    $(document).off('click', '[data-open-gift-note]')
    $(document).off('click', '[data-close-gift-note]')
    $(document).on('click', '[data-open-gift-note]', this.openGiftWrappingModal.bind(this))
    $(document).on('click', '[data-close-gift-note]', this.closeGiftWrappingModal.bind(this))
    this.addEventListener('input', this.checkNoteLength.bind(this))
  }

  openGiftWrappingModal() {
    this.giftWrappingModal.setAttribute('aria-expanded', 'true')
  }

  closeGiftWrappingModal() {
    this.giftWrappingModal.setAttribute('aria-expanded', 'false')
  }

  checkNoteLength() {
    let maxLength = this.noteArea.getAttribute("maxlength"),
        currentLength = this.noteArea.value.length;
    this.noteLength.innerHTML = `${maxLength - currentLength} Characters Remaining`
  }

  changeGiftWrappingNote() {
    const config = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/javascript',
        'X-Requested-With': 'XMLHttpRequest'
      }
    }

    config.body = JSON.stringify({
      attributes: {
        'Gift note': this.noteArea.value,
      }
    });

    fetch('/cart/update.js', config)
        .then((response) => {
          return response.json()
        })
        .then((cart) => {
          console.log(cart)
          let giftBoxInCart = false
          cart.items.forEach((element) => {
            if (element.product_type === 'Gift box') giftBoxInCart = true
          });
          if (!giftBoxInCart) {
            theme.cart.cartEvent('/cart/add.js', window.theme.giftWrapping.giftWrappingProductID, 1, true)
          } else {
            theme.cart.cartEvent('/cart/update.js', false, 0, true)
          }
          this.closeGiftWrappingModal()
        })
        .catch((error) => {
          console.error(error);
        })
  }

}

customElements.define('cart-gift-wrapping', cartGiftWrapping);