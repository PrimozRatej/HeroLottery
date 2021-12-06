require('dotenv').config({path:'../.env'});
var mysql = require('mysql');
var get = require('axios');

host = process.env.MYSQL_HOST;
user = process.env.MYSQL_ADMIN_USERNAME;
password = process.env.MYSQL_ADMIN_PASSWORD;
database = process.env.MYSQL_DATABASE;
port = process.env.MYSQL_DOCKER_PORT;;

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
    database: database,
    port: port
});

setInterval(() => {
    get('https://celtra-lottery.herokuapp.com/api/getLotteryNumber')
        .then((response) => {
            dto = RaffleDTO.fromJson(response.data);
            var insertRafflesql = "INSERT INTO raffle (lottery_number, created_at) VALUES ('" + dto.lotteryNumber + "', '" + dto.createdAt + "')";
            connection.query(insertRafflesql, function (err, result) {
                // duplicated raffle
                if (err?.errno === 1062) { return; }
                else if (err) throw Error(err);
                else {
                    connection.query(`SELECT id FROM raffle WHERE created_at = \"${dto.createdAt}\";`, function (err, result) {
                        if (err) throw err;
                        var setUsersToRaffleSql = `UPDATE user_raffle SET raffle_id = ${result[0].id} WHERE raffle_id IS NULL;`;
                        connection.query(setUsersToRaffleSql, function (err, result) {
                            // duplicated raffle
                            if (err?.errno === 1062) { return; }
                            else if (err) throw Error(err);
                            else console.log('\u001b[1;32m CREATED \u001b[0m', dto);
                        });
                    });
                    console.log('\u001b[1;32m CREATED \u001b[0m', dto);
                }
            });
        })
        .catch((error) => {
            console.error(error)
        });
}, 1000);





