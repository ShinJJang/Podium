/**
 * Created with PyCharm.
 * User: zfbe
 * Date: 13. 8. 30.
 * Time: 오전 7:29
 * To change this template use File | Settings | File Templates.
 */
/**
 * Created with PyCharm.
 * User: lacidjun
 * Date: 13. 8. 29
 * Time: 오후 10:04
 * To change this template use File | Settings | File Templates.
 */

$('#form_request_friend').submit(function (event) {
    var request_friend_url = "/api/v1/friend_noti/";
    var data = JSON.stringify({
        "friend_id": $("input[name=friend_id]").val()
    });
    console.log("friend id = " + data.friend_id);
    $.ajax({
        type: "POST",
        url: request_friend_url,
        contentType: "application/json",
        data: data,
        dataType: "json",
        statusCode: {
            201: function (data) {
                /*post로 Noti 생성한 후 json response*/
                console.log("request friend to django server, [response] = [" + data + "]");
            }
        }
    });
    return false;
});

var noti_check_friend = setInterval(function () {
    $('#form_noti_check_friend').submit(function (event) {
        var noti_check_friend_url = "/api/v1/friend_noti/?noti_to_user=" + user_id; //자기 자신의 유저 아이디
        $.ajax({
            type: "GET",
            url: noti_check_friend_url,
            contentType: "application/json",
            dataType: "json",
            statusCode: {
                200: function (data) {
                    console.log("request friend to django server, [response] = [" + data + "]");
                    accept_friend_request(data.friend_id); //accept or reject but, now always accept
                }
            }
        });
        return false;
    });
}, 5000);

var accept_friend_request = (function(friend_id) {
    console.log('friend_id = ' + friend_id);
    var accept_friendship_url = "/api/v1/friendship/";
    accept_friend_data = JSON.stringify({
       friend_id : friend_id
    });
    $.ajax({
        type: 'POST',
        url: accept_friend_request_url,
        contentType: "application/json",
        data: accept_friend_data,
        dataType: "json",
        statusCode: {
            201: function (data) {
                console.log("accept_friendship, [response] = [" + data + "]");
            }
        }
    });
    return false;
});