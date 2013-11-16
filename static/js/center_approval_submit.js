/**
 * Created by lacidjun on 2013. 11. 17..
 */

function s3_upload_center() {
    var check_file_name = $('#post_file').val();
    var extension = check_file_name.replace(/^.*\./, '');
    var valid_extensions = ['hwp', 'jpg', 'ppt', 'pptx', 'doc', 'zip', 'png','txt', 'pdf'];
    var file_size = 0;
    if ($.support.msie) {
        var objFSO = new ActiveXObject("Scripting.FileSystemObject");
        var sPath = $("#post_file")[0].value;
        var objFile = objFSO.getFile(sPath);
        var iSize = objFile.size;
        iSize = iSize / 1024;
    }
    else {
        iSize = ($("#post_file")[0].files[0].size / 1024);
    }

    if ($("#post_is_file").val() == "1") {
        alert("안대 지우고 올려");
    }
    else if ($.inArray(extension, valid_extensions) == -1) {
        $("#status").html("Please select a file");
        $("#post_is_file").val("0");
        alert("Invalid extensions");
    }
    else if(iSize > 10000) {
        $("#status").html("Please select a file");
        $("#post_is_file").val("0");
        alert("Invalid file size");
    }
    else {
        var feedback_api = "/get_file_count/";
        var file_count = "";
        $.ajax({
            url: feedback_api,
            type: "GET",
            contentType: "application/json",
            dataType: "xml",
            statusCode: {
                200: function (data) {
                    $('#post_file_count').val(data.responseText);
                    timeRefresh();
                    var s3upload = new S3Upload({
                        opt_method: "PUT",
                        opt_user_file_count: $('#post_file_count').val(),
                        file_dom_selector: '#post_file',
                        s3_sign_put_url: '/sign_s3/',
                        onProgress: function (percent, message) {
                            $('#status').html('Upload progress: ' + percent + '%' + message);
                        },
                        onFinishS3Put: function (url, file) {
                            var parse_url = url.split("/");
                            $('#post_file_url_info').val(url);
                            $('#post_file_type').val(file.type);
                            $('#post_file_name').val(file.name);
                            $("#post_is_file").val("1");
                            $('#status').html('<a href=' + url + ' > Upload completed ' + parse_url[5] + '</a');
                        },
                        onError: function (status) {
                            $('#status').html('Upload error: ' + status);
                        }
                    });
                }
            }
        });
    }
}

function s3_upload_delete_center() {
    if ($("#post_is_file").val() == "0") {
        alert("안대 올리고 지워");
    }
    else {
        if ($.support.msie) {
            // ie 일때 input[type=file] init.
            $("#post_file").replaceWith($("#post_file").clone(true));
        } else {
            // other browser 일때 input[type=file] init.
            $("#post_file").val("");
        }

        var count_and_name = $('#post_file_url_info').val().split("/");
        var s3upload = new S3Upload({
            opt_user_file_count: count_and_name[4],
            opt_key_file_name: count_and_name[5],
            opt_key_file_type: $('#post_file_type').val(),
            opt_method: "DELETE",
            //file_dom_selector: '#post_file',
            s3_sign_put_url: '/sign_s3/',
            onProgress: function (percent, message) {
                $('#status').html('Delete progress: ' + percent + '%' + message);
            },
            onFinishS3Put: function (url, type) {
                var parse_url = url.split("/");
                $("#status").html("Please select a file");
                $("#post_is_file").val("0");
            },
            onError: function (status) {
                $('#status').html('Delete error: ' + status);
            }
        });
    }
}