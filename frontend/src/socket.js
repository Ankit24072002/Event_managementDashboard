import { io } from "socket.io-client";

const socketBase = process.env.REACT_APP_API_URL
  ? process.env.REACT_APP_API_URL.replace(/\/api\/?$/, "")
  : "http://localhost:5000";

const socket = io(socketBase);
export default socket;
