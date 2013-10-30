/**
 * Created by Shin on 13. 10. 9.
 */

// post create
$(document).on("submit", "#form_post", function(event) {
    var feedback_api = "/api/v1/groups/";
    var open_scope = $("select[name=is_project]").val();
    switch (open_scope){
        case "open":
            open_scope = 0;
            break;
        case "semi-open":
            open_scope = 1;
            break;
        case "close":
            open_scope = 2;
            break;
        default:
            open_scope = 0;
    }
    var members = [];
    $('.group_request_member_selected').each(function() {
        members.push($(this).attr('value'));
    });
    console.log(members);
    var data = JSON.stringify({
        "group_name": $("input[name=group_name]").val(),
        "description": $("textarea[name=description]").val(),
        "is_project": $("input[name=is_project]").val(),
        "open_scope": open_scope,
        "members": members
    });
    console.log(data);
    $.ajax({
        url: feedback_api,
        type: "POST",
        contentType: "application/json",
        data: data,
        dataType: "json",
        statusCode: {
            201: function(data) {
                console.log("그룹 생성");
                group_list_poll();
                $("#group_response").append("<span class='tooltip tooltip-bottom'>"+data.group_name+"이 생성되었습니다.</span>");
            },
            400: function(data) {
                console.log(data.responseText);
                $("#group_response").append("<span class='tooltip tooltip-bottom'>"+$.parseJSON(data.responseText).error+"</span>");
            }
        }});
    return false;
});