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
        dataType: "application/json",
        processData:  false
    });
    return false;
});