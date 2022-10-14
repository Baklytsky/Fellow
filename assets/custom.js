theme.changeBtnState = function (btn, state, btnInner) {
  if (!btn) return
    (state === 'active')
        ? btn.removeAttribute('disabled')
        : btn.setAttribute('disabled', 'disabled')
  if (btnInner) btn.innerHTML = btnInner
}

theme.isHidden = function (el) {
  const style = window.getComputedStyle(el);
  return (style.display === 'none' || style.visibility === 'hidden')
}

theme.setAttributes = function (el, attrObj) {
  Object.keys(attrObj).forEach(key => el.setAttribute(key, attrObj[key]));
}

theme.addScripts = function (scriptObj) {
  return Promise.all(Object.keys(scriptObj).map(key => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.type = "text/javascript";
      script.src = scriptObj[key];
      document.getElementsByTagName("body")[0].appendChild(script);
      script.addEventListener('load', () => resolve());
    })
  }))
}

theme.serializeObject = function (form) {
  const formData = new FormData(form),
        bodyObj = {};
  for (const [name, value] of formData) bodyObj[name] = value;
  return bodyObj
}

theme.pdpErrorMessage = function (error) {
  if (error.status === 422) {
    let errorMessage = document.querySelector('.PdpErrorMessage')
    errorMessage.innerHTML = error.responseJSON.description
    errorMessage.style.display = 'block'
    setTimeout(() => {
      errorMessage.style.display = 'none'
      errorMessage.innerHTML = ''
    }, 3500);
  }
}

theme.disableScroll = function () {
  document.body.style.overflow = 'hidden';
}

theme.enableScroll = function () {
  document.body.style.removeProperty('overflow');
}

theme.handleize = function (str) {
  return str.toLowerCase().replace(/[^\w\u00C0-\u024f]+/g, "-").replace(/^-+|-+$/g, "");
};

theme.toggleSlickVideoPlay = function (slider, videoSlides) {
  function togglePlay(firstLoad) {
    videoSlides.each((i, video) => {
      if ($(video).parents('.slick-slide').hasClass('slick-active')) {
        video.play()
      } else {
        if (firstLoad) {
          setTimeout(()=> video.pause(), 500)
        } else {
          video.pause()
        }
      }
    })
  }
  togglePlay(true)

  slider.on('afterChange', (event, slick, currentSlide) => {
    togglePlay(false)
  })
}

theme.toggleSlickArrows = function (slider, prevArrow, nextArrow) {
  slider.on('afterChange', (event, slick, currentSlide) => {
    (currentSlide === 0) ? prevArrow.addClass('is-hidden') : prevArrow.removeClass('is-hidden');
    (currentSlide === slick.slideCount - 1) ? nextArrow.addClass('is-hidden') : nextArrow.removeClass('is-hidden');
  })
}

theme.slickSlider = function () {
  $('[data-section-type="slick-slideshow"]').each(function () {
    const $slider = $(this).find('.jsSlickSlider');
    let config = null;

    if ($(this).attr('data-slick-config')) {
      config = $.parseJSON($(this).attr('data-slick-config'));
      if (config) {
        if (config['arrows']) {
          config.prevArrow = $(this).find('.jsPrevSlide');
          config.nextArrow = $(this).find('.jsNextSlide');
        }
      }
    }

    if ($slider.length) $slider.not('.slick-initialized').slick(config);

    if ($slider[0].hasAttribute('data-toggle-arrows')) {
      const prevArrow = $slider.find('.jsPrevSlide');
      const nextArrow = $slider.find('.jsNextSlide');
      if ($(prevArrow).length && $(nextArrow).length) {
        theme.toggleSlickArrows($slider, $(prevArrow), $(nextArrow))
      }
    }

    const videoSlides = $slider.find('video')
    if (videoSlides.length) theme.toggleSlickVideoPlay($slider, videoSlides)
  });
}

theme.slickSlider()

theme.checkSlickResponse = function (selector, config, response, maxMedia) {
  if (!$(selector).length) return

  function checkSlider() {
    const videoSlides = $(selector).find('video')
    const condition = (maxMedia) ? $(window).width() < response : $(window).width() > response;
    if (condition) {
      const prevArrow = $(selector).parent().find('.jsPrevSlide');
      const nextArrow = $(selector).parent().find('.jsNextSlide');
      if (config['arrows']) {
        if (prevArrow.length) config.prevArrow = prevArrow;
        if (nextArrow.length) config.nextArrow = nextArrow;
      }
      $(selector).not('.slick-initialized').slick(config)

      if ($(selector)[0].hasAttribute('data-toggle-arrows') && $(prevArrow).length && $(prevArrow).length) {
        theme.toggleSlickArrows($(selector), $(prevArrow), $(nextArrow))
      }

      if (videoSlides.length) theme.toggleSlickVideoPlay($(selector), videoSlides)

    } else {
      if ($(selector).hasClass('slick-initialized')) {
        $(selector).slick('unslick')
        if (videoSlides.length) videoSlides.each((i, video) => video.play())
      }
    }
  }

  checkSlider();
  $(window).resize(function () {
    checkSlider();
  });
}

theme.checkAllSlidersResponse = function () {
  const allResponseSliders = document.querySelectorAll('[data-check-slick-response]')
  allResponseSliders.forEach(slider => {
    const sliderAttr = slider.getAttribute('data-check-slick-response');
    if (!sliderAttr) return
    const settings = JSON.parse(sliderAttr);
    theme.checkSlickResponse(settings.selector, settings.config, settings.response, settings.maxMedia)
  })
}

theme.checkAllSlidersResponse()

theme.mutation = function updateProductColors ($targetNode, callback) {
  const config = { attributes: true, childList: true, subtree: true },
      observer = new MutationObserver(callback);
  observer.observe($targetNode, config);
}

theme.formatMoney = function (cents, format) {
  if (typeof cents === 'string') {
    cents = cents.replace('.', '');
  }

  const defaultTo = function(value, defaultValue) {
    return (value == null || value !== value) ? defaultValue : value
  }

  let value = '';
  const placeholderRegex = /\{\{\s*(\w+)\s*\}\}/;
  const formatString = (format || theme.moneyFormat);

  function formatWithDelimiters(number, precision, thousands, decimal) {
    precision = defaultTo(precision, 2);
    thousands = defaultTo(thousands, ',');
    decimal = defaultTo(decimal, '.');

    if (isNaN(number) || number == null) {
      return 0;
    }

    number = (number / 100.0).toFixed(precision);

    const parts = number.split('.');
    const dollarsAmount = parts[0].replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1' + thousands);
    const centsAmount = (parts[1] !== '00') ? (decimal + parts[1]) : '';

    return dollarsAmount + centsAmount;
  }

  switch (formatString.match(placeholderRegex)[1]) {
    case 'amount':
      value = formatWithDelimiters(cents, 2);
      break;
    case 'amount_no_decimals':
      value = formatWithDelimiters(cents, 0);
      break;
    case 'amount_with_comma_separator':
      value = formatWithDelimiters(cents, 2, '.', ',');
      break;
    case 'amount_no_decimals_with_comma_separator':
      value = formatWithDelimiters(cents, 0, '.', ',');
      break;
  }

  return formatString.replace(placeholderRegex, value);
}

theme.headerHeight = function () {
  document.documentElement.style.setProperty('--header-height', document.getElementById('MainHeader').offsetHeight + 'px');
}

theme.slideUp = function (target, duration= 500) {
  target.classList.remove('active')
  target.style.transitionProperty = 'height, margin, padding';
  target.style.transitionDuration = duration + 'ms';
  target.style.boxSizing = 'border-box';
  target.style.height = target.offsetHeight + 'px';
  target.offsetHeight;
  target.style.overflow = 'hidden';
  target.style.height = 0;
  target.style.paddingTop = 0;
  target.style.paddingBottom = 0;
  target.style.marginTop = 0;
  target.style.marginBottom = 0;
  window.setTimeout( () => {
    target.style.display = 'none';
    target.style.removeProperty('height');
    target.style.removeProperty('padding-top');
    target.style.removeProperty('padding-bottom');
    target.style.removeProperty('margin-top');
    target.style.removeProperty('margin-bottom');
    target.style.removeProperty('overflow');
    target.style.removeProperty('transition-duration');
    target.style.removeProperty('transition-property');
  }, duration);
}

theme.slideDown = function (target, duration= 500) {

  target.classList.add('active')
  target.style.removeProperty('display');
  let display = window.getComputedStyle(target).display;
  if (display === 'none') display = 'block';
  target.style.display = display;
  let height = target.offsetHeight;
  target.style.overflow = 'hidden';
  target.style.height = 0;
  target.style.paddingTop = 0;
  target.style.paddingBottom = 0;
  target.style.marginTop = 0;
  target.style.marginBottom = 0;
  target.offsetHeight;
  target.style.boxSizing = 'border-box';
  target.style.transitionProperty = "height, margin, padding";
  target.style.transitionDuration = duration + 'ms';
  target.style.height = height + 'px';
  target.style.removeProperty('padding-top');
  target.style.removeProperty('padding-bottom');
  target.style.removeProperty('margin-top');
  target.style.removeProperty('margin-bottom');
  window.setTimeout( () => {
    target.style.removeProperty('height');
    target.style.removeProperty('overflow');
    target.style.removeProperty('transition-duration');
    target.style.removeProperty('transition-property');
  }, duration);
}

theme.slideToggle = function (target, duration = 250) {
  if (!target.classList.contains('active')) {
    return theme.slideDown(target, duration);
  } else {
    return theme.slideUp(target, duration);
  }
}

theme.objToStrUrlEncode = function(obj) {
  const str = [];
  for (var key in obj) {
    if (obj.hasOwnProperty(key) && typeof obj[key] !== 'undefined') {
      str.push(encodeURIComponent(key) + "=" + encodeURIComponent(obj[key]))
    }
  }
  return str.join('&')
}

