class collectionFacets extends HTMLElement {
  constructor() {
    super();
    this.subcollections = this.querySelector('[data-subcollections]');
    (this.subcollections) ? this.getSubCollections() : this.getProducts()
    this.template = this.dataset.template
    this.facetsWrapper = this.querySelector('#facet-group-wrapper')
    this.facetsSourse = this.querySelector("#facet-group-template")
    this.facetsForm = this.querySelector('#facet-form')
    this.resultWrapper = this.querySelector('#collection__result-wrapper')
    this.resultSourse = this.querySelector("#collection__result-source")
    this.clearAll = this.querySelector('[data-clear-facets]')
    this.selectedFacetsCount = this.querySelector('.selected-facets-count')
    this.resultsCount = this.querySelector('.facet-header-results-count')
    this.defaultSortBy = this.querySelector('[data-default-sort-by]')
    this.defaultSortByAction = this.defaultSortBy.title
    this.defaultSortByOrder = this.defaultSortBy.getAttribute('data-sort-order')

    this.facetsForm.addEventListener('change', () => this.getSelectedFacets())
    this.clearAll.addEventListener('click', () => this.clearFacets())
  }

  getSubCollections() {
    this.subCollectionData = []
    const subCollections = JSON.parse(this.subcollections.textContent).subcollections;
    Promise.all(subCollections.map(collection => {
      const url = collection.url + '?sort_by=best-selling&view=ajax-obj'
      return fetch(`${url}`)
          .then(resp => {
            return resp.json()
          })
          .then(data => {
            const products = data.products;
            let shopByUseNames = this.getSetOfValues(products, ['facets', 'shop_by_use', 'names']),
                sizesNames = this.getSetOfValues(products, ['facets', 'sizes', 'names']);

            if (collection['hidden_shop_by_use_arr']) {
              shopByUseNames = this.checkHiddenOptions(shopByUseNames, collection['hidden_shop_by_use_arr'])
            }
            if (collection['hidden_sizes_arr']) {
              sizesNames = this.checkHiddenOptions(sizesNames, collection['hidden_sizes_arr'])
            }
            return {
              subCollection: true,
              url: collection.url,
              order: collection.order,
              title: collection.title,
              description: collection.description,
              link_text: collection.link_text,
              facets: {
                color: {
                  hex: this.getSetOfValues(products, ['facets', 'color', 'hex']),
                  names: this.getSetOfValues(products, ['facets', 'color', 'names'])
                },
                shop_by_use: {names: shopByUseNames},
                sizes: {names: sizesNames}
              },
              shop_by_use: {value: this.getSetOfValues(products, ['shop_by_use', 'value'])},
              size: {value: this.getSetOfValues(products, ['size', 'value'])},
              color: {value: this.getSetOfValues(products, ['color', 'value'])},
              variants: data.products.reduce((arr, product) => arr.concat(product.variants), [])
            }
          })
          .then((subCollectionProduct) => {
            this.subCollectionData.push(subCollectionProduct)
          })
    })).then(() => this.getProducts())
  }

  checkHiddenOptions (optArr, hiddenOptArr) {
    return optArr.filter(opt => !hiddenOptArr.includes(opt))
  }

  getSetOfValues (arrToReduce, keyArr) {
    return [...new Set(arrToReduce.reduce((arr, item) => {
      let val;
      keyArr.forEach((key, i) => (i === 0) ? val = item[key] : val = val[key])
      return arr.concat(val)
    }, []))]
  }

  getProducts () {
    const url = window.location.pathname + '?sort_by=best-selling&view=ajax-obj'
    fetch(`${url}`)
        .then(resp => {return resp.json()})
        .then(data => {
          this.originalData = data
          if (this.subCollectionData && this.subCollectionData.length) {
            this.originalData.products.push(...this.subCollectionData)
          }
          this.resetData(data)
          this.renderFacets(this.facets)
          this.facetsForm.style.pointerEvents = 'auto'
          this.resultsCount.innerHTML = `(${this.variants.length})`
          if (window.location.search) {
            this.parseUrlParams()
          } else {
            this.sortBy(this.data, this.defaultSortByAction, this.defaultSortByOrder)
            this.renderResults(this.data)
          }
        })
  }

  resetData(data) {
    this.products = data.products
    this.facets = data.products.map(product => product.facets);
    this.variants = data.products.reduce((arr, product) => arr.concat(product.variants), []);
    this.data = (this.template === 'by-variant') ? this.variants : this.products
  }

  clearFacets() {
    this.selectedFacetsCount.innerHTML = ''
    this.clearAll.classList.add('is-hidden')
    this.resetData(this.originalData)
    this.renderFacets(this.facets)
    this.resultsCount.innerHTML = `(${this.variants.length})`
    this.facetsForm.dispatchEvent(new Event('change'))
    history.replaceState(null, null, '')
  }

  renderFacets(facets) {
    const facetsToRender = {
          facetsArr: [
            {title: 'Shop By Use', handle: 'shop_by_use', shop_by_use: true, facets: this.getFacetsArr(facets, 'shop_by_use')},
            {title: 'Size', handle: 'size', size: true, facets: this.getFacetsArr(facets, 'sizes')},
            {title: 'Color', handle: 'color',  color: true, facets: this.getFacetsArr(facets, 'color')}
          ]
        },
        facetsSource = this.facetsSourse.innerHTML,
        template = Handlebars.compile(facetsSource);
        this.facetsWrapper.innerHTML = template(facetsToRender)
  }

