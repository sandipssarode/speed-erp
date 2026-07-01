/* SpeedHero — light lavender bg, cascade card layout matching reference */

const PURPLE = '#482C80';
const TEAL   = '#2DBAD5';
const GREEN  = '#10A48A';

const cardShadow = {
  borderRadius: 20,
  overflow: 'hidden',
  boxShadow: '0 12px 40px rgba(72,44,128,0.13), 0 2px 8px rgba(72,44,128,0.07)',
};

function DarkCard({ w, children }) {
  return (
    <div style={{
      width: w, borderRadius: 18,
      background: 'linear-gradient(148deg,#2D1B69 0%,#1C0F35 100%)',
      color: '#EDE7F6', padding: '14px 16px',
    }}>{children}</div>
  );
}

function LightCard({ w, children }) {
  return (
    <div style={{
      width: w, borderRadius: 18,
      background: '#fff', color: '#1C0F35',
      padding: '14px 16px',
    }}>{children}</div>
  );
}

function Btn({ children }) {
  return (
    <button style={{
      width: '100%', height: 34, marginTop: 12, borderRadius: 9,
      background: PURPLE, color: '#fff',
      fontSize: 12.5, fontWeight: 700, fontFamily: 'inherit', border: 'none', cursor: 'default',
    }}>{children}</button>
  );
}

function FloatCard({ ax, ay, rot, anim, dur, delay, shadow = true, children }) {
  return (
    <div style={{
      position: 'absolute', left: ax, top: ay,
      animation: `${anim} ${dur}s ease-in-out ${delay}s infinite`,
    }}>
      <div style={{ transform: `rotate(${rot})`, ...(shadow ? cardShadow : {}) }}>
        {children}
      </div>
    </div>
  );
}