theme.klaviyoTrigger = function (form, listID = '') {
  const email = form.querySelector('input[type=email]');
  const phone = form.querySelector('input[type=tel]');

  const data = {
    g: listID,
    '$fields': '$source,$email,$phone,$consent_method',
    '$list_fields': '',
    '$timezone_offset': Math.abs(new Date().getTimezoneOffset() / 60),
    '$source': (form.id) ? form.id : 'Shopify',
    '$email': (email) ? email.value : '',
    '$phone_number': (phone) ? phone.value : '',
    '$consent_method': 'Klaviyo Form',
    '$origin': 'origin'
  }

  return fetch("https://a.klaviyo.com/ajax/subscriptions/subscribe", {
    "headers": {
      "accept": "*/*",
      "accept-language": "en-US,en;q=0.9",
      "content-type": "application/x-www-form-urlencoded",
    },
    "body": theme.objToStrUrlEncode(data),
    "method": "POST",
    "mode": "cors",
    "credentials": "omit"
  }).then(response => response.json())
      .then(response => {
        console.log(response)
      })
      .catch(err => {
        console.error(err)
      });
}

theme.collectionAndSearch = function (isSearchPage) {

  if ($('.collectionFilters').length) {

    if ($('[data-dropdown-filter]').length) {
      $(document).on('keypress.dropdownFilters click.dropdownFilters', '[data-dropdown-filter]', function () {
        if (window.innerWidth > 992) {
          let $dropdownList = $(this).parent().find('[data-dropdown-list]');
          if ($dropdownList.length) {
            $(this).parent().find('[data-dropdown-list]').slideToggle(400);
            $(this).find('.dropdownHeader-icon').toggleClass('dropdownHeader-icon--rotate');
            $(this).parent().find('.dropdownContent--animate-block').toggleClass('dropdownContent--animate-block-visible');
          }
        }
      });

      $(window).on('resize.filter', function () {
        if (window.innerWidth < 992) {
          $('[data-dropdown-list]').map(function (i, element) {
            $(element).parent().find('.dropdownHeader-icon').removeClass('dropdownHeader-icon--rotate')
            $(element).find('.dropdownContent--animate-block-visible').removeClass('dropdownContent--animate-block-visible')
            $(element).removeAttr('style')
          });
        } else {
          $('[data-mobile-dropdown]').removeAttr('style')
        }
      })
    }

    $(document).on('click.mobileFilterBar', '[data-mobile-filter]', function () {
      let $targetFilter = $('[data-mobile-dropdown="' + $(this).data('mobile-filter') + '"]');
      $(this).toggleClass('open-filter')
      $('[data-mobile-filter]:not([data-mobile-filter="' + $(this).data('mobile-filter') + '"])').removeClass('open-filter')
      $('[data-mobile-dropdown]:not([data-mobile-dropdown="' + $(this).data('mobile-filter') + '"])').slideUp(400)
      $targetFilter.slideToggle(400)
    })


    function filterResultsBlock() {
      let $filterFormRadioInput = $(document).find('#filter-form input[type="radio"]'),
          $collectionFilterResults = $(document).find('.collection__products-filter-results');
      if ($filterFormRadioInput.length) {
        $filterFormRadioInput.map(function (index, element) {
          if ($(element).is(':checked')) {
            $('[data-result-type="' + $(element).attr('data-filter-type') + '"]').remove()
            if ($(element).attr('data-filter-type') === 'Color') {
              $collectionFilterResults.append(
                  `<span class="filter-result f aic" data-result-type="${$(element).attr('data-filter-type')}">
                  <span class="filter-group-circle f aic jcc rel" data-color="${$(element).attr('data-color')}"></span>
                  ${$(element).attr('title')}
                  <span class="filter-result-close"></span>
                </span>`)
            } else {
              $collectionFilterResults.append(
                  `<span class="filter-result f aic" data-result-type="${$(element).attr('data-filter-type')}">
                  ${$(element).attr('title')}
                  <span class="filter-result-close"></span>
                </span>`)
            }
          }
        })
      }
    }

    filterResultsBlock()

    function filterResults() {
      let $filterForm = $(document).find('#filter-form'),
          $collectionProducts = $(document).find('.collection__products-results'),
          $filterFormInput = $filterForm.find('input'),
          $filterPriceRange = $filterForm.find('.filter-group__price-range-to input'),
          $filterPriceMin = $filterForm.find('.filter-group__price-range-min-value'),
          formData = $filterForm.serialize(),
          url = window.location.protocol + '//' + window.location.host + window.location.pathname + '?view=ajax&' + formData,
          $noResultsMessage = `<h3 class="collection__products-no-results">No results</h3>`;

        if (isSearchPage) {
          var urlSearchParams = new URLSearchParams(window.location.search);
          var params = Object.fromEntries(urlSearchParams.entries());
          var queryKey = params.q;

          if (queryKey.length) {
            url = window.location.protocol + '//' + window.location.host + window.location.pathname + '?q=' + queryKey + '&options%5Bprefix%5D=last&resources[options][unavailable_products]=hide&' + formData;
          }
        }

      $filterFormInput.attr('disabled', 'true');
      filterResultsBlock()

      $.ajax({
        url: url,
        method: 'GET',
        success: function (data) {
          let $collectionNewProducts = $(data).find('.collection__products-results'),
              $filterNewPriceMin = $(data).find('.filter-group__price-range-min-value').html();
          ($collectionNewProducts.find('.productCard').length) ? $collectionProducts.html($collectionNewProducts.html()) : $collectionProducts.html($noResultsMessage);
          $filterPriceRange.prop({
            'min': $filterNewPriceMin.trim()
          });
          $filterPriceMin.html($filterNewPriceMin)
          $filterFormInput.removeAttr('disabled')
          if (typeof window.yotpo !== "undefined") {
            window.yotpo.initWidgets();
          }
          $('.productCard').each(function () {
            theme.updateSwatches($(this)[0])
          })
        }
      });
    }

    $(document).on('click.deleteFilterResult', '.filter-result-close', function () {
      $('[data-filter-type="' + $(this).parent().attr('data-result-type') + '"]').removeAttr('checked')
      $(this).parent().remove()
      filterResults()
    })

    $(document).on('change.inputFilters', '#filter-form input', function () {
      filterResults()
      $(this).parents('ul').find('.filter-group__list-item').removeClass('active-input')
      $(this).parents('.filter-group__list-item').addClass('active-input')

      if ($('.filter-group-custom input:checked').length) {
        $('[data-mobile-filter="custom"] span').html(`<span class="filter-counter">(${$('.filter-group-custom input:checked').length})</span>`)
      } else {
        $('[data-mobile-filter="custom"] span').html('')
      }

      let $filterPriceRange = $(document).find('.filter-group__price-range-to input'),
          $filterPriceMax = $(document).find('.filter-group__price-range-max-value'),
          checkedInputs = $(document).find('#filter-form input:checked').length,
          rangeValueChanged = (parseInt($filterPriceRange.attr('max')) !== parseInt($filterPriceMax.text()));
      (checkedInputs || rangeValueChanged) ? $('[data-clear-filter]').show() : $('[data-clear-filter]').hide()
    })

    $(document).on('input.changeRange', '#filter-form input[type="range"]', function () {
      let $filterPriceMax = $(document).find('.filter-group__price-range-max-value');
      $filterPriceMax.html($(this).val() + '.00')
    })

    $(document).on('click.mobileClearAll', '[data-clear-filter]', function () {
      let $collectionContainer = $(document).find('.collectionContainer');
      let url = $(this).data('clear-filter');
      if (isSearchPage) {
        url = window.location.href;
      }

      $.ajax({
        url: url,
        method: 'GET',
        success: function (data) {
          let $collectionNewContainer = $(data).find('.collectionContainer').html();
          $collectionContainer.html($collectionNewContainer);
          if (typeof window.yotpo !== "undefined") {
            window.yotpo.initWidgets();
          }
          $('.productCard').each(function () {
            theme.updateSwatches($(this)[0])
          })
        }
      });
    })
  }
}

