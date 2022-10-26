// Legacy search result page

$( document ).ready(function() {
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
  const $targetFilter = $('[data-mobile-dropdown="' + $(this).data('mobile-filter') + '"]');
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
  const $filterForm = $(document).find('#filter-form'),
      $collectionProducts = $(document).find('.collection__products-results'),
      $filterFormInput = $filterForm.find('input'),
      $filterPriceRange = $filterForm.find('.filter-group__price-range-to input'),
      $filterPriceMin = $filterForm.find('.filter-group__price-range-min-value'),
      formData = $filterForm.serialize(),
      $noResultsMessage = `<h3 class="collection__products-no-results">No results</h3>`,
      urlSearchParams = new URLSearchParams(window.location.search),
      params = Object.fromEntries(urlSearchParams.entries()),
      queryKey = params.q;

  let url = window.location.protocol + '//' + window.location.host + window.location.pathname + '?view=ajax&' + formData;

  if (queryKey.length) {
    url = window.location.protocol + '//' + window.location.host + window.location.pathname + '?q=' + queryKey + '&options%5Bprefix%5D=last&resources[options][unavailable_products]=hide&' + formData;
  }

  $filterFormInput.attr('disabled', 'true');
  filterResultsBlock()

  $.ajax({
    url: url,
    method: 'GET',
    success: function (data) {
      const $collectionNewProducts = $(data).find('.collection__products-results'),
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

  const $filterPriceRange = $(document).find('.filter-group__price-range-to input'),
      $filterPriceMax = $(document).find('.filter-group__price-range-max-value'),
      checkedInputs = $(document).find('#filter-form input:checked').length,
      rangeValueChanged = (parseInt($filterPriceRange.attr('max')) !== parseInt($filterPriceMax.text()));
  (checkedInputs || rangeValueChanged) ? $('[data-clear-filter]').show() : $('[data-clear-filter]').hide()
})

$(document).on('input.changeRange', '#filter-form input[type="range"]', function () {
  const $filterPriceMax = $(document).find('.filter-group__price-range-max-value');
  $filterPriceMax.html($(this).val() + '.00')
})

$(document).on('click.mobileClearAll', '[data-clear-filter]', function () {
  const $collectionContainer = $(document).find('.collectionContainer'),
      url = window.location.href;

  $.ajax({
    url: url,
    method: 'GET',
    success: function (data) {
      const $collectionNewContainer = $(data).find('.collectionContainer').html();
      $collectionContainer.html($collectionNewContainer);
      if (typeof window.yotpo !== "undefined") {
        window.yotpo.initWidgets();
      }
    }
  });
})
});

class SearchPageForm extends HTMLElement {
  constructor() {
    super();
    this.form = this.querySelector('.searchFormMain')
    this.searchInput = this.querySelector('.searchForm__inputMain')
    this.searchReset = this.querySelector('.searchForm__mainResetLabel')
    this.searchInput.addEventListener('input', () => this.searchResetState())
    this.form.addEventListener('reset', ()=> {
      this.searchInput.removeAttribute('value')
      this.searchReset.style.display = 'none'
      this.getUrlRequest()
    })
    this.form.addEventListener('submit', (e)=> {
      e.preventDefault()
      this.getUrlRequest()
    })
  }

  getUrlRequest() {
    const queryKey = this.searchInput.value.trim().toLowerCase()
    window.location.href = '/search?q=' + queryKey + '&options%5Bprefix%5D=last&type=product';
  }

  searchResetState () {
    const value = this.searchInput.value.trim(),
        queryKey = value.replace(" ", "-").toLowerCase();

    (queryKey)
        ? this.searchReset.style.display = 'block'
        : this.searchReset.style.display = 'none'
  }
}

customElements.define('search-form', SearchPageForm);