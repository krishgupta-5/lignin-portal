import re

with open('src/pages/About.jsx', 'r', encoding='utf-8') as f:
    c = f.read()

timeline_array = '''const projectPhases = [
  {
    phase: "Phase I",
    name: "Identification & Formulation",
    months: "Months 1–3",
    status: "Completed",
    activities: [
      { name: "Literature Survey & Requirement Gathering", start: 0, end: 2 },
      { name: "Project Scope Definition", start: 0, end: 2 }
    ]
  },
  {
    phase: "Phase II",
    name: "Data Engineering",
    months: "Months 4–6",
    status: "Completed",
    activities: [
      { name: "Data Collection, Cleaning, and Migration", start: 0, end: 2 },
      { name: "MongoDB Atlas Integration & Normalization", start: 3, end: 5 }
    ]
  },
  {
    phase: "Phase III",
    name: "Deep Learning Development",
    months: "Months 7–10",
    status: "Completed",
    activities: [
      { name: "Architecture Design (Neural Network/TabNet)", start: 5, end: 7 },
      { name: "Model Implementation & Core Training", start: 5, end: 7 }
    ]
  },
  {
    phase: "Phase IV",
    name: "XAI & Refinement",
    months: "Months 10–11",
    status: "Completed",
    activities: [
      { name: "Hyperparameter Tuning & Optimization", start: 7, end: 9 },
      { name: "SHAP Implementation & Interpretability", start: 7, end: 9 }
    ]
  },
  {
    phase: "Phase V",
    name: "Evaluation",
    months: "Months 11–12",
    status: "Completed",
    activities: [
      { name: "Results Evaluation & Comparative Analysis", start: 8, end: 11 },
      { name: "Model Validation on Blind Test Set", start: 8, end: 11 }
    ]
  },
  {
    phase: "Phase VI",
    name: "Documentation",
    months: "Months 9–12",
    status: "In Progress",
    activities: [
      { name: "Interim Report and Mid-term Evaluation", start: 11, end: 12 },
      { name: "Final Report Compilation & Final Presentation", start: 11, end: 12 }
    ]
  }
];'''

c = re.sub(r'const timelineEvents = \[\s*[\s\S]*?\];', timeline_array, c)