theme.searchBar = function () {
  var $searchBar = $('.headerSearch'),
      $searchInput = $('.headerSearch__input'),
      $searchBarToggle = $('[data-action="toggle-search"]'),
      $searchResultWrapper = $('.headerSearch__results'),
      $popularSearches = $('.headerSearch__popularSearches'),
      $searchResultContent = $('.headerSearch__resultsContent'),
      $searchPopular = $searchBar.find('.search__popular'),
      $searchEmpty = $('.headerSearch__emptyResults'),
      $resultsWrapper = $('.headerSearch__resultsHeader'),
      $resetBtn = $('.headerSearch__resetLabel');

  // function toggleSearch () {
  //   if ($searchBar.attr('aria-hidden') === 'false') {
  //     theme.closeSearch();
  //   } else {
  //     openSearch();
  //   }
  // }

  theme.closeSearch = function () {
    $searchBar.attr('aria-hidden', 'true');
    $searchBar.slideUp(0);
    $searchBarToggle.attr('aria-expanded', 'false');
    $searchBar.removeClass('loading');
  }

  // function openSearch () {
  //   $searchBar.attr('aria-hidden', 'false');
  //   $searchBar.slideDown(200);
  //   $searchBarToggle.attr('aria-expanded', 'true');
  //   inputFocus();
  // }

  function inputFocus () {
    setTimeout(function () {
      $searchBar.find('.headerSearch__input').focus();
    }, 100);
  }

  function hidePopularSearch () {
    $popularSearches.hide();
    $searchEmpty.hide();
    $resultsWrapper.show();
    $searchPopular.hide();
  }

  function showPopularSearch () {
    $searchPopular.show();
    $popularSearches.show();
    $resultsWrapper.hide();
    $searchEmpty.show();
  }

  function onInput (event) {
    var _this = $(event.target),
        value = _this.val().trim(),
        queryKey = value.toLowerCase(),
        queryKeyReplace = queryKey.replace(/ /ig, '-');

    $searchBar.addClass('loading');
    $searchResultWrapper.attr('aria-hidden', 'false');
    $searchResultContent.empty();

    if (queryKey.length) {
      $resetBtn.show();
      $searchPopular.hide();


      fetch(`/search/suggest.json?q=${queryKey}&resources[type]=product`)
        .then((response) => response.json())
        .then((suggestions) => {
          const productSuggestions = suggestions.resources.results.products;
          let hiddenItems = 0;
          if (productSuggestions.length > 0) {
            productSuggestions.forEach(function (product) {
              if (product.type !== "Gift product") {
                const productTags = product.tags
                let noSearchTags = [];


                // Make array no search terms
                $.each(productTags,function(index,value){
                  const nosearchTag = value.toLowerCase().replace(/ /ig, '-').split('nosearch-')[1]
                  if (nosearchTag) noSearchTags.push(nosearchTag)
                })

                if (!noSearchTags.includes(queryKeyReplace)) {
                  var productItem = `<li class="headerSearch__item"><a href="${product.url}">${product.title}</a></li>`
                  $searchResultContent.append(productItem);
                } else {
                  ++hiddenItems
                }
              }
            })

            if (hiddenItems === productSuggestions.length) {
              showPopularSearch()
            } else {
              hidePopularSearch()
            }
          } else {
            showPopularSearch()
          }

          $searchBar.removeClass('loading');
        })
        .catch((error) => {
          theme.closeSearch();
          $searchBar.removeClass('loading');
          $searchResultWrapper.attr('aria-hidden', 'true');
        });
    } else {
      $searchBar.removeClass('loading');
      $popularSearches.show();
      $resetBtn.hide();
      $searchPopular.show();
    }

  }

  $(document).on('submit.headerSearchForm', '.headerSearch__form', function (event) {
    event.preventDefault();
    var value = $searchInput.val().trim(),
        queryKey = value.toLowerCase();

    var urlToRedirect = '/search?q=' + queryKey + '&options%5Bprefix%5D=last&type=product';
    window.location.href = urlToRedirect;

  });

  // $(document).on('click.searchBarToggle', '.mobileMenu__link[data-action="toggle-search"]', function (event) {
  //   event.preventDefault();
  //   toggleSearch();
  // });

  // $(document).on('mouseover.searchBarOpen', '#search-bar-button[data-action="toggle-search"]', function (event) {
  //   event.preventDefault();
  //   openSearch();
  //   $('.newHeader__openedBlock[aria-hidden="false"]').slideUp();
  //   $('.newHeader__openedBlock[aria-hidden="false"]').attr('aria-hidden', 'true');
  //   $('.newHeader__link[data-selected="true"]').attr('data-selected', 'false');
  // });

  $(document).on('input.onInput', '.headerSearch__input[type="search"]', $.debounce(250, function (event) {
    onInput(event);
  }))

  $(document).on('click.resetSearch', '.headerSearch__resetLabel, #header-search-reset', function () {
    $searchResultWrapper.attr('aria-hidden', 'true');
    $popularSearches.show();
    $searchResultContent.empty();
    $searchPopular.show();
    $resetBtn.hide();
    $searchEmpty.hide();
    $resultsWrapper.show();
    inputFocus();
  });

  // $(document).on('mousedown.searchBarClose', function (e) {
  //   if (!$searchBar.is(e.target) && $searchBar.has(e.target).length === 0 && $searchBarToggle.has(e.target).length === 0) {
  //     theme.closeSearch();
  //   }
  // })

}

theme.searchPage = function () {
  var $searchInput = $('.searchForm__inputMain');
  var $searchInputReset = $('.searchForm__mainResetLabel');

  function changeDocumentTitle () {
    var resultCount = $(document).find('[data-result-count]').attr('data-result-count');
    var searchTerms = $(document).find('[data-terms]').attr('data-terms');
    document.title = `Search: ${resultCount} results found for "${searchTerms}" – Fellow`;
  }
  changeDocumentTitle();

  function getUrlRequest () {
    var value = $searchInput.val().trim();
    var queryKey = value.toLowerCase();
    var url = '/search?q=' + queryKey + '&options%5Bprefix%5D=last&type=product';

    window.location.href = url;
  }

  $(document).on('click.resetMainSearchInput', '.searchForm__mainResetLabel, #search-reset',  function () {
    $searchInput.removeAttr('value');
    $(this).hide();
    getUrlRequest();
  })

  $(document).on('input.onInputMain', '.searchForm__inputMain[type="search"]', $.debounce(250, function () {
    var value = $(this).val().trim(),
        queryKey = value.replace(" ", "-").toLowerCase();

    (queryKey.length) ? $searchInputReset.show() : $searchInputReset.hide();
  }))

  $(document).on('submit.mainSearchForm', '.searchFormMain', function (event) {
    event.preventDefault();
    getUrlRequest()
  });

}

document.addEventListener("DOMContentLoaded", ()=> {
  if ($('.collection').length || $('.searchMain').length) {
    if ($('.searchMain').length) {
      var isSearchPage = true;
    }
    theme.collectionAndSearch(isSearchPage);
  }

  if ($('.headerSearch').length) theme.searchBar();

  if ($('.searchMain').length) theme.searchPage();

  if ($('form[action^="htpps://www.facebook.com"]').length) {
    $('form[action^="htpps://www.facebook.com"]').attr('aria-hidden', 'true')
  }

  theme.headerHeight();
  window.addEventListener('resize', theme.headerHeight)
})

class dynamicRecommendations extends HTMLElement {
  constructor() {
    super();
    this.productId = this.getAttribute('data-product-id');
    this.limit = this.getAttribute('data-product-limit');
    this.sectionId = this.getAttribute('data-section-id');
    this.recommendationContainer = this.querySelector('[data-product-row]');
    this.recommendUrl = `${window.location.origin}/recommendations/products?product_id=${this.productId}&limit=${this.limit}&section_id=${this.sectionId}`;
    this.loadRecommendations();
  }

  loadRecommendations() {
    fetch(this.recommendUrl)
      .then(response => response.text())
      .then((text) => {
        const html = new DOMParser().parseFromString(text, 'text/html'),
              recommendedContent = html.querySelector('[data-product-row]');
        if (recommendedContent) this.recommendationContainer.innerHTML = recommendedContent.innerHTML;
        //if (typeof window.yotpo !== "undefined") window.yotpo.initWidgets();
        const api = new Yotpo.API(yotpo);
        api.refreshWidgets();
      });
  }
}

customElements.define('dynamic-recommendations', dynamicRecommendations);

class quantityStepper extends HTMLElement {
  constructor() {
    super();
    this.singleStepper = this.getAttribute('data-single-stepper')
    this.quantityInput = this.querySelector('.js-quantity')
    this.minusBtn = this.querySelector('.js-minus')
    this.plusBtn = this.querySelector('.js-plus')

    if (this.minusBtn) this.minusBtn.addEventListener('click', () => this.quantityStepper('minus'))
    if (this.plusBtn) this.plusBtn.addEventListener('click', () => this.quantityStepper('plus'))
    if (this.quantityInput) this.quantityInput.addEventListener('change', () => this.quantityCheck())
  }

  quantityStepper(action) {
    this.quantityInput.value = (action === 'minus')
        ? Number(this.quantityInput.value) - 1
        : Number(this.quantityInput.value) + 1;
    if (this.singleStepper === 'true') this.quantitySingle()
    const evt = new Event('change');
    this.quantityInput.dispatchEvent(evt)
  }

  quantitySingle() {
    theme.changeBtnState(this.minusBtn, 'disabled')
    theme.changeBtnState(this.plusBtn, 'disabled')
  }

  quantityCheck() {
    const min = Number(this.quantityInput.min),
          max = Number(this.quantityInput.max);
    let val = Number(this.quantityInput.value);
    if (max && (val > max)) this.quantityInput.value = max
    if (val < min) this.quantityInput.value = min
  }
}

customElements.define('quantity-stepper', quantityStepper);


class ModalDialog extends HTMLElement {
  constructor() {
    super();
    this.content = this.querySelector('[role="dialog"]')
    this.querySelectorAll('[id^="ModalClose-"]').forEach(el => el.addEventListener(
        'click',
        this.hide.bind(this)
    ));
    this.addEventListener('keyup', (event) => {
      if (event.code.toUpperCase() === 'ESCAPE') this.hide()
    });
    this.addEventListener('click', (event) => {
      if (event.target.nodeName === 'MODAL-DIALOG') this.hide()
    });
  }

  show(opener) {
    const attributes = {
      'tabindex': '0',
      'aria-hidden': 'false'
    }
    this.openedBy = opener
    theme.disableScroll()
    theme.setAttributes(this.content, attributes)
    this.setAttribute('open', '')
    setTimeout(() => this.content.focus(), 500)
  }

  hide() {
    const attributes = {
      'tabindex': '-1',
      'aria-hidden': 'true'
    }
    theme.enableScroll()
    theme.setAttributes(this.content, attributes)
    this.removeAttribute('open')
    this.content.blur()

    if (this.id === 'PopupModal--quick-add') this.closeQuickAdd()
  }

  closeQuickAdd() {
    this.querySelector('#modalContent').innerHTML = ''
    this.querySelector('#emptyQvModal').classList.remove('is-hidden')
  }
}
customElements.define('modal-dialog', ModalDialog);

class ModalOpener extends HTMLElement {
  constructor() {
    super();

    const button = this.querySelector('button');

    if (!button) return;
    button.addEventListener('click', () => {
      const modal = document.querySelector(this.getAttribute('data-modal'));
      if (modal) modal.show(button);
    });
  }
}
customElements.define('modal-opener', ModalOpener);

// Dropdown
class Dropdown extends HTMLElement {
  constructor() {
    super();
    document.addEventListener('click', (e) => this.dropdownToggle(e))
  }

