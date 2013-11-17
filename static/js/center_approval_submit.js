/**
 * Created by lacidjun on 2013. 11. 17..
 */

function s3_upload_center() {
    var check_file_name = $('#post_center_file').val();
    var extension = check_file_name.replace(/^.*\./, '');
    var valid_extensions = ['hwp', 'jpg', 'ppt', 'pptx', 'doc', 'zip', 'png', 'txt', 'pdf'];
    var file_size = 0;
    if ($.support.msie) {
        var objFSO = new ActiveXObject("Scripting.FileSystemObject");
        var sPath = $("#post_center_file")[0].value;
        var objFile = objFSO.getFile(sPath);
        var iSize = objFile.size;
        iSize = iSize / 1024;
    }
    else {
        iSize = ($("#post_center_file")[0].files[0].size / 1024);
    }

    if ($("#post_center_is_file").val() == "1") {
        alert("안대 지우고 올려");
    }
    else if ($.inArray(extension, valid_extensions) == -1) {
        $("#center_status").html("Please select a file");
        $("#post_center_is_file").val("0");
        alert("Invalid extensions");
    }
    else if (iSize > 10000) {
        $("#center_status").html("Please select a file");
        $("#post_center_is_file").val("0");
        alert("Invalid file size");
    }
    else {
        var s3upload = new S3Upload({

            opt_method: "PUT",
            opt_user_file_count: $('#post_center_file_count').val(),
            file_dom_selector: '#post_center_file',
            s3_sign_put_url: '/sign_s3/',
            onProgress: function (percent, message) {
                $('#center_status').html('Upload progress: ' + percent + '%' + message);
            },
            onFinishS3Put: function (url, file) {
                var parse_url = url.split("/");
                $('#post_center_file_url_info').val(url);
                $('#post_center_file_type').val(file.type);
                $('#post_center_file_name').val(file.name);
                $("#post_center_is_file").val("1");
                $('#center_status').html('<a href=' + url + ' > Upload completed ' + file.name + '</a');
            },
            onError: function (status) {
                $('#center_status').html('Upload error: ' + status);
            }
        });

    }
}

function s3_upload_delete_center() {
    if ($("#post_center_is_file").val() == "0") {
        alert("안대 올리고 지워");
    }
    else {
        if ($.support.msie) {
            // ie 일때 input[type=file] init.
            $("#post_center_file").replaceWith($("#post_center_file").clone(true));
        } else {
            // other browser 일때 input[type=file] init.
            $("#post_center_file").val("");
        }

        var count_and_name = $('#post_center_file_url_info').val().split("/");
        var s3upload = new S3Upload({
            opt_user_file_count: count_and_name[4],
            opt_key_file_name: count_and_name[5],
            opt_key_file_type: $('#post_center_file_type').val(),
            opt_method: "DELETE",
            //file_dom_selector: '#post_file',
            s3_sign_put_url: '/sign_s3/',
            onProgress: function (percent, message) {
                $('#center_status').html('Delete progress: ' + percent + '%' + message);
            },
            onFinishS3Put: function (url, type) {
                var parse_url = url.split("/");
                $("#center_status").html("Please select a file");
                $("#post_center_is_file").val("0");
            },
            onError: function (status) {
                $('#center_status').html('Delete error: ' + status);
            }
        });
    }
}

function s3_center_file_submit() {
    if (!$('#attach_center_is_file').val()) {
        var file_upload_url = "/api/v1/approvals/";
        var file_link = $('#post_center_file_url_info').val();
        var post_friend_key = $('#post_center_friend_key').val();
        console.log(post_friend_key);
        var file_name = $('#post_center_file_name').val();
        var user_file_data = JSON.stringify({
            "post_friend_key": post_friend_key,
            "file_link": file_link,
            "file_name": file_name
        });
        if (post_friend_key == -1) {
            showToast("그룹 가입 이전의 글입니다.");
            return false;
        }
        $.ajax({
            url: file_upload_url,
            type: "POST",
            contentType: "application/json",
            data: user_file_data,
            dataType: "json",
            statusCode: {
                201: function (data) {
                    // TODO file_upload result
                    showToast("제출되었습니다");
                },
                400: function (data) {
                    showToast($.parseJSON(data.responseText).error);
                },
                500: function (data) {
                    // TODO file_upload fail result
                }
            }
        });
    }
}

