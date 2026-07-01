/* SpeedHero — 2-col cascade (left x=8, right x=222), fills 440px canvas */

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

function Card({ ax, ay, rot, anim, dur, delay, z = 1, children }) {
  return (
    <div style={{
      position: 'absolute', left: ax, top: ay, zIndex: z,
      animation: `${anim} ${dur}s ease-in-out ${delay}s infinite`,
    }}>
      <div style={{ transform: `rotate(${rot})`, borderRadius: 16, overflow: 'hidden', ...shadow }}>
        {children}
      </div>
    </div>
  );
}

const W = 208; // card width — each col is 208px, cols at x=8 and x=224

export default function SpeedHero() {
  return (
    <div style={{
      position: 'relative', width: 440, height: 800, overflow: 'hidden',
      background: 'radial-gradient(130% 110% at 30% 5%, #f5f0ff 0%, #ebe3fd 55%, #e2d9fb 100%)',
      fontFamily: '"Hanken Grotesk",system-ui,sans-serif',
    }}>

      {/* subtle orbs */}
      <div style={{ position:'absolute', left:'15%', top:'25%', width:260, height:260,
        borderRadius:'50%', background:'radial-gradient(closest-side,rgba(72,44,128,0.07),transparent)',
        filter:'blur(28px)', pointerEvents:'none',
      }}/>
      <div style={{ position:'absolute', right:'10%', top:'55%', width:200, height:200,
        borderRadius:'50%', background:'radial-gradient(closest-side,rgba(45,186,213,0.08),transparent)',
        filter:'blur(22px)', pointerEvents:'none',
      }}/>

      {/* ── Card 1 — Overview (dark, LEFT col) ── */}
      <Card ax={8} ay={12} rot="-4.5deg" anim="floaty" dur={7.5} delay={0} z={2}>
        <DarkCard w={W}>
          <div style={{ display:'flex', alignItems:'center', gap:7, marginBottom:10 }}>
            <div style={{ width:20,height:20,borderRadius:6,background:PURPLE,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0 }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round"><path d="M17 5H8a4 4 0 0 0 0 8h8a4 4 0 0 1 0 8H6"/></svg>
            </div>
            <span style={{ fontSize:11.5, fontWeight:800, letterSpacing:'0.05em' }}>SPEED</span>
            <span style={{ fontSize:10, color:'#B39DDB' }}>Overview</span>
            <span style={{ flex:1 }}/>
            <span style={{ fontSize:8, fontWeight:700, color:TEAL, background:'rgba(45,186,213,0.18)', borderRadius:20, padding:'2px 6px' }}>LIVE</span>
          </div>
          <div style={{ fontSize:26, fontWeight:900, letterSpacing:'-0.02em', color:'#fff', marginBottom:1 }}>₹64.2L</div>
          <div style={{ fontSize:10, color:'#9E8CC8', marginBottom:10 }}>Value this month</div>
          {[
            { label:'Open Purchase Orders', val:20 },
            { label:'Open Sales Orders',    val:15 },
          ].map(r => (
            <div key={r.label} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:7 }}>
              <span style={{ fontSize:10.5, color:'#C5B8E8' }}>{r.label}</span>
              <span style={{ fontSize:12, fontWeight:700, color:'#fff' }}>{r.val}</span>
            </div>
          ))}
          <Btn>View report</Btn>
        </DarkCard>
      </Card>

      {/* ── Card 2 — Goods Receipt (dark, RIGHT col) ── */}
      <Card ax={224} ay={160} rot="3.5deg" anim="floaty2" dur={8.5} delay={-1.5} z={2}>
        <DarkCard w={W}>
          <div style={{ display:'flex', alignItems:'center', gap:7, marginBottom:10 }}>
            <span style={{ fontSize:11.5, fontWeight:800, letterSpacing:'0.05em' }}>SPEED</span>
            <span style={{ fontSize:10, color:'#B39DDB' }}>Goods Receipt</span>
            <span style={{ flex:1 }}/>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#7B6A9A" strokeWidth="2" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
          </div>
          {[
            { color:GREEN,     label:'PO-0242 · Delta Logistics', badge:'Received', bc:GREEN },
            { color:TEAL,      label:'PO-0233 · Pioneer Tools',   badge:'40%',      bc:TEAL },
            { color:'#8A7BA6', label:'Warehouse B · Bay 4',        badge:'',         bc:'' },
          ].map(r => (
            <div key={r.label} style={{ display:'flex', alignItems:'center', gap:8, background:'rgba(255,255,255,0.05)', borderRadius:8, padding:'7px 9px', marginBottom:6 }}>
              <div style={{ width:6,height:6,borderRadius:'50%',background:r.color,flexShrink:0 }}/>
              <span style={{ fontSize:10.5, color:'#D5CAF0', flex:1 }}>{r.label}</span>
              {r.badge && <span style={{ fontSize:10, fontWeight:700, color:r.bc }}>{r.badge}</span>}
            </div>
          ))}
          <Btn>Confirm receipt</Btn>
        </DarkCard>
      </Card>

      {/* ── Card 3 — Action Center (light, LEFT col) ── */}
      <Card ax={8} ay={340} rot="-2.5deg" anim="floaty" dur={7} delay={-2.2} z={3}>
        <LightCard w={W}>
          <div style={{ display:'flex', alignItems:'center', marginBottom:10 }}>
            <span style={{ fontSize:12, fontWeight:800 }}>Action Center</span>
            <span style={{ flex:1 }}/>
            <span style={{ fontSize:8.5, fontWeight:700, color:'#C0432F', background:'rgba(192,67,47,0.1)', borderRadius:20, padding:'2px 6px' }}>2 due</span>
          </div>
          {[
            { dot:'#E06A4E', title:'Approve PO #PO-0245',       sub:'ABC Suppliers · ₹1.24L', when:'Today',  wc:'#E06A4E' },
            { dot:'#D9A233', title:'Review Quotation #SQ-0089', sub:'Metro Retail · ₹2.87L',  when:'Tmrw',   wc:'#999' },
            { dot:GREEN,     title:'GRN for PO #PO-0231',       sub:'Delta Logistics',          when:'Jun 27', wc:'#999' },
          ].map(r => (
            <div key={r.title} style={{ display:'flex', alignItems:'flex-start', gap:8, marginBottom:9 }}>
              <span style={{ width:6,height:6,borderRadius:'50%',background:r.dot,marginTop:4,flexShrink:0 }}/>
              <span style={{ flex:1 }}>
                <span style={{ display:'block', fontSize:11, fontWeight:600, color:'#1C0F35' }}>{r.title}</span>
                <span style={{ display:'block', fontSize:9.5, color:'#7B6A9A' }}>{r.sub}</span>
              </span>
              <span style={{ fontSize:9.5, fontWeight:600, color:r.wc, flexShrink:0 }}>{r.when}</span>
            </div>
          ))}
        </LightCard>
      </Card>

      {/* ── Card 4 — Purchase Orders (light, RIGHT col) ── */}
      <Card ax={224} ay={470} rot="3deg" anim="floaty2" dur={8} delay={-3} z={3}>
        <LightCard w={W}>
          <div style={{ display:'flex', alignItems:'center', marginBottom:10 }}>
            <span style={{ fontSize:12, fontWeight:800 }}>Purchase Orders</span>
            <span style={{ flex:1 }}/>
            <span style={{ fontSize:9.5, fontWeight:700, color:'#fff', background:PURPLE, borderRadius:20, minWidth:17, height:17, display:'flex', alignItems:'center', justifyContent:'center', padding:'0 5px' }}>8</span>
          </div>
          {[
            { name:'ABC Suppliers Ltd', po:'PO-0245 · ₹1.24L', badge:'Pending',  bc:'#B07A0A', bg:'rgba(194,138,14,0.1)' },
            { name:'Orbit Industries',  po:'PO-0044 · ₹4.12L', badge:'Approved', bc:GREEN,     bg:'rgba(16,164,138,0.1)' },
            { name:'Vertex Steel Co',   po:'PO-0238 · ₹6.78L', badge:'Pending',  bc:'#B07A0A', bg:'rgba(194,138,14,0.1)' },
          ].map(r => (
            <div key={r.po} style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
              <span style={{ width:24,height:24,borderRadius:6,background:'rgba(72,44,128,0.1)',color:PURPLE,display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'"JetBrains Mono",monospace',fontSize:8,fontWeight:700,flexShrink:0 }}>PO</span>
              <span style={{ flex:1, minWidth:0 }}>
                <span style={{ display:'block', fontSize:11, fontWeight:600, color:'#1C0F35' }}>{r.name}</span>
                <span style={{ display:'block', fontSize:9.5, color:'#7B6A9A' }}>{r.po}</span>
              </span>
              <span style={{ fontSize:8.5, fontWeight:600, color:r.bc, background:r.bg, borderRadius:5, padding:'2px 5px', flexShrink:0 }}>{r.badge}</span>
            </div>
          ))}
          <Btn>Approve all</Btn>
        </LightCard>
      </Card>

      {/* ── Card 5 — Inventory (light, LEFT col) ── */}
      <Card ax={8} ay={632} rot="-3deg" anim="floaty" dur={7.8} delay={-1.1} z={3}>
        <LightCard w={W}>
          <div style={{ display:'flex', alignItems:'center', marginBottom:10 }}>
            <span style={{ fontSize:12, fontWeight:800 }}>Inventory</span>
            <span style={{ flex:1 }}/>
            <span style={{ fontSize:8.5, fontWeight:700, color:'#C0432F', background:'rgba(192,67,47,0.1)', borderRadius:20, padding:'2px 6px' }}>4 low</span>
          </div>
          {[
            { label:'Steel Pipe 32mm',   val:'18/50',   pct:36, color:'#D4A520' },
            { label:'Ball Bearing 6204', val:'6/40',    pct:15, color:'#E06A4E' },
            { label:'Copper Cable 4sq',  val:'120/200', pct:60, color:TEAL },
          ].map(r => (
            <div key={r.label} style={{ marginBottom:9 }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                <span style={{ fontSize:10.5, fontWeight:500, color:'#1C0F35' }}>{r.label}</span>
                <span style={{ fontSize:10, fontWeight:700, color:r.color }}>{r.val}</span>
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
