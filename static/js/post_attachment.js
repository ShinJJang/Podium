
//region Comment Attachment
// comment toggle
$(document).on("click", ".p_responses", function () {
    $(this).parent().children("section").toggle();
    var resp = $(this).toggleClass("opened");

    // comment polling on post focused
    if (resp && resp.context.className.search("opened") != -1) {
        var tag_id = $(this).siblings(".p_comment").children(".p_commentList").attr("id");
        if (!tag_id)
            return false;
        var postid = tag_id.replace("commentList", "");

        pollComment(postid);
        FB.XFBML.parse();
    }
    return false;
});

var comment_api = api_path +"comment/";
var comment_offsets = new Object();

// polling comment
function pollComment(post_id) {
    if (!post_id)
        return;

    var feedback_api = comment_api + "?post=" + post_id; // api inner parameter ?limit=20&offset=0"

    if (comment_offsets[post_id]) {
        feedback_api = comment_api + "?post=" + post_id + "&limit=30&id__gt=" + comment_offsets[post_id];
        // feedback_api = "/api/v1/comment/?post=" + post_id + "&limit=30&offset=" + comment_offsets[post_id];
    }

    console.log("Polling comment url :  " + feedback_api);
    $.ajax({
        url: feedback_api,
        type: "GET",
        dataType: "json",
        success: function (data) {
            if (data.objects.length != 0) {
                console.log(data);
                $("#comment_template").tmpl(data.objects).appendTo("#commentList" + post_id);
                timeRefresh();
                comment_offsets[post_id] = data.objects[data.objects.length - 1].id;
                console.log("댓글 폴링한 마지막 오프셋 :" + comment_offsets[post_id]);
                counting_comment(post_id);
            }
        }
    });
}

// comment create
$(document).on("submit", "#form_comment", function () {
    var feedback_api = comment_api;
    var post_key = $(this).find("input[name=post_key]").val();
    var data = JSON.stringify({
        "comment": $(this).find("input[name=comment]").val(),
        "post_key": post_key
    });
    console.log(data);
    $.ajax({
        url: feedback_api,
        type: "POST",
        contentType: "application/json",
        data: data,
        dataType: "json",
        context: this,
        statusCode: {
            201: function (data) {
                console.log("post submit response");
                console.log(data);
                pollComment(data.post_key);
                $("input[name=comment]").val("");
                counting_comment(post_key);
            }
        }
    });
    return false;
});

var counting_comment = function(post_key) {
    var comment_count = $("#commentList" + post_key + " li").size();
    $("#commentList" + post_key).parent().siblings("header").find(".p_comment").html("<a herf='#'><strong>댓글</strong>/ " + comment_count + "</a>");
};
//endregion


//region Emotion Attachment
// emotion click
$(document).on("click", ".form_emotion :submit", function () {
    var emotion = $(this).attr('tag')
    var post_key = $(this).siblings("input[name=post_key]").val()
    get_emotion(emotion, post_key, false);
    return false;
});

var get_emotion = function(emotion, post_key, count) {
    var feedback_api = api_path + "postemotions/?post="+post_key;
    if(!count)
        feedback_api += "&user="+user_id;
    $.ajax({
        url: feedback_api,
        type: "GET",
        contentType: "application/json",
        dataType: "json",
        statusCode: {
            200: function (data) {
                if(count) {
                    var e1_count = $.grep(data.objects, function(e){ return e.emotion == "E1" }).length;
                    var e2_count = $.grep(data.objects, function(e){ return e.emotion == "E2" }).length;
                    $("#emotion_count_e1_"+post_key).html(e1_count);
                    $("#emotion_count_e2_"+post_key).html(e2_count);
                }
                else {
                    if(data.meta.total_count > 0){
                        if (data.objects[0].emotion == emotion)
                            check_emotion("DELETE", emotion, post_key, data.objects[0].id);
                        else
                            check_emotion("PATCH" ,emotion, post_key, data.objects[0].id);
                    }
                    else {
                        check_emotion("POST" ,emotion, post_key);
                    }
                }
            }
        }
    });
    return false;
};

