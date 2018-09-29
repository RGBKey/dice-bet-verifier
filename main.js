const router = new VueRouter();

let app = new Vue({
    router,
    el: '#app',
    data: {
        MAX_ROLL: 999999,
        SATOSHIS: 100000000,
        serverSeed: '',
        serverSeedHash: '',
        clientSeed: '',
        nonce: 0
    },
    created: function() {
        this.serverSeed = this.$route.query.server_seed || '';
        this.serverSeedHash = this.$route.query.server_seed_hash || '';
        this.clientSeed = this.$route.query.client_seed || '';
        this.nonce = this.$route.query.nonce || 1;
    },
    methods: {
        hmacsha512: function(K, n) {
            let hash = forge.hmac.create();
            hash.start('sha512', K);
            hash.update(n);
            return hash.digest().toHex();
        },
        sha512: function(K) {
            let md = forge.md.sha512.create();
            md.update(K);
            return md.digest().toHex();
        },
        hash: function() {
            return this.hmacsha512(`${this.nonce}:${this.serverSeed}:${this.nonce}`, `${this.nonce}:${this.clientSeed}:${this.nonce}`);
        },
        hashToRoll: function(hash) {
            for(let i = 0; i < 25; i++) {
                let chunk = hash.substr(i * 5, 5);
                let roll = parseInt(chunk, 16);
                if(roll <= this.MAX_ROLL) {
                    return {
                        roll: roll,
                        index: i * 5,
                        chunk: chunk
                    };
                }
            }
            return {
                roll: parseInt(hash.substr(125, 3), 16),
                index: 125,
                chunk: hash.substr(125, 3)
            };
        },
        htmlTemplateHash: function() {
            let hash = this.hash();
            let index = this.hashToRoll(hash).index;
            let length = index < 125 ? 5 : 3;
            // Please take note of the use of both substring and substr below
            return `${hash.substring(0, index)}<strong>${hash.substr(index, length)}</strong>${hash.substring(index+length, 128)}`;
        }
    }
});
