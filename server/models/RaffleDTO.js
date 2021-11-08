class RaffleDTO {
    id;
    lottery_number;
    created_at;
    constructor(id, lottery_number, created_at) {
        this.id = id;
        this.lottery_number = lottery_number;
        this.created_at = created_at;
    }

    static from(data) {
        return Object.assign(new RaffleDTO(), data);
    }
}
module.exports = RaffleDTO