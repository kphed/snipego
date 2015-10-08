$(document).ready(function() {

  $('.btn-popover').on('mouseenter', function(e) {
    $(this).popover('show');
  });

  $('.btn-popover').on('mouseleave', function(e) {
    $(this).popover('hide');
  });

});