var check_emotion = function(method, emotion, post_key, emotion_id) {
    var feedback_api = api_path + "postemotions/";
    if(method != "POST")
        feedback_api += emotion_id + "/";

    var data = JSON.stringify({
        "emotion": emotion,
        "post_key": post_key
    });
    $.ajax({
        url: feedback_api,
        type: method,
        contentType: "application/json",
        data: data,
        dataType: "json",
        statusCode: {
            201: function() {
                get_emotion(null, post_key, true);
            },
            202: function() {
                get_emotion(null, post_key, true);
            },
            204: function() {
                get_emotion(null, post_key, true);
            }
        }
    });
};
//endregion


//region Poll Attachment
function bindPoll(targetDiv) {
    $("#" + targetDiv).on("click","li",function () {
        if($(this).index()==0) return false;

        var data = JSON.stringify({
            "id":  parseInt($(this).parent().children(".pollTitle").attr("id").substring(8)),
            "item": ($(this).index() - 1)
        });

        $.ajax({
            url: "/vote/",
            type: "POST",
            contentType: "application/json",
            data: data,
            dataType: "json",
            success: function (data) {
                data.poll = JSON.parse(data.poll);
                var totalCount = 0;

                for (index in data.poll.options)
                    totalCount = totalCount + data.poll.options[index].users.length;

                $("#"+targetDiv).html("");
                $("#"+targetDiv).attr("data-totalCount",totalCount);

                $("#"+targetDiv).append('<li class="pollTitle" id="poll-id-'+data.id+'">' + data.poll.title + '</li>');
                $("#poll_template").tmpl(data.poll.options).appendTo("#"+targetDiv);
                if(data.user_checked != -1) {
                    $("#"+targetDiv).children("li").eq(parseInt(data.user_checked)+1).addClass("checked");
                }

                $("#"+targetDiv).children("li").each(function(){
                    var targetLi = $(this);
                    if(targetLi.attr("data-length")>=0) {
                        console.log(targetLi.parent().attr("data-totalcount"));
                        targetLi.children(".pollItem").css("background-position",(540 * parseInt(targetLi.attr("data-length")) / totalCount - 1000) + "px 50%");
                    }
                });

                $("#"+targetDiv).addClass("p_poll");
            }
        });
    });
}
//endregion


//region Code Attachmenet
function codeReplace(str) {
    var codeReg = /\[code(.*?)]\n{0,1}/i;
    var startIndex = str.search(codeReg);

    if (startIndex != -1) {
        var endIndex = str.search(/\[\/code\]/);
        if (endIndex != -1) {
            var preCodeStr = str.substring(0, startIndex);
            var codeStr = str.substring(startIndex, endIndex+7);
            var postCodeStr = str.substring(endIndex+7);

            codeStr = codeStr.replace(codeReg, "<pre><code data-$1>");
            codeStr = codeStr.replace("data- language", "data-language");
            codeStr = codeStr.replace("[/code]", "</code></pre>");

            postCodeStr = codeReplace(postCodeStr);

            str = preCodeStr + codeStr + postCodeStr;
        }
    }

    return str;
}

function codeLineBreakReplace(str) {
    str = codeReplace(str);
    return str;
}
//endregion


//region Timeago
function timeRefresh() {
    $("abbr.timeago").timeago();
}

$(document).ready(function () {
    // dynamic timeago(Korean)
    $.timeago.settings.strings = {
        suffixAgo: "전",
        suffixFromNow: "후",
        seconds: "방금",
        minute: "1분",
        minutes: "%d분",
        hour: "1시간",
        hours: "%d시간",
        day: "하루",
        days: "%d일",
        month: "한 달",
        months: "%d달",
        year: "1년",
        years: "%d년",
        wordSeparator: " "
    };

    setTimeout(function () {
        timeRefresh();
    }, 30000);
});
//endregion