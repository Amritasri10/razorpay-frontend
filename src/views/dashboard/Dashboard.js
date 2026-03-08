import { useState, useEffect } from "react";
import {
  Users, Wallet, CreditCard, Clock,
  TrendingUp, Crown, Heart, BadgeCheck, ChevronRight,
  Activity, BarChart2, PieChart, Wifi, UserCheck, AlertCircle, RefreshCw
} from "lucide-react";
import { getRequest } from "../../Helpers"
// ── Palette ─────────────────────────────────────────────────────────────────
const C = {
  bg:      "#F5F7FF",
  surface: "#FFFFFF",
  border:  "#E8ECF8",
  text:    "#0F172A",
  muted:   "#64748B",
  subtle:  "#94A3B8",
  blue:    "#3B6FE8",
  indigo:  "#6366F1",
  emerald: "#10B981",
  amber:   "#F59E0B",
  rose:    "#F43F5E",
  cyan:    "#06B6D4",
};

const TYPE_CFG = {
  Premium:    { color: C.blue,    bg: "#EEF3FF", Icon: Crown      },
  Donation:   { color: C.rose,    bg: "#FFF0F3", Icon: Heart      },
  Membership: { color: C.emerald, bg: "#ECFDF5", Icon: BadgeCheck },
};

const STATUS_CFG = {
  paid:    { color: C.emerald, bg: "#ECFDF5", dot: "#10B981", label: "Paid"    },
  failed:  { color: C.rose,    bg: "#FFF0F3", dot: "#F43F5E", label: "Failed"  },
  created: { color: C.amber,   bg: "#FFFBEB", dot: "#F59E0B", label: "Pending" },
  pending: { color: C.amber,   bg: "#FFFBEB", dot: "#F59E0B", label: "Pending" },
};

// ── useCountUp ───────────────────────────────────────────────────────────────
function useCountUp(target, duration = 1500, start = false) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!start || !target) return;
    let t0 = null;
    const tick = (ts) => {
      if (!t0) t0 = ts;
      const p = Math.min((ts - t0) / duration, 1);
      setValue(Math.floor((1 - Math.pow(1 - p, 4)) * target));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [target, duration, start]);
  return value;
}

// ── Ripple ───────────────────────────────────────────────────────────────────
function useRipple(color = "rgba(59,111,232,0.15)") {
  const [ripples, setRipples] = useState([]);
  const trigger = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    const id = Date.now();
    setRipples(p => [...p, { id, x: e.clientX - r.left, y: e.clientY - r.top }]);
    setTimeout(() => setRipples(p => p.filter(rp => rp.id !== id)), 700);
  };
  const els = ripples.map(r => (
    <span key={r.id} style={{
      position: "absolute", left: r.x, top: r.y,
      width: 220, height: 220, marginLeft: -110, marginTop: -110,
      borderRadius: "50%", background: color,
      animation: "ripple .65s ease-out forwards", pointerEvents: "none",
    }} />
  ));
  return { trigger, els };
}

// ── Skeleton ─────────────────────────────────────────────────────────────────
const Skel = ({ w = "100%", h = 16, r = 8, mb = 0 }) => (
  <div style={{
    width: w, height: h, borderRadius: r, marginBottom: mb,
    background: "linear-gradient(90deg,#E8ECF8 25%,#F1F4FD 50%,#E8ECF8 75%)",
    backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite",
    flexShrink: 0,
  }} />
);

