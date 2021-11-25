const mysql = require('mysql');
const validator = require('validator');
const MySqlEvents = require('@rodrigogs/mysql-events');
const conf = require('../conf.json');
const RaffleWinnersDTO = require('../models/RaffleWinnersDTO');
const RaffleDTO = require('../models/RaffleDTO');
const UserDTO = require('../models/UserDTO');

class MySQlController {
    static HOST = conf.mysql.host;
    static DATABASE = conf.mysql.database;

    static ROOT_USER = conf.mysql.root_user;
    static ROOT_PASSWORD = conf.mysql.root_password;

    static USER = conf.mysql.user;
    static PASSWORD = conf.mysql.password;

    eventListener;
    connection;
    validationHandler

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

        this.validationHandler = new ValidationHandler();
    }
    tableInsertTrigger(name, onEventFunction) {
        return {
            name: `TRIGGER_ON_${name.toUpperCase()}_TABLE_INSERT`,
            expression: `${this.DATABASE}.${name}`,
            statement: MySqlEvents.STATEMENTS.INSERT,
            onEvent: (event) => {
                console.log('INSERT event triggered ON table', name.toUpperCase());
                onEventFunction();
            }
        }
    }
    static build() {
        return new MySQlController(
            this.HOST,
            this.DATABASE,
            this.ROOT_USER,
            this.ROOT_PASSWORD,
            this.USER,
            this.PASSWORD);
    }

    static formatToMySqlDate(date) {
        return new Date(date).toJSON().slice(0, 19).replace('T', ' ');
    }
    // TODO make enother prop functions => mysql.functions.userAttendRaffle
    queries = {

        userAttendRaffle: (data) => {
            var dateNow = MySQlController.formatToMySqlDate(new Date());
            // Validate user input
            // TODO change user to username
            this.validationHandler.reset();
            var isNumValid = validator.isInt(data.userSelectedNumber + '', { min: 1, max: 30 }) && data.userSelectedNumber !== '';
            var nameValid = validator.isAscii(data.user + '') && validator.isByteLength(data.user + '', { max: 50 }) && data.user !== '';
            this.validationHandler.addValidation('isNumValid', isNumValid, 'Selected number should be whole number, between 1️ - 30');
            this.validationHandler.addValidation('nameValid', nameValid, 'Name should be ASCII encoded, with max length 50 characters');
            if (!this.validationHandler.isValid()) return this.validationHandler;
            // Save it to db
            // TODO when there is no raffles at the start when scraper didn't INSERTED anything there is an error on procedure raffle id can't be null.
            // TODO also check how the user will raffle if scraper suddenly stops working.
            let sql = `CALL user_attend_raffle_in_progress('${data.user}', ${data.userSelectedNumber}, '${dateNow}');`;
            this.connection.query(sql, function (err) {
                if (err?.errno === 1062) this.validationHandler.addValidation('duplicated_raffle', false, 'You already raffled this turn, hold down your 🐴🐴🐴');
            });
        },

        getScore: async () => {
            var raffleScores = [];
            const numOfRaffles = 5;
            const raffles = await this.queries.getlastRaffles(numOfRaffles);
            for (const raffle of raffles) {
                const winingUsers = await this.queries.getWinnersForRaffle(raffle);
                raffleScores.push(new RaffleWinnersDTO(raffle, winingUsers));
            }
            return raffleScores;
        },

        getlastRaffles: async (count) => {
            var raffles = [];
            var sql = `SELECT * FROM raffle rf order by rf.created_at desc limit ${count};`;
            return new Promise((resolve, reject) => {
                this.connection.query(sql, function (err, result) {
                    if (err) return reject(err);
                    result.forEach(raffleRaw => {
                        raffles.push(RaffleDTO.from(raffleRaw))
                    });
                    return resolve(raffles);
                });
            });
        },

        getWinnersForRaffle: async (raffle) => {
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
                this.connection.query(winningUsersSql, function (err, results) {
                    if (err) reject(err);
                    results?.forEach(user => {
                        users.push(UserDTO.from(user))
                    });
                    return resolve(users);
                });
            });
        }
    }
}

class ValidationHandler {
    validations = [];

    addValidation(name, isValid, message) {
        this.validations.push({ name, isValid, message });
    }

    reset() {
        this.validations = [];
    }

    isValid() {
        for (let i = 0; i < this.validations.length; i++)
            if (!this.validations[i].isValid) return false;
        return true;
    }
}

module.exports = MySQlController