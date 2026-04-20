import React, { useEffect, useCallback, useState } from "react";
import "./App.css";
import IndicesGrid from "./components/IndicesGrid/IndicesGrid";
import StatsGrid from "./components/StatsGrid/StatsGrid";
import ApiStatus from "./components/ApiStatus/ApiStatus";
import Controls from "./components/Controls/Controls";
import ClientsList from "./components/ClientsList/ClientsList";
import EventsFeed from "./components/EventsFeed/EventsFeed";
import ServerInfo from "./components/ServerInfo/ServerInfo";
import { useSSE } from "./hooks/useSSE";
import { useAPI } from "./hooks/useAPI";

const MAX_HISTORY = 30;

function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") ?? "dark");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const {
    serverInfo, serverHealth, connectedClients,
    indices, mergeIndices,
    fetchServerInfo, fetchIndices, fetchServerHealth, fetchConnectedClients,
    sendCustomEvent,
  } = useAPI();

  // price history: Map<indexName, number[]>
  const [priceHistory, setPriceHistory] = useState(() => new Map());

  const handleIndicesUpdate = useCallback((updates) => {
    if (!updates?.length) return;
    setPriceHistory(prev => {
      const next = new Map(prev);
      updates.forEach(({ name, value }) => {
        const h = next.get(name) ?? [];
        next.set(name, [...h, value].slice(-MAX_HISTORY));
      });
      return next;
    });
    mergeIndices(updates);
  }, [mergeIndices]);

  const {
    events, isConnected, eventCount, connectionTime, lastEventTime,
    dataSource, marketOpen,
    connect, disconnect, clearEvents,
  } = useSSE(handleIndicesUpdate);

  useEffect(() => {
    fetchServerInfo();
    fetchIndices();
    fetchServerHealth();
    connect(() => {
      fetchServerInfo();
      fetchServerHealth();
      fetchConnectedClients();
    });
    return () => disconnect();
  }, []);

  useEffect(() => {
    if (!isConnected) return;
    const id = setInterval(() => {
      fetchServerHealth();
      fetchConnectedClients();
    }, 10000);
    return () => clearInterval(id);
  }, [isConnected]);

  const handleSendEvent = () => {
    const message = prompt("Enter event message:");
    if (!message) return;
    const type = prompt("Event type (info/success/warning/error/update):", "info");
    sendCustomEvent(message, type);
  };

  const sourceLabel =
    dataSource === "nse"        ? "NSE Live" :
    dataSource === "yahoo"      ? "Yahoo Finance" :
    dataSource === "simulation" ? "Simulation" : null;

  const mktStatus = marketOpen === true ? "open" : marketOpen === false ? "closed" : null;

  return (
    <div className="app">
      <header className="appbar">
        <div className="appbar-left">
          <div className="appbar-logo">📊</div>
          <span className="appbar-title">India Indices Live</span>
          {sourceLabel && (
            <span className={`source-badge ${dataSource}`}>{sourceLabel}</span>
          )}
          {mktStatus && (
            <span className={`market-badge ${mktStatus}`}>
              Market {mktStatus === "open" ? "Open" : "Closed"}
            </span>
          )}
        </div>
        <div className="appbar-right">
          <button
            className="theme-toggle"
            onClick={() => setTheme(t => t === "dark" ? "light" : "dark")}
            title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            {theme === "dark" ? "☀" : "☾"}
          </button>
          <div className={`status-chip ${isConnected ? "" : "disconnected"}`}>
            <span className="status-dot"></span>
            {isConnected ? "Live" : "Disconnected"}
          </div>
        </div>
      </header>

      <main className="main-layout">
        {/* ── Left: indices + controls ── */}
        <div className="left-panel">
          <div className="section-label">Indices</div>
          <IndicesGrid indices={indices} priceHistory={priceHistory} />

          <StatsGrid
            eventCount={eventCount}
            connectionTime={connectionTime}
            lastEventTime={lastEventTime}
            connectedClients={connectedClients}
            serverHealth={serverHealth}
            indicesCount={indices.length}
            dataSource={dataSource}
          />

          <div className="info-row">
            <ApiStatus
              serverInfo={serverInfo}
              indicesCount={indices.length}
              serverHealth={serverHealth}
              connectedClients={connectedClients}
              isConnected={isConnected}
            />
            <ServerInfo data={serverInfo} />
          </div>

          <Controls
            isConnected={isConnected}
            onConnect={() => connect(() => { fetchServerInfo(); fetchServerHealth(); fetchConnectedClients(); })}
            onDisconnect={disconnect}
            onClearEvents={clearEvents}
            onSendEvent={handleSendEvent}
            onRefreshIndices={fetchIndices}
            onCheckHealth={fetchServerHealth}
            onGetClients={fetchConnectedClients}
          />
          <ClientsList clients={connectedClients} />
        </div>

        {/* ── Right: slim events ── */}
        <div className="right-panel">
          <EventsFeed events={events} />
        </div>
      </main>
    </div>
  );
}

export default App;
