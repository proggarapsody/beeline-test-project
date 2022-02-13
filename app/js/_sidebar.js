const menuItems = document.querySelectorAll('.sidebar__accordeon-item');

menuItems.forEach((el) => {
  el.addEventListener('click', () => {
    if (!el.classList.contains('active')) {
      menuItems.forEach((item) => item.classList.remove('active'));
      el.classList.toggle('active');
    }
  });
});
