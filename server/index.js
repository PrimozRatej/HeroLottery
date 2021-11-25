const { error } = require('console');
const MySQlController = require('./controllers/MySQlController');
const SocketController = require('./controllers/SocketController');

const http = require('http').createServer();
const io = require('socket.io')(http, {
    cors: { origin: "*" }
});

const socket = SocketController.build();
const mysql = MySQlController.build();

const program = async () => {

    socket.start();

    mysql.eventListener.start();

    socket.onClientConnect(data = await mysql.queries.getScore());

    socket.onClientAttendRaffle(mysql.queries.userAttendRaffle);

    mysql.eventListener.addTrigger(
        mysql.tableInsertTrigger('raffle', async function () {
            var score = await mysql.queries.getScore();
            socket.emitScore(score);
        })
    );
};
program()
    .then(() => console.log('\u001b[' + 32 + 'm' + 'Process started...' + '\u001b[0m'))
    .catch(() => {
        console.log(error);
    });