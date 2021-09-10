var scrollPosition = 0;

theme.disableScroll = function () {
  $('body').css('overflow', 'hidden');
}

theme.enableScroll = function () {
  $('body').css('overflow', '');
}

theme.openModal = function () {
  $('#modal').attr('aria-hidden', 'false').fadeIn();
  theme.disableScroll();
}

theme.closeModal = function (clean) {
  $('#modal').attr('aria-hidden', 'true').fadeOut();
  $('#modalContent').fadeOut().html('').text('');
  $('#emptyModal').fadeIn();
  theme.enableScroll();
}

theme.header = function () {

//-----------------------Header navigation----------------------------------
  const $newHeader = $(".newHeader"),
      $openedBlock = $(".newHeader__openedBlock"),
      $burger = $('.burgerMenu'),
      $body = $('body'),
      $mobileMenu = $('.mobileMenu'),
      $mobileItem = $('.mobileMenu__item'),
      $megaMenu = $('.megaMenu');

  let closeOpenedBlock = function () {
    $openedBlock.slideUp();
    $openedBlock.attr('aria-hidden', 'true');
    $('.newHeader__link').attr('data-selected', 'false');
  };
  let burgerFunction = function () {
    $burger.toggleClass('active');
    $mobileMenu.toggleClass('active');
    $body.toggleClass('fixed');
    if (!$burger.hasClass('active')) {
      $mobileMenu.find('.active').removeClass('active')
      $mobileMenu.find('.subMenuList').slideUp();
    }
  };

  $(document).mouseup(function (e){
    var div = $('.newHeader');
    var divChild = div.find('.newHeader__openedBlock[aria-hidden="false"]');

    if (!div.is(e.target)
        && div.has(e.target).length === 0
        && !divChild.is(e.target)
        && divChild.has(e.target).length === 0) {
      closeOpenedBlock();
    }
  });

  $(window).on('resize', () => {
    if ($(window).width() < 992) {
      closeOpenedBlock ();
    }
  })

  $burger.on('click', function () {
    burgerFunction();
  })

  $(document).on('click', "a", function (e) {
      closeOpenedBlock();
  if($burger.hasClass('active')){
      burgerFunction();
    }
  })

  $(document).on('click', ".mainMenu__cardWrapper", function (e) {
    e.preventDefault();
  })

  $(document).on('click', '.newHeader__link', function (e) {
    if ($(this).attr('data-selected') == 'false') {
      let target = $(this).attr('data-target'),
          findDataId = $(`[data-id=${target}]`);

      if ($openedBlock.attr('aria-hidden') == 'false') {
        findDataId.attr('data-visible', 'true');
        $(target).attr('data-visible', 'true');
      }

      $newHeader.find($('[data-selected]')).attr('data-selected', 'false');
      $(this).attr('data-selected', 'true');
      findDataId.attr('data-selected', 'true');

      if ($openedBlock.find(findDataId).length > 0) {
        $openedBlock.slideDown();
        $openedBlock.attr('aria-hidden', 'false');
      } else {
        $('.newHeader__link').attr('data-selected', 'false');
        $openedBlock.slideUp();
        $openedBlock.attr('aria-hidden', 'true');
      }
    } else if ($(this).attr('data-selected') == 'true') {
      $('.newHeader__link').attr('data-selected', 'false');
      $openedBlock.slideUp();
      $openedBlock.attr('aria-hidden', 'true');
    }
  })

  $mobileItem.on('click', function (e) {
    if (!$(this).find($megaMenu).hasClass('active') && !$(this).find($megaMenu).hasClass('megaMenu__blank')) {
      $(this).find($megaMenu).addClass('active');
    } else if ($(e.target).hasClass('megaMenu__itemHeading')) {
      $(this).find($megaMenu).removeClass('active');
    }
  })

  $('.newHeader__link').on('click', function () {
    if ($(this).parents('.mobileMenu')) {
      $(this).siblings('.subMenuList').slideToggle();
      $(this).toggleClass('active')
    }
  })

  $('.newHeader__link').on("mouseover", function (e) {
    if ($openedBlock.attr('aria-hidden') == 'false' && $(this).attr('data-selected') == 'false') {
      let target = $(this).attr('data-target'),
          findDataId = $(`[data-id=${target}]`);

      findDataId.attr('data-visible', 'false');
      $(target).attr('data-visible', 'false');

      if ($(target).attr('data-visible') == 'false') {
        findDataId.attr('data-visible', 'true');
        $(target).attr('data-visible', 'true');
      }
    }
  })

  $('.newHeader__link').on("mouseout", function (e) {
    if ($openedBlock.attr('aria-hidden') == 'false') {
      let target = $(this).attr('data-target'),
          findDataId = $(`[data-id=${target}]`);

      findDataId.attr('data-visible', 'true');
      $(target).attr('data-visible', 'true');
      if ($(target).attr('data-visible') == 'false') {
        findDataId.attr('data-visible', 'true');
        $(target).attr('data-visible', 'true');
      }
    }

  })

  theme.countdownTimer = function () {
    const second = 1000,
        minute = second * 60,
        hour = minute * 60,
        day = hour * 24;

    function timerText(period, periodName) {
      let number = (period < 10) ? '0' + period : period,
          separator = (periodName !== 'seconds') ? ' :' : '',
          text = number + ' ' + periodName + separator;
      return ((number === '00' && periodName === 'days') ? '' : text)
    }

    let endDate = $('.announcement-bar__timer').data('end-date'),
        countDown = new Date(endDate).getTime(),
        x = setInterval(function () {

          let now = new Date().getTime(),
              distance = countDown - now,
              days = Math.floor(distance / (day)),
              hours = Math.floor((distance % (day)) / (hour)),
              minutes = Math.floor((distance % (hour)) / (minute)),
              seconds = Math.floor((distance % (minute)) / second);

          $('.announcement-bar__timer-days').text(timerText(days, 'days'));
          $('.announcement-bar__timer-hours').text(timerText(hours, 'hours'));
          $('.announcement-bar__timer-minutes').text(timerText(minutes, 'minutes'));
          $('.announcement-bar__timer-seconds').text(timerText(seconds, 'seconds'));

          //do something later when date is reached
          if (distance < 0) {
            $('.announcement-bar__timer').fadeOut();
            clearInterval(x);
          }
          //seconds
        }, 1000)
    $('.announcement-bar__timer').css('visibility', 'visible');
  }

  if ($('.announcement-bar__timer').length) {
    theme.countdownTimer();
  }
//-----------------------End Header navigation----------------------------------
}