  dropdownToggle(e) {
    if (this.contains(e.target) && !e.target.closest('[data-dropdown-content]')) {
      e.target.closest('[data-dropdown]').classList.toggle('active')
    } else {
      this.classList.remove('active')
    }
  }
}

customElements.define('dropdown-toggle', Dropdown);
// End dropdown

// Slide toggle
class SlideToggle extends HTMLElement {
  constructor() {
    super();
    this.duration = this.dataset.duration || 250;
    this.slideTargetName = this.getAttribute('data-slide-toggle');
    this.slideTarget = document.querySelector('[data-slide-target="'+ this.slideTargetName + '"]')
    if (this.slideTarget) {
      this.addEventListener('click', (e) => {
        e.preventDefault();
        this.classList.toggle('active')
        theme.slideToggle(this.slideTarget, this.duration)
      });
    }
  }
}

customElements.define('slide-toggle', SlideToggle);
// End Slide toggle

// Toggle tabs
class ToggleTabs extends HTMLElement {
  // Required button element: data-selected='true/false'; aria-controls='TAB_ID'; data-action='toggle-tab'
  // Required tab element: data-selected='true/false'; data-tab='TAB_ID'
  constructor() {
    super();
    this.buttons = this.querySelectorAll('[data-action="toggle-tab"]')
    this.tabs = this.querySelectorAll('[data-tab]')

    this.buttons.forEach(button => {
      button.addEventListener('click', ()=> this.toggleTab(button))
    })
  }

  toggleTab(button) {
    if (button.dataset.selected === 'true') return
    const tabId = button.getAttribute('aria-controls'),
          tabToShow = Array.from(this.tabs).find(tab => tab.dataset.tab === tabId);
      this.buttons.forEach(el => el.dataset.selected = 'false')
      this.tabs.forEach(tab => tab.dataset.selected = 'false')
      button.dataset.selected = 'true'
      tabToShow.dataset.selected = 'true'
  }
}

customElements.define('toggle-tabs', ToggleTabs);
// End Toggle tabs

class StickyScrolling extends HTMLElement {
  constructor() {
    super();
    this.element = this.querySelector('.pdpMain__details')
    if (!this.element) return false
    this.topSpacer = document.getElementById('MainHeader').offsetHeight + 24
    this.lastScrollPosition = window.scrollY
    this.currentScrollPosition = window.scrollY
    this.elementDetails = {}

    this.init()
    document.addEventListener('resize', ()=> this.recalculateHeights())
    document.addEventListener('scroll', ()=> this.updatePosition())
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
    this.checkElementHeight()
  }

  checkElementHeight() {
    if (this.element.offsetHeight === this.elementDetails.height) return
    this.elementDetails.height = this.element.offsetHeight
  }
}

customElements.define('sticky-scrolling', StickyScrolling);

class PdpHelper extends HTMLElement {
  constructor() {
    super();
  }

  getSelectedVariant(optionsArr) {
    return this.productVariants.find((variant) => {
      return !variant.options.map((option, index) => {
        let optionValue = option;
        if (optionValue.includes(':')) optionValue = optionValue.split(':')[1].trim();
        return optionsArr[index] === theme.handleize(optionValue);
      }).includes(false);
    });
  }

  getOptions() {
    return this.radioGroups.map((radioGroup) => {
      return Array.from(radioGroup.querySelectorAll('input')).find((radio) => radio.checked).value;
    });
  }

  changeSelectedOption() {
    if (this.selectedVariant) {
      this.select.removeAttribute('data-unavailable')
      this.options.forEach(option => option.removeAttribute('selected'))
      this.selectedOption = this.querySelector(`option[value='${this.selectedVariant.id}']`);
      (this.selectedOption.getAttribute('data-variant-preorder'))
          ? this.selectedOption.parentElement.setAttribute('data-selected-variant-preorder', 'true')
          : this.selectedOption.parentElement.removeAttribute('data-selected-variant-preorder');
      this.selectedOption.setAttribute('selected', 'selected')
      this.select.setAttribute('value', this.selectedVariant.id)
    } else {
      this.select.setAttribute('data-unavailable', 'true')
    }
  }

  disableUnavailableVariants() {
    this.radios.forEach((radio) => radio.classList.remove('unavailable'))
    for (let i = 0; i < this.selectedOptions.length; i++) {
      const groupRadios = this.radioGroups[i].querySelectorAll('.radio input');
      groupRadios.forEach(radio => {
        const options = [...this.selectedOptions]
        options.splice(i,1, radio.value)
        if (!this.getSelectedVariant(options)) radio.parentElement.classList.add('unavailable');
      })
    }
  }

  checkVariantTitle() {
    this.optionTitles.forEach(title => title.innerHTML = '')
    this.checkedOptions = this.form.querySelectorAll('input:checked')
    this.checkedOptions.forEach((option) => {
      const optionGroup = option.closest('.option-groups__item'),
          optionSingle = option.closest('.pdp__options-item'),
          optionSelector = (optionGroup) ? optionGroup : optionSingle,
          optionTitle = optionSelector.querySelector('.option-title-value');
      if (optionTitle) optionTitle.innerHTML = `${option.title}`
    })
  }

  checkSizeSelected() {
    if (this.sizeSelected) return
    this.querySelectorAll('[data-disabled-size="true"]').forEach(el => {
      el.removeAttribute('data-disabled-size')
    })
    if (this.personalizeBtn) this.personalizeBtn.querySelector('.customize-btn').style.display = 'block'
    this.sizeSelected = true
  }

  toggleAddButton(buttonsArr) {
    const preOrder = this.select.hasAttribute('data-selected-variant-preorder');

    if (theme.isHidden(this.atc) && this.klaviyoOOS) {
      this.atc.classList.remove('is-hidden')
      this.klaviyoOOS.parentElement.classList.add('is-hidden')
    }

    buttonsArr.forEach(btn => {
      if (!btn) return
      if (!this.selectedVariant) {
        theme.changeBtnState(btn, 'disabled', 'Unavailable')
      } else if (preOrder) {
        theme.changeBtnState(btn, 'active', 'Pre-order')
      } else if (!this.selectedVariant.available) {
        theme.changeBtnState(btn, 'disabled', 'Out Of Stock')
        if (this.klaviyoOOS) this.outOfStock()
      }  else {
        theme.changeBtnState(btn, 'active', 'Add to Cart')
      }
    })
  }

  outOfStock() {
    if (this.stickyAtc) this.stickyAtc.removeAttribute('disabled')
    this.atc.classList.add('is-hidden')
    this.klaviyoOOS.parentElement.classList.remove('is-hidden')
  }

  addToCart(e) {
    e.preventDefault()
    const bodyObj = theme.serializeObject(this.form),
        prop = {};
    if (window.theme.product_is_recommended) prop["_recommended_product"] = true
    if (this.select.hasAttribute('data-selected-variant-preorder')) prop["pre-order"] = true
    if (Object.keys(prop).length) bodyObj.properties = prop
    theme.cart.cartEvent('/cart/add.js', bodyObj, true, theme.pdpErrorMessage)
  }

  priceChange() {
    let priceInner =
        `<h2 class="ml1 pdpCopy__header-price">
          ${theme.formatMoney(this.currentPrice, '${{amount}}')}
        </h2>`

    if (this.currentComparePrice > this.currentPrice) {
      priceInner =
          `<div class="pdpCopy__price f aic">
          <span class="strike card__price--regular ml1 pdpCopy__header-price rel pr025">
            ${theme.formatMoney(this.currentComparePrice, '${{amount}}')}
            <div class="price-round-arrow">
              <svg xmlns="http://www.w3.org/2000/svg" width="25" height="14" viewBox="0 0 25 14" fill="none">
                <path d="M21.8717 2.55273L22.064 7.23249L17.2605 7.54226" stroke="black" stroke-width="1.5" 
                stroke-linecap="round" stroke-linejoin="round"></path>
                <path d="M21 6.49951C21 6.49951 16.3627 1.55385 10.0543 3.38802C3.74592 5.22219 1.9372 10.8949 1.9372 10.8949" 
                stroke="black" stroke-width="1.5" stroke-linecap="round"></path>
              </svg>
            </div>
          </span>
          <h2 class="card__price--sale ml1 pdpCopy__header-price">
            ${theme.formatMoney(this.currentPrice, '${{amount}}')}
          </h2>
        </div>`
    }
    this.productPrice.innerHTML = priceInner
  }
}
customElements.define('pdp-helper', PdpHelper);

class PdpStickyBar extends PdpHelper {
  constructor() {
    super();
    this.product = window.theme.product
    this.productVariants = this.product['variants']
    this.pdpContainer = this.closest('.pdpMain__container')
    this.radioGroups = this.querySelectorAll('.option-groups')
    this.radios = this.querySelectorAll('.radio')
    this.selectSizeBtn = this.querySelector('.cart__button--select-size')
    this.sizeLabel = this.querySelector('[data-option-label="Size"] .option-title strong')
    this.sizeCheckedLabel = this.querySelector('[data-option-size] label.checked')

    document.addEventListener('scroll', () => this.showStickyBar())
    if (this.selectSizeBtn) {
      this.selectSizeBtn.addEventListener('click', () => this.scrollToTop())
    }
  }

  stickyBarVariantChange(selectedOptions, sizeSelected) {
    this.selectedOptions = selectedOptions
    this.selectedVariant = this.getSelectedVariant(this.selectedOptions)
    this.checkActiveRadios()
    this.disableUnavailableVariants()
    if (sizeSelected) this.changeSizeLabel()
  }

  changeSizeLabel() {
    this.sizeCheckedLabel = this.querySelector('[data-option-size] label.checked')
    this.sizeLabel.innerHTML = this.sizeCheckedLabel.querySelector('input').title
  }

