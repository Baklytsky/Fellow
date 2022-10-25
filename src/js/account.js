class Account extends HTMLElement {
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
        const emailInput = form.querySelector('input[type=email]')
        const passInput = form.querySelector('input[type=password]')
        const phoneInput = form.querySelector('input[type=tel]')

        // Empty email validation
        if (emailInput && !this.emptyFieldValidation(emailInput, 'Please enter an email address')) {
          return false
        }

        // Empty pass validation
        if (passInput && !this.emptyFieldValidation(passInput, 'Please enter a password')) {
          return false
        }

        // Phone validation
        if (phoneInput) {
          if (!this.phoneValidation(phoneInput)) {
            phoneInput.closest('.input-wrapper').classList.add('input-error')
            return false
          }
        }

        if (checked.length) {
          this.checkKlaviyoEvents(KlaviyoCheckboxes, form)
        } else {
          if (!form.hasAttribute('data-accenture-form')) form.submit();
        }
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

    form.addEventListener('submit', (e)=> e.preventDefault())

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

        } else if (data.errors.phone !== undefined && data.errors.phone[0] === 'Phone has already been taken') {
          const message = 'Phone has already been taken';
          if (errorsInner) errorsInner.innerHTML += message;
          if (errorsContainer) errorsContainer.classList.remove('is-hidden');
          phoneInput.closest('.input-wrapper').classList.add('input-error')

        } else if (data.errors.phone !== undefined && data.errors.phone[0] === 'Enter a valid phone number to use this delivery method') {
          const message = 'Please enter a valid phone number';
          if (errorsInner) errorsInner.innerHTML += message;
          if (errorsContainer) errorsContainer.classList.remove('is-hidden');
          phoneInput.closest('.input-wrapper').classList.add('input-error')

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
    return (phoneValue === '') ? true : re.test(phoneValue)
  }

  emptyFieldValidation (input, errorMessage) {
    const inputValue = input.value
    let valid = true
    if (inputValue === null || inputValue === '') {
      const inputWrapper = input.closest('.input-wrapper')
      inputWrapper.classList.add('input-error')
      if (errorMessage) {
        inputWrapper.querySelector('.input-wrapper__error').innerHTML = errorMessage
      }
      valid = false
    }
    return valid
  }

  checkKlaviyoEvents(KlaviyoCheckboxes, form) {
    Promise.all(Array.from(KlaviyoCheckboxes).map(checkbox => {
      const formID = form.id;
      const email = form.querySelector('input[type=email]');
      const phone = form.querySelector('input[type=tel]');
      const listID = checkbox.dataset.klaviyoListId || null
      if (checkbox.checked && listID) return theme.klaviyoFetch(formID, email, phone, listID)
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
      this.errorMeseges.forEach(error => {
        if (error.querySelector('.account-error-inner')) error.querySelector('.account-error-inner').innerHTML = ''
        error.classList.add('is-hidden')
      })
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

customElements.define('account-element', Account);