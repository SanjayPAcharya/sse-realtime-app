import { useState } from "react";
import { API_URL, API_ENDPOINTS } from "../utils/constants";

export const useAPI = () => {
  const [serverInfo, setServerInfo] = useState(null);
  const [currentNifty, setCurrentNifty] = useState(null);
  const [serverHealth, setServerHealth] = useState(null);
  const [connectedClients, setConnectedClients] = useState(null);

  const fetchServerInfo = async () => {
    try {
      console.log("📡 Fetching server info...");
      const response = await fetch(`${API_URL}${API_ENDPOINTS.ROOT}`);
      const data = await response.json();
      setServerInfo(data);
      console.log("✅ Server info:", data);
    } catch (error) {
      console.error("❌ Error fetching server info:", error);
    }
  };

  const fetchCurrentNifty = async () => {
    try {
      console.log("📊 Fetching current Nifty data...");
      const response = await fetch(`${API_URL}${API_ENDPOINTS.NIFTY}`);
      const data = await response.json();
      setCurrentNifty(data);
      console.log("✅ Current Nifty data:", data);
      alert("Nifty data refreshed!");
    } catch (error) {
      console.error("❌ Error fetching Nifty data:", error);
      alert("Failed to fetch Nifty data");
    }
  };

  const fetchServerHealth = async () => {
    try {
      console.log("🏥 Checking server health...");
      const response = await fetch(`${API_URL}${API_ENDPOINTS.HEALTH}`);
      const data = await response.json();
      setServerHealth(data);
      console.log("✅ Server health:", data);
    } catch (error) {
      console.error("❌ Error fetching server health:", error);
    }
  };

  const fetchConnectedClients = async () => {
    try {
      console.log("👥 Fetching connected clients...");
      const response = await fetch(`${API_URL}${API_ENDPOINTS.CLIENTS}`);
      const data = await response.json();
      setConnectedClients(data);
      console.log("✅ Connected clients:", data);
    } catch (error) {
      console.error("❌ Error fetching connected clients:", error);
    }
  };

  const sendCustomEvent = async (message, type) => {
    try {
      console.log("📤 Sending custom event...");
      const response = await fetch(`${API_URL}${API_ENDPOINTS.SEND_EVENT}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message, type }),
      });

      const data = await response.json();
      console.log("✅ Event sent:", data);
      alert(`✅ Event sent successfully to ${data.clientsNotified} client(s)!`);

      fetchConnectedClients();
    } catch (error) {
      console.error("❌ Error sending event:", error);
      alert("❌ Failed to send event: " + error.message);
    }
  };

  return {
    serverInfo,
    currentNifty,
    serverHealth,
    connectedClients,
    setCurrentNifty,
    fetchServerInfo,
    fetchCurrentNifty,
    fetchServerHealth,
    fetchConnectedClients,
    sendCustomEvent,
  };
};
