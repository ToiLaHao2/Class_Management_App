// Facade / Orchestrator cho tat ca cac database adapters
// Them DB moi: tao adapter moi trong ./adapters/ va export o day

const firebaseAdapter = require('./adapters/firebase.adapter');
const BaseFirebaseRepository = require('./repositories/base-firebase.repository');

module.exports = {
    firebase: firebaseAdapter,
    BaseFirebaseRepository
    // postgres: postgresAdapter,   // <-- them vao khi can
};