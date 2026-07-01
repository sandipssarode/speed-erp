/* SpeedHero — narrow single-column cascade, light lavender bg */

const PURPLE = '#482C80';
const TEAL   = '#2DBAD5';
const GREEN  = '#10A48A';

const shadow = { boxShadow: '0 10px 36px rgba(72,44,128,0.13), 0 2px 6px rgba(72,44,128,0.07)' };

function DarkCard({ w, children }) {
  return (
    <div style={{
      width: w, borderRadius: 16,
      background: 'linear-gradient(148deg,#2D1B69 0%,#1C0F35 100%)',
      color: '#EDE7F6', padding: '13px 15px',
    }}>{children}</div>
  );
}

function LightCard({ w, children }) {
  return (
    <div style={{
      width: w, borderRadius: 16,
      background: '#fff', color: '#1C0F35',
      padding: '13px 15px',
    }}>{children}</div>
  );
}

function Btn({ children }) {
  return (
    <button style={{
      width: '100%', height: 32, marginTop: 11, borderRadius: 8,
      background: PURPLE, color: '#fff',
      fontSize: 12, fontWeight: 700, fontFamily: 'inherit', border: 'none', cursor: 'default',
    }}>{children}</button>
  );
}

function Card({ ax, ay, rot, anim, dur, delay, children }) {
  return (
    <div style={{
      position: 'absolute', left: ax, top: ay,
      animation: `${anim} ${dur}s ease-in-out ${delay}s infinite`,
    }}>
      <div style={{ transform: `rotate(${rot})`, borderRadius: 16, overflow: 'hidden', ...shadow }}>
        {children}
      </div>
    </div>
  );
}

