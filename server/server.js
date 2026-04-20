const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: [
    "http://localhost:3000", "http://localhost:5173", "http://localhost:8080",
    "http://sse.sanjaykumarp.info", "http://sseapi.sanjaykumarp.info",
    "https://sse.sanjaykumarp.info", "https://sseapi.sanjaykumarp.info",
  ],
  credentials: true,
}));
app.use(express.json());

// ── Config ────────────────────────────────────────────────────────────────────

const TRACKED = [
  "NIFTY 50", "NIFTY NEXT 50", "NIFTY BANK", "NIFTY MIDCAP 50",
  "NIFTY SMALLCAP 50", "NIFTY IT", "NIFTY AUTO", "NIFTY PHARMA",
  "NIFTY FMCG", "NIFTY METAL", "NIFTY REALTY", "NIFTY INFRA",
];

// Approximate seed prices used before first real fetch
const SEEDS = {
  "NIFTY 50": 24350, "NIFTY NEXT 50": 65000, "NIFTY BANK": 52680,
  "NIFTY MIDCAP 50": 14800, "NIFTY SMALLCAP 50": 9200, "NIFTY IT": 35420,
  "NIFTY AUTO": 22100, "NIFTY PHARMA": 21500, "NIFTY FMCG": 58700,
  "NIFTY METAL": 9100, "NIFTY REALTY": 890, "NIFTY INFRA": 580,
};

// Yahoo Finance symbols for each tracked index
const YAHOO = {
  "NIFTY 50": "^NSEI", "NIFTY NEXT 50": "^CNXNIFTY", "NIFTY BANK": "^NSEBANK",
  "NIFTY MIDCAP 50": "^NSEMDCP50", "NIFTY SMALLCAP 50": "^CNXSC",
  "NIFTY IT": "^CNXIT", "NIFTY AUTO": "^CNXAUTO", "NIFTY PHARMA": "^CNXPHARMA",
  "NIFTY FMCG": "^CNXFMCG", "NIFTY METAL": "^CNXMETAL",
  "NIFTY REALTY": "^CNXREALTY", "NIFTY INFRA": "^CNXINFRA",
};

const NSE_UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36";

// ── State ─────────────────────────────────────────────────────────────────────

let clients = [];
let source = "simulation"; // "nse" | "yahoo" | "simulation"

// Seed indicesMap with approximate prices so the dashboard is never empty
const indicesMap = new Map(
  TRACKED.map(name => {
    const p = SEEDS[name];
    return [name, { name, value: p, change: 0, changePercent: 0, open: p, high: p, low: p, previousClose: p }];
  })
);

// ── NSE Cookie Management ─────────────────────────────────────────────────────

const cookieJar = new Map();
let lastCookieRefresh = 0;
const COOKIE_TTL = 3.5 * 60 * 1000;

function parseCookies(arr) {
  (Array.isArray(arr) ? arr : [arr]).filter(Boolean).forEach(c => {
    const semi = c.indexOf(";");
    const pair = (semi > -1 ? c.slice(0, semi) : c).trim();
    const eq = pair.indexOf("=");
    if (eq > 0) cookieJar.set(pair.slice(0, eq).trim(), pair.slice(eq + 1).trim());
  });
}

function cookieStr() {
  return Array.from(cookieJar.entries()).map(([k, v]) => `${k}=${v}`).join("; ");
}

async function ensureNseSession() {
  if (Date.now() - lastCookieRefresh < COOKIE_TTL) return;
  const res = await fetch("https://www.nseindia.com/", {
    headers: { "User-Agent": NSE_UA, "Accept": "text/html,application/xhtml+xml,*/*;q=0.8", "Accept-Language": "en-US,en;q=0.9" },
    signal: AbortSignal.timeout(8000),
  });
  parseCookies(res.headers.getSetCookie?.() ?? []);
  lastCookieRefresh = Date.now();
  console.log(`🍪 NSE session refreshed (${cookieJar.size} cookies)`);
}

async function fetchNseAllIndices() {
  await ensureNseSession();
  const res = await fetch("https://www.nseindia.com/api/allIndices", {
    headers: {
      "User-Agent": NSE_UA, "Accept": "application/json, text/plain, */*",
      "Accept-Language": "en-US,en;q=0.9", "Referer": "https://www.nseindia.com/",
      "X-Requested-With": "XMLHttpRequest", "Cookie": cookieStr(),
    },
    signal: AbortSignal.timeout(6000),
  });
  if (!res.ok) {
    if (res.status === 401 || res.status === 403) lastCookieRefresh = 0;
    throw new Error(`NSE ${res.status}`);
  }
  const json = await res.json();
  return json.data ?? [];
}

