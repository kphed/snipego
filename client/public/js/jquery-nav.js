$(document).ready(function() {
  $('.nav-popover').on('mouseenter', function(e) {
    $(this).popover('show');
  });

  $('.nav-popover').on('mouseleave', function(e) {
    $(this).popover('hide');
  });
});
