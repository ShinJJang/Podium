$(document).ready(function() {
    var feedback_api = '/api/v1/userprofile/'
    $.ajax({
        url: feedback_api,
        type: "GET",
        dataType: "json",
        success: function(data) {
           $('#p_topSearchForm').autocomplete({
               source: data.objects,
               select: function(event, ui) {
                   $("p_topSearchForm").val(ui.item.user.username)
                   return false;
               }
           }).data("ui-autocomplete")._renderItem = function(ul, item) {
               return $("<li></li>")
                   .data("ui-autocomplete-item", item)
                   .append("<a>" + item.user.username + "</a>")
                   .appendTo(ul);
           };
           console.log(data.objects);
        }
    });
});