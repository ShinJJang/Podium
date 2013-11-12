$(function(){
    $(".editProfile").click(function(){
        $(this).removeClass("editProfile");
        $(this).addClass("editing");
    });

    $(".f_cancel").click(function(){
        $(this).parent().parent().addClass("editProfile");
        $(this).parent().parent().removeClass("editing");
        return false;
    });

    $("#profile_sex .f_submit").click(function(){
        var sexVal = $("#profile_sex input:checked").val()
        if (sexVal != 1 && sexVal != 2) {
            sexVal = null;
        }
        var dataStr = JSON.stringify({
            "sex":sexVal
        });
        $.ajax({
            type: 'PATCH',
            contentType: 'application/json',
            dataType: 'json',
            data: dataStr,
            url: '/api/v1/userprofile/'+$("#friend_profile_id").val()+'/',
            statusCode: {
                202: function(data) {
                    if (data.sex==1) {
                        $("#profile_sex .data").html("남자");
                    } else if (data.sex==2) {
                        $("#profile_sex .data").html("여자");
                    } else {
                        $("#profile_sex .data").html("비공개");
                    }
                    $("#profile_sex").addClass("editProfile");
                    $("#profile_sex").removeClass("editing");
                }
            }
        });
        return false;
    });

    $("#profile_birthday .f_submit").click(function(){
        var dataStr = JSON.stringify({
            "birthday":$("#f_birthday").val()
        });
        $.ajax({
            type: 'PATCH',
            contentType: 'application/json',
            dataType: 'json',
            data: dataStr,
            url: '/api/v1/userprofile/'+$("#friend_profile_id").val()+'/',
            statusCode: {
                202: function(data) {
                    $("#profile_birthday .data").html(data.birthday.substr(0,4)+"년 "+parseInt(data.birthday.substr(5,2))+"월 "+parseInt(data.birthday.substr(8,2))+"일");
                    $("#profile_birthday").addClass("editProfile");
                    $("#profile_birthday").removeClass("editing");
                }
            }
        });
        return false;
    });

    $("#profile_address .f_submit").click(function(){
        var dataStr = JSON.stringify({
            "address":$("#f_address").val()
        });
        $.ajax({
            type: 'PATCH',
            contentType: 'application/json',
            dataType: 'json',
            data: dataStr,
            url: '/api/v1/userprofile/'+$("#friend_profile_id").val()+'/',
            statusCode: {
                202: function(data) {
                    console.log(data);
                    $("#profile_address .data").html(data.address);
                    $("#profile_address").addClass("editProfile").removeClass("editing");
                }
            }
        });
        return false;
    });

    $("#profile_phone .f_submit").click(function(){
        var dataStr = JSON.stringify({
            "phone":$("#f_phone").val()
        });
        $.ajax({
            type: 'PATCH',
            contentType: 'application/json',
            dataType: 'json',
            data: dataStr,
            url: '/api/v1/userprofile/'+$("#friend_profile_id").val()+'/',
            statusCode: {
                202: function(data) {
                    $("#profile_phone .data").html(data.phone);
                    $("#profile_phone").addClass("editProfile");
                    $("#profile_phone").removeClass("editing");
                }
            }
        });
        return false;
    });
});