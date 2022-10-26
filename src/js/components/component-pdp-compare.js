class PdpCompare extends HTMLElement {
  constructor() {
    super();
    this.wrapper = this.querySelector('.pdpCompare__wrapper')
    this.tableHead = this.querySelector('.pdpCompare__table thead')
    this.tableBody = this.querySelector('.pdpCompare__table tbody')
    this.tableHeadMobile = this.querySelector('.pdpCompare__table-mobile-title')
    this.th = this.querySelectorAll('.pdpCompare__table .pdpCompare__table-th')
    this.changeTableHeight()
    window.addEventListener('resize', ()=> this.changeTableHeight())
    if (this.tableHeadMobile) this.checkStickyHeadMobile()
  }

  changeTableHeight() {
    this.th.forEach(th => th.style.removeProperty('min-height'))
    const thHeight = this.tableHead.clientHeight - 24;
    this.th.forEach(th => th.style.minHeight = thHeight + 'px')
  }

  checkStickyHeadMobile() {
    window.addEventListener('scroll', ()=> {
      this.tableBodyPosition = this.tableBody.getBoundingClientRect();
      (this.tableBodyPosition.top < 100 && this.tableBodyPosition.bottom > 200)
          ? this.tableHeadMobile.classList.remove('is-hidden')
          : this.tableHeadMobile.classList.add('is-hidden')
    })

    this.wrapper.addEventListener('scroll', (e)=> {
      const translateX = (e.target.scrollLeft > 5) ? e.target.scrollLeft : 0
      this.tableHeadMobile.style.transform = `translateX(-${translateX}px)`
    })
  }
}

customElements.define('pdp-compare', PdpCompare);