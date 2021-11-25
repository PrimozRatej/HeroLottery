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
            dto = RaffleDTO.fromJson(response.data);
            var sql = "INSERT INTO raffle (lottery_number, created_at) VALUES ('" + dto.lotteryNumber + "', '" + dto.createdAt + "')";
            connection.query(sql, function (err, result) {
                // duplicated raffle
                if (err?.errno === 1062) { return; }
                else if (err) throw Error(err);
                else console.log('\u001b[1;32m CREATED \u001b[0m', dto);
            });
        })
        .catch((error) => {
            console.error(error)
        });
}, 1000);





