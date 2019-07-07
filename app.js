const express = require('express');
const app = express();
const niya = require('./routes/niya');

const server = require('http').Server(app);

const socketIO = require('socket.io');
const io = require('socket.io').listen(server);

app.set('socketio', io);

app.use('/niya', niya(io));

app.use(express.static(__dirname + '/client'));
app.engine('html', require('ejs').renderFile);
app.set('views', __dirname + '/client');
app.set('view engine', 'html');

// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

const serverNew = server.listen(3000, function () {
    const host = serverNew.address().address;
    const port = serverNew.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});
