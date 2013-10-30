// group ajax
var submit_group_form = function(event, feedback_api, method){
    var open_scope = $("select[name=open_scope]").val();
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
        type: method,
        contentType: "application/json",
        data: data,
        dataType: "json",
        statusCode: {
            201: function(data) {
                console.log("그룹 생성");
                group_list_poll();
                $("#group_response").append("<span class='tooltip tooltip-bottom'>"+data.group_name+"이 생성되었습니다.</span>");
            },
            204: function(data) {
                console.log("그룹 수정");
                group_list_poll();
                $("#group_response").append("<span class='tooltip tooltip-bottom'>"+data.group_name+"이 수정되었습니다.</span>");
            },
            400: function(data) {
                console.log(data.responseText);
                $("#group_response").append("<span class='tooltip tooltip-bottom'>"+$.parseJSON(data.responseText).error+"</span>");
            }
        }});
};

// group create
$(document).on("submit", "#group_create_form", function(event) {
    var feedback_api = "/api/v1/groups/";
    submit_group_form(event, feedback_api, "POST");
    return false;
});

// group update
$(document).on("submit", "#group_update_form", function(event) {
    var feedback_api = "/api/v1/groups/" + group_id;
    console.log(feedback_api);
    submit_group_form(event, feedback_api, "PUT");
    return false;
});

// group member request
$('#group_search_friend').select2({
    placeholder: "초대할 친구를 찾아보세요!",
    minimumInputLength: 2,
    multiple: true,
    ajax: {
        url: '/api/v1/user/search/',
        dataType: 'json',
        data: function(term, page) {
            return {
                q: term,
                page_limit: 10
            };
        },
        results: function(data, page) {
            return {
                results: data.objects
            };
        }
    },
    formatResult: formatResult,
    formatSelection: formatSelection
});

function formatResult(node) {
    return '<div>' + node.username + '</div>';
};

function formatSelection(node) {
    return '<div class="group_request_member_selected" value='+node.id+'>' + node.username + '</div>';
};