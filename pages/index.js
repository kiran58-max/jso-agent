import { useState, useEffect, useRef, useCallback } from "react";
import Head from "next/head";

const CONSULTANT = "Marcus Chen";
const CANDIDATE  = "Priya Sharma";

const SCRIPT = [
  { spk:"HR",  txt:"Good morning Priya! I've reviewed your profile — you're looking to transition into product management. Can you tell me about your current role?" },
  { spk:"CAN", txt:"Yes! I'm a software engineer with 5 years of experience. I've been leading small teams and want to move into a more strategic, user-focused role." },
  { spk:"HR",  txt:"Interesting background. What makes you think you're ready for product management? It's quite a different skill set from engineering." },
  { spk:"CAN", txt:"I've been gathering user feedback and working closely with stakeholders on product requirements. My technical background helps me bridge the gap." },
  { spk:"HR",  txt:"Let me be direct — many engineers struggle with this transition because they focus too much on technical details rather than business outcomes. Have you considered that risk?" },
  { spk:"CAN", txt:"That's a fair concern. I've been actively working on that — building stakeholder communication skills and focusing more on metrics and user outcomes." },
  { spk:"HR",  txt:"Good self-awareness. Let me also mention our JSO placement programme — we have strong partnerships with product companies actively hiring PMs." },
  { spk:"CAN", txt:"That sounds great. But could we also spend some time on how I should structure my portfolio to showcase my PM readiness?" },
  { spk:"HR",  txt:"Absolutely — excellent question. You should build 2 or 3 case studies that demonstrate product thinking. Walk through problem identification, your approach, and measurable business outcomes." },
  { spk:"CAN", txt:"I actually led an A/B testing framework at my current company. It resulted in a 15% increase in user engagement over one quarter." },
  { spk:"HR",  txt:"That's excellent portfolio material. Frame it as: the problem you identified, the experiment design, and the business impact. That exact structure is what PM hiring panels look for." },
  { spk:"CAN", txt:"Perfect. And what about interview preparation — specifically PM case interview frameworks?" },
];

/* ── helpers ── */
function fmtTime(s) { return `${String(Math.floor(s/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`; }
function scoreColor(v) { return v>=75?"green":v>=50?"amber":"red"; }

/* ── tiny components ── */
function Ring({ val, color, size=76, label }) {
  const r=(size-10)/2, circ=2*Math.PI*r, dash=(val/100)*circ;
  const clr={green:"#22d37a",amber:"#f5a623",red:"#ff4d6a",accent:"#4f7cff"}[color]||"#4f7cff";
  return (
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:5}}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{transform:"rotate(-90deg)"}}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={5}/>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={clr} strokeWidth={5}
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
          style={{transition:"stroke-dasharray 0.7s cubic-bezier(0.4,0,0.2,1)",filter:`drop-shadow(0 0 7px ${clr}99)`}}/>
        <text x={size/2} y={size/2} textAnchor="middle" dominantBaseline="central"
          style={{fill:clr,fontSize:size*0.22,fontFamily:"'DM Mono',monospace",fontWeight:500,
            transform:"rotate(90deg)",transformOrigin:`${size/2}px ${size/2}px`}}>
          {val}
        </text>
      </svg>
      {label&&<span style={{color:"var(--muted)",fontSize:10,fontFamily:"'DM Mono',monospace",letterSpacing:"0.06em",textTransform:"uppercase"}}>{label}</span>}
    </div>
  );
}

function Bar({ val, color="accent", h=6 }) {
  const clr={accent:"var(--accent)",green:"var(--green)",amber:"var(--amber)",red:"var(--red)"}[color];
  return (
    <div style={{background:"rgba(255,255,255,0.06)",borderRadius:99,height:h,overflow:"hidden"}}>
      <div style={{width:`${val}%`,height:"100%",background:clr,borderRadius:99,
        transition:"width 0.7s cubic-bezier(0.4,0,0.2,1)",boxShadow:`0 0 8px ${clr}66`}}/>
    </div>
  );
}

