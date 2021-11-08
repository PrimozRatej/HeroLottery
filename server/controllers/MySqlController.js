const mysql = require('mysql');
const MySqlEvents = require('@rodrigogs/mysql-events');

class MySQlController {
    static HOST = 'localhost';
    static DATABASE = 'lottery_db';

    static ROOT_USER = 'root';
    static ROOT_PASSWORD = '07101971';

    static USER = 'admin';
    static PASSWORD = 'admin123';

    eventListener;
    eventListenerProps;
    connection;

    constructor(host, database, root_user, root_password, user, password) {
        this.HOST = host;
        this.DATABASE = database;
        this.ROOT_USER = root_user;
        this.ROOT_PASSWORD = root_password;
        this.USER = user;
        this.PASSWORD = password;

        this.eventListener = new MySqlEvents({
            host: this.HOST,
            user: this.ROOT_USER,
            password: this.ROOT_PASSWORD,
            database: this.DATABASE
        }, {
            startAtEnd: true,
        });

        this.connection = mysql.createConnection({
            host: this.HOST,
            user: this.USER,
            password: this.PASSWORD,
            database: this.DATABASE,
        });

        this.tableInsertTrigger = (name, onEvent) => {
            return {
                name: `TRIGGER_ON_${name.toUpperCase()}_TABLE_INSERT`,
                expression: `${this.DATABASE}.${name}`,
                statement: MySqlEvents.STATEMENTS.INSERT,
                onEvent: (event) => {
                    onEvent();
                }
            }
        }
    }
    static default() {
        return new MySQlController(
            this.HOST,
            this.DATABASE,
            this.ROOT_USER,
            this.ROOT_PASSWORD,
            this.USER,
            this.PASSWORD);
    }
}

module.exports = MySQlController