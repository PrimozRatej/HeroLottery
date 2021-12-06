const MySQlController = require('./controllers/MySQlController');
const SocketController = require('./controllers/SocketController');
require('dotenv').config({ path: '../.env' });

const env = setEvn();

const socket = SocketController.build();
const mysql = MySQlController.build(env);

const program = async () => {

    socket.start();

    mysql.eventListener.start();

    socket.onClientConnect(mysql.queries.getScore);

    socket.onClientAttendRaffle(mysql.functions.userAttendRaffle);

    mysql.eventListener.addTrigger(
        mysql.tableUpdateTrigger('user_raffle', async function () {
            var score = await mysql.queries.getScore();
            socket.emitScore(score);
        })
    );

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

function setEvn() {
    return {
        MYSQL_ROOT_USERNAME: process.env.MYSQL_ROOT_USERNAME,
        MYSQL_ROOT_PASSWORD: process.env.MYSQL_ROOT_PASSWORD,
        MYSQL_ADMIN_USERNAME: process.env.MYSQL_ADMIN_USERNAME,
        MYSQL_ADMIN_PASSWORD: process.env.MYSQL_ADMIN_PASSWORD,
        MYSQL_DATABASE: process.env.MYSQL_DATABASE,
        MYSQL_HOST: process.env.MYSQL_HOST,
        MYSQL_LOCAL_PORT: process.env.MYSQL_LOCAL_PORT,
        MYSQL_PORT: process.env.MYSQL_PORT,
        NODEJS_LOCAL_PORT: process.env.NODEJS_LOCAL_PORT
    }
}