theme.pdpRecCollection = function () {
  const $container = $('.pdpRecCollection');
  const $slideshow = $container.find('.pdpRecCollection__slideshow');

  $slideshow.slick({
    dots: false,
    infinite: false,
    speed: 300,
    slidesToShow: 4,
    prevArrow: '<button type="button" class="slick-prev"><span class="sr-only">Previous</span>' +
        '&larr;</button>',
    nextArrow: '<button type="button" class="slick-next"><span class="sr-only">Next</span>' +
        '&rarr;</button>',
    responsive: [
      {
        breakpoint: 1399,
        settings: {
          slidesToShow: 3
        }
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1.6
        }
      }
    ]
  });
}

theme.headerHeight = function () {
  document.documentElement.style.setProperty('--header-height', document.getElementById('MainHeader').offsetHeight + 'px');
}

theme.horizontalScroll = function (list, elements, offset) {
  for (var i=0; i < elements.length; i++) {
    elements[i].onclick = function(){
      list.scroll({
        left: this.offsetLeft - offset,
        behavior: 'smooth'
      });
    }
  }
}

theme.slickSlider = function () {
  $('[data-section-type="slick-slideshow"]').each(function () {
    let $slider = $(this).find('.jsSlickSlider'),
        config = null;

    if ($(this).attr('data-slick-config')) {
      config = $.parseJSON($(this).attr('data-slick-config'));
      if (config) {
        if (config['arrows']) {
          config.prevArrow = $(this).find('.jsPrevSlide');
          config.nextArrow = $(this).find('.jsNextSlide');
        }
      }
    }

    $slider.not('.slick-initialized').slick(config);
  });
}

theme.addProduct = function () {
  $.ajax({
    type: 'POST',
    url: '/cart/add.js',
    data: $('[data-add-id]').parents('form').serialize(),
    dataType: 'json',
    success: function() {
      CartDrawer.emit("cart:updating");
      UpdateCart();
    },
    error: function (error) {
      if (error.status == 422) {
        $('#PdpErrorMessage').text(error.responseJSON.description).fadeIn('slow');

        setTimeout(function () {$('#PdpErrorMessage').fadeOut('slow').text('');}, 3500);
      }
    }
  })
}

