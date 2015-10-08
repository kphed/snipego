$(document).ready(function() {

  $('.itemContainer').on('mousedown', function(){
    $(this).toggleClass('highlightSelected');
  });

  $('.btn-popover').on('mouseenter', function(e) {
    $(this).popover('show');
  });

  $('.btn-popover').on('mouseleave', function(e) {
    $(this).popover('hide');
  });
});
