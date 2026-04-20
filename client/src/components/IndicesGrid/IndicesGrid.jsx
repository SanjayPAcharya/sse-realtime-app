import React, { useState, useEffect, useRef } from "react";
import "./IndicesGrid.css";

/* ── Sparkline ───────────────────────────────────────────────────────────── */
const Sparkline = ({ history, isUp }) => {
  if (!history || history.length < 3) return null;

  const W = 72, H = 28, PAD = 2;
  const min = Math.min(...history);
  const max = Math.max(...history);
  const range = max - min || 0.001;

  const pts = history.map((v, i) => ({
    x: PAD + (i / (history.length - 1)) * (W - PAD * 2),
    y: PAD + (1 - (v - min) / range) * (H - PAD * 2),
  }));

  const linePts = pts.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");

  const areaD = [
    `M ${pts[0].x.toFixed(1)},${H}`,
    ...pts.map(p => `L ${p.x.toFixed(1)},${p.y.toFixed(1)}`),
    `L ${pts[pts.length - 1].x.toFixed(1)},${H}`,
    "Z",
  ].join(" ");

  const stroke = isUp ? "#22D3A1" : "#FF6B6B";
  const fill   = isUp ? "rgba(34,211,161,0.12)" : "rgba(255,107,107,0.12)";

  return (
    <svg
      width={W} height={H}
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      className="sparkline"
    >
      <path d={areaD} fill={fill} />
      <polyline
        points={linePts}
        fill="none"
        stroke={stroke}
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
};

/* ── Index Card ──────────────────────────────────────────────────────────── */
const IndexCard = ({ index, history }) => {
  const prevRef = useRef(index.value);
  const [flash, setFlash] = useState("");

  useEffect(() => {
    if (prevRef.current === index.value) return;
    const cls = index.value > prevRef.current ? "flash-up" : "flash-down";
    prevRef.current = index.value;
    setFlash(cls);
    const t = setTimeout(() => setFlash(""), 2500);
    return () => clearTimeout(t);
  }, [index.value]);

  const isUp = index.change >= 0;
  const fmt  = (n, d = 2) =>
    n != null ? n.toLocaleString("en-IN", { minimumFractionDigits: d, maximumFractionDigits: d }) : "—";

  return (
    <div className={`index-card ${flash}`}>
      <div className="index-card-header">
        <span className="index-name">{index.name}</span>
        <span className={`index-pct ${isUp ? "up" : "down"}`}>
          {isUp ? "▲" : "▼"} {Math.abs(index.changePercent).toFixed(2)}%
        </span>
      </div>

      <div className="index-body">
        <div className="index-values">
          <div className={`index-value`}>₹{fmt(index.value)}</div>
          <div className={`index-change ${isUp ? "up" : "down"}`}>
            {isUp ? "+" : ""}{fmt(index.change)}
          </div>
        </div>
        <Sparkline history={history} isUp={isUp} />
      </div>

      <div className="index-ohlc">
        <span className="ohlc-pill"><span className="ohlc-key">O</span>{fmt(index.open, 0)}</span>
        <span className="ohlc-pill up"><span className="ohlc-key">H</span>{fmt(index.high, 0)}</span>
        <span className="ohlc-pill down"><span className="ohlc-key">L</span>{fmt(index.low, 0)}</span>
      </div>
    </div>
  );
};

/* ── Grid ────────────────────────────────────────────────────────────────── */
const IndicesGrid = ({ indices, priceHistory }) => {
  if (!indices?.length) {
    return (
      <div className="indices-empty">
        <span style={{ fontSize: 28, opacity: 0.3 }}>📊</span>
        <span>Loading indices…</span>
      </div>
    );
  }

  return (
    <div className="indices-grid">
      {indices.map(idx => (
        <IndexCard
          key={idx.name}
          index={idx}
          history={priceHistory?.get(idx.name)}
        />
      ))}
    </div>
  );
};

export default IndicesGrid;
