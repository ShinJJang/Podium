$(function(){
    $(".pui .tooltip-top, .pui .tooltip-bottom").each(function(){
        $(this).css("margin-left","-"+($(this).outerWidth()/2)+"px");
    });
});