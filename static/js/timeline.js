var post_api = api_path + post_type +"/";
var comment_api = api_path +"comment/";
var post_top_url = "http://" + window.location.host + post_api +"?" + timeline_js_parameter_top_post_polling;
var post_bottom_url = null;
var comment_offsets = new Object();
var isBottominit = 0;
var post_attach = false;
var attach_type = null;

tinymce.init({
    selector: "textarea[name=post_rich]",
    theme: "modern",
    plugins: [
        "advlist autolink lists link image charmap print preview hr anchor pagebreak",
        "searchreplace wordcount visualblocks visualchars code fullscreen",
        "insertdatetime media nonbreaking save table contextmenu directionality",
        "emoticons template paste textcolor"
    ],
    menubar:false,
    toolbar1: "styleselect | bold italic | forecolor backcolor emoticons | alignleft aligncenter alignright | bullist numlist | link code",
    image_advtab: true,
    templates: [
        {title: 'Test template 1', content: 'Test 1'},
        {title: 'Test template 2', content: 'Test 2'}
    ]
});


// post create
$(document).on("submit", "#form_post", function (event) {
    var feedback_api = api_path + "post/";

    var aType = 0;
    if ($("#attach_poll").length > 0) aType = 4;
    else if ($("#attach_file").length > 0) aType = 3;
    else if ($("#attach_video").length > 0) aType = 2;

    var open_scope = $("select[name=open_scope]").val();
    var group = null;
    var target_user = $("input[name=target_user]").val();
    switch (open_scope) {
        case "public":
            open_scope = 0;
            break;
        case "private":
            open_scope = 1;
            break;
        default:
            group = open_scope;
            open_scope = 3;
            break;
    }
    if (group && open_scope == 1) {
        alert("비공개 그룹글은 지원하지 않습니다.\n" + group + "\n" + open_scope);
        return false;
    }

    if (group) {
        var target = group;
        open_scope = 3;
    }
    else if (target_user) {
        var target = target_user;
        open_scope = 2;
    }

    if ($("#attach_video").length > 0) {
        var youtubeRegEx = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/;
        var videoAddress = $("#videoAddress").val();

        if (youtubeRegEx.test(videoAddress) == false) {
            alert("첨부된 주소가 올바르지 않습니다.");
            return false;
        }
    }

    var data = JSON.stringify({
        "post": $("textarea[name=post]").val().replace(/</g, "&lt;"),
        "target": target,
        "open_scope": open_scope,
        "aType": aType
    });
    console.log(data);
    $.ajax({
        url: feedback_api,
        type: "POST",
        contentType: "application/json",
        data: data,
        dataType: "json",
        statusCode: {
            201: function (data) {
                /*post로 생성 후 생성한 json response*/
                console.log("post submit response");
                console.log(data);
                PostTopPolling();
                $("input[name=post]").val("");

                var postId = data.id;
                //  첨부 모듈
                if ($("#postAttach").children().length > 0 && postId) {

                    if ($("#attach_poll").length > 0) {
                        var a_feedback_api = "/api/v1/polls/";

                        var poll_elements = new Array();
                        console.log("attachElement is")
                        $(".attachElement").each(function (index) {
                            var element_obj = {
                                label: $(this).val(),
                                users: new Array()
                            };
                            poll_elements.push(element_obj);
                        });

                        var poll_data = JSON.stringify({
                            "title": $("#pollTitle").val(),
                            "options": poll_elements
                        });

                        var a_data = JSON.stringify({
                            "post_key": postId,
                            "poll": poll_data
                        });

                        $.ajax({
                            url: a_feedback_api,
                            type: "POST",
                            contentType: "application/json",
                            data: a_data,
                            dataType: "json",
                            statusCode: {
                                201: function (data) {
                                    console.log("poll submit response");
                                    console.log(data);
                                }
                            }
                        });
                    }

                    if ($("#attach_file").length > 0) {
                        console.log("file test");
                        var file_upload_url = "/api/v1/user_files/";
                        file_link = $('#post_file_url_info').val();
                        file_type = $('#post_file_type').val();
                        file_name = $('#post_file_name').val();
                        console.log("file_name is =" + file_name);
                        var user_file_data = JSON.stringify({
                            "post_key": postId,
                            "file_link": file_link,
                            "file_type": file_type,
                            "file_name": file_name
                        });
                        $.ajax({
                            url: file_upload_url,
                            type: "POST",
                            contentType: "application/json",
                            data: user_file_data,
                            dataType: "json",
                            statusCode: {
                                201: function (data) {
                                    console.log("file submit response");
                                    console.log(data);
                                },
                                500: function (data) {
                                    console.log(data);
                                }
                            }
                        });
                    }

                    if ($("#attach_video").length > 0) {
                        var a_video_api = "/api/v1/videos/";

                        var urlRegEx = new RegExp("^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*");
                        var videoAddress = $("#videoAddress").val();

                        if (urlRegEx.test(videoAddress)) {
                            var a_data = JSON.stringify({
                                "post_id": postId,
                                "video": videoAddress
                            });

                            $.ajax({
                                url: a_video_api,
                                type: "POST",
                                contentType: "application/json",
                                data: a_data,
                                dataType: "json",
                                statusCode: {
                                    201: function (data) {
                                        console.log("poll submit response");
                                        console.log(data);
                                    }
                                }
                            });
                        }
                        else {
                            // error handling
                        }
                    }
                }

                // Form Initialize
                $("textarea[name=post]").val("");
                post_attach = false;
                attach_type = null;

                $("#postAttach").html("");
            }
        }
    });
    return false;
});

