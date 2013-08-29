var _offset;

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
                    $('#comment_template').tmpl(data).appendTo('#commentList'+data.post_key);
                }
            }
        });
        return false;
    });
};

$('#form_post').submit(function(event) {
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
    timelineRefresh(_offset);
    return false;
});

function timelineRefresh(offset) {
    get_uri = "/api/v1/post/"; // api inner parameter ?limit=20&offset=0"
    if(offset){
        console.log('use offset');
        get_uri += "?limit=20&offset=" + offset;
    }
    $.ajax({
        url: get_uri,
        type: "GET",
        dataType: "json",
        success: function(data) {
            console.log("polling");
            console.log(data)
            if(data.objects.length != 0)
            {
                $('#post_public_template').tmpl(data.objects.reverse()).prependTo('#timeline');
                $(".p_responses").click(function(){
                    $(this).parent().children("section").toggle();
                    $(this).toggleClass("opened");
                    return false;
                });
                writeComment();
                // need to save end offset
                _offset = data.objects[0].id;
                console.log(_offset);
            }
        }
        });
}

/* post polling */
$(document).ready(function() {
  timelineRefresh();
  (function poll() {
    setTimeout(function(){$.ajax({complete:poll()});timelineRefresh(_offset);}, 5000);
  })();
});