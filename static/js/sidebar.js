var get_friendship_notis = function(){
    var feedback_url = "/api/v1/friend_noti/?noti_to_user="+user_id;
    $.ajax({
        type: "GET",
        url: feedback_url,
        contentType: "application/json",
        dataType: "json",
        statusCode: {
            200: function (data) {
                $("#friend_noti_count").html(data.meta.total_count);
                $("#ul_nav_request").html("");
                for(var index in data.objects) {
                    $("#ul_nav_request").append("<li><a href=/people/"+data.objects[index].noti_from_user.id+">"+data.objects[index].noti_from_user.username+"</a></li>");
                }
            }
        }
    });
};
get_friendship_notis();

var group_list_poll = function(){
    var feedback_url = "/api/v1/memberships/?user_key="+user_id;
    $.ajax({
        type: "GET",
        url: feedback_url,
        contentType: "application/json",
        dataType: "json",
        statusCode: {
            200: function (data) {
                $(".nav_group_list").html("");
                $(".post_group_list").html("");
                for(var index in data.objects){
                    $(".nav_group_list").append('<li id="nav_project"><a href="/group/'+data.objects[index].group_key.id+'"><span class="nav_icon"></span><span class="nav_label">'+data.objects[index].group_key.group_name+'</span></a></li>');
                    $(".post_group_list").append('<option value="'+data.objects[index].group_key.id+'">'+data.objects[index].group_key.group_name+'</option>');
                }
            }
        }
    });
};
group_list_poll();

$(document).ready(function () {
    setTimeout(function () {
        $("#p_timeline").waypoint(function () {
            get_friendship_notis();
            group_list_poll();
            notification_polling();
        }, { offset: '0' });
    }, 5000);
});

$("#nav_request").click(function() {
    $("#ul_nav_request").toggle();
});

var notification_polling = function(){
    var feedback_url = "/api/v1/usernoti/count";
    $.ajax({
        type: "GET",
        url: feedback_url,
        contentType: "application/json",
        dataType: "json",
        statusCode: {
            200: function (data) {
                console.log(data);
                $("#common_noti_count").html(data.noti_count);
            }
        }
    });
};
notification_polling();

$("#nav_notification").click(function() {
    var feedback_url = "/api/v1/usernoti/?target_user__id="+user_id+"&limit=5";
    $.ajax({
        type: "GET",
        url: feedback_url,
        contentType: "application/json",
        dataType: "json",
        statusCode: {
            200: function (data) {
                console.log(data);
//                $("#common_noti_count").html(data.noti_count);
                $("#ul_nav_common_request").html('');
                for(index in data.objects) {
                    $("#ul_nav_common_request").append('<li><a href="'+data.objects[index].notification.link+'"><span class="nav_icon"></span><span class="nav_label">'+data.objects[index].notification.message+'</span></a></li>');
                }
            }
        }
    });
    $("#ul_nav_common_request").toggle();
});