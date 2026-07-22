import React, { useState, useEffect, useRef } from "react";
import { Crown, ShieldCheck, Users, Sparkles, UploadCloud, CheckCircle2, ArrowRight, Copy, Check } from "lucide-react";

// ---------- design tokens ----------
const C = {
  bg: "#0B1712",
  surface: "#10231B",
  surface2: "#16301F",
  line: "#22392C",
  gold: "#E8B94D",
  goldDeep: "#C89A3C",
  thorn: "#5C8A4D",
  text: "#F3EFE3",
  textDim: "#9FAE9E",
  danger: "#C1553A",
};

const PHONE = "0998324287";
const PRICE = 67;

// ---------- zigzag "thorn" edge, used as this design's signature motif ----------
function ThornEdge({ flip, color = C.gold }) {
  return (
    <svg
      viewBox="0 0 100 10"
      preserveAspectRatio="none"
      style={{
        display: "block",
        width: "100%",
        height: 10,
        transform: flip ? "rotate(180deg)" : "none",
      }}
    >
      <polygon
        points="0,10 7,0 14,10 21,0 28,10 35,0 42,10 49,0 56,10 63,0 70,10 77,0 84,10 91,0 98,10 100,10 100,10 0,10"
        fill={color}
      />
    </svg>
  );
}

function SealCard({ children, style }) {
  return (
    <div style={{ ...style }}>
      <ThornEdge />
      <div style={{ background: `linear-gradient(180deg, ${C.gold}, ${C.goldDeep})`, padding: "18px 20px" }}>
        {children}
      </div>
      <ThornEdge flip />
    </div>
  );
}

function fmtId(n) {
  return `DUR-${String(n).padStart(4, "0")}`;
}

// ---------- storage helpers ----------
const hasSharedStorage = () => typeof window !== "undefined" && !!window.storage;

async function loadOrders() {
  try {
    if (hasSharedStorage()) {
      const res = await window.storage.get("orders", true);
      return res ? JSON.parse(res.value) : [];
    }
    return JSON.parse(localStorage.getItem("durian_orders") || "[]");
  } catch {
    return [];
  }
}
async function saveOrders(orders) {
  try {
    if (hasSharedStorage()) {
      await window.storage.set("orders", JSON.stringify(orders), true);
    } else {
      localStorage.setItem("durian_orders", JSON.stringify(orders));
    }
  } catch (e) {
    console.error("save orders failed", e);
  }
}
async function loadOwners() {
  try {
    if (hasSharedStorage()) {
      const res = await window.storage.get("owners", true);
      return res ? JSON.parse(res.value) : null;
    }
    const raw = localStorage.getItem("durian_owners");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
async function saveOwners(owners) {
  try {
    if (hasSharedStorage()) {
      await window.storage.set("owners", JSON.stringify(owners), true);
    } else {
      localStorage.setItem("durian_owners", JSON.stringify(owners));
    }
  } catch (e) {
    console.error("save owners failed", e);
  }
}

export default function App() {
  const [view, setView] = useState("home");
  const [orders, setOrders] = useState([]);
  const [owners, setOwners] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const o = await loadOrders();
      setOrders(o);
      let own = await loadOwners();
      if (!own) {
        own = [];
        await saveOwners(own);
      }
      setOwners(own);
      setLoading(false);
    })();
  }, []);

  const addOrder = async (order) => {
    const next = [...orders, order];
    setOrders(next);
    await saveOrders(next);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: `radial-gradient(1200px 600px at 50% -10%, #14261C 0%, ${C.bg} 55%)`,
        color: C.text,
        fontFamily: "'Sarabun', system-ui, sans-serif",
      }}
    >
      <style>{`
        .durian-h1, .durian-h2, .durian-h3, .durian-nav-brand { font-family: 'Kanit', 'Trebuchet MS', sans-serif; }
        .durian-mono { font-family: 'Courier New', monospace; }
        * { box-sizing: border-box; }
        button:focus-visible, a:focus-visible, input:focus-visible { outline: 2px solid ${C.gold}; outline-offset: 2px; }
        @media (prefers-reduced-motion: reduce) { * { transition: none !important; animation: none !important; } }
      `}</style>

      <Nav view={view} setView={setView} />

      <main style={{ maxWidth: 1040, margin: "0 auto", padding: "0 20px 80px" }}>
        {loading ? (
          <div style={{ padding: "80px 0", textAlign: "center", color: C.textDim }}>Loading...</div>
        ) : view === "home" ? (
          <Home setView={setView} owners={owners} />
        ) : view === "buy" ? (
          <Buy addOrder={addOrder} orderCount={orders.length} />
        ) : (
          <Owners owners={owners} />
        )}
      </main>

      <footer style={{ borderTop: `1px solid ${C.line}`, padding: "24px 20px", textAlign: "center", color: C.textDim, fontSize: 13 }}>
        DURIAN SURNAME · PromptPay payments are real bank transfers. The system does not auto-verify — please confirm receipt before delivering.
      </footer>
    </div>
  );
}

