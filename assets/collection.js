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

    this.facetsForm.addEventListener('change', () => this.getSelectedFacets())
    this.clearAll.addEventListener('click', () => this.clearFacets())
  }

  getProducts () {
    const url = window.location.pathname
    fetch(`${url}?view=ajax`)
        .then(resp => {return resp.json()})
        .then(data => {
          this.products = data
          this.facets = data.products.map(product => product.facets)
          this.variants = data.products.reduce((arr, product) => arr.concat(product.variants), [])
          console.log(this.products)
          this.renderFacets(this.facets)
          this.renderVariants(this.variants)
        })
  }

  clearFacets() {
    this.selectedFacetsCount.innerHTML = ''
    this.renderFacets(this.facets)
    this.renderVariants(this.variants)
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
    console.log(variantsToRender)
    this.resultWrapper.innerHTML = template(variantsToRender)
    if (typeof window.yotpo !== "undefined") {
      window.yotpo.initWidgets();
    }
  }

  getSelectedFacets () {
    const checkedInputs = this.facetsForm.querySelectorAll('.facet-group-wrapper input:checked'),
          facetGroup = this.facetsForm.querySelectorAll('.facet-group');

    if (checkedInputs.length) this.selectedFacetsCount.innerHTML = `(${checkedInputs.length})`
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
    this.renderVariants(allSelectedVariants)
  }

}

customElements.define('collection-facets', collectionFacets);