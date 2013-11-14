$(function(){
	$("input, textarea").placeholder();
	
    $('#p_messages > .p_container').jScrollPane({horizontalGutter:5, verticalGutter:5,'showArrows': false, autoReinitialise: true, mouseWheelSpeed:30, contentWidth:'0px'}).css("overflow","inherit");
    
    
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

    // message 창을 열지 말지 결정
    var messageOpen = false;
    var isChatSearchOn = false;

    $("#s2id_autogen1").focus(function(){
        messageOpen=true;
    });

    $("body").on("mouseover","#select2-drop",function(){
        messageOpen=true;
    }).on("select2-open","#chat_search_friend", function(){
        isChatSearchOn = true;
    }).on("select2-blur","#chat_search_friend", function(){
        isChatSearchOn = false;
    }).on("mouseover", "#p_messages", function(){
        $("#p_messages").addClass("opened").width("210px").css("z-index","25").css("background","#f4f4f4").css("border-left","1px #ccc solid").css("box-shadow","inset 0 0 5px rgba(0,0,0,0.1)");
        $("#p_messages>.p_container, #p_messages .jspContainer, #p_messages .jspPane").width("223px");
        $("#p_chatBoxContainer").css("right","220px");
        messageOpen=true;
    }).on("mouseout", "#p_messages", function(){
        closeChatBar();
    });

    var weatherCode = 28805879;
    w_getWeather(weatherCode);

    $("#p_messages").hover(function(){
        // #p_message에 mouseover시 창 열기

    }, function(){
        closeChatBar();
    });

    function closeChatBar(){
        // 마우스가 떠났을 때
        if(!isChatSearchOn) messageOpen=false;

        // 0.5초 안에 messageOpen이 true가 되지 않으면 창을 닫는다
        setTimeout(function(){
            if(!messageOpen) {
                $("#p_messages").removeClass("opened").removeAttr("style");
                $("#p_messages>.p_container, #p_messages .jspContainer, #p_messages .jspPane").width("88px");
                $("#p_timeline").css("margin-right","75px");
                $("#p_chatBoxContainer").css("right","85px");
            }
        }, 500);
    }
});

function showToast(msg){
    $("body").append('<div class="toast-message-wrapper"><div class="toast-message">'+msg+'</div></div>');
    $(".toast-message-wrapper").fadeIn("slow",function(){
        var messageBox = this;
        setTimeout(function(){$(messageBox).fadeOut("slow", function(){ $(this).remove() })}, 1000);
    });
}

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

// dropdown
$(document).ready(function(){
    $(".open_dropdown").click(function(){
        if($(this).hasClass("opened")){
            $(this).parent().children(".dropdown").hide();
            $(this).removeClass("opened");
        }
        else{
            $(this).parent().children(".dropdown").show();
            $(this).addClass("opened");
        }
        return false;
    });

    //Mouseup textarea false
    $(".dropdown").mouseup(function(){
        return false;
    });
    $(".open_dropdown").mouseup(function(){
        return false;
    });

    //Textarea without editing.
    $(document).mouseup(function(){
        $(".dropdown").hide();
        $(".open_dropdown").removeClass("opened");
        return false;
    });

    $("#live_list").on("click","li", function(){
        window.location = $(this).attr("data-targeturl");
        return false;
    })
});