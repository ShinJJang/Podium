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
        "isProject": $("input[name=is_project]").is(":checked"),
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
}

function formatSelection(node) {
    return '<div class="group_request_member_selected" value='+node.id+'>' + node.username + '</div>';
}

// Group settings - member list with permission option
var get_member_list = function() {
    if($(".member_list").length == 0)
        return false;

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
                    var strclass = "li_member_for_delete";
                    if(data.objects[index].user_key.id == user_id)
                        strclass += " self_member";
                    else if(data.objects[index].permission == 1)
                        strclass += " permitted_member";
                    $(".member_list").append("<li class='"+strclass+"' name='"+data.objects[index].id+"' tag='"+data.objects[index].permission+"'><a href='#'>"+data.objects[index].user_key.username+"</a></li>");
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

// 멤버 권한 수정
var update_member_for_permission = function(eventdom){
    var membership_id = eventdom.attr("name");
    var set_permission = eventdom.attr("tag");
    var method;
    var option_code;
    switch (set_permission) {
        case "0":
            method = "PATCH";
            break;
        case "1":
            method = "PATCH";
            break;
        case "-1":
            method = "DELETE";
            var alert_statement = "정말 이 멤버를 그룹에서 제외할꺼에요?";
            if($(".li_member_for_delete").length == 1) {    // TODO Group delete - 멤버있는지 그룹에서 예외처리
                alert_statement = "이외의 멤버가 없어 탈퇴하시면 그룹이 삭제됩니다.\n계속하시겠습니까?";
                window.location.assign("/");
                option_code = "group_delete";
            }
            else if(eventdom.parents(".self_member").length > 0) {
                alert_statement = "그룹에서 나갈꺼에요?";
                if(permission == 2) {
                    alert_statement = "탈퇴하시면 그룹의 소유자가 변경됩니다.\n계속하시겠습니까?";
                    option_code = "owner_inheritance";
                }
                if(open_scope == 2)
                    window.location.assign("/");
                else
                    window.location.assign("/group/"+group_id+"/");
            }
            if(confirm(alert_statement) != true) {
                return false;
            }
            else if(option_code == "owner_inheritance")
                owner_inheritance();
            break;
        default:
            break;
    };
    update_member_permission(method, membership_id, set_permission, eventdom);

    if(option_code == "group_delete")
        group_delete();
};

$(document).on("click", ".permission_click", function(){
    update_member_for_permission($(this));
});

// 멤버 추가
$("#request_member").click(function(){
    var feedback_api = "/api/v1/memberships/";
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
            202: function() {
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

var update_member_permission = function(method, member_id, set_permission, eventdom) {
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
                if(eventdom.attr("tag") == 0) {
                    eventdom.attr("tag", 1);
                    eventdom.html("관리자로 설정");
                }
                else{
                    eventdom.attr("tag", 0);
                    eventdom.html("관리자에서 제외");
                }
            },
            204: function() {
                eventdom.parents(".li_member_for_delete").remove();
                console.log("selected member exclude at this group!");
            },
            404: function() {
                console.log("Not founded!")
            }
        }
    });
};

// 소유자 탈퇴시 그룹 소유 권한 상속
var owner_inheritance = function() {
    var admins = $(".permitted_member");
    var inheritance_member_id;
    if(admins.length > 0)
        inheritance_member_id = admins.attr("name");
    else
        inheritance_member_id = $(".li_member_for_delete").not(".self_member").attr("name");

    update_member_permission("PATCH", inheritance_member_id, 2);
};

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