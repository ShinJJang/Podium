$(function(){
    $('#p_topSearchForm').keydown(function() {
        var search_keyword = $(this).val();
        var user_feedback_api = '/api/v1/user/search/?q='+search_keyword;
        $("#p_topSearch_results").html('');
        $.ajax({
            url: user_feedback_api,
            type: "GET",
            dataType: "json",
            success: function(data) {
                $("#p_topSearch_results").html(' ');

                if(data.objects.length != 0)
                    $('#p_topSearch_results').append('<li class="resultPeople"><a href="#">사람</a></li>');

                for(var index in data.objects){
                    $('#p_topSearch_results').append('<li><a href=/people/'+data.objects[index].id+'>'+data.objects[index].username+'</a></li>');
                }
                search_group(search_keyword);
            }
        });
    });
});

var search_group = function(search_keyword) {
    var group_feedback_api = '/api/v1/groups/search/?q='+search_keyword;
    $.ajax({
        url: group_feedback_api,
        type: "GET",
        dataType: "json",
        success: function(data) {
            if(data.objects.length != 0)
                $('#p_topSearch_results').append('<li class="resultGroup"><a href="#">그룹</a></li>');

            for(var index in data.objects){
                $('#p_topSearch_results').append('<li><a href=/group/'+data.objects[index].id+'>'+data.objects[index].group_name+'</a></li>');
            }
            search_post(search_keyword);
        }
    });
};

var search_post = function(search_keyword) {
    var group_feedback_api = '/api/v1/post/search/?q='+search_keyword;
    $.ajax({
        url: group_feedback_api,
        type: "GET",
        dataType: "json",
        success: function(data) {
            if(data.objects.length != 0)
                $('#p_topSearch_results').append('<li class="resultPost"><a href="#">글</a></li>');

            for(var index in data.objects){
                $('#p_topSearch_results').append('<li><a href=/post/'+data.objects[index].id+'>'+data.objects[index].post+'</a></li>');
            }
            search_no_result();
        }
    });
};

var search_no_result = function() {
    var result_count = $('#p_topSearch_results > li').length;
    if(result_count == 0) {
        $('#p_topSearch_results').append('<li><a href="#">결과없음</a></li>');
    }
};