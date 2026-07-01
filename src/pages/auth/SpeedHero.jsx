/* Dark-theme hero — all colors from Speed Innovations logo (#482C80 purple, #2DBAD5→#10A48A teal) */

const PURPLE = '#482C80';   // logo violet
const TEAL   = '#2DBAD5';   // logo teal-cyan
const GREEN  = '#10A48A';   // logo teal-green

/* Purple-to-teal gradient used on buttons + active chip */
const btnGradient = `linear-gradient(90deg, ${PURPLE} 0%, ${GREEN} 100%)`;

const glass = {
  padding: 11,
  borderRadius: 22,
  background: 'rgba(55,28,100,0.45)',
  border: `1px solid rgba(45,186,213,0.28)`,
  boxShadow: `0 26px 60px -20px rgba(20,8,50,0.75), inset 0 1px 0 rgba(45,186,213,0.12)`,
  backdropFilter: 'blur(10px)',
};

function DarkCard({ w, children }) {
  return (
    <div style={{
      width: w, borderRadius: 15,
      background: 'linear-gradient(158deg,#1E0B35,#130B24)',
      color: '#EDE7F6', padding: '15px 16px',
    }}>{children}</div>
  );
}

function LightCard({ w, children }) {
  return (
    <div style={{
      width: w, borderRadius: 15,
      background: '#1A0D2E', color: '#EDE7F6',
      border: `1px solid rgba(45,186,213,0.15)`,
      padding: '15px 16px',
    }}>{children}</div>
  );
}

function Btn({ children }) {
  return (
    <button style={{
      width: '100%', height: 34, marginTop: 13, borderRadius: 9,
      background: PURPLE, color: '#fff',
      fontSize: 12.5, fontWeight: 700, fontFamily: 'inherit', border: 'none', cursor: 'default',
    }}>{children}</button>
  );
}

function FloatWrap({ ax, ay, anim, delay, dur, rot, children }) {
  return (
    <div style={{ position: 'absolute', left: ax, top: ay, animation: `${anim} ${dur}s ease-in-out ${delay}s infinite` }}>
      <div style={{ transform: `rotate(${rot})` }}>{children}</div>
    </div>
  );
}

