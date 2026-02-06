import { useState, useEffect, useRef } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import "./App.css";

const SOCKET_URL = "http://localhost:8080/ws";

function App() {
  // State
  const [client, setClient] = useState(null);
  const [connected, setConnected] = useState(false);
  const [username, setUsername] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const [roomId, setRoomId] = useState("");
  const [currentRoom, setCurrentRoom] = useState(null);

  const [onlineUsers, setOnlineUsers] = useState([]);
  const [roomUsers, setRoomUsers] = useState([]);
  const [events, setEvents] = useState([]);

  // Refs for subscriptions to unsubscribe later if needed (though we just disconnect on reload)
  const roomSubRef = useRef(null);

  // Initialize WebSocket Client
  useEffect(() => {
    if (isLoggedIn && !client) {
      const stompClient = new Client({
        webSocketFactory: () => new SockJS(SOCKET_URL),
        onConnect: () => {
          console.log("Connected to WebSocket");
          setConnected(true);

          // Subscribe to Global Online Users updates
          stompClient.subscribe("/topic/public", (message) => {
            const body = JSON.parse(message.body);
            if (body.type === "ONLINE_USERS") {
              setOnlineUsers(body.userList || []);
            }
          });

          // Send initial heartbeat/join to register existence globally (optional but good practice)
          stompClient.publish({
            destination: "/app/get-online-users",
            body: JSON.stringify({ sender: username, type: "ONLINE_USERS" }),
          });

          // Start Heartbeat Loop
          const heartbeatInterval = setInterval(() => {
            if (stompClient.connected) {
              stompClient.publish({
                destination: "/app/heartbeat",
                body: JSON.stringify({ sender: username, type: "PING" }),
              });
            }
          }, 10000); // 10 seconds

          // Cleanup interval on disconnect
          stompClient.onDisconnect = () => clearInterval(heartbeatInterval);
        },
        onDisconnect: () => {
          setConnected(false);
          console.log("Disconnected");
        },
        // Log STOMP frame details for debugging
        // debug: (str) => console.log(str),
      });

      stompClient.activate();
      setClient(stompClient);
    }
  }, [isLoggedIn, username, client]);

  // Handle Join Room
  const joinRoom = () => {
    if (!roomId || !client || !connected) return;

    // Unsubscribe from previous room if any
    if (roomSubRef.current) {
      roomSubRef.current.unsubscribe();
    }

    // Subscribe to new room
    const sub = client.subscribe(`/topic/room/${roomId}`, (message) => {
      const body = JSON.parse(message.body);
      handleRoomMessage(body);
    });
    roomSubRef.current = sub;

    // Send Join Message
    client.publish({
      destination: "/app/join",
      body: JSON.stringify({
        sender: username,
        roomId: roomId,
        type: "JOIN",
      }),
    });

    setCurrentRoom(roomId);
    setEvents([]); // clear previous room events
  };

  // Handle Leave Room
  const leaveRoom = () => {
    if (!currentRoom || !client) return;

    client.publish({
      destination: "/app/leave",
      body: JSON.stringify({
        sender: username,
        roomId: currentRoom,
        type: "LEAVE",
      }),
    });

    if (roomSubRef.current) {
      roomSubRef.current.unsubscribe();
      roomSubRef.current = null;
    }

    setCurrentRoom(null);
    setRoomUsers([]);
  };

  const handleRoomMessage = (msg) => {
    // Add to events log if it's an event
    if (["JOIN", "LEAVE", "SYSTEM"].includes(msg.type)) {
      setEvents((prev) => [...prev, msg]);
    }

    // Update room presence list
    if (msg.type === "ROOM_PRESENCE") {
      setRoomUsers(msg.userList || []);
    }

    // Also update presence if we get a JOIN/LEAVE and we want instant feedback?
    // But the server sends a separate ROOM_PRESENCE usually.
    // In my server implementation, I trigger broadcastRoomPresence after join/leave.
    // So I just wait for that.
  };

  // Render Login
  if (!isLoggedIn) {
    return (
      <div className="login-screen">
        <div className="login-card">
          <h1>Welcome</h1>
          <p style={{ color: "#888", marginBottom: "20px" }}>
            Enter your username to connect
          </p>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyDown={(e) =>
              e.key === "Enter" && username && setIsLoggedIn(true)
            }
          />
          <button
            style={{ marginTop: "20px", width: "100%" }}
            onClick={() => username && setIsLoggedIn(true)}
          >
            Connect
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* Sidebar: Global Info */}
      <div className="sidebar">
        <div className="user-profile">
          <div className="status-dot"></div>
          <div>
            <div style={{ fontWeight: "bold" }}>{username}</div>
            <div style={{ fontSize: "0.8em", color: "#888" }}>Online</div>
          </div>
        </div>

        <div className="online-list-container">
          <div className="section-title">
            Online Users ({onlineUsers.length})
          </div>
          <ul className="online-list">
            {onlineUsers.map((u) => (
              <li
                key={u}
                className={`online-user-item ${u === username ? "self" : ""}`}
              >
                <div
                  className="status-dot"
                  style={{ width: 6, height: 6 }}
                ></div>
                {u} {u === username && "(You)"}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Main Area */}
      <div className="main-content">
        {!currentRoom ? (
          <div className="room-empty-state">
            <h1>Join a Room</h1>
            <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
              <input
                type="text"
                placeholder="Room ID (e.g. 101)"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
              />
              <button onClick={joinRoom}>Join</button>
            </div>
          </div>
        ) : (
          <div className="room-dashboard">
            {/* Header */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <h2>Room: {currentRoom}</h2>
              <button
                className="danger-btn"
                onClick={leaveRoom}
                style={{ borderColor: "#ff4444", color: "#ff4444" }}
              >
                Leave Room
              </button>
            </div>

            <div className="active-room">
              {/* Event Log */}
              <div className="room-events">
                <div className="events-header">Activity Log</div>
                <div className="events-log">
                  {events.length === 0 && (
                    <div
                      style={{
                        textAlign: "center",
                        color: "#666",
                        marginTop: "20px",
                      }}
                    >
                      No activity yet.
                    </div>
                  )}
                  {events.map((e, idx) => (
                    <div key={idx} className={`event-message event-${e.type}`}>
                      <span
                        style={{
                          opacity: 0.6,
                          fontSize: "0.8em",
                          marginRight: "10px",
                        }}
                      >
                        {new Date(e.timestamp).toLocaleTimeString()}
                      </span>
                      {e.content}
                    </div>
                  ))}
                </div>
              </div>

              {/* Room Users */}
              <div className="room-users-panel">
                <div className="section-title">
                  In this Room ({roomUsers.length})
                </div>
                <ul className="online-list">
                  {roomUsers.map((u) => (
                    <li
                      key={u}
                      className={`online-user-item ${u === username ? "self" : ""}`}
                    >
                      {u} {u === username && "(You)"}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
