/**
 * BaseAdapter — Abstract base class cho tat ca cac database adapters.
 * Moi adapter cu the (Firebase, Postgres, ...) phai extends class nay
 * va override cac method duoi day.
 */
class BaseAdapter {
    constructor() {
        if (new.target === BaseAdapter) {
            throw new Error('BaseAdapter is abstract and cannot be instantiated directly.');
        }
        this._connected = false;
    }

    /**
     * Khoi tao ket noi den database.
     * @returns {Object} connection instance
     */
    connect() {
        throw new Error(`${this.constructor.name} must implement connect()`);
    }

    /**
     * Tra ve database client / instance chinh.
     * @returns {*}
     */
    getDB() {
        throw new Error(`${this.constructor.name} must implement getDB()`);
    }

    /**
     * Dong ket noi (cleanup).
     */
    disconnect() {
        throw new Error(`${this.constructor.name} must implement disconnect()`);
    }

    /**
     * Kiem tra trang thai ket noi.
     * @returns {boolean}
     */
    isConnected() {
        return this._connected;
    }
}

module.exports = BaseAdapter;
