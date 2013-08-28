$('#form_comment').submit(function(event) {
    alert("@");
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
        dataType: "application/json",
        processData:  false
    });
    return false;
});

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
                console.log(data)
                console.log(data.post);
                console.log(data.user.user.last_login);
            }
        }
    });
    timelineRefresh();
    return false;
});

function timelineRefresh() {
    $.ajax({
        url: "/api/v1/post/", // api inner parameter ?limit=20&offset=0"
        type: "GET",
        dataType: "json",
        timeout: 5000,
        complete:self,
        success: function(data) {
            console.log("polling");
            console.log(data)
        }
        });
}

/* post polling */
$(document).ready(function() {
  (function poll() {
    setTimeout(function(){$.ajax({complete:poll()});timelineRefresh();}, 5000);
  })();
});