var scrollPosition = 0;

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
  $('body').css('overflow', 'hidden');
}

theme.enableScroll = function () {
  $('body').css('overflow', '');
}

theme.handleize = function (str) {
  return str.toLowerCase().replace(/[^\w\u00C0-\u024f]+/g, "-").replace(/^-+|-+$/g, "");
};

theme.openModal = function () {
  $('#modal').attr('aria-hidden', 'false').fadeIn();
  theme.disableScroll();
}

theme.closeModal = function (clean) {
  $('#modal').attr('aria-hidden', 'true').fadeOut();
  $('#modalContent').fadeOut().html('').text('');
  $('#emptyQvModal').show(800);
  theme.enableScroll();
  $(document).off('mousedown.QvClose')
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

   // if($burger.hasClass('active')){
   //    burgerFunction();
   //  }
  })

  $(document).on('mouseover', '.newHeader__MainLink', function () {
    theme.closeSearch();

    if ($(this).attr('data-target')) {
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
    } else {
      closeOpenedBlock()
    }
  })

  $(document).on('mouseleave', '.newHeader', function () {
    if ($openedBlock.attr('data-selected', 'false')) {
      closeOpenedBlock()
    }
  });

  $mobileItem.on('click', function (e) {
    if (!$(this).find($megaMenu).hasClass('active') && !$(this).find($megaMenu).hasClass('megaMenu__blank')) {
      $(this).find($megaMenu).addClass('active');
    } else if ($(e.target).hasClass('megaMenu__itemHeading') || $(e.target).parent().hasClass('megaMenu__itemHeading')) {
      $(this).find($megaMenu).removeClass('active');
    }
  })

  $('.mobileMenu .newHeader__link').on('click', function (e) {
    if (this.classList.contains('newHeader__button')) e.preventDefault();
    if ($(this).parents('.mobileMenu')) {
      $(this).siblings('.subMenuList').slideToggle();
      $(this).toggleClass('active')
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

theme.toggleTab = function ($this) {
  // Required button element: data-selected='true/false'; aria-controls='TAB_ID'; data-action='toggle-tab'
  // Required tab element: data-selected='true/false'; data-tab='TAB_ID'

  if ($this.attr('data-selected') !== 'true') {
    $('[data-action="toggle-tab"]').attr('data-selected', 'false');
    $this.attr('data-selected', 'true');

    $('[data-tab]').attr('data-selected', 'false').each(function () {
      if ($(this).attr('data-tab') == $this.attr('aria-controls')) {
        $(this).attr('data-selected', 'true');
        return false;
      }
    })
  }
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

theme.qvChangeSlide = function () {
  let modalVariantId = $('#ProductQuickView #quickAdd').attr('data-add-id'),
      $modalSelectedVariantThumbnail = $('#modalContent').find('[data-variant-img="' + modalVariantId + '"]');
  if ($modalSelectedVariantThumbnail.length) {$modalSelectedVariantThumbnail.trigger('click')}

}

theme.quickView = function (URL, innerContainer) {
  theme.openModal();

  $.ajax({
    url: URL,
    method: 'GET',
    success: function (data) {
      innerContainer.html($(data).find('.pdpTemplate'));
      if ($('#ProductQuickView .pdpMain__variant-image').length) {
        theme.pdpQuickView();
      }
      theme.qvChangeColorGroupName();
      $('#emptyQvModal').hide();
      innerContainer.fadeIn(1000);
      theme.qvVariantChange()


    }
  });
}

theme.variantPreOrderCheck = function (variantId) {
  var id = $('#selectid option[value="'+variantId+'"]').data("variant-preorder");
  if (id == true) {
    $('.js-atc-copy').text("Pre-order");
    if ($(".pdpForm input[name='properties[pre-order]']").length === 0) {
      $('.pdpForm').append(`<input type="hidden" data-preorder="true" name="properties[pre-order]" value="true">`)
    }
  } else {
    $('.pdpForm [data-preorder]').remove();
  }
}

theme.kitPreOrderCheck = function () {
  var $stickyAtc = $('#pdp-sticky-atc'),
      $bundleAtc = $('#pdp-bundle-atc');
  if ($stickyAtc.length && $bundleAtc.length) {
    if ($bundleAtc.is(':disabled')) $stickyAtc.prop('disabled', true)
    $stickyAtc.find('.js-atc-copy').text($bundleAtc.find('.js-atc-copy').text())
  }
}

theme.buildProperties = function (inputs) {
  let props = {};
  inputs.forEach(function (input, index) {
    let propName = input.getAttribute("name").match(/\[(.*?)\]/)[1]
    props[`${propName}`] = input.getAttribute("value");
  })
  return props
}

theme.pdpMain = function () {

  var variantId = $(".pdpMain__variant-image").data("variant-media");
  theme.variantPreOrderCheck(variantId)

  function stickyScrolling(options) {
    var $container = options.container || undefined;
    var $elements = options.elements || [];
    var topSpacer = options.topSpacer || 0;
    if ($container.length < 1 || typeof $container === "undefined")
      return false;
    var lastScrollPosition = window.scrollY;
    var currentScrollPosition = window.scrollY;
    var viewportHeight;
    var startPosition;
    var endPosition;
    var elementDetails = {};

    var recalculateHeights = function() {
      viewportHeight = window.innerHeight,
      startPosition = $container.offset().top,
      endPosition = $container.innerHeight() + startPosition - viewportHeight;
      $.each($elements, function(index) {
        var element = $(this);
        elementDetails[index] = {
          height: element.height(),
          position: elementDetails.hasOwnProperty(index) ? elementDetails[index].position : 0
        }
      })
    };
    recalculateHeights();

    var updatePosition = function() {
      currentScrollPosition = window.scrollY;
      $.each($elements, function(index) {
        var element = $(this);
        var height = elementDetails[index].height;
        var position = elementDetails[index].position;
        var overflow = topSpacer + height - viewportHeight;
        position += currentScrollPosition - lastScrollPosition;
        position = currentScrollPosition <= startPosition ? 0 : position;
        position = currentScrollPosition > endPosition ? overflow : position;
        position = Math.abs(position) === position && Math.abs(position) > overflow ? overflow : position;
        position = Math.abs(position) !== position ? 0 : position;
        elementDetails[index].position = position;
        element.css({
          top: topSpacer + position * -1
        })
      });
      lastScrollPosition = currentScrollPosition
    };
    updatePosition();

    var refetchElements = function() {
      if ($container) {
        $container = $($container.selector)
      }
      if ($elements.length > 1) {
        var freshElements = [];
        $.each($elements, function(index) {
          freshElements.push($($elements[index].className))
        });
        $elements = freshElements
      } else {
        $elements = $($elements.selector)
      }
    };

    $(window).on("resize.pdp", recalculateHeights);
    $(window).on("scroll.pdp", updatePosition);
    $(window).on("recalculateScroll", function(event, clickEvent) {
      refetchElements()
      recalculateHeights()
      if (!clickEvent) {
        updatePosition()
      }
    })
  }

  stickyScrolling({
    container: $(".pdpMain__container"),
    elements: $(".pdpMain__details"),
    topSpacer: document.getElementById('MainHeader').offsetHeight + 24
  });

  function thumbnailScrollOnClick () {
    $(document).off('click.thumbnails')
    $(document).on('click.thumbnails', '.pdpMain__container .pdpMain__gallery-thumbnails-item', function () {
      let scrollElement = $(document).find('[data-variant-media="' + $(this).attr('data-variant-img') + '"]'),
          headerHeight = document.getElementById('MainHeader').offsetHeight;
        $([document.documentElement, document.body]).animate({
          scrollTop: scrollElement.offset().top - headerHeight
        }, 500);
      $(document).find('.pdpMain__gallery-thumbnails-item').removeClass('current-thumbnail')
      $(this).addClass('current-thumbnail')
    })
  }

  function changeActiveThumbnail() {
    $(document).off('scroll.galleryImage')
    var $variantImage = $(document).find('.pdpMain__variant-image'),
        $thumbnailSlider = $(document).find('.pdpMain__gallery-thumbnails');
    $(document).find('.pdpMain__gallery-thumbnails-item').removeClass('current-thumbnail')
    $(document).find(".pdpMain__gallery-thumbnails-item:first").addClass('current-thumbnail')
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
    var $pdpGalleryWrapper = $(document).find('.pdpMain__gallery-wrapper'),
        pdpGalleryConfig = $.parseJSON($pdpGalleryWrapper.attr('data-slick-config'));
    theme.checkSlickResponse($pdpGalleryWrapper, pdpGalleryConfig, 992, true)
  }

  function pdpBundleGallary() {
    var $pdpBundleGalleryWrapper = $(document).find('.pdpMain__bundle-gallery-wrapper'),
        pdpBundleGalleryConfig = $.parseJSON($('.pdpMain__bundle-gallery').attr('data-slick-config'));
    theme.checkSlickResponse($pdpBundleGalleryWrapper, pdpBundleGalleryConfig, 992, true)
  }

  function pdpDropdown() {
    $(document).on('click.pdpDropdown', '[data-dropdown]', function (e) {
      var _this = $(this);
      e.preventDefault();
      let $dropdownList = $(this).parent().find('[data-dropdown-list]');
      if ($dropdownList.length) {
        $(this).parent().find('[data-dropdown-list]').slideToggle(400);
        $(this).find('.dropdownHeader-icon').toggleClass('dropdownHeader-icon--rotate');
        $(this).parent().find('.dropdownContent--animate-block').toggleClass('dropdownContent--animate-block-visible');
      }
      setTimeout(function () {
        if (_this.parents('.pdpMain__details').length) {
          window.requestAnimationFrame(function() {
            $(window).trigger("recalculateScroll", false)
          })
        }
        }, 400);

    });

    if ($('.pdpAdditionalFeatures ').length) {
      $(window).on('resize', $.debounce(300, function () {
        if ($(window).width() > 992) {
          $('.addlFeature__copy').removeAttr('style')
        }
      }));
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
        } else if (optionHandlize.indexOf('artist-series') !== -1) {
          $('[data-copy-for="' + optionHandlize.split('artist-series-')[1] + '"]').addClass('checked');
        } else if (optionHandlize.indexOf('wooden-accents') !== -1) {
          $('[data-copy-for="' + optionHandlize.split('wooden-accents-')[1] + '"]').addClass('checked');
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
      if ($('#pdp-atc').is(":visible") || $('#pdp-bundle-atc').is(":visible")) {
        ($('#pdp-atc').length) ? $('#pdp-atc').trigger('click') : $('#pdp-bundle-atc').trigger('click');
      } else {
        $('.klaviyo-bis-trigger').trigger('click')
      }
    })

    $(document).on('click.pdpStickySelectSize', '.pdpStickyBar .cart__button--select-size', function (e) {
      e.preventDefault();
      if ($(window).width() < 1200) {
        $([document.documentElement, document.body]).animate({
          scrollTop: $('.pdpMain__Content').offset().top - 100
        }, 500);
      }
    })


    $(document).on('click.pdpSelectSize', '[data-option-size] .radio', function () {
      var $attrToRemove = $('[data-disabled-size="true"]')
      $attrToRemove.map((index, element) => $(element).removeAttr('data-disabled-size'))

      if($(this).is('label')) {
        $('.pdpStickyBar [data-open-size-group]').prev('strong').text($(this).find('span:last-child').text())
      }
    })

    $(document).on('click.pdpStickyOptions', '[data-copy-for]', function (e) {
      e.preventDefault();
      $('label[for="' + $(this).data('copy-for') + '"]').trigger('click')
    })

    $(document).on('click.pdpStickySize', '[data-open-size-group]', function (e) {
      var $optionGroupSize = $('.option-groups-size');
      $(this).toggleClass('group-open').parent().toggleClass('is-open')
      $optionGroupSize.stop().slideToggle()
    })

    $(document).on('click.pdpStickyCloseSize', function (e) {
      var $container = $('.stickySize'),
          $hideElement = $('.option-groups-size');
      if (!$container.is(e.target) && $container.has(e.target).length === 0 && $hideElement.is(':visible')) {
        $hideElement.slideUp();
        $('[data-open-size-group]').removeClass('group-open').parent().removeClass('is-open')
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

  function bundle () {
    theme.kitPreOrderCheck()

    $(document).on('click', '#pdp-bundle-atc', function (e) {
      e.preventDefault();
      let $availableVariants = $('[data-variant-available="true"]'),
          bundle_name = $(this).attr('data-bundle-name') || '',
          products_data = [],
          prop = {};

      $availableVariants.each(function (i, element) {
        prop = {
          "_bundles": true,
          "_Bundle_Name": bundle_name
        }

        if ($(element).attr('data-variant-preorder')) {
          prop = {
            "_bundles": true,
            "_Bundle_Name": bundle_name,
            "pre-order": true
          }
        }

        if (window.location.search.indexOf('pr_prod_strat') !== -1) prop._recommended_product = true;

        products_data.push({
          quantity: 1,
          id: $(this).attr('id'),
          properties: prop
        })
      });

      theme.cart.cartEvent('/cart/add.js', {items: products_data}, true, theme.pdpErrorMessage)
    })
  }


    // ======================================== Neels code starts here ========================================
  var is_size_selected = false;

  $('input[name^="Size"]').click(function(){
    is_size_selected = true;
  });
  // ======================================== Neels code ends here ========================================



  theme.variantChange = function (variantId, changeMediaContent) {
    window.localStorage.setItem('changeVariant', true);
    window.localStorage.setItem('variantId', variantId);
    function changeMedia() {
      var ajaxUrl = window.location.protocol + '//' + window.location.host + window.location.pathname + '?variant=' + variantId + '&view=ajax-media',
          $productMedia = $productMedia = $('.pdpMain__Media'),
          $productUpsell = $('.upsell-product'),
          $productPrice = $('.pdpForm .pdpCopy__price.hide-mobile'),
          $productMobilePrice = $('.pdpForm .pdpCopy__price.hide-desktop'),
          $stickyPrice = $('.pdpStickyBar .pdpCopy__price'),
          $productPersonalize = $('.pdpDetails__personalize');

      $.ajax({
        url: ajaxUrl,
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest' // This is needed as currently there is a bug in Shopify that assumes this header
        },
        success: function (data) {
          var $newProductMedia = $(data).find('.pdpMain__Media').html(),
              $newProductPrice = $(data).find('.pdpForm .pdpCopy__price.hide-mobile').html(),
              $newProductMobilePrice = $(data).find('.pdpForm .pdpCopy__price.hide-desktop').html(),
              $newStickyPrice = $(data).find('.pdpStickyBar .pdpCopy__price').html(),
              $newProductPersonalize = $(data).find('.pdpDetails__personalize').html();

          $productMedia.html($newProductMedia);
          $productPrice.html($newProductPrice);
          $productMobilePrice.html($newProductMobilePrice);
          $stickyPrice.html($newStickyPrice);
          if ($productPersonalize.length) $productPersonalize.html($newProductPersonalize);

          theme.slickSlider()
          pdpGallary()
          pdpThumbnails()
             // Change product Upsell
          var $newProductUpsellWrapper = $(data).find('.pdpMain__Content .upsell-product__wrapper'),
              $newProductUpsellHtml = $(data).find('.pdpMain__Content .upsell-product').html()
           if ($newProductUpsellWrapper.length) {
             $productUpsell.html($newProductUpsellHtml)
             theme.pdpUpsellProduct()
           } else {
             $productUpsell.html('');
           }



        }
      });
    }

    if (variantId && changeMediaContent) {
      changeMedia()
      theme.variantPreOrderCheck(variantId)
    }

        // ======================================== Neels code starts here ========================================
    var selectedColor = $('.pdp__options-main [data-option-label="Color"] [data-option-current]').text();
    if ($('div[data-index]').length > 2) {
      var selectedSize = $('.pdp__options-main [data-option-label="Size"] [data-option-current]').text();
      var selectedQuantity = $('.pdp__options-main [data-option-label="Quantity"] [data-option-current]').text();
      var all_colors = [];
      var all_sizes = [];
      var all_quantities = [];

      // Enable all sizes and return to default styling now that a new variant option has been selected
      $('input[name^="Color"]').each(function(){
        var colorhandle = theme.handleize($(this).attr('title'));
        if (colorhandle) {
          $('#' + colorhandle).removeAttr('disabled','disabled');
          $('div[data-color^="' + colorhandle + '"]').css('opacity','');
      	}
      });

      // Enable all sizes and return to default styling now that a new variant option has been selected
      $('input[name^="Size"]').each(function(){
        var sizehandle = theme.handleize($(this).attr('title'));
        $('#' + sizehandle).removeAttr('disabled','disabled');
        $('div[data-size^="' + sizehandle + '"]').css('text-decoration','');
        $('div[data-size^="' + sizehandle + '"]').css('color','');
      });

      // Enable all quantities and return to default styling now that a new variant option has been selected
      $('input[name^="Quantity"]').each(function(){
        var quantityhandle = theme.handleize($(this).attr('title'));
        $('#' + quantityhandle).removeAttr('disabled','disabled');
        $('div[data-quantity^="' + quantityhandle + '"]').css('color','');
        $('div[data-quantity^="' + quantityhandle + '"]').css('text-decoration','');
      });

      // Add all colors to the all_colors array list
      $('span[data-color]').each(function(){
        if (all_colors.indexOf($(this).data('color')) === -1) {
          all_colors.push($(this).data('color'));
        }
      });
      // Add all sizes to the all_sizes array list
      $('span[data-size]').each(function(){
        if (all_sizes.indexOf($(this).data('size')) === -1) {
          all_sizes.push($(this).data('size'));
        }
      });
      // Add all quantities to the all_quantities array list
      $('span[data-quantity]').each(function(){
        if (all_quantities.indexOf($(this).data('quantity')) === -1) {
          all_quantities.push($(this).data('quantity'));
        }
      });
      // Create hasQuantities variable if the quantities array is populated, else we know the product only has color and size options
      if (all_quantities.length){
        var hasQuantities = true;
      }

      // Loop all variants of the selected product
      for (i=0; i<json_product.variants.length; i++) {
        var variant = json_product.variants[i];
        var color = variant.option1;
        // If the color option contains the string "Limited Edition:" we need to strip this
        if (color.indexOf(":") > -1) {
          color = color.split(':')[1].trim();
        }
        var size  = variant.option2;
        var quantity  = variant.option3;

        // Check if the product has 3 options of color, size and quantity
        if (hasQuantities){
          // Check if the color and size selected by the customer is the current loop index color and size values
          if (color.indexOf(selectedColor) >= 0 && size.indexOf(selectedSize) >= 0) {
            if (all_quantities.length && all_quantities.indexOf(quantity) !== -1) {
              const index = all_quantities.indexOf(quantity);
              if (index > -1) {
                all_quantities.splice(index, 1);
              }
            }
          }
          // Check if the color and quantity selected by the customer is the current loop index color and quantity values
          if (color.indexOf(selectedColor) >= 0 && quantity.indexOf(selectedQuantity) >= 0) {
            if (all_sizes.indexOf(size) !== -1) {
              const index = all_sizes.indexOf(size);
              if (index > -1) {
                all_sizes.splice(index, 1);
              }
            }
          }
          // Check if the size and quantity selected by the customer is the current loop index size and quantity values
          if (size.indexOf(selectedSize) >= 0 && quantity.indexOf(selectedQuantity) >= 0) {
            if (all_colors.indexOf(color) !== -1) {
              const index = all_colors.indexOf(color);
              if (index > -1) {
                all_colors.splice(index, 1);
              }
            }
          }
        }
        // Product only has 2 options of color and size
        else {
          // Check if the color selected by the customer is the current loop index color
          if (color.indexOf(selectedColor) >= 0) {
            // Check if the current variant size exists in the all_sizes array and if so, remove it from the array
            if (all_sizes.indexOf(size) !== -1) {
              const index = all_sizes.indexOf(size);
              if (index > -1) {
                all_sizes.splice(index, 1);
              }
            }
          }
          // Check if the size selected by the customer is the current loop index size
          if (size.indexOf(selectedSize) >= 0) {
            // Check if the current variant color exists in the all_colors array and if so, remove it from the array
            if (all_colors.indexOf(color) !== -1) {
              const index = all_colors.indexOf(color);
              if (index > -1) {
                all_colors.splice(index, 1);
              }
            }
          }
        }
      }

      // Check if there are any colors left in the all_colors array and if so, disable these color buttons as they are unavailable colors for the selected variant
      if (is_size_selected){
        if (all_colors.length) {
          /// Loop all the color input elements
          $('input[name^="Color"]').each(function(){
            var colorvar = $(this).attr('title');
            var colorhandle = theme.handleize(colorvar);
            // If the color element is found in the all_colors list we need to disable this element as it is not an available color option
            if (all_colors.indexOf(colorvar) > -1) {
              $('#' + colorhandle).attr('disabled','disabled');
              $('div[data-color^="' + colorhandle + '"]').css('opacity','0.2');
            }
          });
        }

        // Check if there are any quantities left in the all_quantities array and if so, disable these quantity buttons as they are unavailable quantities for the selected variant color
        if (all_quantities.length) {
          $('input[name^="Quantity"]').each(function(){
            var quantityvar = $(this).attr('title');
            var quantityhandle = $(this).data('value-handle');
            // If the quantity element is found in the all_quantities list we need to disable this element as it is not an available quantity option
            if (all_quantities.indexOf(quantityvar) > -1) {
              $('#' + quantityhandle).attr('disabled','disabled');
              $('div[data-quantity^="' + quantityhandle + '"]').css('color','#ABABAB');
              $('div[data-quantity^="' + quantityhandle + '"]').css('text-decoration','line-through');
            }
          });
        }
      }

      // Check if there are any sizes left in the all_sizes array and if so, disable these size buttons as they are unavailable sizes for the selected variant color
      if (all_sizes.length) {
        $('input[name^="Size"]').each(function(){
          var sizevar = $(this).attr('title');
          var sizehandle = $(this).data('value-handle');
          // If the size element is found in the all_sizes list we need to disable this element as it is not an available size option
          if (all_sizes.indexOf(sizevar) > -1) {
            $('#' + sizehandle).attr('disabled','disabled');
            $('div[data-size^="' + sizehandle + '"]').css('text-decoration','line-through');
            $('div[data-size^="' + sizehandle + '"]').css('color','#ababab');
          }
        });
      }
    }
    // ======================================== Neels code ends here ========================================


    if ($('.option-group-title').length) {
      var selectedColor = $('.pdp__options-main [data-option-label="Color"] [data-option-current]').text();
      $('.option-group-title-value').html('')
      $('.pdp__options-main [data-option-color] input').each(function () {
        if ($(this).is(':checked')) {
          $(this).parents('.option-groups__group').find('.option-group-title-value').html(selectedColor);
        }
      })
    }
  }

  function pdpCompare() {
    function changeTableHeight() {
      let trHeight = $(document).find('.pdpCompare__table thead').height() - 24;
      $('.pdpCompare__table-th').css('minHeight', trHeight)
    }
    changeTableHeight()

    $(document).on('resize.pdpCompare', function () {
      $('.pdpCompare__table-th').css('minHeight', 'auto')
      changeTableHeight()
    })
  }

  function pdpBundleMix() {
    $(document).off('click.bundleRadio')
    $(document).off('click.addBundleMix')

    function fadeOutOfStockVariants(selectedVariant, $bundleWrapper) {
      const selectedVariantTitle = selectedVariant.attr('data-variant-options-title'),
            $bundleVariants = $bundleWrapper.find('.js-bundle-variant option');
      $bundleWrapper.find('.bundle-radio').removeClass('unavailable');
      if (selectedVariant.length) {
        if (selectedVariantTitle.includes('/')) {
          const selectedSizeTitle = selectedVariantTitle.split('/')[1],
              unavailableColors = $bundleVariants.map(function () {
                if ($(this).attr('data-variant-options-title').includes(selectedSizeTitle) && $(this).is('[disabled]') && !$(this).attr('data-variant-preorder')) return $(this).attr('data-variant-options-title').split('/')[0]
              })
          if (unavailableColors.length) unavailableColors.each((i, color) => $bundleWrapper.find('input[value="'+ color +'"]').parent().addClass('unavailable'))
        } else {
          const unavailableVariants = $bundleVariants.map(function () {
            if ($(this).is('[disabled]') && !$(this).attr('data-variant-preorder')) return $(this).attr('data-variant-options-title')
          })
          if (unavailableVariants.length) unavailableVariants.each((i, variant) => $bundleWrapper.find('input[value="'+ variant +'"]').parent().addClass('unavailable'))
        }
      } else {
        const unavailableVariants = $bundleVariants.map(function () {
          if ($(this).is('[disabled]') && !$(this).attr('data-variant-preorder')) return $(this).attr('data-variant-options-title')
        })
        if (unavailableVariants.length) unavailableVariants.each((i, variant) => $bundleWrapper.find('input[value="'+ variant +'"]').parent().addClass('unavailable'))
      }
    }

    function checkBundleVariantTitle(selectedVariant, checkedInputs) {
      const priceDifference = Number(selectedVariant.attr('data-bundle-price-difference'));
      selectedVariant.attr('selected', 'selected')
      selectedVariant.parent().attr('value', selectedVariant.val())
      checkedInputs.each(function() {
        // $(this).parents('.bundle-product__option-group').find('.option-title-value').html(`${$(this).attr('title')}`)
        $(this).parents('.bundle-product__option-group').find('.option-title-value').html(`${$(this).attr('title').split('(')[0]}`) // Remove the price when changing the variant name
      })
      // let optionTitle = (priceDifference > 0) ? `${$(checkedInputs.get(0)).attr('title')} <strong>(+$${priceDifference})</strong>` : `${$(checkedInputs.get(0)).attr('title')}`;
      let optionTitle = `${$(checkedInputs.get(0)).attr('title')}`; // Remove the price from the color variant
      $(checkedInputs.get(0)).parents('.bundle-product__option-group').find('.option-title-value').html(optionTitle)
    }

    $(document).find('.bundle-product').each(function () {
      let selectedOptions = '',
          $bundleWrapper = $(this),
          checkedInputs = $(this).find('.bundle-radio-group input:checked'),
          checkedOptions = $(this).find('.bundle-radio-group input:checked').map((i, option) => option.value);
      checkedOptions.each((i, option) => selectedOptions = (i !== checkedOptions.length - 1) ? selectedOptions + option + '/' : selectedOptions + option)
      $(this).find('.js-bundle-variant option').removeAttr('selected')
      let selectedVariant = $(this).find('[data-variant-options-title="' + selectedOptions + '"]');
      (selectedVariant.attr('data-variant-preorder')) ? selectedVariant.parent().attr('data-selected-variant-preorder', true) : selectedVariant.parent().removeAttr('data-selected-variant-preorder');
      checkBundleVariantTitle(selectedVariant, checkedInputs)
      fadeOutOfStockVariants(selectedVariant, $bundleWrapper)
    })

    function checkBundleMixAvailable(unavailableProduct) {
      var $disabledOptions = $(document).find('.js-bundle-variant option:disabled'),
          checkForSelected = $disabledOptions.filter((i, e) => e.hasAttribute('selected'));

      if (checkForSelected.length) {
        $(document).find('#pdp-bundle-atc').attr('disabled', 'disabled').text('Out Of Stock')
        $(document).find('#pdp-sticky-atc').attr('disabled', 'disabled').text('Out Of Stock')
      } else if (unavailableProduct) {
        $(document).find('#pdp-bundle-atc').attr('disabled', 'disabled').text('Unavailable')
        $(document).find('#pdp-sticky-atc').attr('disabled', 'disabled').text('Unavailable')
      } else {
        $(document).find('#pdp-bundle-atc').removeAttr('disabled').text('Add to Cart')
        $(document).find('#pdp-sticky-atc').removeAttr('disabled').text('Add to Cart')
      }
    }
    checkBundleMixAvailable()

    function changeBundleImage(variantUniqID) {
      let $selectedImage = $('[data-variant-media="' + variantUniqID + '"]');
      $selectedImage.parent().find('[data-variant-media]:visible').css('visibility','hidden')
      $selectedImage.css('visibility','visible')
    }

    function checkBundleMixPrice() {
      let priceDiffSum = 0,
          selectedMixVariants = $(document).find('.bundle-product .js-bundle-variant option[selected]'),
          priceDiffArray = selectedMixVariants.map((i, variant) => {return Number(variant.dataset.bundlePriceDifference)});
      priceDiffArray.each((i, priceDiff) => priceDiffSum += priceDiff || 0);

      const newCompareAtPrice = (window.theme.product.compare_at_price * 0.01) + priceDiffSum,
            newPrice = (window.theme.product.price * 0.01) + priceDiffSum,
            priceInner = $('[data-product-price]'),
            compareAtPriceInner = $('[data-compare-at-price] span');

      priceInner.each((i, element) => $(element).text('$' + newPrice))
      compareAtPriceInner.each((i, element) => $(element).text('$' + newCompareAtPrice))
    }
    checkBundleMixPrice()

    function checkPreorderVariant() {
      $('.pdpForm .bundle-product select').each((i, select) => {
        if ($(select).attr('data-selected-variant-preorder')) {
          $(document).find('#pdp-bundle-atc').removeAttr('disabled').text('Pre-order')
          $(document).find('#pdp-sticky-atc').removeAttr('disabled').text('Pre-order')
        }
      })
    }
    checkPreorderVariant()

    $(document).on('click.bundleRadio', '.bundle-radio', function () {
      let $bundleWrapper = $(this).parents('.bundle-product'),
          selectedOptions = '',
          checkedInputs = $bundleWrapper.find('.bundle-radio-group input:checked'),
          checkedOptions = $bundleWrapper.find('.bundle-radio-group input:checked').map((i, option) => option.value);
      checkedOptions.each((i, option) => selectedOptions = (i !== checkedOptions.length - 1) ? selectedOptions + option + '/' : selectedOptions + option);
      let selectedVariant = $bundleWrapper.find('[data-variant-options-title="' + selectedOptions + '"]');
      $bundleWrapper.find('.js-bundle-variant option').removeAttr('selected');
      selectedVariant.attr('selected', 'selected');
      selectedVariant.parent().attr('value', selectedVariant.val());
      (selectedVariant.attr('data-variant-preorder')) ? selectedVariant.parent().attr('data-selected-variant-preorder', true) : selectedVariant.parent().removeAttr('data-selected-variant-preorder');
      checkBundleVariantTitle(selectedVariant, checkedInputs);
      fadeOutOfStockVariants(selectedVariant, $bundleWrapper);
      if (selectedVariant.length) {
        changeBundleImage(selectedVariant.attr('data-variant-uniq_id'));
        checkBundleMixAvailable();
      } else {
        checkBundleMixAvailable(true);
      }
      checkPreorderVariant()
      checkBundleMixPrice()
    })

    $(document).on('click.addBundleMix', '#pdp-bundle-mix-atc', function (e) {
      e.preventDefault();
      var $selectedBundleOptions = $(this).parents('.pdpForm').find('.js-bundle-variant select'),
          bundle_name = $(this).attr('data-bundle-name') || '',
          products_data = [],
          products = [];

      $selectedBundleOptions.each(function () {
        var variant_id = $(this).attr('value');
        products.push(variant_id);
      });

      products.sort();
      var current = null;
      var cnt = 0;
      for (var i = 0; i < products.length; i++) {
        if (products[i] !== current) {
          if (cnt > 0) {
            let prop = {
              "_bundles": true,
              "_Bundle_Name": bundle_name
            }

            if ($('.pdpForm .js-bundle-variant select[value="' + current + '"]').attr('data-selected-variant-preorder')) {
              prop = {
                "_bundles": true,
                "_Bundle_Name": bundle_name,
                "pre-order": true
              }
            }

            if (window.location.search.indexOf('pr_prod_strat') !== -1) prop._recommended_product = true;

            products_data.push({
              quantity: cnt,
              id: current,
              properties: prop
            })
          }
          current = products[i];
          cnt = 1;
        } else {
          cnt++;
        }
      }
      if (cnt > 0) {
        let prop = {
          "_bundles": true,
          "_Bundle_Name": bundle_name
        }

        if ($('.pdpForm .js-bundle-variant select[value="' + current + '"]').attr('data-selected-variant-preorder')) {
          prop = {
            "_bundles": true,
            "_Bundle_Name": bundle_name,
            "pre-order": true
          }
        }

        if (window.location.search.indexOf('pr_prod_strat') !== -1) prop._recommended_product = true;

        products_data.push({
          quantity: cnt,
          id: current,
          properties: prop
        })
      }

      theme.cart.cartEvent('/cart/add.js', {items: products_data}, true, theme.pdpErrorMessage)
    })
  }

  theme.pdpUpsellProduct = function() {
    $(document).off('click.upsellRadio')
    $(document).off('click.addUpsellProduct')
    var sizeNotSelected = $(document).find('.pdpForm  .pdpDetails__btns[data-disabled-size="true"]'),
        $productUpsell = $(document).find('.upsell-product');
    (sizeNotSelected.length) ? $productUpsell.hide() : $productUpsell.show()
    function checkUpsellAvailable(unavailableProduct) {
      var $disabledOptions = $(document).find('.js-product-upsell-variant option:disabled'),
          checkForSelected = $disabledOptions.filter((i, e) => e.hasAttribute('selected'));
      if (checkForSelected.length) {
        $(document).find('#pdp-product-upsell-atc').attr('disabled', 'disabled').text('Out Of Stock')
      } else if (unavailableProduct) {
        $(document).find('#pdp-product-upsell-atc').attr('disabled', 'disabled').text('Unavailable')
      } else {
        $(document).find('#pdp-product-upsell-atc').removeAttr('disabled').text('Add to Cart')
      }
    }
    checkUpsellAvailable()
    function changeUpsellImage(variantUniqID) {
      let $selectedImage = $(document).find('[data-upsell-variant-media="' + variantUniqID + '"]');
      $selectedImage.parent().find('[data-upsell-variant-media]:visible').css('visibility','hidden')
      $selectedImage.css('visibility','visible')
    }
    $(document).on('click.upsellRadio', '.upsell-radio', function () {
      let $upsellWrapper = $(this).parents('.upsell-product__wrapper'),
          selectedOptions = '',
          checkedInputs = $upsellWrapper.find('.upsell-radio-group input:checked'),
          checkedOptions = $upsellWrapper.find('.upsell-radio-group input:checked').map((i, option) => option.value);
      checkedOptions.each((i, option) => selectedOptions = (i !== checkedOptions.length - 1) ? selectedOptions + option + '/' : selectedOptions + option)
      checkedInputs.each(function() {
        $(this).parents('.upsell-product__option-group').find('.option-title-value').text($(this).attr('title'))
      })
      let selectedVariant = $upsellWrapper.find('[data-upsell-variant-options="' + selectedOptions + '"]');
      $upsellWrapper.find('.upsell-product__content-price').text(selectedVariant.attr('data-variant-price'))
      $upsellWrapper.find('.js-product-upsell-variant option').removeAttr('selected')
      selectedVariant.attr('selected', 'selected')
      selectedVariant.parent().attr('value', selectedVariant.val())
      if (selectedVariant.length) {
        changeUpsellImage(selectedVariant.attr('data-variant-uniq_id'));
        checkUpsellAvailable()
      } else {
        checkUpsellAvailable(true)
      }
    })
    $(document).on('click.addUpsellProduct', '#pdp-product-upsell-atc', function (e) {
      e.preventDefault();
      let selectedUpsellId = $(this).parents('.upsell-product__wrapper').find('.js-product-upsell-variant select').attr('value'),
          bodyObj = {
            id: selectedUpsellId,
            quantity: 1
          };
      function errorMessage(error) {
        if (error.status === 422) {
          let errorMessage = document.querySelector('#PdpUpsellErrorMessage')
          errorMessage.innerHTML = error.responseJSON.description
          errorMessage.style.display = 'block'
          setTimeout(() => {
            errorMessage.style.display = 'none'
            errorMessage.innerHTML = ''
          }, 3500);
        }
      }
      theme.cart.cartEvent('/cart/add.js', bodyObj, true, errorMessage)
    })
  }

  if ($('.pdpBar__wrapper').length) {pdpBar();}
  if ($('.pdpMain__gallery-thumbnails').length) {pdpThumbnails();}
  if ($('.pdpMain__gallery-wrapper').length) {pdpGallary();}
  if ($('.pdpMain__bundle-gallery').length) {pdpBundleGallary();}
  if ($('.upsell-product__wrapper').length) {theme.pdpUpsellProduct();}
  if ($('.bundle-product').length) {pdpBundleMix();}
  if ($('.pdpRecCollection').length) {theme.pdpRecCollection();}
  if ($('[data-dropdown]').length) {pdpDropdown();}
  if ($('.pdpMediaProof').length) {pdpMediaProof();}
  if ($('.pdpLearnMore').length) {pdpLearMore();}
  if ($('.pdpMain-bundle__details').length) {bundle();}
  if ($('.pdpCompare').length) {pdpCompare();}
  pdpStickyBar()
}

theme.pdpQuickView = function () {
  // Remove all $(document) Events
  // clicks:
  $(document).off('click.pdpQvSelectSize')
  $(document).off('mousedown.QvClose')


  $(document).on('mousedown.QvClose', function (e) {
    var $container = $('.Modal');
    if (!$container.is(e.target) && $container.has(e.target).length === 0) {
      theme.closeModal();
    }
  })

  $(document).on('click.pdpQvSelectSize', '#ProductQuickView [data-option-size] .radio', function () {
    var $attrToRemove = $('#ProductQuickView [data-disabled-size="true"]')
    $attrToRemove.map((index, element) => $(element).removeAttr('data-disabled-size'))
  })

  function modalGallerySlider() {
    let $gallerySlider = $('#ProductQuickView .pdpMain__gallery-wrapper'),
        $thumbnailsSlider = $('#ProductQuickView .pdpMain__gallery-thumbnails');

    $gallerySlider.slick({
      slidesToShow: 1,
      slidesToScroll: 1,
      arrows: false,
      dots: false,
      autoplay: false,
      infinite: false,
      fade: true,
      asNavFor: $thumbnailsSlider
    });

    $thumbnailsSlider.slick({
      slidesToShow: 6,
      slidesToScroll: 1,
      vertical: true,
      verticalSwiping: true,
      arrows: false,
      dots: false,
      autoplay: false,
      infinite: false,
      adaptiveHeight: true,
      focusOnSelect: true,
      asNavFor: $gallerySlider,
    });
  }

  setTimeout(modalGallerySlider, 0);
  setTimeout(theme.qvChangeSlide, 0);
}

theme.collectionAndSearch = function (isSearchPage) {
  // Remove all $(document) Events
  $(document).off('keypress.dropdownFilters click.dropdownFilters')
  $(document).off('click.deleteFilterResult')
  $(document).off('click.mobileFilterBar')
  $(document).off('click.mobileClearAll')
  $(document).off('change.inputFilters')
  $(document).off('input.changeRange')
  $(document).off('resize.filter')

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
  $(document).off('click.searchBarToggle');
  $(document).off('mouseover.searchBarOpen');
  $(document).off('mousedown.searchBarClose');
  $(document).off('input.onInput');
  $(document).off('click.resetSearch');
  $(document).off('submit.headerSearchForm');


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

  function toggleSearch () {
    if ($searchBar.attr('aria-hidden') === 'false') {
      theme.closeSearch();
    } else {
      openSearch();
    }
  }

  theme.closeSearch = function () {
    $searchBar.attr('aria-hidden', 'true');
    $searchBar.slideUp();
    $searchBarToggle.attr('aria-expanded', 'false');
    $searchBar.removeClass('loading');
  }

  function openSearch () {
    $searchBar.attr('aria-hidden', 'false');
    $searchBar.slideDown();
    $searchBarToggle.attr('aria-expanded', 'true');
    inputFocus();
  }

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

  $(document).on('click.searchBarToggle', '.mobileMenu__link[data-action="toggle-search"]', function (event) {
    event.preventDefault();
    toggleSearch();
  });

  $(document).on('mouseover.searchBarOpen', '#search-bar-button[data-action="toggle-search"]', function (event) {
    event.preventDefault();
    openSearch();
    $('.newHeader__openedBlock[aria-hidden="false"]').slideUp();
    $('.newHeader__openedBlock[aria-hidden="false"]').attr('aria-hidden', 'true');
    $('.newHeader__link[data-selected="true"]').attr('data-selected', 'false');
  });

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

  $(document).on('mousedown.searchBarClose', function (e) {
    if (!$searchBar.is(e.target) && $searchBar.has(e.target).length === 0 && $searchBarToggle.has(e.target).length === 0) {
      theme.closeSearch();
    }
  })

}

theme.searchPage = function () {
  $(document).off('click.resetMainSearchInput');
  $(document).off('input.onInputMain');
  $(document).off('submit.mainSearchForm');

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

$(document).ready(function () {
  theme.header()

  theme.GLOBAL()

  theme.headerHeight();

  $(window).on('resize', $.debounce(300, function () {
    theme.headerHeight();
  }));

})

theme.GLOBAL = function () {
  // Remove all $(document) Events
  // clicks:
  $(document).off('click.toggleTab')
  $(document).off('click.closeModal')
  $(document).off('click.closeQvFullPage')
  $(document).off('click.dataQuickView')
  $(document).off('click.quickViewATC')
  $(document).off('click.jsCounterRemove')
  $(document).off('click.radioGroup')
  //PDP
  $(document).off('click.pdpDropdown')
  $(document).off('click.pdpStickyAtc')
  $(document).off('click.pdpStickyOptions')
  $(document).off('click.pdpStickySize')
  $(document).off('click.pdpStickyCloseSize')
  $(document).off('click.pdpLearMoreShowAll')
  $(document).off('click.pdpSelectSize')
  $(document).off('click.click.pdpStickySelectSize')
  // scrolls:
  $(document).off('scroll.galleryImage')
  $(document).off('scroll.pdpStickyBar')
  $(window).off('scroll.pdp')
  // resize:
  $(window).off("resize.pdp");

  $(document).on('click.toggleTab', '[data-action="toggle-tab"]', function () {
    theme.toggleTab($(this));

    if ($('.FeaturedCollections__CollectionLink').length) {
      let $parentElement = $(this).closest('.FeaturedCollections__TabsHeader');
      $($parentElement.find('.FeaturedCollections__CollectionLink')).attr('href', $(this).attr('data-link-url')).text($(this).attr('data-link-title'));

      let $tabList = $('.FeaturedCollections__TabsList')[0];
      let $elements = $('.FeaturedCollections__TabButton');

      theme.horizontalScroll($tabList, $elements, 50);
    }
  })

  if ($('.FeaturedCollections__ProductsTabs').length) {
    $('.FeaturedCollections__ScrollNext').on('click', function () {
      $(this).parent().animate({scrollLeft: $(this).parent().width()}, 600);
    })

    $('.FeaturedCollections__ScrollPrev').on('click', function () {
      $(this).parent().animate({scrollLeft: 0}, 300);
    })
  }

  $(document).on('click.closeModal', '#closeModal', function () {
    theme.closeModal();
  });

  $(document).on('click.closeQvFullPage', '.QuickView__FullPageLink', function () {
    theme.closeModal();
  });

  $(document).on('click.dataQuickView', '[data-quick-view]', function () {
    let viewURL = $(this).attr('data-quick-view');
    theme.quickView(viewURL, $('#modalContent'));
  });

  $(document).on('click.quickViewATC', '#ProductQuickView .js-counter-add', function () {
    qvChangeQTY(1);
    theme.qvVariantChange ();
  })

  $(document).on('click.jsCounterRemove', '#ProductQuickView .js-counter-remove', function () {
    qvChangeQTY(-1);
    theme.qvVariantChange ();
  })

  $(document).on('click.radioGroup', '#ProductQuickView .radio-group label', function () {
    let optionName = $($(this).find('input')).attr('name');
    let optionValue = $($(this).find('input')).attr('value');
    let $currentOption = $('[data-option-current]');

      // ======================================== Neels code starts here ========================================
    // Create variable isDisabled if the input field is disabled so that the qvVariantChange function is not called when clicked
    // This is required as even with the HTML disabled attribute the variant is still changed in the quick add popup
    if ($($(this).find('input')).is(':disabled')) {
      var isDisabled = true;
    }

    $currentOption.each(function () {
      if ($(this).attr('data-option-current') == optionName) {
        if(!(isDisabled)){
          $(this).text(optionValue);
          theme.qvVariantChange();
        }
      }
    })
    // ======================================== Neels code ends here ========================================


    setTimeout(theme.qvChangeSlide, 0)
  });


  function qvChangeQTY (point) {
    let currentValue = parseInt($('.js-counter-quantity').val(), 10);
    let setValue = currentValue + point;
    if (setValue < 1) {
      setValue = 1;
    }

    $('.js-counter-quantity').val(setValue);
  }

  theme.qvChangeColorGroupName = function () {
    if ($('#ProductQuickView .option-group-title').length) {
      var QuickViewColor = $('#ProductQuickView .pdp__options-main [data-option-label="Color"] [data-option-current]').text();
      if (QuickViewColor.indexOf(':') >= 0) {
        QuickViewColor = QuickViewColor.split(':')[1];
      }
      $('#ProductQuickView .option-group-title-value').html('')
      $('#ProductQuickView .pdp__options-main [data-option-color] input').each(function () {
        if ($(this).is(':checked')) {
          $(this).parents('#ProductQuickView .option-groups__group').find('.option-group-title-value').html(QuickViewColor)
        }
      })
    }
  }

    // ======================================== Neels code starts here ========================================
  var popup_is_size_selected = false;
  $(document).on('click', '.pdpQuickView__description input[name^="Size"]', () => {
    popup_is_size_selected = true
  })
  // ======================================== Neels code ends here ========================================


  theme.qvVariantChange = function () {


    let selectedOption = $('#ProductQuickView .radio-group input:checked');

    var currentOptions = $.map(selectedOption, function(element, index) {
      var $element = $(element);
      var currentOption = {};

        currentOption.value = $element.val();
        currentOption.index = `option${index + 1}`;
        return currentOption;
    });

    if (selectedOption.length <= 3) {
      $('#ProductQuickView #quickAdd').attr('disabled', 'disabled');
      let selectedOption1 = $(selectedOption[0]).attr('value');
      let selectedOption2 = $(selectedOption[1]).attr('value');
      let selectedOption3 = $(selectedOption[2]).attr('value');

      let innerJSON = $('#productJson-' + $($('#ProductQuickView').closest('[data-product-id]')).attr('data-product-id')).html();
      let productJSON  = $.parseJSON(innerJSON)['product'];
      let variants = productJSON['variants'];

      var selectedVariant = function() {
        var selectedValues = currentOptions;
        var found = false;

        variants.forEach(function(variant) {
          var satisfied = true;

          selectedValues.forEach(function(option) {
            if (satisfied) {
              satisfied = (option.value === variant[option.index]);
            }
          });

          if (satisfied) {
            found = variant;
          }
        });

        return found || null;
      };

      if (selectedVariant()) {

         // ======================================== Neels code starts here ========================================
        var selectedColor = $('.pdp__options-main [data-option-label="Color"] [data-option-current]').text();
        var selectedSize = theme.handleize($('.pdp__options-main [data-option-label="Size"] [data-option-current]').text());
        var selectedQuantity = theme.handleize($('.pdp__options-main [data-option-label="Quantity"] [data-option-current]').text());
        var qvDescription = $('.pdpQuickView__description');
        var all_colors = [];
        var all_sizes = [];
        var all_quantities = [];

        // In the quick add popup the product color titles have the ":" text appended to them so we need to splice this
        if (selectedColor.includes(":")) {
          selectedColor = selectedColor.split(':')[1].trim();
        }

        if (selectedColor) {
          selectedColor = theme.handleize(selectedColor)
        }

        if (selectedColor && selectedSize) {
          // Enable all sizes and return to default styling now that a new variant option has been selected
          $('.pdp__options-main input[name^="Color"]').each(function () {
            var colorhandle = theme.handleize($(this).attr('title'));
            qvDescription.find('#' + colorhandle.toString()).removeAttr('disabled', 'disabled');
            qvDescription.find('div[data-color^="' + colorhandle + '"]').css('opacity', '');
          });

          // Enable all sizes and return to default styling now that a new variant option has been selected
          $('.pdp__options-main input[name^="Size"]').each(function () {
            var sizevar = $(this).attr('title');
            var sizehandle = theme.handleize(sizevar);
            qvDescription.find('#' + sizehandle.toString()).removeAttr('disabled', 'disabled');
            qvDescription.find('div[data-size^="' + sizehandle + '"]').css('opacity', '');
            qvDescription.find('span[data-size^="' + sizevar + '"]').css('text-decoration', '');
          });

          // Enable all quantities and return to default styling now that a new variant option has been selected
          $('.pdp__options-main input[name^="Quantity"]').each(function () {
            var quantityvar = $(this).attr('title');
            var quantityhandle = theme.handleize(quantityvar);
            qvDescription.find('#' + quantityhandle.toString()).removeAttr('disabled', 'disabled');
            qvDescription.find('div[data-quantity^="' + quantityhandle + '"]').css('color', '');
            qvDescription.find('span[data-quantity^="' + quantityvar + '"]').css('text-decoration', '');
          });

          // Add all colors to the all_colors array list
          $('.pdp__options-main span[data-color]').each(function () {
            if (all_colors.indexOf(theme.handleize($(this).data('color'))) === -1) {
              all_colors.push(theme.handleize($(this).data('color')));
            }
          });
          // Add all sizes to the all_sizes array list
          $('.pdp__options-main span[data-size]').each(function () {
            if (all_sizes.indexOf(theme.handleize($(this).data('size'))) === -1) {
              all_sizes.push(theme.handleize($(this).data('size')));
            }
          });
          // Add all quantities to the all_quantities array list
          $('.pdp__options-main span[data-quantity]').each(function () {
            if (all_quantities.indexOf(theme.handleize($(this).data('quantity'))) === -1) {
              all_quantities.push(theme.handleize($(this).data('quantity')));
            }
          });

          // Create hasQuantities variable if the quantities array is populated, else we know the product only has color and size options
          if (all_quantities.length) {
            var hasQuantities = true;
          }

          // Loop all variants of the selected product
          for (i = 0; i < json_product.variants.length; i++) {
            var variant = json_product.variants[i];
            if (selectedColor) {
              var color = variant.option1;
              // If the color option contains the string ":" we need to strip this
              if (color.indexOf(":") > -1) {
                color = color.split(':')[1].trim();
              }
              if (color) color = theme.handleize(color)
            }

            if (variant.option2) var size = theme.handleize(variant.option2);
            if (variant.option3) var quantity = theme.handleize(variant.option3);

            // Check if the product has 3 options of color, size and quantity
            if (hasQuantities) {
              // Check if the color and size selected by the customer is the current loop index color and size values
              if (color.indexOf(selectedColor) >= 0 && size.indexOf(selectedSize) >= 0) {
                if (all_quantities.length && all_quantities.indexOf(quantity) !== -1) {
                  const index = all_quantities.indexOf(quantity);
                  if (index > -1) {
                    all_quantities.splice(index, 1);
                  }
                }
              }
              // Check if the color and quantity selected by the customer is the current loop index color and quantity values
              if (color.indexOf(selectedColor) >= 0 && quantity.indexOf(selectedQuantity) >= 0) {
                if (all_sizes.indexOf(size) !== -1) {
                  const index = all_sizes.indexOf(size);
                  if (index > -1) {
                    all_sizes.splice(index, 1);
                  }
                }
              }
              // Check if the size and quantity selected by the customer is the current loop index size and quantity values
              if (size.indexOf(selectedSize) >= 0 && quantity.indexOf(selectedQuantity) >= 0) {
                if (all_colors.indexOf(color) !== -1) {
                  const index = all_colors.indexOf(color);
                  if (index > -1) {
                    all_colors.splice(index, 1);
                  }
                }
              }
            }
            // Product only has 2 options of color and size
            else {
              // Check if the color selected by the customer is the current loop index color
              if (color.indexOf(selectedColor) >= 0) {
                // Check if the current variant size exists in the all_sizes array and if so, remove it from the array
                if (all_sizes.indexOf(size) !== -1) {
                  const index = all_sizes.indexOf(size);
                  if (index > -1) {
                    all_sizes.splice(index, 1);
                  }
                }
              }
              // Check if the size selected by the customer is the current loop index size
              if (size.indexOf(selectedSize) >= 0) {
                // Check if the current variant color exists in the all_colors array and if so, remove it from the array
                if (all_colors.indexOf(color) !== -1) {
                  const index = all_colors.indexOf(color);
                  if (index > -1) {
                    all_colors.splice(index, 1);
                  }
                }
              }
            }
          }

          // Check if there are any colors left in the all_colors array and if so, disable these color buttons as they are unavailable colors for the selected variant
          if (popup_is_size_selected) {
            if (all_colors.length) {
              /// Loop all the color input elements
              $('.pdp__options-main input[name^="Color"]').each(function () {
                var colorvar = $(this).attr('title');
                var colorhandle = theme.handleize(colorvar);
                // If the color element is found in the all_colors list we need to disable this element as it is not an available color option
                if (all_colors.indexOf(colorhandle) > -1) {
                  qvDescription.find('#' + colorhandle).attr('disabled', 'disabled');
                  qvDescription.find('div[data-color^="' + colorhandle + '"]').css('opacity', '0.2');
                }
              });
            }

            // Check if there are any quantities left in the all_quantities array and if so, disable these quantity buttons as they are unavailable quantities for the selected variant color
            if (all_quantities.length) {
              $('.pdp__options-main input[name^="Quantity"]').each(function () {
                var quantityvar = $(this).attr('title');
                var quantityhandle = theme.handleize(quantityvar);
                // If the quantity element is found in the all_quantities list we need to disable this element as it is not an available quantity option
                if (all_quantities.indexOf(quantityhandle) > -1) {
                  qvDescription.find('#' + quantityhandle).attr('disabled', 'disabled');
                  qvDescription.find('div[data-quantity^="' + quantityhandle + '"]').css('color', '#ABABAB');
                  qvDescription.find('span[data-quantity^="' + quantityvar + '"]').css('text-decoration', 'line-through');
                }
              });
            }
          }

          // Check if there are any sizes left in the all_sizes array and if so, disable these size buttons as they are unavailable sizes for the selected variant color
          if (all_sizes.length) {
            $('.pdp__options-main input[name^="Size"]').each(function () {
              var sizevar = $(this).attr('title');
              var sizehandle = theme.handleize(sizevar);
              // If the size element is found in the all_sizes list we need to disable this element as it is not an available size option
              if (all_sizes.indexOf(sizehandle) > -1) {
                qvDescription.find('#' + sizehandle).attr('disabled', 'disabled');
                qvDescription.find('div[data-size^="' + sizehandle + '"]').css('opacity', '0.5');
                qvDescription.find('span[data-size^="' + sizevar + '"]').css('text-decoration', 'line-through');
              }
            });
          }
        }
        // ======================================== Neels code ends here ========================================


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

            var id = $('#ProductQuickView #selectid').find('[value="' + variants[i].id + '"]').data('variant-preorder');
            if(id == true){
               $('#quickAdd .js-atc-copy').text("Pre-order");
              if ($("#ProductQuickView input[name='properties[pre-order]']").length === 0) {
                $('#ProductQuickView form').append(`<input type="hidden" data-preorder="true" name="properties[pre-order]" value="true">`)
              }
            } else {
              $('#ProductQuickView [data-preorder]').remove();
            }
          }
        }
      } else {
        $($('#ProductQuickView #quickAdd').find('[data-atc-copy]')).text(window.theme.strings.unavailable);
      }
    }

    theme.qvChangeColorGroupName()
  }

  if (window.location.search.indexOf("contact") > -1) {
    $([document.documentElement, document.body]).animate({
      scrollTop: $('.footerInner__Left').offset().top + 500
    }, 100);
  }

  document.addEventListener('click', function (e) {
    if (e.target.closest('[data-add-id]')) {
      e.preventDefault();
      let form = e.target.closest('form'),
          bodyObj = theme.serializeObject(form);

      theme.cart.cartEvent('/cart/add.js', bodyObj, true, theme.pdpErrorMessage)
      theme.closeModal();
    }
  })

  if ($('[data-section-type]').attr('data-section-type') == 'slick-slideshow') {
    theme.slickSlider()
  }

  if ($('.collection').length || $('.searchMain').length) {
    if ($('.searchMain').length) {
      var isSearchPage = true;
    }

    theme.collectionAndSearch(isSearchPage);
  }

  if ($('.pdpMain').length) {
    theme.pdpMain()
  }

  if ($('.headerSearch').length) {
    theme.searchBar();
  }

  if ($('.searchMain').length) {
    theme.searchPage();
  }

  if ($('.cmProducts__card').length) {
    document.addEventListener('click', function (e) {
      if (e.target.closest('[data-marketplace-atc]')) {
        e.preventDefault();
        let form = e.target.closest('form'),
            bodyObj = theme.serializeObject(form);

        theme.cart.cartEvent('/cart/add.js', bodyObj, true, theme.pdpErrorMessage)
        theme.closeModal();
      }
    })
  }

  /* Video play & pause button */

  $(document).on('click', '.mute-video', function () {
    let $videos = $(this).parent().find("video.landing__hero-video");
    if ($videos.length <= 0) return
    if ($videos.prop('muted')) {
      $videos.prop('muted', false);
      $(this).removeClass('unmute-video');
    } else {
      $videos.prop('muted', true);
      $(this).addClass('unmute-video');
    }
  });

  $(document).on('click', '.media-video', function () {
    let $videos = $(this).parent().find(".landing__hero-video");
    if (this.paused) {
      $videos.each(function () {$(this)[0].play()})
      $(this).parent().find(".play-button").fadeOut()
      if ($(this).parent().find(".pause-button").length) {
        $(this).parent().find(".pause-button").removeClass('hidden').fadeIn()
      }
    } else {
      $videos.each(function () {$(this)[0].pause()})
      $(this).parent().find(".play-button").removeClass('hidden').fadeIn()
      if ($(this).parent().find(".pause-button").length) {
        $(this).parent().find(".pause-button").fadeOut()
      }
    }
  });

  $(document).on('click', '.play-button', function () {
    let $videos = $(this).parent().find('.media-video');
    $videos.each(function () {$(this)[0].play()})
    $(this).parent().find(".play-button").fadeOut()
    if ($(this).parent().find(".pause-button").length) {
      $(this).parent().find(".pause-button").removeClass('hidden').fadeIn()
    }
  });

  $(document).on('click', '.pause-button', function () {
    let $videos = $(this).parent().find('.media-video');
    $videos.each(function () {$(this)[0].pause()})
    $(this).parent().find(".play-button").removeClass('hidden').fadeIn()
    $(this).parent().find(".pause-button").fadeOut()
  });

  if ($('form[action^="htpps://www.facebook.com"]').length) {
    $('form[action^="htpps://www.facebook.com"]').attr('aria-hidden', 'true')
  }
}

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
        const recommendedProducts = this.querySelectorAll('.productCard');
        if (typeof window.yotpo !== "undefined") window.yotpo.initWidgets();
        recommendedProducts.forEach((Card) => theme.updateSwatches(Card));
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
  }

  quantityStepper(action) {
    this.quantityInput.value = (action === 'minus') ? Number(this.quantityInput.value) - 1 : Number(this.quantityInput.value) + 1
    if (this.singleStepper === 'true') {
      this.minusBtn.setAttribute('disabled', 'disabled')
      this.plusBtn.setAttribute('disabled', 'disabled')
    }
    const evt = new Event('change');
    this.quantityInput.dispatchEvent(evt)
  }
}

customElements.define('quantity-stepper', quantityStepper);


class ModalDialog extends HTMLElement {
  constructor() {
    super();
    this.content = this.querySelector('[role="dialog"]')
    this.querySelector('[id^="ModalClose-"]').addEventListener(
        'click',
        this.hide.bind(this)
    );
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
document.addEventListener('click', (e) => {
  document.querySelectorAll('[data-dropdown]').forEach((item) => {
    if (item.contains(e.target) && !e.target.closest('[data-dropdown-content]')) {
      e.target.closest('[data-dropdown]').classList.toggle('active')
    } else {
      item.classList.remove('active')
    }
  })
})
// End dropdown

// Slide toggle
class SlideToggle extends HTMLElement {
  constructor() {
    super();
    this.duration = this.dataset.duration || 200;
    this.slideTargetName = this.getAttribute('data-slide-toggle');
    this.slideTarget = document.querySelector('[data-slide-target="'+ this.slideTargetName + '"]')
    if (this.slideTarget) {
      this.addEventListener('click', (e) => {
        e.preventDefault();
        this.slideToggle()
      });
    }
  }

  slideToggle () {
    (!this.slideTarget.classList.contains('active')) ? this.slideToggleOpen() : this.slideToggleClose()
  }

  slideToggleOpen() {
    this.slideTarget.classList.add('active');
    this.slideTarget.style.height = 'auto';
    let height = this.slideTarget.clientHeight + "px";
    this.slideTarget.style.height = '0px';
    setTimeout( () => this.slideTarget.style.height = height, 0);
    setTimeout( () => {
      this.slideTarget.style.removeProperty('height');
      this.slideTarget.style.overflow = 'auto';
      this.classList.add('active');
    }, this.duration);
  }

  slideToggleClose() {
    this.slideTarget.style.overflow = 'hidden';
    this.slideTarget.animate({
      height: [this.slideTarget.clientHeight + 'px', '0px']
    }, {
      duration: this.duration,
      easing: 'linear'
    });
    setTimeout( () => {
      this.slideTarget.classList.remove('active');
      this.classList.remove('active');
    }, this.duration)
  }
}

customElements.define('slide-toggle', SlideToggle);
// End Slide toggle
