$('#p_topSearchForm').keyup(function() {
    if(!$(this).val())
        return false;
    var user_feedback_api = '/api/v1/user/search/?q='+$(this).val();
    var group_feedback_api = '/api/v1/groups/search/?q='+$(this).val();
    $("#p_topSearch_results").html('');
    $.ajax({
        url: user_feedback_api,
        type: "GET",
        dataType: "json",
        success: function(data) {
            for(var index in data.objects){
                console.log(data);
                $('#p_topSearch_results').append('<li><a href=/people/'+data.objects[index].id+'>'+data.objects[index].username+'</a></li>');
            }
        }
    });
    $.ajax({
        url: group_feedback_api,
        type: "GET",
        dataType: "json",
        success: function(data) {
            for(var index in data.objects){
                console.log(data);
                $('#p_topSearch_results').append('<li><a href=/group/'+data.objects[index].id+'>'+data.objects[index].group_name+'</a></li>');
            }
        }
    });
});