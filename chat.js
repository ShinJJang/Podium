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

var http = require('http');
var server = http.createServer().listen(4000);
var io = require('socket.io').listen(server);
var cookie_reader = require('cookie');
var querystring = require('querystring');
var winston = require('winston');
winston.setLevels(winston.config.syslog.levels);
var logger = new (winston.Logger)({
    transports: [
        // Console transport 추가
        new (winston.transports.Console)({
             colorize: 'true'
        }),
        // File transport 추가
        new (winston.transports.File)({
           // filename property 지정
            filename: 'tmp/node_chat_file.log',
            timestamp: 'true',
            colorize: 'true'
        })
    ],
    exceptionHandlers: [
        new winston.transports.File({
            filename: 'tmp/node_chat_exceptions.log'
        })
    ]
});
logger.setLevels(winston.config.syslog.levels);
logger.setLevels(winston.config.syslog.colors);

//var redis = require('socket.io/node_modules/redis');
//var sub = redis.createClient();
//Subscribe to the Redis chat channel
//Configure socket.io to store cookie set by Django

io.configure(function () {
    io.set('authorization', function (data, accept) {
        if (data.headers.cookie) {
            data.cookie = cookie_reader.parse(data.headers.cookie);
            return accept(null, true);
        }
        logger.error('socket connect error data= ' + data);
        return accept('error', false);
    });
});

io.sockets.on('connection', function (socket) {
    socket.on('join', function (data) {
        if(data.user_id != null) {
            socket.join(data.room_name);
            socket.set(data.user_id, data.room_name);
            logger.info('chat room ' + data.room_name);
            logger.info(io.sockets.in(data.room_name));
        }
    });//this function is for socket room*/

    //Client is sending message through socket.io
    socket.on('send_message', function (message) {
        //send message to client
        var data = (message.username + ": " + message.message);
        socket.get(message.room_name, function (error, room) {
            logger.info(message.username + ': ' + message.message + 'send to node server');
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
        logger.info('send to django data = ' + values);
        req.end();
    });
});