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
    this.defaultSortByAction = this.defaultSortBy.value

    this.facetsForm.addEventListener('change', () => this.getSelectedFacets())
    this.clearAll.addEventListener('click', () => this.clearFacets())
  }

  mergeBestSellingAndManual(collectionUrl) {
    const urlArr = [collectionUrl + '?sort_by=best-selling&view=ajax-obj', collectionUrl + '?sort_by=manual&view=ajax']
    return Promise.all(urlArr.map(url => {
      return fetch(`${url}`).then(resp => resp.json())
    })).then(values => {
      values[0].products.forEach(el => {
        const manual_order = values[1].products.find(product => product.id === el.id)['manual_order']
        el.variants.forEach(variant => variant['manual_order'] = manual_order)
        el['manual_order'] = manual_order
      })
      return values[0]
    })
  }

  getSubCollections() {
    this.subCollectionData = []
    const subCollections = JSON.parse(this.subcollections.textContent).subcollections;
    Promise.all(subCollections.map(collection => {
      return this.mergeBestSellingAndManual(collection.url)
          .then(data => {
            const products = data.products;
            let shopByUseNames = this.getSetOfValues(products, ['facets', 'shop_by_use', 'names']),
                sizesNames = this.getSetOfValues(products, ['facets', 'size', 'names']);

            if (collection['hidden_shop_by_use_arr']) {
              shopByUseNames = this.checkHiddenOptions(shopByUseNames, collection['shown_shop_by_use_arr'])
            }
            if (collection['hidden_sizes_arr']) {
              sizesNames = this.checkHiddenOptions(sizesNames, collection['shown_sizes_arr'])
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
                shop_by_use: {
                  names: shopByUseNames,
                  title: collection['shop_by_use_title']
                },
                size: {names: sizesNames},
                custom_filter_1: {
                  names: this.getSetOfValues(products, ['facets', 'custom_filter_1', 'names']),
                  title: collection['custom_filter_1_title'],
                },
                custom_filter_2: {
                  names: this.getSetOfValues(products, ['facets', 'custom_filter_2', 'names']),
                  title: collection['custom_filter_2_title'],
                }
              },
              shop_by_use: {value: this.getSetOfValues(products, ['shop_by_use', 'value'])},
              custom_filter_1: {value: this.getSetOfValues(products, ['custom_filter_1', 'value'])},
              custom_filter_2: {value: this.getSetOfValues(products, ['custom_filter_2', 'value'])},
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

  checkHiddenOptions (optArr, shownOptArr) {
    return optArr.filter(opt => shownOptArr.includes(opt))
  }

  getSetOfValues (arrToReduce, keyArr) {
    return [...new Set(arrToReduce.reduce((arr, item) => {
      let val;
      keyArr.forEach((key, i) => (i === 0) ? val = item[key] : val = val[key])
      return arr.concat(val)
    }, []))]
  }

  getProducts() {
    this.mergeBestSellingAndManual(window.location.pathname).then((data) => {
      this.originalData = data
      if (this.subCollectionData && this.subCollectionData.length) {
        this.originalData['products'].push(...this.subCollectionData)
      }
      this.resetData(data)
      this.renderFacets(this.facets)
      this.facetsForm.style.pointerEvents = 'auto'
      this.resultsCount.innerHTML = (this.template.includes('by-variant'))
          ? `(${this.variants.length})`
          : `(${this.products.length})`
      if (window.location.search) {
        this.parseUrlParams()
      } else {
        this.sortBy(this.data, this.defaultSortByAction)
        this.renderResults(this.data)
      }
      console.log(data)
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
            {title: facets[0].shop_by_use.title, handle: 'shop_by_use', shop_by_use: true, facets: this.getFacetsArr(facets, 'shop_by_use')},
            {title: 'Size', handle: 'size', size: true, facets: this.getFacetsArr(facets, 'size')},
            {title: 'Color', handle: 'color',  color: true, facets: this.getFacetsArr(facets, 'color')}
          ]
        },
        custom_filter_1 = {title: facets[0]['custom_filter_1'].title, handle: 'custom_filter_1', custom_filter_1: true, facets: this.getFacetsArr(facets, 'custom_filter_1')},
        custom_filter_2 = {title: facets[0]['custom_filter_2'].title, handle: 'custom_filter_2', custom_filter_2: true, facets: this.getFacetsArr(facets, 'custom_filter_2')};

    if (facets[0]['custom_filter_1'].title) facetsToRender.facetsArr.splice(1, 0, custom_filter_1)
    if (facets[0]['custom_filter_2'].title) facetsToRender.facetsArr.splice(2, 0, custom_filter_2)

    const facetsSource = this.facetsSourse.innerHTML,
        template = Handlebars.compile(facetsSource);
        this.facetsWrapper.innerHTML = template(facetsToRender)
    this.checkSelectedFacets()
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
    const resultSource = this.resultSourse.innerHTML,
          template = Handlebars.compile(resultSource);
    this.resultWrapper.innerHTML = template({items: data})
    if (typeof window.yotpo !== "undefined") window.yotpo.initWidgets();
    if (this.template.includes('by-product')) {
      this.checkSlideArrows()
      this.showHideScrollArrows()
    }
  }

  getSelectedFacets () {
    const checkedInputs = this.facetsForm.querySelectorAll('.facet-group-wrapper input:checked'),
          facetGroup = this.facetsForm.querySelectorAll('.facet-group'),
          sortByInput = this.facetsForm.querySelector('.facet-header-sort-by input:checked'),
          sortByAction = sortByInput.value;
    this.urlParams = '?sort_by=' + sortByInput.value;

    if (checkedInputs.length) {
      this.clearAll.classList.remove('is-hidden')
      this.selectedFacetsCount.innerHTML = `(${checkedInputs.length})`
    } else {
      this.clearAll.classList.add('is-hidden')
      this.selectedFacetsCount.innerHTML = ''
    }

    let allSelectedVariants = this.variants,
        allSelectedResults = checkedInputs.length ? [] : this.data;

    facetGroup.forEach(group => {
      const groupName = group.getAttribute('data-group-name'),
            groupValues = Array
            .from(group.querySelectorAll('input:checked'))
            .map((input) => input.value);

     if (!groupValues.length) return

      const selectedItems = this.filterResults(this.data, groupName, groupValues)
      if (!this.template.includes('by-product')) {
        allSelectedResults = [...new Set(allSelectedResults.concat(selectedItems))]
      }

      if (this.template.includes('by-product')) {
        const productSelectedVariants = selectedItems.map(product => {
          const productClone = {...product}
          if (!product.bundle) {
            productClone.variants = this.filterResults(productClone.variants, groupName, groupValues)
          }
          return productClone
        })
        allSelectedResults = [...new Set(allSelectedResults.concat([...productSelectedVariants].filter(product => product.variants.length)))]
        allSelectedVariants = allSelectedResults.reduce((arr, product) => arr.concat(product.variants), [])
      }

     const groupValuesStr = groupValues.join('+');
      this.urlParams+= '&' + groupName + '=' + groupValuesStr
    })

    if (this.externalUrlParams && this.externalUrlParams.length) this.urlParams+= '&' + this.externalUrlParams

    this.sortBy(allSelectedResults, sortByAction)
    this.renderResults(allSelectedResults)
    this.resultsCount.innerHTML = (this.template.includes('by-product'))
        ? `(${allSelectedVariants.length || 0})`
        : `(${allSelectedResults.length})`

    if (this.template.includes('default')) {
      const selectedColor = this.facetsForm.querySelector('[data-group-name=color] input:checked')
      if (selectedColor) this.switchColorSwatch(allSelectedResults, selectedColor.value)
    }
    history.replaceState(null, null, this.urlParams)
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

  sortBy(data, sortBy) {
    switch (sortBy) {
      case 'manual':
        data.sort((a, b) => a['manual_order'] - b['manual_order'])
        break
      case 'best-selling':
        data.sort((a, b) => a[sortBy] - b[sortBy])
        break
      case 'price-ascending':
        data.sort((a, b) => a['price'] - b['price'])
        if (this.template.includes('by-product')) {
          data.forEach(product => product.variants.sort((a, b) => a['price'] - b['price']))
        }
        break
      case 'price-descending':
        data.sort((a, b) => b['price'] - a['price'])
        if (this.template.includes('by-product')) {
          data.forEach(product => product.variants.sort((a, b) => b['price'] - a['price']))
        }
        break
      case 'created-descending':
        data.sort((a, b) => new Date(b['date']) - new Date(a['date']))
        break
    }
  }

  parseUrlParams() {
    const facets = [],
          searchParams = new URLSearchParams(window.location.search);
    this.externalUrlParams = ''

    for (let param of searchParams) {
      const [key, value] = param
      const facetsList = [...new Set(this.facets.reduce((accum, item) => [...accum, ...Object.keys(item)], ['sort_by']))]

      if (facetsList.includes(key)) {
        facets.push({
          name: key,
          options: value.split(' ')
        });
      } else {
        this.externalUrlParams+= key + '=' + value.split(' ').join('+')
      }
    }
    
    if (!facets.length) {
      this.sortBy(this.data, this.defaultSortByAction)
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

  checkSlideArrows() {
    this.slideArrows = this.querySelectorAll('[data-slide-action]')
    if (!this.slideArrows.length) return
    this.slideArrows.forEach(arrow => {
      arrow.addEventListener('click', ()=> this.slideRow(arrow))
    })
  }

  slideRow(arrow) {
    const action = arrow.dataset.slideAction,
        wrapper = arrow.closest('.collection__product-item'),
        scrollWidth = wrapper.querySelector('.productCard').offsetWidth,
        target = wrapper.querySelector('.collection__product-variants');
    (action === 'right') ? target.scrollLeft += scrollWidth : target.scrollLeft += -scrollWidth;
  }

  showHideScrollArrows() {
    const productWrappers = this.querySelectorAll('.collection__product-item');
    productWrappers.forEach(wrapper => {
      const leftArrow = wrapper.querySelectorAll('[data-slide-action=left]'),
          rightArrow = wrapper.querySelectorAll('[data-slide-action=right]'),
          variantWrapper = wrapper.querySelector('.collection__product-variants');
      if (!leftArrow || !rightArrow) return
      variantWrapper.addEventListener('scroll', () => {
        (variantWrapper.scrollLeft === variantWrapper.scrollWidth - variantWrapper.clientWidth)
            ? rightArrow.forEach(el => el.classList.add('is-hidden'))
            : rightArrow.forEach(el => el.classList.remove('is-hidden'));

        (variantWrapper.scrollLeft === 0)
            ? leftArrow.forEach(el => el.classList.add('is-hidden'))
            : leftArrow.forEach(el => el.classList.remove('is-hidden'));
      })
    })
  }

  checkSelectedFacets() {
    this.facetsItem = this.facetsForm.querySelectorAll('.facet-group__list-item')

    this.facetsItem.forEach(item => item.addEventListener('click', ()=> {
      const selectedInput = item.querySelector('input'),
          groupInputs = item.closest('.facet-group').querySelectorAll('input')

      if (!selectedInput.checked) {
        groupInputs.forEach(input => {
          if (input !== selectedInput) input.checked = false
        })
      }
    }))
  }

  switchColorSwatch(results, colorGroup) {
    const productsWithSelectedColor = results.filter(product => product.color.value.includes(colorGroup)),
        arrayOfObj = productsWithSelectedColor.map(product => {
      const firstMatchingVariant = product.variants.find(variant => variant.color.value.includes(colorGroup))
      return {
        product_id: product.id,
        variant_id: firstMatchingVariant.id
      }
    });

    arrayOfObj.forEach(obj => {
      const productCard = this.resultWrapper.querySelector('#productCard-'+ obj.product_id +''),
            colorSwatch = productCard.querySelector('input[name="color"][data-variant-id="'+ obj.variant_id +'"]');

      if (colorSwatch) colorSwatch.click()
    })
  }

}

customElements.define('collection-facets', collectionFacets);