function s3_uploaded_file_center() {
    var check_file_name = $('#modify_post_center_file').val();
    var extension = check_file_name.replace(/^.*\./, '');
    var valid_extensions = ['hwp', 'jpg', 'ppt', 'pptx', 'doc', 'zip', 'png', 'txt', 'pdf'];
    var file_size = 0;
    if ($.support.msie) {
        var objFSO = new ActiveXObject("Scripting.FileSystemObject");
        var sPath = $("#modify_post_center_file")[0].value;
        var objFile = objFSO.getFile(sPath);
        var iSize = objFile.size;
        iSize = iSize / 1024;
    }
    else {
        iSize = ($("#modify_post_center_file")[0].files[0].size / 1024);
    }
    if ($.inArray(extension, valid_extensions) == -1) {
        $("#modify_center_status").html("Please select a file");
        $("#modify_post_center_is_file").val("0");
        alert("Invalid extensions");
    }
    else if (iSize > 10000) {
        $("#modify_center_status").html("Please select a file");
        $("#modify_post_center_is_file").val("0");
        alert("Invalid file size");
    }
    else {
        var s3upload = new S3Upload({

            opt_method: "PUT",
            opt_user_file_count: $('#modify_post_center_file_count').val(),
            file_dom_selector: '#modify_post_center_file',
            s3_sign_put_url: '/sign_s3/',
            onProgress: function (percent, message) {
                $('#modify_center_status').html('Upload progress: ' + percent + '%' + message);
            },
            onFinishS3Put: function (url, file) {
                var parse_url = url.split("/");
                $('#modify_post_center_file_url_info').val(url);
                $('#modify_post_center_file_type').val(file.type);
                $('#modify_post_center_file_name').val(file.name);
                $("#modify_post_center_is_file").val("1");
                $('#modify_center_status').html('<a href=' + url + ' > Upload completed ' + file.name + '</a');

                if (!$('#modify_attach_center_is_file').val()) {
                    var file_link = $('#modify_post_center_file_url_info').val();
                    var post_friend_key = $('#modify_post_center_friend_key').val();
                    var file_name = $('#modify_post_center_file_name').val();
                    var file_upload_url = "/api/v1/approvals/" + $('#post_approval_id').val() + "/";
                    var user_file_data = JSON.stringify({
                        "post_friend_key": post_friend_key,
                        "file_link": file_link,
                        "file_name": file_name
                    });
                    if (post_friend_key == -1) {
                        showToast("그룹 가입 이전의 글입니다.");
                        return false;
                    }
                    $.ajax({
                        url: file_upload_url,
                        type: "PATCH",
                        contentType: "application/json",
                        data: user_file_data,
                        dataType: "json",
                        statusCode: {
                            201: function (data) {
                                // TODO file_upload result
                                showToast("파일 수정이 완료되었습니다.");
                            },
                            202: function (data) {
                                showToast("파일 수정이 완료되었습니다.");
                            },
                            400: function (data) {
                                showToast($.parseJSON(data.responseText).error);
                            },
                            500: function (data) {
                                // TODO file_upload fail result
                            }
                        }
                    });
                }
            },
            onError: function (status) {
                $('#center_status').html('Upload error: ' + status);
            }
        });
    }
}



//$(document).ready(function() {
//    crud_approval("GET");
//});
//
//
//var crud_approval = function(method, friendpost_id, file_link, file_name) {
//    var file_upload_url = "/api/v1/approvals/";
//    if(method != "POST")
//        file_upload_url += friendpost_id+"/";
//    $.ajax({
//        url: file_upload_url,
//        type: method,
//        contentType: "application/json",
//        dataType: "json",
//        statusCode: {
//            200: function (data) {
//                // TODO file_upload result
//                console.log(data);
//            },
//            500: function (data) {
//                // TODO file_upload fail result
//            }
//        }
//    });
//};