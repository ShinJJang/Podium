$('#form_comment').submit(function(event) {
    alert("@");
    var feedback_api = "/api/v1/comment/";
    var data = JSON.stringify({
        "comment": $("input[name=comment]").val(),
        "post_key": $("input[name=post_key]").val()
    });
    console.log(data);
    console.log("hello");
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