  checkActiveRadios() {
    this.radioGroups.forEach((optionGroup, i) => {
      const groupRadios = optionGroup.querySelectorAll('.radio'),
          checkedRadio = optionGroup.querySelector('[for="' + this.selectedOptions[i] + '"]')
      groupRadios.forEach(radio => radio.classList.remove('checked'))
      checkedRadio.classList.add('checked')
    })
  }

  showStickyBar() {
    const pdpDetailsPosition = this.pdpContainer.getBoundingClientRect();
    (pdpDetailsPosition.bottom < 0)
        ? this.classList.add('show')
        : this.classList.remove('show')
  }

  scrollToTop() {
    if (window.innerWidth < 1200) {
      const topPosition = this.pdpContainer.offsetTop;
      window.scrollTo({ top: topPosition, behavior: 'smooth'});
    }
  }
}

customElements.define('pdp-sticky-bar', PdpStickyBar);

class PdpMain extends PdpHelper {
  constructor() {
    super();
    this.product = window.theme.product
    this.productVariants = this.product['variants']
    this.media = this.querySelector('.pdpMain__Media')
    this.price = this.querySelectorAll('.pdpCopy__price')
    this.form = this.querySelector('.pdpForm')
    this.optionTitles = this.form.querySelectorAll('.option-title-value')
    this.quantity = this.form.querySelector('[name="quantity"]')
    this.sizeOptions = this.form.querySelectorAll('[data-option-size] .radio')
    this.select = this.form.querySelector('.select-wrapper select')
    this.options = this.select.querySelectorAll('option')
    this.radioGroups = Array.from(this.form.querySelectorAll('[data-option-radio]'))
    this.radios = this.form.querySelectorAll('.radio')
    this.atc = this.form.querySelector('.js-add-to-cart')
    this.stickyAtc = this.querySelector('#pdp-sticky-atc')
    this.klaviyoOOS = this.querySelector('.klaviyo-bis-trigger')
    this.stickyBar = this.querySelector('pdp-sticky-bar')
    this.personalizeBtn = this.form.querySelector('.pdpDetails__personalize')
    this.upsell = this.querySelector('.upsell-product')

    this.onVariantChange()

    this.form.addEventListener('change', () => {
      this.onVariantChange()
      this.changeContent()
      this.changeUrl()
    })
    this.atc.addEventListener('click', (e) => this.addToCart(e))
    if (this.stickyAtc) this.stickyAtc.addEventListener('click', (e) => {
      theme.isHidden(this.atc) ? this.klaviyoOOS.click() : this.addToCart(e)
    })
    if (this.sizeOptions.length) {
      this.sizeOptions.forEach(radio => radio.addEventListener('click', () => {
        this.checkSizeSelected()
        if (this.stickyBar) this.stickyBar.stickyBarVariantChange(this.selectedOptions, this.sizeSelected)
      }))
    }
  }

  onVariantChange() {
    this.selectedOptions = this.getOptions()
    this.selectedVariant = this.getSelectedVariant(this.selectedOptions)
    this.changeSelectedOption()
    this.disableUnavailableVariants()
    this.checkVariantTitle()
    this.toggleAddButton([this.atc, this.stickyAtc])
    if (this.personalizeBtn) this.setVariantForPersonalize()
    if (this.stickyBar) this.stickyBar.stickyBarVariantChange(this.selectedOptions, this.sizeSelected)
  }

  changeUrl() {
    if (!this.selectedVariant) return;
    window.history.replaceState({}, '', `${window.location.origin}/products/${this.product.handle}?variant=${this.selectedVariant.id}`);
  }

  setVariantForPersonalize() {
    window.localStorage.setItem('changeVariant', 'true');
    window.localStorage.setItem('variantId', this.selectedVariant.id);
  }

  changeContent() {
    if (!this.selectedVariant) return;
    fetch(window.location.origin + window.location.pathname + '?variant=' + this.selectedVariant.id + '&view=ajax-media')
        .then(response => response.text())
        .then(data => {
          const html = new DOMParser().parseFromString(data, 'text/html')
          this.media.innerHTML = html.querySelector('.pdpMain__Media').innerHTML
          this.price.forEach(price => {
            price.innerHTML = html.querySelector('.pdpCopy__price').innerHTML
          })
          const upsell = html.querySelector('.upsell-product')
          this.upsell.innerHTML = (upsell.hasChildNodes()) ? upsell.innerHTML : ''
          theme.slickSlider()
        })
  }
}
customElements.define('pdp-main', PdpMain);

class PdpGallery extends HTMLElement {
  constructor () {
    super()
    this.container = this.closest('.pdpMain__Media')
    this.variantImages = this.querySelectorAll('.pdpMain__variant-image')
    this.thumbnailsGallery = this.querySelectorAll('.pdpMain__gallery-thumbnails')
    this.thumbnails = this.querySelectorAll('.pdpMain__gallery-thumbnails-item')
    this.gallery = this.querySelector('.pdpMain__gallery-wrapper')

    this.mainGallery()
    this.thumbnails.forEach(thumbnail => {
      thumbnail.addEventListener('click', () => this.thumbnailScrollOnClick(thumbnail))
    })
    document.addEventListener('scroll', (e) => {
      if (event.cancelable) e.preventDefault();
      setTimeout(() => this.changeActiveThumbnail(), 400)
    })
  }

  thumbnailScrollOnClick (thumbnail) {
    if (thumbnail.classList.contains('current-thumbnail')) return
    const id = thumbnail.getAttribute('data-variant-img'),
          scrollElement = this.querySelector('[data-variant-media="' + id + '"]'),
          headerHeight = document.getElementById('MainHeader').offsetHeight,
          topPosition = scrollElement.offsetTop + headerHeight;
    window.scrollTo({ top: topPosition, behavior: 'smooth'});
    this.thumbnails.forEach(item => item.classList.remove('current-thumbnail'))
    thumbnail.classList.add('current-thumbnail')
  }

  changeActiveThumbnail() {
    this.variantImages.forEach(image => {
      let imagePosition = image.getBoundingClientRect();
      if (imagePosition.top < 300) {
        const id = image.getAttribute('data-variant-media')
        const thumbnailImage = this.querySelector('[data-variant-img="' + id + '"]')
        let slideIndex = thumbnailImage.dataset.slickIndex
        this.thumbnails.forEach(item => item.classList.remove('current-thumbnail'))
        thumbnailImage.classList.add('current-thumbnail')
        $(this.thumbnailsGallery).slick('slickGoTo', parseInt(slideIndex), true);
      }
    })
  }

  mainGallery() {
    const config = JSON.parse(this.gallery.getAttribute('data-slick-config'))
    theme.checkSlickResponse('.pdpMain__gallery-wrapper', config, 992, true)
  }
}

customElements.define('pdp-gallery', PdpGallery);

class bundleMixCard extends PdpHelper {
  constructor() {
    super();
    this.pdpContainer = this.closest('.pdpMain__container')
    this.product = JSON.parse(this.querySelector('[type="application/json"]').textContent)
    this.productVariants = this.product['variants']
    this.optionTitles = this.querySelectorAll('.option-title-value')
    this.form = this
    this.select = this.querySelector('.select-wrapper select')
    this.options = this.select.querySelectorAll('option')
    this.radioGroups = Array.from(this.querySelectorAll('.bundle-product__option-group'));
    this.radios = this.querySelectorAll('.bundle-radio')
    this.atc = this.pdpContainer.querySelector('.js-pick-mix-add-to-cart')

    this.onCardVariantChange()
    this.addEventListener('change', () => this.onCardVariantChange())
  }

  onCardVariantChange() {
    this.selectedOptions = this.getOptions()
    this.selectedVariant = this.getSelectedVariant(this.selectedOptions)
    this.changeSelectedOption()
    this.disableUnavailableVariants()
    this.checkVariantTitle()
    this.changeBundleMedia()
    this.toggleBundleAddButton()
    this.checkBundlePrice()
  }

  changeBundleMedia() {
    if (!this.selectedVariant) return
    // Change PDP Main Gallery Image
    const mainImageId = this.selectedOption.getAttribute('data-variant-uniq_id'),
          mediaSelector = '[data-variant-media="' + mainImageId + '"]',
          selectedImage = this.pdpContainer.querySelector(mediaSelector);
    this.showImage(selectedImage, 'data-variant-media')
    // Change Bundle Mix Card Image
    const cardImageId = this.selectedVariant.id,
          selectedCardImage = this.querySelector('[data-mix-card-media-id="' + cardImageId + '"]');
    this.showImage(selectedCardImage, 'data-mix-card-media-id')
  }

  showImage(imageToShow, mediaAttr) {
    if (!imageToShow) return
    const imageSelector = `.visible[${mediaAttr}]`,
        visibleImage = imageToShow.parentElement.querySelector(imageSelector);
    if (visibleImage) visibleImage.classList.remove('visible');
    imageToShow.classList.add('visible');
  }

  toggleBundleAddButton() {
    const disabledOptions = this.pdpContainer.querySelectorAll('.js-bundle-variant option:disabled'),
          disabled = Array.from(disabledOptions).filter((i) => i.hasAttribute('selected')),
          unavailable = Array.from(this.pdpContainer.querySelectorAll('.js-bundle-variant select[data-unavailable]')),
          preOrder = Array.from(this.pdpContainer.querySelectorAll('.js-bundle-variant select[data-selected-variant-preorder]'));

    if (unavailable.length) {
      theme.changeBtnState(this.atc, 'disabled', 'Unavailable')
    } else if (preOrder.length) {
      theme.changeBtnState(this.atc, 'active', 'Pre-order')
    } else if (disabled.length) {
      theme.changeBtnState(this.atc, 'disabled', 'Out Of Stock')
    }  else {
      theme.changeBtnState(this.atc, 'active', 'Add to Cart')
    }
  }