export default function SpeedHero() {
  return (
    <div style={{
      position: 'relative', width: 440, height: 900, overflow: 'hidden',
      background: 'radial-gradient(130% 110% at 30% 5%, #f5f0ff 0%, #ebe3fd 55%, #e2d9fb 100%)',
      fontFamily: '"Hanken Grotesk",system-ui,sans-serif',
    }}>

      {/* subtle orb */}
      <div style={{ position:'absolute', left:'20%', top:'30%', width:280, height:280,
        borderRadius:'50%', background:'radial-gradient(closest-side, rgba(72,44,128,0.07), transparent)',
        filter:'blur(28px)',
      }}/>

      {/* ── Card 1 — Overview (dark) ── */}
      <Card ax={18} ay={10} rot="-4deg" anim="floaty" dur={7.5} delay={0}>
        <DarkCard w={218}>
          <div style={{ display:'flex', alignItems:'center', gap:7, marginBottom:10 }}>
            <div style={{ width:20,height:20,borderRadius:6,background:PURPLE,display:'flex',alignItems:'center',justifyContent:'center' }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round"><path d="M17 5H8a4 4 0 0 0 0 8h8a4 4 0 0 1 0 8H6"/></svg>
            </div>
            <span style={{ fontSize:12, fontWeight:800, letterSpacing:'0.05em' }}>SPEED</span>
            <span style={{ fontSize:10.5, color:'#B39DDB' }}>Overview</span>
            <span style={{ flex:1 }}/>
            <span style={{ fontSize:8.5, fontWeight:700, color:TEAL, background:'rgba(45,186,213,0.18)', borderRadius:20, padding:'2px 6px' }}>LIVE</span>
          </div>
          <div style={{ fontSize:26, fontWeight:900, letterSpacing:'-0.02em', color:'#fff', marginBottom:2 }}>₹64.2L</div>
          <div style={{ fontSize:10.5, color:'#9E8CC8', marginBottom:11 }}>Value this month</div>
          {[
            { label:'Open Purchase Orders', val:20 },
            { label:'Open Sales Orders',    val:15 },
          ].map(r => (
            <div key={r.label} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:7 }}>
              <span style={{ fontSize:11, color:'#C5B8E8' }}>{r.label}</span>
              <span style={{ fontSize:12, fontWeight:700, color:'#fff' }}>{r.val}</span>
            </div>
          ))}
          <Btn>View report</Btn>
        </DarkCard>
      </Card>

      {/* ── Card 2 — Goods Receipt (dark) ── */}
      <Card ax={36} ay={200} rot="3.5deg" anim="floaty2" dur={8.5} delay={-1.5}>
        <DarkCard w={226}>
          <div style={{ display:'flex', alignItems:'center', gap:7, marginBottom:11 }}>
            <span style={{ fontSize:12, fontWeight:800, letterSpacing:'0.05em' }}>SPEED</span>
            <span style={{ fontSize:10.5, color:'#B39DDB' }}>Goods Receipt</span>
            <span style={{ flex:1 }}/>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#7B6A9A" strokeWidth="2" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
          </div>
          {[
            { iconColor:GREEN,    label:'PO-0242 · Delta Logistics', badge:'Received', bc:GREEN },
            { iconColor:TEAL,     label:'PO-0233 · Pioneer Tools',   badge:'40%',      bc:TEAL },
            { iconColor:'#B39DDB', label:'Warehouse B · Bay 4',       badge:'',         bc:'' },
          ].map(r => (
            <div key={r.label} style={{ display:'flex', alignItems:'center', gap:8, borderRadius:8, padding:'7px 9px', marginBottom:6, background:'rgba(255,255,255,0.05)' }}>
              <div style={{ width:7,height:7,borderRadius:'50%',background:r.iconColor,flexShrink:0 }}/>
              <span style={{ fontSize:11, color:'#D5CAF0', flex:1 }}>{r.label}</span>
              {r.badge && <span style={{ fontSize:10.5, fontWeight:700, color:r.bc }}>{r.badge}</span>}
            </div>
          ))}
          <Btn>Confirm receipt</Btn>
        </DarkCard>
      </Card>

      {/* ── Card 3 — Action Center (light) ── */}
      <Card ax={16} ay={390} rot="-2deg" anim="floaty" dur={7} delay={-2.2}>
        <LightCard w={220}>
          <div style={{ display:'flex', alignItems:'center', marginBottom:11 }}>
            <span style={{ fontSize:12.5, fontWeight:800 }}>Action Center</span>
            <span style={{ flex:1 }}/>
            <span style={{ fontSize:9, fontWeight:700, color:'#C0432F', background:'rgba(192,67,47,0.1)', borderRadius:20, padding:'2px 7px' }}>2 due</span>
          </div>
          {[
            { dot:'#E06A4E', title:'Approve PO #PO-0245',       sub:'ABC Suppliers · ₹1.24L', when:'Today',  wc:'#E06A4E' },
            { dot:'#D9A233', title:'Review Quotation #SQ-0089', sub:'Metro Retail · ₹2.87L',  when:'Tmrw',   wc:'#888' },
            { dot:GREEN,     title:'GRN for PO #PO-0231',       sub:'Delta Logistics',          when:'Jun 27', wc:'#888' },
          ].map(r => (
            <div key={r.title} style={{ display:'flex', alignItems:'flex-start', gap:8, marginBottom:9 }}>
              <span style={{ width:6,height:6,borderRadius:'50%',background:r.dot,marginTop:4,flexShrink:0 }}/>
              <span style={{ flex:1 }}>
                <span style={{ display:'block', fontSize:11.5, fontWeight:600, color:'#1C0F35' }}>{r.title}</span>
                <span style={{ display:'block', fontSize:10, color:'#7B6A9A' }}>{r.sub}</span>
              </span>
              <span style={{ fontSize:10, fontWeight:600, color:r.wc, flexShrink:0 }}>{r.when}</span>
            </div>
          ))}
        </LightCard>
      </Card>

      {/* ── Card 4 — Purchase Orders (light) ── */}
      <Card ax={34} ay={550} rot="3deg" anim="floaty2" dur={8} delay={-3}>
        <LightCard w={218}>
          <div style={{ display:'flex', alignItems:'center', marginBottom:11 }}>
            <span style={{ fontSize:12.5, fontWeight:800 }}>Purchase Orders</span>
            <span style={{ flex:1 }}/>
            <span style={{ fontSize:10, fontWeight:700, color:'#fff', background:PURPLE, borderRadius:20, minWidth:18, height:18, display:'flex', alignItems:'center', justifyContent:'center', padding:'0 6px' }}>8</span>
          </div>
          {[
            { name:'ABC Suppliers Ltd', po:'PO-0245 · ₹1.24L', badge:'Pending',  bc:'#C28A0E', bg:'rgba(194,138,14,0.1)' },
            { name:'Orbit Industries',  po:'PO-0044 · ₹4.12L', badge:'Approved', bc:GREEN,    bg:'rgba(16,164,138,0.1)' },
            { name:'Vertex Steel Co',   po:'PO-0238 · ₹6.78L', badge:'Pending',  bc:'#C28A0E', bg:'rgba(194,138,14,0.1)' },
          ].map(r => (
            <div key={r.po} style={{ display:'flex', alignItems:'center', gap:9, marginBottom:9 }}>
              <span style={{ width:26,height:26,borderRadius:7,background:'rgba(72,44,128,0.1)',color:PURPLE,display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'"JetBrains Mono",monospace',fontSize:8.5,fontWeight:700 }}>PO</span>
              <span style={{ flex:1, minWidth:0 }}>
                <span style={{ display:'block', fontSize:11.5, fontWeight:600, color:'#1C0F35' }}>{r.name}</span>
                <span style={{ display:'block', fontSize:10, color:'#7B6A9A' }}>{r.po}</span>
              </span>
              <span style={{ fontSize:9, fontWeight:600, color:r.bc, background:r.bg, borderRadius:5, padding:'2px 6px' }}>{r.badge}</span>
            </div>
          ))}
          <Btn>Approve all</Btn>
        </LightCard>
      </Card>

      {/* ── Card 5 — Inventory (light) ── */}
      <Card ax={16} ay={745} rot="-3deg" anim="floaty" dur={7.8} delay={-1.1}>
        <LightCard w={215}>
          <div style={{ display:'flex', alignItems:'center', marginBottom:11 }}>
            <span style={{ fontSize:12.5, fontWeight:800 }}>Inventory</span>
            <span style={{ flex:1 }}/>
            <span style={{ fontSize:9, fontWeight:700, color:'#C0432F', background:'rgba(192,67,47,0.1)', borderRadius:20, padding:'2px 7px' }}>4 low</span>
          </div>
          {[
            { label:'Steel Pipe 32mm',   val:'18/50',   pct:36, color:'#D4A520' },
            { label:'Ball Bearing 6204', val:'6/40',    pct:15, color:'#E06A4E' },
            { label:'Copper Cable 4sq',  val:'120/200', pct:60, color:TEAL },
          ].map(r => (
            <div key={r.label} style={{ marginBottom:10 }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                <span style={{ fontSize:11, fontWeight:500, color:'#1C0F35' }}>{r.label}</span>
                <span style={{ fontSize:10.5, fontWeight:700, color:r.color }}>{r.val}</span>
              </div>
              <div style={{ height:5, borderRadius:5, background:'rgba(72,44,128,0.08)' }}>
                <div style={{ height:'100%', width:`${r.pct}%`, borderRadius:5, background:r.color }}/>
              </div>
            </div>
          ))}
        </LightCard>
      </Card>

    </div>
  );
}
