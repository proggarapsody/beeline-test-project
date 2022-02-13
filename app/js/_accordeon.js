const accordions = document.querySelectorAll('.sidebar__accordeon-header');

accordions.forEach((el) => {
  el.addEventListener('click', () => {
    el.classList.toggle('active');
    el.parentElement.lastElementChild.classList.toggle('visible');
  });
});
