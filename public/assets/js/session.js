
class session {

    async open(type = "temp", premium = 0) {

        return await fetch(`/api/session/create?type=${type}&premium=${premium}`).then(r => r.json());

    };

    async close() {
        return await fetch(`/api/session/close`).then(r => r.json());
    };

};

export default new session();