function Nav({ view, setView }) {
  const items = [
    { id: "home", label: "Home" },
    { id: "buy", label: "Buy" },
    { id: "owners", label: "Owners" },
  ];
  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 10,
        background: "rgba(11,23,18,0.85)",
        backdropFilter: "blur(6px)",
        borderBottom: `1px solid ${C.line}`,
      }}
    >
      <div style={{ maxWidth: 1040, margin: "0 auto", padding: "14px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div
          className="durian-nav-brand"
          onClick={() => setView("home")}
          style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: 8, fontWeight: 700, fontSize: 20, color: C.gold }}
        >
          <span style={{ fontSize: 22 }}>🍈</span> DURIAN
        </div>
        <nav style={{ display: "flex", gap: 4 }}>
          {items.map((it) => (
            <button
              key={it.id}
              onClick={() => setView(it.id)}
              style={{
                background: view === it.id ? C.surface2 : "transparent",
                color: view === it.id ? C.gold : C.textDim,
                border: "none",
                borderRadius: 8,
                padding: "8px 14px",
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              {it.label}
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
}

function Home({ setView, owners }) {
  return (
    <div>
      <section style={{ display: "grid", gridTemplateColumns: "1fr", gap: 40, paddingTop: 56, alignItems: "center" }} className="md:grid-cols-2">
        <div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, color: C.thorn, fontSize: 13, fontWeight: 600, marginBottom: 14 }}>
            <Sparkles size={16} /> Permanent item · yours forever
          </div>
          <h1 className="durian-h1" style={{ fontSize: 52, lineHeight: 1.05, margin: 0, fontWeight: 800, color: C.text }}>
            <span style={{ color: C.gold }}>DURIAN</span>
          </h1>
          <h2 className="durian-h2" style={{ fontSize: 14, fontWeight: 600, color: C.thorn, margin: "8px 0 18px", letterSpacing: 0.5 }}>
            by Kill Durian
          </h2>
          <p style={{ color: C.textDim, fontSize: 15, lineHeight: 1.7, maxWidth: 440 }}>
            1 in Durian
          </p>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8, margin: "22px 0" }}>
            <span className="durian-h1" style={{ fontSize: 34, fontWeight: 800, color: C.gold }}>
              {PRICE}
            </span>
            <span style={{ color: C.textDim, fontSize: 14 }}>THB / lifetime</span>
          </div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <button
              onClick={() => setView("buy")}
              style={{
                background: C.gold,
                color: "#1A1207",
                border: "none",
                borderRadius: 10,
                padding: "14px 22px",
                fontWeight: 700,
                fontSize: 15,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              Claim the surname <ArrowRight size={17} />
            </button>
            <button
              onClick={() => setView("owners")}
              style={{
                background: "transparent",
                color: C.text,
                border: `1px solid ${C.line}`,
                borderRadius: 10,
                padding: "14px 22px",
                fontWeight: 600,
                fontSize: 15,
                cursor: "pointer",
              }}
            >
              View owners
            </button>
          </div>
        </div>

        <SealCard style={{ maxWidth: 340, justifySelf: "center" }}>
          <div style={{ textAlign: "center", color: "#1A1207" }}>
            <div style={{ fontSize: 12, letterSpacing: 2, fontWeight: 700, opacity: 0.75 }}>OWNERSHIP SEAL</div>
            <div className="durian-h1" style={{ fontSize: 38, fontWeight: 800, margin: "6px 0 2px" }}>
              🍈 DURIAN
            </div>
            <div style={{ fontSize: 11, fontWeight: 600, opacity: 0.8, marginBottom: 14 }}>by Kill Durian</div>
            <div className="durian-mono" style={{ fontSize: 12, background: "rgba(26,18,7,0.15)", borderRadius: 6, padding: "6px 10px", display: "inline-block" }}>
              Certificate #0000
            </div>
          </div>
        </SealCard>
      </section>

      <section style={{ marginTop: 90, display: "grid", gridTemplateColumns: "1fr", gap: 16 }} className="md:grid-cols-3">
        <Feature icon={<Crown size={20} />} title="Lifetime" desc="Buy once, keep it forever" />
        <Feature icon={<ShieldCheck size={20} />} title="Verified" desc="Owner list is public on this site" />
        <Feature icon={<Users size={20} />} title="Real player community" desc={`${owners.length} owners so far`} />
      </section>
    </div>
  );
}

function Feature({ icon, title, desc }) {
  return (
    <div style={{ background: C.surface, border: `1px solid ${C.line}`, borderRadius: 14, padding: 20 }}>
      <div style={{ color: C.gold, marginBottom: 10 }}>{icon}</div>
      <div className="durian-h3" style={{ fontWeight: 700, fontSize: 16, marginBottom: 6 }}>{title}</div>
      <div style={{ color: C.textDim, fontSize: 14, lineHeight: 1.6 }}>{desc}</div>
    </div>
  );
}

function Buy({ addOrder, orderCount }) {
  const [step, setStep] = useState("form"); // form -> pay -> done
  const [username, setUsername] = useState("");
  const [slip, setSlip] = useState(null);
  const [slipName, setSlipName] = useState("");
  const [copied, setCopied] = useState(false);
  const [order, setOrder] = useState(null);
  const fileRef = useRef(null);

  const canSubmit = username.trim();

  const onFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setSlipName(f.name);
    const reader = new FileReader();
    reader.onload = () => setSlip(reader.result);
    reader.readAsDataURL(f);
  };

  const goToPay = (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    const newOrder = {
      id: fmtId(orderCount + 1),
      username: username.trim(),
      amount: PRICE,
      createdAt: new Date().toISOString(),
      status: "pending",
    };
    setOrder(newOrder);
    setStep("pay");
  };

  const confirmPaid = async () => {
    const finalOrder = { ...order, slip: slip || null, paidNotifiedAt: new Date().toISOString() };
    await addOrder(finalOrder);
    setOrder(finalOrder);
    setStep("done");
  };

  const copyId = () => {
    navigator.clipboard?.writeText(order?.id || "");
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const qrUrl = order ? `https://promptpay.io/${PHONE}/${order.amount}.png` : "";

  return (
    <div style={{ paddingTop: 40, maxWidth: 480, margin: "0 auto" }}>
      <h2 className="durian-h1" style={{ fontSize: 28, fontWeight: 800, marginBottom: 4 }}>Claim the surname</h2>
      <p style={{ color: C.textDim, fontSize: 14, marginBottom: 28 }}>Price {PRICE} THB · Pay via PromptPay</p>

      {step === "form" && (
        <form onSubmit={goToPay} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Field label="Name">
            <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="e.g. Shadow99" style={inputStyle} required />
          </Field>
          <button
            type="submit"
            disabled={!canSubmit}
            style={{
              marginTop: 10,
              background: canSubmit ? C.gold : C.surface2,
              color: canSubmit ? "#1A1207" : C.textDim,
              border: "none",
              borderRadius: 10,
              padding: "14px 20px",
              fontWeight: 700,
              fontSize: 15,
              cursor: canSubmit ? "pointer" : "not-allowed",
            }}
          >
            Continue to payment
          </button>
        </form>
      )}

      {step === "pay" && order && (
        <div>
          <div style={{ background: C.surface, border: `1px solid ${C.line}`, borderRadius: 14, padding: 22, textAlign: "center" }}>
            <div style={{ fontSize: 13, color: C.textDim, marginBottom: 4 }}>Scan with your banking app to pay</div>
            <img
              src={qrUrl}
              alt={`PromptPay QR to pay ${order.amount} THB`}
              style={{ width: 220, height: 220, margin: "12px auto", borderRadius: 10, background: "#fff", padding: 8 }}
              onError={(e) => { e.target.style.display = "none"; }}
            />
            <div className="durian-h1" style={{ fontSize: 26, fontWeight: 800, color: C.gold }}>{order.amount.toFixed(2)} THB</div>
            <div style={{ color: C.textDim, fontSize: 13, marginTop: 4 }}>PromptPay: {PHONE}</div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 10 }}>
              <span className="durian-mono" style={{ fontSize: 13, color: C.text }}>Order ID {order.id}</span>
              <button onClick={copyId} style={{ background: "none", border: "none", color: C.gold, cursor: "pointer", display: "flex" }} aria-label="Copy order ID">
                {copied ? <Check size={14} /> : <Copy size={14} />}
              </button>
            </div>
          </div>

          <div style={{ marginTop: 18 }}>
            <label style={labelStyle}>Attach payment slip (optional)</label>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                border: `1px dashed ${C.line}`,
                borderRadius: 10,
                padding: "14px",
                background: C.surface,
                color: C.textDim,
                cursor: "pointer",
                fontSize: 14,
              }}
            >
              <UploadCloud size={17} /> {slipName || "Choose slip image"}
            </button>
            <input ref={fileRef} type="file" accept="image/*" onChange={onFile} style={{ display: "none" }} />
          </div>

          <button
            onClick={confirmPaid}
            style={{
              marginTop: 18,
              width: "100%",
              background: C.gold,
              color: "#1A1207",
              border: "none",
              borderRadius: 10,
              padding: "14px 20px",
              fontWeight: 700,
              fontSize: 15,
              cursor: "pointer",
            }}
          >
            I've paid
          </button>
          <p style={{ color: C.textDim, fontSize: 12, marginTop: 10, textAlign: "center" }}>
            Payment is not verified automatically — please message the team on Discord with your order ID to confirm.
          </p>
        </div>
      )}

      {step === "done" && order && (
        <div style={{ textAlign: "center", padding: "20px 0" }}>
          <CheckCircle2 size={44} color={C.gold} style={{ marginBottom: 10 }} />
          <div className="durian-h2" style={{ fontSize: 20, fontWeight: 700 }}>Order submitted</div>
          <p style={{ color: C.textDim, fontSize: 14, marginTop: 6 }}>
            Order ID <span className="durian-mono" style={{ color: C.gold }}>{order.id}</span> · Status: pending verification
          </p>
          <p style={{ color: C.textDim, fontSize: 13, marginTop: 10 }}>The team will confirm and grant your surname via Discord</p>
        </div>
      )}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      {children}
    </div>
  );
}

