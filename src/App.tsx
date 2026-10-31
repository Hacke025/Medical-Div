import { useEffect, useMemo, useRef, useState } from "react";
import {
  Accessibility, ArrowRight, BookOpen, CalendarDays, Check, Clock3, FileText, HeartPulse, Menu, Mic, Minus, Plus,
  Search, Settings2, ShieldCheck, Sparkles, Stethoscope, Type, Volume2, X, Copy
} from "lucide-react";

type ContrastMode = "standard" | "high" | "dark";
type AccessProfile = {
  communication: string;
  visitFormat: string;
  accommodation: string;
  accessNeeds: string[];
};

type Preferences = {
  fontScale: number;
  contrast: ContrastMode;
  dyslexiaFont: boolean;
  reducedMotion: boolean;
  spaciousText: boolean;
};

const defaultPreferences: Preferences = {
  fontScale: 1,
  contrast: "standard",
  dyslexiaFont: false,
  reducedMotion: false,
  spaciousText: false,
};

const articles = [
  {
    icon: CalendarDays,
    category: "APPOINTMENTS",
    title: "Getting ready for a medical appointment",
    description: "A simple checklist to help you feel prepared before, during, and after your visit.",
    time: "4 min read",
  },
  {
    icon: FileText,
    category: "HEALTHCARE FORMS",
    title: "Understanding common healthcare forms",
    description: "Learn what common registration and consent forms are asking in plain language.",
    time: "6 min read",
  },
  {
    icon: HeartPulse,
    category: "ACCESSIBILITY",
    title: "Asking for an accessibility accommodation",
    description: "Examples of accommodations you can ask a healthcare office about before a visit.",
    time: "3 min read",
  },
];

