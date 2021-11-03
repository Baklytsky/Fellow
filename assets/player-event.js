function openPlayer() {
  var productMainSection = document.querySelector(".product-main-section");
  var playerAppContainer = document.querySelector(".player-app-container");

  playerAppContainer.classList.remove("show-element-block");
  productMainSection.classList.remove("hide-element");

  productMainSection.classList.add("hide-element");
  playerAppContainer.classList.add("show-element-block");
  document.getElementsByClassName('pdpFeature')[0].style.display = "none";
  document.getElementsByClassName('pdpCompare')[0].style.display = "none";
  document.getElementsByClassName('pdpLearnMore')[0].style.display = "none";

}

function hidePlayer() {
  var productMainSection = document.querySelector(".product-main-section");
  var playerAppContainer = document.querySelector(".player-app-container");

  playerAppContainer.classList.remove("show-element-block");
  productMainSection.classList.remove("hide-element");
  document.getElementsByClassName('pdpFeature')[0].style.display = "none";
  document.getElementsByClassName('pdpCompare')[0].style.display = "none";
  document.getElementsByClassName('pdpLearnMore')[0].style.display = "none";


}