theme.toggleTab = function ($this) {
  // Required button element: aria-selected='true/false'; aria-controls='TAB_ID'; data-action='toggle-tab'
  // Required tab element: aria-selected='true/false'; data-tab='TAB_ID'

  if ($this.attr('aria-selected') !== 'true') {
    $('[data-action="toggle-tab"]').attr('aria-selected', 'false');
    $this.attr('aria-selected', 'true');

    $('[data-tab]').attr('aria-selected', 'false').each(function () {
      if ($(this).attr('data-tab') == $this.attr('aria-controls')) {
        $(this).attr('aria-selected', 'true');
        return false;
      }
    })
  }
}

theme.dropdown = function () {
  $(document).on('click', '[data-dropdown]', function (e) {
    e.preventDefault();
    $(this).parent().find('[data-dropdown-list]').slideToggle();
    $(this).find('.dropdown__icon').toggleClass('dropdown__icon--rotate');
  });
}

theme.mutation = function updateProductColors ($targetNode, callback) {
  var config = { attributes: true, childList: true, subtree: true };
  let observer = new MutationObserver(callback);
  observer.observe($targetNode, config);
}

theme.checkSlickResponse = function ($slider, config, response, maxMedia) {
  function checkSlider() {
    var condition = (maxMedia) ? $(window).width() < response : $(window).width() > response;
    if (condition) {
      $slider.not('.slick-initialized').slick(config)
    } else {
      if ($slider.hasClass('slick-initialized')) {
        $slider.slick('unslick')
      }
    }
  }

  checkSlider();
  $(window).resize(function () {
    checkSlider();
  });
}


theme.quickView = function (URL, innerContainer) {
  theme.openModal();

  $.ajax({
    url: URL,
    method: 'GET',
    success: function (data) {
      innerContainer.html($(data).find('.pdpTemplate'));
      theme.pdpQuickView();
      theme.slickSlider();
      $('#emptyModal').hide();
      innerContainer.fadeIn("slow");
    }
  });
}


theme.handleize = function (str) {
  return str.toLowerCase().replace(/[^\w\u00C0-\u024f]+/g, "-").replace(/^-+|-+$/g, "");
};

