$(document).ready(function () {
  theme.countdownTimer = function () {
    const second = 1000,
        minute = second * 60,
        hour = minute * 60,
        day = hour * 24;
    
    function timerText(period, periodName) {
      let number = (period < 10) ? '0' + period : period,
          separator = (periodName !== 'seconds') ? ' :' : '',
          text = number + ' ' + periodName + separator;
      return((number === '00' && periodName === 'days') ? '' : text)
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
      document.documentElement.style.setProperty('--header-height', document.getElementById('shopify-section-header').offsetHeight + 'px');
  }

  theme.headerHeight();
  $(window).resize(function () {
    theme.headerHeight();
  });

  if ($('.announcement-bar')) {
    theme.countdownTimer();
  }

  if ($('.pdpRecCollection').length) {
    theme.pdpRecCollection();
  }
})
