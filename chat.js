var http = require('http');
var server = http.createServer().listen(4000);
var io = require('socket.io').listen(server);
var cookie_reader = require('cookie');
var querystring = require('querystring');

var redis = require('socket.io/node_modules/redis');
var sub = redis.createClient();
var pub = redis.createClient();
//Subscribe to the Redis chat channel
console.log('test');
//Configure socket.io to store cookie set by Django
io.configure(function () {
    io.set('authorization', function (data, accept) {
        if (data.headers.cookie) {
            data.cookie = cookie_reader.parse(data.headers.cookie);
            console.log('set');
            return accept(null, true);
        }
        console.log('auth fail');
        return accept('error', false);
    });
    io.set('log level', 1);
});

//sub.subscribe('sub_chat'); //채팅 구독자
io.sockets.on('connection', function (socket) {
    count = 1;

    /*sub.on('message' , function (channel, message) {
        sub.send(message);
        count = count + 1;
        console.log(message + ' ' + count);
    });
    */
    socket.on('join', function (data) {
        console.log("join event");
        console.log(data);
        if(data.user_id != null) {
            socket.join(data.room_name);
            socket.set(data.user_id, data.room_name);
            console.log("채팅방 " + data.room_name + " 열렸다");
        }
        console.log("join event complete");
    });//this function is for socket room*/

    //Client is sending message through socket.io
    socket.on('send_message', function (message) {
        //send message to client
        console.log("send_message event");
        var data = (message.user_id + ": " + message.message);
        console.log(data);
        socket.get(message.room_name, function (error, room) {
            console.log(data + "get event and emit message in room");
            console.log(room);
            io.sockets.in(message.room_name).emit('message', data);
        });

        //send message to django fo chat_comment db
        values = querystring.stringify({
            comment: message.message,
            sessionid: socket.handshake.cookie['sessionid'],
            room_name: message.room_name
        });
        var options = {
            host: 'localhost',
            port: 3000,
            path: '/chat_comment',
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': values.length
            }
        };

        console.log('before send message to django');
        var req = http.get(options, function (res) {
            res.setEncoding('utf8');
            //Print out error message
            res.on('data', function (message) {
                if (message != 'Everything worked :)') {
                    console.log('Message: ' + message);
                }
            });
        });
        req.write(values);
        console.log(values);
        req.end();
    });
});