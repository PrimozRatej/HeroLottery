class UserDTO {
    id;
    name;
    constructor(id, name) {
        this.id = id;
        this.name = name;
    }

    static from(data) {
        return Object.assign(new UserDTO(), data);
    }
}
module.exports = UserDTO