  checkBundlePrice() {
    let priceDiffSum = 0;
    const selectedMixVariants = this.pdpContainer.querySelectorAll('.js-bundle-variant option[selected]'),
          priceDiffArray = Array.from(selectedMixVariants).map((variant) => {
            return Number(variant.dataset.bundlePriceDifference)
          });

    priceDiffArray.forEach(priceDiff => priceDiffSum += priceDiff);

    const newCompareAtPrice = (window.theme.product.compare_at_price * 0.01) + priceDiffSum,
          newPrice = (window.theme.product.price * 0.01) + priceDiffSum,
          priceInner = this.pdpContainer.querySelectorAll('[data-product-price]'),
          compareAtPriceInner = this.pdpContainer.querySelectorAll('[data-compare-at-price] span');

    priceInner.forEach(element => element.innerHTML = '$' + newPrice)
    if (compareAtPriceInner.length) {
      compareAtPriceInner.forEach(element => element.innerHTML = '$' + newCompareAtPrice)
    }
  }

}

customElements.define('bundle-mix-card', bundleMixCard);

class bundle extends HTMLElement {
  constructor() {
    super();
    this.pdpContainer = this.closest('.pdpMain')
    this.gallery = this.pdpContainer.querySelector('.pdpMain__bundle-gallery')
    this.atcButton = this.querySelector('.js-pick-mix-add-to-cart');
    this.bundleName = this.atcButton.getAttribute('data-bundle-name');
    this.selects = this.querySelectorAll('.js-bundle-variant .js-select');
    this.atcButton.addEventListener('click', this.addBundle.bind(this));
    this.variantsId = [];
    this.variantsData = [];
    if (this.gallery) this.bundleGallery()
  }

  bundleGallery() {
    const config = JSON.parse(this.gallery.getAttribute('data-slick-config'))
    theme.checkSlickResponse('.pdpMain__bundle-gallery-wrapper', config, 992, true)
  }

  addBundle(e) {
    e.preventDefault();
    this.selects.forEach((select) => {
      const variant_id = select.getAttribute('value');
      this.variantsId.push(variant_id);
    });

    this.variantsId.sort();
    let current = null,
        cnt = 0;
    for (let i = 0; i < this.variantsId.length; i++) {
      if (this.variantsId[i] !== current) {
        if (cnt > 0) this.getProperty(current, cnt)
        current = this.variantsId[i];
        cnt = 1;
      } else {
        cnt++;
      }
    }
    if (cnt > 0) this.getProperty(current, cnt)

    theme.cart.cartEvent('/cart/add.js', {items: this.variantsData}, true, theme.pdpErrorMessage)
  }

  getProperty(current, cnt) {
    const select = this.querySelector('.js-select[value="' + current + '"]')
    const prop = {
      "_bundles": true,
      "_Bundle_Name": this.bundleName
    }

    if (select.hasAttribute('data-selected-variant-preorder')) prop["pre-order"] = true
    if (window.theme.product_is_recommended) prop["_recommended_product"] = true;

    this.variantsData.push({
      quantity: cnt,
      id: current,
      properties: prop
    })
  }
}

customElements.define('bundle-mix', bundle);

class UpsellProduct extends PdpHelper {
  constructor() {
    super();
    this.product = JSON.parse(this.querySelector('[type="application/json"]').textContent)
    this.productVariants = this.product['variants']
    this.optionTitles = this.querySelectorAll('.option-title-value')
    this.form = this
    this.price = this.querySelector('.upsell-product__content-price')
    this.select = this.querySelector('.js-product-upsell-variant select')
    this.options = this.select.querySelectorAll('option')
    this.radioGroups = Array.from(this.querySelectorAll('.upsell-product__option-group'));
    this.radios = this.querySelectorAll('.upsell-radio')
    this.atc = this.querySelector('.js-upsell-add-to-cart')

    this.onUpsellVariantChange()
    this.addEventListener('change', () => this.onUpsellVariantChange())
    this.atc.addEventListener('click', (e) => this.upsellAddToCart(e))
  }

  onUpsellVariantChange() {
    this.selectedOptions = this.getOptions()
    this.selectedVariant = this.getSelectedVariant(this.selectedOptions)
    this.disableUnavailableVariants()
    this.changeUpsellImage()
    this.checkVariantTitle()
    this.changePrice()
    this.changeSelectedOption()
    this.toggleAddButton([this.atc])
  }

  changeUpsellImage() {
    if (!this.selectedVariant) return
    const selectedImage = this.querySelector('[data-upsell-variant-media="' + this.selectedVariant.id + '"]');
    this.querySelector('[data-upsell-variant-media].visible').classList.remove('visible');
    selectedImage.classList.add('visible')
  }

  changePrice() {
    if (!this.selectedVariant) return
    this.price.innerHTML = theme.formatMoney(this.selectedVariant.price, '${{amount}}')
  }

  upsellAddToCart(e) {
    e.preventDefault()
    const bodyObj = {id: this.selectedVariant.id, quantity: 1};
    if (this.select.hasAttribute('data-selected-variant-preorder')) {
      bodyObj.properties = {
        'pre-order': true
      }
    }
    theme.cart.cartEvent('/cart/add.js', bodyObj, true, theme.pdpErrorMessage)
  }

}

customElements.define('upsell-product', UpsellProduct);

class PdpLearnMore extends HTMLElement {
  constructor() {
    super();
    this.items = this.querySelectorAll('.pdpLearnMore__dropdown-link-item')
    this.learnMoreBtn = this.querySelector('.pdpLearnMore__dropdown-view-all')
    if (this.learnMoreBtn) this.learnMoreBtn.addEventListener('click', () => this.showMore())
  }

  showMore() {
    this.items.forEach((item => item.style.removeProperty('display')))
    this.learnMoreBtn.classList.add('is-hidden')
  }
}

customElements.define('pdp-learn-more', PdpLearnMore);

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

class YoutubeVimeoVideo extends HTMLElement {
  constructor() {
    super();
    this.options = JSON.parse(this.dataset.videoOptions);
    if (!this.options['videoType']) return
    this.videoId = this.dataset.videoId
    this.playerWrapper = this.querySelector('.js-video-wrapper')
    this.playerInner = this.querySelector('.js-video-mount')
    this.playBtn = this.querySelector('.js-video-play-button')
    this.loadScript().then(this.setupPlayer.bind(this));

    this.playBtn.addEventListener('click', () => {
      if (this.player.A) this.player.playVideo()
      this.playerWrapper.classList.add('is-playing')
    })
  }

  loadScript() {
    return new Promise((resolve, reject) => {
      var script = document.createElement('script');
      document.body.appendChild(script);
      script.async = true;
      script.src = this.options['videoType'] === 'youtube'
          ? '//www.youtube.com/iframe_api'
          : '//player.vimeo.com/api/player.js';
      script.onload = resolve;
      script.onerror = reject;
    });
  }

  setupPlayer() {
      const playerLoadingInterval = setInterval(() => {
        (this.options['videoType'] === 'youtube')
            ? this.youtubeSetup(playerLoadingInterval)
            : this.vimeoSetup(playerLoadingInterval)
      }, 200)
  }

  youtubeSetup(playerLoadingInterval) {
    window.YT.ready(()=> {
      this.player = new YT.Player(this.playerInner, {
        videoId: this.options['videoId'],
        playerVars: {
          rel: 0,
          height: '100%',
          width: '100%',
          iv_load_policy: 3,
          loop: 1,
          playsinline: 1,
          modestbranding: 1,
          origin: this.options['requestHost']
        },
        events: {
          onReady: this.onPlayerReady()
        }
      });

      clearInterval(playerLoadingInterval);
    })
  }

  vimeoSetup(playerLoadingInterval) {
    if (window.Vimeo) {
      this.player = new Vimeo.Player(this.playerInner.parentNode, {
        id: this.options['videoId'],
        muted: false,
        loop: true
      });

      this.player.ready().then(() => this.onPlayerReady())
      clearInterval(playerLoadingInterval);
    }
  }

  onPlayerReady() {
    this.playerWrapper.classList.add('is-loaded')
  }

}

customElements.define('video-section', YoutubeVimeoVideo);

class MP4Video extends HTMLElement {
  constructor() {
    super();
    this.video = this.querySelector('.media-video')
    this.pauseBtn = this.querySelector('.pause-button')
    this.playBtn = this.querySelector('.play-button')
    this.muteBtn = this.querySelector('.mute-video')

    if (this.playBtn) this.playBtn.addEventListener('click', ()=> this.videoPlay())
    if (this.pauseBtn) this.pauseBtn.addEventListener('click', ()=> this.videoPause())
    if (this.muteBtn) this.muteBtn.addEventListener('click', ()=> this.videoMute())
    if (this.pauseBtn || this.playBtn) this.video.addEventListener('click', (e)=> this.checkVideoState(e))
  }

  checkVideoState(e) {
    e.preventDefault();
    (this.video.paused) ? this.videoPlay() : this.videoPause()
  }

  videoPlay() {
    this.video.play()
    if (this.playBtn) this.playBtn.classList.add('hidden')
    if (this.pauseBtn) this.pauseBtn.classList.remove('hidden')
  }

  videoPause() {
    this.video.pause()
    if (this.playBtn) this.playBtn.classList.remove('hidden')
    if (this.pauseBtn) this.pauseBtn.classList.add('hidden')
  }

  videoMute() {
    const muted = this.video.hasAttribute('muted');
    (muted)
        ? this.video.removeAttribute('muted')
        : this.video.setAttribute('muted', '')
    if (this.muteBtn) this.muteBtn.classList.toggle('unmute-video')
  }
}

customElements.define('mp4-video', MP4Video);

class ProductCard extends PdpHelper {
  constructor() {
    super();
    this.options = this.querySelector('.productCard__options')
    this.colorSelectors = this.querySelectorAll('.js-color-update input')
    this.productLinks = this.querySelectorAll('.js-product-link')
    this.productView = this.querySelector('.js-product-view')
    this.productPrice = this.querySelector('.productCard__price-wrapper')
    this.variantImages = this.querySelectorAll('.js-variant-image')

   if (this.options) this.options.addEventListener('change', () => this.cardOptionChange())
    if (this.productView) this.productView.addEventListener('click', () => this.quickAdd())
  }

