import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

class SocketService {
    constructor() {
        this.socket = null;
        this.listeners = new Map();
    }

    connect(userId) {
        if (this.socket?.connected) {
            return;
        }

        this.socket = io(SOCKET_URL, {
            transports: ['websocket'],
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionAttempts: 5
        });

        this.socket.on('connect', () => {
            console.log('✅ Socket connected');
            if (userId) {
                this.socket.emit('join', userId);
            }
        });

        this.socket.on('disconnect', () => {
            console.log('❌ Socket disconnected');
        });

        this.socket.on('connect_error', (error) => {
            console.error('Socket connection error:', error);
        });
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }

    on(event, callback) {
        if (!this.socket) {
            console.warn('Socket not connected');
            return;
        }

        this.socket.on(event, callback);

        // Store listener for cleanup
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(callback);
    }

    off(event, callback) {
        if (!this.socket) return;

        if (callback) {
            this.socket.off(event, callback);

            // Remove from listeners
            const eventListeners = this.listeners.get(event);
            if (eventListeners) {
                const index = eventListeners.indexOf(callback);
                if (index > -1) {
                    eventListeners.splice(index, 1);
                }
            }
        } else {
            this.socket.off(event);
            this.listeners.delete(event);
        }
    }

    emit(event, data) {
        if (!this.socket) {
            console.warn('Socket not connected');
            return;
        }

        this.socket.emit(event, data);
    }

    removeAllListeners() {
        if (!this.socket) return;

        this.listeners.forEach((callbacks, event) => {
            this.socket.off(event);
        });

        this.listeners.clear();
    }
}

export default new SocketService();
