import { useEffect, useMemo, useState } from 'react'
import { Activity, BookOpen, Brain, CalendarDays, Check, ChevronRight, CircleHelp, Clock3, Download, Heart, ImagePlus, Leaf, Library, Save, Search, Settings2, ShieldCheck, Sparkles, Sun, Trash2, Upload, Wind } from 'lucide-react'

type Entry = { id:string; date:string; hour:number; emotion:string; emotionScore:number; emotionIntensity:number; feeling:string; feelingScore:number; feelingIntensity:number; thought:string; thoughtType:string; thoughtScore:number; attention:number; note:string; createdAt:number }
type Journal = { id:string; date:string; title:string; body:string }
type Asset = { id:string; name:string; type:string; data:string; date:string }
const EMOTIONS = ['Joie','Sérénité','Enthousiasme','Confiance','Courage','Espoir','Curiosité','Gratitude','Satisfaction','Tendresse','Soulagement','Peur','Anxiété','Inquiétude','Tristesse','Mélancolie','Colère','Irritation','Frustration','Honte','Culpabilité','Jalousie','Solitude','Confusion','Ennui','Découragement']
const FEELINGS = ['Amour','Paix','Foi','Compassion','Bienveillance','Admiration','Respect','Gratitude','Pardon','Acceptation','Confiance','Méfiance','Ressentiment','Rancœur','Désir','Passion','Attachement','Détermination','Fidélité','Détachement']
const THOUGHTS = ['Constructive','Créative','Souvenir du passé','Projection future','Scénario imaginaire','Conversation imaginaire','Sexuelle','Relationnelle','Rumination','Intrusive','Influence collective / égrégore','Autre']
const today = () => new Date().toISOString().slice(0,10)
const read = <T,>(key:string, fallback:T):T => { try { const v=localStorage.getItem('stay-'+key); return v?JSON.parse(v):fallback } catch { return fallback } }
const persist = (key:string,value:unknown) => localStorage.setItem('stay-'+key,JSON.stringify(value))
const uid = () => crypto.randomUUID?.() ?? String(Date.now()+Math.random())
const scoreLabel = (n:number) => n>0?'+':''+n

