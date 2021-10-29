function openPlayer() {
  var productMainSection = document.querySelector(".product-main-section");
  var playerAppContainer = document.querySelector(".player-app-container");

  playerAppContainer.classList.remove("show-element-block");
  productMainSection.classList.remove("hide-element");

  productMainSection.classList.add("hide-element");
  playerAppContainer.classList.add("show-element-block");

}

function hidePlayer() {
  var productMainSection = document.querySelector(".product-main-section");
  var playerAppContainer = document.querySelector(".player-app-container");

  playerAppContainer.classList.remove("show-element-block");
  productMainSection.classList.remove("hide-element");

}