theme.pdpMain = function () {

  // Remove all $(document) Events
  // clicks:
  $(document).off('click.thumbnails')
  $(document).off('click.pdpDropdown')
  $(document).off('click.pdpStickyAtc')
  $(document).off('click.pdpStickyOptions')
  $(document).off('click.pdpStickySize')
  $(document).off('click.pdpStickyCloseSize')
  $(document).off('click.pdpLearMoreShowAll')
  // scrolls:
  $(document).off('scroll.galleryImage')
  $(document).off('scroll.pdpStickyBar')

  function thumbnailScrollOnClick () {
    $(document).on('click.thumbnails', '.pdpMain__container .pdpMain__gallery-thumbnails-item', function () {
      let scrollElement = $('[data-variant-media="' + $(this).attr('data-variant-img') + '"]'),
          headerHeight = document.getElementById('MainHeader').offsetHeight;
        $([document.documentElement, document.body]).animate({
          scrollTop: scrollElement.offset().top - headerHeight
        }, 500);
      $('.pdpMain__gallery-thumbnails-item').removeClass('current-thumbnail')
      $(this).addClass('current-thumbnail')
    })
  }

  function changeActiveThumbnail() {
    var $variantImage = $('.pdpMain__variant-image'),
        $thumbnailSlider = $('.pdpMain__gallery-thumbnails');
    $('.pdpMain__gallery-thumbnails-item').removeClass('current-thumbnail')
    $(".pdpMain__gallery-thumbnails-item:first").addClass('current-thumbnail')
    $(document).on('scroll.galleryImage', $.debounce(300, function () {
      $variantImage.each(function () {
        let imagePosition = $(this)[0].getBoundingClientRect();
        if (imagePosition.top < 300) {
          let $thumbnailImage = $('[data-variant-img="' + $(this).attr('data-variant-media') + '"]')
          let slideIndex = $thumbnailImage.data('slick-index')
          $('.pdpMain__gallery-thumbnails-item').removeClass('current-thumbnail')
          $thumbnailImage.addClass('current-thumbnail')
          $thumbnailSlider.slick('slickGoTo', parseInt(slideIndex), true);
        }
      })
    }))
  }

  function pdpThumbnails() {
    thumbnailScrollOnClick()
    changeActiveThumbnail()
  }

  function pdpBar() {
    var $pdpBarWrapper = $('.pdpBar__wrapper'),
        pdpBarConfig = $.parseJSON($('.pdpBar').attr('data-slick-config'));
    theme.checkSlickResponse($pdpBarWrapper, pdpBarConfig, 992, true)
  }

  function pdpGallary() {
    var $pdpGalleryWrapper = $('.pdpMain__gallery-wrapper'),
        pdpGalleryConfig = $.parseJSON($pdpGalleryWrapper.attr('data-slick-config'));
    theme.checkSlickResponse($pdpGalleryWrapper, pdpGalleryConfig, 992, true)
  }

  function pdpDropdown() {
    $(document).on('click.pdpDropdown', '[data-dropdown]', function (e) {
      e.preventDefault();
      let $dropdownList = $(this).parent().find('[data-dropdown-list]');
      if ($dropdownList.length) {
        $(this).parent().find('[data-dropdown-list]').slideToggle();
        $(this).find('.dropdownHeader-icon').toggleClass('dropdownHeader-icon--rotate');
        $(this).parent().find('.dropdownContent--animate-block').toggleClass('dropdownContent--animate-block-visible');
      }
    });

    if ($(window).width() < 992 && $('.pdpInfo').length) {
      $('.pdpInfo [data-dropdown-list]').css('display', 'none')
      $('.pdpInfo .dropdownHeader-icon').removeClass('dropdownHeader-icon--rotate');
      $('.dropdownContent--animate-block').removeClass('dropdownContent--animate-block-visible');
    }

    if ($('.pdpAdditionalFeatures ').length) {
      $(window).on('resize', $.debounce(300, function () {
        if ($(window).width() > 992) {
          $('.addlFeature__copy').removeAttr('style')

        }
      }));
    }
  }

  function changeVariantImage(variantId) {
    var selectedVariantThumbnail = $('[data-variant-img="' + variantId + '"]'),
        selectedVariantImage = $('[data-variant-media="' + variantId + '"]'),
        slideIndexMobile = selectedVariantImage.parent().data('slick-index'),
        mobileProductSlider = $('.pdpMain__gallery-wrapper');

    if ($(window).width() > 992) {
      if (selectedVariantThumbnail.length) {
        selectedVariantThumbnail.trigger('click');
      }
    } else {
      if (selectedVariantImage.length) {
        mobileProductSlider.slick('slickGoTo', parseInt(slideIndexMobile), true);
      }
    }
  }

  function pdpStickyBar() {
    var $productStickyBar = $('.pdpStickyBar'),
        $pdpDetails = $('.pdpMain__details .pdpForm #atc-wrapper');

    theme.selectedOption = function (variant) {
      $('[data-copy-for]').removeClass('checked')
      let variantOptions = variant.options
      variantOptions.forEach((option) => {
        let optionHandlize = option.toLowerCase().replace(/[^\w\u00C0-\u024f]+/g, "-").replace(/^-+|-+$/g, "")
        if (optionHandlize.indexOf('limited-edition') !== -1 ) {
          $('[data-copy-for="' + optionHandlize.split('limited-edition-')[1] + '"]').addClass('checked');
        } else {
          $('[data-copy-for="' + optionHandlize + '"]').addClass('checked');
        }
      })
    }

    $(document).on('scroll.pdpStickyBar', function () {
      let pdpDetailsPosition = $pdpDetails[0].getBoundingClientRect();
      (pdpDetailsPosition.bottom < 0) ? $productStickyBar.show() : $productStickyBar.hide();
    })

    $(document).on('click.pdpStickyAtc', '#pdp-sticky-atc', function (e) {
      e.preventDefault();
      $('#pdp-atc').trigger('click');
    })

    $(document).on('click.pdpStickyOptions', '[data-copy-for]', function (e) {
      e.preventDefault();
      $('label[for="' + $(this).data('copy-for') + '"]').trigger('click')
    })

    $(document).on('click.pdpStickySize', '[data-open-size-group]', function (e) {
      var $optionGroupSize = $('.option-groups-size');
      $(this).toggleClass('group-open')
      $optionGroupSize.slideToggle()
    })

    $(document).on('click.pdpStickyCloseSize', function (e) {
      var $container = $('.stickySize'),
          $hideElement = $('.option-groups-size');
      if (!$container.is(e.target) && $container.has(e.target).length === 0 && $hideElement.is(':visible')) {
        $hideElement.slideUp();
        $('[data-open-size-group]').removeClass('group-open')
      }
    })
  }

  function pdpMediaProof() {
    var $pdpMediaProofWrapper = $('.pdpMediaProof .jsSlickSlider'),
        pdpGalleryConfig = $.parseJSON($('.pdpMediaProof').attr('data-slick-config'));
    theme.checkSlickResponse($pdpMediaProofWrapper, pdpGalleryConfig, 992, true)
  }

  function pdpLearMore() {
    $(document).on('click.pdpLearMoreShowAll', '.pdpLearnMore__dropdown-view-all', function () {
      $(this).parents('.pdpLearnMore__dropdown-content').find('.pdpLearnMore__dropdown-link-item').show()
      $(this).hide()
    })
  }

  theme.variantChange = function (variantId) {
    theme.selectedVariantId = variantId
    changeVariantImage(theme.selectedVariantId)
    // $(window).on('resize', $.debounce(1000, function () {
    //     changeVariantImage(theme.selectedVariantId)
    // }));
  }

  if ($('.pdpBar__wrapper').length) {pdpBar();}
  if ($('.pdpMain__gallery-thumbnails').length) {pdpThumbnails();}
  if ($('.pdpMain__gallery-wrapper').length) {pdpGallary();}
  if ($('.pdpRecCollection').length) {theme.pdpRecCollection();}
  if ($('.pdpInfo').length || $('.pdpAdditionalFeatures ').length) {pdpDropdown();}
  if ($('.pdpMediaProof').length) {pdpMediaProof();}
  if ($('.pdpLearnMore').length) {pdpLearMore();}
  pdpStickyBar()
}

