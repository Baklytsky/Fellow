window.addEventListener('DOMContentLoaded', () => {
  const qrCode = document.getElementById('QrCode');

  new QRCode(qrCode, {
    text: qrCode.dataset.identifier,
    width: 120,
    height: 120,
    imageAltText: theme.strings.qrImageAlt,
  });

  document
    .getElementById('GiftCardDigits')
    .addEventListener('focus', (event) => {
      event.target.select();
    });
});