// ── Yahoo Finance Fallback ────────────────────────────────────────────────────

async function fetchYahooIndex(name) {
  const sym = YAHOO[name];
  if (!sym) return null;
  const res = await fetch(
    `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(sym)}?interval=1m&range=1d`,
    { headers: { "User-Agent": "Mozilla/5.0", "Accept": "*/*" }, signal: AbortSignal.timeout(5000) }
  );
  if (!res.ok) throw new Error(`Yahoo ${res.status}`);
  const json = await res.json();
  const meta = json.chart?.result?.[0]?.meta;
  if (!meta?.regularMarketPrice) return null;
  const prev = meta.previousClose ?? meta.chartPreviousClose ?? meta.regularMarketPrice;
  const val = parseFloat(meta.regularMarketPrice.toFixed(2));
  return {
    name,
    value: val,
    open: parseFloat((meta.regularMarketOpen ?? prev).toFixed(2)),
    high: parseFloat(meta.regularMarketDayHigh.toFixed(2)),
    low: parseFloat(meta.regularMarketDayLow.toFixed(2)),
    previousClose: parseFloat(prev.toFixed(2)),
    change: parseFloat((val - prev).toFixed(2)),
    changePercent: parseFloat(((val - prev) / prev * 100).toFixed(2)),
  };
}

// ── Market Hours ──────────────────────────────────────────────────────────────

function isMarketOpen() {
  const ist = new Date(Date.now() + 5.5 * 60 * 60 * 1000);
  const day = ist.getUTCDay();
  if (day === 0 || day === 6) return false;
  const t = ist.getUTCHours() * 60 + ist.getUTCMinutes();
  return t >= 9 * 60 + 15 && t <= 15 * 60 + 30;
}

// ── Data Refresh ──────────────────────────────────────────────────────────────

function toFloat(v) { return parseFloat(parseFloat(v || 0).toFixed(2)); }

function applyNseRow(item) {
  const name = item.index ?? item.indexSymbol;
  if (!TRACKED.includes(name)) return null;
  const val = toFloat(item.last);
  const prev = indicesMap.get(name);
  if (prev?.value === val) return null;
  const updated = {
    name, value: val,
    change: toFloat(item.variation ?? item.change),
    changePercent: toFloat(item.percentChange ?? item.perChange),
    open: toFloat(item.open || val),
    high: toFloat(item.high || val),
    low: toFloat(item.low || val),
    previousClose: toFloat(item.previousClose ?? item.previousOClose ?? val),
  };
  indicesMap.set(name, updated);
  return updated;
}

async function refreshFromNse() {
  const rows = await fetchNseAllIndices();
  return rows.map(applyNseRow).filter(Boolean);
}

async function refreshFromYahoo() {
  const results = await Promise.allSettled(TRACKED.map(fetchYahooIndex));
  const changed = [];
  results.forEach(r => {
    if (r.status !== "fulfilled" || !r.value) return;
    const fresh = r.value;
    const prev = indicesMap.get(fresh.name);
    if (!prev || prev.value !== fresh.value) {
      indicesMap.set(fresh.name, fresh);
      changed.push(fresh);
    }
  });
  return changed;
}

// ── Simulation (market closed or both APIs unavailable) ───────────────────────

function simulateTick() {
  const changed = [];
  indicesMap.forEach((data, name) => {
    if (Math.random() > 0.45) {
      const pct = (Math.random() - 0.5) * 0.25;
      const delta = (data.previousClose * pct) / 100;
      const val = parseFloat((data.value + delta).toFixed(2));
      const updated = {
        ...data, value: val,
        change: parseFloat((val - data.previousClose).toFixed(2)),
        changePercent: parseFloat(((val - data.previousClose) / data.previousClose * 100).toFixed(2)),
        high: Math.max(data.high, val),
        low: Math.min(data.low, val),
      };
      indicesMap.set(name, updated);
      changed.push(updated);
    }
  });
  return changed;
}

// ── Broadcast ─────────────────────────────────────────────────────────────────

function broadcast(event) {
  const payload = `data: ${JSON.stringify(event)}\n\n`;
  clients = clients.filter(c => { try { c.res.write(payload); return true; } catch { return false; } });
}

// ── Main Tick ─────────────────────────────────────────────────────────────────

