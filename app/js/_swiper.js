import Swiper, { Navigation } from 'swiper';

const swiper = new Swiper('.swiper__content-catalog', {
  modules: [Navigation],
  direction: 'horizontal',
  loop: true,
  slidesPerView: 4,
  spaceBetween: 11,
  navigation: {
    nextEl: '.catalog__right-button',
    prevEl: '.catalog__left-button',
  },
});

const swiper2 = new Swiper('.swiper__content-catalog-2', {
  modules: [Navigation],
  direction: 'horizontal',
  loop: true,
  slidesPerView: 4,
  spaceBetween: 11,
  navigation: {
    nextEl: '.catalog__right-button-2',
    prevEl: '.catalog__left-button-2',
  },
});

const images = document.querySelectorAll('.catalog__item-header');

images.forEach(
  (el) =>
    (el.style.backgroundImage = `url(
      ../../../../assets/images/dist/catalog${el.dataset.image}.jpg)`)
);
