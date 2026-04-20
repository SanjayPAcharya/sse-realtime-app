import { useState } from "react";
import { API_URL, API_ENDPOINTS } from "../utils/constants";

export const useAPI = () => {
  const [serverInfo, setServerInfo]           = useState(null);
  const [serverHealth, setServerHealth]       = useState(null);
  const [connectedClients, setConnectedClients] = useState(null);
  const [indices, setIndices]                 = useState([]);

  const mergeIndices = (updates) => {
    if (!updates?.length) return;
    setIndices(prev => {
      const map = new Map(prev.map(i => [i.name, i]));
      updates.forEach(i => map.set(i.name, i));
      return Array.from(map.values());
    });
  };

  const fetchServerInfo = async () => {
    try {
      const res = await fetch(`${API_URL}${API_ENDPOINTS.ROOT}`);
      setServerInfo(await res.json());
    } catch (e) { console.error("fetchServerInfo:", e); }
  };

  const fetchIndices = async () => {
    try {
      const res = await fetch(`${API_URL}${API_ENDPOINTS.INDICES}`);
      const data = await res.json();
      if (data.indices?.length) setIndices(data.indices);
    } catch (e) { console.error("fetchIndices:", e); }
  };

  const fetchServerHealth = async () => {
    try {
      const res = await fetch(`${API_URL}${API_ENDPOINTS.HEALTH}`);
      setServerHealth(await res.json());
    } catch (e) { console.error("fetchServerHealth:", e); }
  };

  const fetchConnectedClients = async () => {
    try {
      const res = await fetch(`${API_URL}${API_ENDPOINTS.CLIENTS}`);
      setConnectedClients(await res.json());
    } catch (e) { console.error("fetchConnectedClients:", e); }
  };

  const sendCustomEvent = async (message, type) => {
    try {
      const res = await fetch(`${API_URL}${API_ENDPOINTS.SEND_EVENT}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, type }),
      });
      const data = await res.json();
      alert(`✅ Event sent to ${data.clientsNotified} client(s)`);
      fetchConnectedClients();
    } catch (e) {
      alert("❌ Failed to send event: " + e.message);
    }
  };

  return {
    serverInfo, serverHealth, connectedClients,
    indices, setIndices, mergeIndices,
    fetchServerInfo, fetchIndices, fetchServerHealth,
    fetchConnectedClients, sendCustomEvent,
  };
};
