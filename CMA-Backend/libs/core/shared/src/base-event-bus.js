/**
 * BaseEventBus — Abstract contract cho tat ca EventBus implementations.
 * Tuong tu BaseAdapter cua database.
 */
class BaseEventBus {
    constructor() {
        if (new.target === BaseEventBus) {
            throw new Error('BaseEventBus is abstract and cannot be instantiated directly.');
        }
    }

    /** Phat event den tat ca subscriber dang lang nghe */
    publish(eventName, payload) {
        throw new Error(`${this.constructor.name} must implement publish()`);
    }

    /** Dang ky lang nghe mot event */
    subscribe(eventName, handler) {
        throw new Error(`${this.constructor.name} must implement subscribe()`);
    }

    /** Huy lang nghe mot event */
    unsubscribe(eventName, handler) {
        throw new Error(`${this.constructor.name} must implement unsubscribe()`);
    }
}

module.exports = BaseEventBus;