import { useState, useEffect, useCallback } from "react";

const TARGETS = { kcal: 1975, p: 155, c: 200, f: 60, water: 3000 };

const PRESETS = [
  { id:"breakfast", emoji:"🍳", name:"ארוחת בוקר רגילה", desc:"2 ביצים + לחם + ריקוטה + ירקות", kcal:304, p:18.5, c:29, f:12 },
  { id:"chicken-rice", emoji:"🍗", name:"מנת עוף-אורז", desc:"150 גרם עוף + 150 גרם אורז/אפונה/גזר", kcal:321, p:39, c:33, f:3.5 },
  { id:"tuna", emoji:"🐟", name:"פחית טונה", desc:"טונה במים", kcal:90, p:24, c:0, f:1 },
  { id:"promax", emoji:"🥤", name:"שייק פרומקס", desc:"Herbalife Promax", kcal:190, p:25, c:18, f:1.5 },
  { id:"pro-yotvata", emoji:"☕", name:"PRO יטבתה", desc:'350 מ"ל קפה/שוקולד', kcal:135, p:25, c:8.5, f:0.75 },
];

const PAL = {
  kcal:{ grad:"linear-gradient(180deg,#c9bce0,#a690cf)", text:"#a690cf" },
  p:   { grad:"linear-gradient(180deg,#f3b9a8,#e08a72)", text:"#e08a72" },
  c:   { grad:"linear-gradient(180deg,#bfe0c7,#8fc79e)", text:"#8fc79e" },
  f:   { grad:"linear-gradient(180deg,#f6dfa0,#e8c162)", text:"#e8c162" },
};

const VR = { fontFamily:"'Varela Round',sans-serif" };

function todayStr() { return new Date().toISOString().slice(0,10); }
function pct(v,m)   { return Math.min(100,Math.round((v/m)*100)); }
function fmtTime()  { return new Date().toLocaleTimeString("he-IL",{hour:"2-digit",minute:"2-digit"}); }

function fmtDate(s) {
  const d = new Date(s+"T12:00:00");
  const days=["ראשון","שני","שלישי","רביעי","חמישי","שישי","שבת"];
  const mos=["ינואר","פברואר","מרץ","אפריל","מאי","יוני","יולי","אוגוסט","ספטמבר","אוקטובר","נובמבר","דצמבר"];
  return `${days[d.getDay()]}, ${d.getDate()} ב${mos[d.getMonth()]}`;
}

async function loadDay(dateStr) {
  try {
    const r = await window.storage.get("nutri:"+dateStr);
    return r ? JSON.parse(r.value) : { meals:[], water:0 };
  } catch { return { meals:[], water:0 }; }
}
async function saveDay(dateStr,data) {
  try { await window.storage.set("nutri:"+dateStr, JSON.stringify(data)); } catch {}
}

