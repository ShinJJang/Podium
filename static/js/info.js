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

    $('.highschool_name').keydown(function() {
        var search_keyword = $(this).val();
        var complete_api = '/api/v1/highschools/search/?q='+search_keyword;
        var result_list = $(this).siblings('.highschool_results');
        $(result_list).show();
        $.ajax({
            url: complete_api,
            type: "GET",
            dataType: "json",
            success: function(data) {
                $(result_list).html('');
                for(var index in data.objects){
                    $(result_list).append('<li><a href="#">'+data.objects[index].name+'</a></li>');
                }
            }
        });
    }).blur(function(){
        $(this).siblings('.highschool_results').fadeOut();
    });

    $('.university_name').keydown(function() {
        var search_keyword = $(this).val();
        var complete_api = '/api/v1/university/search/?q='+search_keyword;
        var result_list = $(this).siblings('.university_results');
        $(result_list).show();
        $.ajax({
            url: complete_api,
            type: "GET",
            dataType: "json",
            success: function(data) {
                $(result_list).html('');
                for(var index in data.objects){
                    $(result_list).append('<li><a href="#">'+data.objects[index].name+'</a></li>');
                }
            }
        });
    }).blur(function(){
        $(this).siblings('.university_results').fadeOut();
    });

    $('.company_name').keydown(function() {
        var search_keyword = $(this).val();
        var complete_api = '/api/v1/companies/search/?q='+search_keyword;
        var result_list = $(this).siblings('.company_results');
        $(result_list).show();
        $.ajax({
            url: complete_api,
            type: "GET",
            dataType: "json",
            success: function(data) {
                $(result_list).html('');
                for(var index in data.objects){
                    $(result_list).append('<li><a href="#">'+data.objects[index].name+'</a></li>');
                }
            }
        });
    }).blur(function(){
        $(this).siblings('.company_results').fadeOut();
    });

    $('.planguage_name').keydown(function() {
        var search_keyword = $(this).val();
        var complete_api = '/api/v1/planguages/search/?q='+search_keyword;
        var result_list = $(this).siblings('.planguage_results');
        $(result_list).show();
        $.ajax({
            url: complete_api,
            type: "GET",
            dataType: "json",
            success: function(data) {
                $(result_list).html('');
                for(var index in data.objects){
                    $(result_list).append('<li><a href="#">'+data.objects[index].name+'</a></li>');
                }
            }
        });
    }).blur(function(){
        $(this).siblings('.planguage_results').fadeOut();
    });

    $('.hobby_name').keydown(function() {
        var search_keyword = $(this).val();
        var complete_api = '/api/v1/hobbies/search/?q='+search_keyword;
        var result_list = $(this).siblings('.hobby_results');
        $(result_list).show();
        $.ajax({
            url: complete_api,
            type: "GET",
            dataType: "json",
            success: function(data) {
                $(result_list).html('');
                for(var index in data.objects){
                    $(result_list).append('<li><a href="#">'+data.objects[index].name+'</a></li>');
                }
            }
        });
    }).blur(function(){
        $(this).siblings('.hobby_results').fadeOut();
    });

    $('.infoBox .autocomplete').on('click','a', function(){
        $(this).parent().parent().siblings('input[type=text]').val($(this).html());
        return false;
    });

    $('.infoBox .info').click(function(){
        $(this).hide();
        $(this).siblings(".editor").show();
    });

    $('.infoBox .editor .f_cancel').click(function(){
        $(this).parent().parent().hide();
        $(this).parent().parent().siblings(".info").show();
    });

    $('.infoBox .editor .f_delete').click(function(){
        $(this).parent().parent().hide();
        $(this).parent().parent().siblings(".info").show();
    });

    $('#profile_highschool .f_submit').click(function(){
        var enter = $(this).parent().parent().find('.highschool_enter').val();
        var graduate = $(this).parent().parent().find('.highschool_graduate').val();

        var itemUrl = '/api/v1/highschools/';
        var itemName= $(this).parent().parent().find('.highschool_name').val();
        var relationId = $(this).parent().parent().find('.highschool_id').val();
        var relationUrl = '/api/v1/user_to_highschool/';
        var relationData = new Object();
        relationData['enter'] = enter;
        relationData['graduate'] = graduate;

        var target = $(this).parent().parent().parent();

        if(relationId>0) {
            profileSubmit("highschool",itemUrl, itemName, relationId, relationUrl, relationData, target);
        } else {
            profileAdd("highschool",itemUrl, itemName, relationUrl, relationData, target);
        }
        return false;
    });

    $('#profile_highschool .f_delete').click(function(){
        var relationId = $(this).parent().parent().find('.highschool_id').val();
        var relationUrl = '/api/v1/user_to_highschool/';
        var target = $(this).parent().parent().parent();

        if(relationId>0) {
            profileDelete(relationId, relationUrl, target);
        }
        return false;
    });

    $('#profile_university .f_submit').click(function(){
        var enter = $(this).parent().parent().find('.university_enter').val();
        var graduate = $(this).parent().parent().find('.university_graduate').val();
        var major= $(this).parent().parent().find('.university_major').val();

        var itemUrl = '/api/v1/university/';
        var itemName= $(this).parent().parent().find('.university_name').val();
        var relationId = $(this).parent().parent().find('.university_id').val();
        var relationUrl = '/api/v1/user_to_university/';

        var relationData = new Object();
        relationData['enter'] = enter;
        relationData['graduate'] = graduate;
        relationData['major'] = major;

        var target = $(this).parent().parent().parent();

        if(relationId>0) {
            profileSubmit("university",itemUrl, itemName, relationId, relationUrl, relationData, target);
        } else {
            profileAdd("university",itemUrl, itemName, relationUrl, relationData, target);
        }
        return false;
    });

    $('#profile_university .f_delete').click(function(){
        var relationId = $(this).parent().parent().find('.university_id').val();
        var relationUrl = '/api/v1/user_to_university/';
        var target = $(this).parent().parent().parent();

        if(relationId>0) {
            profileDelete(relationId, relationUrl, target);
        }
        return false;
    });

    $('#profile_company .f_submit').click(function(){
        var enter = $(this).parent().parent().find('.company_enter').val();
        var leave = $(this).parent().parent().find('.company_leave').val();
        var job = $(this).parent().parent().find('.company_job').val();

        var itemUrl = '/api/v1/companies/';
        var itemName= $(this).parent().parent().find('.company_name').val();
        var relationId = $(this).parent().parent().find('.company_id').val();
        var relationUrl = '/api/v1/user_to_company/';

        var relationData = new Object();
        relationData['enter'] = enter;
        relationData['leave'] = leave;
        relationData['job'] = job;
        console.log(relationData);

        var target = $(this).parent().parent().parent();

        if(relationId>0) {
            profileSubmit("company",itemUrl, itemName, relationId, relationUrl, relationData, target);
        } else {
            profileAdd("company",itemUrl, itemName, relationUrl, relationData, target);
        }
        return false;
    });

    $('#profile_company .f_delete').click(function(){
        var relationId = $(this).parent().parent().find('.company_id').val();
        var relationUrl = '/api/v1/user_to_company/';
        var target = $(this).parent().parent().parent();

        if(relationId>0) {
            profileDelete(relationId, relationUrl, target);
        }
        return false;
    });
    
    $('#profile_planguage .f_submit').click(function(){
        var itemUrl = '/api/v1/planguages/';
        var itemName= $(this).parent().parent().find('.planguage_name').val();
        var relationId = $(this).parent().parent().find('.planguage_id').val();
        var relationUrl = '/api/v1/user_to_planguage/';

        var relationData = new Object();

        var target = $(this).parent().parent().parent();

        if(relationId>0) {
            profileSubmit("planguage",itemUrl, itemName, relationId, relationUrl, relationData, target);
        } else {
            profileAdd("planguage",itemUrl, itemName, relationUrl, relationData, target);
        }
        return false;
    });

    $('#profile_planguage .f_delete').click(function(){
        var relationId = $(this).parent().parent().find('.planguage_id').val();
        var relationUrl = '/api/v1/user_to_planguage/';
        var target = $(this).parent().parent().parent();

        if(relationId>0) {
            profileDelete(relationId, relationUrl, target);
        }
        return false;
    });
    
    $('#profile_hobby .f_submit').click(function(){
        var itemUrl = '/api/v1/hobbies/';
        var itemName= $(this).parent().parent().find('.hobby_name').val();
        var relationId = $(this).parent().parent().find('.hobby_id').val();
        var relationUrl = '/api/v1/user_to_hobby/';

        var relationData = new Object();

        var target = $(this).parent().parent().parent();

        if(relationId>0) {
            profileSubmit("hobby",itemUrl, itemName, relationId, relationUrl, relationData, target);
        } else {
            profileAdd("hobby",itemUrl, itemName, relationUrl, relationData, target);
        }
        return false;
    });

    $('#profile_hobby .f_delete').click(function(){
        var relationId = $(this).parent().parent().find('.hobby_id').val();
        var relationUrl = '/api/v1/user_to_hobby/';
        var target = $(this).parent().parent().parent();

        if(relationId>0) {
            profileDelete(relationId, relationUrl, target);
        }
        return false;
    });
});