export default function SpeedHero() {
  return (
    <div style={{
      position: 'relative', width: 780, height: 1000, overflow: 'hidden', borderRadius: 28,
      background: 'radial-gradient(130% 110% at 30% 5%, #f5f0ff 0%, #ebe3fd 55%, #e2d9fb 100%)',
      fontFamily: '"Hanken Grotesk",system-ui,sans-serif',
    }}>

      {/* Subtle decorative orbs */}
      <div style={{ position:'absolute', left:'15%', top:'20%', width:320, height:320,
        borderRadius:'50%', background:`radial-gradient(closest-side, rgba(72,44,128,0.08), transparent)`,
        filter:'blur(30px)',
      }}/>
      <div style={{ position:'absolute', right:'5%', top:'55%', width:240, height:240,
        borderRadius:'50%', background:`radial-gradient(closest-side, rgba(45,186,213,0.1), transparent)`,
        filter:'blur(24px)',
      }}/>

      {/* ── Card A — Overview (dark, top-left) ── */}
      <FloatCard ax={10} ay={45} rot="-6deg" anim="floaty" dur={7.5} delay={0}>
        <DarkCard w={248}>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:12 }}>
            <div style={{ width:22,height:22,borderRadius:7,background:PURPLE,display:'flex',alignItems:'center',justifyContent:'center' }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 5H8a4 4 0 0 0 0 8h8a4 4 0 0 1 0 8H6"/>
              </svg>
            </div>
            <span style={{ fontSize:12.5, fontWeight:800, letterSpacing:'0.05em' }}>SPEED</span>
            <span style={{ fontSize:11, color:'#B39DDB', fontWeight:500 }}>Overview</span>
            <span style={{ flex:1 }}/>
            <span style={{ fontSize:9, fontWeight:700, color:TEAL, background:'rgba(45,186,213,0.18)', borderRadius:20, padding:'3px 7px' }}>LIVE</span>
          </div>
          <div style={{ fontSize:30, fontWeight:900, letterSpacing:'-0.02em', color:'#fff', marginBottom:2 }}>₹64.2L</div>
          <div style={{ fontSize:11, color:'#9E8CC8', marginBottom:12 }}>Value this month</div>
          {[
            { icon:<path d="M2 4h2l2.2 11.2a1 1 0 0 0 1 .8h9.4a1 1 0 0 0 1-.8L19 7H5"/>, label:'Open Purchase Orders', val:20 },
            { icon:<path d="M3 21h18M7 21v-7M12 21V8M17 21v-11"/>, label:'Open Sales Orders', val:15 },
          ].map(r => (
            <div key={r.label} style={{ display:'flex', alignItems:'center', gap:9, marginBottom:8 }}>
              <span style={{ width:26,height:26,borderRadius:7,background:'rgba(255,255,255,0.08)',display:'flex',alignItems:'center',justifyContent:'center' }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#B39DDB" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">{r.icon}</svg>
              </span>
              <span style={{ fontSize:11.5, fontWeight:500, flex:1, color:'#C5B8E8' }}>{r.label}</span>
              <span style={{ fontSize:13, fontWeight:700, color:'#fff' }}>{r.val}</span>
            </div>
          ))}
          <Btn>View report</Btn>
        </DarkCard>
      </FloatCard>

      {/* ── Card B — Goods Receipt (dark, top-right cluster) ── */}
      <FloatCard ax={230} ay={145} rot="4deg" anim="floaty2" dur={8.5} delay={-1.5}>
        <DarkCard w={282}>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:12 }}>
            <span style={{ fontSize:12.5, fontWeight:800, letterSpacing:'0.05em', color:'#fff' }}>SPEED</span>
            <span style={{ fontSize:11, color:'#B39DDB', fontWeight:500 }}>Goods Receipt</span>
            <span style={{ flex:1 }}/>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#7B6A9A" strokeWidth="2" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
          </div>
          {[
            { icon:<path d="M20 6 9 17l-5-5"/>, iconColor:GREEN, label:'PO-0242 · Delta Logistics', badge:'Received', badgeColor:GREEN, bg:'rgba(255,255,255,0.05)', border:'none' },
            { icon:<circle cx="12" cy="12" r="9"/>, iconColor:TEAL, label:'PO-0233 · Pioneer Tools', badge:'40%', badgeColor:TEAL, bg:'rgba(255,255,255,0.05)', border:'none' },
            { icon:<><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2z"/><path d="M12 8v4l3 2"/></>, iconColor:'#B39DDB', label:'Warehouse B · Bay 4', badge:'', badgeColor:'', bg:'rgba(255,255,255,0.05)', border:'none' },
          ].map(r => (
            <div key={r.label} style={{ display:'flex', alignItems:'center', gap:9, background:r.bg, border:r.border, borderRadius:9, padding:'8px 10px', marginBottom:7 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={r.iconColor} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">{r.icon}</svg>
              <span style={{ fontSize:11.5, fontWeight:500, flex:1, color:'#D5CAF0' }}>{r.label}</span>
              {r.badge && <span style={{ fontSize:11, color:r.badgeColor, fontWeight:700 }}>{r.badge}</span>}
            </div>
          ))}
          <Btn>Confirm receipt</Btn>
        </DarkCard>
      </FloatCard>

      {/* ── Card C — Action Center (light, mid-right) ── */}
      <FloatCard ax={220} ay={345} rot="2deg" anim="floaty" dur={7} delay={-2.2}>
        <LightCard w={260}>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:12 }}>
            <span style={{ fontSize:13, fontWeight:800, color:'#1C0F35' }}>Action Center</span>
            <span style={{ flex:1 }}/>
            <span style={{ fontSize:9, fontWeight:700, color:'#C0432F', background:'rgba(192,67,47,0.12)', borderRadius:20, padding:'3px 7px' }}>2 due</span>
          </div>
          {[
            { dot:'#E06A4E', title:'Approve PO #PO-0245',       sub:'ABC Suppliers · ₹1.24L', when:'Today', wc:'#E06A4E' },
            { dot:'#D9A233', title:'Review Quotation #SQ-0089', sub:'Metro Retail · ₹2.87L',  when:'Tmrw',  wc:'#888' },
            { dot:GREEN,     title:'GRN for PO #PO-0231',       sub:'Delta Logistics',          when:'Jun 27',wc:'#888' },
          ].map(r => (
            <div key={r.title} style={{ display:'flex', alignItems:'flex-start', gap:9, marginBottom:10 }}>
              <span style={{ width:7, height:7, borderRadius:'50%', background:r.dot, marginTop:5, flexShrink:0 }}/>
              <span style={{ flex:1 }}>
                <span style={{ display:'block', fontSize:12, fontWeight:600, color:'#1C0F35' }}>{r.title}</span>
                <span style={{ display:'block', fontSize:10.5, color:'#7B6A9A' }}>{r.sub}</span>
              </span>
              <span style={{ fontSize:10.5, fontWeight:600, color:r.wc }}>{r.when}</span>
            </div>
          ))}
        </LightCard>
      </FloatCard>

      {/* ── Card D — Purchase Orders (light, bottom-left) ── */}
      <FloatCard ax={5} ay={455} rot="-3deg" anim="floaty2" dur={8} delay={-3}>
        <LightCard w={252}>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:12 }}>
            <span style={{ fontSize:13, fontWeight:800, color:'#1C0F35' }}>Purchase Orders</span>
            <span style={{ flex:1 }}/>
            <span style={{ fontSize:10, fontWeight:700, color:'#fff', background:PURPLE, borderRadius:20, minWidth:18, height:18, display:'flex', alignItems:'center', justifyContent:'center', padding:'0 6px' }}>8</span>
          </div>
          {[
            { name:'ABC Suppliers Ltd', po:'PO-0245 · ₹1.24L', badge:'Pending',  bc:'#C28A0E', bg:'rgba(194,138,14,0.1)' },
            { name:'Orbit Industries',  po:'PO-0044 · ₹4.12L', badge:'Approved', bc:GREEN,    bg:`rgba(16,164,138,0.1)` },
            { name:'Vertex Steel Co',   po:'PO-0238 · ₹6.78L', badge:'Pending',  bc:'#C28A0E', bg:'rgba(194,138,14,0.1)' },
          ].map(r => (
            <div key={r.po} style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10 }}>
              <span style={{ width:28,height:28,borderRadius:8,background:`rgba(72,44,128,0.1)`,color:PURPLE,display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'"JetBrains Mono",monospace',fontSize:9,fontWeight:700 }}>PO</span>
              <span style={{ flex:1, minWidth:0 }}>
                <span style={{ display:'block', fontSize:12, fontWeight:600, color:'#1C0F35' }}>{r.name}</span>
                <span style={{ display:'block', fontSize:10.5, color:'#7B6A9A' }}>{r.po}</span>
              </span>
              <span style={{ fontSize:9.5, fontWeight:600, color:r.bc, background:r.bg, borderRadius:6, padding:'2px 7px' }}>{r.badge}</span>
            </div>
          ))}
          <Btn>Approve all</Btn>
        </LightCard>
      </FloatCard>

      {/* ── Card E — Inventory (light, bottom-right) ── */}
      <FloatCard ax={238} ay={572} rot="5deg" anim="floaty" dur={7.8} delay={-1.1}>
        <LightCard w={228}>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:12 }}>
            <span style={{ fontSize:13, fontWeight:800, color:'#1C0F35' }}>Inventory</span>
            <span style={{ flex:1 }}/>
            <span style={{ fontSize:9.5, fontWeight:700, color:'#C0432F', background:'rgba(192,67,47,0.1)', borderRadius:20, padding:'3px 7px' }}>4 low</span>
          </div>
          {[
            { label:'Steel Pipe 32mm',   val:'18/50',   pct:36, color:'#D4A520' },
            { label:'Ball Bearing 6204', val:'6/40',    pct:15, color:'#E06A4E' },
            { label:'Copper Cable 4sq',  val:'120/200', pct:60, color:TEAL },
          ].map(r => (
            <div key={r.label} style={{ marginBottom:11 }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5 }}>
                <span style={{ fontSize:11.5, fontWeight:500, color:'#1C0F35' }}>{r.label}</span>
                <span style={{ fontSize:11, fontWeight:700, color:r.color }}>{r.val}</span>
              </div>
              <div style={{ height:5, borderRadius:6, background:'rgba(72,44,128,0.08)' }}>
                <div style={{ height:'100%', width:`${r.pct}%`, borderRadius:6, background:r.color }}/>
              </div>
            </div>
          ))}
        </LightCard>
      </FloatCard>

      {/* ── Floating icon chips (right edge) ── */}
      <div style={{ position:'absolute', right:34, top:80, width:46, height:46, borderRadius:14,
        background:'#fff', boxShadow:'0 8px 24px rgba(72,44,128,0.14)',
        display:'flex', alignItems:'center', justifyContent:'center',
        animation:'chipf 5.5s ease-in-out 0s infinite' }}>
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke={PURPLE} strokeWidth="1.9" strokeLinecap="round">
          <path d="M3 7h18v4H3zM5 11v9h14v-9"/>
        </svg>
      </div>
      <div style={{ position:'absolute', right:34, top:395, width:46, height:46, borderRadius:14,
        background:'#fff', boxShadow:'0 8px 24px rgba(72,44,128,0.14)',
        display:'flex', alignItems:'center', justifyContent:'center',
        animation:'chipf 6.2s ease-in-out -1.5s infinite' }}>
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke={TEAL} strokeWidth="1.9" strokeLinecap="round">
          <path d="M3 7h15a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z"/>
        </svg>
      </div>

    </div>
  );
}
