const EventEmitter = require('events');
const BaseEventBus = require('./base-event-bus');

/**
 * InMemoryEventBus — Implementation dung Node.js EventEmitter.
 * Giao tiep dong bo (synchronous) trong cung mot process.
 * Phu hop cho Modular Monolith giai doan dau.
 *
 * De nang cap sang BullMQ hay RabbitMQ sau nay:
 *   → Tao BullMQEventBus extends BaseEventBus
 *   → Doi 1 dong trong server.js
 *   → Cac module khong can thay doi gi
 */
class InMemoryEventBus extends BaseEventBus {
    constructor() {
        super();
        this._emitter = new EventEmitter();
        this._emitter.setMaxListeners(100); // tranh warning khi nhieu module subscribe
    }

    /**
     * Phat event — tat ca subscriber se nhan duoc NGAY LAP TUC (synchronous)
     * @param {string} eventName - Vi du: 'user.created', 'course.updated'
     * @param {Object} payload   - Du lieu kem theo event
     */
    publish(eventName, payload) {
        this._emitter.emit(eventName, payload);
    }

    /**
     * Dang ky lang nghe event
     * @param {string}   eventName
     * @param {Function} handler   - Nhan vao payload
     */
    subscribe(eventName, handler) {
        this._emitter.on(eventName, handler);
    }

    /**
     * Huy lang nghe event (quan trong de tranh memory leak)
     * @param {string}   eventName
     * @param {Function} handler   - Phai la cung mot function reference voi luc subscribe
     */
    unsubscribe(eventName, handler) {
        this._emitter.off(eventName, handler);
    }
}

// Singleton — toan bo app dung chung 1 event bus
module.exports = new InMemoryEventBus();