  cardOptionChange() {
    this.currentOpt = this.options.querySelector('input:checked')
    this.currentOptID = this.currentOpt.dataset.variantId
    this.currentOptLink = this.currentOpt.dataset.variantUrl
    this.currentPrice = this.currentOpt.dataset.variantPrice
    this.currentComparePrice = this.currentOpt.dataset.variantComparePrice

    this.colorSelectors.forEach(i => i.classList.remove('active'))
    this.currentOpt.classList.add('active')

    this.priceChange()
    this.cardLinksChange()
    this.cardImageChange()
  }

  cardLinksChange() {
    this.productLinks.forEach(link => {
      link.setAttribute('href', this.currentOptLink);
    })

    if (!this.productView) return
    const searchParam = (!this.currentOptLink.includes('variant=')) ? '?view=quick-view' : '&view=quick-view',
        viewLink = this.currentOptLink + searchParam;
    this.productView.setAttribute('data-quick-view', viewLink);
  }

  cardImageChange() {
    this.currentOptionImage = this.querySelector('.productCard__img [data-variant-id="'+ this.currentOptID +'"]')
    if (!this.currentOptionImage) return
    this.variantImages.forEach(image => image.classList.remove('is-visible'))
    this.currentOptionImage.classList.add('is-visible')
  }

  quickAdd() {
    const quickAddUrl = this.productView.dataset.quickView,
        quickAddModal = document.querySelector('#PopupModal--quick-add'),
        quickAddContent = quickAddModal.querySelector('#modalContent'),
        quickAddSkeleton = quickAddModal.querySelector('#emptyQvModal');

    fetch(quickAddUrl)
        .then(response => response.text())
        .then(html => {
          quickAddSkeleton.classList.add('is-hidden')
          quickAddContent.innerHTML = html
        })
  }
}

customElements.define('product-card', ProductCard);

class ProductQuickView extends PdpHelper {
  constructor() {
    super();
    this.product = JSON.parse(this.querySelector('[type="application/json"]').textContent)
    this.productVariants = this.product['variants']
    this.thumbnails = this.querySelector('.pdpMain__gallery-thumbnails')
    this.gallery = this.querySelector('.pdpMain__gallery-wrapper')
    this.productPrice = this.querySelector('.QuickView__Price')
    this.form = this.querySelector('form')
    this.optionTitles = this.form.querySelectorAll('.option-title-value')
    this.quantity = this.form.querySelector('[name="quantity"]')
    this.sizeOptions = this.form.querySelectorAll('[data-option-size] .radio')
    this.select = this.form.querySelector('.select-wrapper select')
    this.options = this.select.querySelectorAll('option')
    this.radioGroups = Array.from(this.form.querySelectorAll('[data-option-radio]'))
    this.radios = this.form.querySelectorAll('.radio')
    this.atc = this.form.querySelector('.js-add-to-cart')

    this.initGallery().then(() => this.quickViewVariantChange())

    this.form.addEventListener('change', () => {
      this.quickViewVariantChange()
    })

    if (this.sizeOptions.length) {
      this.sizeOptions.forEach(radio => radio.addEventListener('click', () => this.checkSizeSelected()))
    }

    this.atc.addEventListener('click', (e) => {
      this.addToCart(e)
      this.closest('#PopupModal--quick-add').hide()
    })
  }

  initGallery() {
    return new Promise(resolve => {
      $(this.thumbnails).slick(JSON.parse(this.thumbnails.dataset.slickConfig));
      resolve()
    }).then(() => {
      $(this.gallery).slick(JSON.parse(this.gallery.dataset.slickConfig));
    })
  }

  quickViewVariantChange() {
    this.selectedOptions = this.getOptions()
    this.selectedVariant = this.getSelectedVariant(this.selectedOptions)
    this.currentPrice = this.selectedVariant['price']
    this.currentComparePrice = this.selectedVariant['compare_at_price']
    this.changeSelectedOption()
    this.disableUnavailableVariants()
    this.checkVariantTitle()
    this.priceChange()
    this.toggleAddButton([this.atc])
    this.quickViewSlideChange()
  }

  quickViewSlideChange() {
    if (!this.selectedVariant) return
    const currentImage = this.thumbnails.querySelector('[data-variant-img="'+ this.selectedVariant.id +'"]')
    if (currentImage) {
      const index = currentImage.dataset.slickIndex
      $(this.thumbnails).slick('slickGoTo', index)
    }
  }
}

customElements.define('product-quick-view', ProductQuickView);

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

class MarketplaceCard extends HTMLElement {
  constructor() {
    super()
    this.form = this.querySelector('form')
    this.atc = this.querySelector('[data-marketplace-atc]')

    this.atc.addEventListener('click', (e)=> this.marketplaceATC(e))
  }

  marketplaceATC(e) {
    e.preventDefault()
    const bodyObj = theme.serializeObject(this.form);
    theme.cart.cartEvent('/cart/add.js', bodyObj, true, theme.pdpErrorMessage)
  }
}

customElements.define('marketplace-card', MarketplaceCard);

class header extends HTMLElement {
  constructor() {
    super()
    this.megamenuWrapper = this.querySelector('.newHeader__openedBlock')
    this.burger = this.querySelector('.burgerMenu')
    this.mobileMenu = this.querySelector('.mobileMenu')
    this.mobileItem = this.querySelectorAll('.mobileMenu__item')
    this.megamenuLinks = this.querySelectorAll('.newHeader__MainLink')
    this.search = this.querySelector('.headerSearch')
    this.searchLink = this.querySelector('#search-bar-button')
    this.mobileSearchBarOpener = this.querySelector('.mobileMenu__link[data-action="toggle-search"]')
    this.timer = this.querySelector('.announcement-bar__timer')

    document.addEventListener('resize', ()=> this.closeMenu())
    this.burger.addEventListener('click', ()=> this.toggleBurger())
    this.addEventListener('mouseleave', ()=> this.closeMenu())

    this.megamenuLinks.forEach(link => {
      link.addEventListener('mouseover', ()=> {
        link.setAttribute('data-mouseover', 'true')
        if (link.hasAttribute('data-target')) {
          this.openMenu(link)
        } else {
          this.closeMenu()
        }
      })
      link.addEventListener('mouseleave', ()=> {
        link.removeAttribute('data-mouseover')
      })
    })

    this.mobileItem.forEach(link => {
      link.addEventListener('click', (e)=> this.toggleMobileMenu(e, link))
    })

    this.mobileSearchBarOpener.addEventListener('click', (e)=> {
      e.preventDefault()
      this.openMobileSearch()
    })

    if (this.timer) this.countdownTimer()
  }

  openMobileSearch() {
    this.search.setAttribute('aria-hidden', 'false');
    theme.slideDown(this.search, 200)
    this.mobileSearchBarOpener.setAttribute('aria-expanded', 'true');
    setTimeout(()=> {
      this.search.querySelector('.headerSearch__input').focus();
    }, 100)
  }

  closeMobileSearch() {
    this.search.setAttribute('aria-hidden', 'true')
    this.mobileSearchBarOpener.setAttribute('aria-expanded', 'false');
  }

  closeMenu() {
    theme.slideUp(this.megamenuWrapper, 200)
    this.megamenuWrapper.setAttribute('aria-hidden', 'true')
    this.megamenuLinks.forEach(link => link.setAttribute('data-selected', 'false'))
  }

  toggleBurger() {
    this.burger.classList.toggle('active')
    this.mobileMenu.classList.toggle('active')
    document.body.classList.toggle('fixed');
    if (!this.burger.classList.contains('active')) {
      this.mobileMenu.querySelectorAll('.active').forEach(el => {
        el.classList.remove('active')
      })
      this.mobileMenu.querySelectorAll('.subMenuList').forEach(el => {
        theme.slideUp(el, 200)
      })
      if (this.search.getAttribute('aria-hidden') === 'false') this.closeMobileSearch()
    }
  }

  openMenu(link) {
    const targetID = link.getAttribute('data-target'),
          target = this.querySelector(`[data-id=${targetID}]`),
          allMenus = this.querySelectorAll('[data-id]');

    if (!target) {
      this.closeMenu()
      return
    }

    allMenus.forEach(menu => menu.dataset.selected = 'false')
    this.megamenuLinks.forEach(link => link.setAttribute('data-selected', 'false'))
    target.setAttribute('data-selected', 'true')

    if (link.hasAttribute('data-mouseover') && this.megamenuWrapper.getAttribute('aria-hidden') !== 'true') {
      link.setAttribute('data-selected', 'true')
    }

    setTimeout(()=> {
      if (link.hasAttribute('data-mouseover') && this.megamenuWrapper.getAttribute('aria-hidden') === 'true') {
        theme.slideDown(this.megamenuWrapper, 200)
        this.megamenuWrapper.setAttribute('aria-hidden', 'false')
        link.setAttribute('data-selected', 'true')
      }
    }, 300)
  }

  toggleMobileMenu(e, link) {
    const menu = link.querySelector('.megaMenu')
    if (!menu) return
    menu.classList.add('active')
    if (e.target.closest('.megaMenu__itemHeading') || e.target.classList.contains('megaMenu__itemHeading')) {
      menu.classList.remove('active')
    }
  }

