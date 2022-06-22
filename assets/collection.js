class collectionFacets extends HTMLElement {
  constructor() {
    super();
    this.getProducts()
    this.facetsWrapper = this.querySelector('#facet-group-wrapper')
    this.facetsSourse = this.querySelector("#facet-group-template")
    this.facetsForm = this.querySelector('#facet-form')
    this.resultWrapper = this.querySelector('#collection__variant-results')
    this.resultSourse = this.querySelector("#collection__variant-template")
    this.clearAll = this.querySelector('[data-clear-facets]')
    this.selectedFacetsCount = this.querySelector('.selected-facets-count')
    this.defaultSortBy = this.querySelector('[data-default-sort-by]')
    this.defaultSortByAction = this.defaultSortBy.title
    this.defaultSortByOrder = this.defaultSortBy.getAttribute('[data-sort-order]')

    this.facetsForm.addEventListener('change', () => this.getSelectedFacets())
    this.clearAll.addEventListener('click', () => this.clearFacets())
    this.facetsForm.style.pointerEvents = 'none'
  }

  getProducts () {
    const url = window.location.pathname + '?sort_by=best-selling&view=ajax'
    fetch(`${url}`)
        .then(resp => {return resp.json()})
        .then(data => {
          this.originalData = data
          this.resetData(data)
          this.renderFacets(this.facets)
          this.sortBy(this.variants, this.defaultSortByAction, this.defaultSortByOrder)
          this.renderVariants(this.variants)
          this.facetsForm.style.removeProperty('pointer-events')
        })
  }

  resetData(data) {
    this.products = data
    this.facets = data.products.map(product => product.facets)
    this.variants = data.products.reduce((arr, product) => arr.concat(product.variants), [])
  }

  clearFacets() {
    this.selectedFacetsCount.innerHTML = ''
    this.clearAll.classList.add('is-hidden')
    this.resetData(this.originalData)
    this.renderFacets(this.facets)
    this.renderVariants(this.variants)
    this.facetsForm.dispatchEvent(new Event('change'))
  }

  renderFacets(facets) {
    const facetsToRender = {
          facetsArr: [
            {title: 'Shop By Use', handle: 'shop_by_use', facets: this.getFacetsArr(facets, 'shop_by_use')},
            {title: 'Size', handle: 'size', facets: this.getFacetsArr(facets, 'sizes')},
            {title: 'Color', handle: 'color',  color: true, facets: this.getFacetsArr(facets, 'color')}
          ]
        },
        facetsSource = this.facetsSourse.innerHTML,
        template = Handlebars.compile(facetsSource);
        this.facetsWrapper.innerHTML = template(facetsToRender)
  }

  getFacetsArr (facets, facetName) {
    let facet = [], allColorHex, uniqHex;
    const allFacetNames = facets.reduce((arr, facet) => arr.concat(facet[facetName].names), []),
          uniqNames = [...new Set(allFacetNames)];

    if (facetName === 'color' ) {
      allColorHex = facets.reduce((arr, facet) => arr.concat(facet[facetName].hex), [])
      uniqHex = [...new Set(allColorHex)];
    }

    uniqNames.forEach((name, i) => {
      if (!name.length) return
      const facetObj = {
        name: name
      };
      if (facetName === 'color') facetObj.hex = uniqHex[i]
      facet.push(facetObj)
    })
    return facet
  }

  renderVariants (variants) {
    const resultSource = this.resultSourse.innerHTML,
          template = Handlebars.compile(resultSource),
          variantsToRender = {
            variants: variants
          };
    this.resultWrapper.innerHTML = template(variantsToRender)
    if (typeof window.yotpo !== "undefined") {
      window.yotpo.initWidgets();
    }
  }

  getSelectedFacets () {
    const checkedInputs = this.facetsForm.querySelectorAll('.facet-group-wrapper input:checked'),
          facetGroup = this.facetsForm.querySelectorAll('.facet-group'),
          sortByInput = this.facetsForm.querySelector('.facet-header-sort-by input:checked'),
          sortByAction = sortByInput.title,
          sortByOrder = sortByInput.getAttribute('data-sort-order');

    if (checkedInputs.length) {
      this.clearAll.classList.remove('is-hidden')
      this.selectedFacetsCount.innerHTML = `(${checkedInputs.length})`
    }

    let allSelectedVariants = this.variants;

    facetGroup.forEach(group => {
      const groupName = group.getAttribute('data-group-name'),
            groupValues = Array
            .from(group.querySelectorAll('input:checked'))
            .map((input) => input.value);

     if (!groupValues.length) return

      const selectedVariants = allSelectedVariants.filter(variant => {
            return variant[groupName].value && groupValues.indexOf(variant[groupName].value) >= 0
          });
      allSelectedVariants = [...selectedVariants]
    })

    this.sortBy(allSelectedVariants, sortByAction, sortByOrder)
    this.renderVariants(allSelectedVariants)
  }

  sortBy (data, sortBy, order) {
    switch (sortBy) {
      case 'best_sellers':
        data.sort((a, b) => a[sortBy] - b[sortBy])
        break
      case 'price':
        if (order === 'ascending') {
          data.sort((a, b) => a[sortBy] - b[sortBy])
        } else {
          data.sort((a, b) => b[sortBy] - a[sortBy])
        }
        break
      case 'random':
        data.sort(() => Math.random() - 0.5)
        break
      case 'inventory':
        if (order === 'ascending') {
          data.sort((a, b) => a[sortBy] - b[sortBy])
        } else {
          data.sort((a, b) => b[sortBy] - a[sortBy])
        }
        break
      case 'date':
        if (order === 'ascending') {
          data.sort((a, b) => new Date(b[sortBy]) -  new Date (a[sortBy]))
        } else {
          data.sort((a, b) => new Date(a[sortBy]) -  new Date (b[sortBy]))
        }
        break
    }
  }

}

customElements.define('collection-facets', collectionFacets);