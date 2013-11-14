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
                $("#p_topSearch_results").html('');
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
            for(var index in data.objects){
                $('#p_topSearch_results').append('<li><a href=/group/'+data.objects[index].id+'>'+data.objects[index].group_name+'</a></li>');
            }
        }
    });
};