theme.pdpQuickView = function () {

  // Remove all $(document) Events
  // clicks:
  $(document).off('click.thumbnailsModal')

  function modalThumbnailScrollOnClick () {
    $(document).on('click.thumbnailsModal', '.pdpMain__gallery-thumbnails-item', function () {
      let scrollElement = $('[data-variant-media="' + $(this).attr('data-variant-img') + '"]');
        $('#modalContent').animate({
          scrollTop: scrollElement.position().top
        }, 500);
      $('.pdpMain__gallery-thumbnails-item').removeClass('current-thumbnail')
      $(this).addClass('current-thumbnail')
    })
  }

  function modalChangeActiveThumbnail() {
    var $modalVariantImage = $('#modalContent .pdpMain__variant-image'),
        $modalThumbnailSlider = $('#modalContent .pdpMain__gallery-thumbnails');
    $('#modalContent .pdpMain__gallery-thumbnails-item').removeClass('current-thumbnail')
    $("#modalContent .pdpMain__gallery-thumbnails-item:first").addClass('current-thumbnail')
    $('#modalContent').on('scroll.modalGalleryImage', $.debounce(300, function () {
      $modalVariantImage.each(function () {
        let modalImagePosition = $(this)[0].getBoundingClientRect();
        if (modalImagePosition.top < 150) {
          let $thumbnailImage = $('#modalContent').find('[data-variant-img="' + $(this).attr('data-variant-media') + '"]')
          let slideIndex = $thumbnailImage.data('slick-index')
          $('.pdpMain__gallery-thumbnails-item').removeClass('current-thumbnail')
          $thumbnailImage.addClass('current-thumbnail')
          $modalThumbnailSlider.slick('slickGoTo', parseInt(slideIndex), true);
        }
      })
    }))
  }

  function modalPdpThumbnails() {
    modalThumbnailScrollOnClick()
    modalChangeActiveThumbnail()
  }

  if ($('#modalContent .pdpMain__gallery-thumbnails').length) {
    modalPdpThumbnails();
  }
}

$(document).ready(function () {
  theme.header()

  theme.GLOBAL()

  theme.headerHeight();

  $(window).on('resize', $.debounce(300, function () {
    theme.headerHeight();
  }));

})

