# Live Presence & Room Management System

## Project Overview
A real-time WebSocket-based system to track online users and manage room presence. Built with Spring Boot (Backend) and Vanilla JS + Glassmorphism UI (Frontend).

## Prerequisites
- Java 17+
- Maven (optional, wrapper can be used if generated, otherwise use IDE)
- Modern Web Browser

## How to Run

### Backend
1. Open the `backend` folder in your IDE (IntelliJ IDEA recommended).
2. Reload Maven project to download dependencies.
3. Run `PresenceApplication.java`.
4. The server will start at `http://localhost:8080`.

### Frontend
1. Open the `frontend` folder.
2. Open `index.html` in your browser.
   - **Tip**: Use a local server (like VS Code "Live Server" extension) to avoid file-system restriction issues, although the Code uses `ws://localhost:8080` which should work from `file://` in most browsers.

## Features implemented
1. **Real-time Connection**: Uses raw Spring WebSockets for low-latency communication.
2. **Room Management**: Join/Leave rooms with live member updates.
3. **Presence System**: See who is online globally and who is in your room.
4. **Resiliency**: Handles disconnects gracefully and updates all clients.
5. **UI**: Modern Glassmorphism design with animations.

## WebSocket Protocol
- **Endpoint**: `ws://localhost:8080/ws`
- **Messages**: JSON format with `type`, `sender`, `room`, `data` fields.

## Author
Christopher Obi-Gabr