export default function SpeedHero() {
  return (
    <div style={{
      position: 'relative', width: 780, height: 1000, overflow: 'hidden', borderRadius: 28,
      background: `radial-gradient(120% 90% at 35% 8%, #1E0935 0%, #0E1428 52%, #081B24 100%)`,
      fontFamily: '"Hanken Grotesk",system-ui,sans-serif',
    }}>

      {/* Dual glow: purple centre + teal accent */}
      <div style={{ position:'absolute', left:'38%', top:'42%', width:480, height:580,
        transform:'translate(-50%,-50%)',
        background:`radial-gradient(closest-side, color-mix(in srgb,${PURPLE} 30%, transparent), transparent 72%)`,
        filter:'blur(16px)', opacity:0.6,
      }}/>
      <div style={{ position:'absolute', right:'-5%', top:'55%', width:300, height:340,
        background:`radial-gradient(closest-side, color-mix(in srgb,${TEAL} 25%, transparent), transparent 72%)`,
        filter:'blur(18px)', opacity:0.45,
      }}/>

      {/* ── Card A — Overview ── */}
      <FloatWrap ax={4} ay={62} anim="floaty" dur={7.5} delay={0} rot="-5deg">
        <div style={glass}>
          <DarkCard w={238}>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:13 }}>
              <div style={{ width:22,height:22,borderRadius:7,background:btnGradient,display:'flex',alignItems:'center',justifyContent:'center' }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 5H8a4 4 0 0 0 0 8h8a4 4 0 0 1 0 8H6"/>
                </svg>
              </div>
              <span style={{ fontSize:13, fontWeight:800, letterSpacing:'0.05em' }}>SPEED</span>
              <span style={{ fontSize:11, color:'#A99BC2', fontWeight:500 }}>Overview</span>
              <span style={{ flex:1 }}/>
              <span style={{ fontSize:9, fontWeight:700, color:TEAL, background:`rgba(45,186,213,0.15)`, borderRadius:20, padding:'3px 7px' }}>LIVE</span>
            </div>
            <div style={{ fontSize:29, fontWeight:800, letterSpacing:'-0.02em', background:btnGradient, WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>₹64.2L</div>
            <div style={{ fontSize:11, color:'#A99BC2', marginBottom:12 }}>Value this month</div>
            {[
              { icon:<path d="M2 4h2l2.2 11.2a1 1 0 0 0 1 .8h9.4a1 1 0 0 0 1-.8L19 7H5"/>, label:'Open Purchase Orders', val:20 },
              { icon:<path d="M3 21h18M7 21v-7M12 21V8M17 21v-11"/>, label:'Open Sales Orders', val:15 },
            ].map(r => (
              <div key={r.label} style={{ display:'flex', alignItems:'center', gap:9, marginBottom:9 }}>
                <span style={{ width:26,height:26,borderRadius:7,background:`rgba(72,44,128,0.35)`,display:'flex',alignItems:'center',justifyContent:'center' }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={TEAL} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">{r.icon}</svg>
                </span>
                <span style={{ fontSize:12, fontWeight:600, flex:1 }}>{r.label}</span>
                <span style={{ fontSize:12.5, fontWeight:700, color:TEAL }}>{r.val}</span>
              </div>
            ))}
            <Btn>View report</Btn>
          </DarkCard>
        </div>
      </FloatWrap>

      {/* ── Card B — Goods Receipt ── */}
      <FloatWrap ax={430} ay={46} anim="floaty2" dur={8.5} delay={-1.5} rot="4deg">
        <div style={glass}>
          <DarkCard w={300}>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:13 }}>
              <span style={{ fontSize:12.5, fontWeight:800, letterSpacing:'0.05em', background:btnGradient, WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>SPEED</span>
              <span style={{ fontSize:11, color:'#A99BC2', fontWeight:500 }}>Goods Receipt</span>
              <span style={{ flex:1 }}/>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8A7BA6" strokeWidth="2" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
            </div>
            {[
              { icon:<path d="M20 6 9 17l-5-5"/>, iconColor:GREEN, label:'PO-0242 · Delta Logistics', badge:'Received', badgeColor:GREEN, bg:'rgba(255,255,255,0.04)', border:'none' },
              { icon:<circle cx="12" cy="12" r="9"/>, iconColor:TEAL, label:'PO-0233 · Pioneer Tools', badge:'40%', badgeColor:TEAL, bg:'rgba(255,255,255,0.04)', border:'none' },
              { icon:<><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2z"/><path d="M12 8v4l3 2"/></>, iconColor:TEAL, label:'Warehouse B · Bay 4', badge:'', badgeColor:'', bg:`rgba(72,44,128,0.3)`, border:`1px solid rgba(45,186,213,0.3)` },
            ].map(r => (
              <div key={r.label} style={{ display:'flex', alignItems:'center', gap:9, background:r.bg, border:r.border, borderRadius:9, padding:'8px 10px', marginBottom:8 }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={r.iconColor} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">{r.icon}</svg>
                <span style={{ fontSize:12, fontWeight:600, flex:1 }}>{r.label}</span>
                {r.badge && <span style={{ fontSize:11, color:r.badgeColor, fontWeight:700 }}>{r.badge}</span>}
              </div>
            ))}
            <Btn>Confirm receipt</Btn>
          </DarkCard>
        </div>
      </FloatWrap>

      {/* ── Nav chip bar ── */}
      <FloatWrap ax={252} ay={392} anim="floaty2" dur={6.5} delay={-0.8} rot="0deg">
        <div style={{ display:'flex', alignItems:'center', gap:6, padding:'9px 11px', borderRadius:20, ...glass }}>
          <span style={{ width:40,height:40,borderRadius:13,background:btnGradient,display:'flex',alignItems:'center',justifyContent:'center',boxShadow:`0 6px 18px -4px ${PURPLE}` }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.9" strokeLinecap="round"><path d="M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z"/></svg>
          </span>
          {[
            <path d="M2 4h2l2.2 11.2a1 1 0 0 0 1 .8h9.4a1 1 0 0 0 1-.8L19 7H5"/>,
            <path d="M3 7h18v4H3zM5 11v9h14v-9"/>,
            <path d="M3 7h15a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z"/>,
            <path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6"/>,
          ].map((p, i) => (
            <span key={i} style={{ width:40,height:40,borderRadius:13,background:'#1A0D2E',border:`1px solid rgba(45,186,213,0.2)`,display:'flex',alignItems:'center',justifyContent:'center' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={TEAL} strokeWidth="1.9" strokeLinecap="round">{p}</svg>
            </span>
          ))}
        </div>
      </FloatWrap>

      {/* ── Card C — Purchase Orders ── */}
      <FloatWrap ax={16} ay={548} anim="floaty" dur={8} delay={-2.2} rot="-4deg">
        <div style={glass}>
          <LightCard w={288}>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:13 }}>
              <span style={{ fontSize:14, fontWeight:800, letterSpacing:'-0.01em' }}>Purchase Orders</span>
              <span style={{ flex:1 }}/>
              <span style={{ fontSize:10, fontWeight:700, color:'#fff', background:btnGradient, borderRadius:20, minWidth:18, height:18, display:'flex', alignItems:'center', justifyContent:'center', padding:'0 6px' }}>8</span>
            </div>
            {[
              { name:'ABC Suppliers Ltd', po:'PO-0245 · ₹1.24L', badge:'Pending',  bc:'#C28A0E', bg:'rgba(194,138,14,0.15)' },
              { name:'Orbit Industries',  po:'PO-0244 · ₹4.12L', badge:'Approved', bc:GREEN,    bg:`rgba(16,164,138,0.15)` },
              { name:'Vertex Steel Co',   po:'PO-0238 · ₹6.78L', badge:'Pending',  bc:'#C28A0E', bg:'rgba(194,138,14,0.15)' },
            ].map(r => (
              <div key={r.po} style={{ display:'flex', alignItems:'center', gap:10, marginBottom:11 }}>
                <span style={{ width:30,height:30,borderRadius:8,background:`rgba(72,44,128,0.35)`,color:TEAL,display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'"JetBrains Mono",monospace',fontSize:9,fontWeight:600 }}>PO</span>
                <span style={{ flex:1, minWidth:0 }}>
                  <span style={{ display:'block', fontSize:12.5, fontWeight:600 }}>{r.name}</span>
                  <span style={{ display:'block', fontSize:11, color:'#A99BC2' }}>{r.po}</span>
                </span>
                <span style={{ fontSize:10, fontWeight:600, color:r.bc, background:r.bg, borderRadius:6, padding:'2px 7px' }}>{r.badge}</span>
              </div>
            ))}
            <Btn>Approve all</Btn>
          </LightCard>
        </div>
      </FloatWrap>

      {/* ── Card D — Action Center ── */}
      <FloatWrap ax={300} ay={600} anim="floaty2" dur={7} delay={-3} rot="3deg">
        <div style={glass}>
          <DarkCard w={244}>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:12 }}>
              <span style={{ fontSize:13, fontWeight:800 }}>Action Center</span>
              <span style={{ flex:1 }}/>
              <span style={{ fontSize:9, fontWeight:700, color:'#F0A98A', background:'rgba(192,67,47,0.2)', borderRadius:20, padding:'3px 7px' }}>2 due</span>
            </div>
            {[
              { dot:'#E06A4E', title:'Approve PO #PO-0245',      sub:'ABC Suppliers · ₹1.24L', when:'Today',  wc:'#F0A98A' },
              { dot:'#D9A233', title:'Review Quotation #SQ-0089', sub:'Metro Retail · ₹2.87L',  when:'Tmrw',   wc:'#A99BC2' },
              { dot:GREEN,     title:'GRN for PO #PO-0231',       sub:'Delta Logistics',          when:'Jun 27', wc:'#A99BC2' },
            ].map(r => (
              <div key={r.title} style={{ display:'flex', alignItems:'flex-start', gap:9, marginBottom:10 }}>
                <span style={{ width:7, height:7, borderRadius:'50%', background:r.dot, marginTop:5, flexShrink:0 }}/>
                <span style={{ flex:1 }}>
                  <span style={{ display:'block', fontSize:12, fontWeight:600 }}>{r.title}</span>
                  <span style={{ display:'block', fontSize:10.5, color:'#A99BC2' }}>{r.sub}</span>
                </span>
                <span style={{ fontSize:10, fontWeight:600, color:r.wc }}>{r.when}</span>
              </div>
            ))}
          </DarkCard>
        </div>
      </FloatWrap>

      {/* ── Card E — Inventory ── */}
      <FloatWrap ax={560} ay={552} anim="floaty" dur={7.8} delay={-1.1} rot="5deg">
        <div style={glass}>
          <LightCard w={212}>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:13 }}>
              <span style={{ fontSize:13, fontWeight:800 }}>Inventory</span>
              <span style={{ flex:1 }}/>
              <span style={{ fontSize:10, fontWeight:700, color:'#F0A98A', background:'rgba(192,67,47,0.18)', borderRadius:20, padding:'3px 7px' }}>4 low</span>
            </div>
            {[
              { label:'Steel Pipe 32mm',   val:'18/50',   pct:36, color:'#D4A520' },
              { label:'Ball Bearing 6204', val:'6/40',    pct:15, color:'#E06A4E' },
              { label:'Copper Cable 4sq',  val:'120/200', pct:60, color:TEAL },
            ].map(r => (
              <div key={r.label} style={{ marginBottom:12 }}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5 }}>
                  <span style={{ fontSize:11.5, fontWeight:600 }}>{r.label}</span>
                  <span style={{ fontSize:11, fontWeight:700, color:r.color }}>{r.val}</span>
                </div>
                <div style={{ height:6, borderRadius:6, background:'rgba(255,255,255,0.08)' }}>
                  <div style={{ height:'100%', width:`${r.pct}%`, borderRadius:6, background:r.color }}/>
                </div>
              </div>
            ))}
          </LightCard>
        </div>
      </FloatWrap>

      {/* ── Floating chips ── */}
      <div style={{ position:'absolute', left:6, top:300, width:48, height:48, borderRadius:14,
        background:btnGradient, display:'flex', alignItems:'center', justifyContent:'center',
        boxShadow:`0 14px 30px -10px ${PURPLE}`, animation:'chipf 5.5s ease-in-out 0s infinite' }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.9" strokeLinecap="round"><path d="M21 8 12 3 3 8v8l9 5 9-5V8zM3 8l9 5 9-5"/></svg>
      </div>
      <div style={{ position:'absolute', right:14, top:200, width:46, height:46, borderRadius:14,
        background:'#1A0D2E', border:`1px solid rgba(45,186,213,0.25)`, display:'flex', alignItems:'center', justifyContent:'center',
        boxShadow:`rgba(45,186,213,0.2) 0px 14px 30px -12px`, animation:'chipf 6.2s ease-in-out -1s infinite' }}>
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke={TEAL} strokeWidth="1.9" strokeLinecap="round"><path d="M3 7h18v4H3zM5 11v9h14v-9"/></svg>
      </div>
      <div style={{ position:'absolute', right:6, top:470, width:48, height:48, borderRadius:14,
        background:'#1A0D2E', border:`1px solid rgba(45,186,213,0.25)`, display:'flex', alignItems:'center', justifyContent:'center',
        boxShadow:`rgba(45,186,213,0.2) 0px 14px 30px -12px`, animation:'chipf 5.8s ease-in-out -2.2s infinite' }}>
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke={GREEN} strokeWidth="1.9" strokeLinecap="round"><path d="M3 7h15a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z"/></svg>
      </div>
      <div style={{ position:'absolute', left:160, top:24, width:44, height:44, borderRadius:13,
        background:'#1A0D2E', border:`1px solid rgba(45,186,213,0.25)`, display:'flex', alignItems:'center', justifyContent:'center',
        boxShadow:`rgba(45,186,213,0.2) 0px 14px 30px -12px`, animation:'chipf 5.2s ease-in-out -3s infinite' }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={TEAL} strokeWidth="1.9" strokeLinecap="round"><path d="M3 21h18M7 21v-7M12 21V8M17 21v-11"/></svg>
      </div>

    </div>
  );
}