function profileDelete(relationId, relationUrl, target) {
    $.ajax({
        url: relationUrl + relationId,
        type: 'DELETE',
        dataType: 'json',
        contentType: 'application/json',
        statusCode:{
            204: function() {
                showToast("삭제되었습니다.");
                $(target).remove();
            }
        }
    });
}

function profileSubmit(entityName, itemUrl, itemName, relationId, relationUrl, relationData, target) {
    $.ajax({
        url: itemUrl + '?name=' + itemName,
        type: 'GET',
        dataType: 'json',
        contentType: 'application/json',
        success: function(data) {
            if(data.objects.length==0) {
                // add to objects
                dataStr = JSON.stringify({
                    "name": itemName
                });
                $.ajax({
                    url: itemUrl,
                    type: 'POST',
                    dataType: 'json',
                    contentType: 'application/json',
                    data: dataStr,
                    statusCode: {
                        201: function(data) {
                            relationData[entityName] = itemUrl + data.id + '/';
                            relationData = JSON.stringify(relationData);
                            $.ajax({
                                url: relationUrl + relationId,
                                type: 'PATCH',
                                dataType: 'json',
                                contentType: 'application/json',
                                data: relationData,
                                statusCode:{
                                    202: function(data){
                                        $(target).children(".info").html('<div class="info">수정되었습니다.</div>').show();
                                        $(target).children(".editor").hide();
                                    }
                                }
                            });
                        }
                    }
                });
            } else {
                relationData[entityName] = itemUrl + data.objects[0].id + '/';
                relationData = JSON.stringify(relationData);
                console.log(relationData);
                $.ajax({
                    url: relationUrl + relationId,
                    type: 'PATCH',
                    dataType: 'json',
                    contentType: 'application/json',
                    data: relationData,
                    statusCode:{
                        202: function(data){
                            $(target).children(".info").html('<div class="info">수정되었습니다.</div>').show();
                            $(target).children(".editor").hide();
                        }
                    }
                });
            }
        }
    });
}

