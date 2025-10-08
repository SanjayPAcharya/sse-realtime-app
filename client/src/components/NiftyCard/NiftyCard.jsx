import React from "react";
import "./NiftyCard.css";

const NiftyCard = ({ data }) => {
  if (!data) return null;

  return (
    <div className="nifty-card">
      <div className="nifty-header">
        <h2>{data.index}</h2>
        <span className="last-updated">{new Date().toLocaleTimeString()}</span>
      </div>
      <div className="nifty-main">
        <div className="nifty-value">
          ₹
          {data.value.toLocaleString("en-IN", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </div>
        <div
          className={`nifty-change ${
            data.change >= 0 ? "positive" : "negative"
          }`}
        >
          <span className="change-arrow">{data.change >= 0 ? "▲" : "▼"}</span>
          <span className="change-value">
            ₹{Math.abs(data.change).toFixed(2)}
          </span>
          <span className="change-percent">
            ({data.changePercent >= 0 ? "+" : ""}
            {data.changePercent}%)
          </span>
        </div>
      </div>
      <div className="nifty-details">
        <div className="detail-item">
          <span className="detail-label">Open</span>
          <span className="detail-value">
            ₹{data.open.toLocaleString("en-IN")}
          </span>
        </div>
        <div className="detail-item">
          <span className="detail-label">High</span>
          <span className="detail-value positive">
            ₹{data.high.toLocaleString("en-IN")}
          </span>
        </div>
        <div className="detail-item">
          <span className="detail-label">Low</span>
          <span className="detail-value negative">
            ₹{data.low.toLocaleString("en-IN")}
          </span>
        </div>
        <div className="detail-item">
          <span className="detail-label">Prev Close</span>
          <span className="detail-value">
            ₹{data.previousClose.toLocaleString("en-IN")}
          </span>
        </div>
      </div>
    </div>
  );
};

export default NiftyCard;
