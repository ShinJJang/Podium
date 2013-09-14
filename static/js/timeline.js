var post_top_url = "/api/v1/post/?limit=5&offset=40";
var post_bottom_url = "/api/v1/post/";
var comment_offsets = new Object();
var isBottominit = 0;

function writeComment() {
    $('#form_comment').submit(function(event) {
        var feedback_api = "/api/v1/comment/";
        var data = JSON.stringify({
            "comment": $("input[name=comment]").val(),
            "post_key": $("input[name=post_key]").val()
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
                }
            }
        });
        return false;
    });
};


function focusComment(){
    $(".p_commentList").waypoint(function(){
        var tagid = $(this).attr("id");
        console.log(tagid);
        var postid = tagid.replace("commentList", "");
        (function poll() {
            console.log(postid);
            setTimeout(function(){$.ajax({complete:poll()});pollComment(postid);}, 5000);
        })();
    }, { offset: "bottom-in-view"});
}


function pollComment(post_id) {
    if(!post_id)
        return;

    get_uri = "/api/v1/comment/?post=" + post_id; // api inner parameter ?limit=20&offset=0"

    if(comment_offsets[post_id]){
        console.log("use offset in comment polling  " + comment_offsets[post_id]);
        get_uri = "/api/v1/comment/?limit=5&offset=" + comment_offsets[post_id];
    }
    $.ajax({
        url: get_uri,
        type: "GET",
        dataType: "json",
        success: function(data) {
            console.log("polling comment");
            console.log(data);
            if(data.objects.length != 0)
            {
                $("#comment_template").tmpl(data.objects).appendTo("#commentList"+post_id);
                comment_offsets[post_id] = data.meta.offset + data.objects.length;
                console.log("오프셋"+comment_offsets[post_id]);
                console.log("comment polling done "+comment_offsets[post_id]);
            }
        }
        });
}
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
//                $('#post_public_template').tmpl(data).prependTo('#timeline');
            }
        }
    });
    return false;
});

function timelineRefresh() {
    $.ajax({
        url: post_top_url,
        type: "GET",
        dataType: "json",
        success: function(data) {
            console.log("TTTTTTTTTTTT polling post" + post_top_url);
            console.log(data)
            if(data.objects.length != 0)
            {
                $("#post_public_template").tmpl(data.objects.reverse()).prependTo("#timeline");
                $.waypoints('refresh');
                writeComment();
                $(".p_responses").click(function(){
                    $(this).parent().children("section").toggle();
                    $(this).toggleClass("opened");
                    return false;
                });
                post_top_url = data.meta.next;
                if(!post_top_url)
                    post_top_url = "api/v1/post/?limit=20&offset=" + (data.meta.offset+data.objects.length);
                if(isBottominit==0) {
                    post_bottom_url = data.meta.previous;
                    console.log(post_bottom_url);
                    isBottominit = 1;
                }
                focusComment();
            }
        }
        });
}

/* post polling */
$(document).ready(function() {
  timelineRefresh();
  (function poll() {
    setTimeout(function(){$.ajax({complete:poll()});timelineRefresh();}, 5000);
  })();
  $("#p_timeline").waypoint(function(){console.log("start bottom   "+post_bottom_url);postBottom();}, { offset: 'bottom-in-view' });

});


function postBottom() {
    if(!post_bottom_url)
        return;
    $.ajax({
        url: post_bottom_url,
        type: "GET",
        dataType: "json",
        success: function(data) {
            if(data.objects.length != 0)
            {
                $("#post_public_template").tmpl(data.objects.reverse()).appendTo("#timeline");
                $(".p_responses").click(function(){
                    $(this).parent().children("section").toggle();
                    $(this).toggleClass("opened");
                    return false;
                });
                writeComment();
                post_bottom_url = data.meta.previous;
                console.log("BBBBBBBBBB polling post" + post_bottom_url);
            }
        }
        });
}

