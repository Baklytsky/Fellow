class SlideTabSection extends HTMLElement {
  constructor() {
    super();
    this.slider = this.querySelector('.jsSlickSlider')
    this.tabsSwitcher = this.querySelectorAll('.slide-tab__inner-switcher')
    this.tabs = this.querySelectorAll('.slide-tab__inner-tab')

    if (this.slider) {
      this.tabs.forEach(tab => {

        tab.addEventListener('click', (e)=> {
          const slideSize = e.target.dataset.slideSize
          const slideIndex = e.target.dataset.slideIndex
          const switcherPosition = 100 / Number(slideSize) * Number(slideIndex)
          $(this.slider).slick('slickGoTo', slideIndex)
          this.tabsSwitcher.forEach(switcher => {
            switcher.style.left = `${switcherPosition}%`
          })
        })
      })
    }
  }
}

customElements.define('slide-tab-section', SlideTabSection);