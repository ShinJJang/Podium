$(function(){
    $(".pui .tooltip-top, .pui .tooltip-bottom").each(function(){
        $(this).css("margin-left","-"+($(this).outerWidth()/2)+"px");
    });

    $(".pui .tooltip-left").each(function(){
        $(this).css("left","-"+($(this).outerWidth()+5)+"px").css("margin-top","-"+($(this).outerHeight()/2)+"px");
    });

    $(".pui .tooltip-right").each(function(){
        $(this).css("right","-"+($(this).outerWidth()+5)+"px").css("margin-top","-"+($(this).outerHeight()/2)+"px");
    });
});