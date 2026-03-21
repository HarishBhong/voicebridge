import io from "socket.io-client";

export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:3000";
export const API_URL =
	import.meta.env.VITE_API_URL ||
	(SOCKET_URL.startsWith("ws://")
		? SOCKET_URL.replace("ws://", "http://")
		: SOCKET_URL.startsWith("wss://")
			? SOCKET_URL.replace("wss://", "https://")
			: SOCKET_URL);
export const socket = io(SOCKET_URL);
