import { io } from 'socket.io-client';

export const initSocket = async () => {
  const options = {
    forceNew: true,
    transports: ['websocket'],
    reconnectionAttempts: Infinity,
    timeout: 10000,
  };

  return io("http://localhost:4000/", options);
  // https://realtime-code-collaboration-app-production.up.railway.app/
};
