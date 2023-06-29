const axios = require('axios').default;

class Connection {
    constructor() { }
    getDictionary() {
        return {
            myIp: 'http://meuip.com/api/meuip.php',
            lastRelease: `https://api.github.com/repos/jvneto/objetivo-tv-os/releases/latest`,
        };
    }
    getLastRelease() {
        return new Promise((resolve, reject) => {
            axios
                .get(`${this.getDictionary()['lastRelease']}`)
                .then(function (response) {
                    resolve(response);
                })
                .catch(function (error) {
                    reject(error);
                });
        });
    }
}

export { Connection };
