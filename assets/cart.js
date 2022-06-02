class cartDrawer extends HTMLElement {
  constructor() {
    super();
    this.openCart = document.querySelectorAll('.js-cart-drawer-toggle');
    this.closeCart = document.querySelectorAll('.js-close');
    this.overlay = document.getElementById('page-overlay');

    this.openCart.forEach(element => element.addEventListener('click', (e) => {
      e.preventDefault();
      this.openDrawer();
    }));

    this.closeCart.forEach(element => element.addEventListener('click', (e) => {
      e.preventDefault();
      this.closeDrawer();
    }));

    this.overlay.addEventListener('click', (e) => {
      e.preventDefault();
      this.closeDrawer();
    })
  }

  openDrawer () {
    theme.disableScroll()
    this.overlay.classList.add('is-active')
    this.setAttribute("aria-pressed", "true")
    this.setAttribute("aria-expanded", "true")
    this.setAttribute("tabindex", "0")
    this.classList.add('is-visible')
  }

  closeDrawer () {
    theme.enableScroll()
    this.overlay.classList.remove('is-active')
    this.setAttribute("aria-pressed", "false")
    this.setAttribute("aria-expanded", "false")
    this.setAttribute("tabindex", "-1")
    this.classList.remove('is-visible')
  }

  renderContent(responseHtml) {
    const cartContent = document.getElementById('cart-drawer-content');
    const parseDiv = responseHtml.getElementById('cart-drawer-content');
    cartContent.innerHTML = parseDiv.innerHTML;
  }

  updateCart(openDrawer) {
    this.content = this.querySelector('#cart-drawer-content')
    const sectionsId = 'cart-drawer-content'
    const config = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/javascript',
        'X-Requested-With': 'XMLHttpRequest'
      }
    }
    config.body = JSON.stringify({
      sections: sectionsId,
      sections_url: window.location.pathname
    });

    fetch('/cart/update.js', config)
        .then((response) => {
          return response.json();
        })
        .then((json) => {
          console.log(json)
          const newHtml = new DOMParser().parseFromString(json.sections[sectionsId], 'text/html');
          this.renderContent(newHtml)
          if (openDrawer) this.openDrawer()
        })
        .catch((error) => {
          console.error(error);
        })
  }

  cartEvent(url, id, quantity, openDrawer, property) {
    var properties = (property) ? property : {};

    const config = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/javascript',
        'X-Requested-With': 'XMLHttpRequest'
      }
    }

    config.body = JSON.stringify({
      id: id,
      quantity: quantity,
      properties: properties
    });

    fetch(`${url}`, config)
        .then((response) => {
          return response.json();
        })
        .then((json) => {
          console.log(json)
          this.updateCart(openDrawer)
        })
        .catch((error) => {
          console.error(error);
        })
  }
}

customElements.define('cart-drawer', cartDrawer);

class cartDrawerItem extends cartDrawer {
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

    this.removeQtyBtn.addEventListener('click', () => {
      this.quantityInput.value = Number(this.quantityInput.value) - 1
      this.removeQtyBtn.setAttribute('disabled', 'disabled')
      this.changeQuantity()
    })

    this.addQtyBtn.addEventListener('click', () => {
      this.quantityInput.value = Number(this.quantityInput.value) + 1
      this.addQtyBtn.setAttribute('disabled', 'disabled')
      this.changeQuantity()
    })

    this.cartDrwerRemovePopupOpenBtn.addEventListener('click', this.openItemRemovePopup.bind(this))
    this.cartDrwerRemovePopupCloseBtn.addEventListener('click', this.closeItemRemovePopup.bind(this))

    this.cartDrwerRemoveBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (this.cartDrwerRemovePopup.getAttribute('data-gift-product')) {
        localStorage.setItem(this.cartDrwerRemovePopup.getAttribute('data-gift-product'), 'true')
      }
      this.cartEvent('/cart/change.js', this.lineItem.key, 0, true)
      this.closeItemRemovePopup()
    })

  }

  changeQuantity() {
    this.price.classList.add('show-loader')
    this.cartEvent('/cart/change.js', this.lineItem.key, Number(this.quantityInput.value), true)
  }

  openItemRemovePopup() {
    this.cartDrwerRemovePopup.setAttribute('aria-expanded', 'true')
    this.cartDrwerRemovePopup.setAttribute('tabindex', '0')
    document.querySelector('.js-cart-drawer-popup').setAttribute('aria-hidden', 'false');
  }

  closeItemRemovePopup() {
    this.cartDrwerRemovePopup.setAttribute('aria-expanded', 'false')
    this.cartDrwerRemovePopup.setAttribute('tabindex', '1')
    document.querySelector('.js-cart-drawer-popup').setAttribute('aria-hidden', 'true');
  }

}

customElements.define('cart-drawer-item', cartDrawerItem);