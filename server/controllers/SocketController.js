const http = require('http').createServer();
const io = require('socket.io')(http, {
    cors: { origin: "*" }
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

        http.listen(8080, () => console.log('listening on http://localhost:8080'));
    }

    onClientConnect = async (result) => {
        var self = this;
        io.sockets.on('connection', function (socket) {
            console.log(`Socket \u001b[1;33m ${socket.id} \u001b[0m \u001b[1;32m connected \u001b[0m`);
            self.emitScore(result, socket);
        });
    }

    onClientAttendRaffle = async (eventFunction) => {
        io.on('connection', function(socket) {     
            socket.on('bet', (arg) => {
                console.log(`Client \u001b[1;33m ${socket.id} \u001b[0m \u001b[1;32m connected \u001b[0m`);
                var validator = eventFunction(arg);
                io.emit('validation', validator);
            });
        });
    }
}


module.exports = SocketController