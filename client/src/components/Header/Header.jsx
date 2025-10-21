import React from "react";
import "./Header.css";

const Header = ({ isConnected }) => {
  return (
    <div className="header">
      <h1> NIFTY 52 Live Dashboard</h1>
      <div className="status">
        <div
          className={`status-indicator ${isConnected ? "connected" : ""}`}
        ></div>
        <span>{isConnected ? "Connected" : "Disconnected"}</span>
      </div>
    </div>
  );
};

export default Header;
