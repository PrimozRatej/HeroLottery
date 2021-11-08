var mysql = require('mysql');
var get = require('axios');

host = 'localhost';
user = 'admin';
password = 'admin123';
database = 'lottery_db';

class RaffleDTO {
    lotteryNumber;
    createdAt;
    constructor(lotteryNumber, createdAt) {
        this.lotteryNumber = lotteryNumber;
        this.createdAt = createdAt;
    }

    static fromJson(json) {
        return Object.assign(new RaffleDTO(), json);
    }
}

var connection = mysql.createConnection({
    host: host,
    user: user,
    password: password,
    database: database
});

setInterval(() => {
    get('https://celtra-lottery.herokuapp.com/api/getLotteryNumber')
        .then((response) => {
            console.log(response.data);
            dto = RaffleDTO.fromJson(response.data);
            createRaffle = () => {
                var sql = "INSERT INTO raffle (lottery_number, created_at) VALUES ('" + dto.lotteryNumber + "', '" + dto.createdAt + "')";
                console.time("dbsave");
                connection.query(sql, function (err, result) {
                    // duplicated raffle
                    if (err?.errno === 1062) { return; }
                    else if (err) throw Error(err);
                });
            };
            console.timeEnd("dbsave");
        })
        .catch((error) => {
            console.error(error)
        });
}, 1000);





