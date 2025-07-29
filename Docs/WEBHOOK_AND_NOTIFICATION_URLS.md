# 🔔 PIXELPITCH NOTIFICATION & WEBHOOK URLS

## 📍 **CRITICAL URLS FOUND IN YOUR PROJECT**

### 🚀 **Main Backend API Base URL**

```
https://100.90.131.37:7082
```

**Environment Variable:** `NEXT_PUBLIC_API_BASE_URL`

---

### 🔔 **NOTIFICATION SERVICE URLS**

#### 1. **SignalR Notification Hub (Real-time)**

```
https://100.90.131.37:7082/Notify
```

**Purpose:** Real-time notification delivery via WebSocket
**Location:** `Services/SignalRService.ts` line 225
**Connection Type:** WebSocket SignalR Hub

#### 2. **REST API Notification Endpoints**

**Base:** `https://100.90.131.37:7082/api/notifications/`

- **Get User Notifications:** `GET /api/notifications/user/{userId}`
- **Get Unread Count:** `GET /api/notifications/user/{userId}/unread-count`
- **Mark as Read:** `PUT /api/notifications/mark-as-read/{notificationId}`
- **Mark All Read:** `PUT /api/notifications/user/{userId}/mark-all-read`
- **Delete Notification:** `DELETE /api/notifications/{notificationId}`
- **Clear All:** `DELETE /api/notifications/user/{userId}/all`
- **Test Endpoint:** `POST /api/notifications/test`

---

### 🎮 **MATCH SIMULATION URLS**

#### 1. **SignalR Match Simulation Hub**

```
https://100.90.131.37:7082/matchSimulationHub
```

**Purpose:** Real-time match events and simulation updates
**Location:** `Services/SignalRService.ts` line 165
**Connection Type:** WebSocket SignalR Hub

#### 2. **Match Simulation REST API**

```
https://100.90.131.37:7082/api/matches/simulatematch/{matchId}
```

**Purpose:** Trigger match simulation
**Location:** `Services/EmergencyMatchSimulationService.ts`

---

### 🏥 **HEALTH CHECK URL**

```
http://localhost:3000/api/health
```

**Purpose:** Frontend health check endpoint
**Location:** `app/api/health/route.ts`

---

### 🔧 **ENVIRONMENT VARIABLES**

#### **Current Default Values:**

```bash
NEXT_PUBLIC_API_BASE_URL=https://100.90.131.37:7082
NEXT_PUBLIC_API_URL=https://100.90.131.37:7082/api
```

#### **Alternative Configurations Found:**

```bash
# Development
NEXT_PUBLIC_API_URL=http://localhost:5000

# Docker
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_API_URL=http://backend-service:5000
```

---

### 📡 **SIGNALR METHODS (Webhook Events)**

#### **Notification Events:**

- `SendNotificationAsync` (PascalCase)
- `sendnotificationasync` (lowercase)
- `SendMessageAsync` (PascalCase)
- `sendmessageasync` (lowercase)

#### **Match Events:**

- `SendMatchStartNotificationAsync`
- `sendmatchstartnotificationasync`
- `SendSimulationUpdateNotificationAsync`
- `sendsimulationupdatenotificationasync`

---

### 🎯 **KEY FINDINGS**

1. **Primary Backend Server:** `100.90.131.37:7082`
2. **Two SignalR Hubs:**
   - `/Notify` - For notifications
   - `/matchSimulationHub` - For match simulations
3. **Dual Method Names:** Your system handles both PascalCase and lowercase SignalR method names
4. **WebSocket Transport:** Uses WebSocket with automatic reconnection
5. **JWT Authentication:** All connections use JWT tokens for authentication

---

### 🚨 **IMPORTANT NOTES**

- **IP Address:** `100.90.131.37` appears to be your backend server
- **Port:** `7082` is your API port
- **Protocol:** Uses HTTPS for production
- **Authentication:** JWT tokens required for all SignalR connections
- **Automatic Reconnection:** Built-in reconnection logic with exponential backoff

---

### 🔍 **FILES CONTAINING THESE URLS**

1. `Services/SignalRService.ts` - Main SignalR connection logic
2. `Services/NotificationService.ts` - REST API notification methods
3. `Services/ApiService.ts` - General API configuration
4. `Services/EmergencyMatchSimulationService.ts` - Match simulation triggers
5. `lib/performanceMonitor.ts` - Performance monitoring endpoints

**All URLs are configurable via environment variables but default to the hardcoded values shown above.**
