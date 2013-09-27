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
                    pollComment($("input[name=post_key]").val());
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
                timeRefresh();
//                focusComment();
            }
        }
        });
}

// when screen on top, call PostTopPolling
$(document).ready(function() {
  PostTopPolling();
  setTimeout(function(){$("#p_timeline").waypoint(function(){postBottom();}, { offset: 'bottom-in-view' });}, 1000);
  setTimeout(function(){$("#p_timeline").waypoint(function(){PostTopPolling()}, { offset: '0' });}, 5000);
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

// when on post, call pollComment
function focusComment(){
    $(".p_commentList").waypoint(function(){
        var tagid = $(this).attr("id");
        if (!tagid)
            return false;
        var postid = tagid.replace("commentList", "");
        pollComment(postid);
        (function poll() {
            console.log(postid);
            setTimeout(function(){$.ajax({complete:poll()});pollComment(postid);}, 60000);
        })();
    }, { offset: "bottom-in-view"});
}
// TODO(ym):comment polling work with dynamical creation
$(document).on("waypoint", { offset: "bottom-in-view"}, ".p_commentList", function(){
    var tagid = $(this).attr("id");
        if (!tagid)
            return false;
        var postid = tagid.replace("commentList", "");
        pollComment(postid);
        (function poll() {
            console.log(postid);
            setTimeout(function(){$.ajax({complete:poll()});pollComment(postid);}, 60000);
        })();
})

// polling comment
function pollComment(post_id) {
    if(!post_id)
        return;

    get_uri = "/api/v1/comment/?post=" + post_id; // api inner parameter ?limit=20&offset=0"

    if(comment_offsets[post_id]){
        get_uri = "/api/v1/comment/?limit=30&offset=" + comment_offsets[post_id];
    }
    $.ajax({
        url: get_uri,
        type: "GET",
        dataType: "json",
        success: function(data) {
            if(data.objects.length != 0)
            {
                $("#comment_template").tmpl(data.objects).appendTo("#commentList"+post_id);
                comment_offsets[post_id] = data.meta.offset + data.objects.length;
                console.log("댓글 폴링한 마지막 오프셋 :"+comment_offsets[post_id]);
            }
        }
        });
}

// comment toggle
$(document).on("click", ".p_responses", function(){
                    $(this).parent().children("section").toggle();
                    $(this).toggleClass("opened");
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

// dynamic timeago
jQuery(document).ready(function() {
    // Korean
    jQuery.timeago.settings.strings = {
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

  setTimeout(function(){timeRefresh();}, 5000);
});

function timeRefresh() {
    jQuery("abbr.timeago").timeago();
}

// TODO - Counting emotion
// TODO - Gruop post create
// TODO - Post crate using open scope