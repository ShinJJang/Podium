var post_top_url = "/api/v1/friendposts/";
var post_bottom_url = "/api/v1/friendposts/";
var comment_offsets = new Object();
var isBottominit = 0;

// post create
$("#form_post").submit(function(event) {
    alert("@");
    var feedback_api = "/api/v1/post/";
    var data = JSON.stringify({
        "post": $("input[name=post]").val()
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
                /*post로 생성 후 생성한 json response*/
                console.log("post submit response");
                console.log(data);
            }
        }
    });
    return false;
});

// comment create
$(document).on("submit", "#form_comment",function(event) {
        var feedback_api = "/api/v1/comment/";
        var data = JSON.stringify({
            "comment": $(this).find("input[name=comment]").val(),
            "post_key": $(this).find("input[name=post_key]").val()
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
                    console.log("post submit response");
                    console.log(data);
                    pollComment(data.post_key);
                }
            }
        });
        return false;
});

// polling post
function PostTopPolling() {
    $.ajax({
        url: post_top_url,
        type: "GET",
        dataType: "json",
        success: function(data) {
            console.log("TOP POLL POST  url:" + post_top_url);
            console.log(data)
            if(data.objects.length != 0)
            {
                $("#post_public_template").tmpl(data.objects).prependTo("#timeline");
                timeRefresh();
                post_top_url = data.meta.previous;
                console.log("1 previous url:  " + post_top_url);
                if(!data.meta.previous)
                    post_top_url = "api/v1/friendposts/?limit=1&id__gt=" + data.objects[0].id;
                console.log("2 previous url:  " + post_top_url);
                if(isBottominit==0) {
                    post_bottom_url = (!data.meta.next) ? null : data.meta.next + "&id__lte=" + data.objects[0].id;
                    console.log("1 next url:  " + post_bottom_url);
                    isBottominit = 1;
                }
            }
        }
        });
}

// when screen on top, call PostTopPolling
$(document).ready(function() {
    PostTopPolling();
    setTimeout(function(){$("#timeline").waypoint(function(){postBottom();}, { offset: 'bottom-in-view' });}, 1000);
    setTimeout(function(){$("#p_timeline").waypoint(function(){PostTopPolling()}, { offset: '0' });}, 5000);

    // dynamic timeago(Korean)
    $.timeago.settings.strings = {
        suffixAgo: "전",
        suffixFromNow: "후",
        seconds: "1분 이내",
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

    setTimeout(function(){timeRefresh();console.log("timeago called");}, 2000);
});

function postBottom() {
    if(!post_bottom_url)
        return;
    $.ajax({
        url: post_bottom_url,
        type: "GET",
        dataType: "json",
        success: function(data) {
            console.log("BOTTOM POLL POST   url:" + post_bottom_url);
            console.log(data);
            if(data.objects.length != 0)
            {
                $("#post_public_template").tmpl(data.objects).appendTo("#timeline");
                post_bottom_url = data.meta.next;
                console.log("2 next url:  "+post_bottom_url);
                timeRefresh();
            }
        }
        });
}
// polling comment
function pollComment(post_id) {
    if(!post_id)
        return;

    var feedback_api = "/api/v1/comment/?post=" + post_id; // api inner parameter ?limit=20&offset=0"

    if(comment_offsets[post_id]){
        feedback_api = "/api/v1/comment/?post=" + post_id + "&limit=30&id__gt=" + comment_offsets[post_id];
        // feedback_api = "/api/v1/comment/?post=" + post_id + "&limit=30&offset=" + comment_offsets[post_id];
    }

    console.log("Polling comment url :  " + feedback_api);
    $.ajax({
        url: feedback_api,
        type: "GET",
        dataType: "json",
        success: function(data) {
            if(data.objects.length != 0)
            {
                console.log(data);
                $("#comment_template").tmpl(data.objects.reverse()).appendTo("#commentList" + post_id);
                comment_offsets[post_id] = data.objects[data.objects.length - 1].id;
                console.log("댓글 폴링한 마지막 오프셋 :"+comment_offsets[post_id]);
            }
        }
        });
}

// comment toggle
$(document).on("click", ".p_responses", function(){
        $(this).parent().children("section").toggle();
        var resp = $(this).toggleClass("opened");

        // comment polling on post focused
        // TODO(ym) - Comment poll with interval when open
        if (resp && resp.context.className.search("opened") != -1){
            var tag_id = $(this).siblings(".p_comment").children(".p_commentList").attr("id");
            if (!tag_id)
                return false;
            var postid = tag_id.replace("commentList", "");

            pollComment(postid);
        }
        return false;
});

// emotion click
$(document).on("click", ".form_emotion :submit", function(event){
        var feedback_api = "/api/v1/postemotions/"
        var data = JSON.stringify({
            "emotion": $(this).attr('tag'),
            "post_key": $(this).siblings("input[name=post_key]").val()
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
                    console.log("post emotion submit response");
                    console.log(data);
                }
            }
        });
        return false;
});

function timeRefresh() {
    $("abbr.timeago").timeago();
}

// TODO - Gruop post create
// TODO - Post crate using open scope