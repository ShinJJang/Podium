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
        logger.error('socket connect error');
        return accept('error', false);
    });
    io.set('log level', 1);
});

var users = {};
io.sockets.on('connection', function (socket) {
    socket.on('join', function (data) {
        logger.info(data);
        if(data.user_id != null) {
            socket.username = data.username;
		    socket.userId = data.user_id;
            logger.info('socket.username = ' + socket.username);
            //socket.room_name = data.room_name;
		    users[socket.username] = {
			    userName : data.username,
			    userId : data.user_id
                //room_name : data.room_name
		    };
            logger.info('username = ' + data.username + ' userId = ' + data.user_id + ' room_name = ' + data.room_name);
            socket.join(data.room_name);
            socket.set(data.user_id, data.room_name);
        }
    });//this function is for socket room*/

    socket.on("disconnect", function() {
		logger.info(socket.username + 'out');
        socket.get(socket.room_name, function (error, room) {
            //logger.info(message.username + ': ' + message.message + 'send to node server');
            io.sockets.in(socket.room_name).emit('user_out', socket.username + " 이 나갔습니다.!");
        });
        delete users[socket.username];
    });
    socket.on('send_message', function (message) {
        //send message to client
        var data = (message.user_name + ": " + message.message);
        socket.get(message.room_name, function (error, room) {
            logger.info(message.user_name + ': ' + message.message + 'from client message');
            io.sockets.in(message.room_name).emit('message', data);
        });
        //send message to django fo chat_comment db
        values = querystring.stringify({
            comment: message.message,
            user_id: message.user_id,
            room_name: message.room_name
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
            res.on('data', function (message) {
                if (message != 'Everything worked :)') {
                    console.log('Message: ' + message);
                }
            });
        });
        req.write(values);
        logger.info('send to django data : ' + values);
        req.end();
    });
});

//color and func for log
/*var syslogConfig = exports;
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