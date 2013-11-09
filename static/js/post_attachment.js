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

function codeLineBreakReplace(str) {
    str = codeReplace(str);
    return str;
}