function Badge({ children, c="accent" }) {
  const bg={accent:"var(--accent-lo)",green:"var(--green-lo)",amber:"var(--amber-lo)",red:"var(--red-lo)",purple:"var(--purple-lo)"};
  const fg={accent:"var(--accent)",green:"var(--green)",amber:"var(--amber)",red:"var(--red)",purple:"var(--purple)"};
  return (
    <span style={{background:bg[c],color:fg[c],border:`1px solid ${fg[c]}33`,borderRadius:4,
      padding:"2px 8px",fontSize:11,fontFamily:"'DM Mono',monospace",letterSpacing:"0.04em",fontWeight:500}}>
      {children}
    </span>
  );
}

function Card({ children, style={}, glow=false }) {
  return (
    <div style={{background:"var(--card)",border:`1px solid var(--border)`,borderRadius:"var(--r)",
      padding:20,...style,...(glow?{boxShadow:"0 0 0 1px rgba(79,124,255,0.25),0 4px 32px rgba(79,124,255,0.1)"}:{})}}>
      {children}
    </div>
  );
}

function LiveDot({ on }) {
  if (!on) return <span style={{width:8,height:8,borderRadius:"50%",background:"var(--muted)",display:"inline-block"}}/>;
  return (
    <span style={{position:"relative",display:"inline-flex",alignItems:"center",justifyContent:"center",width:12,height:12}}>
      <span style={{position:"absolute",width:8,height:8,borderRadius:"50%",background:"var(--red)",animation:"pulse-ring 1.5s ease-out infinite"}}/>
      <span style={{width:8,height:8,borderRadius:"50%",background:"var(--red)",position:"relative"}}/>
    </span>
  );
}

