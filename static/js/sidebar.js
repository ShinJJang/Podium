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