// Facade / Orchestrator cho tat ca cac database adapters
// Them DB moi: tao adapter moi trong ./adapters/ va export o day

const firebaseAdapter = require('./adapters/firebase.adapter');

module.exports = {
    firebase: firebaseAdapter,
    // postgres: postgresAdapter,   // <-- them vao khi can
};