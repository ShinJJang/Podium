$(function(){
	$("input, textarea").placeholder();
	
    $('#p_nav > .p_container').jScrollPane({horizontalGutter:5,verticalGutter:5,'showArrows': false,autoReinitialise: true, mouseWheelSpeed:30});
    $('#p_messages > .p_container').jScrollPane({horizontalGutter:5,verticalGutter:5,'showArrows': false,autoReinitialise: true, mouseWheelSpeed:30});
    
    
    $('.jspDrag').hide();
	
	$('.jspScrollable').mouseenter(function(){
		$(this).find('.jspDrag').stop(true, true).fadeIn('slow');
	});
	$('.jspScrollable').mouseleave(function(){
		$(this).find('.jspDrag').stop(true, true).fadeOut('slow');
	});
	
	$(".p_responses").click(function(){
		$(this).parent().children("section").toggle();
		$(this).toggleClass("opened");
		return false;
	});
});