// post create
$(document).on("submit", "#form_post_rich", function (event) {
    alert("@");
    var feedback_api = api_path + "post/";
    var aType = 0;

    var open_scope = $("select[name=open_scope]").val();
    var group = $("select[name=group]").val();
    var target_user = $("input[name=target_user]").val();
    switch (open_scope) {
        case "public":
            open_scope = 0;
            break;
        case "private":
            open_scope = 1;
            break;
        default:
            open_scope = 0;
            break;
    }
    if (group && open_scope == 1) {
        alert("비공개 그룹글은 지원하지 않습니다.\n" + group + "\n" + open_scope);
        return false;
    }

    if (group) {
        var target = group;
        open_scope = 3;
    }
    else if (target_user) {
        var target = target_user;
        open_scope = 2;
    }

    var data = JSON.stringify({
        "post": $("textarea[name=post_rich]").val(),
        "target": target,
        "open_scope": open_scope,
        "aType": aType
    });
    console.log(data);
    $.ajax({
        url: feedback_api,
        type: "POST",
        contentType: "application/json",
        data: data,
        dataType: "json",
        statusCode: {
            201: function (data) {
                /*post로 생성 후 생성한 json response*/
                console.log("post submit response");
                PostTopPolling();
                $("input[name=post]").val("");

                var postId = data.id;

                // Form Initialize
                $("textarea[name=post_rich]").val("");
                post_attach = false;
                attach_type = null;

                tinymce.activeEditor.setContent('');
            }
        }
    });
    return false;
});


