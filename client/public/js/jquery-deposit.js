$(document).ready(function() {
  $('.item-table').on('mouseenter', '[data-toggle=popover]', function(e) {
    $(this).popover('show');
  });

  $('.item-table').on('mouseleave', '[data-toggle=popover]', function(e) {
    $(this).popover('hide');
  });

  $('.item-table').on('mousedown', '[data-toggle=popover]', function(){
    $(this).toggleClass('highlightCell');
  });
});
