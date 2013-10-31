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
            200: function(data) {
                console.log("그룹 수정");
                group_list_poll();
                $("#group_response").append("<span class='tooltip tooltip-bottom'>"+data.group_name+"이 수정되었습니다.</span>");
            },
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
};

// group create
$(document).on("submit", "#group_create_form", function(event) {
    var feedback_api = "/api/v1/groups/";
    submit_group_form(event, feedback_api, "POST");
    return false;
});

// group update
$(document).on("submit", "#group_update_form", function(event) {
    var feedback_api = "/api/v1/groups/"+group_id+"/";
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

// Group settings - member list with permission option
var get_member_list = function() {
    var feedback_url = "/api/v1/memberships/?group_key="+group_id;
    $.ajax({
        type: "GET",
        url: feedback_url,
        contentType: "application/json",
        dataType: "json",
        statusCode: {
            200: function (data) {
                console.log("group user list get!");
                console.log(data);
                $(".member_list").html("");
                for(var index in data.objects){
                    $(".member_list").append("<li class='li_member_for_delete' name='"+data.objects[index].id+"' tag='"+data.objects[index].permission+"'><a href='#'>"+data.objects[index].user_key.username+"</a></li>");
                }
            }
        }
    });
}
get_member_list();

var dropdown_dom_generate = function(eventdom){
    var member_id = $(eventdom).attr("name");
    var member_permission = $(eventdom).attr("tag");
    var data = {
        "id": member_id,
        "permission": member_permission
    };
    $("#select_member").tmpl(data).appendTo(eventdom);
};

$(document).on({
    mouseenter: function() {
        if($(this).find(".permission_click").size() == 0) {
            dropdown_dom_generate($(this));
        }
        else {
            $(this).find(".dropmid").toggle();
        }
    },
    mouseleave: function() {
        $(this).find(".dropmid").toggle();
    }
}, ".member_list > li");

var update_member_for_permission = function(eventdom){
    var membership_id = eventdom.attr("name");
    var set_permission = eventdom.attr("tag");
    var method;
    switch (set_permission) {
        case "0":
            method = "PATCH";
            break;
        case "1":
            method = "PATCH";
            break;
        case "-1":
            method = "DELETE";
            if(!confirm("Are you sure exclude this member at this group?")) {
                return false;
            }
            break;
        default:
            break;
    };
    var feedback_url = "/api/v1/memberships/"+membership_id+"/"
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
            202: function(data) {
                console.log("permission update done!");
            },
            204: function(data) {
                eventdom.parents(".li_member_for_delete").remove();
                console.log("selected member exclude at this group!");
            },
            404: function(data) {
                console.log("Not founded!")
            }
        }
    });
};

$(document).on("click", ".permission_click", function(){
    update_member_for_permission($(this));
});

// 멤버 추가
$("#request_member").click(function(){
    var feedback_api = "/api/v1/memberships/"
    var members = [];
    $('.group_request_member_selected').each(function() {
        members.push({
            "user_key": $(this).attr('value'),
            "group_key": group_id
        });
    });
    var data = JSON.stringify({
        "objects": members,
        "deleted_objects": []
    });
    console.log(data);
    $.ajax({
        url: feedback_api,
        type: "PATCH",
        contentType: "application/json",
        data: data,
        dataType: "json",
        statusCode: {
            202: function(data) {
                get_member_list();
                $("#group_response").append("<span class='tooltip tooltip-bottom'>멤버로 추가되었습니다.</span>"); // TODO - toast alert으로 변경
            },
            400: function(data) {
                console.log(data.responseText);
                $("#group_response").append("<span class='tooltip tooltip-bottom'>"+$.parseJSON(data.responseText).error+"</span>");
            }
        }
    });
});