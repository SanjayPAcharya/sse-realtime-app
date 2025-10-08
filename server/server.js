const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for React frontend
app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:5173"],
    credentials: true,
  })
);

// Parse JSON bodies
app.use(express.json());

// Store connected clients
let clients = [];

// Nifty 50 mock data
let niftyData = {
  index: "NIFTY 50",
  value: 22150.5,
  change: 0,
  changePercent: 0,
  high: 22200.75,
  low: 22100.25,
  open: 22125.0,
  previousClose: 22150.5,
};

// Function to generate realistic Nifty price changes
function updateNiftyPrice() {
  // Random change between -0.5% to +0.5%
  const changePercent = (Math.random() - 0.5) * 1.0;
  const change = (niftyData.previousClose * changePercent) / 100;

  niftyData.value = parseFloat((niftyData.value + change).toFixed(2));
  niftyData.change = parseFloat(
    (niftyData.value - niftyData.previousClose).toFixed(2)
  );
  niftyData.changePercent = parseFloat(
    ((niftyData.change / niftyData.previousClose) * 100).toFixed(2)
  );

  // Update high/low
  if (niftyData.value > niftyData.high) {
    niftyData.high = niftyData.value;
  }
  if (niftyData.value < niftyData.low) {
    niftyData.low = niftyData.value;
  }

  return { ...niftyData };
}

// Function to determine event type based on change
function getEventType(change) {
  if (change > 50) return "success";
  if (change > 20) return "info";
  if (change < -50) return "error";
  if (change < -20) return "warning";
  return "update";
}

// Function to generate market message
function generateMarketMessage(data) {
  const messages = [
    `NIFTY 50 at ₹${data.value.toLocaleString()} (${
      data.changePercent > 0 ? "+" : ""
    }${data.changePercent}%)`,
    `Market ${data.changePercent > 0 ? "gains" : "loses"} ${Math.abs(
      data.changePercent
    )}% - Current: ₹${data.value.toLocaleString()}`,
    `NIFTY trading at ₹${data.value.toLocaleString()}, ${
      data.changePercent > 0 ? "up" : "down"
    } ₹${Math.abs(data.change).toFixed(2)}`,
    `Index update: ₹${data.value.toLocaleString()} | High: ₹${data.high.toLocaleString()} | Low: ₹${data.low.toLocaleString()}`,
    `Live: NIFTY 50 @ ₹${data.value.toLocaleString()} (${
      data.changePercent > 0 ? "▲" : "▼"
    } ${Math.abs(data.changePercent)}%)`,
  ];

  return messages[Math.floor(Math.random() * messages.length)];
}

// SSE endpoint
app.get("/api/events", (req, res) => {
  console.log("New SSE connection established");

  // Set headers for SSE
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");

  // Send initial connection message with current Nifty data
  const welcomeEvent = {
    type: "info",
    message: `Connected to NIFTY 50 Live Stream - Current: ₹${niftyData.value.toLocaleString()}`,
    timestamp: new Date().toISOString(),
    data: niftyData,
  };
  res.write(`data: ${JSON.stringify(welcomeEvent)}\n\n`);

  // Add client to the list
  const clientId = Date.now();
  const newClient = {
    id: clientId,
    res,
  };
  clients.push(newClient);

  console.log(
    `✓ Client ${clientId} connected. Total clients: ${clients.length}`
  );

  // Send heartbeat every 30 seconds to keep connection alive
  const heartbeatInterval = setInterval(() => {
    res.write(`: heartbeat\n\n`);
  }, 30000);

  // Remove client when connection closes
  req.on("close", () => {
    console.log(`✗ Client ${clientId} disconnected`);
    clearInterval(heartbeatInterval);
    clients = clients.filter((client) => client.id !== clientId);
    console.log(`  Remaining clients: ${clients.length}`);
  });
});

// Get current Nifty data
app.get("/api/nifty", (req, res) => {
  res.json(niftyData);
});

// Endpoint to send custom events
app.post("/api/send-event", (req, res) => {
  const { message, type = "notification" } = req.body;

  if (!message) {
    return res.status(400).json({ error: "Message is required" });
  }

  const event = {
    type,
    message,
    timestamp: new Date().toISOString(),
    id: Date.now(),
  };

  console.log(`📤 Broadcasting custom event: ${message}`);

  // Send to all connected clients
  let successCount = 0;
  clients.forEach((client) => {
    try {
      client.res.write(`data: ${JSON.stringify(event)}\n\n`);
      successCount++;
    } catch (error) {
      console.error(`Failed to send to client ${client.id}:`, error.message);
    }
  });

  res.json({
    success: true,
    clientsNotified: successCount,
    event,
  });
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    connectedClients: clients.length,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    niftyValue: niftyData.value,
  });
});