// comment create
$(document).on("submit", "#form_comment", function (event) {
    var feedback_api = comment_api;
    var post_key = $(this).find("input[name=post_key]").val();
    var data = JSON.stringify({
        "comment": $(this).find("input[name=comment]").val(),
        "post_key": post_key
    });
    console.log(data);
    $.ajax({
        url: feedback_api,
        type: "POST",
        contentType: "application/json",
        data: data,
        dataType: "json",
        context: this,
        statusCode: {
            201: function (data) {
                console.log("post submit response");
                console.log(data);
                pollComment(data.post_key);
                $("input[name=comment]").val("");
                counting_comment(post_key);
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
        success: function (data) {
            if (data.objects.length != 0) {
                // code parsing
                for (var dataObj in data.objects) {
                    try {
                        var codeReg = /\[code(.*?)]\n{0,1}/i;
                        data.objects[dataObj].post.post = data.objects[dataObj].post.post.replace(codeReg, "<pre><code data-$1>");
                        data.objects[dataObj].post.post = data.objects[dataObj].post.post.replace("data- language", "data-language");
                        data.objects[dataObj].post.post = data.objects[dataObj].post.post.replace("[/code]", "</code></pre>");
                    } catch (e) {
                        console.log("code parsing exception: " + e);
                    }
                }
                $("#post_public_template").tmpl(data.objects).prependTo("#timeline_posts");

                Rainbow.color();

                timeRefresh();
                post_top_url = data.meta.previous;
                if (!data.meta.previous)
                    post_top_url = "http://" + window.location.host + post_api + "?limit=1&id__gt=" + data.objects[0].id + "&" + timeline_js_parameter_top_post_polling;
                if (isBottominit == 0) {
                    post_bottom_url = (!data.meta.next) ? null : data.meta.next + "&id__lte=" + data.objects[0].id;
                    isBottominit = 1;
                }

                $(".p_video_unloaded").each(function () {
                    var targetDiv = $(this);

                    $.ajax({
                        url: api_path + "videos/?post=" + $(this).attr("id").substring(6),
                        type: "GET",
                        dataType: "json",
                        success: function (data) {
                            var videoId;
                            var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/;
                            var match = data.objects[0].video.match(regExp);
                            if (match&&match[7].length==11){
                                videoId = match[7];
                                $(targetDiv).html('<iframe width="560" height="315" src="//www.youtube.com/embed/'+videoId+'" frameborder="0" allowfullscreen></iframe>');
                            }
                        }
                    });
                });

                $(".p_file_unloaded").each(function () {
                    var targetDiv = $(this);
                    $.ajax({
                        url: api_path + "user_files/?post=" + $(this).attr("id").substring(5),
                        type: "GET",
                        dataType: "json",
                        success: function (data) {
                            for (obj in data.objects) {
                                data.objects[obj] = data.objects[obj];
                            }

                            //var file_name = data.objects[0].file_link.split("/");
                            var imageExp = /.[jpg|png|jpeg|gif]$/;
                            if(imageExp.test(data.objects[0].file_name)) {
                                $(targetDiv).append('<a href="' + data.objects[0].file_link + '">' + '<img src="' + data.objects[0].file_link + '" alt="' + data.objects[0].file_name + '" />' + '</li>');
                            }
                            else {
                                $(targetDiv).append('<a href="' + data.objects[0].file_link + '">' + data.objects[0].file_name + '</li>');
                            }
                            $(targetDiv).removeClass("p_file_unloaded");
                            $(targetDiv).addClass("p_file");
                        }
                    });
                });

                $(".p_poll_unloaded").each(function () {
                    var targetDiv = $(this);

                    $.ajax({
                        url: api_path + "polls/?post=" + $(this).attr("id").substring(5),
                        type: "GET",
                        dataType: "json",
                        success: function (data) {
                            var totalCount = 0;

                            data.objects[0].poll = JSON.parse(data.objects[0].poll);

                            $(targetDiv).append('<li class="pollTitle" id="poll_id-' + data.objects[0].id + '">' + data.objects[0].poll.title + '</li>');
                            $("#poll_template").tmpl(data.objects[0].poll.options).appendTo(targetDiv);

                            for (var index in data.objects[0].poll.options) {
                                totalCount = totalCount + data.objects[0].poll.options[index].users.length;
                            }

                            $(targetDiv).attr("data-totalCount",totalCount);

                            $(targetDiv).children("li").each(function(){
                                var targetLi = $(this);
                                if(targetLi.attr("data-length")>=0) {
                                    console.log(targetLi.parent().attr("data-totalcount"));
                                    targetLi.children(".pollItem").css("background-position",(540 * parseInt(targetLi.attr("data-length")) / totalCount - 1000) + "px 50%");
                                }
                            });

                            if(data.objects[0].user_checked != -1) {
                                $(targetDiv).children("li").eq(parseInt(data.objects[0].user_checked)+1).addClass("checked");
                            }

                            $(targetDiv).removeClass("p_poll_unloaded");

                            $(targetDiv).addClass("p_poll");
                            bindPoll($(targetDiv).attr("id"));
                        }
                    });
                });

            }
        }
    });
}

// when screen on top, call PostTopPolling
$(document).ready(function () {
    PostTopPolling();
    setTimeout(function () {
        $("#timeline_posts").waypoint(function () {
            postBottom();
        }, { offset: 'bottom-in-view' });
    }, 1000);
    setTimeout(function () {
        $("#p_timeline").waypoint(function () {
            PostTopPolling()
        }, { offset: '0' });
    }, 5000);

    // dynamic timeago(Korean)
    $.timeago.settings.strings = {
        suffixAgo: "전",
        suffixFromNow: "후",
        seconds: "방금",
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

    setTimeout(function () {
        timeRefresh();
    }, 2000);
});

function postBottom() {
    if (!post_bottom_url)
        return;
    $.ajax({
        url: post_bottom_url,
        type: "GET",
        dataType: "json",
        success: function (data) {
            console.log("BOTTOM POLL POST   url:" + post_bottom_url);
            if (data.objects.length != 0) {
                for (var dataObj in data.objects) {
                    try {
                        var codeReg = /\[code(.*?)]\n{0,1}/i;
                        data.objects[dataObj].post.post = data.objects[dataObj].post.post.replace(codeReg, "<pre><code data-$1>");
                        data.objects[dataObj].post.post = data.objects[dataObj].post.post.replace("data- language", "data-language");
                        data.objects[dataObj].post.post = data.objects[dataObj].post.post.replace("[/code]", "</code></pre>");
                    } catch (e) {
                        console.log("code parsing exception: " + e);
                    }
                }
                $("#post_public_template").tmpl(data.objects).appendTo("#timeline_posts");
                Rainbow.color();
                post_bottom_url = data.meta.next;
                console.log("2 next url:  " + post_bottom_url);
                timeRefresh();
            }

            $(".p_file_unloaded").each(function () {
                var targetDiv = $(this);
                $.ajax({
                    url: api_path + "user_files/?post=" + $(this).attr("id").substring(5),
                    type: "GET",
                    dataType: "json",
                    success: function (data) {
                        for (obj in data.objects) {
                            data.objects[obj] = data.objects[obj];
                        }
                        var file_name = data.objects[0].file_link.split("/");
                        $(targetDiv).append('<a href="' + data.objects[0].file_link + '">' + file_name[5] + '</li>');
                        //$("#file_template").tmpl(data.objects[0].file_type).appendTo(targetDiv);
                        $(targetDiv).removeClass("p_file_unloaded");
                        $(targetDiv).addClass("p_file");
                    }
                });
            });

            $(".p_poll_unloaded").each(function () {
                var targetDiv = $(this);
                $.ajax({
                    url: api_path + "polls/?post=" + $(this).attr("id").substring(5),
                    type: "GET",
                    dataType: "json",
                    success: function (data) {
                        data.objects[0].poll = JSON.parse(data.objects[0].poll);
                        var totalCount = 0;

                        $(targetDiv).append('<li class="pollTitle" id="poll_id-' + data.objects[0].id + '">' + data.objects[0].poll.title + '</li>');
                        $("#poll_template").tmpl(data.objects[0].poll.options).appendTo(targetDiv);

                        for (var index in data.objects[0].poll.options) {
                            console.log(index);
                            totalCount = totalCount + data.objects[0].poll.options[index].users.length;
                        }

                        $(targetDiv).attr("data-totalCount",totalCount);

                        $(targetDiv).children("li").each(function(){
                                var targetLi = $(this);
                                if(targetLi.attr("data-length")>=0) {
                                    console.log(targetLi.parent().attr("data-totalcount"));
                                    targetLi.children(".pollItem").css("background-position",(540 * parseInt(targetLi.attr("data-length")) / totalCount - 1000) + "px 50%");
                                }
                            });

                        if(data.objects[0].user_checked != -1) {
                            $(targetDiv).children("li").eq(parseInt(data.objects[0].user_checked)+1).addClass("checked");
                        }

                        $(targetDiv).removeClass("p_poll_unloaded");
                        $(targetDiv).addClass("p_poll");
                        bindPoll($(targetDiv).attr("id"));
                    }
                });
            });
        }
    });
}
// polling comment
function pollComment(post_id) {
    if (!post_id)
        return;

    var feedback_api = comment_api + "?post=" + post_id; // api inner parameter ?limit=20&offset=0"

    if (comment_offsets[post_id]) {
        feedback_api = comment_api + "?post=" + post_id + "&limit=30&id__gt=" + comment_offsets[post_id];
        // feedback_api = "/api/v1/comment/?post=" + post_id + "&limit=30&offset=" + comment_offsets[post_id];
    }

    console.log("Polling comment url :  " + feedback_api);
    $.ajax({
        url: feedback_api,
        type: "GET",
        dataType: "json",
        success: function (data) {
            if (data.objects.length != 0) {
                console.log(data);
                $("#comment_template").tmpl(data.objects).appendTo("#commentList" + post_id);
                timeRefresh();
                comment_offsets[post_id] = data.objects[data.objects.length - 1].id;
                console.log("댓글 폴링한 마지막 오프셋 :" + comment_offsets[post_id]);
                counting_comment(post_id);
            }
        }
    });
}

// comment toggle
$(document).on("click", ".p_responses", function () {
    $(this).parent().children("section").toggle();
    var resp = $(this).toggleClass("opened");

    // comment polling on post focused
    if (resp && resp.context.className.search("opened") != -1) {
        var tag_id = $(this).siblings(".p_comment").children(".p_commentList").attr("id");
        if (!tag_id)
            return false;
        var postid = tag_id.replace("commentList", "");

        pollComment(postid);
    }
    return false;
});

// emotion click
$(document).on("click", ".form_emotion :submit", function (event) {
    var feedback_api = api_path + "postemotions/";
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
            201: function (data) {
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

// attach something
$(function () {
    $(".attachSelect .wPoll").click(function () {
        $("#postAttach").show();
        $(".attachSelect").hide();
        if (!post_attach) {
            post_attach = true;
            attach_type = "poll";
            var pollHtml = '<div id="attach_poll">';
            pollHtml = pollHtml + '<input class="attachTitle" id="pollTitle" type="text" placeholder="설문조사 제목" />'
                    + '<ul id="pollElement"><li><input type="text" class="attachElement" placeholder="항목 1"></li><li><input type="text" class="attachElement" placeholder="항목 2"></li><li><a href="#" id="add_poll">새 항목 추가</a></li></ul>'
                    + '</div>';

            $("#postAttach").html(pollHtml);

            $("#add_poll").click(function () {
                var newElement = '<li><input type="text" class="attachElement" placeholder="항목 ' + (parseInt($(".attachElement:last").attr("placeholder").substring(3)) + 1) + '">'
                        + '<a class="removeElement">항목 삭제</a>';
                $("#add_poll").parent().before(newElement);
            });

            $("#postAttach").on("click",".removeElement",function(){
                $(this).parent().remove();
            });
        }
    });

    // Simply add code tag on the textarea.
    $(".attachSelect .wCode").click(function () {
        var modalWindow = '<div id="codeModal" class="modalWrapper"><div class="modalMargin"></div><div id="codeModalBox" class="modalBox"><a href="#" id="closeModal"></a><h2>Attach Code</h2></div></div>';
        $("body").append(modalWindow);
        $("#codeModal").height($(document).height());
        $("#codeModal .modalMargin").height($(window).height()/2);
        $("#codeModal .modalBox").width("480px").height("360px").css("marginTop","-180px");
        $("#post").val($("#post").val() + "[code language=\"language\"]\n\n[/code]");
    });

    // Attach video's address on YouTube
    $(".attachSelect .wVideo").click(function () {
        $("#postAttach").show();
        $(".attachSelect").hide();
        if (!post_attach) {
            post_attach = true;
            attach_type = "video";
            $("#postAttach").html('<div id="attach_video"></div>');
            var attachAddress = document.createElement("input");
            attachAddress.className = "attachTitle";
            attachAddress.id = "videoAddress";
            attachAddress.setAttribute("type", "text");
            attachAddress.setAttribute("placeholder", "YouTube 주소");
            document.getElementById("attach_video").appendChild(attachAddress);
        }
    });

    $(".attachSelect .wFile").click(function () {
        $("#postAttach").show();
        $(".attachSelect").hide();
        if (!post_attach) {
            post_attach = true;
            attach_type = "file";
            //$("#postAttach").html('<form method="" action="" name="upload_form" id="upload_form" ><input type="file" name="file" id="file" /><input type="button" value="Upload" id="upload"/></form>');
            //$("#postAttach").html('<div id="invisible"><form action="https://somapodium.s3.amazonaws.com" method="post" enctype="multipart/form-data" id="upload_form"><input type="hidden" name="key"></input><input type="hidden" name="AWSAccessKeyId" value="AKIAJKZRCQKYZ7EHIXYA"></input><input type="hidden" name="acl" value="public-read"></input><input type="hidden" name="policy"></input><input type="hidden" name="signature"></input><input type="hidden" name="success_action_status" value="201"></input><input type="file" id="file_info" name="file"></input></form></div><div id="wrapper"><input type="button" id="upload_button" value="upload"/><div id="progress_container"><div id="progress_bar"></div></div></div><div id="status_container">Status: <span id="status">idle</span></div>');
            $("#postAttach").html('<div id="attach_file"></div><div id="attach_file_info"></div><div id="attach_file_type"></div><div id="attach_is_file"></div><div id="attach_file_count"></div><div id="attach_file_name"></div>');
            $("#attach_file").html('<div id="status">Please select a file</div>');

            //$("#attach_file").html('<input type="hidden" id="post_is_file" value="12"></input>');
            var attachFile = document.createElement("input");
            attachFile.id = "post_file";
            attachFile.setAttribute("type", "file");
            attachFile.setAttribute("onchange", "s3_upload_put();");

            $("#attach_file_info").html('<input type="hidden" id="post_file_url_info" value="" >');
            $("#attach_file_type").html('<input type="hidden" id="post_file_type" value="" >');
            $("#attach_is_file").html('<input type="hidden" id="post_is_file" value="0" >');
            $("#attach_file_count").html('<input type="hidden" id="post_file_count" value="" >');
            $("#attach_file_name").html('<input type="hidden" id="post_file_name" value="파일 이름" >');
            //var attachFileUrl = document.createElement("<input type='hidden' name='post_file_url_info' value=''>");
            //attachFileUrl.setAttribute("name", "post_file_url_info");
            //attachFileUrl.setAttribute("type", "hidden");
            //attachFileUrl.setAttribute("value", "");


            var attachFileCancelButton = document.createElement("button");
            attachFileCancelButton.id = "post_file_delete_button";
            attachFileCancelButton.setAttribute("type", "button");
            attachFileCancelButton.setAttribute("value", "업로드파일삭제");
            attachFileCancelButton.setAttribute("onclick", "s3_upload_delete()");

            //var attachPreview = document.createElement("input");
            //attachPreview.id = "file_status";
            //attachPreview.setAttribute("value", "please select a file");

            document.getElementById("attach_file").appendChild(attachFile);
            //document.getElementById("status").appendChild(attachFileUrl);
            document.getElementById("attach_file").appendChild(attachFileCancelButton);

        }
        console.log(post_attach);
    });
    $("#toPlain").click(function () {
        $("#plainTextInput").show();
        $("#richTextInput").hide();
        $("#toRich").removeClass("selected");
        $(this).addClass("selected");
    });
    $("#toRich").click(function () {
        $("#plainTextInput").hide();
        $("#richTextInput").show();
        $("#toPlain").removeClass("selected");
        $(this).addClass("selected");
    });
})

function bindPoll(targetDiv) {
    $("#" + targetDiv).on("click","li",function () {
        if($(this).index()==0) return false;

        var data = JSON.stringify({
            "id":  parseInt($(this).parent().children(".pollTitle").attr("id").substring(8)),
            "item": ($(this).index() - 1)
        });

        $.ajax({
            url: "/vote/",
            type: "POST",
            contentType: "application/json",
            data: data,
            dataType: "json",
            success: function (data) {
                data.poll = JSON.parse(data.poll);
                var totalCount = 0;

                for (index in data.poll.options)
                    totalCount = totalCount + data.poll.options[index].users.length;

                $("#"+targetDiv).html("");
                $("#"+targetDiv).attr("data-totalCount",totalCount);

                $("#"+targetDiv).append('<li class="pollTitle" id="poll-id-'+data.id+'">' + data.poll.title + '</li>');
                $("#poll_template").tmpl(data.poll.options).appendTo("#"+targetDiv);
                if(data.user_checked != -1) {
                    $("#"+targetDiv).children("li").eq(parseInt(data.user_checked)+1).addClass("checked");
                }

                $("#"+targetDiv).children("li").each(function(){
                    var targetLi = $(this);
                    if(targetLi.attr("data-length")>=0) {
                        console.log(targetLi.parent().attr("data-totalcount"));
                        targetLi.children(".pollItem").css("background-position",(540 * parseInt(targetLi.attr("data-length")) / totalCount - 1000) + "px 50%");
                    }
                });

                $("#"+targetDiv).addClass("p_poll");
            }
        });
    });
}

function s3_upload_put() {
    var check_file_name = $('#post_file').val();
    console.log("check_file_name is = %s %s", check_file_name, $('#post_file')[0].files[0].size);
    var extension = check_file_name.replace(/^.*\./, '');
    var valid_extensions = ['hwp', 'jpg', 'ppt', 'pptx', 'doc', 'zip', 'png','txt'];
    //console.log("s3 upload = " + $("#post_is_file").val());
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
        console.log("s3 upload = " + $("#post_is_file").val);
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
                            console.log("finishS3Put file name =" + file.name);
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

function s3_upload_delete() {
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

        console.log("file info =" + $('#post_file_url_info').val());
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
                console.log("onFinishS3Put url = " + url);
                var parse_url = url.split("/");
                //console.log(parse_url[0] +"," + parse_url[1] + "," + parse_url[2]);
                $("#status").html("Please select a file");
                $("#post_is_file").val("0");
            },
            onError: function (status) {
                $('#status').html('Delete error: ' + status);
            }
        });
    }
}

var counting_comment = function(post_key) {
    var comment_count = $("#commentList" + post_key + " li").size();
    $("#commentList" + post_key).parent().siblings("header").find(".p_comment").html("<a herf='#'><strong>댓글</strong>/ " + comment_count + "</a>");
};