  countdownTimer() {
    const second = 1000,
        minute = second * 60,
        hour = minute * 60,
        day = hour * 24;

    function timerText(period, periodName) {
      const number = (period < 10) ? '0' + period : period,
          separator = (periodName !== 'seconds') ? ' :' : '',
          text = number + ' ' + periodName + separator;
      return ((number === '00' && periodName === 'days') ? '' : text)
    }

    const endDate = this.timer.dataset.endDate,
        countDown = new Date(endDate).getTime(),
        x = setInterval(() => {

          const now = new Date().getTime(),
              distance = countDown - now,
              days = Math.floor(distance / (day)),
              hours = Math.floor((distance % (day)) / (hour)),
              minutes = Math.floor((distance % (hour)) / (minute)),
              seconds = Math.floor((distance % (minute)) / second);

          this.timer.querySelector('.days').innerHTML = timerText(days, 'days')
          this.timer.querySelector('.hours').innerHTML = timerText(hours, 'hours')
          this.timer.querySelector('.minutes').innerHTML = timerText(minutes, 'minutes')
          this.timer.querySelector('.seconds').innerHTML = timerText(seconds, 'seconds')

          //do something later when date is reached
          if (distance < 0) {
            this.timer.style.display = 'none';
            clearInterval(x);
          }
          //seconds
        }, 1000)
    this.timer.style.visibility = 'visible'
  }
}

customElements.define('header-nav', header);

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

class account extends HTMLElement {
  constructor() {
    super();
    this.breadcrumbs = this.querySelector('.breadcrumbs')
    this.dialog = this.querySelectorAll('[data-dialog]')
    this.toggleDialogBtn = this.querySelectorAll('[data-toggle-dialog]')
    this.inputs = this.querySelectorAll('.input-wrapper')
    this.checkbox = this.querySelectorAll('input[type=checkbox]')
    this.errorMeseges = this.querySelectorAll('.account-error')
    this.toglePassBtn = this.querySelectorAll('[data-togle-pass-visibility]')
    this.forms = this.querySelectorAll('form')
    this.registerForm = this.querySelector('#create_customer')
    if (this.registerForm) this.phoneInput = this.registerForm.querySelector('input[name="customer[Phone]"]')
    this.customerUpdateForm = this.querySelector('#form_update')
    this.customerUpdatePassForm = this.querySelector('#form_update-pass')
    this.customerContactPreferencesForm = this.querySelector('#form_contact-preferences')
    this.deleteAddressBtns = this.querySelectorAll('[data-delete-address]')
    this.toggleAddressBtns = this.querySelectorAll('[data-toggle-address]')
    this.accountPageContent = this.querySelector('[data-account-content]')
    this.sidebarAcoountOverview = this.querySelector('[data-acoount-overview]')

    this.eventListener()
  }

  eventListener () {
    this.toggleDialogBtn.forEach(btn => {
      btn.addEventListener('click', (e)=> {
        e.preventDefault()
        this.toggleDialog(btn)
      })
      if (btn.hasAttribute('data-click-trigger')) btn.click()
    })

    this.inputs.forEach(input => input.addEventListener('keyup', ()=> {
      this.removeErrorStatus(input)
    }))

    if (this.phoneInput) {
      this.phoneInput.addEventListener('change', ()=> {
        window.sessionStorage.setItem("Customer_phone", this.phoneInput.value);
      })
    }

    this.toglePassBtn.forEach(btn => btn.addEventListener('click', (e)=> {
      e.preventDefault()
      this.togglePassVisibility(btn)
    }))

    this.checkbox.forEach(checkbox => checkbox.addEventListener('change', ()=> {
      this.toggleCheckboxState(checkbox)
    }))

    this.forms.forEach(form => {
      form.addEventListener('submit', (e)=> {
        e.preventDefault()
        const KlaviyoCheckboxes = form.querySelectorAll('input[type=checkbox][data-klaviyo-list-id]')
        const checked = Array.from(KlaviyoCheckboxes).map(checkbox => checkbox.value === 'true')
        const phoneInput = form.querySelector('input[type=tel]')

        if (phoneInput) {
          if (!this.phoneValidation(phoneInput)) {
            phoneInput.closest('.input-wrapper').classList.add('input-error')
            return false
          }
        }

        (checked.length) ? this.checkKlaviyoEvents(KlaviyoCheckboxes, form) : form.submit();
      })
    })

    this.deleteAddressBtns.forEach(btn => btn.addEventListener('click', (e)=> {
      e.preventDefault()
      const addressID = btn.getAttribute('data-delete-address')
      this.removeAddress(addressID)
    }))

    this.toggleAddressBtns.forEach(btn => btn.addEventListener('click', (e)=> {
      e.preventDefault()
      const id = btn.getAttribute('data-toggle-address')
      const title = btn.getAttribute('data-breadcrumbs-title')
      this.toggleAddress(id, title)
    }))

    if (this.customerUpdateForm) this.accentureEventListener(this.customerUpdateForm)
    if (this.customerUpdatePassForm) this.accentureEventListener(this.customerUpdatePassForm)
    if (this.customerContactPreferencesForm) this.accentureEventListener(this.customerContactPreferencesForm)

    if (window.location.hash === '#recover') {
      setTimeout(()=> window.scrollTo({top: 0, behavior: 'smooth'}), 0)
    }
  }

  accentureEventListener(form) {
    const _self = this
    const submitBtn = form.querySelector('button[type=submit]')
    const errorsContainer = form.querySelector('.account-error')
    const errorsInner = form.querySelector('.account-error-inner')
    const allInputs = form.querySelectorAll('input')
    const phoneInput = form.querySelector('input[type=tel]')

    Accentuate(jQuery('#' + form.id), function (data) {
      if (phoneInput) {
        if (!_self.phoneValidation(phoneInput)) {
          phoneInput.closest('.input-wrapper').classList.add('input-error')
          return false
        }
      }

      if (data.errors !== undefined) {
        submitBtn.disabled = true;

        if (data.errors.email !== undefined && data.errors.email[0] === 'is invalid') {
          const message = 'Please enter a valid email address.';
          if (errorsInner) errorsInner.innerHTML += message;
          if (errorsContainer) errorsContainer.classList.remove('is-hidden');

        } else if (data.errors.email !== undefined && data.errors.email[0] === 'already has an account') {
          const message = 'This email is already associated with an account';
          if (errorsInner) errorsInner.innerHTML += message;
          if (errorsContainer) errorsContainer.classList.remove('is-hidden');

        } else if (data.errors.email !== undefined && data.errors.email[0] === 'contains an invalid domain name') {
          const message = 'Please enter a valid email address.';
          if (errorsInner) errorsInner.innerHTML += message;
          if (errorsContainer) errorsContainer.classList.remove('is-hidden');

        } else if (data.errors.password !== undefined && data.errors.password[0] === 'is too short (minimum is 5 characters)') {
          const message = 'Your password must be at least 5 characters long';
          if (errorsInner) errorsInner.innerHTML += message;
          if (errorsContainer) errorsContainer.classList.remove('is-hidden');

        } else if (data.errors.password_confirmation !== undefined && data.errors.password_confirmation[0] === 'must match the provided password') {
          const message = 'Password and confirmation password do not match';
          if (errorsInner) errorsInner.innerHTML += message;
          if (errorsContainer) errorsContainer.classList.remove('is-hidden');
        }
      } else if (data.status === "OK") {
        location.reload();
      }
    });

    allInputs.forEach(input => input.addEventListener('keyup', ()=> {
      if (errorsContainer) {
        if (!errorsContainer.classList.contains('is-hidden')) errorsContainer.classList.add('is-hidden')
      }
      if (submitBtn.disabled) submitBtn.removeAttribute('disabled')
    }))
  }

  phoneValidation(phoneInput) {
    const phoneValue = phoneInput.value;
    const re = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im;
    return (phoneValue === '') || re.test(phoneValue)
  }

  checkKlaviyoEvents(KlaviyoCheckboxes, form) {
    Promise.all(Array.from(KlaviyoCheckboxes).map(checkbox => {
      const listID = checkbox.dataset.klaviyoListId || null
      if (checkbox.checked && listID) return theme.klaviyoTrigger(form, listID)
    })).then(() => {
      form.submit()
    })
  }

  toggleDialog(btn) {
    this.dialog.forEach(dialog => {
      (dialog.id === btn.dataset.toggleDialog)
          ? dialog.style.display = 'flex'
          : dialog.style.display = 'none'
    })
  }

  removeErrorStatus (input) {
    if (input.classList.contains('input-error')) {
      this.inputs.forEach(input => input.classList.remove('input-error'))
      this.errorMeseges.forEach(error => error.remove())
    }
  }

  togglePassVisibility (btn) {
    const input = btn.parentElement.querySelector('input')
    btn.classList.toggle('show')
    if (btn.classList.contains('show')) {
      input.type = 'text'
      btn.innerHTML = 'Hide'
    } else {
      input.type = 'password'
      btn.innerHTML = 'Show'
    }
  }

  toggleCheckboxState(checkbox) {
    (checkbox.checked) ? checkbox.value = 'true' : checkbox.value = 'false'
  }

  removeAddress (id) {
    if (!id) return
    const form = document.createElement('form')
    const input = document.createElement('input');

    form.setAttribute('method', 'post')
    form.setAttribute('action', '/account/addresses/' + id)

    input.setAttribute('type', 'hidden')
    input.setAttribute('name', '_method')
    input.setAttribute('value', 'delete')

    form.appendChild(input)

    document.body.appendChild(form)
    form.submit()
    document.body.removeChild(form)
  }

  toggleAddress (id, title) {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });

    const form = document.getElementById('form_' + id)
    form.style.display = form.style.display === 'none' ? '' : 'none'
    this.accountPageContent.style.display = this.accountPageContent.style.display === 'none' ? '' : 'none'
    this.sidebarAcoountOverview.classList.toggle('current-page')

    if (title) {
      const hasBreadcrumbs = this.breadcrumbs.querySelector('[data-breadcrumbs-title="' + title + '"]');
      const breadcrumbsChild = `<li data-breadcrumbs-title="${title}">${title}</li>`;
      (!hasBreadcrumbs)
          ? this.breadcrumbs.querySelector('ol').innerHTML += breadcrumbsChild
          : hasBreadcrumbs.remove()
    }

  }
}

customElements.define('account-element', account);
