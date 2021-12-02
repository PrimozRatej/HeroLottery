const mysql = require('mysql');
const validator = require('validator');
const MySqlEvents = require('@rodrigogs/mysql-events');

const RaffleWinnersDTO = require('../models/RaffleWinnersDTO');
const RaffleDTO = require('../models/RaffleDTO');
const UserDTO = require('../models/UserDTO');

class MySQlController {
    HOST;
    DATABASE;

    ROOT_USER;
    ROOT_PASSWORD;

    USER;
    PASSWORD;

    eventListener;
    connection;
    validationHandler;

    constructor(host, database, root_user, root_password, user, password) {
        this.HOST = host;
        this.DATABASE = database;
        this.ROOT_USER = root_user;
        this.ROOT_PASSWORD = root_password;
        this.USER = user;
        this.PASSWORD = password;

        this.connection = mysql.createConnection({
            host: this.HOST,
            user: this.USER,
            password: this.PASSWORD,
            database: this.DATABASE,
        });

        this.eventListener = new MySqlEvents({
            host: this.HOST,
            user: this.ROOT_USER,
            password: this.ROOT_PASSWORD,
            database: this.DATABASE
        }, {
            startAtEnd: true,
        });

        this.validationHandler = new ValidationHandler();
    }

    static build(env) {
        return new MySQlController(
            env.MYSQL_HOST,
            env.MYSQL_DATABASE,
            env.MYSQL_ROOT_USERNAME,
            env.MYSQL_ROOT_PASSWORD,
            env.MYSQL_ADMIN_USERNAME,
            env.MYSQL_ADMIN_PASSWORD);
    }

    tableUpdateTrigger(name, onEventFunction) {
        return {
            name: `TRIGGER_ON_${name.toUpperCase()}_TABLE_UPDATE`,
            expression: `${this.DATABASE}.${name}`,
            statement: MySqlEvents.STATEMENTS.UPDATE,
            onEvent: (event) => {
                console.log('UPDATE event triggered ON table', name.toUpperCase());
                onEventFunction();
            }
        }
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

    functions = {
        userAttendRaffle: (data, callback) => {
            var dateNow = MySQlController.formatToMySqlDate(new Date());
            // Validate user input
            // TODO change user to username
            this.validationHandler.reset();
            var validationHandRef = this.validationHandler;
            if (data.user == '' && data.userSelectedNumber == '') {
                validationHandRef.addValidation('everythingNull', false, '🛑 You always <a href="https://en.wikipedia.org/wiki/Alzheimer%27s_disease">forget everything</a> dude? 🛑');
                callback(validationHandRef);
                return;
            }
            if (data.user == '') {
                validationHandRef.addValidation('isUserNotNull', false, 'Good sir 🧐, will you please be so good to tell me your name? 👀');
                callback(validationHandRef);
                return;
            }

            if (data.userSelectedNumber == '') {
                validationHandRef.addValidation('isSelectedNumberNotNull', false, 'You forgot somethig what that may be 🤔.... oooo a NUMBER!');
                callback(validationHandRef);
                return;
            }
            var isNumValid = validator.isInt(data.userSelectedNumber + '', { min: 1, max: 30 }) && data.userSelectedNumber !== '';
            var nameASCIIValid = validator.isAscii(data.user + '') && validator.isByteLength(data.user + '', { max: 50 }) && data.user !== '';
            var nameOnlyENGLetters = /[^A-Za-z0-9]+/.test(data.user);
            validationHandRef.addValidation('isNumValid', isNumValid, 'Selected number should be whole number, between 1️ - 30.');
            validationHandRef.addValidation('nameASCIIValid', nameASCIIValid, 'Name should be ASCII encoded, with max length 50 characters.');
            validationHandRef.addValidation('nameOnlyENGLetters', nameOnlyENGLetters, 'Only ENG letters in name.');

            // TODO also check how the user will raffle if scraper suddenly stops working.
            let sql = `CALL user_attend_raffle_in_progress('${data.user}', ${data.userSelectedNumber}, '${dateNow}');`;
            validationHandRef.isValid() ?

                this.connection.query(sql, (err) => {
                    if (err?.sqlState == 45000) {
                        validationHandRef.addValidation('canUserBet', false, 'You already bet this turn, hold down your 🐴🐴🐴.');
                    }
                    callback(validationHandRef);
                }) :

                callback(validationHandRef);
        },
    }

    queries = {

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

    static formatToMySqlDate(date) {
        return new Date(date).toJSON().slice(0, 19).replace('T', ' ');
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