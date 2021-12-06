const http = require('http').createServer();
const io = require('socket.io')(http, {
    cors: { origin: "*" },
    path: '/mysocket'
});

class SocketController {

    static build() {
        return new SocketController();
    }

    emitScore = (data, socket) => {
        try {
            if (socket !== undefined) io.to(socket.id).emit('score', data)
            else io.emit('score', data);
        } catch (error) {
            console.log(error)
        }
    }

    start = async () => {

        setInterval(() => {
            io.emit('datetime', new Date());
        }, 1000);

        http.listen(3001,() => console.log('listening on http://server:3001'));
    }

    onClientConnect = async (dataFun) => {
        var data = await dataFun();
        var self = this;
        io.sockets.on('connection', function (socket) {
            console.log(`Socket \u001b[1;33m ${socket.id} \u001b[0m \u001b[1;32m connected \u001b[0m`);
            self.emitScore(data, socket);
        });
    }

    onClientAttendRaffle = async (eventFunction) => {
        io.on('connection', function (socket) {
            socket.on('bet', (arg) => {
                console.log(`Client \u001b[1;33m ${socket.id} \u001b[0m \u001b[1;32m connected \u001b[0m`);
                eventFunction(arg, (validator) => {
                    io.emit('validation', !validator.isValid() ? validator : null);
                });
            });
        });
    }
}


module.exports = SocketController