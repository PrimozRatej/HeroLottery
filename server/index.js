const http = require('http').createServer();
const UserDTO = require('./models/UserDTO');
const RaffleWinnersDTO = require('./models/RaffleWinnersDTO');
const RaffleDTO = require('./models/RaffleDTO');
const MySQlController = require('./controllers/MySQlController');

const mysql = MySQlController.default();

// Wait for new raffle to pop in from scraper.
const program = async () => {
    await mysql.eventListener.start();
    mysql.eventListener.addTrigger(
        mysql.tableInsertTrigger('raffle', emitScoreData)
    );
};
program()
    .then(() => console.log('Waiting for database vents...'))
    .catch(console.error);



/* async function emitScoreData(socket) {
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
} */

const getlastRaffles = (count) => {
    return new Promise((resolve, reject) => {
        var sql = `SELECT * FROM lottery_db.raffle rf order by rf.created_at desc limit ${count};`;
        var raffles = [];
        mysql.connection.query(sql, function (err, result) {
            if (err) return reject(err);
            result.forEach(raffleRaw => {
                raffles.push(RaffleDTO.from(raffleRaw))
            });
            return resolve(raffles);
        });
    });
};

const getWinnersForRaffle = (raffle) => {
    return new Promise((resolve, reject) => {
        // get winning users for raffle
        var winningUsersSql =
            `SELECT usr.id, usr.name, ur.selected_at
                    FROM user usr
                    JOIN user_raffle ur ON usr.id=ur.user_id
                    JOIN raffle rf ON ur.raffle_id=rf.id
                    AND rf.id = ${raffle.id}
                    AND ur.selected_number = rf.lottery_number;`;

        var users = [];
        mysql.connection.query(winningUsersSql, function (err, results) {
            if (err) reject(err);
            results?.forEach(user => {
                users.push(UserDTO.from(user))
                console.log('User DTO Works');
            });
            return resolve(users);
        });
    });

};



/* 
const io = require('socket.io')(http, {
    cors: { origin: "*" }
});

io.on('connection', (socket) => {
    console.log('a user connected');
    socket.on('bet', (name, number) => {
        console.log(name);
        var date = new Date().toJSON().slice(0, 19).replace('T', ' ');
        let sql = `CALL user_attend_raffle_in_progress('${name}', ${number}, '${new Date().toJSON().slice(0, 19).replace('T', ' ')}');`;
        mysql.connection.query(sql, function (err, result, fields) {
            if (err) throw err;
        });
    });
}); */

/* setInterval(function () {
    io.emit('datetime', new Date());
}, 1000);

io.on('connection', handleFirstConnection);

function handleFirstConnection(socket) {
    emitScoreData(socket);
} */


http.listen(8080, () => console.log('listening on http://localhost:8080'));