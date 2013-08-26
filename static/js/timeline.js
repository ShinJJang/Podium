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
                console.log(data.user);

            }
        }
    });
    /*object 가져오는 방법*/
    $.ajax({
        url: '/api/v1/post/?user=2',
        crossDomain: true,
        type: 'GET',
        dataType: 'json',

        beforeSend: function() {
        },

        success: function(data, textStatus, jqXHR) {
            console.log("dfdsfs");
            console.log(data);
            console.log(data.objects[2].created);
        },

        error: function(responseText) {
            alert('Error: '+ responseText.toString());
        }
    });
    return false;
});
/* post polling */
$(document).ready(function() {
  (function poll() {
    setTimeout(function() {
        $.ajax({
            url: "/api/v1/post/", // api inner parameter ?limit=20&offset=0"
            type: "GET",
            success: function(data) {
                console.log("polling");
                console.log(data)
            },
            dataType: "json",
            complete: poll,
            timeout: 5000
        })
    }, 5000);
  })();
});

