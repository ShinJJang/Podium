var get_friendship_notis = function(){
    var feedback_url = "/api/v1/friend_noti/?noti_to_user="+user_id;
    $.ajax({
        type: "GET",
        url: feedback_url,
        contentType: "application/json",
        dataType: "json",
        statusCode: {
            200: function (data) {
                console.log("sidebar friendship notis get!");
                $("#friend_noti_count").html(data.meta.total_count);
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
                console.log("sidebar.js - group list polling");
                console.log(data);
                $(".nav_group_list").html("");
                for(var index in data.objects){
                    $(".nav_group_list").append('<li id="nav_project"><a href="/group/'+data.objects[index].group_key.id+'"><span class="nav_icon"></span><span class="nav_label">'+data.objects[index].group_key.group_name+'</span></a></li>');
                }
            }
        }
    });
};
group_list_poll();