timeline_jsx = '''{/* 13. TIMELINE */}
        <section className="sec-light py-20" style={{background: "#F7F8F5"}}>
          <div className="about-container">
            <h2 className="section-title text-center" style={{textAlign:"center", marginBottom: "1.5rem"}}>Project Timeline</h2>
            
            {/* Timeline Summary Box */}
            <div style={{ display: "flex", justifyContent: "center", gap: "2rem", flexWrap: "wrap", marginBottom: "4rem", background: "#FFFFFF", padding: "1.5rem 2rem", borderRadius: "12px", border: "1px solid #E2E8F0", boxShadow: "0 4px 15px rgba(0,0,0,0.03)", maxWidth: "1000px", margin: "0 auto 4rem auto" }}>
              <div style={{ textAlign: "center", flex: 1 }}>
                <div style={{ fontSize: "0.8rem", color: "#64748B", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.25rem" }}>Project Duration</div>
                <div style={{ fontSize: "1.2rem", fontWeight: 700, color: "#0F172A" }}>12 Months</div>
              </div>
              <div style={{ width: "1px", background: "#E2E8F0" }}></div>
              <div style={{ textAlign: "center", flex: 1 }}>
                <div style={{ fontSize: "0.8rem", color: "#64748B", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.25rem" }}>Total Phases</div>
                <div style={{ fontSize: "1.2rem", fontWeight: 700, color: "#0F172A" }}>6</div>
              </div>
              <div style={{ width: "1px", background: "#E2E8F0" }}></div>
              <div style={{ textAlign: "center", flex: 1 }}>
                <div style={{ fontSize: "0.8rem", color: "#64748B", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.25rem" }}>Timeline Range</div>
                <div style={{ fontSize: "1.2rem", fontWeight: 700, color: "#0F172A" }}>0–12 Months</div>
              </div>
              <div style={{ width: "1px", background: "#E2E8F0" }}></div>
              <div style={{ textAlign: "center", flex: 1 }}>
                <div style={{ fontSize: "0.8rem", color: "#64748B", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.25rem" }}>Status Overview</div>
                <div style={{ fontSize: "1.2rem", fontWeight: 700, color: "#10B981" }}>5 Complete, 1 In Progress</div>
              </div>
            </div>
            
            <div className="timeline-track">
              {projectPhases.map((t, i) => (
                <motion.div key={i} className="tl-item" initial={{opacity:0, x:-20}} whileInView={{opacity:1, x:0}} viewport={{once:true, margin:"-50px"}}>
                  <div className={"tl-icon" + (t.status === "In Progress" ? " in-progress" : "")}>
                    {t.status === "Completed" ? <CheckCircle size={20}/> : <Clock size={20}/>}
                  </div>
                  <div className="tl-content" style={{ borderTop: t.status === "In Progress" ? "3px solid #EAB308" : "3px solid #10B981" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
                      <div>
                        <div className="tl-phase" style={{ background: t.status === "In Progress" ? "#FEF9C3" : "#ECFDF5", color: t.status === "In Progress" ? "#CA8A04" : "#059669", marginBottom: "0.5rem" }}>{t.phase} &middot; {t.months}</div>
                        <h4 style={{fontSize:"1.4rem", fontWeight:700, color:"#0F172A", margin:0}}>{t.name}</h4>
                      </div>
                      <div style={{ padding: "4px 12px", borderRadius: "100px", fontSize: "0.75rem", fontWeight: 700, background: t.status === "Completed" ? "#ECFDF5" : "#FEF9C3", color: t.status === "Completed" ? "#059669" : "#CA8A04", border: t.status === "Completed" ? "1px solid #A7F3D0" : "1px solid #FEF08A" }}>
                        {t.status}
                      </div>
                    </div>
                    
                    <div style={{ background: "#F8FAFC", borderRadius: "8px", padding: "1.5rem", border: "1px solid #E2E8F0" }}>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 3fr", gap: "1rem", marginBottom: "1rem" }}>
                        <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#64748B", textTransform: "uppercase" }}>Activity</div>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", position: "relative" }}>
                          {[0,1,2,3,4,5,6,7,8,9,10,11,12].map(n => (
                            <div key={n} style={{ position: "absolute", left: (n/12)*100 + "%", transform: "translateX(-50%)", fontSize: "0.65rem", fontWeight: 700, color: "#94A3B8" }}>{n}</div>
                          ))}
                        </div>
                      </div>
                      
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginTop: "1rem" }}>
                        {t.activities.map((act, actIdx) => (
                          <div key={actIdx} style={{ display: "grid", gridTemplateColumns: "1fr 3fr", gap: "1rem", alignItems: "center" }}>
                            <div style={{ fontSize: "0.85rem", color: "#334155", fontWeight: 500, lineHeight: 1.3 }}>{act.name}</div>
                            
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", height: "16px", background: "#F1F5F9", borderRadius: "4px", position: "relative" }}>
                              {[1,2,3,4,5,6,7,8,9,10,11].map(n => (
                                <div key={n} style={{ position: "absolute", left: (n/12)*100 + "%", top: 0, bottom: 0, width: "1px", background: "#E2E8F0" }}></div>
                              ))}
                              <div style={{ 
                                gridColumn: (act.start + 1) + " / " + (act.end + 1), 
                                background: t.status === "Completed" ? "#10B981" : "#EF4444", 
                                borderRadius: "4px",
                                height: "100%",
                                zIndex: 2
                              }}></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>'''

c = re.sub(r'\{\/\* 13\. TIMELINE \*\/\}[\s\S]*?<\/section>', timeline_jsx, c)

if 'Clock' not in c:
    c = c.replace('import { CheckCircle', 'import { CheckCircle, Clock')

with open('src/pages/About.jsx', 'w', encoding='utf-8') as f:
    f.write(c)

