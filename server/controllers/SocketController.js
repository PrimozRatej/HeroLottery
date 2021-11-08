const io = require('socket.io')(http, {
    cors: { origin: "*" }
});

class SocketController {

    start = (name, onEvent) => io.on('connection', (socket) => {
        console.log('a user connected');
        socket.on('bet', (name, number) => {
            console.log(name);
            var date = new Date().toJSON().slice(0, 19).replace('T', ' ');
            let sql = `CALL user_attend_raffle_in_progress('${name}', ${number}, '${new Date().toJSON().slice(0, 19).replace('T', ' ')}');`;
            mysql.connection.query(sql, function (err, result, fields) {
                if (err) throw err;
            });
        });
    });
    
    emitServerDate = setInterval(function () {
        io.emit('datetime', new Date());
    }, 1000);
    
    io.on('connection', handleFirstConnection);
    
    function handleFirstConnection(socket) {
        emitScoreData(socket);
    }
    
    async function emitScoreData(socket) {
        try {
            const raffles = await getlastRaffles(5);
            var raffleResult = [];
            for (const raffle of raffles) {
                const winingUsers = await getWinnersForRaffle(raffle);
                raffleResult.push(new RaffleWinnersDTO(raffle, winingUsers));
            }
            if(socket !== undefined) io.to(socket.id).emit('raffle_score', raffleResult)
            else io.emit('raffle_score', raffleResult);
        } catch (error) {
            console.log(error)
        }
    }
}
module.exports = MySQlController


