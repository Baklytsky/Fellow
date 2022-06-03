class cartDrawer extends HTMLElement {
  constructor() {
    super();
    theme.cart = document.getElementById('cartDrawer')

    $(document).on('click', '.js-cart-drawer-toggle', (e) => {
      e.preventDefault();
      this.openDrawer();
    })

    $(document).on('click', '.js-close, .page-overlay', (e) => {
      e.preventDefault();
      this.closeDrawer();
    })
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

  renderContent(responseHtml, sectionId) {
    const cartContent = document.getElementById(sectionId)
    const parseDiv = responseHtml.getElementById(sectionId)
    cartContent.innerHTML = parseDiv.innerHTML
  }

  progressBarState (responseHtml) {
    const progressBar = document.querySelector('.js-shipping-progress-bar')
    const progressStatus = responseHtml.querySelector('.js-shipping-progress-bar').style.width
    if (progressBar) progressBar.style.width = progressStatus;
  }

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
          this.progressBarState(responseHtml)
          setTimeout(() => {
            this.renderContent(responseHtml, sectionId)
            if (openDrawer) this.openDrawer()
          }, 250)
        })
        .catch((error) => {
          if (errorCallback) errorCallback(error)
          console.error(error);
        })
  }
}

customElements.define('cart-drawer', cartDrawer);

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
    if (this.cartDrwerRemovePopup.getAttribute('data-gift-product')) {
      localStorage.setItem(this.cartDrwerRemovePopup.getAttribute('data-gift-product'), 'true')
    }
    theme.cart.cartEvent('/cart/change.js', this.lineItem.key, 0, true)
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
    this.giftWrappingCloseBtn = this.querySelector('[data-close-gift-note]')
    this.giftWrappingModal = this.querySelector('.cart-gift-wrapping-modal')
    this.addWrappingBtn = this.querySelector('[data-add-gift-note]')
    this.noteArea = this.querySelector('#cart-note')
    this.noteLength = this.querySelector('.note-length')

    if (this.giftWrappingCloseBtn) this.giftWrappingCloseBtn.addEventListener('click', this.closeGiftWrappingModal.bind(this))
    if (this.addWrappingBtn) this.addWrappingBtn.addEventListener('click', this.changeGiftWrappingNote.bind(this))
    $(document).on('click', '[data-open-gift-note]', this.openGiftWrappingModal.bind(this))
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