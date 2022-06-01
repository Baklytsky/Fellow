class cartDrawer extends HTMLElement {
  constructor() {
    super();
    document.addEventListener('openCart', this.openDrawer.bind(this));
    document.addEventListener('closeCart', this.closeDrawer.bind(this));

    this.openCart = document.querySelectorAll('.js-cart-drawer-toggle');
    this.overlay = document.querySelectorAll('.js-overlay');
    this.closeCart = document.querySelectorAll('.js-close');

    this.openCart.forEach(element => element.addEventListener('click', (evt) => {
      evt.preventDefault();
      document.dispatchEvent(new Event('openCart'));
    }));

    this.overlay.forEach(element => element.addEventListener('click', (evt) => {
      evt.preventDefault();
      document.dispatchEvent(new Event('closeCart'));
    }));

    this.closeCart.forEach(element => element.addEventListener('click', (evt) => {
      evt.preventDefault();
      document.dispatchEvent(new Event('closeCart'));
    }));
  }

  openDrawer () {
    theme.disableScroll()
    this.classList.add('is-active')
    this.setAttribute("aria-pressed", "true")
    this.setAttribute("aria-expanded", "true")
    this.setAttribute("tabindex", "0")
    this.classList.add('is-visible')
  }

  closeDrawer () {
    theme.enableScroll()
    this.classList.remove('is-active', 'is-visible')
    this.setAttribute("aria-pressed", "false")
    this.setAttribute("aria-expanded", "false")
    this.setAttribute("tabindex", "-1")
  }
}

customElements.define('cart-drawer', cartDrawer);

class cartDrawerItem extends HTMLElement {
  constructor() {
    super();
  }
}

customElements.define('cart-drawer-item', cartDrawerItem);