// Get all connected clients
app.get("/api/clients", (req, res) => {
  res.json({
    count: clients.length,
    clients: clients.map((c) => ({
      id: c.id,
      connectedAt: new Date(c.id).toISOString(),
    })),
  });
});

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    message: "NIFTY 50 SSE Server is running",
    currentNifty: niftyData,
    endpoints: {
      events: "/api/events (SSE)",
      nifty: "/api/nifty",
      health: "/api/health",
      clients: "/api/clients",
      sendEvent: "/api/send-event (POST)",
    },
  });
});

// Send Nifty updates every 2 seconds (simulating real-time market data)
setInterval(() => {
  if (clients.length === 0) return;

  const updatedNifty = updateNiftyPrice();
  const eventType = getEventType(updatedNifty.change);
  const message = generateMarketMessage(updatedNifty);

  const event = {
    type: eventType,
    message: message,
    timestamp: new Date().toISOString(),
    id: Date.now(),
    data: updatedNifty,
  };

  console.log(
    `📊 Nifty Update: ₹${updatedNifty.value} (${
      updatedNifty.changePercent > 0 ? "+" : ""
    }${updatedNifty.changePercent}%)`
  );

  clients.forEach((client) => {
    try {
      client.res.write(`data: ${JSON.stringify(event)}\n\n`);
    } catch (error) {
      console.error(`Failed to send to client:`, error.message);
    }
  });
}, 2000); // Update every 2 seconds

// Market open/close simulation (optional)
setInterval(() => {
  if (clients.length === 0) return;

  const hour = new Date().getHours();
  let specialEvent = null;

  // Market hours: 9:15 AM to 3:30 PM IST
  if (hour === 9) {
    specialEvent = {
      type: "success",
      message: "🔔 Market Opening - NIFTY 50 trading begins",
      timestamp: new Date().toISOString(),
      id: Date.now(),
    };
  } else if (hour === 15) {
    specialEvent = {
      type: "info",
      message: "🔔 Market Closing - NIFTY 50 trading ends",
      timestamp: new Date().toISOString(),
      id: Date.now(),
    };
  }

  if (specialEvent) {
    console.log(`🔔 ${specialEvent.message}`);
    clients.forEach((client) => {
      try {
        client.res.write(`data: ${JSON.stringify(specialEvent)}\n\n`);
      } catch (error) {
        console.error(`Failed to send to client:`, error.message);
      }
    });
  }
}, 60000); // Check every minute

// Reset daily high/low at midnight
setInterval(() => {
  const now = new Date();
  if (now.getHours() === 0 && now.getMinutes() === 0) {
    niftyData.high = niftyData.value;
    niftyData.low = niftyData.value;
    niftyData.open = niftyData.value;
    niftyData.previousClose = niftyData.value;
    niftyData.change = 0;
    niftyData.changePercent = 0;
    console.log("📅 Daily reset completed");
  }
}, 60000);

// Error handling
app.use((err, req, res, next) => {
  console.error("Server error:", err);
  res.status(500).json({ error: "Internal server error" });
});

// Start server
app.listen(PORT, "0.0.0.0", () => {
  console.log("=================================");
  console.log("🚀 NIFTY 50 SSE Server Started");
  console.log("=================================");
  console.log(`📡 Server running on port ${PORT}`);
  console.log(`🔗 Local: http://localhost:${PORT}`);
  console.log(`📊 Initial NIFTY: ₹${niftyData.value.toLocaleString()}`);
  console.log("=================================");
  console.log("Available endpoints:");
  console.log(`  GET  /api/events      - SSE stream`);
  console.log(`  GET  /api/nifty       - Current Nifty data`);
  console.log(`  GET  /api/health      - Health check`);
  console.log(`  GET  /api/clients     - Connected clients`);
  console.log(`  POST /api/send-event  - Send custom event`);
  console.log("=================================");
  console.log("📈 Sending Nifty updates every 2 seconds");
  console.log("=================================");
});
