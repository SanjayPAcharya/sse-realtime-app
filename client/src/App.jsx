import React, { useEffect } from "react";
import "./App.css";
import Header from "./components/Header/Header";
import ServerInfo from "./components/ServerInfo/ServerInfo";
import NiftyCard from "./components/NiftyCard/NiftyCard";
import StatsGrid from "./components/StatsGrid/StatsGrid";
import ApiStatus from "./components/ApiStatus/ApiStatus";
import Controls from "./components/Controls/Controls";
import ClientsList from "./components/ClientsList/ClientsList";
import EventsFeed from "./components/EventsFeed/EventsFeed";
import { useSSE } from "./hooks/useSSE";
import { useAPI } from "./hooks/useAPI";

function App() {
  const {
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
  } = useAPI();

  const {
    events,
    isConnected,
    eventCount,
    connectionTime,
    lastEventTime,
    connect,
    disconnect,
    clearEvents,
  } = useSSE(setCurrentNifty);

  // Auto-connect on mount
  useEffect(() => {
    const handleConnect = () => {
      fetchServerInfo();
      fetchServerHealth();
      fetchConnectedClients();
    };

    fetchServerInfo();
    fetchCurrentNifty();
    fetchServerHealth();
    connect(handleConnect);

    return () => {
      disconnect();
    };
  }, []);

  // Auto-refresh health and clients every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (isConnected) {
        fetchServerHealth();
        fetchConnectedClients();
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [isConnected]);

  const handleSendEvent = () => {
    const message = prompt("Enter event message:");
    if (!message) return;

    const type = prompt(
      "Enter event type (info/success/warning/error/update):",
      "info"
    );

    sendCustomEvent(message, type);
  };

  const handleShowAllData = () => {
    console.log("=================================");
    console.log("📊 ALL API DATA");
    console.log("=================================");
    console.log("Server Info:", serverInfo);
    console.log("Current Nifty:", currentNifty);
    console.log("Server Health:", serverHealth);
    console.log("Connected Clients:", connectedClients);
    console.log("Events:", events);
    console.log("=================================");
    alert("Check console for all API data!");
  };

  return (
    <div className="App">
      <div className="container">
        <Header isConnected={isConnected} />

        <div className="main-content">
          {/* LEFT COLUMN */}
          <div className="left-column">
            <ServerInfo data={serverInfo} />
            <NiftyCard data={currentNifty} />
            <StatsGrid
              eventCount={eventCount}
              connectionTime={connectionTime}
              lastEventTime={lastEventTime}
              connectedClients={connectedClients}
              serverHealth={serverHealth}
            />
            <ApiStatus
              serverInfo={serverInfo}
              currentNifty={currentNifty}
              serverHealth={serverHealth}
              connectedClients={connectedClients}
              isConnected={isConnected}
            />
            <Controls
              isConnected={isConnected}
              onConnect={() =>
                connect(() => {
                  fetchServerInfo();
                  fetchServerHealth();
                  fetchConnectedClients();
                })
              }
              onDisconnect={disconnect}
              onClearEvents={clearEvents}
              onSendEvent={handleSendEvent}
              onRefreshNifty={fetchCurrentNifty}
              onCheckHealth={fetchServerHealth}
              onGetClients={fetchConnectedClients}
              onShowData={handleShowAllData}
            />
            <ClientsList clients={connectedClients} />
          </div>

          {/* RIGHT COLUMN */}
          <div className="right-column">
            <EventsFeed events={events} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