function profileAdd(entityName, itemUrl, itemName, relationUrl, relationData, target) {
    $.ajax({
        url: itemUrl + '?name=' + itemName,
        type: 'GET',
        dataType: 'json',
        contentType: 'application/json',
        success: function(data) {
            if(data.objects.length==0) {
                // add to objects
                dataStr = JSON.stringify({
                    "name": itemName
                });
                $.ajax({
                    url: itemUrl,
                    type: 'POST',
                    dataType: 'json',
                    contentType: 'application/json',
                    data: dataStr,
                    statusCode: {
                        201: function(data) {
                            relationData[entityName] = data.id;
                            relationData = JSON.stringify(relationData);
                            console.log(relationData);
                            $.ajax({
                                url: relationUrl,
                                type: 'POST',
                                dataType: 'json',
                                contentType: 'application/json',
                                data: relationData,
                                statusCode:{
                                    201: function(){
                                        $(target).children(".info").html('<div class="info">수정되었습니다.</div>').show();
                                        $(target).children(".editor").hide();
                                    }
                                }
                            });
                        }
                    }
                });
            } else {
                relationData[entityName] = data.objects[0].id;
                relationData = JSON.stringify(relationData);
                console.log(relationData);
                $.ajax({
                    url: relationUrl,
                    type: 'POST',
                    dataType: 'json',
                    contentType: 'application/json',
                    data: relationData,
                    statusCode:{
                        201: function(){
                            $(target).children(".info").html('<div class="info">수정되었습니다.</div>').show();
                            $(target).children(".editor").hide();
                        }
                    }
                });
            }
        }
    });
}