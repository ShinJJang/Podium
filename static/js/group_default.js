var delete_membership_noti = function(noti_id){
    var request_friend_url = "/api/v1/membershipnotis/"+noti_id+"/";
    $.ajax({
        type: "DELETE",
        url: request_friend_url,
        contentType: "application/json",
        dataType: "json",
        statusCode: {
            204: function (data) {
                console.log("member noti deleted = " + noti_id);
            }
        }
    });
};

// accept시 user는 자신이 아닌 수락 받는 user
var accept_membership = function(){
    $("#member_request > li > a").click(function() {
        var noti_id = $(this).attr("name");
        var user_key = $(this).attr("tag");
        var request_friend_url = "/api/v1/memberships/";
        var data = JSON.stringify({
            "group_key": group_id,
            "user_key": user_key
        });
        $.ajax({
            type: "POST",
            url: request_friend_url,
            contentType: "application/json",
            data: data,
            dataType: "json",
            statusCode: {
                201: function (data) {
                    console.log("member accept click");
                    delete_membership_noti(noti_id);
                    $("#friendStatus").html('<span class="friend">가입됨</span>');
                }
            }
        });
    });
};

var get_member_request= function(){
    var feedback_url = "/api/v1/membershipnotis/?noti_group_key="+group_id+"&limit=8"; // TODO - 그룹 가입 요청 일정 갯수 이상시, 관리페이지로 안내
    $.ajax({
        type: "GET",
        url: feedback_url,
        contentType: "application/json",
        dataType: "json",
        statusCode: {
            200: function(data) {
                console.log("get member request");
                console.log(data);
                for(var index in data.objects) {
                    $("#member_request").append("<li><a href='#' name="+data.objects[index].id+" tag="+data.objects[index].noti_user_key.id+"><span>"+data.objects[index].noti_user_key.username+"</span></a></li>");
                }
                accept_membership();
                return false;
            }
        }
    });
};
if(permission > 0) {
    get_member_request();
}

var request_membership = function(){
    $('#addFriend').click(function() {
        var request_friend_url = "/api/v1/membershipnotis/";
        var data = JSON.stringify({
            "noti_group_key": group_id,
            "noti_user_key": user_id
        });
        $.ajax({
            type: "POST",
            url: request_friend_url,
            contentType: "application/json",
            data: data,
            dataType: "json",
            statusCode: {
                201: function (data) {
                    console.log("request membership!");
                    $("#friendStatus").html('<span class="friend">요청 중</span>'); // TODO - 클릭시 요청 취소 Dropdown
                }
            }
        });
    });
};

var check_membership_noti = function(){
    var feedback_url = "/api/v1/membershipnotis/?noti_group_key="+group_id+"&noti_user_key="+user_id;
    $.ajax({
        type: "GET",
        url: feedback_url,
        contentType: "application/json",
        dataType: "json",
        statusCode: {
            200: function (data) {
                if(data.meta.total_count) {
                    console.log("already request member!");
                    $("#friendStatus").html('<span class="friend">요청 중</span>');
                }
                else {
                    console.log("not member!")
                    $("#friendStatus").html('<a href="#" id="addFriend">그룹 신청</span>');
                    request_membership();
                    return false;
                }
            }
        }
    });
};

$(function(){
    var feedback_url = "/api/v1/memberships/?group_key="+group_id+"&user_key="+user_id;
    $.ajax({
        type: "GET",
        url: feedback_url,
        contentType: "application/json",
        dataType: "json",
        statusCode: {
            200: function (data) {
                console.log("membership data");
                console.log(data);
                if(data.meta.total_count) {
                    console.log("already member!");
                    $("#friendStatus").html('<span class="friend">가입됨</span>');
                }
                else {
                    check_membership_noti();
                }
            }
        }
    });
});

$("select[name=group]").hide();

$(".member_leave").click(function() {
    var feedback_api = "/api/v1/memberships/"+membership_id+"/"
    $.ajax({
        url: feedback_api,
        type: "DELETE",
        dataType: "json",
        statusCode:{
            204: function(data) {
                console.log(data);
                console.log("I quit this group!");
                if(open_scope == 2)
                    window.location.assign("/");
                else {
                    $(".group_menu_admin").remove();
                }

            }
        }
    });
});