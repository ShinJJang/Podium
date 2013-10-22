$('#p_topSearchForm').keyup(function() {
    if(!$(this).val())
        return false;
    var feedback_api = '/api/v1/user/search/?q='+$(this).val();
    $.ajax({
        url: feedback_api,
        type: "GET",
        dataType: "json",
        success: function(data) {
            if(data.objects.length == 0) {
                 $('#p_topSearch_results').html('');
            }
            for(index in data.objects){
                $('#p_topSearch_results').html('<li>'+data.objects[index].username+'</li>');
            }
        }
    });
});