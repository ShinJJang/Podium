var http = require('http');
var server = http.createServer().listen(4000);
var io = require('socket.io').listen(server);
var cookie_reader = require('cookie');
var querystring = require('querystring');
var winston = require('winston');

//winston.setLevels(winston.config.syslog.levels);

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

io.sockets.on('connection', function (socket) { //socket.user_id는 유저id와 방 이름을 합쳐 유니크하게 만듬
    logger.info('client id = ' + socket.id);
    console.log(socket);
    socket.on('join', function (data) {
        logger.info(data);
        if (data.user_id != null) {
            socket.username = data.username;
            socket.user_id = data.user_id;
            logger.info('socket.username = ' + socket.username);
            //socket.room_name = data.room_name;
            users[socket.user_id] = {
                user_name: data.username,
                user_id: data.user_id,
                room_name : data.room_name
            };
            logger.info('username = ' + data.username + ' user_id = ' + data.user_id + ' room_name = ' + data.room_name);
            socket.join(data.room_name);
            socket.set(socket.user_id, data.room_name);
            logger.info('user in sockets :' + users);
        }
    });//this function is for socket room*/

    socket.on("disconnect", function () { //disconnect시 소켓연결을 해제시켜준다.
        logger.info(socket.username + 'out');
        io.sockets.in(users[socket.user_id].room_name).emit('user_out', socket.username + " 이 나갔습니다.!");

        logger.info("disconnect user id = " + users[socket.user_id].user_id);
        values = querystring.stringify({
            user_id: users[socket.user_id].user_id,
            room_name: users[socket.user_id].room_name,
            type: 'DELETE'
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
                if (message != 'Everything worked :)') {
                    logger.info('Message: ' + message);
                }
            });
        });
        req.write(values);
        logger.info('send to django data : ' + values);
        req.end();
        delete users[socket.user_id];
    });

    socket.on("disconnected_check", function (data) { //추후 구현
        logger.info(data);
    });

    socket.on('send_message', function (message) {
        var chat_message = (message.user_name + ": " + message.message);
        //socket.get(socket.user_id, function (error, room) {
        logger.info(message.user_name + ': [' + message.message + '] from client message');
        //socket.broadcast.to(message.room_name).emit('message', data); //자기를 제외한 방의 사람들에게 데이터 전송
        io.sockets.in(message.room_name).emit('message', chat_message);

        //send message to django fo chat_comment db
        var data = {
            comment: message.message,
            user_id: message.user_id,
            room_id: message.room_name
        };

        var dataString = JSON.stringify(data);


        var options = {
            host: 'localhost',
            port: 8000,
            path: '/api/v1/user_chat_message/',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': dataString.length
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

        req.write(dataString);
        logger.info('send to django data : ' + dataString);
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