export default function App() {
  const [tab,setTab]=useState('Contrôle')
  const [entries,setEntries]=useState<Entry[]>(()=>read('entries',[]))
  const [journals,setJournals]=useState<Journal[]>(()=>read('journals',[]))
  const [assets,setAssets]=useState<Asset[]>(()=>read('assets',[]))
  const [selectedDate,setSelectedDate]=useState(today())
  const [emotion,setEmotion]=useState('Sérénité')
  const [emotionScore,setEmotionScore]=useState(5)
  const [emotionIntensity,setEmotionIntensity]=useState(5)
  const [feeling,setFeeling]=useState('Paix')
  const [feelingScore,setFeelingScore]=useState(5)
  const [feelingIntensity,setFeelingIntensity]=useState(5)
  const [thought,setThought]=useState('')
  const [thoughtType,setThoughtType]=useState('Constructive')
  const [thoughtScore,setThoughtScore]=useState(0)
  const [attention,setAttention]=useState(3)
  const [note,setNote]=useState('')
  const [journalTitle,setJournalTitle]=useState('')
  const [journalBody,setJournalBody]=useState('')
  const [query,setQuery]=useState('')
  const [meditationMinutes,setMeditationMinutes]=useState(10)
  const [seconds,setSeconds]=useState(0)
  const [running,setRunning]=useState(false)
  const [meditating,setMeditating]=useState(false)
  const [templeImageId,setTempleImageId]=useState<string>(()=>read('temple-image',''))
  const [templeAudioId,setTempleAudioId]=useState<string>(()=>read('temple-audio',''))
  const [intention,setIntention]=useState<string>(()=>read('temple-intention',''))
  const [savedIntention,setSavedIntention]=useState<string>(()=>read('temple-saved-intention',''))
  const [installPrompt,setInstallPrompt]=useState<any>(null)
  const [toast,setToast]=useState('')
  const [showAll,setShowAll]=useState(false)

  useEffect(()=>persist('entries',entries),[entries])
  useEffect(()=>persist('journals',journals),[journals])
  useEffect(()=>persist('assets',assets),[assets])
  useEffect(()=>persist('temple-image',templeImageId),[templeImageId])
  useEffect(()=>persist('temple-audio',templeAudioId),[templeAudioId])
  useEffect(()=>persist('temple-intention',intention),[intention])
  useEffect(()=>persist('temple-saved-intention',savedIntention),[savedIntention])
  useEffect(()=>{const handler=(e:Event)=>{e.preventDefault();setInstallPrompt(e)};window.addEventListener('beforeinstallprompt',handler);return()=>window.removeEventListener('beforeinstallprompt',handler)},[])
  useEffect(()=>{if(!running)return;const id=window.setInterval(()=>setSeconds(s=>{if(s<=1){setRunning(false);setToast('Séance terminée. Prends un instant pour observer ton état.');return 0}return s-1}),1000);return()=>clearInterval(id)},[running])
  useEffect(()=>{if(!toast)return;const id=setTimeout(()=>setToast(''),3200);return()=>clearTimeout(id)},[toast])

  const dayEntries=useMemo(()=>entries.filter(e=>e.date===selectedDate).sort((a,b)=>a.hour-b.hour),[entries,selectedDate])
  const average=(items:number[])=>items.length?items.reduce((a,b)=>a+b,0)/items.length:0
  const avgEmotion=average(dayEntries.map(e=>e.emotionScore))
  const avgFeeling=average(dayEntries.map(e=>e.feelingScore))
  const avgAttention=average(dayEntries.map(e=>e.attention))
  const weekEntries=entries.filter(e=>{const d=new Date(e.date+'T12:00:00');const start=new Date();start.setDate(start.getDate()-6);start.setHours(0,0,0,0);return d>=start&&d<=new Date()})
  const overall=(avgEmotion+avgFeeling)/2
  const quality=dayEntries.length===0?'À découvrir':overall>=6?'Très harmonieuse':overall>=2?'Favorable':overall>=-3?'À rééquilibrer':'Journée difficile'
  const saveEntry=()=>{
    const now=new Date()
    const item:Entry={id:uid(),date:selectedDate,hour:now.getHours(),emotion,emotionScore,emotionIntensity,feeling,feelingScore,feelingIntensity,thought,thoughtType,thoughtScore,attention,note,createdAt:Date.now()}
    setEntries(prev=>[...prev.filter(e=>!(e.date===selectedDate&&e.hour===item.hour)),item].sort((a,b)=>a.createdAt-b.createdAt))
    setToast('Observation enregistrée sur cet appareil.')
    setThought('');setNote('')
  }
  const saveJournal=()=>{if(!journalBody.trim())return;setJournals(p=>[{id:uid(),date:today(),title:journalTitle||'Journal du jour',body:journalBody},...p]);setJournalTitle('');setJournalBody('');setToast('Journal enregistré.')}
  const importAsset=async(files:FileList|null)=>{if(!files)return;for(const file of Array.from(files)){const data=await new Promise<string>((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(String(r.result));r.onerror=reject;r.readAsDataURL(file)});setAssets(p=>[{id:uid(),name:file.name,type:file.type,data,date:today()},...p])}setToast('Ressource ajoutée à la bibliothèque locale.')}
  const importTempleImage=async(file:File|null)=>{if(!file)return;if(!file.type.startsWith('image/')){setToast('Choisis un fichier image.');return}const data=await new Promise<string>((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(String(r.result));r.onerror=reject;r.readAsDataURL(file)});const id=uid();setAssets(p=>[{id,name:file.name,type:file.type,data,date:today()},...p]);setTempleImageId(id);setToast('Image ajoutée au Temple et à la Bibliothèque.')}
  const templeImage=assets.find(a=>a.id===templeImageId&&a.type.startsWith('image/'))
  const templeAudio=assets.find(a=>a.id===templeAudioId&&a.type.startsWith('audio/'))
  const saveIntention=()=>{if(!intention.trim()){setToast('Écris d’abord ton intention.');return}setSavedIntention(intention.trim());setToast('Ton intention est enregistrée dans le Temple.')}
  const exportData=()=>{const blob=new Blob([JSON.stringify({entries,journals,assets:assets.map(({data,...a})=>({...a,data})),exportedAt:new Date().toISOString()},null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='stay-alive-sauvegarde.json';a.click();URL.revokeObjectURL(url)}
  const nav=[{name:'Contrôle',icon:Activity},{name:'Journal',icon:BookOpen},{name:'Bibliothèque',icon:Library},{name:'Temple',icon:Sparkles},{name:'Évolution',icon:Leaf}]
  const fmt=(s:number)=>String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0')
  const dateLabel=new Intl.DateTimeFormat('fr-FR',{weekday:'long',day:'numeric',month:'long'}).format(new Date(selectedDate+'T12:00:00'))

  return <div className="app-shell">
    <aside className="sidebar">
      <div className="brand"><span className="brand-mark"><Leaf size={23}/></span><div><b>stay-alive</b><small>LE TEMPLE DE LA CONSCIENCE</small></div></div>
      <div className="side-caption">ESPACE PERSONNEL</div>
      <nav>{nav.map(({name,icon:Icon})=><button key={name} className={tab===name?'nav-item active':'nav-item'} onClick={()=>setTab(name)}><Icon size={18}/><span>{name}</span>{tab===name&&<span className="nav-dot"/>}</button>)}</nav>
      <div className="sidebar-bottom"><div className="privacy"><ShieldCheck size={17}/><span>Données privées<br/><small>Stockées sur cet appareil</small></span></div><button className="nav-item" onClick={exportData}><Download size={17}/>Sauvegarder mes données</button></div>
    </aside>
    <main className="main">
      <header className="topbar"><div className="mobile-brand"><Leaf size={20}/> stay-alive</div><div className="top-date"><Sun size={16}/>{dateLabel}</div><div className="top-actions"><span className="online"><i/>Mode local</span>{installPrompt&&<button className="install-btn" onClick={async()=>{await installPrompt.prompt();setInstallPrompt(null)}}><Download size={15}/> Installer</button>}</div></header>
      <div className="content">
        <section className="welcome"><div><div className="eyebrow">UN ESPACE POUR REVENIR À SOI</div><h1>{tab==='Contrôle'?'Observe ton monde intérieur.':tab==='Journal'?'Dépose tes pensées.':tab==='Bibliothèque'?'Tes ressources, à portée de main.':tab==='Temple'?'Retrouve ton espace de calme.':'Cultive ton évolution.'}</h1><p>Avance avec douceur. Chaque observation est une occasion de mieux te comprendre.</p></div><div className="welcome-leaf"><Leaf size={42} strokeWidth={1}/></div></section>

        {tab==='Contrôle'&&<div className="page-grid">
          <section className="panel main-panel"><div className="panel-heading"><div><span className="eyebrow">OBSERVATION INTÉRIEURE</span><h2>Mon état de cette heure</h2></div><span className="time-pill"><Clock3 size={14}/>{new Date().toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'})}</span></div>
            <div className="field-group"><label><Heart size={16}/> Émotion dominante</label><div className="choice-grid">{EMOTIONS.slice(0,showAll?EMOTIONS.length:12).map(e=><button key={e} className={emotion===e?'choice selected':'choice'} onClick={()=>setEmotion(e)}>{e}</button>)}</div><button className="text-action" onClick={()=>setShowAll(v=>!v)}>{showAll?'Réduire':'Voir toutes les émotions'} <ChevronRight size={14}/></button><div className="score-row"><span>Valence émotionnelle</span><b className={emotionScore>=0?'positive':'negative'}>{scoreLabel(emotionScore)}</b></div><input type="range" min="-10" max="10" value={emotionScore} onChange={e=>setEmotionScore(+e.target.value)}/><div className="range-labels"><span>−10 · Difficile</span><span>+10 · Agréable</span></div><div className="score-row compact"><span>Intensité</span><b>{emotionIntensity}/10</b></div><input type="range" min="0" max="10" value={emotionIntensity} onChange={e=>setEmotionIntensity(+e.target.value)}/></div>
            <div className="field-group"><label><Wind size={16}/> Sentiment dominant</label><div className="choice-grid">{FEELINGS.slice(0,showAll?FEELINGS.length:10).map(e=><button key={e} className={feeling===e?'choice selected':'choice'} onClick={()=>setFeeling(e)}>{e}</button>)}</div><div className="score-row"><span>Valence sentimentale</span><b className={feelingScore>=0?'positive':'negative'}>{scoreLabel(feelingScore)}</b></div><input type="range" min="-10" max="10" value={feelingScore} onChange={e=>setFeelingScore(+e.target.value)}/><div className="score-row compact"><span>Intensité</span><b>{feelingIntensity}/10</b></div><input type="range" min="0" max="10" value={feelingIntensity} onChange={e=>setFeelingIntensity(+e.target.value)}/></div>
            <div className="field-group"><label><Brain size={16}/> Pensée dominante</label><select value={thoughtType} onChange={e=>setThoughtType(e.target.value)}>{THOUGHTS.map(t=><option key={t}>{t}</option>)}</select><textarea value={thought} onChange={e=>setThought(e.target.value)} placeholder="Décris brièvement la pensée, la scène ou le sujet qui occupe ton esprit…"/><div className="score-row"><span>Tonalité de la pensée</span><b>{scoreLabel(thoughtScore)}</b></div><input type="range" min="-10" max="10" value={thoughtScore} onChange={e=>setThoughtScore(+e.target.value)}/><div className="score-row compact"><span>Capture de l'attention</span><b>{attention}/10</b></div><input type="range" min="0" max="10" value={attention} onChange={e=>setAttention(+e.target.value)}/></div>
            <div className="field-group"><label>Contexte ou déclencheur <span className="optional">FACULTATIF</span></label><textarea className="short-text" value={note} onChange={e=>setNote(e.target.value)} placeholder="Personne, conversation, souvenir, média, événement…"/></div>
            <button className="primary-btn full" onClick={saveEntry}><Save size={17}/> Enregistrer mon observation</button>
            <p className="micro-note">Une observation par heure est conservée. Si tu la modifies dans la même heure, elle est remplacée.</p>
          </section>
          <aside className="right-column"><section className="panel today-panel"><div className="panel-heading"><div><span className="eyebrow">AUJOURD'HUI</span><h3>Mon équilibre</h3></div><CalendarDays size={19}/></div><div className="quality">{quality}</div><div className="metric-list"><div><span>Valence émotionnelle</span><b>{dayEntries.length?scoreLabel(+avgEmotion.toFixed(1)):'—'}</b></div><div><span>Valence sentimentale</span><b>{dayEntries.length?scoreLabel(+avgFeeling.toFixed(1)):'—'}</b></div><div><span>Capture attentionnelle</span><b>{dayEntries.length?avgAttention.toFixed(1)+'/10':'—'}</b></div><div><span>Heures observées</span><b>{dayEntries.length}/24</b></div></div><div className="progress"><span style={{width:(dayEntries.length/24*100)+'%'}}/></div><small className="muted">Ces indicateurs décrivent tes saisies, pas ta valeur ni un diagnostic.</small></section>
            <section className="panel timeline-panel"><div className="panel-heading"><div><span className="eyebrow">TON PARCOURS</span><h3>Observations du jour</h3></div><span className="count">{dayEntries.length}</span></div><div className="timeline">{dayEntries.length?dayEntries.map(e=><div className="timeline-item" key={e.id}><span className="timeline-time">{String(e.hour).padStart(2,'0')} h</span><span className="timeline-line"/><div><b>{e.emotion} <em>{scoreLabel(e.emotionScore)}</em></b><small>{e.feeling} · {e.thoughtType}</small></div></div>):<div className="empty-state"><Leaf size={25}/><p>Ta journée commence ici.</p><small>Enregistre ta première observation pour voir apparaître ton parcours.</small></div>}</div></section></aside>
        </div>}

        {tab==='Journal'&&<div className="single-grid"><section className="panel"><div className="panel-heading"><div><span className="eyebrow">ÉCRITURE CONSCIENTE</span><h2>Journal personnel</h2></div><BookOpen/></div><input className="title-input" value={journalTitle} onChange={e=>setJournalTitle(e.target.value)} placeholder="Titre de ton entrée"/><textarea className="journal-editor" value={journalBody} onChange={e=>setJournalBody(e.target.value)} placeholder="Que souhaites-tu déposer ici ? Écris librement, sans te juger…"/><button className="primary-btn" onClick={saveJournal}><Save size={16}/> Enregistrer dans mon journal</button><div className="prompt-box"><b>Quelques pistes pour ton bilan du soir</b><ul><li>Qu'est-ce qui a nourri ma paix aujourd'hui ?</li><li>Qu'est-ce qui a capturé mon attention ?</li><li>Quelle émotion ai-je eu du mal à accueillir ?</li><li>Quelle petite action puis-je choisir demain ?</li></ul></div></section><section className="panel"><div className="panel-heading"><h3>Mes écrits</h3><span className="count">{journals.length}</span></div>{journals.length?journals.filter(j=>(j.title+j.body).toLowerCase().includes(query.toLowerCase())).map(j=><article className="journal-entry" key={j.id}><small>{j.date}</small><h3>{j.title}</h3><p>{j.body}</p><button className="icon-button" onClick={()=>setJournals(p=>p.filter(x=>x.id!==j.id))}><Trash2 size={15}/></button></article>):<div className="empty-state"><BookOpen/><p>Ton journal est encore vierge.</p></div>}</section></div>}

        {tab==='Bibliothèque'&&<div className="single-grid"><section className="panel"><div className="panel-heading"><div><span className="eyebrow">ESPACE DE RESSOURCES</span><h2>Ma bibliothèque</h2></div><Library/></div><p className="muted">Importe des images, sons et documents. Ils sont conservés dans le stockage local de cet appareil.</p><label className="upload-zone"><Upload size={25}/><b>Ajouter des ressources</b><span>Images, audio, PDF et autres fichiers</span><input type="file" multiple accept="image/*,audio/*,application/pdf,text/plain" onChange={e=>importAsset(e.target.files)}/></label><div className="asset-grid">{assets.filter(a=>a.name.toLowerCase().includes(query.toLowerCase())).map(a=><div className="asset" key={a.id}>{a.type.startsWith('image/')?<img src={a.data} alt={a.name}/>:<div className="asset-icon"><BookOpen/></div>}<div><b>{a.name}</b><small>{a.date} · {a.type.split('/')[0]||'fichier'}</small></div><button className="icon-button" onClick={()=>setAssets(p=>p.filter(x=>x.id!==a.id))}><Trash2 size={15}/></button></div>)}</div></section><section className="panel"><h3>Une bibliothèque à ton rythme</h3><p className="muted">Tes ressources restent sur cet appareil. Pense à exporter régulièrement tes données pour éviter toute perte en cas de changement de navigateur ou d'appareil.</p><button className="secondary-btn" onClick={exportData}><Download size={16}/> Exporter mes ressources et données</button></section></div>}

        {tab==='Temple'&&<div className="temple-layout">
          <section className="meditation-screen">
            <div className="temple-visual">
              {templeImage?<img src={templeImage.data} alt="Support visuel de méditation" className="temple-image"/>:<div className="temple-glow"><div className="sun-disc"/></div>}
            </div>
            <span className="eyebrow">TON ESPACE DE SILENCE</span>
            <h2>{running?'Reviens doucement à ta respiration.':'Prends un instant pour toi.'}</h2>
            <p>Laisse les pensées passer. Tu n'as rien à résoudre pendant cet instant.</p>
            {savedIntention&&<blockquote className="active-intention">« {savedIntention} »</blockquote>}
            <div className="timer">{fmt(seconds||meditationMinutes*60)}</div>
            <div className="timer-controls"><button className="primary-btn" onClick={()=>{if(!running&&seconds===0)setSeconds(meditationMinutes*60);setRunning(!running)}}>{running?'Pause':seconds>0?'Reprendre':'Commencer'}</button><button className="secondary-btn" onClick={()=>{setRunning(false);setSeconds(0)}}>Réinitialiser</button></div>
            <label className="duration-label">Durée <select value={meditationMinutes} onChange={e=>{setMeditationMinutes(+e.target.value);setSeconds(0);setRunning(false)}}><option value={3}>3 minutes</option><option value={5}>5 minutes</option><option value={10}>10 minutes</option><option value={15}>15 minutes</option><option value={20}>20 minutes</option><option value={30}>30 minutes</option></select></label>
          </section>
          <div className="temple-tools">
            <section className="panel temple-tool-panel">
              <div className="panel-heading"><div><span className="eyebrow">SUPPORT VISUEL</span><h3>Mon image de méditation</h3></div><ImagePlus size={20}/></div>
              {templeImage?<div className="temple-preview"><img src={templeImage.data} alt={templeImage.name}/><div><b>{templeImage.name}</b><button className="text-action" onClick={()=>setTempleImageId('')}>Retirer l’image</button></div></div>:<p className="muted">Choisis une image apaisante à garder sous les yeux pendant ta séance.</p>}
              <label className="temple-upload"><Upload size={16}/> Importer une image<input type="file" accept="image/*" onChange={e=>{importTempleImage(e.target.files?.[0]||null);e.currentTarget.value=''}}/></label>
              <label className="temple-select-label">Ou choisir dans ma bibliothèque
                <select value={templeImageId} onChange={e=>setTempleImageId(e.target.value)}><option value="">Aucune image sélectionnée</option>{assets.filter(a=>a.type.startsWith('image/')).map(a=><option key={a.id} value={a.id}>{a.name}</option>)}</select>
              </label>
            </section>
            <section className="panel temple-tool-panel">
              <div className="panel-heading"><div><span className="eyebrow">AMBIANCE SONORE</span><h3>Ma musique</h3></div><Wind size={20}/></div>
              <label className="temple-select-label">Choisir un son dans ma bibliothèque
                <select value={templeAudioId} onChange={e=>setTempleAudioId(e.target.value)}><option value="">Aucune musique</option>{assets.filter(a=>a.type.startsWith('audio/')).map(a=><option key={a.id} value={a.id}>{a.name}</option>)}</select>
              </label>
              {templeAudio?<div className="audio-player"><div className="audio-file"><Sparkles size={17}/><b>{templeAudio.name}</b></div><audio key={templeAudio.id} controls preload="metadata" src={templeAudio.data}>Ton navigateur ne prend pas en charge la lecture audio.</audio></div>:<p className="muted">Ajoute des fichiers audio dans la Bibliothèque pour les retrouver ici et les écouter pendant ta méditation.</p>}
              <button className="secondary-btn" onClick={()=>setTab('Bibliothèque')}><Library size={15}/> Ouvrir la Bibliothèque</button>
            </section>
            <section className="panel temple-tool-panel">
              <div className="panel-heading"><div><span className="eyebrow">AUTOSUGGESTION</span><h3>Mon intention personnelle</h3></div><Heart size={19}/></div>
              <p className="muted">Écris une phrase positive, réaliste et personnelle que tu souhaites méditer ou te répéter.</p>
              <textarea className="intention-editor" value={intention} onChange={e=>setIntention(e.target.value)} placeholder="Ex. : Je prends le temps d'observer mes émotions et de choisir mes réactions avec calme."/>
              <button className="primary-btn" onClick={saveIntention}><Save size={15}/> Enregistrer mon intention</button>
              {savedIntention&&<div className="saved-intention"><small>INTENTION ENREGISTRÉE</small><p>{savedIntention}</p><button className="text-action" onClick={()=>setIntention(savedIntention)}>Modifier cette intention</button></div>}
            </section>
          </div>
        </div>}
        {tab==='Évolution'&&<div className="evolution-grid"><section className="panel"><span className="eyebrow">LES 7 DERNIERS JOURS</span><h2>Observer les tendances</h2><p className="muted">Synthèse descriptive calculée à partir des observations enregistrées.</p><div className="big-number">{weekEntries.length}<small> observations</small></div><div className="metric-list"><div><span>Valence émotionnelle moyenne</span><b>{weekEntries.length?scoreLabel(+average(weekEntries.map(e=>e.emotionScore)).toFixed(1)):'—'}</b></div><div><span>Valence sentimentale moyenne</span><b>{weekEntries.length?scoreLabel(+average(weekEntries.map(e=>e.feelingScore)).toFixed(1)):'—'}</b></div><div><span>Capture attentionnelle moyenne</span><b>{weekEntries.length?average(weekEntries.map(e=>e.attention)).toFixed(1)+'/10':'—'}</b></div><div><span>Jours avec observations</span><b>{new Set(weekEntries.map(e=>e.date)).size}/7</b></div></div></section><section className="panel"><span className="eyebrow">REPÈRES DE LA SEMAINE</span><h3>Ce qui revient le plus souvent</h3>{weekEntries.length?<><p>Émotion la plus notée : <b>{mode(weekEntries.map(e=>e.emotion))}</b></p><p>Sentiment le plus noté : <b>{mode(weekEntries.map(e=>e.feeling))}</b></p><p>Type de pensée le plus noté : <b>{mode(weekEntries.map(e=>e.thoughtType))}</b></p><div className="prompt-box">Piste de réflexion : dans quelles situations ces expériences apparaissent-elles ? Cherche les contextes récurrents avant de tirer une conclusion.</div></>:<div className="empty-state"><Leaf/><p>Les tendances apparaîtront après quelques observations.</p></div>}</section><section className="panel"><h3>Historique</h3><label className="date-field">Choisir une journée <input type="date" value={selectedDate} onChange={e=>setSelectedDate(e.target.value)}/></label><p className="muted">{dayEntries.length} observations enregistrées pour cette date.</p><button className="secondary-btn" onClick={()=>setTab('Contrôle')}>Voir les observations <ChevronRight size={15}/></button></section></div>}
      </div>
      <footer>STAY-ALIVE <span>·</span> Observer sans se juger. Évoluer sans se contraindre.</footer>
    </main>
    {toast&&<div className="toast"><Check size={16}/>{toast}</div>}
    <nav className="mobile-nav">{nav.map(({name,icon:Icon})=><button key={name} className={tab===name?'active':''} onClick={()=>setTab(name)}><Icon size={19}/><small>{name}</small></button>)}</nav>
  </div>
}
function mode(values:string[]){const counts=new Map<string,number>();values.forEach(v=>counts.set(v,(counts.get(v)||0)+1));return [...counts.entries()].sort((a,b)=>b[1]-a[1])[0]?.[0]||'—'}
