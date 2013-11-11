var get_group = function() {
    var feedback_url = "/api/v1/groups/"+group_id+"/"
    $.ajax({
        type: "GET",
        url: feedback_url,
        contentType: "application/json",
        dataType: "json",
        statusCode: {
            200: function(data) {
                console.log(data);
                $("#member_count").html(data.member_count);
            }
        }
    });
};
get_group();

var group_delete = function() {
    var feedback_url = "/api/v1/groups/"+group_id+"/"
    $.ajax({
        type: "DELETE",
        url: feedback_url,
        contentType: "application/json",
        dataType: "json",
        statusCode: {
            204: function() {
                console.log("selected member exclude at this group!");
                window.location.assign("/");
            },
            404: function() {
                console.log("Not founded!")
            }
        }
    });
};

var update_member_permission = function(method, member_id, set_permission) {
    var feedback_url = "/api/v1/memberships/"+member_id+"/"
    var data = JSON.stringify({
        "permission": set_permission
    });
    $.ajax({
        type: method,
        url: feedback_url,
        contentType: "application/json",
        data: data,
        dataType: "json",
        statusCode: {
            202: function() {
                console.log("permission update done!");
            },
            204: function() {
                console.log("selected member exclude at this group!");
            },
            404: function() {
                console.log("Not founded!")
            }
        }
    });
};