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

    $("#p_messages #p_chat").load('/chat');

    var weatherCode = 28805879;
    w_getWeather(weatherCode);
});

var w_getWeather = function (code) {
    var qUrl = 'http://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20weather.forecast%20where%20woeid%3D' + code + '%20and%20u%3D%22c%22&format=json&diagnostics=true&callback=cbfunc';
    $.ajax({
        url: qUrl,
        dataType: 'jsonp',
        jsonp: 'callback',
        jsonpCallback: 'cbfunc',
        success: function(data) {
            var weatherType;
            switch(parseInt(data.query.results.channel.item.condition.code)) {
                case 0:
                    weatherType="토네이도";
                    break;
                case 1:
                    weatherType="폭풍우";
                    break;
                case 2:
                    weatherType="태풍";
                    break;
                case 3:
                    weatherType="뇌우";
                    break;
                case 4:
                    weatherType="뇌우";
                    break;
                case 5:
                    weatherType="진눈깨비";
                    break;
                case 6:
                    weatherType="진눈깨비";
                    break;
                case 7:
                    weatherType="진눈깨비";
                    break;
                case 8:
                    weatherType="이슬비";
                    break;
                case 9:
                    weatherType="이슬비";
                    break;
                case 10:
                    weatherType="비";
                    break;
                case 11:
                    weatherType="비";
                    break;
                case 12:
                    weatherType="비";
                    break;
                case 13:
                    weatherType="눈보라";
                    break;
                case 14:
                    weatherType="눈";
                    break;
                case 15:
                    weatherType="눈";
                    break;
                case 16:
                    weatherType="눈";
                    break;
                case 17:
                    weatherType="우박";
                    break;
                case 18:
                    weatherType="진눈깨비";
                    break;
                case 19:
                    weatherType="황사";
                    break;
                case 20:
                    weatherType="안개";
                    break;
                case 21:
                    weatherType="아지랑이";
                    break;
                case 22:
                    weatherType="스모그";
                    break;
                case 23:
                    weatherType="강풍";
                    break;
                case 24:
                    weatherType="바람";
                    break;
                case 25:
                    weatherType="추움";
                    break;
                case 26:
                    weatherType="흐림";
                    break;
                case 27:
                    weatherType="다소 흐림";
                    break;
                case 28:
                    weatherType="다소 흐림";
                    break;
                case 29:
                    weatherType="조금 흐림";
                    break;
                case 30:
                    weatherType="조금 흐림";
                    break;
                case 31:
                    weatherType="맑음";
                    break;
                case 32:
                    weatherType="맑음";
                    break;
                case 33:
                    weatherType="맑음";
                    break;
                case 34:
                    weatherType="맑음";
                    break;
                case 35:
                    weatherType="뇌우";
                    break;
                case 36:
                    weatherType="더움";
                    break;
                case 37:
                    weatherType="뇌우";
                    break;
                case 38:
                    weatherType="뇌우";
                    break;
                case 39:
                    weatherType="비";
                    break;
                case 40:
                    weatherType="비";
                    break;
                case 41:
                    weatherType="폭설";
                    break;
                case 42:
                    weatherType="폭설";
                    break;
                case 43:
                    weatherType="눈보라";
                    break;
                case 44:
                    weatherType="조금 흐림";
                    break;
                case 45:
                    weatherType="비";
                    break;
                case 46:
                    weatherType="눈";
                    break;
                case 47:
                    weatherType="뇌우";
                    break;
                default:
                    weatherType="알 수 없음";
            }
            $("#weatherBox .weather").addClass("weather-"+data.query.results.channel.item.condition.code).html("<strong>"+weatherType+"</strong> "+data.query.results.channel.item.condition.temp+"℃ ("+data.query.results.channel.item.forecast[0].low+"℃ ~ "+data.query.results.channel.item.forecast[0].high+"℃)").css("background-position","0 -"+parseInt(data.query.results.channel.item.condition.code)*30+"px");
            var today = new Date();
            var day = new Array("일","월","화","수","목","금","토");
            $("#weatherBox h2").html(today.getFullYear() + "년 " + (today.getMonth()+1)+"월 " + today.getDate()+"일 (" + day[today.getDay()] + ")" );
        },
        error: function(xhr, textStatus, errorThrown) {
            console.error(textStatus)
        }
    });
}