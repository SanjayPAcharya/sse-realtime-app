import React from "react";

const NiftyCard = ({ data }) => {
  if (!data) return null;
  const isUp = data.change >= 0;

  return (
    <div className="nifty-card">
      <div className="nifty-card-top">
        <div>
          <div className="nifty-index-name">{data.index}</div>
          <div className="nifty-label">NSE India</div>
        </div>
        <span className="nifty-time-badge">{new Date().toLocaleTimeString()}</span>
      </div>

      <div className="nifty-value">
        ₹{data.value.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </div>

      <div className="nifty-change-row">
        <span className={`change-badge ${isUp ? "up" : "down"}`}>
          {isUp ? "▲" : "▼"} ₹{Math.abs(data.change).toFixed(2)}
        </span>
        <span className="change-pct">
          ({data.changePercent >= 0 ? "+" : ""}{data.changePercent}%)
        </span>
      </div>

      <div className="nifty-ohlc">
        <div className="ohlc-item">
          <span className="ohlc-label">Open</span>
          <span className="ohlc-value">₹{data.open.toLocaleString("en-IN")}</span>
        </div>
        <div className="ohlc-item">
          <span className="ohlc-label">High</span>
          <span className="ohlc-value high">₹{data.high.toLocaleString("en-IN")}</span>
        </div>
        <div className="ohlc-item">
          <span className="ohlc-label">Low</span>
          <span className="ohlc-value low">₹{data.low.toLocaleString("en-IN")}</span>
        </div>
        <div className="ohlc-item">
          <span className="ohlc-label">Prev</span>
          <span className="ohlc-value">₹{data.previousClose.toLocaleString("en-IN")}</span>
        </div>
      </div>
    </div>
  );
};

export default NiftyCard;