// ── Stat Card ─────────────────────────────────────────────────────────────────
function StatCard({ Icon, label, value, sub, color, accentBg, index, animate, isCurrency }) {
  const counted = useCountUp(typeof value === "number" ? value : 0, 1500, animate);
  const { trigger, els } = useRipple(`${color}22`);
  const display = isCurrency
    ? `₹${counted.toLocaleString("en-IN")}`
    : counted;

  return (
    <div
      onClick={trigger}
      style={{
        background: C.surface,
        border: `1.5px solid ${C.border}`,
        borderRadius: 14,
        padding: "16px 14px",
        position: "relative",
        overflow: "hidden",
        cursor: "pointer",
        boxShadow: "0 1px 4px rgba(15,23,42,0.05)",
        animation: `fadeUp .5s ${index * 0.07}s ease both`,
        transition: "transform .18s, box-shadow .18s",
        minWidth: 0, // prevents overflow in grid
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = "translateY(-3px)";
        e.currentTarget.style.boxShadow = `0 8px 24px ${color}1E`;
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = "";
        e.currentTarget.style.boxShadow = "0 1px 4px rgba(15,23,42,0.05)";
      }}
    >
      {/* glow blob */}
      <div style={{ position: "absolute", top: -35, right: -35, width: 100, height: 100, borderRadius: "50%", background: `radial-gradient(circle,${color}18 0%,transparent 70%)`, pointerEvents: "none" }} />
      {els}

      {/* icon + badge */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12, gap: 6 }}>
        <div style={{ width: 38, height: 38, borderRadius: 10, background: accentBg, display: "flex", alignItems: "center", justifyContent: "center", border: `1.5px solid ${color}20`, flexShrink: 0 }}>
          <Icon size={17} color={color} strokeWidth={2} />
        </div>
        {sub && (
          <span style={{ fontSize: 10, fontWeight: 600, color, background: accentBg, padding: "2px 7px", borderRadius: 20, border: `1px solid ${color}22`, whiteSpace: "nowrap", marginTop: 2 }}>
            {sub}
          </span>
        )}
      </div>

      {/* value */}
      <div style={{ fontSize: "clamp(20px,2.4vw,26px)", fontWeight: 800, color: C.text, lineHeight: 1, marginBottom: 5, wordBreak: "break-all" }}>
        {typeof value === "number" ? display : (value ?? "—")}
      </div>
      <div style={{ fontSize: 12, color: C.muted, fontWeight: 500, lineHeight: 1.3 }}>{label}</div>
    </div>
  );
}