  getFacetsArr (facets, facetName) {
    let facet = [], uniqHex;
    const uniqNames = this.getSetOfValues(facets, [facetName, 'names']);

    if (facetName === 'color' ) {
      uniqHex = this.getSetOfValues(facets, [facetName, 'hex']);
    }

    uniqNames.forEach((name, i) => {
      if (!name.length) return
      const facetObj = {
        name: name,
        value: theme.handleize(name)
      };
      if (facetName === 'color') facetObj.hex = uniqHex[i]
      facet.push(facetObj)
    })
    return facet
  }

  renderResults (data) {
    if (this.subcollections) this.checkSubCollectionOrder(data)
    const resultSource = this.resultSourse.innerHTML,
          template = Handlebars.compile(resultSource);
    this.resultWrapper.innerHTML = template({items: data})
    if (typeof window.yotpo !== "undefined") window.yotpo.initWidgets();
  }

  checkSubCollectionOrder (data) {
    data.forEach((item, i) => {
      if (item['subCollection']) data.splice(item['order'] - 1,0,data.splice(i,1)[0]);
    })
  }

  getSelectedFacets () {
    const checkedInputs = this.facetsForm.querySelectorAll('.facet-group-wrapper input:checked'),
          facetGroup = this.facetsForm.querySelectorAll('.facet-group'),
          sortByInput = this.facetsForm.querySelector('.facet-header-sort-by input:checked'),
          sortByAction = sortByInput.title,
          sortByOrder = sortByInput.getAttribute('data-sort-order');
    let urlParams = '?sort_by=' + sortByInput.value;

    if (checkedInputs.length) {
      this.clearAll.classList.remove('is-hidden')
      this.selectedFacetsCount.innerHTML = `(${checkedInputs.length})`
    } else {
      this.clearAll.classList.add('is-hidden')
      this.selectedFacetsCount.innerHTML = ''
    }

    let allSelectedItems = this.data,
        allSelectedVariants = this.variants;

    facetGroup.forEach(group => {
      const groupName = group.getAttribute('data-group-name'),
            groupValues = Array
            .from(group.querySelectorAll('input:checked'))
            .map((input) => input.value);

     if (!groupValues.length) return

      const selectedItems = this.filterResults(allSelectedItems, groupName, groupValues)
      allSelectedItems = [...selectedItems]

      if (this.template.includes('by-product')) {
        const productSelectedVariants = selectedItems.map(product => {
          const productClone = {...product}
          if (!product.bundle) {
            productClone.variants = this.filterResults(productClone.variants, groupName, groupValues)
          }
          return productClone
        })
        allSelectedItems = [...productSelectedVariants]
        allSelectedVariants = allSelectedItems.reduce((arr, product) => arr.concat(product.variants), []);
      }

     const groupValuesStr = groupValues.join('+');
      urlParams+= '&' + groupName + '=' + groupValuesStr
    })

    this.sortBy(allSelectedItems, sortByAction, sortByOrder)
    this.renderResults(allSelectedItems)
    this.resultsCount.innerHTML = (this.template.includes('by-product'))
        ? `(${allSelectedVariants.length})`
        : `(${allSelectedItems.length})`
    history.replaceState(null, null, urlParams)
  }

  filterResults (items, groupName, groupValues) {
    return items.filter(item => {
      if (typeof item[groupName].value == 'object') {
        return item[groupName].value.some(value => groupValues.indexOf(value) >= 0)
      } else {
        return groupValues.indexOf(item[groupName].value) >= 0
      }
    });
  }

  sortBy (data, sortBy, order) {
    switch (sortBy) {
      case 'best_sellers':
        data.sort((a, b) => a[sortBy] - b[sortBy])
        break
      case 'price':
        if (order === 'ascending') {
          data.sort((a, b) => a[sortBy] - b[sortBy])
          if (this.template.includes('by-product')) {
            data.forEach(product => product.variants.sort((a, b) => a[sortBy] - b[sortBy]))
          }
        } else {
          data.sort((a, b) => b[sortBy] - a[sortBy])
          if (this.template.includes('by-product')) {
            data.forEach(product => product.variants.sort((a, b) => b[sortBy] - a[sortBy]))
          }
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

  parseUrlParams() {
    const facets = [],
          searchParams = new URLSearchParams(window.location.search);

    for (let param of searchParams) {
      const [key, value] = param
      const facetsList = this.facets.reduce((accum, item) => [...accum, ...Object.keys(item)], ['sort_by'])
      
      if (facetsList.includes(key)) {
        facets.push({
          name: key,
          options: value.split(' ')
        });
      }
    }
    
    if (!facets.length) {
      this.sortBy(this.data, this.defaultSortByAction, this.defaultSortByOrder)
      this.renderResults(this.data)
    }
    
    this.selectFacetByParams(facets)
  }

  selectFacetByParams(facets) {
    facets.forEach((facet) => {
      const facetGroup = this.facetsForm.querySelector('[data-group-name="' + facet.name + '"]');
      if (!facetGroup) return

      const facetGroupItems = facetGroup.querySelectorAll('input'),
            facetToSelect = Array.from(facetGroupItems).filter(input => {
              return facet.options.indexOf(input.value) >= 0
            });

      facetToSelect.forEach(input => input.setAttribute('checked', 'checked'));
      this.facetsForm.dispatchEvent(new Event('change'))
    })
  }

}

customElements.define('collection-facets', collectionFacets);