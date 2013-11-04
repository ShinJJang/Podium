var http = require('http');
var server = http.createServer().listen(4000);
var io = require('socket.io').listen(server);
var cookie_reader = require('cookie');
var querystring = require('querystring');
var winston = require('winston');

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
        if (data.user_id != null) {
            socket.username = data.username;
            socket.user_id = data.user_id;
            socket.room_id = data.room_name;
            socket.participant_count = data.participant_count;
            logger.info('socket.username = ' + socket.username);
            //socket.room_name = data.room_name;
            users[socket.user_id] = {
                user_name: data.username,
                user_id: data.user_id,
                room_name : data.room_name
            };
            logger.info('username = ' + data.username + ' user_id = ' + data.user_id + ' room_name = ' + data.room_name);
            socket.join(data.room_name);
            logger.info("socket join to :" + data.room_name);
            //socket.set(socket.user_id, data.room_name);
            logger.info('user in sockets :' + users);
        }
    });//this function is for socket room*/

    socket.on("disconnect", function () { //  todo(baek) disconnect시 소켓연결을 해제시켜준다.
        logger.info(socket.username + 'out');
        logger.info(socket.room_name);
        io.sockets.in(socket.room_name).emit('user_out', socket.username + " 이 나갔습니다.!");
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

        logger.info("participants:" + clients[0].id); // todo(baek) 카운트를 기반으로 방의 참가자수가 소켓에 연결되어 있지 않으면 노티피케이션 검사해서 노티하게
        logger.info("user id:" + socket.user_id);
        logger.info("room info participant count:" + socket.participant_count);
        var noti_type = "";

        if(clients.length == socket.participant_count) {
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