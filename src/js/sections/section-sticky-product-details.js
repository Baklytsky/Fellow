class StickyProductDetails extends HTMLElement {
  constructor() {
    super();
    this.element = this.querySelector('.pdpMain__details')
    this.topSpacer = document.getElementById('MainHeader').offsetHeight + 24
    this.lastScrollPosition = window.scrollY
    this.currentScrollPosition = window.scrollY
    this.elementDetails = {}

    if (this.element) {
      this.init()
      document.addEventListener('resize', ()=> this.recalculateHeights())
      document.addEventListener('scroll', ()=> this.updatePosition())
    }
  }

  init () {
    this.recalculateHeights()
    this.updatePosition()
  }

  recalculateHeights() {
    this.viewportHeight = window.innerHeight
    this.startPosition = this.parentElement.getBoundingClientRect().top + window.scrollY
    this.endPosition = this.parentElement.offsetHeight + this.startPosition - this.viewportHeight
    this.elementDetails = {
      height: this.element.offsetHeight,
      position: this.elementDetails.hasOwnProperty('position') ? this.elementDetails.position + 'px' : '0px'
    }
  }

  updatePosition() {
    this.currentScrollPosition = window.scrollY;
    const overflow = this.topSpacer + this.elementDetails.height - this.viewportHeight
    let position = this.elementDetails.position
    position += this.currentScrollPosition - this.lastScrollPosition;
    position = this.currentScrollPosition <= this.startPosition ? 0 : position;
    position = this.currentScrollPosition > this.endPosition ? overflow : position;
    position = Math.abs(position) === position && Math.abs(position) > overflow ? overflow : position;
    position = Math.abs(position) !== position ? 0 : position;
    this.elementDetails.position = position
    this.element.style.top = `${this.topSpacer + position * -1}px`
    this.lastScrollPosition = this.currentScrollPosition
    if (this.element.offsetHeight === this.elementDetails.height) return
    this.elementDetails.height = this.element.offsetHeight
  }
}

customElements.define('sticky-product-details', StickyProductDetails);