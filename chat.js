var http = require('http');
var cookie_reader = require('cookie');
var querystring = require('querystring');
var winston = require('winston');
var max_data = 2 * 1024 * 1024;


var logger = new (winston.Logger)({
    transports: [
        new (winston.transports.Console)({
            colorize: 'true'
        }),
        new (winston.transports.File)({
            filename: 'tmp/node_chat_file.log',
            timestamp: 'true',
            colorize: 'true'
        })
    ],
    exceptionHandlers: [
        new winston.transports.File({
            filename: 'tmp/node_chat_exceptions.log'
        }),
        new (winston.transports.Console)({
            colorize: 'true'
        })
    ]
});

winston.setLevels(winston.config.syslog.levels);
logger.setLevels(winston.config.syslog.levels);
//
//var server = http.createServer(function (request, response) {
//    if (request.method == "POST") {
//        var post_data = '';
//        request.on('data', function(chunk) {
//            post_data = post_data + chunk;
//            if(post_data.length > max_data) {
//                post_data = '';
//                this.pause();
//                response.writeHead(413);
//                response.end('we are not accept big data');
//            }
//        }).on('end', function () {
//                if(!post_data) {
//                    response.end;
//                    return;
//                }
//                var post_data_object = querystring.parse(post_data);
//                console.log('receive message', post_data);
//                response.end('success' + util.inspect(post_data_object));
//            });
//    }
////}).listen(4000);
//var server = http.createServer().listen(4000);
//var io = require('socket.io').listen(server);
//var express = require('express');
var express = require('express')
    , app = express();

var server = http.createServer(app).listen(4000);

var io = require('socket.io').listen(server);

app.use(express.bodyParser());
//
//app.get('/', function (req, res) {
//    console.log(req.body);
//    io.sockets.in('39').emit("message", "asdasdasdasdasd");
//});

app.post('/', function (req, res) {
    console.log(req.body);
    var log_message = req.body;

    logger.info("log_message = " + log_message);
    if(log_message) {
        if(log_message.type == 'post') {
            logger.info("post_message = " + log_message.content);
            io.sockets.in('log_notify').emit("log_message", log_message.user_name + "이 " + log_message.content + "(글)을 썼습니다.");
        }
        else if(log_message.type == 'comment') {
            logger.info("comment_message = " + log_message.content);
            io.sockets.in('log_notify').emit("log_message", log_message.user_name + "이 " + log_message.where_owner + "의 " + log_message.where + " 에" + log_message.content + "(댓글)을 썼습니다.");
        }
        else if(log_message.type == 'emotion') {
            logger.info("comment_message = " + log_message.content);
            if(log_message == 'E1') {
                io.sockets.in('log_notify').emit("log_message", log_message.user_name + "이 " + log_message.where_owner + "의 " + log_message.where + "(글)을 멋져해");
            }
            else {
                io.sockets.in('log_notify').emit("log_message", log_message.user_name + "이 " + log_message.where_owner + "의 " + log_message.where + "(글)을 좋아해");
            }
        }
        else {
            logger.info("not accept type = ");
        }
    }

});




io.configure(function () {
    io.set('authorization', function (data, accept) {
        if (data.headers.cookie) {
            data.cookie = cookie_reader.parse(data.headers.cookie);
            logger.info("sessionId =" + data.cookie.sessionid + " connect");
            return accept(null, true);
        }
        console.log(data);
        logger.error('socket connect error');
        return accept('error', false);
    });
    io.set('log level', 8);
});

var users = {};