// ── Donut Chart ───────────────────────────────────────────────────────────────
function DonutChart({ data }) {
  const [hov, setHov] = useState(null);
  const colors = [C.blue, C.rose, C.emerald];
  const total  = data.reduce((s, d) => s + d.totalAmount, 0);
  const R = 62, cx = 78, cy = 78, sw = 18, circ = 2 * Math.PI * R;
  let cum = 0;
  const segs = data.map((d, i) => {
    const pct = total > 0 ? d.totalAmount / total : 0;
    const seg = { ...d, dash: pct * circ, gap: circ - pct * circ, offset: -(cum * circ), color: colors[i] };
    cum += pct;
    return seg;
  });

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
      <svg width={156} height={156} viewBox="0 0 156 156" style={{ flexShrink: 0 }}>
        <circle cx={cx} cy={cy} r={R} fill="none" stroke={C.border} strokeWidth={sw} />
        {segs.map((s, i) => (
          <circle key={i} cx={cx} cy={cy} r={R} fill="none"
            stroke={s.color} strokeWidth={hov === i ? sw + 4 : sw}
            strokeDasharray={`${s.dash} ${s.gap}`} strokeDashoffset={s.offset}
            style={{ transition: "stroke-width .2s, filter .2s", filter: hov === i ? `drop-shadow(0 0 5px ${s.color}99)` : "none", cursor: "pointer", transformOrigin: `${cx}px ${cy}px`, transform: "rotate(-90deg)" }}
            onMouseEnter={() => setHov(i)} onMouseLeave={() => setHov(null)} />
        ))}
        <text x={cx} y={cy - 7} textAnchor="middle" fill={C.subtle} fontSize={9} fontWeight={600}>TOTAL</text>
        <text x={cx} y={cy + 10} textAnchor="middle" fill={C.text} fontSize={13} fontWeight={800}>
          ₹{(total / 1000).toFixed(1)}K
        </text>
      </svg>
      <div style={{ flex: 1, minWidth: 100 }}>
        {segs.map((s, i) => (
          <div key={i}
            onMouseEnter={() => setHov(i)} onMouseLeave={() => setHov(null)}
            style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 11, cursor: "pointer", opacity: hov === null || hov === i ? 1 : 0.35, transition: "opacity .2s" }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: s.color, flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 11, color: C.subtle, marginBottom: 1, truncate: "ellipsis" }}>{s._id}</div>
              <div style={{ fontSize: 13, color: C.text, fontWeight: 700 }}>₹{s.totalAmount.toLocaleString("en-IN")}</div>
            </div>
            <span style={{ fontSize: 11, fontWeight: 700, color: s.color, flexShrink: 0 }}>
              {total > 0 ? ((s.totalAmount / total) * 100).toFixed(0) : 0}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Bar Chart ─────────────────────────────────────────────────────────────────
function BarChartComp({ data }) {
  const [ready, setReady] = useState(false);
  useEffect(() => { const t = setTimeout(() => setReady(true), 250); return () => clearTimeout(t); }, []);
  const max = Math.max(...data.map(d => d.totalAmount), 1);
  const colors = [C.blue, C.rose, C.emerald];

  return (
    <div style={{ display: "flex", gap: 12, alignItems: "flex-end", height: 108, padding: "0 4px" }}>
      {data.map((d, i) => {
        const pct = d.totalAmount / max;
        const cfg = TYPE_CFG[d._id] || {};
        const BIcon = cfg.Icon;
        return (
          <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 5, minWidth: 0 }}>
            <span style={{ fontSize: 10, color: C.muted, fontWeight: 600, whiteSpace: "nowrap" }}>₹{(d.totalAmount / 1000).toFixed(1)}K</span>
            <div style={{ width: "100%", height: 78, display: "flex", alignItems: "flex-end" }}>
              <div style={{
                width: "100%", borderRadius: "5px 5px 0 0",
                height: ready ? `${pct * 100}%` : "0%",
                background: `linear-gradient(180deg,${colors[i]},${colors[i]}66)`,
                boxShadow: `0 -2px 10px ${colors[i]}44`,
                transition: "height 1.1s cubic-bezier(.34,1.56,.64,1)",
                position: "relative", overflow: "hidden",
              }}>
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg,rgba(255,255,255,0.22),transparent)", borderRadius: "5px 5px 0 0" }} />
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
              {BIcon && <BIcon size={11} color={colors[i]} />}
              <span style={{ fontSize: 9.5, color: colors[i], fontWeight: 700, whiteSpace: "nowrap" }}>{d._id}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Payment Status Bars ───────────────────────────────────────────────────────
function PaymentStatus({ stats }) {
  const [ready, setReady] = useState(false);
  useEffect(() => { const t = setTimeout(() => setReady(true), 350); return () => clearTimeout(t); }, []);
  const total = stats.totalPayments || 1;
  const rows = [
    { label: "Paid",    val: stats.paidPayments    ?? 0, color: C.emerald, Icon: BadgeCheck },
    { label: "Pending", val: stats.pendingPayments  ?? 0, color: C.amber,   Icon: Clock      },
    { label: "Others",  val: total - (stats.paidPayments ?? 0) - (stats.pendingPayments ?? 0), color: C.subtle, Icon: Activity },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {rows.map((r, i) => (
        <div key={i}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <r.Icon size={13} color={r.color} />
              <span style={{ fontSize: 12.5, color: C.text, fontWeight: 500 }}>{r.label}</span>
            </div>
            <span style={{ fontSize: 12, color: r.color, fontWeight: 700 }}>{r.val} / {total}</span>
          </div>
          <div style={{ height: 7, borderRadius: 99, background: C.border, overflow: "hidden" }}>
            <div style={{
              height: "100%", borderRadius: 99, background: r.color,
              width: ready ? `${(r.val / total) * 100}%` : "0%",
              boxShadow: `0 0 8px ${r.color}55`,
              transition: `width 1.2s ${i * 0.15}s cubic-bezier(.34,1.56,.64,1)`,
            }} />
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Error State ───────────────────────────────────────────────────────────────
function ErrorState({ onRetry }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "60px 20px", gap: 14 }}>
      <AlertCircle size={40} color={C.rose} />
      <div style={{ fontSize: 15, fontWeight: 700, color: C.text }}>Dashboard not found</div>
      {/* <div style={{ fontSize: 12.5, color: C.muted }}>Pl</div> */}
      <button onClick={onRetry} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 18px", borderRadius: 9, background: C.blue, border: "none", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>
        <RefreshCw size={13} /> 
      </button>
    </div>
  );
}

// ── Main Dashboard ────────────────────────────────────────────────────────────
export default function Dashboard() {
  const [stats,   setStats]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(false);
  const [animate, setAnimate] = useState(false);

  const fetchStats = async () => {
    setLoading(true);
    setError(false);
    setStats(null);
    setAnimate(false);
    try {
      const res = await getRequest("dashboard");
      setStats(res.data.data);
      setTimeout(() => setAnimate(true), 80);
    } catch (err) {
      console.error("Dashboard fetch error:", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStats(); }, []);

  // stat cards config — data real API se aata hai
  const cards = stats ? [
    { Icon: Users,      label: "Total Users",         value: stats.totalUsers,         sub: stats.activeUsers != null ? `${stats.activeUsers} Active` : null, color: C.blue,    accentBg: "#EEF3FF", isCurrency: false },
    { Icon: Wallet,     label: "Total Contributions", value: stats.totalContributions, sub: "All Time",    color: C.indigo,  accentBg: "#EEEEFF", isCurrency: true  },
    { Icon: CreditCard, label: "Total Payments",       value: stats.totalPayments,      sub: null,          color: C.cyan,    accentBg: "#ECFEFF", isCurrency: false },
    { Icon: BadgeCheck, label: "Paid Payments",         value: stats.paidPayments,       sub: "Completed",   color: C.emerald, accentBg: "#ECFDF5", isCurrency: false },
    { Icon: Clock,      label: "Pending Payments",     value: stats.pendingPayments,    sub: "Awaiting",    color: C.amber,   accentBg: "#FFFBEB", isCurrency: false },
  ] : [];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700;9..40,800&family=DM+Mono:wght@400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { background: ${C.bg}; }
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        @keyframes ripple  { 0%{transform:scale(0);opacity:1} 100%{transform:scale(1);opacity:0} }
        @keyframes fadeUp  { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        @keyframes blink   { 0%,100%{opacity:1} 50%{opacity:.35} }
        ::-webkit-scrollbar { width: 5px; height: 5px; }
        ::-webkit-scrollbar-track { background: ${C.bg}; }
        ::-webkit-scrollbar-thumb { background: ${C.border}; border-radius: 4px; }

        /* ── responsive card grid ── */
        .stat-grid {
          display: grid;
          gap: 12px;
          grid-template-columns: repeat(5, 1fr);   /* desktop: 5 in a row */
        }
        @media (max-width: 1100px) {
          .stat-grid { grid-template-columns: repeat(3, 1fr); }
        }
        @media (max-width: 680px) {
          .stat-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 360px) {
          .stat-grid { grid-template-columns: 1fr; }
        }

        /* ── chart grid ── */
        .chart-grid {
          display: grid;
          gap: 12px;
          grid-template-columns: repeat(3, 1fr);
        }
        @media (max-width: 960px) {
          .chart-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 600px) {
          .chart-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <div style={{ minHeight: "100vh", width: "100%", background: C.bg, fontFamily: "'DM Sans',sans-serif", color: C.text }}>

        {/* ── Sticky Header ── */}
        {/* <header style={{ background: C.surface, borderBottom: `1.5px solid ${C.border}`, position: "sticky", top: 0, zIndex: 50, boxShadow: "0 1px 6px rgba(15,23,42,0.06)" }}>
          <div style={{ width: "100%", padding: "0 clamp(14px,3vw,32px)", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
              <div style={{ width: 34, height: 34, borderRadius: 9, background: `linear-gradient(135deg,${C.blue},${C.indigo})`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 4px 12px ${C.blue}44` }}>
                <TrendingUp size={17} color="#fff" strokeWidth={2.5} />
              </div>
              <div>
                <div style={{ fontSize: "clamp(13px,2vw,16px)", fontWeight: 800, background: `linear-gradient(135deg,${C.blue},${C.indigo})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>SmartCollect</div>
                <div style={{ fontSize: 9.5, color: C.subtle, fontWeight: 500 }}>Admin Dashboard</div>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
              {!loading && !error && (
                <div style={{ display: "flex", alignItems: "center", gap: 5, padding: "3px 10px", background: "#ECFDF5", borderRadius: 20, border: `1px solid ${C.emerald}30` }}>
                  <Wifi size={11} color={C.emerald} />
                  <span style={{ fontSize: 10.5, color: C.emerald, fontWeight: 700 }}>Live</span>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: C.emerald, animation: "blink 2s infinite" }} />
                </div>
              )}
              <button onClick={fetchStats} title="Refresh"
                style={{ width: 30, height: 30, borderRadius: 8, border: `1.5px solid ${C.border}`, background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                <RefreshCw size={13} color={C.muted} />
              </button>
              <div style={{ padding: "4px 10px", background: C.bg, border: `1.5px solid ${C.border}`, borderRadius: 8, fontSize: 10.5, color: C.muted, fontWeight: 500, whiteSpace: "nowrap" }}>
                {new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
              </div>
            </div>
          </div>
        </header> */}

        {/* ── Main ── */}
        <main style={{ width: "100%", padding: "clamp(14px,3vw,28px) clamp(14px,3vw,32px) 40px" }}>

          {/* Page title */}
          <div style={{ marginBottom: 10 }}>
            <h1 style={{ fontSize: "clamp(15px,2.2vw,20px)", fontWeight: 800, color: C.text }}>Overview</h1>
            <p style={{ fontSize: 12, color: C.muted, marginTop: 3 }}>SmartCollect ka live dashboard — real-time data.</p>
          </div>

          {/* ── Error ── */}
          {error && <ErrorState onRetry={fetchStats} />}

          {/* ── Stat Cards ── */}
          {!error && (
            <div className="stat-grid" style={{ marginBottom: 14 }}>
              {loading
                ? [1,2,3,4,5].map(i => (
                    <div key={i} style={{ background: C.surface, borderRadius: 14, padding: 16, border: `1.5px solid ${C.border}` }}>
                      <Skel w={38} h={38} r={10} mb={12} />
                      <Skel w="52%" h={22} r={5} mb={8} />
                      <Skel w="70%" h={12} r={4} />
                    </div>
                  ))
                : cards.map((c, i) => <StatCard key={i} {...c} index={i} animate={animate} />)
              }
            </div>
          )}

          {/* ── Charts ── */}
          {!error && (
            <div className="chart-grid" style={{ marginBottom: 14 }}>

              {/* Donut */}
              <div style={{ background: C.surface, border: `1.5px solid ${C.border}`, borderRadius: 14, padding: 18, animation: "fadeUp .5s .2s ease both", boxShadow: "0 1px 4px rgba(15,23,42,0.04)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 14 }}>
                  <PieChart size={13} color={C.blue} />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>Contribution Breakdown</div>
                    <div style={{ fontSize: 10, color: C.subtle }}>By type — all time</div>
                  </div>
                </div>
                {loading
                  ? <div style={{ display: "flex", gap: 16, alignItems: "center" }}><Skel w={140} h={140} r="50%" /><div style={{ flex: 1 }}>{[1,2,3].map(i => <Skel key={i} h={13} r={4} mb={12} />)}</div></div>
                  : stats?.contributionsByType?.length
                    ? <DonutChart data={stats.contributionsByType} />
                    : <div style={{ fontSize: 12, color: C.subtle, padding: "20px 0" }}>Data not found.</div>
                }
              </div>

              {/* Bar */}
              <div style={{ background: C.surface, border: `1.5px solid ${C.border}`, borderRadius: 14, padding: 18, animation: "fadeUp .5s .3s ease both", boxShadow: "0 1px 4px rgba(15,23,42,0.04)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 28 }}>
                  <BarChart2 size={13} color={C.indigo} />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>Amount by Category</div>
                    <div style={{ fontSize: 10, color: C.subtle }}>₹ collected per type</div>
                  </div>
                </div>
                {loading
                  ? <Skel h={108} r={8} />
                  : stats?.contributionsByType?.length
                    ? <BarChartComp data={stats.contributionsByType} />
                    : <div style={{ fontSize: 12, color: C.subtle, padding: "20px 0" , }}>Data Not Found</div>
                }
              </div>

              {/* Status */}
              <div style={{ background: C.surface, border: `1.5px solid ${C.border}`, borderRadius: 14, padding: 18, animation: "fadeUp .5s .4s ease both", boxShadow: "0 1px 4px rgba(15,23,42,0.04)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 14 }}>
                  <Activity size={13} color={C.emerald} />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>Payment Status</div>
                    <div style={{ fontSize: 10, color: C.subtle }}>Count distribution</div>
                  </div>
                </div>
                {loading
                  ? <>{[1,2,3].map(i => <Skel key={i} h={16} r={6} mb={15} />)}</>
                  : stats ? <PaymentStatus stats={stats} /> : null
                }
              </div>
            </div>
          )}

          {/* ── Recent Payments ── */}
          {!error && (
            <div style={{ background: C.surface, border: `1.5px solid ${C.border}`, borderRadius: 14, overflow: "hidden", animation: "fadeUp .5s .5s ease both", boxShadow: "0 1px 4px rgba(15,23,42,0.04)" }}>
              {/* header */}
              <div style={{ padding: `14px clamp(12px,2.5vw,22px)`, borderBottom: `1.5px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                  <CreditCard size={13} color={C.blue} />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>Recent Payments</div>
                    <div style={{ fontSize: 10, color: C.subtle }}>Latest transactions</div>
                  </div>
                </div>
                <button style={{ display: "flex", alignItems: "center", gap: 4, padding: "5px 11px", borderRadius: 8, border: `1.5px solid ${C.border}`, background: C.bg, fontSize: 11, color: C.muted, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>
                  View All <ChevronRight size={11} />
                </button>
              </div>

              {/* table */}
              <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 440 }}>
                  <thead>
                    <tr style={{ background: C.bg }}>
                      {[
                        { label: "User",   Icon: UserCheck },
                        { label: "Type",   Icon: Crown     },
                        { label: "Amount", Icon: Wallet    },
                        { label: "Status", Icon: Activity  },
                        { label: "Date",   Icon: Clock     },
                      ].map(h => (
                        <th key={h.label} style={{ padding: `9px clamp(9px,1.8vw,18px)`, textAlign: "left", borderBottom: `1.5px solid ${C.border}` }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                            <h.Icon size={10} color={C.subtle} />
                            <span style={{ fontSize: 9.5, color: C.subtle, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em" }}>{h.label}</span>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {loading
                      ? [1,2,3,4,5].map(i => (
                          <tr key={i}><td colSpan={5} style={{ padding: `12px clamp(9px,1.8vw,18px)` }}><Skel h={14} r={4} /></td></tr>
                        ))
                      : (stats?.recentPayments ?? []).map((p, idx) => {
                          const sc  = STATUS_CFG[p.status]          || STATUS_CFG.created;
                          const tc  = TYPE_CFG[p.contributeType]    || { color: C.muted, bg: C.bg, Icon: CreditCard };
                          return (
                            <tr key={p._id}
                              style={{ borderBottom: `1px solid ${C.border}`, transition: "background .12s", animation: `fadeUp .4s ${idx * 0.05 + 0.1}s ease both` }}
                              onMouseEnter={e => e.currentTarget.style.background = C.bg}
                              onMouseLeave={e => e.currentTarget.style.background = "transparent"}>

                              {/* User */}
                              <td style={{ padding: `11px clamp(9px,1.8vw,18px)` }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                  <div style={{ width: 30, height: 30, borderRadius: "50%", background: `linear-gradient(135deg,${tc.color}22,${tc.color}0a)`, border: `1.5px solid ${tc.color}30`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11.5, fontWeight: 800, color: tc.color, flexShrink: 0 }}>
                                    {(p.user?.name ?? "?").trim()[0].toUpperCase()}
                                  </div>
                                  <div style={{ minWidth: 0 }}>
                                    <div style={{ fontSize: 12.5, fontWeight: 700, color: C.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{(p.user?.name ?? "—").trim()}</div>
                                    <div style={{ fontSize: 10, color: C.subtle, fontFamily: "'DM Mono',monospace", marginTop: 1 }}>{p.user?.phone ?? "—"}</div>
                                  </div>
                                </div>
                              </td>

                              {/* Type */}
                              <td style={{ padding: `11px clamp(9px,1.8vw,18px)` }}>
                                <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 10.5, color: tc.color, background: tc.bg, padding: "3px 8px", borderRadius: 20, fontWeight: 600, border: `1px solid ${tc.color}25`, whiteSpace: "nowrap" }}>
                                  <tc.Icon size={10} />
                                  {p.contributeType ?? "—"}
                                </span>
                              </td>

                              {/* Amount */}
                              <td style={{ padding: `11px clamp(9px,1.8vw,18px)` }}>
                                <span style={{ fontSize: 13, fontWeight: 800, color: C.text, fontFamily: "'DM Mono',monospace" }}>
                                  ₹{(p.amount ?? 0).toLocaleString("en-IN")}
                                </span>
                              </td>

                              {/* Status */}
                              <td style={{ padding: `11px clamp(9px,1.8vw,18px)` }}>
                                <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 10.5, color: sc.color, background: sc.bg, padding: "3px 8px", borderRadius: 20, fontWeight: 600, whiteSpace: "nowrap" }}>
                                  <span style={{ width: 5, height: 5, borderRadius: "50%", background: sc.dot, display: "inline-block" }} />
                                  {sc.label}
                                </span>
                              </td>

                              {/* Date */}
                              <td style={{ padding: `11px clamp(9px,1.8vw,18px)`, fontSize: 11, color: C.muted, whiteSpace: "nowrap" }}>
                                {p.createdAt ? new Date(p.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                              </td>
                            </tr>
                          );
                        })
                    }
                    {!loading && stats?.recentPayments?.length === 0 && (
                      <tr><td colSpan={5} style={{ padding: "28px 20px", textAlign: "center", fontSize: 13, color: C.subtle }}>Koi recent payment nahi mila.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* footer */}
              {!loading && stats && (
                <div style={{ padding: `10px clamp(12px,2.5vw,22px)`, borderTop: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
                  <span style={{ fontSize: 11, color: C.subtle }}>
                    Showing {stats.recentPayments?.length ?? 0} of {stats.totalPayments ?? 0} payments
                  </span>
                  <div style={{ display: "flex", gap: 5 }}>
                    {[C.blue, C.rose, C.emerald, C.amber].map((c, i) => (
                      <div key={i} style={{ width: 5, height: 5, borderRadius: "50%", background: c, opacity: i === 0 ? 1 : 0.3 }} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </>
  );
}