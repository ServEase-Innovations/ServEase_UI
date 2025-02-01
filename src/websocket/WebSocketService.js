import { NotificationManager } from "react-notifications";

class WebSocketService {
    constructor() {
        this.socket = null;
    }

    connect(url) {
        if (this.socket) {
            this.disconnect();
        }

        this.socket = new WebSocket(url);

        this.socket.onmessage = (event) => {
            console.log("Received WebSocket message:", event.data);
            NotificationManager.info(event.data, "Notification", 3000);
        };

        this.socket.onerror = (error) => {
            console.error("WebSocket error:", error);
        };
    }

    sendMessage(message) {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(message);
        } else {
            console.error("WebSocket is not connected");
        }
    }

    disconnect() {
        if (this.socket) {
            this.socket.close();
            this.socket = null;
        }
    }
}
export default new WebSocketService();















// class WebSocketService {
//     constructor() {
//         this.socket = null;
//         this.onMessageCallback = null;
//     }

//     connect(url) {
//         if (this.socket) {
//             this.disconnect();
//         }

//         this.socket = new WebSocket(url);

//         // this.socket.onopen = () => {
//             //console.log('WebSocket connected');
//         // };

//         this.socket.onmessage = (event) => {
//             console.log('Message from server:', event.data);
//             if (this.onMessageCallback) {
//                 this.onMessageCallback(event);
//             }
//         };

//         this.socket.onerror = (error) => {
//             console.error('WebSocket error:', error);
//         };

//         // this.socket.onclose = () => {
//             //console.log('WebSocket disconnected');
//             //setTimeout(() => this.connect(url), 5000); // Attempt to reconnect
//         // };
//     }

//     sendMessage(message) {
//         if (this.socket && this.socket.readyState === WebSocket.OPEN) {
//             this.socket.send(message);
//         } else {
//             console.error('WebSocket is not connected');
//         }
//     }

//     setOnMessage(callback) {
//         this.onMessageCallback = callback;
//     }

//     disconnect() {
//         if (this.socket) {
//             this.socket.close();
//             this.socket = null;
//         }
//     }
// }

// export default new WebSocketService();