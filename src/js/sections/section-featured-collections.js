class FeaturedCollections extends HTMLElement {
  constructor() {
    super();
    this.tabs = this.querySelectorAll('[data-action="toggle-tab"]')
    this.link = this.querySelector('.FeaturedCollections__CollectionLink')
    this.arrows = this.querySelectorAll('[data-scroll]')

    this.tabs.forEach(tab => {
      tab.addEventListener('click', ()=> this.changeCollectionLink(tab))
    })
    this.arrows.forEach(arrow => {
      arrow.addEventListener('click', ()=> this.scrollArrows(arrow))
    })
  }

  changeCollectionLink(tab) {
    this.link.setAttribute('href', tab.dataset.linkUrl)
    this.link.innerHTML = tab.dataset.linkTitle
  }

  scrollArrows(arrow) {
    const action = arrow.dataset.scroll,
        wrapper = arrow.closest('.FeaturedCollections__ProductsTabs');
    (action === 'next') ? wrapper.scrollLeft = wrapper.offsetWidth : wrapper.scrollLeft = 0;
  }
}

customElements.define('featured-collections', FeaturedCollections);