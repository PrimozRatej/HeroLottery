class RaffleWinnersDTO {
    raffle
    users;
    constructor(raffle, users) {
        this.raffle = raffle;
        this.users = users;
    }

    static from(data) {
        return Object.assign(new RaffleWinnersDTO(), data);
    }
}
module.exports = RaffleWinnersDTO
