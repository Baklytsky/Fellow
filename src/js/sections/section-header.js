class Header extends HTMLElement {
  constructor() {
    super()
    this.megamenuWrapper = this.querySelector('.newHeader__openedBlock')
    this.burger = this.querySelector('.burgerMenu')
    this.mobileMenu = this.querySelector('.mobileMenu')
    this.mobileItem = this.querySelectorAll('.mobileMenu__item')
    this.megamenuLinks = this.querySelectorAll('.newHeader__MainLink')
    this.mobileSearch = this.querySelector('#header-search')
    this.searchInputs = this.querySelectorAll('.headerSearch__input')
    this.searchForms = this.querySelectorAll('.headerSearch__form')
    this.searchResetBtns = this.querySelectorAll('.searchForm__resetLabel')
    this.mobileSearchBarOpener = this.querySelector('.mobileMenu__link[data-action="toggle-search"]')
    this.timer = this.querySelector('.announcement-bar__timer')
    this.headerHeight()

    window.addEventListener('resize', ()=> {
      this.headerHeight()
      this.closeMenu()
      if (window.innerWidth > 992 && this.mobileMenu.classList.contains('active')) this.toggleBurger()
    })

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

    this.searchInputs.forEach(input => {
      input.addEventListener('input', theme.debounce(()=> {
        this.searchInputEvent(input)
      }, 350))
    })

    this.searchForms.forEach(form => {
      form.addEventListener('submit', (e)=> {
        e.preventDefault()
        this.searchSubmit(form)
      })

      form.addEventListener('reset', ()=> {
        const input = form.querySelector('.headerSearch__input')
        input.value = ''
        this.searchInputEvent(input)
      })
    })
  }

  headerHeight() {
    document.documentElement.style.setProperty('--header-height', document.getElementById('MainHeader').offsetHeight + 'px');
  }

  openMobileSearch() {
    this.mobileSearch.setAttribute('aria-hidden', 'false');
    theme.slideDown(this.mobileSearch, 200)
    this.mobileSearchBarOpener.setAttribute('aria-expanded', 'true');
    setTimeout(()=> {
      this.mobileSearch.querySelector('.headerSearch__input').focus();
    }, 100)
  }

  closeMobileSearch() {
    this.mobileSearch.setAttribute('aria-hidden', 'true')
    this.mobileSearchBarOpener.setAttribute('aria-expanded', 'false');
  }

  searchInputEvent(input) {
    const search = input.closest('.headerSearch'),
        searchResult = search.querySelector('.headerSearch__results'),
        searchResultWrapper = search.querySelector('.headerSearch__resultsHeader'),
        searchResultContent = search.querySelector('.headerSearch__resultsContent'),
        popularSearch = search.querySelector('.headerSearch__popularSearches'),
        mobilePopularSearch = search.querySelector('.search__popular'),
        emptySearch = search.querySelector('.headerSearch__emptyResults'),
        resetSearchBtn = search.querySelector('.headerSearch__resetLabel'),
        queryKey = input.value.trim().toLowerCase(),
        queryKeyReplace = queryKey.replace(/ /ig, '-');
    search.classList.add('loading')

    function togglePopularSearch(action) {
      const elToHide = (action === 'hide')
              ? [popularSearch, emptySearch, mobilePopularSearch]
              : [searchResultWrapper],
          elToShow = (action === 'hide')
              ? [searchResultWrapper]
              : [popularSearch, emptySearch, mobilePopularSearch];
      theme.hideElements(elToHide)
      theme.showElements(elToShow)
    }

    if (!queryKey) {
      search.classList.remove('loading')
      searchResultContent.innerHTML = ''
      theme.showElements([popularSearch, mobilePopularSearch])
      theme.hideElements([resetSearchBtn])
      return
    }

    if (queryKey) {
      if (mobilePopularSearch) mobilePopularSearch.style.display = 'none'
      resetSearchBtn.style.display = 'block'

      fetch(`/search/suggest.json?q=${queryKey}&resources[type]=product`)
          .then((response) => response.json())
          .then((suggestions) => {
            searchResultContent.innerHTML = ''
            const productSuggestions = suggestions.resources.results.products;
            let hiddenItems = 0;
            if (productSuggestions.length > 0) {
              productSuggestions.forEach((product) => {
                if (product.type !== "Gift product") {
                  const productTags = product.tags
                  const noSearchTags = [];

                  // Make array no search terms
                  productTags.forEach(value => {
                    const noSearchTag = value.toLowerCase().replace(/ /ig, '-').split('nosearch-')[1]
                    if (noSearchTag) noSearchTags.push(noSearchTag)
                  })

                  if (!noSearchTags.includes(queryKeyReplace)) {
                    const productItem = `<li class="headerSearch__item"><a href="${product.url}">${product.title}</a></li>`
                    searchResultContent.innerHTML += productItem
                  } else {
                    ++hiddenItems
                  }
                }
              })

              if (hiddenItems === productSuggestions.length) {
                togglePopularSearch()
              } else {
                togglePopularSearch('hide')
              }
            } else {
              togglePopularSearch()
            }
            search.classList.remove('loading')
          })
          .catch((error) => {
            search.classList.remove('loading')
            searchResult.setAttribute('aria-hidden', 'true');
          });
    }
  }

  searchSubmit(form) {
    const value = form.querySelector('input[type=search]').value.trim(),
        queryKey = value.toLowerCase();
    window.location.href = '/search?q=' + queryKey + '&options%5Bprefix%5D=last&type=product';
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
      if (this.mobileSearch.getAttribute('aria-hidden') === 'false') this.closeMobileSearch()
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

customElements.define('header-nav', Header);