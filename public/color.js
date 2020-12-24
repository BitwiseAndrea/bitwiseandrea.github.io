$(document).ready(function() {
  var html = $('html')[0];

  let last_known_scroll_position = 0;
  let ticking = false;

  function doSomething(scroll_pos) {
    var elementOffset = $('.footer').offset().top;
    var percentage = scroll_pos / elementOffset;
    html.style.backgroundColor = `rgb(${174 - (174 * percentage)}, ${194 - (194 * percentage)}, ${224 - (224 * percentage)})`;
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