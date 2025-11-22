import { io } from 'socket.io-client';
export const socket = io('https://yboardbackend.onrender.com', {
    transports: ['websocket'],
    withCredentials: true
});