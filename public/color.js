$(document).ready(function() {
  var html = $('html')[0];

  let last_known_scroll_position = 0;
  let ticking = false;

  function doSomething(scroll_pos) {
    var scrollTop = $(window).scrollTop();
    var elementOffset = $('.footer').offset().top;
    html.style.backgroundColor = `rgba(0, 0, 0, ${scroll_pos / elementOffset})`;
  }

  document.addEventListener('scroll', function(e) {
    last_known_scroll_position = window.scrollY;

    if (!ticking) {
      window.requestAnimationFrame(function() {
        doSomething(last_known_scroll_position);
        ticking = false;
      });

      ticking = true;
    }
  });
});