theme.GLOBAL = function () {

  $(document).on('click', '[data-action="toggle-tab"]', function () {
    theme.toggleTab($(this));

    if ($('.FeaturedCollections__CollectionLink').length) {
      let $parentElement = $(this).closest('.FeaturedCollections__TabsHeader');
      $($parentElement.find('.FeaturedCollections__CollectionLink')).attr('href', $(this).attr('data-link-url')).text($(this).attr('data-link-title'));

      let $tabList = $('.FeaturedCollections__TabsList')[0];
      let $elements = $('.FeaturedCollections__TabButton');

      theme.horizontalScroll($tabList, $elements, 50);
    }
  })

  $(document).on('click', '[data-color]', function () {
    let $parentElement = $(this).closest('[data-option-color]');
    if ($parentElement.length) {
      let $tabList = $parentElement[0];
      let $elements = $('[data-color]');
      theme.horizontalScroll($tabList, $elements, 20);
    }
  })

  $(document).on('click', '#closeModal', function () {
    theme.closeModal();
  });

  $(document).on('click', '[data-quick-view]', function () {
    let viewURL = $(this).attr('data-quick-view');
    theme.quickView(viewURL, $('#modalContent'));
  });

  $(document).on('click', '#ProductQuickView .js-counter-add', function () {
    qvChangeQTY(1);
    qvVariantChange ();
  })

  $(document).on('click', '#ProductQuickView .js-counter-remove', function () {
    qvChangeQTY(-1);
    qvVariantChange ();
  })

  $(document).on('click', '#ProductQuickView .radio-group label', function () {
    let optionName = $($(this).find('input')).attr('name');
    let optionValue = $($(this).find('input')).attr('value');
    let $currentOption = $('[data-option-current]');

    $currentOption.each(function () {
      if ($(this).attr('data-option-current') == optionName) {
        $(this).text(optionValue);

        qvVariantChange();
      }
    })
  });


  function qvChangeQTY (point) {
    let currentValue = parseInt($('.js-counter-quantity').val(), 10);
    let setValue = currentValue + point;
    if (setValue < 1) {
      setValue = 1;
    }

    $('.js-counter-quantity').val(setValue);
  };

  function qvVariantChange () {
    let selectedOption = $('#ProductQuickView .radio-group input:checked');

    if (selectedOption.length < 3) {
      $('#ProductQuickView #quickAdd').attr('disabled', 'disabled');
      let selectedOption1 = $(selectedOption[0]).attr('value');
      let selectedOption2 = $(selectedOption[1]).attr('value');
      let selectedOption3 = $(selectedOption[2]).attr('value');

      let innerJSON = $('#productJson-' + $($('#ProductQuickView').closest('[data-product-id]')).attr('data-product-id')).html();
      let productJSON  = $.parseJSON(innerJSON)['product'];
      let variants = productJSON['variants'];

      for (let i = 0; i < variants.length; i++) {
        if (variants[i].option1 == selectedOption1 && variants[i].option2 == selectedOption2 && variants[i].option3 == selectedOption3) {
          if ($('#ProductQuickView #selectid').find('[selected]').length) {
            $($('#ProductQuickView #selectid').find('[selected]')).removeAttr('selected');
          }

          $('#ProductQuickView #selectid').val(variants[i].id);

          $($('#ProductQuickView #selectid').find('[value="' + variants[i].id + '"]')).attr('selected', 'selected');
          $('[data-selected-var-price]').text($($('#ProductQuickView #selectid').find('[value="' + variants[i].id + '"]')).attr('data-variant-price'))

          if ($('.js-counter-quantity').val() < 1) {
            $('.js-counter-quantity').val(1)
          }

          $('#ProductQuickView #quickAdd').attr('data-add-qty', $('.js-counter-quantity').val());

          if (variants[i].available) {
            $($('#ProductQuickView #quickAdd').find('[data-atc-copy]')).text(window.theme.strings.addToCart);
            $('#ProductQuickView #quickAdd').attr('data-add-id', variants[i].id).removeAttr('disabled');
          } else {
            $($('#ProductQuickView #quickAdd').find('[data-atc-copy]')).text(window.theme.strings.soldOut);
            $('#ProductQuickView #quickAdd').attr('data-add-id', variants[i].id)
          }
        }
      }
    }

    let modalVariantId = $('#ProductQuickView #quickAdd').attr('data-add-id'),
        $modalSelectedVariantThumbnail = $('#modalContent').find('[data-variant-img="' + modalVariantId + '"]');
      if ($modalSelectedVariantThumbnail.length) {$modalSelectedVariantThumbnail.trigger('click')}
  }


  // if (window.location.hash.indexOf("#contact_form") > -1) {
  //   $([document.documentElement, document.body]).animate({
  //     scrollTop: $('.shopify-challenge__container').offset().top
  //   }, 500);
  // }

  if (window.location.search.indexOf("contact") > -1) {
    $([document.documentElement, document.body]).animate({
      scrollTop: $('.footerInner__Left').offset().top + 500
    }, 100);
  }

  $(document).on('click', '[data-add-id]', function (event) {
    event.preventDefault();
    theme.addProduct()
  })

  if ($('[data-section-type]').attr('data-section-type') == 'slick-slideshow') {
    theme.slickSlider()
  }

  if ($('.pdpMain').length) {
    theme.pdpMain()
  }
}