const labelStyle = { display: "block", fontSize: 13, color: C.textDim, marginBottom: 6, fontWeight: 600 };
const inputStyle = {
  width: "100%",
  background: C.surface,
  border: `1px solid ${C.line}`,
  borderRadius: 10,
  padding: "12px 14px",
  color: C.text,
  fontSize: 14,
  fontFamily: "'Sarabun', sans-serif",
};

function Owners({ owners }) {
  return (
    <div style={{ paddingTop: 40 }}>
      <h2 className="durian-h1" style={{ fontSize: 28, fontWeight: 800, marginBottom: 4 }}>Owners list</h2>
      <p style={{ color: C.textDim, fontSize: 14, marginBottom: 28 }}>Total {owners.length} owners</p>
      {owners.length === 0 && (
        <div style={{ color: C.textDim, fontSize: 14, padding: "20px 0" }}>No owners yet.</div>
      )}
      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 14 }} className="sm:grid-cols-2">
        {owners.map((name, i) => (
          <div
            key={i}
            style={{
              background: C.surface,
              border: `1px solid ${C.line}`,
              borderRadius: 12,
              padding: "16px 18px",
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: "50%",
                background: C.gold,
                color: "#1A1207",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 800,
                fontSize: 13,
              }}
              className="durian-mono"
            >
              {i + 1}
            </div>
            <div style={{ fontWeight: 700, fontSize: 15 }}>{name}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