/* ── main ── */
export default function Home() {
  const [view,    setView]    = useState("home");
  const [msgs,    setMsgs]    = useState([]);
  const [idx,     setIdx]     = useState(0);
  const [scores,  setScores]  = useState({tone:0,prof:0,eng:0,risk:0});
  const [hist,    setHist]    = useState([]);
  const [hint,    setHint]    = useState(null);
  const [alerts,  setAlerts]  = useState([]);
  const [busy,    setBusy]    = useState(false);
  const [live,    setLive]    = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [report,  setReport]  = useState(null);
  const [loading, setLoading] = useState(false);
  const [apiError,setApiError]= useState(null);
  const timerRef = useRef(null);
  const chatRef  = useRef(null);

  useEffect(()=>{
    if (live) { timerRef.current = setInterval(()=>setElapsed(e=>e+1),1000); }
    else clearInterval(timerRef.current);
    return ()=>clearInterval(timerRef.current);
  },[live]);

  useEffect(()=>{ if(chatRef.current) chatRef.current.scrollTop=chatRef.current.scrollHeight; },[msgs]);

  const startSession = () => {
    setMsgs([]); setIdx(0); setScores({tone:0,prof:0,eng:0,risk:0}); setHist([]);
    setHint(null); setAlerts([]); setBusy(false); setLive(true); setElapsed(0);
    setReport(null); setApiError(null); setView("session");
  };

  const sendLine = useCallback(async () => {
    if (idx>=SCRIPT.length||busy) return;
    const line = SCRIPT[idx];
    const msg  = {...line, id:Date.now(), t:fmtTime(elapsed)};
    setMsgs(prev=>[...prev,msg]);
    setIdx(i=>i+1);

    if (line.spk==="HR") {
      setBusy(true);
      const tr = [...msgs,msg].map(m=>`${m.spk==="HR"?CONSULTANT:CANDIDATE}: ${m.txt}`).join("\n");
      try {
        // ✅ Calls our own API route — no CORS, no exposed key
        const res = await fetch("/api/analyze", {
          method:"POST",
          headers:{"Content-Type":"application/json"},
          body:JSON.stringify({transcript:tr, utterance:line.txt})
        });
        if (!res.ok) throw new Error(`API error ${res.status}`);
        const d = await res.json();
        const s = {tone:d.tone_score||75,prof:d.professionalism_score||75,eng:d.engagement_score||72,risk:d.flag_risk||0};
        setScores(s);
        setHist(h=>[...h,s]);
        if (d.coaching_hint) setHint(d.coaching_hint);
        if ((d.flag_risk||0)>0.55) {
          setAlerts(a=>[...a,{id:Date.now(),msg:d.flag_reason||"Quality concern detected",lvl:(d.flag_risk||0)>0.75?"red":"amber",t:fmtTime(elapsed)}]);
        }
      } catch(e){ setApiError(e.message); }
      setBusy(false);
    }
  },[idx,busy,msgs,elapsed]);

  const endSession = async () => {
    setLive(false); setLoading(true); setView("report");
    const tr = msgs.map(m=>`${m.spk==="HR"?CONSULTANT:CANDIDATE}: ${m.txt}`).join("\n");
    try {
      const res = await fetch("/api/report",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({transcript:tr})
      });
      if (!res.ok) throw new Error(`Report API error ${res.status}`);
      const r = await res.json();
      setReport(r);
    } catch(e){ setApiError(e.message); }
    setLoading(false);
  };

  /* ── HOME ── */
  if (view==="home") return (
    <>
      <Head><title>JSO · HR Consultation Monitoring Agent</title></Head>
      <div style={{minHeight:"100vh",display:"flex",flexDirection:"column"}}>
        <nav style={{borderBottom:"1px solid var(--border)",background:"var(--surface)",padding:"0 32px",height:56,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:17,color:"var(--accent)",letterSpacing:"-0.02em"}}>
            JSO <span style={{color:"var(--text)",fontWeight:400,fontSize:14}}>· AgentMonitor</span>
          </div>
          <div style={{display:"flex",gap:8}}>
            <Badge c="accent">Claude claude-sonnet-4-20250514</Badge>
            <Badge c="green">Phase-2 Live</Badge>
            <Badge c="purple">AariyaTech Corp</Badge>
          </div>
        </nav>

        <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"60px 32px",textAlign:"center"}}>
          <div style={{position:"relative",width:180,height:180,marginBottom:40}}>
            {[160,120,80].map((s,i)=>(
              <div key={i} style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",
                width:s,height:s,borderRadius:"50%",border:`1px solid rgba(79,124,255,${0.08+i*0.08})`,
                boxShadow:i===2?"0 0 40px rgba(79,124,255,0.25),inset 0 0 40px rgba(79,124,255,0.05)":""}}/>
            ))}
            <div style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",
              width:56,height:56,borderRadius:"50%",background:"var(--accent-lo)",border:"1px solid var(--accent)",
              display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,
              boxShadow:"0 0 20px rgba(79,124,255,0.4)"}}>🎯</div>
          </div>

          <div className="fade-up" style={{fontFamily:"'Syne',sans-serif",fontSize:42,fontWeight:800,lineHeight:1.1,marginBottom:16,letterSpacing:"-0.03em"}}>
            HR Consultation<br/><span style={{color:"var(--accent)"}}>Monitoring Agent</span>
          </div>
          <div className="fade-up" style={{color:"var(--muted)",fontSize:16,maxWidth:520,marginBottom:12,lineHeight:1.7,animationDelay:"0.1s"}}>
            Real-time AI quality assurance for every HR consultation — powered by Claude.
            Analyzes tone, professionalism, and candidate engagement live.
          </div>
          <div className="fade-up" style={{color:"var(--muted)",fontSize:13,marginBottom:36,animationDelay:"0.15s"}}>
            Part of <strong style={{color:"var(--text)"}}>JSO Phase-2: Agentic Career Intelligence Development</strong> · AariyaTech Corp
          </div>

          <button className="fade-up" onClick={startSession} style={{
            background:"var(--accent)",color:"#fff",border:"none",borderRadius:12,
            padding:"16px 40px",fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:16,cursor:"pointer",
            boxShadow:"0 0 32px rgba(79,124,255,0.45)",animationDelay:"0.2s",letterSpacing:"-0.01em"
          }}>▶  Start Live Session Demo</button>

          <div className="fade-up" style={{display:"flex",gap:10,marginTop:48,flexWrap:"wrap",justifyContent:"center",animationDelay:"0.25s"}}>
            {["🎙 Live Transcript Analysis","📊 Real-time Scoring","💡 AI Coaching Hints","⚠ Alert System","📋 Post-Session Report"].map(f=>(
              <div key={f} style={{background:"var(--surface)",border:"1px solid var(--border)",borderRadius:999,padding:"8px 16px",fontSize:12,color:"var(--muted)"}}>{f}</div>
            ))}
          </div>
        </div>

        <div style={{borderTop:"1px solid var(--border)",background:"var(--surface)",padding:"20px 32px"}}>
          <div style={{display:"flex",justifyContent:"center",gap:0,alignItems:"center",flexWrap:"wrap"}}>
            {[["01","Session Capture","Utterances ingested in real-time chunks"],
              ["02","Claude Analysis","claude-sonnet-4-20250514 scores each utterance server-side"],
              ["03","Live Feedback","Coaching hints & alerts on dashboard"],
              ["04","AI Report","Full post-session coaching card"]].map((item,i,arr)=>(
              <div key={i} style={{display:"flex",alignItems:"center"}}>
                <div style={{textAlign:"center",padding:"0 20px"}}>
                  <div style={{fontSize:10,fontFamily:"'DM Mono',monospace",color:"var(--accent)",marginBottom:4}}>STEP {item[0]}</div>
                  <div style={{fontWeight:500,fontSize:13}}>{item[1]}</div>
                  <div style={{color:"var(--muted)",fontSize:11,marginTop:2}}>{item[2]}</div>
                </div>
                {i<arr.length-1&&<span style={{color:"var(--border-hi)",fontSize:18}}>→</span>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );

  /* ── SESSION ── */
  if (view==="session") return (
    <>
      <Head><title>JSO · Live Session</title></Head>
      <div style={{height:"100vh",display:"flex",flexDirection:"column"}}>
        <nav style={{borderBottom:"1px solid var(--border)",background:"var(--surface)",padding:"0 24px",height:54,display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0}}>
          <div style={{display:"flex",alignItems:"center",gap:14}}>
            <span style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:15,color:"var(--accent)"}}>JSO</span>
            <span style={{color:"var(--border-hi)"}}>·</span>
            <LiveDot on={live}/>
            <span style={{fontSize:13,fontWeight:500}}>{CONSULTANT} <span style={{color:"var(--muted)"}}>consulting</span> {CANDIDATE}</span>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            {apiError && <span style={{color:"var(--red)",fontSize:11,fontFamily:"'DM Mono',monospace"}}>⚠ {apiError}</span>}
            {live&&<span style={{fontFamily:"'DM Mono',monospace",color:"var(--accent)",fontSize:13}}>{fmtTime(elapsed)}</span>}
            {idx<SCRIPT.length
              ? <button onClick={sendLine} disabled={busy} style={{
                  background:busy?"var(--border)":"var(--accent-lo)",color:busy?"var(--muted)":"var(--accent)",
                  border:`1px solid ${busy?"var(--border)":"var(--accent)"}`,borderRadius:6,
                  padding:"7px 18px",cursor:busy?"not-allowed":"pointer",fontSize:13,fontWeight:500,
                  display:"flex",alignItems:"center",gap:6}}>
                  {busy?<><span className="spin">⟳</span> Analyzing…</>:"▶ Next Line"}
                </button>
              : <button onClick={endSession} style={{
                  background:"var(--red-lo)",color:"var(--red)",border:"1px solid rgba(255,77,106,0.3)",
                  borderRadius:6,padding:"7px 18px",cursor:"pointer",fontSize:13,fontWeight:500}}>
                  ⏹ End Session
                </button>
            }
          </div>
        </nav>

        <div style={{flex:1,display:"grid",gridTemplateColumns:"1fr 320px",overflow:"hidden"}}>
          {/* Chat */}
          <div style={{display:"flex",flexDirection:"column",borderRight:"1px solid var(--border)",overflow:"hidden"}}>
            <div ref={chatRef} style={{flex:1,overflowY:"auto",padding:24,display:"flex",flexDirection:"column",gap:16}}>
              {msgs.length===0&&(
                <div style={{textAlign:"center",color:"var(--muted)",paddingTop:60,fontStyle:"italic",fontSize:13}}>
                  Press <strong style={{color:"var(--text)"}}>Next Line</strong> to begin the consultation simulation
                </div>
              )}
              {msgs.map(m=>{
                const isHR=m.spk==="HR";
                return (
                  <div key={m.id} className="fade-up" style={{display:"flex",flexDirection:"column",alignItems:isHR?"flex-start":"flex-end"}}>
                    <div style={{fontSize:11,color:"var(--muted)",marginBottom:5,fontFamily:"'DM Mono',monospace"}}>
                      {isHR?`👤 ${CONSULTANT}`:`🙋 ${CANDIDATE}`} · {m.t}
                    </div>
                    <div style={{maxWidth:"80%",padding:"12px 16px",
                      borderRadius:isHR?"4px 14px 14px 14px":"14px 4px 14px 14px",
                      background:isHR?"var(--surface)":"var(--accent-lo)",
                      border:`1px solid ${isHR?"var(--border)":"rgba(79,124,255,0.2)"}`,
                      fontSize:13,lineHeight:1.65}}>
                      {m.txt}
                    </div>
                  </div>
                );
              })}
              {busy&&(
                <div className="fade-up" style={{display:"flex",alignItems:"center",gap:8,color:"var(--muted)",fontSize:12}}>
                  <span className="spin">⟳</span> Claude is analysing this utterance…
                </div>
              )}
            </div>
            {hint&&(
              <div style={{borderTop:"1px solid var(--border)",padding:"12px 24px",background:"var(--accent-lo)",display:"flex",alignItems:"flex-start",gap:10,flexShrink:0}}>
                <span style={{color:"var(--accent)",fontSize:18,flexShrink:0}}>💡</span>
                <div>
                  <div style={{fontSize:10,color:"var(--accent)",fontFamily:"'DM Mono',monospace",marginBottom:3,letterSpacing:"0.06em"}}>AI COACHING HINT</div>
                  <div style={{fontSize:13,lineHeight:1.5}}>{hint}</div>
                </div>
              </div>
            )}
            <div style={{borderTop:"1px solid var(--border)",padding:"10px 24px",background:"var(--surface)",display:"flex",alignItems:"center",gap:12,flexShrink:0}}>
              <span style={{fontSize:11,color:"var(--muted)",fontFamily:"'DM Mono',monospace",whiteSpace:"nowrap"}}>{idx}/{SCRIPT.length}</span>
              <div style={{flex:1}}><Bar val={(idx/SCRIPT.length)*100} color="accent" h={4}/></div>
              <span style={{fontSize:11,color:"var(--muted)",fontFamily:"'DM Mono',monospace"}}>{Math.round((idx/SCRIPT.length)*100)}%</span>
            </div>
          </div>

          {/* Sidebar */}
          <div style={{overflowY:"auto",padding:16,display:"flex",flexDirection:"column",gap:12,background:"var(--bg)"}}>
            <Card glow>
              <div style={{fontFamily:"'Syne',sans-serif",fontWeight:600,fontSize:12,color:"var(--muted)",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:16}}>Live Quality Scores</div>
              <div style={{display:"flex",justifyContent:"space-around",marginBottom:16}}>
                <Ring val={scores.tone} color={scoreColor(scores.tone)} size={72} label="Tone"/>
                <Ring val={scores.prof} color={scoreColor(scores.prof)} size={72} label="Prof."/>
                <Ring val={scores.eng}  color={scoreColor(scores.eng)}  size={72} label="Engage"/>
              </div>
              <div style={{marginBottom:8}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
                  <span style={{fontSize:11,color:"var(--muted)"}}>Flag Risk</span>
                  <span style={{fontFamily:"'DM Mono',monospace",fontSize:11,color:scores.risk>0.6?"var(--red)":scores.risk>0.3?"var(--amber)":"var(--green)"}}>
                    {Math.round(scores.risk*100)}%
                  </span>
                </div>
                <Bar val={scores.risk*100} color={scores.risk>0.6?"red":scores.risk>0.3?"amber":"green"} h={6}/>
              </div>
              {[["Tone Quality",scores.tone],["Professionalism",scores.prof],["Engagement",scores.eng]].map(([l,v])=>(
                <div key={l} style={{marginBottom:8}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                    <span style={{fontSize:11,color:"var(--muted)"}}>{l}</span>
                    <span style={{fontFamily:"'DM Mono',monospace",fontSize:11}}>{v}</span>
                  </div>
                  <Bar val={v} color={scoreColor(v)} h={5}/>
                </div>
              ))}
            </Card>

            {hist.length>1&&(
              <Card>
                <div style={{fontFamily:"'Syne',sans-serif",fontWeight:600,fontSize:12,color:"var(--muted)",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:10}}>Score Trend</div>
                <svg width="100%" height={56} viewBox={`0 0 ${Math.max(hist.length*28,100)} 56`} preserveAspectRatio="none">
                  {[["tone","#4f7cff"],["prof","#22d37a"],["eng","#f5a623"]].map(([k,c])=>(
                    <polyline key={k}
                      points={hist.map((s,i)=>`${i*28+14},${56-(s[k]/100)*52}`).join(" ")}
                      fill="none" stroke={c} strokeWidth={1.5} opacity={0.85} strokeLinejoin="round"/>
                  ))}
                </svg>
                <div style={{display:"flex",gap:10,marginTop:6}}>
                  {[["#4f7cff","Tone"],["#22d37a","Prof"],["#f5a623","Engage"]].map(([c,l])=>(
                    <div key={l} style={{display:"flex",alignItems:"center",gap:4,fontSize:10,color:"var(--muted)"}}>
                      <span style={{width:10,height:2,background:c,display:"inline-block",borderRadius:1}}/>{l}
                    </div>
                  ))}
                </div>
              </Card>
            )}

            <Card>
              <div style={{fontFamily:"'Syne',sans-serif",fontWeight:600,fontSize:12,color:"var(--muted)",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:12,display:"flex",alignItems:"center",gap:8}}>
                Alerts {alerts.length>0&&<Badge c="red">{alerts.length}</Badge>}
              </div>
              {alerts.length===0
                ?<div style={{color:"var(--green)",fontSize:12,display:"flex",alignItems:"center",gap:6}}>✓ No issues detected</div>
                :alerts.map(a=>(
                  <div key={a.id} className="fade-up" style={{background:a.lvl==="red"?"var(--red-lo)":"var(--amber-lo)",
                    border:`1px solid ${a.lvl==="red"?"rgba(255,77,106,0.25)":"rgba(245,166,35,0.25)"}`,
                    borderRadius:6,padding:"10px 12px",marginBottom:8,fontSize:12}}>
                    <div style={{color:a.lvl==="red"?"var(--red)":"var(--amber)",fontWeight:500,marginBottom:3}}>
                      {a.lvl==="red"?"⚠ Critical":"⚡ Warning"}
                    </div>
                    <div style={{lineHeight:1.5}}>{a.msg}</div>
                    <div style={{color:"var(--muted)",fontSize:10,marginTop:4,fontFamily:"'DM Mono',monospace"}}>{a.t}</div>
                  </div>
                ))
              }
            </Card>

            <Card>
              <div style={{fontFamily:"'Syne',sans-serif",fontWeight:600,fontSize:12,color:"var(--muted)",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:10}}>Session Info</div>
              {[["Consultant",CONSULTANT],["Candidate",CANDIDATE],["Type","Career Transition"],["Focus","PM Track"],["Duration",fmtTime(elapsed)]].map(([k,v])=>(
                <div key={k} style={{display:"flex",justifyContent:"space-between",marginBottom:6,fontSize:12}}>
                  <span style={{color:"var(--muted)"}}>{k}</span>
                  <span style={{fontFamily:"'DM Mono',monospace",fontSize:11}}>{v}</span>
                </div>
              ))}
            </Card>
          </div>
        </div>
      </div>
    </>
  );

  /* ── REPORT ── */
  return (
    <>
      <Head><title>JSO · Post-Session Report</title></Head>
      <div style={{minHeight:"100vh"}}>
        <nav style={{borderBottom:"1px solid var(--border)",background:"var(--surface)",padding:"0 24px",height:54,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:15,color:"var(--accent)"}}>JSO · Post-Session Report</div>
          <div style={{display:"flex",gap:10}}>
            <button onClick={startSession} style={{background:"var(--accent-lo)",color:"var(--accent)",border:"1px solid rgba(79,124,255,0.3)",borderRadius:6,padding:"7px 14px",cursor:"pointer",fontSize:13}}>▶ New Session</button>
            <button onClick={()=>setView("home")} style={{background:"none",color:"var(--muted)",border:"1px solid var(--border)",borderRadius:6,padding:"7px 14px",cursor:"pointer",fontSize:13}}>← Home</button>
          </div>
        </nav>

        <div style={{maxWidth:900,margin:"0 auto",padding:"24px 24px 60px"}}>
          <Card style={{marginBottom:16,padding:"20px 28px",background:"linear-gradient(135deg,#16161f,#1a1a2e)",border:"1px solid var(--border-hi)"}}>
            <div style={{fontFamily:"'Syne',sans-serif",fontSize:20,fontWeight:700,marginBottom:4}}>AI Quality Report</div>
            <div style={{color:"var(--muted)",fontSize:13,marginBottom:12}}>{CONSULTANT} × {CANDIDATE} · {fmtTime(elapsed)} session</div>
            {report&&(
              <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                <Badge c={report.candidate_outcome==="positive"?"green":"amber"}>
                  Candidate: {(report.candidate_outcome||"").replace("_"," ")}
                </Badge>
                <Badge c={report.compliance_status==="clear"?"green":"red"}>
                  Compliance: {(report.compliance_status||"").replace("_"," ")}
                </Badge>
                {alerts.length>0&&<Badge c="amber">{alerts.length} Alert{alerts.length>1?"s":""} Raised</Badge>}
              </div>
            )}
          </Card>

          {apiError&&(
            <Card style={{marginBottom:16,border:"1px solid rgba(255,77,106,0.3)",background:"var(--red-lo)"}}>
              <div style={{color:"var(--red)",fontWeight:500,marginBottom:4}}>⚠ API Error</div>
              <div style={{fontSize:13,color:"var(--text)"}}>{apiError}</div>
              <div style={{fontSize:12,color:"var(--muted)",marginTop:8}}>Make sure ANTHROPIC_API_KEY is set in your Vercel environment variables.</div>
            </Card>
          )}

          {loading?(
            <Card style={{textAlign:"center",padding:80}}>
              <div style={{fontSize:36,marginBottom:20}} className="spin">⟳</div>
              <div style={{fontFamily:"'Syne',sans-serif",fontSize:18,fontWeight:600,marginBottom:8}}>Generating AI Report</div>
              <div style={{color:"var(--muted)"}}>Claude is analysing the full transcript…</div>
            </Card>
          ):report?(
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
              <Card style={{gridColumn:"1/-1"}}>
                <div style={{fontFamily:"'Syne',sans-serif",fontWeight:600,marginBottom:10}}>Session Summary</div>
                <p style={{color:"var(--text)",lineHeight:1.75,fontSize:14}}>{report.session_summary}</p>
              </Card>

              <Card>
                <div style={{fontFamily:"'Syne',sans-serif",fontWeight:600,marginBottom:16}}>Overall Scores</div>
                <div style={{display:"flex",justifyContent:"space-around"}}>
                  <Ring val={report.overall_tone_score||0} color={scoreColor(report.overall_tone_score||0)} size={80} label="Tone"/>
                  <Ring val={report.overall_professionalism_score||0} color={scoreColor(report.overall_professionalism_score||0)} size={80} label="Prof."/>
                  <Ring val={report.overall_engagement_score||0} color={scoreColor(report.overall_engagement_score||0)} size={80} label="Engage"/>
                </div>
              </Card>

              <Card>
                <div style={{fontFamily:"'Syne',sans-serif",fontWeight:600,marginBottom:12,color:"var(--green)"}}>✓ Strengths</div>
                {(report.strengths||[]).map((s,i)=>(
                  <div key={i} style={{display:"flex",gap:10,marginBottom:10,background:"var(--green-lo)",borderRadius:6,padding:"10px 14px",border:"1px solid rgba(34,211,122,0.15)"}}>
                    <span style={{color:"var(--green)",flexShrink:0}}>✓</span>
                    <span style={{fontSize:13,lineHeight:1.5}}>{s}</span>
                  </div>
                ))}
              </Card>

              <Card>
                <div style={{fontFamily:"'Syne',sans-serif",fontWeight:600,marginBottom:12,color:"var(--amber)"}}>↑ Development Areas</div>
                {(report.development_areas||[]).map((s,i)=>(
                  <div key={i} style={{display:"flex",gap:10,marginBottom:10,background:"var(--amber-lo)",borderRadius:6,padding:"10px 14px",border:"1px solid rgba(245,166,35,0.15)"}}>
                    <span style={{color:"var(--amber)",flexShrink:0}}>↑</span>
                    <span style={{fontSize:13,lineHeight:1.5}}>{s}</span>
                  </div>
                ))}
              </Card>

              <Card style={{gridColumn:"1/-1",border:"1px solid rgba(79,124,255,0.2)",background:"linear-gradient(135deg,var(--card),var(--accent-lo))"}}>
                <div style={{fontFamily:"'Syne',sans-serif",fontWeight:700,marginBottom:14,fontSize:15}}>
                  🎯 AI Coaching Card — <span style={{color:"var(--accent)"}}>{CONSULTANT}</span>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>
                  {(report.coaching_card||[]).map((tip,i)=>(
                    <div key={i} style={{background:"var(--surface)",borderRadius:6,padding:16,border:"1px solid var(--border)"}}>
                      <div style={{fontFamily:"'DM Mono',monospace",fontSize:10,color:"var(--accent)",marginBottom:8}}>POINT {String(i+1).padStart(2,"0")}</div>
                      <p style={{fontSize:13,lineHeight:1.6}}>{tip}</p>
                    </div>
                  ))}
                </div>
              </Card>

              <Card style={{gridColumn:"1/-1"}}>
                <div style={{fontFamily:"'Syne',sans-serif",fontWeight:600,marginBottom:12}}>📋 Next Steps for {CANDIDATE}</div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:10}}>
                  {(report.recommended_next_steps||[]).map((step,i)=>(
                    <div key={i} style={{background:"var(--surface)",borderRadius:6,padding:"12px 16px",border:"1px solid var(--border)",display:"flex",gap:10}}>
                      <span style={{color:"var(--accent)",fontFamily:"'DM Mono',monospace",fontSize:13,flexShrink:0}}>{i+1}.</span>
                      <span style={{fontSize:13,lineHeight:1.5}}>{step}</span>
                    </div>
                  ))}
                </div>
              </Card>

              <Card style={{gridColumn:"1/-1",textAlign:"center",padding:24,background:"var(--surface)"}}>
                <div style={{color:"var(--muted)",fontSize:12,marginBottom:16}}>
                  Report generated by Claude (claude-sonnet-4-20250514) · JSO HR Consultation Monitoring Agent · Phase-2 · AariyaTech Corp
                </div>
                <button onClick={startSession} style={{background:"var(--accent)",color:"#fff",border:"none",borderRadius:10,
                  padding:"13px 32px",fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:14,cursor:"pointer",
                  boxShadow:"0 0 24px rgba(79,124,255,0.4)",marginRight:12}}>▶ Start New Session</button>
                <button onClick={()=>setView("home")} style={{background:"none",color:"var(--muted)",border:"1px solid var(--border)",
                  borderRadius:10,padding:"13px 24px",fontFamily:"'Syne',sans-serif",fontSize:14,cursor:"pointer"}}>← Home</button>
              </Card>
            </div>
          ):(
            <Card style={{textAlign:"center",padding:40,color:"var(--muted)"}}>No report data. Run a session first.</Card>
          )}
        </div>
      </div>
    </>
  );
}