function App() {
  const [preferences, setPreferences] = useState<Preferences>(() => {
    try {
      const saved = localStorage.getItem("careway-preferences");
      return saved ? { ...defaultPreferences, ...JSON.parse(saved) } : defaultPreferences;
    } catch {
      return defaultPreferences;
    }
  });
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [announcement, setAnnouncement] = useState("");
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formName, setFormName] = useState("");
  const [formReason, setFormReason] = useState("");
  const [profileSaved, setProfileSaved] = useState(false);
  const [voiceOpen, setVoiceOpen] = useState(false);
  const [voiceListening, setVoiceListening] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState("");
  const [voiceStatus, setVoiceStatus] = useState("Tap the microphone, then say a command.");
  const recognitionRef = useRef<any>(null);
  const [glossaryQuery, setGlossaryQuery] = useState("");
  const [questionTopics, setQuestionTopics] = useState<string[]>(["Understanding next steps"]);
  const [questionNotes, setQuestionNotes] = useState("");
  const [questionsCopied, setQuestionsCopied] = useState(false);
  const [completedTasks, setCompletedTasks] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem("careway-checklist") || "[]"); } catch { return []; }
  });
  const [profile, setProfile] = useState<AccessProfile>(() => {
    try {
      const saved = localStorage.getItem("careway-demo-profile");
      return saved ? { communication: "No preference selected", visitFormat: "No preference selected", accommodation: "", accessNeeds: [], ...JSON.parse(saved) } : { communication: "No preference selected", visitFormat: "No preference selected", accommodation: "", accessNeeds: [] };
    } catch {
      return { communication: "No preference selected", visitFormat: "No preference selected", accommodation: "", accessNeeds: [] };
    }
  });

  useEffect(() => {
    localStorage.setItem("careway-preferences", JSON.stringify(preferences));
  }, [preferences]);

  useEffect(() => {
    return () => recognitionRef.current?.stop?.();
  }, []);

  useEffect(() => {
    if (!settingsOpen && !voiceOpen) return;
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") { setSettingsOpen(false); setVoiceOpen(false); stopVoiceRecognition(); }
    }
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [settingsOpen, voiceOpen]);

  function saveProfile(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    localStorage.setItem("careway-demo-profile", JSON.stringify(profile));
    setProfileSaved(true);
    setAnnouncement("Your demo accessibility preferences were saved in this browser.");
  }

  function clearProfile() {
    const emptyProfile = { communication: "No preference selected", visitFormat: "No preference selected", accommodation: "", accessNeeds: [] as string[] };
    setProfile(emptyProfile);
    localStorage.removeItem("careway-demo-profile");
    setProfileSaved(false);
  }

  const filteredArticles = useMemo(
    () => articles.filter((article) =>
      (article.title + " " + article.description + " " + article.category)
        .toLowerCase().includes(query.toLowerCase())
    ),
    [query],
  );

  function updatePreference<K extends keyof Preferences>(key: K, value: Preferences[K]) {
    setPreferences((current) => ({ ...current, [key]: value }));
  }

  function speakPage() {
    if (!("speechSynthesis" in window)) {
      setAnnouncement("Text-to-speech is not available in this browser.");
      return;
    }
    window.speechSynthesis.cancel();
    const text = document.querySelector("main")?.textContent?.replace(/\s+/g, " ").trim();
    if (!text) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    window.speechSynthesis.speak(utterance);
    setAnnouncement("Reading the main page content.");
  }

  function stopSpeaking() {
    window.speechSynthesis?.cancel();
    setAnnouncement("Reading stopped.");
  }

  const checklistItems = [
    "Write down the main questions I want to ask",
    "Check the appointment time, location, and travel plan",
    "Ask the office about accessibility options I may need",
    "Check whether forms can be completed in advance",
    "Prepare a list of topics to discuss (avoid storing sensitive details here)",
    "Ask how to receive follow-up instructions in an accessible format",
  ];

  const glossary = [
    { term: "Referral", meaning: "A request from one healthcare professional for you to see another professional or service." },
    { term: "Co-pay", meaning: "A set amount you may have to pay for a covered service. The amount depends on your plan." },
    { term: "Deductible", meaning: "The amount your plan says you pay for certain covered services before the plan begins paying its share." },
    { term: "Prior authorization", meaning: "A decision your health plan may require before it agrees to cover a service or medicine." },
    { term: "Informed consent", meaning: "A process where a provider explains a proposed procedure or treatment, including important benefits and risks, so you can make a decision." },
    { term: "Discharge instructions", meaning: "Information given when you leave a healthcare facility. It may explain follow-up steps, warning signs, and who to contact with questions." },
    { term: "Medical record", meaning: "A collection of information about care you have received. You can ask a provider how to access or correct your record." },
    { term: "Accessibility accommodation", meaning: "A change or support that helps a person access a service or communicate. Availability depends on the setting and request." },
  ];

  function runVoiceCommand(rawCommand: string) {
    const command = rawCommand.toLowerCase().replace(/[^a-z0-9 ]/g, "").trim();
    setVoiceTranscript(rawCommand);
    if (/increase text|bigger text|larger text|text up/.test(command)) {
      updatePreference("fontScale", Math.min(1.5, +(preferences.fontScale + 0.1).toFixed(1)));
      setVoiceStatus("Text size increased.");
    } else if (/decrease text|smaller text|text down/.test(command)) {
      updatePreference("fontScale", Math.max(0.9, +(preferences.fontScale - 0.1).toFixed(1)));
      setVoiceStatus("Text size decreased.");
    } else if (/high contrast/.test(command)) {
      updatePreference("contrast", "high"); setVoiceStatus("High contrast enabled.");
    } else if (/dark mode|dark theme/.test(command)) {
      updatePreference("contrast", "dark"); setVoiceStatus("Dark mode enabled.");
    } else if (/standard mode|normal colors|light mode/.test(command)) {
      updatePreference("contrast", "standard"); setVoiceStatus("Standard colors enabled.");
    } else if (/open accessibility|accessibility settings/.test(command)) {
      setSettingsOpen(true); setVoiceStatus("Accessibility settings opened.");
    } else if (/close settings|close accessibility/.test(command)) {
      setSettingsOpen(false); setVoiceStatus("Accessibility settings closed.");
    } else if (/read page|read this page|start reading/.test(command)) {
      speakPage(); setVoiceStatus("Reading the page aloud.");
    } else if (/stop reading|stop speaking/.test(command)) {
      stopSpeaking(); setVoiceStatus("Reading stopped.");
    } else if (/go to resources|open resources|show guides/.test(command)) {
      document.getElementById("resources")?.scrollIntoView({ behavior: preferences.reducedMotion ? "auto" : "smooth" }); setVoiceStatus("Showing healthcare guides.");
    } else if (/go to appointment|appointment preparation|prepare for visit/.test(command)) {
      document.getElementById("prepare")?.scrollIntoView({ behavior: preferences.reducedMotion ? "auto" : "smooth" }); setVoiceStatus("Showing appointment preparation.");
    } else if (/open profile|go to profile|access profile/.test(command)) {
      document.getElementById("profile")?.scrollIntoView({ behavior: preferences.reducedMotion ? "auto" : "smooth" }); setVoiceStatus("Showing your access profile.");
    } else if (/go to glossary|open glossary|healthcare terms/.test(command)) {
      document.getElementById("glossary")?.scrollIntoView({ behavior: preferences.reducedMotion ? "auto" : "smooth" }); setVoiceStatus("Showing the healthcare glossary.");
    } else if (/scroll down/.test(command)) {
      window.scrollBy({ top: window.innerHeight * 0.75, behavior: preferences.reducedMotion ? "auto" : "smooth" }); setVoiceStatus("Scrolling down.");
    } else if (/scroll up/.test(command)) {
      window.scrollBy({ top: -window.innerHeight * 0.75, behavior: preferences.reducedMotion ? "auto" : "smooth" }); setVoiceStatus("Scrolling up.");
    } else if (/help|what can i say|commands/.test(command)) {
      setVoiceOpen(true); setVoiceStatus("Try: increase text, dark mode, high contrast, read page, go to resources, or open profile.");
    } else {
      setVoiceStatus("I didn't recognize that command. Select Help to see examples.");
    }
  }

  function stopVoiceRecognition() {
    recognitionRef.current?.stop?.();
    recognitionRef.current = null;
    setVoiceListening(false);
  }

  async function copyAccessRequest() {
    const needs = profile.accessNeeds?.length ? profile.accessNeeds.join(", ") : "I would like to discuss accessibility options.";
    const message = "Hello, I am preparing for an appointment and would like to ask about accessibility arrangements.\n\nMy access preferences: " + needs + ".\nCommunication preference: " + profile.communication + ".\nVisit preference: " + profile.visitFormat + ".\nAdditional note: " + (profile.accommodation || "I would like to discuss available options.") + "\n\nPlease let me know what arrangements are available and whether you need any information from me in advance.";
    try {
      await navigator.clipboard.writeText(message);
      setAnnouncement("Your sample accommodation request was copied. Review it and edit it before sending.");
    } catch {
      setAnnouncement("Copy is unavailable in this browser. You can select and copy the request manually if displayed.");
    }
  }

  function startVoiceRecognition() {
    const browserWindow = window as Window & { SpeechRecognition?: new () => any; webkitSpeechRecognition?: new () => any };
    const Recognition = browserWindow.SpeechRecognition || browserWindow.webkitSpeechRecognition;
    if (!Recognition) {
      setVoiceStatus("Voice recognition is not supported in this browser. Try a recent version of Chrome or Edge, or use the buttons and settings instead.");
      return;
    }
    const recognition = new Recognition();
    recognitionRef.current = recognition;
    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onstart = () => { setVoiceListening(true); setVoiceStatus("Listening. Say a command clearly."); };
    recognition.onresult = (event: any) => runVoiceCommand(event.results[0][0].transcript);
    recognition.onerror = (event: any) => {
      setVoiceStatus(event.error === "not-allowed" ? "Microphone permission was blocked. Allow microphone access in your browser settings." : "Voice input had a problem (" + event.error + "). Try again or use the on-screen controls.");
      setVoiceListening(false);
    };
    recognition.onend = () => { setVoiceListening(false); recognitionRef.current = null; };
    try { recognition.start(); } catch { recognitionRef.current = null; setVoiceListening(false); setVoiceStatus("The microphone could not start. Please try again."); }
  }

  function toggleAccessNeed(need: string) {
    setProfile((current: any) => ({ ...current, accessNeeds: (current.accessNeeds || []).includes(need) ? current.accessNeeds.filter((item: string) => item !== need) : [...(current.accessNeeds || []), need] }));
    setProfileSaved(false);
  }

  function toggleChecklist(item: string) {
    setCompletedTasks((current) => {
      const next = current.includes(item) ? current.filter((entry) => entry !== item) : [...current, item];
      localStorage.setItem("careway-checklist", JSON.stringify(next));
      return next;
    });
  }

  const questionBank: Record<string, string[]> = {
    "Understanding next steps": ["What happens after today?", "Could you explain the next steps in order?", "Who should I contact if I have questions later?"],
    "Communication": ["Could I receive the instructions in writing?", "What communication options are available if I need clarification?"],
    "Accessibility": ["What accessibility arrangements can be made for this visit?", "Can you tell me about accessible check-in and waiting options?"],
    "Costs and coverage": ["Could someone explain the expected costs before I make a decision?", "Who can help me understand what my plan may cover?"],
    "Forms and paperwork": ["Can I review or complete forms in an accessible format before the visit?", "Could you explain any section I am unsure about?"],
    "Follow-up": ["How and when should I expect follow-up information?", "What is the best way to contact the office after this visit?"],
  };
  const suggestedQuestions = questionTopics.flatMap((topic) => questionBank[topic] || []);
  async function copyQuestionList() {
    const content = "Questions I may want to ask\\n\\n" + suggestedQuestions.map((q) => "• " + q).join("\\n") + (questionNotes.trim() ? "\\n\\nMy note: " + questionNotes.trim() : "");
    try {
      await navigator.clipboard.writeText(content);
      setQuestionsCopied(true);
      setAnnouncement("Your question list was copied. Review it and remove anything you do not want to share.");
    } catch {
      setAnnouncement("Copy is unavailable in this browser. You can select the questions and copy them manually.");
    }
  }
  function toggleQuestionTopic(topic: string) {
    setQuestionTopics((current) => current.includes(topic) ? current.filter((item) => item !== topic) : [...current, topic]);
    setQuestionsCopied(false);
  }

  function submitDemoForm(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormSubmitted(true);
    setAnnouncement("Your demo request has been recorded on this page only. No information was sent.");
  }

  const appClasses = [
    "app-shell",
    "contrast-" + preferences.contrast,
    preferences.dyslexiaFont ? "font-dyslexia" : "",
    preferences.reducedMotion ? "reduce-motion" : "",
    preferences.spaciousText ? "spacious-text" : "",
  ].filter(Boolean).join(" ");

  return (
    <div className={appClasses} style={{ "--font-scale": preferences.fontScale } as React.CSSProperties}>
      <a className="skip-link" href="#main-content">Skip to main content</a>
      <div className="top-strip">
        <div className="container top-strip-inner">
          <span><ShieldCheck size={14} aria-hidden="true" /> A learning prototype — not a real medical portal</span>
          <span className="top-strip-note">Your demo preferences stay in this browser.</span>
        </div>
      </div>

      <header className="site-header">
        <div className="container header-inner">
          <a className="brand" href="#home" aria-label="Careway home">
            <span className="brand-mark"><HeartPulse size={22} /></span>
            <span>careway<span className="brand-period">.</span><small>HEALTHCARE, MADE CLEARER</small></span>
          </a>
          <button className="mobile-menu-button icon-button" onClick={() => setMenuOpen(!menuOpen)} aria-expanded={menuOpen} aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}>
            {menuOpen ? <X /> : <Menu />}
          </button>
          <nav className={menuOpen ? "main-nav open" : "main-nav"} aria-label="Main navigation">
            <a href="#resources" onClick={() => setMenuOpen(false)}>Explore resources</a>
            <a href="#prepare" onClick={() => setMenuOpen(false)}>Prepare for a visit</a>
            <a href="#profile" onClick={() => setMenuOpen(false)}>My access profile</a>
            <a href="#checklist" onClick={() => setMenuOpen(false)}>Appointment checklist</a>
            <a href="#questions" onClick={() => setMenuOpen(false)}>Question builder</a>
            <a href="#glossary" onClick={() => setMenuOpen(false)}>Healthcare glossary</a>
            <a href="#about" onClick={() => setMenuOpen(false)}>About</a>
            <button className="nav-accessibility" onClick={() => setSettingsOpen(true)}><Accessibility size={17} /> Accessibility</button>
          </nav>
        </div>
      </header>

      <main id="main-content">
        <section className="hero" id="home">
          <div className="container hero-grid">
            <div className="hero-copy">
              <div className="eyebrow"><span className="eyebrow-dot" /> HEALTHCARE SHOULD BE FOR EVERYONE</div>
              <h1>Healthcare can be complicated. <em>Finding your way shouldn't be.</em></h1>
              <p className="hero-description">A calmer, clearer way to understand healthcare information, prepare for appointments, and explore accessibility options.</p>
              <div className="hero-actions">
                <a className="button button-primary" href="#resources">Explore the guide <ArrowRight size={17} /></a>
                <button className="button button-secondary" onClick={speakPage}><Volume2 size={17} /> Read this page</button>
              </div>
              <div className="hero-trust"><ShieldCheck size={16} /> Designed with accessibility and user control in mind</div>
            </div>
            <div className="hero-visual" aria-label="Illustration of a person reviewing a care plan">
              <div className="visual-orbit orbit-one" />
              <div className="visual-orbit orbit-two" />
              <div className="visual-card card-main">
                <div className="visual-card-top"><span className="mini-icon"><HeartPulse size={18} /></span><span className="status-pill"><span /> YOUR CARE, YOUR WAY</span></div>
                <div className="visual-title">A little more clarity.</div>
                <div className="visual-line line-long" /><div className="visual-line line-short" />
                <div className="visual-check"><span><Check size={14} /></span><div><b>Know what to expect</b><small>Helpful steps, one at a time</small></div></div>
                <div className="visual-check"><span><Check size={14} /></span><div><b>Find ways to communicate</b><small>Options that respect your needs</small></div></div>
              </div>
              <div className="floating-note"><span><Accessibility size={18} /></span><div><b>Access for all</b><small>Personalize your experience</small></div></div>
              <div className="visual-sparkle sparkle-a">✳</div><div className="visual-sparkle sparkle-b">✦</div>
            </div>
          </div>
        </section>

        <section className="quick-section" aria-label="Quick links">
          <div className="container quick-grid">
            <a href="#resources" className="quick-card"><span className="quick-icon lavender"><BookOpen /></span><span><b>Learn in plain language</b><small>Clear explanations, less jargon</small></span><ArrowRight className="quick-arrow" size={18} /></a>
            <a href="#prepare" className="quick-card"><span className="quick-icon mint"><CalendarDays /></span><span><b>Prepare for a visit</b><small>Make a plan that works for you</small></span><ArrowRight className="quick-arrow" size={18} /></a>
            <button className="quick-card quick-card-button" onClick={() => setSettingsOpen(true)}><span className="quick-icon peach"><Accessibility /></span><span><b>Make this page yours</b><small>Adjust how you experience content</small></span><ArrowRight className="quick-arrow" size={18} /></button>
          </div>
        </section>

        <section className="resources-section section-pad" id="resources">
          <div className="container">
            <div className="section-heading">
              <div><div className="eyebrow">A GOOD PLACE TO START</div><h2>Make sense of the next step.</h2><p>Explore practical guides made to help healthcare feel a little less overwhelming.</p></div>
              <label className="search-box"><Search size={18} /><span className="sr-only">Search guides</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search guides..." /></label>
            </div>
            <div className="article-grid">
              {filteredArticles.map((article) => {
                const Icon = article.icon;
                return <article className="article-card" key={article.title}>
                  <div className="article-icon"><Icon size={21} /></div>
                  <div className="article-category">{article.category}</div>
                  <h3>{article.title}</h3><p>{article.description}</p>
                  <div className="article-footer"><span><Clock3 size={14} /> {article.time}</span><a href="#prepare" aria-label={"Read " + article.title}>Explore <ArrowRight size={15} /></a></div>
                </article>;
              })}
              {filteredArticles.length === 0 && <p className="empty-state">No guides match that search. Try a different word.</p>}
            </div>
          </div>
        </section>

        <section className="prepare-section section-pad" id="prepare">
          <div className="container prepare-grid">
            <div className="prepare-copy"><div className="eyebrow">YOUR VISIT, YOUR TERMS</div><h2>Start with what matters to you.</h2><p>Use this sample form to think through what you might want a healthcare office to know before an appointment. This demo does not contact a clinic or save your answers.</p>
              <div className="prepare-points"><div><span><Check size={15} /></span> Write down what you want help with</div><div><span><Check size={15} /></span> Think about communication preferences</div><div><span><Check size={15} /></span> Ask the office what accommodations are available</div></div>
            </div>
            <div className="demo-form-card">
              <div className="form-card-heading"><span className="form-icon"><Stethoscope size={20} /></span><div><h3>Appointment preparation</h3><p>A private, on-page planning exercise</p></div></div>
              {formSubmitted ? <div className="success-state"><span><Check size={22} /></span><h3>Plan drafted!</h3><p>Your sample answers are still only on this page. Nothing was sent to a healthcare provider.</p><button className="text-button" onClick={() => setFormSubmitted(false)}>Edit my answers</button></div> :
                <form onSubmit={submitDemoForm}>
                  <label htmlFor="demo-name">Name or nickname <span>(optional)</span></label><input id="demo-name" value={formName} onChange={(event) => setFormName(event.target.value)} placeholder="What should we call you?" />
                  <label htmlFor="demo-reason">What would you like to prepare for?</label><textarea id="demo-reason" value={formReason} onChange={(event) => setFormReason(event.target.value)} placeholder="For example: questions I want to ask, topics to discuss..." rows={4} />
                  <p className="privacy-note"><ShieldCheck size={15} /> Please don't enter real medical details. This is a demonstration only.</p>
                  <button className="button button-primary form-submit" type="submit">Create my sample plan <ArrowRight size={16} /></button>
                </form>}
            </div>
          </div>
        </section>

        <section className="checklist-section section-pad" id="checklist">
          <div className="container">
            <div className="section-heading"><div><div className="eyebrow">A PRACTICAL VISIT PLANNER</div><h2>Your appointment checklist.</h2><p>Mark the preparation steps that are useful to you. Your checklist stays in this browser and is not sent to a clinic.</p></div><div className="checklist-progress"><b>{completedTasks.length} / {checklistItems.length}</b><span>steps completed</span><div className="progress-track"><span style={{width: (completedTasks.length / checklistItems.length * 100) + "%"}} /></div></div></div>
            <div className="checklist-card">{checklistItems.map((item) => <label className="checklist-item" key={item}><input type="checkbox" checked={completedTasks.includes(item)} onChange={() => toggleChecklist(item)} /><span className="custom-check"><Check size={14} /></span><span>{item}</span></label>)}
              <button className="text-button" onClick={() => { setCompletedTasks([]); localStorage.removeItem("careway-checklist"); }}>Reset checklist</button>
            </div>
          </div>
        </section>

        <section className="glossary-section section-pad" id="glossary">
          <div className="container">
            <div className="section-heading"><div><div className="eyebrow">HEALTHCARE, IN PLAIN LANGUAGE</div><h2>A glossary without the jargon.</h2><p>Search common healthcare and insurance terms. These are general explanations; details can vary by provider and plan.</p></div><label className="search-box"><Search size={18} /><span className="sr-only">Search healthcare terms</span><input value={glossaryQuery} onChange={(event) => setGlossaryQuery(event.target.value)} placeholder="Search a term..." /></label></div>
            <div className="glossary-grid">{glossary.filter((entry) => (entry.term + " " + entry.meaning).toLowerCase().includes(glossaryQuery.toLowerCase())).map((entry) => <article className="glossary-card" key={entry.term}><h3>{entry.term}</h3><p>{entry.meaning}</p></article>)}
              {glossary.filter((entry) => (entry.term + " " + entry.meaning).toLowerCase().includes(glossaryQuery.toLowerCase())).length === 0 && <p>No matching terms. Try another search.</p>}
            </div>
            <p className="glossary-note">If a term appears in your own paperwork, ask the organization that sent it to explain how it applies to your situation.</p>
          </div>
        </section>

        <section className="profile-section section-pad" id="profile">
          <div className="container profile-grid">
            <div>
              <div className="eyebrow">YOUR PREFERENCES, YOUR CONTROL</div>
              <h2>Build a simple access profile.</h2>
              <p>Keep track of communication and visit preferences you may want to discuss with a healthcare office. This prototype stores these demo preferences only in this browser; it does not send them anywhere.</p>
              <div className="profile-callout"><ShieldCheck size={18} /><span><b>Privacy note</b><br />Do not enter diagnoses, medication details, insurance numbers, or other sensitive health information. Browser storage is not a secure medical record.</span></div>
            </div>
            <form className="demo-form-card profile-form" onSubmit={saveProfile}>
              <div className="form-card-heading"><span className="form-icon"><Accessibility size={20} /></span><div><h3>Accessibility preferences</h3><p>Optional demo profile</p></div></div>
              <label htmlFor="communication-preference">Preferred communication</label>
              <select id="communication-preference" value={profile.communication} onChange={(event) => { setProfile({ ...profile, communication: event.target.value }); setProfileSaved(false); }}>
                <option>No preference selected</option><option>Written instructions</option><option>Spoken explanation</option><option>Text or email communication</option><option>Interpreter or communication support</option><option>Other / prefer to discuss</option>
              </select>
              <label htmlFor="visit-format">Visit format preference</label>
              <select id="visit-format" value={profile.visitFormat} onChange={(event) => { setProfile({ ...profile, visitFormat: event.target.value }); setProfileSaved(false); }}>
                <option>No preference selected</option><option>In-person</option><option>Video appointment</option><option>Phone appointment</option><option>Depends on the appointment</option><option>Prefer to discuss</option>
              </select>
              <label htmlFor="accommodation-preference">Accommodation reminder <span>(optional)</span></label>
              <textarea id="accommodation-preference" rows={3} maxLength={240} value={profile.accommodation} onChange={(event) => { setProfile({ ...profile, accommodation: event.target.value }); setProfileSaved(false); }} placeholder="Example: Ask the office what accessible check-in options are available." />
              <div className="access-needs-picker">
                <label>What might make a visit easier? <span>(select any that apply)</span></label>
                <p>These are planning prompts, not diagnoses. You can leave everything unselected.</p>
                <div className="access-needs-grid">
                  {[
                    ["Vision","Large print, screen-reader-friendly information, or verbal directions"],
                    ["Hearing","Written instructions, captions, or an interpreter"],
                    ["Mobility","Step-free access, accessible exam equipment, or extra time to move"],
                    ["Communication","More time to respond, communication board, or support person"],
                    ["Learning and memory","Plain-language steps, repetition, or written reminders"],
                    ["Sensory needs","Quieter waiting area, reduced sensory stimulation, or predictable steps"],
                    ["Dexterity","Help with forms, accessible touchscreens, or alternative input"],
                    ["Fatigue or chronic conditions","Flexible scheduling, rest breaks, or shorter waiting where possible"]
                  ].map(([name, detail]) => <label className="need-option" key={name}><input type="checkbox" checked={(profile.accessNeeds || []).includes(name)} onChange={() => toggleAccessNeed(name)} /><span className="need-check"><Check size={13}/></span><span><b>{name}</b><small>{detail}</small></span></label>)}
                </div>
              </div>
              <p className="privacy-note"><ShieldCheck size={15} /> This is a personal planning aid, not a request sent to a provider. Don't enter sensitive medical details.</p>
              <div className="profile-actions"><button className="text-button" type="button" onClick={clearProfile}>Clear profile</button><button className="button button-primary" type="submit">{profileSaved ? "Saved" : "Save preferences"} <Check size={16} /></button></div>
              <button className="button button-secondary request-copy" type="button" onClick={copyAccessRequest}><Copy size={15}/> Copy sample accommodation request</button>
              {profileSaved && <p className="saved-message" role="status">Saved in this browser. You can edit or clear it at any time.</p>}
            </form>
          </div>
        </section>

        <section className="journey-section section-pad" id="journey">
          <div className="container">
            <div className="section-heading"><div><div className="eyebrow">ONE STEP AT A TIME</div><h2>Your care journey, made clearer.</h2><p>You can start wherever you are. Choose a step to jump to a practical tool.</p></div></div>
            <div className="journey-grid">
              <a className="journey-card" href="#resources"><span className="journey-number">01</span><b>Understand</b><p>Explore plain-language guides and common healthcare terms.</p><span>Explore resources <ArrowRight size={15}/></span></a>
              <a className="journey-card" href="#profile"><span className="journey-number">02</span><b>Choose access options</b><p>Think about communication, sensory, mobility, and other preferences.</p><span>Build access profile <ArrowRight size={15}/></span></a>
              <a className="journey-card" href="#questions"><span className="journey-number">03</span><b>Prepare</b><p>Create a question list and a simple appointment checklist.</p><span>Build questions <ArrowRight size={15}/></span></a>
              <a className="journey-card" href="#prepare"><span className="journey-number">04</span><b>Take your next step</b><p>Use your plan to guide a conversation with the healthcare office.</p><span>Start planning <ArrowRight size={15}/></span></a>
            </div>
          </div>
        </section>

        <section className="questions-section section-pad" id="questions">
          <div className="container questions-layout">
            <div><div className="eyebrow">SPEAK UP WITH CONFIDENCE</div><h2>Build your appointment question list.</h2><p>Choose the topics that matter to you. Careway will suggest questions you can review, edit elsewhere, or take to an appointment. This is a preparation aid, not medical advice.</p><div className="profile-callout"><ShieldCheck size={18}/><span><b>You stay in control</b><br/>Nothing is sent to a provider. Avoid adding private medical details.</span></div></div>
            <div className="demo-form-card question-builder">
              <div className="form-card-heading"><span className="form-icon"><BookOpen size={20}/></span><div><h3>What would you like to ask about?</h3><p>Select one or more topics</p></div></div>
              <div className="question-topic-grid">{Object.keys(questionBank).map((topic) => <label className="question-topic" key={topic}><input type="checkbox" checked={questionTopics.includes(topic)} onChange={() => toggleQuestionTopic(topic)}/><span>{topic}</span></label>)}</div>
              <div className="suggested-questions" aria-live="polite"><h4>Your suggested questions ({suggestedQuestions.length})</h4>{suggestedQuestions.length ? <ul>{suggestedQuestions.map((question) => <li key={question}>{question}</li>)}</ul> : <p>Select a topic to see suggested questions.</p>}</div>
              <label htmlFor="question-notes">Personal reminder <span>(optional; keep it non-sensitive)</span></label>
              <textarea id="question-notes" rows={2} maxLength={180} value={questionNotes} onChange={(event) => {setQuestionNotes(event.target.value); setQuestionsCopied(false);}} placeholder="Example: Ask for a printed summary."/>
              <button className="button button-primary form-submit" type="button" disabled={!suggestedQuestions.length} onClick={copyQuestionList}><Copy size={16}/>{questionsCopied ? "Copied — review before sharing" : "Copy my question list"}</button>
            </div>
          </div>
        </section>

        <section className="about-section" id="about"><div className="container about-inner"><div className="about-symbol"><Sparkles size={23} /></div><div><div className="eyebrow">THE IDEA BEHIND CAREWAY</div><h2>Access is more than a setting.</h2><p>Healthcare navigation should support different ways of reading, listening, communicating, and preparing. Careway is an early prototype exploring how digital tools can make that journey easier to understand.</p></div><div className="about-stamp"><span>BUILT AROUND</span><b>YOU.</b></div></div></section>
      </main>

      <footer className="site-footer"><div className="container footer-inner"><a className="brand footer-brand" href="#home"><span className="brand-mark"><HeartPulse size={19} /></span><span>careway<span className="brand-period">.</span></span></a><p>Accessibility is a journey. This prototype is a starting point.</p><span>© 2026 Careway Demo</span></div></footer>

      <button className="floating-accessibility" onClick={() => setSettingsOpen(true)} aria-label="Open accessibility settings"><Accessibility size={23} /><span>Accessibility</span></button>
      <button className="floating-voice" onClick={() => { if (voiceOpen) stopVoiceRecognition(); setVoiceOpen(!voiceOpen); }} aria-label={voiceOpen ? "Close voice assistant" : "Open voice assistant"} title="Talk to Careway"><Mic size={21} /></button>
      {voiceOpen && <div className="voice-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) { setVoiceOpen(false); stopVoiceRecognition(); } }}>
        <section className="voice-panel" role="dialog" aria-modal="false" aria-labelledby="voice-title">
          <div className="settings-header"><div><div className="eyebrow">HANDS-FREE NAVIGATION</div><h2 id="voice-title">Talk to Careway</h2></div><button className="icon-button" onClick={() => { setVoiceOpen(false); stopVoiceRecognition(); }} aria-label="Close voice commands"><X /></button></div>
          <p className="settings-intro">Tap once to speak a short command. You can also use the quick actions below. Your browser may process voice input using its speech service.</p>
          <div className="voice-status" role="status" aria-live="polite"><span className={voiceListening ? "voice-pulse active" : "voice-pulse"}><Mic size={20} /></span><div><b>{voiceListening ? "Listening now..." : "Voice assistant"}</b><small>{voiceStatus}</small></div></div>
          {voiceTranscript && <p className="voice-transcript"><b>Heard:</b> “{voiceTranscript}”</p>}
          <div className="voice-actions"><button className="button button-primary voice-start" onClick={voiceListening ? stopVoiceRecognition : startVoiceRecognition} ><Mic size={17} /> {voiceListening ? "Stop listening" : "Start listening"}</button><button className="button button-secondary" onClick={() => { speakPage(); setVoiceStatus("Reading page content aloud."); }}><Volume2 size={16} /> Read page</button></div>
          <div className="voice-command-list"><b>Quick actions</b><div className="voice-quick-grid"><button onClick={() => updatePreference("fontScale", Math.min(1.5, +(preferences.fontScale + 0.1).toFixed(1)))}>A+ Larger text</button><button onClick={() => updatePreference("fontScale", Math.max(0.9, +(preferences.fontScale - 0.1).toFixed(1)))}>A− Smaller text</button><button onClick={() => { setSettingsOpen(true); setVoiceOpen(false); }}>Accessibility settings</button><button onClick={() => { document.getElementById("prepare")?.scrollIntoView({behavior:"smooth"}); setVoiceOpen(false); }}>Appointment help</button></div><details><summary>Voice command examples</summary><ul><li>“Increase text” or “Decrease text”</li><li>“Dark mode” or “High contrast”</li><li>“Read page” or “Stop reading”</li><li>“Open profile” or “Go to glossary”</li><li>“Go to resources” or “Prepare for visit”</li></ul></details></div>
        </section>
      </div>}
      {announcement && <div className="sr-only" role="status" aria-live="polite">{announcement}</div>}

      {settingsOpen && <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setSettingsOpen(false); }}>
        <section className="settings-panel" role="dialog" aria-modal="true" aria-labelledby="settings-title">
          <div className="settings-header"><div><div className="eyebrow">PERSONALIZE YOUR EXPERIENCE</div><h2 id="settings-title">Accessibility settings</h2></div><button className="icon-button" onClick={() => setSettingsOpen(false)} aria-label="Close accessibility settings"><X /></button></div>
          <p className="settings-intro">Adjust this demo to make reading and navigating more comfortable. Your preferences are saved in this browser.</p>
          <div className="setting-group preset-group">
            <div className="setting-title"><span><Accessibility size={18} /> Quick setup</span></div>
            <p className="preset-help">Start with a simple setup, then adjust any setting below. These are suggestions, not disability labels.</p>
            <div className="preset-grid">
              <button type="button" onClick={() => { setPreferences((current) => ({ ...current, fontScale: 1.2, spaciousText: true, dyslexiaFont: true, reducedMotion: false })); setAnnouncement("Reading-friendly settings applied. You can customize them below."); }}>Easier reading</button>
              <button type="button" onClick={() => { setPreferences((current) => ({ ...current, contrast: "high", fontScale: 1.1, reducedMotion: true })); setAnnouncement("High visibility settings applied. You can customize them below."); }}>High visibility</button>
              <button type="button" onClick={() => { setPreferences((current) => ({ ...current, reducedMotion: true, fontScale: 1.1, spaciousText: true })); setAnnouncement("Reduced motion settings applied. You can customize them below."); }}>Less movement</button>
              <button type="button" onClick={() => { setPreferences((current) => ({ ...current, fontScale: 1.2, spaciousText: true, reducedMotion: true })); setAnnouncement("Simplified interaction settings applied. You can customize them below."); }}>Calmer layout</button>
            </div>
          </div>
          <div className="setting-group"><div className="setting-title"><span><Type size={18} /> Text size</span><span className="setting-value">{Math.round(preferences.fontScale * 100)}%</span></div><div className="stepper"><button className="icon-button" onClick={() => updatePreference("fontScale", Math.max(0.9, +(preferences.fontScale - 0.1).toFixed(1)))} aria-label="Decrease text size" disabled={preferences.fontScale <= 0.9}><Minus /></button><div className="stepper-track"><span style={{ width: ((preferences.fontScale - 0.9) / 0.6 * 100) + "%" }} /></div><button className="icon-button" onClick={() => updatePreference("fontScale", Math.min(1.5, +(preferences.fontScale + 0.1).toFixed(1)))} aria-label="Increase text size" disabled={preferences.fontScale >= 1.5}><Plus /></button></div></div>
          <div className="setting-group"><div className="setting-title"><span><Settings2 size={18} /> Color theme</span></div><div className="theme-options"><button className={preferences.contrast === "standard" ? "theme-choice selected" : "theme-choice"} onClick={() => updatePreference("contrast", "standard")}><span className="theme-swatch standard-swatch" />Standard</button><button className={preferences.contrast === "high" ? "theme-choice selected" : "theme-choice"} onClick={() => updatePreference("contrast", "high")}><span className="theme-swatch high-swatch" />High contrast</button><button className={preferences.contrast === "dark" ? "theme-choice selected" : "theme-choice"} onClick={() => updatePreference("contrast", "dark")}><span className="theme-swatch dark-swatch" />Dark</button></div></div>
          <div className="setting-group toggle-group"><div><b>Dyslexia-friendly font</b><small>Use a more distinct, rounded typeface.</small></div><button role="switch" aria-checked={preferences.dyslexiaFont} className={preferences.dyslexiaFont ? "switch on" : "switch"} onClick={() => updatePreference("dyslexiaFont", !preferences.dyslexiaFont)}><span /></button></div>
          <div className="setting-group toggle-group"><div><b>More text spacing</b><small>Increase line height and letter spacing.</small></div><button role="switch" aria-checked={preferences.spaciousText} className={preferences.spaciousText ? "switch on" : "switch"} onClick={() => updatePreference("spaciousText", !preferences.spaciousText)}><span /></button></div>
          <div className="setting-group toggle-group"><div><b>Reduce motion</b><small>Turn off most interface transitions.</small></div><button role="switch" aria-checked={preferences.reducedMotion} className={preferences.reducedMotion ? "switch on" : "switch"} onClick={() => updatePreference("reducedMotion", !preferences.reducedMotion)}><span /></button></div>
          <div className="settings-footer"><button className="text-button" onClick={() => setPreferences(defaultPreferences)}>Reset to defaults</button><button className="button button-primary" onClick={() => setSettingsOpen(false)}>Done <Check size={16} /></button></div>
        </section>
      </div>}
      <div className="speech-controls"><button onClick={speakPage} aria-label="Read page aloud"><Mic size={17} /></button><button onClick={stopSpeaking} aria-label="Stop reading aloud"><X size={16} /></button></div>
    </div>
  );
}

export default App;
