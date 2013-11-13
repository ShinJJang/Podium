var delete_membership_noti = function(noti_id){
    var request_friend_url = "/api/v1/membershipnotis/"+noti_id+"/";
    $.ajax({
        type: "DELETE",
        url: request_friend_url,
        contentType: "application/json",
        dataType: "json",
        statusCode: {
            204: function () {
            }
        }
    });
};

// accept시 user는 자신이 아닌 수락 받는 user
var accept_membership = function(){
    $("#member_request").find("li").click(function() {
        var a_ = $(this).children("a");
        var noti_id = a_.attr("name");
        var user_key = a_.attr("tag");
        var request_friend_url = "/api/v1/memberships/";
        var data = JSON.stringify({
            "group_key": group_id,
            "user_key": user_key
        });
        $(this).remove();
        $.ajax({
            type: "POST",
            url: request_friend_url,
            contentType: "application/json",
            data: data,
            dataType: "json",
            statusCode: {
                201: function () {
                    delete_membership_noti(noti_id);
                    showToast("가입을 수락하였습니다");
                },
                400: function(data) {
                    showToast($.parseJSON(data.responseText).error);
                    get_member_request();
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
                for(var index in data.objects) {
                    $("#member_request").append("<li><a name="+data.objects[index].id+" tag="+data.objects[index].noti_user_key.id+"><span>"+data.objects[index].noti_user_key.username+"</span></a></li>");
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
        $("#friendStatus").html('<span class="friend">요청 중</span>'); // TODO - 클릭시 요청 취소 Dropdown
        $.ajax({
            type: "POST",
            url: request_friend_url,
            contentType: "application/json",
            data: data,
            dataType: "json",
            statusCode: {
                201: function() {
                    showToast("그룹 가입 신청이 되었습니다");
                },
                400: function(data) {
                    showToast($.parseJSON(data.responseText).error);
                    check_membership();
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

var check_membership = function(){
    var feedback_url = "/api/v1/memberships/?group_key="+group_id+"&user_key="+user_id;
    $.ajax({
        type: "GET",
        url: feedback_url,
        contentType: "application/json",
        dataType: "json",
        statusCode: {
            200: function (data) {
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
};
check_membership();

$("select[name=open_scope]").hide();


$(".member_leave").click(function() {
    var delete_level = decision_delete_level();
    var str_confirm = null;

    if (delete_level == 0) {
        str_confirm = "그룹을 탈퇴합니다. 탈퇴로 그룹에서 쓴 글과 댓글은 사라지지 않습니다.\n계속하시겠습니까?";
    }
    else if (delete_level == 1) {
        str_confirm = "탈퇴하시면 그룹의 소유자가 변경됩니다.\n계속하시겠습니까?";
    }
    else if (delete_level == 2) {
        str_confirm = "이외의 멤버가 없어 탈퇴하시면 그룹이 삭제됩니다.\n계속하시겠습니까?";
    }

    if(confirm(str_confirm) != true) {
        return false;
    }

    var feedback_api = "/api/v1/memberships/"+membership_id+"/"
    $.ajax({
        url: feedback_api,
        type: "DELETE",
        dataType: "json",
        statusCode:{
            204: function() {
                showToast("그룹을 탈퇴하였습니다");
                if(open_scope == 2)
                    window.location.assign("/");
                else {
                    $(".group_menu_admin").remove();
                }
                if (delete_level == 1) {
                    owner_inheritance();
                }
                else if (delete_level == 2) {
                    group_delete();
                }
                check_membership();
            }
        }
    });
});


var decision_delete_level = function(){
    var request_friend_url = "/api/v1/memberships/?group_key="+group_id;
    var result = null;
    $.ajax({
        type: "GET",
        url: request_friend_url,
        contentType: "application/json",
        dataType: "json",
        async: false,
        statusCode: {
            200: function (data) {
                if (data.meta.total_count == 1) {
                    result = 2;
                }
                else if (permission == 2) {
                    result = 1;
                }
                else {
                     result = 0;
                }
            }
        }
    });
    return result;
};

// 소유자 탈퇴시 그룹 소유 권한 상속
var owner_inheritance = function() {
    var request_friend_url = "/api/v1/memberships/?group_key="+group_id;
    $.ajax({
        type: "GET",
        url: request_friend_url,
        contentType: "application/json",
        dataType: "json",
        statusCode: {
            200: function (data) {
                var inheritance_member_id = null;
                for(var index in data.objects) {
                    var check_admin = data.objects[index].permission;

                    if (check_admin == 1) {
                        inheritance_member_id = data.objects[index].id;
                        break;
                    }
                }
                update_member_permission("PATCH", inheritance_member_id, 2);
            }
        }
    });
};