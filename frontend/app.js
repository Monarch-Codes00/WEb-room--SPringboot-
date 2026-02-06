const app = {
  socket: null,
  username: null,
  currentRoom: null,

  // UI Elements
  elements: {
    loginScreen: document.getElementById("login-screen"),
    dashboard: document.getElementById("dashboard"),
    usernameInput: document.getElementById("username-input"),
    connectBtn: document.getElementById("connect-btn"),
    currentUser: document.getElementById("current-user"),
    onlineUsersList: document.getElementById("online-users-list"),
    roomInput: document.getElementById("room-input"),
    joinRoomBtn: document.getElementById("join-room-btn"),
    leaveRoomBtn: document.getElementById("leave-room-btn"),
    currentRoomName: document.getElementById("current-room-name"),
    roomUsersList: document.getElementById("room-users-list"),
    systemLog: document.getElementById("system-log"),
    disconnectBtn: document.getElementById("disconnect-btn"),
    refreshUsersBtn: document.getElementById("refresh-users-btn"),
  },

  init() {
    this.elements.connectBtn.addEventListener("click", () => this.connect());
    this.elements.joinRoomBtn.addEventListener("click", () => this.joinRoom());
    this.elements.leaveRoomBtn.addEventListener("click", () =>
      this.leaveRoom(),
    );
    this.elements.disconnectBtn.addEventListener("click", () =>
      this.disconnect(),
    );
    this.elements.refreshUsersBtn.addEventListener("click", () =>
      this.fetchOnlineUsers(),
    );

    // Enter key support
    this.elements.usernameInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") this.connect();
    });
    this.elements.roomInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") this.joinRoom();
    });
  },

  connect() {
    const username = this.elements.usernameInput.value.trim();
    if (!username) return alert("Please enter a username");

    this.username = username;

    // Connect to WebSocket
    this.socket = new WebSocket("ws://localhost:8080/ws");

    this.socket.onopen = () => {
      console.log("Connected");
      this.showDashboard();
      this.log("System", "Connected to server");

      // Send initial ping/register
      this.send({ type: "PING", sender: this.username });
      this.fetchOnlineUsers();

      // Start Hearbeat
      this.heartbeatInterval = setInterval(() => {
        this.send({ type: "PING", sender: this.username });
      }, 30000);

      // Poll for room updates
      this.pollInterval = setInterval(() => {
        this.fetchOnlineUsers();
        if (this.currentRoom) this.fetchRoomPresence();
      }, 5000);
    };

    this.socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      this.handleMessage(message);
    };

    this.socket.onclose = () => {
      this.log("System", "Disconnected from server");
      this.showLogin();
      clearInterval(this.heartbeatInterval);
      clearInterval(this.pollInterval);
    };

    this.socket.onerror = (err) => {
      console.error(err);
      this.log("Error", "Connection error occurred");
    };
  },

  disconnect() {
    if (this.socket) {
      this.socket.close();
    }
  },

  send(data) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(data));
    }
  },

  joinRoom() {
    const room = this.elements.roomInput.value.trim();
    if (!room) return alert("Enter a room name");

    if (this.currentRoom) {
      this.leaveRoom();
    }

    this.currentRoom = room;
    this.send({ type: "JOIN", sender: this.username, room: room });

    this.updateRoomUI(true);
    this.fetchRoomPresence();
  },

  leaveRoom() {
    if (!this.currentRoom) return;

    this.send({ type: "LEAVE", sender: this.username, room: this.currentRoom });
    this.currentRoom = null;
    this.updateRoomUI(false);
  },

  fetchOnlineUsers() {
    this.send({ type: "ONLINE_USERS", sender: this.username });
  },

  fetchRoomPresence() {
    if (!this.currentRoom) return;
    this.send({
      type: "ROOM_PRESENCE",
      sender: this.username,
      room: this.currentRoom,
    });
  },

  handleMessage(message) {
    switch (message.type) {
      case "SYSTEM":
        this.log("Server", message.data);
        if (message.room === this.currentRoom) {
          this.fetchRoomPresence();
        }
        this.fetchOnlineUsers(); // Update on any system event usually
        break;

      case "ONLINE_USERS":
        this.renderUserList(message.data, this.elements.onlineUsersList);
        break;

      case "ROOM_PRESENCE":
        if (message.room === this.currentRoom) {
          this.renderUserList(message.data, this.elements.roomUsersList, true);
        }
        break;
    }
  },

  // UI Helpers
  showDashboard() {
    this.elements.loginScreen.classList.add("hidden");
    this.elements.dashboard.classList.remove("hidden");
    this.elements.currentUser.textContent = this.username;
  },

  showLogin() {
    this.elements.loginScreen.classList.remove("hidden");
    this.elements.dashboard.classList.add("hidden");
  },

  updateRoomUI(joined) {
    if (joined) {
      this.elements.currentRoomName.textContent = this.currentRoom;
      this.elements.joinRoomBtn.classList.add("hidden");
      this.elements.leaveRoomBtn.classList.remove("hidden");
      this.elements.roomInput.value = "";
    } else {
      this.elements.currentRoomName.textContent = "No Room Selected";
      this.elements.joinRoomBtn.classList.remove("hidden");
      this.elements.leaveRoomBtn.classList.add("hidden");
      this.elements.roomUsersList.innerHTML =
        '<li class="empty-state">Join a room to see members</li>';
    }
  },

  renderUserList(users, container, isGrid = false) {
    container.innerHTML = "";
    if (!users || users.length === 0) {
      container.innerHTML = '<li class="empty-state">No users active</li>';
      return;
    }

    users.forEach((user) => {
      const li = document.createElement("li");
      li.textContent = user;
      if (user === this.username) {
        li.style.color = "#ae67fa";
        li.textContent += " (You)";
      }
      container.appendChild(li);
    });
  },

  log(source, message) {
    const entry = document.createElement("div");
    entry.className = "log-entry";
    const time = new Date().toLocaleTimeString();
    entry.innerHTML = `<span class="log-time">[${time}]</span> <strong>${source}:</strong> ${message}`;
    this.elements.systemLog.prepend(entry);
  },
};

app.init();