async function tick() {
  if (clients.length === 0) return;

  let changed = [];

  if (isMarketOpen()) {
    try {
      changed = await refreshFromNse();
      if (source !== "nse") { console.log("✅ Source: NSE live"); source = "nse"; }
    } catch (nseErr) {
      console.warn(`⚠️  NSE failed (${nseErr.message}) — trying Yahoo…`);
      try {
        changed = await refreshFromYahoo();
        if (source !== "yahoo") { console.log("📡 Source: Yahoo Finance"); source = "yahoo"; }
      } catch {
        changed = simulateTick();
        if (source !== "simulation") { console.log("🔁 Source: simulation (both APIs down)"); source = "simulation"; }
      }
    }
  } else {
    if (source !== "simulation") { console.log("📴 Market closed — simulation active"); source = "simulation"; }
    changed = simulateTick();
  }

  if (changed.length === 0) return;

  broadcast({
    type: "indices-update",
    message: `${changed.length} ${changed.length === 1 ? "index" : "indices"} updated`,
    timestamp: new Date().toISOString(),
    id: Date.now(),
    indices: changed,
    source,
    marketOpen: isMarketOpen(),
  });

  console.log(`📊 [${source}] ${changed.length} changed: ${changed.slice(0, 3).map(i => `${i.name} ₹${i.value}`).join(", ")}${changed.length > 3 ? "…" : ""}`);
}

// ── Routes ────────────────────────────────────────────────────────────────────

app.get("/api/events", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");

  res.write(`data: ${JSON.stringify({
    type: "connected",
    message: `Connected — tracking ${TRACKED.length} NSE indices`,
    timestamp: new Date().toISOString(),
    indices: Array.from(indicesMap.values()),
    source,
    marketOpen: isMarketOpen(),
  })}\n\n`);

  const id = Date.now();
  clients.push({ id, res });
  console.log(`✓ Client ${id} connected (total: ${clients.length})`);

  const hb = setInterval(() => res.write(": heartbeat\n\n"), 30000);
  req.on("close", () => {
    clearInterval(hb);
    clients = clients.filter(c => c.id !== id);
    console.log(`✗ Client ${id} disconnected (remaining: ${clients.length})`);
  });
});

app.get("/api/indices", (_req, res) => res.json({
  indices: Array.from(indicesMap.values()),
  source, marketOpen: isMarketOpen(), timestamp: new Date().toISOString(),
}));

app.get("/api/nifty", (_req, res) => res.json(indicesMap.get("NIFTY 50") ?? {}));

app.get("/api/health", (_req, res) => res.json({
  status: "healthy", connectedClients: clients.length,
  timestamp: new Date().toISOString(), uptime: process.uptime(),
  source, marketOpen: isMarketOpen(), indicesTracked: indicesMap.size,
}));

app.get("/api/clients", (_req, res) => res.json({
  count: clients.length,
  clients: clients.map(c => ({ id: c.id, connectedAt: new Date(c.id).toISOString() })),
}));

app.post("/api/send-event", (req, res) => {
  const { message, type = "info" } = req.body;
  if (!message) return res.status(400).json({ error: "Message is required" });
  const event = { type, message, timestamp: new Date().toISOString(), id: Date.now() };
  broadcast(event);
  res.json({ success: true, clientsNotified: clients.length, event });
});

app.get("/", (_req, res) => res.json({
  message: "NSE Indices SSE Server", source, marketOpen: isMarketOpen(),
  indicesTracked: indicesMap.size,
  endpoints: { events: "/api/events (SSE)", indices: "/api/indices", health: "/api/health", clients: "/api/clients", sendEvent: "/api/send-event (POST)" },
}));

app.use((err, _req, res, _next) => { console.error("Server error:", err); res.status(500).json({ error: "Internal server error" }); });

// ── Start ─────────────────────────────────────────────────────────────────────

app.listen(PORT, "0.0.0.0", async () => {
  console.log("=================================");
  console.log("🚀 NSE Indices SSE Server");
  console.log(`📡 Port: ${PORT}  |  Tracking: ${TRACKED.length} indices`);
  console.log("=================================");

  // Initial load — try NSE → Yahoo → stay on seeds
  try {
    const changed = await refreshFromNse();
    source = "nse";
    console.log(`✅ NSE live: ${changed.length} indices loaded`);
  } catch {
    try {
      const changed = await refreshFromYahoo();
      source = "yahoo";
      console.log(`📡 Yahoo fallback: ${changed.length} indices loaded`);
    } catch {
      console.log("⚠️  Both APIs unavailable — running simulation");
    }
  }

  console.log(`📈 Market ${isMarketOpen() ? "OPEN" : "CLOSED"} | Source: ${source}`);
  console.log("=================================");

  // 3-second tick during market hours; 5s when closed
  const schedule = () => setTimeout(async () => { await tick(); schedule(); }, isMarketOpen() ? 3000 : 5000);
  schedule();
});