io.sockets.on('connection', function (socket) {
    logger.info('client id = ' + socket.id);
    console.log(socket);
    socket.on('join', function (data) {
        logger.info(data);
        if (data.user_id && data.user_name) {
            socket.user_name = data.user_name;
            socket.user_id = data.user_id;
            socket.room_id = data.room_name;
            socket.participant_count = data.participant_count;
            logger.info('socket.username = ' + socket.user_name);
            //socket.room_name = data.room_name;
            users[socket.user_id] = {
                user_name: data.username,
                user_id: data.user_id,
                room_name : data.room_name
            };
            logger.info('username = ' + data.user_name + ' user_id = ' + data.user_id + ' room_name = ' + data.room_name);
            socket.join(data.room_name);
        }
        else {
            socket.user_id = data.user_id;
            socket.user_name = data.user_name;
            socket.room_id = data.room_name;
            socket.participan_count = 0;
            socket.join(data.room_name);
        }
    });//this function is for socket room*/

    socket.on("disconnect", function () { //  todo(baek) disconnect시 소켓연결을 해제시켜준다.
        logger.info(socket.user_name + 'out');
        var duplication = 0;
        var clients = io.sockets.clients(socket.room_id);
        for (var i = 0; i < clients.length; i++) {
            if (socket.user_name == clients[i].user_name) {
                duplication++;
            }
            logger.info("access client = " + clients[i].user_name);
        }
        if(duplication > 1) {

        }
        else {
            io.sockets.in(socket.room_id).emit('user_out', socket.user_name + " 이 나갔습니다.!");
        }
        var values = querystring.stringify({
            user_id: socket.user_id,
            room_id: socket.room_id,
            type: 'USER_OUT'
        });

        var options = {
            host: 'localhost',
            port: 8000,
            path: '/chat_comment',
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': values.length
            }
        };

        var req = http.get(options, function (res) {
            res.setEncoding('utf8');
            logger.info(res.statusCode);
            res.on('data', function (message) {
                //logger.info('Message: ' + message);
            });
        });
        req.write(values);
        logger.info('send to django data : ' + values);
        req.end();
        delete users[socket.user_id];
    });

    socket.on("disconnected_check", function (data) {
        logger.info(data);
    });

    socket.on('send_message', function (message) {
        parse_message = JSON.parse(message);

        logger.info("message in message = " + parse_message.message);

        var chat_message = (parse_message.user_name + ": " + parse_message.message);

        logger.info(parse_message.user_name + ': [' + parse_message.message + '] from client message');

        var chat_message_to_client = JSON.stringify({
            "user_name": parse_message.user_name,
            "message": parse_message.message
        });
        io.sockets.in(parse_message.room_name).emit('message', chat_message_to_client);

        var clients = io.sockets.clients(parse_message.room_name);
        var duplication = 0;
        for (var i = 0; i < clients.length; i++) {
            if (socket.user_name == clients[i].user_name) {
                duplication++;
            }
            logger.info("access client = " + clients[i].user_name);
        }
        duplication = duplication - 1;
        logger.info("participants:" + clients[0].id); // todo(baek) 카운트를 기반으로 방의 참가자수가 소켓에 연결되어 있지 않으면 노티피케이션 검사해서 노티하게
        logger.info("user id:" + socket.user_id);
        logger.info("room info participant count:" + socket.participant_count);
        var noti_type = "";

        if((clients.length - duplication) == socket.participant_count) {
            noti_type = "NO_CHECK_NOTI"
        }
        else {
            noti_type = "CHECK_NOTI"
        }
        //send message to django fo chat_comment db
        var chat_data_to_server = querystring.stringify({
            comment: parse_message.message,
            user_id: parse_message.user_id,
            room_id: parse_message.room_name,
            type: noti_type
        });

        //var dataString = JSON.stringify(data);

        var options = {
            host: 'localhost',
            port: 8000,
            path: '/chat_comment',
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': chat_data_to_server.length
            }
        };

        var req = http.get(options, function(res) {
            res.setEncoding('utf-8');
            var responseString = '';

            res.on('data', function(data) {
                responseString += data;
            });

            res.on('end', function() {
                logger.info(responseString);
            });
        });

        req.on('error', function(e) {
            logger.info(e);
        });

        req.write(chat_data_to_server);
        logger.info('send to django data : ' + chat_data_to_server);
        req.end();
    });
});

/*color and func for log
 syslogConfig.levels = {
 debug: 0,
 info: 1,
 notice: 2,
 warning: 3,
 error: 4,
 crit: 5,
 alert: 6,
 emerg: 7
 };
 syslogConfig.colors = {
 debug: 'blue',
 info: 'green',
 notice: 'yellow',
 warning: 'red',
 error: 'red',
 crit: 'red',
 alert: 'yellow',
 emerg: 'red'
 };*/