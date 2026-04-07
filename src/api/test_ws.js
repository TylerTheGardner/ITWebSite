const WebSocket = require("ws");
const ws = new WebSocket("ws://127.0.0.1:18789/v1/chat/post", undefined, {
  headers: { Authorization: "Bearer 400cdf5eee1ab60c79563908d78df0534ad8bea10a0d4db6" }
});
ws.on("open", () => {
  console.log("WS connected!");
  ws.send(JSON.stringify({ id: "test1", type: "message", agentId: "gold-country-it-chat", sessionKey: "web:test", message: "Hi" }));
  setTimeout(() => ws.close(), 10000);
});
ws.on("message", (data) => {
  console.log("MSG:", data.toString().substring(0, 300));
});
ws.on("error", (err) => console.error("ERR:", err.message));
ws.on("close", () => { console.log("Closed"); process.exit(0); });