/* ── MacroBars ── */
function MacroBars({ totals }) {
  const bars=[
    {key:"kcal",label:'קק"ל',val:Math.round(totals.kcal),target:TARGETS.kcal},
    {key:"p",label:"חלבון",val:Math.round(totals.p),target:TARGETS.p},
    {key:"c",label:"פחמימה",val:Math.round(totals.c),target:TARGETS.c},
    {key:"f",label:"שומן",val:Math.round(totals.f),target:TARGETS.f},
  ];
  return (
    <div style={{background:"#fff",borderRadius:22,padding:"18px 16px",marginBottom:12,boxShadow:"0 6px 20px rgba(200,180,160,0.12)"}}>
      <div style={{...VR,fontSize:10,color:"#a89e97",letterSpacing:"0.1em",marginBottom:14,textAlign:"center"}}>
        התקדמות מול היעד
      </div>
      <div style={{display:"flex",justifyContent:"space-around",gap:8}}>
        {bars.map(({key,label,val,target})=>{
          const p=pct(val,target); const done=p>=100;
          return(
            <div key={key} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:5}}>
              <div style={{...VR,fontSize:9.5,color:done?PAL[key].text:"#a89e97"}}>{p}%</div>
              <div style={{width:32,height:96,background:"#f2ede6",borderRadius:16,display:"flex",flexDirection:"column",justifyContent:"flex-end",overflow:"hidden"}}>
                <div style={{width:"100%",height:`${p}%`,background:PAL[key].grad,borderRadius:16,transition:"height 0.5s ease",minHeight:val>0?4:0}}/>
              </div>
              <div style={{...VR,fontSize:11.5,color:"#4a4340"}}>{val}</div>
              <div style={{fontSize:9.5,color:"#a89e97",marginTop:-2}}>{label}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Remaining pills ── */
function Remaining({ totals }) {
  const items=[
    {label:'קק"ל נותרו',val:Math.max(0,Math.round(TARGETS.kcal-totals.kcal)),color:"#a690cf"},
    {label:"חלבון נותר",val:Math.max(0,Math.round(TARGETS.p-totals.p))+"g",color:"#e08a72"},
    {label:"שומן נותר",val:Math.max(0,Math.round(TARGETS.f-totals.f))+"g",color:"#e8c162"},
  ];
  return(
    <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginBottom:12}}>
      {items.map(({label,val,color})=>(
        <div key={label} style={{background:"#fff",borderRadius:16,padding:"11px 8px",textAlign:"center",boxShadow:"0 4px 12px rgba(200,180,160,0.1)"}}>
          <div style={{...VR,fontSize:18,color}}>{val}</div>
          <div style={{fontSize:9.5,color:"#a89e97",marginTop:3}}>{label}</div>
        </div>
      ))}
    </div>
  );
}

/* ── Water ── */
function Water({ water, onAdd, onReset }) {
  return(
    <div style={{background:"linear-gradient(135deg,#e8f4fd,#d6eaf8)",borderRadius:22,padding:"14px 16px",marginBottom:12}}>
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
        <div style={{...VR,fontSize:12,color:"#5b8fa8"}}>💧 מים</div>
        <div style={{...VR,fontSize:12,color:"#3a7ca5",fontWeight:600}}>{water} / {TARGETS.water} מ"ל</div>
      </div>
      <div style={{background:"rgba(255,255,255,0.5)",borderRadius:5,height:8,overflow:"hidden",marginBottom:10}}>
        <div style={{height:"100%",width:`${pct(water,TARGETS.water)}%`,background:"linear-gradient(90deg,#74b9e8,#3a7ca5)",borderRadius:5,transition:"width 0.4s"}}/>
      </div>
      <div style={{display:"flex",gap:6}}>
        {[250,500,1000].map(ml=>(
          <button key={ml} onClick={()=>onAdd(ml)} style={{flex:1,background:"rgba(255,255,255,0.75)",border:"none",borderRadius:10,padding:"7px 0",...VR,fontSize:12,cursor:"pointer",color:"#3a7ca5"}}>
            +{ml>=1000?"1L":`${ml}מ"ל`}
          </button>
        ))}
        <button onClick={onReset} style={{background:"rgba(255,255,255,0.5)",border:"none",borderRadius:10,padding:"7px 10px",fontSize:12,cursor:"pointer",color:"#a89e97"}}>↺</button>
      </div>
    </div>
  );
}

/* ── Quick-add ── */
function QuickAdd({ onAdd }) {
  const [open,setOpen]=useState(true);
  return(
    <div style={{background:"#fff",borderRadius:22,marginBottom:12,boxShadow:"0 6px 20px rgba(200,180,160,0.12)",overflow:"hidden"}}>
      <button onClick={()=>setOpen(o=>!o)} style={{width:"100%",background:"none",border:"none",padding:"14px 18px",display:"flex",justifyContent:"space-between",alignItems:"center",cursor:"pointer"}}>
        <span style={{...VR,fontSize:11,color:"#a89e97",letterSpacing:"0.1em"}}>הוספה מהירה</span>
        <span style={{...VR,fontSize:14,color:"#a89e97",transform:open?"rotate(180deg)":"rotate(0)",transition:"transform 0.25s"}}>⌃</span>
      </button>
      {open&&(
        <div style={{padding:"0 12px 14px"}}>
          {PRESETS.map(meal=>(
            <button key={meal.id} onClick={()=>onAdd(meal)} style={{width:"100%",display:"flex",alignItems:"center",gap:12,background:"#fbf7f2",border:"none",borderRadius:14,padding:"10px 12px",cursor:"pointer",textAlign:"right",marginBottom:7}}>
              <span style={{fontSize:20,flexShrink:0}}>{meal.emoji}</span>
              <div style={{flex:1}}>
                <div style={{...VR,fontSize:12.5,color:"#4a4340"}}>{meal.name}</div>
                <div style={{fontSize:10.5,color:"#a89e97",marginTop:1}}>{meal.desc}</div>
              </div>
              <div style={{...VR,fontSize:11,color:"#a89e97",flexShrink:0,textAlign:"left"}}>{meal.kcal}<br/><span style={{fontSize:9}}>קק"ל</span></div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Manual add ── */
function ManualAdd({ onAdd }) {
  const [open,setOpen]=useState(false);
  const [f,setF]=useState({name:"",kcal:"",p:"",c:"",f:""});
  const upd=(k,v)=>setF(x=>({...x,[k]:v}));

  const submit=()=>{
    if(!f.name||!f.kcal) return;
    onAdd({name:f.name,kcal:+f.kcal||0,p:+f.p||0,c:+f.c||0,f:+f.f||0});
    setF({name:"",kcal:"",p:"",c:"",f:""});
    setOpen(false);
  };

  return(
    <div style={{marginBottom:12}}>
      <button onClick={()=>setOpen(o=>!o)} style={{width:"100%",background:open?"linear-gradient(135deg,#c9bce0,#a690cf)":"#fff",border:"none",borderRadius:18,padding:"13px",...VR,fontSize:13.5,cursor:"pointer",color:open?"#fff":"#a690cf",boxShadow:"0 4px 14px rgba(200,180,160,0.1)"}}>
        {open?"✕  סגור":"+ הוספה ידנית"}
      </button>
      {open&&(
        <div style={{background:"#fff",borderRadius:"0 0 18px 18px",padding:"14px 16px",boxShadow:"0 8px 16px rgba(200,180,160,0.1)",marginTop:2}}>
          <input placeholder="שם הארוחה" value={f.name} onChange={e=>upd("name",e.target.value)}
            style={{width:"100%",border:"1.5px solid #f2ede6",borderRadius:10,padding:"9px 12px",fontSize:13,direction:"rtl",outline:"none",fontFamily:"Assistant,sans-serif",boxSizing:"border-box",marginBottom:10}}/>
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,marginBottom:12}}>
            {[["kcal",'קק"ל',"#a690cf"],["p","חלבון","#e08a72"],["c","פחמימה","#8fc79e"],["f","שומן","#e8c162"]].map(([k,label,color])=>(
              <div key={k}>
                <div style={{...VR,fontSize:9.5,color,marginBottom:4}}>{label}</div>
                <input type="number" placeholder="0" value={f[k]} onChange={e=>upd(k,e.target.value)}
                  style={{width:"100%",border:"1.5px solid #f2ede6",borderRadius:8,padding:"7px 6px",fontSize:13,textAlign:"center",outline:"none",fontFamily:"Assistant,sans-serif",boxSizing:"border-box"}}/>
              </div>
            ))}
          </div>
          <button onClick={submit} style={{width:"100%",background:"linear-gradient(135deg,#bfe0c7,#8fc79e)",border:"none",borderRadius:12,padding:"12px",...VR,fontSize:14,cursor:"pointer",color:"#fff"}}>
            הוסף ✓
          </button>
        </div>
      )}
    </div>
  );
}

/* ── Meal log ── */
function MealLog({ meals, onRemove }) {
  if(!meals.length) return null;
  const total=meals.reduce((a,m)=>({kcal:a.kcal+m.kcal,p:a.p+m.p,c:a.c+m.c,f:a.f+m.f}),{kcal:0,p:0,c:0,f:0});
  return(
    <div style={{background:"#fff",borderRadius:22,padding:"16px 16px",boxShadow:"0 6px 20px rgba(200,180,160,0.12)"}}>
      <div style={{...VR,fontSize:11,color:"#a89e97",letterSpacing:"0.1em",marginBottom:10}}>ארוחות היום</div>
      {meals.map(m=>(
        <div key={m.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"9px 0",borderBottom:"1px solid #f2ede6"}}>
          <div style={{flex:1}}>
            <div style={{fontSize:13.5,fontWeight:600,color:"#4a4340"}}>{m.name}</div>
            <div style={{fontSize:11,color:"#a89e97",marginTop:2}}>{Math.round(m.kcal)} קק"ל · {Math.round(m.p)}ח/{Math.round(m.c)}פ/{Math.round(m.f)}ש{m.time?` · ${m.time}`:""}</div>
          </div>
          <button onClick={()=>onRemove(m.id)} style={{background:"none",border:"none",cursor:"pointer",color:"#f3b9a8",fontSize:16,padding:"4px 8px",flexShrink:0}}>✕</button>
        </div>
      ))}
      <div style={{display:"flex",justifyContent:"space-between",marginTop:10,paddingTop:8,borderTop:"2px solid #f2ede6"}}>
        <div style={{...VR,fontSize:13}}>סה"כ</div>
        <div style={{...VR,fontSize:11.5,color:"#a89e97"}}>{Math.round(total.kcal)} קק"ל · {Math.round(total.p)}ח/{Math.round(total.c)}פ/{Math.round(total.f)}ש</div>
      </div>
    </div>
  );
}

/* ── History tab ── */
function HistoryTab() {
  const [data,setData]=useState([]);
  const [loading,setLoading]=useState(true);

  useEffect(()=>{
    (async()=>{
      const days=[];
      for(let i=6;i>=0;i--){
        const d=new Date(); d.setDate(d.getDate()-i);
        const s=d.toISOString().slice(0,10);
        const day=await loadDay(s);
        const kcal=day.meals.reduce((a,m)=>a+(m.kcal||0),0);
        const p=day.meals.reduce((a,m)=>a+(m.p||0),0);
        days.push({date:s,kcal:Math.round(kcal),p:Math.round(p)});
      }
      setData(days); setLoading(false);
    })();
  },[]);

  if(loading) return <div style={{textAlign:"center",padding:40,color:"#a89e97",...VR}}>טוען...</div>;

  const active=data.filter(d=>d.kcal>0);
  const avgKcal=active.length?Math.round(active.reduce((a,d)=>a+d.kcal,0)/active.length):0;
  const avgP=active.length?Math.round(active.reduce((a,d)=>a+d.p,0)/active.length):0;
  const maxKcal=Math.max(...data.map(d=>d.kcal),TARGETS.kcal+300);

  return(
    <div>
      {/* Kcal bars */}
      <div style={{background:"#fff",borderRadius:22,padding:"18px 16px",marginBottom:12,boxShadow:"0 6px 20px rgba(200,180,160,0.12)"}}>
        <div style={{...VR,fontSize:11,color:"#a89e97",letterSpacing:"0.1em",marginBottom:14}}>קלוריות — 7 ימים אחרונים</div>
        <div style={{display:"flex",gap:5,height:120,alignItems:"flex-end",position:"relative"}}>
          <div style={{position:"absolute",left:0,right:0,bottom:`${(TARGETS.kcal/maxKcal)*100}%`,borderTop:"2px dashed #a690cf",pointerEvents:"none"}}>
            <span style={{...VR,fontSize:8,color:"#a690cf",position:"absolute",right:0,top:-12}}>יעד</span>
          </div>
          {data.map(({date,kcal})=>{
            const h=kcal>0?`${(kcal/maxKcal)*100}%`:"3px";
            const isToday=date===todayStr();
            return(
              <div key={date} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",height:"100%",justifyContent:"flex-end"}}>
                <div style={{...VR,fontSize:8,color:"#a89e97",marginBottom:3}}>{kcal>0?kcal:""}</div>
                <div style={{width:"100%",height:h,borderRadius:"6px 6px 0 0",minHeight:3,
                  background:kcal===0?"#f2ede6":kcal>TARGETS.kcal?"linear-gradient(180deg,#f3b9a8,#e08a72)":"linear-gradient(180deg,#c9bce0,#a690cf)",
                  outline:isToday?"2px solid #a690cf":"none"}}/>
                <div style={{...VR,fontSize:8.5,color:isToday?"#a690cf":"#a89e97",marginTop:5}}>
                  {new Date(date+"T12:00:00").getDate()}/{new Date(date+"T12:00:00").getMonth()+1}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Protein bars */}
      <div style={{background:"#fff",borderRadius:22,padding:"18px 16px",marginBottom:12,boxShadow:"0 6px 20px rgba(200,180,160,0.12)"}}>
        <div style={{...VR,fontSize:11,color:"#a89e97",letterSpacing:"0.1em",marginBottom:14}}>חלבון — 7 ימים אחרונים</div>
        <div style={{display:"flex",gap:5,height:90,alignItems:"flex-end"}}>
          {data.map(({date,p})=>(
            <div key={date} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",height:"100%",justifyContent:"flex-end"}}>
              <div style={{width:"100%",height:p>0?`${(p/180)*100}%`:"3px",borderRadius:"6px 6px 0 0",minHeight:3,
                background:p===0?"#f2ede6":p>=TARGETS.p?"linear-gradient(180deg,#bfe0c7,#8fc79e)":"linear-gradient(180deg,#f3b9a8,#e08a72)"}}/>
              <div style={{...VR,fontSize:8.5,color:"#a89e97",marginTop:4}}>{p>0?p+"g":"—"}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Averages */}
      {active.length>0&&(
        <div style={{background:"linear-gradient(135deg,#eef5ee,#f0eafa)",borderRadius:20,padding:"16px 18px"}}>
          <div style={{...VR,fontSize:11,color:"#a89e97",marginBottom:12,letterSpacing:"0.1em"}}>ממוצעים ({active.length} ימים פעילים)</div>
          <div style={{display:"flex",justifyContent:"space-around"}}>
            {[
              {val:avgKcal,label:'קק"ל ממוצע',color:"#a690cf"},
              {val:avgP+"g",label:"חלבון ממוצע",color:"#e08a72"},
              {val:`${active.filter(d=>d.kcal<=TARGETS.kcal).length}/${active.length}`,label:"ימים ביעד",color:"#8fc79e"},
            ].map(({val,label,color})=>(
              <div key={label} style={{textAlign:"center"}}>
                <div style={{...VR,fontSize:22,color}}>{val}</div>
                <div style={{fontSize:10,color:"#a89e97",marginTop:2}}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── MAIN ── */
export default function NutritionApp() {
  const [tab,setTab]=useState("today");
  const [date,setDate]=useState(todayStr());
  const [meals,setMeals]=useState([]);
  const [water,setWater]=useState(0);
  const [loading,setLoading]=useState(true);
  const [toast,setToast]=useState("");

  useEffect(()=>{
    setLoading(true);
    loadDay(date).then(({meals:m,water:w})=>{ setMeals(m); setWater(w); setLoading(false); });
  },[date]);

  const save=useCallback((m,w)=>saveDay(date,{meals:m,water:w}),[date]);

  const showToast=(msg)=>{ setToast(msg); setTimeout(()=>setToast(""),1800); };

  const addMeal=(meal)=>{
    const m={...meal,id:Date.now(),time:fmtTime()};
    const upd=[...meals,m]; setMeals(upd); save(upd,water);
    showToast(`✓ ${meal.name} נוסף`);
  };

  const removeMeal=(id)=>{ const upd=meals.filter(m=>m.id!==id); setMeals(upd); save(upd,water); };

  const addWater=(ml)=>{ const w=Math.min(water+ml,6000); setWater(w); save(meals,w); };
  const resetWater=()=>{ setWater(0); save(meals,0); };

  const goDay=(delta)=>{
    const d=new Date(date+"T12:00:00"); d.setDate(d.getDate()+delta);
    const next=d.toISOString().slice(0,10);
    if(next<=todayStr()) setDate(next);
  };

  const totals=meals.reduce((a,m)=>({kcal:a.kcal+(m.kcal||0),p:a.p+(m.p||0),c:a.c+(m.c||0),f:a.f+(m.f||0)}),{kcal:0,p:0,c:0,f:0});
  const isToday=date===todayStr();

  return(
    <div style={{background:"#fbf7f2",minHeight:"100vh",fontFamily:"'Assistant',sans-serif",color:"#4a4340",direction:"rtl"}}>

      {/* TOAST */}
      {toast&&(
        <div style={{position:"fixed",top:76,left:"50%",transform:"translateX(-50%)",background:"#4a4340",color:"#fff",...VR,fontSize:13,padding:"9px 20px",borderRadius:20,zIndex:100,boxShadow:"0 4px 20px rgba(0,0,0,0.2)",whiteSpace:"nowrap"}}>
          {toast}
        </div>
      )}

      {/* HEADER */}
      <div style={{background:"linear-gradient(135deg,#f0eafa,#eaf5ee)",padding:"18px 16px 14px",position:"sticky",top:0,zIndex:10}}>
        <div style={{maxWidth:480,margin:"0 auto"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
            <button onClick={()=>goDay(-1)} style={{background:"rgba(255,255,255,0.75)",border:"none",borderRadius:12,width:36,height:36,cursor:"pointer",fontSize:18,color:"#4a4340"}}>‹</button>
            <div style={{textAlign:"center"}}>
              {isToday&&<div style={{...VR,fontSize:9.5,color:"#a690cf",letterSpacing:"0.12em",marginBottom:2}}>היום</div>}
              <div style={{...VR,fontSize:15}}>{fmtDate(date)}</div>
            </div>
            <button onClick={()=>goDay(1)} style={{background:isToday?"transparent":"rgba(255,255,255,0.75)",border:"none",borderRadius:12,width:36,height:36,cursor:isToday?"default":"pointer",fontSize:18,color:isToday?"transparent":"#4a4340"}}>›</button>
          </div>
          <div style={{display:"flex",gap:6,background:"rgba(255,255,255,0.5)",borderRadius:14,padding:4}}>
            {[["today","יומי"],["history","היסטוריה"]].map(([id,label])=>(
              <button key={id} onClick={()=>setTab(id)} style={{flex:1,padding:"7px",border:"none",borderRadius:10,cursor:"pointer",...VR,fontSize:13,
                background:tab===id?"linear-gradient(135deg,#c9bce0,#a690cf)":"transparent",color:tab===id?"#fff":"#a89e97"}}>
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div style={{maxWidth:480,margin:"0 auto",padding:"14px 14px 80px"}}>
        {loading?(
          <div style={{textAlign:"center",padding:50,color:"#a89e97",...VR,fontSize:14}}>טוען...</div>
        ):tab==="today"?(
          <>
            <MacroBars totals={totals}/>
            <Remaining totals={totals}/>
            <Water water={water} onAdd={addWater} onReset={resetWater}/>
            <QuickAdd onAdd={addMeal}/>
            <ManualAdd onAdd={addMeal}/>
            <MealLog meals={meals} onRemove={removeMeal}/>
          </>
        ):(
          <HistoryTab/>
        )}
      </div>
    </div>
  );
}
