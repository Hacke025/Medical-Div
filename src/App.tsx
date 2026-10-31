import { useEffect, useMemo, useState } from "react";
import {
  Accessibility, ArrowRight, BookOpen, CalendarDays, Check, Clock3, FileText, HeartPulse, Menu, Mic, Minus, Plus,
  Search, Settings2, ShieldCheck, Sparkles, Stethoscope, Type, Volume2, X
} from "lucide-react";

type ContrastMode = "standard" | "high" | "dark";
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
  const [profile, setProfile] = useState(() => {
    try {
      const saved = localStorage.getItem("careway-demo-profile");
      return saved ? JSON.parse(saved) : { communication: "No preference selected", visitFormat: "No preference selected", accommodation: "" };
    } catch {
      return { communication: "No preference selected", visitFormat: "No preference selected", accommodation: "" };
    }
  });

  useEffect(() => {
    localStorage.setItem("careway-preferences", JSON.stringify(preferences));
  }, [preferences]);

  useEffect(() => {
    if (!settingsOpen) return;
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setSettingsOpen(false);
    }
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [settingsOpen]);

  function saveProfile(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    localStorage.setItem("careway-demo-profile", JSON.stringify(profile));
    setProfileSaved(true);
    setAnnouncement("Your demo accessibility preferences were saved in this browser.");
  }

  function clearProfile() {
    const emptyProfile = { communication: "No preference selected", visitFormat: "No preference selected", accommodation: "" };
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
              <p className="privacy-note"><ShieldCheck size={15} /> This is a personal reminder, not a request sent to a provider.</p>
              <div className="profile-actions"><button className="text-button" type="button" onClick={clearProfile}>Clear profile</button><button className="button button-primary" type="submit">{profileSaved ? "Saved" : "Save preferences"} <Check size={16} /></button></div>
              {profileSaved && <p className="saved-message" role="status">Saved in this browser. You can edit or clear it at any time.</p>}
            </form>
          </div>
        </section>

        <section className="about-section" id="about"><div className="container about-inner"><div className="about-symbol"><Sparkles size={23} /></div><div><div className="eyebrow">THE IDEA BEHIND CAREWAY</div><h2>Access is more than a setting.</h2><p>Healthcare navigation should support different ways of reading, listening, communicating, and preparing. Careway is an early prototype exploring how digital tools can make that journey easier to understand.</p></div><div className="about-stamp"><span>BUILT AROUND</span><b>YOU.</b></div></div></section>
      </main>

      <footer className="site-footer"><div className="container footer-inner"><a className="brand footer-brand" href="#home"><span className="brand-mark"><HeartPulse size={19} /></span><span>careway<span className="brand-period">.</span></span></a><p>Accessibility is a journey. This prototype is a starting point.</p><span>© 2026 Careway Demo</span></div></footer>

      <button className="floating-accessibility" onClick={() => setSettingsOpen(true)} aria-label="Open accessibility settings"><Accessibility size={23} /><span>Accessibility</span></button>
      {announcement && <div className="sr-only" role="status" aria-live="polite">{announcement}</div>}

      {settingsOpen && <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setSettingsOpen(false); }}>
        <section className="settings-panel" role="dialog" aria-modal="true" aria-labelledby="settings-title">
          <div className="settings-header"><div><div className="eyebrow">PERSONALIZE YOUR EXPERIENCE</div><h2 id="settings-title">Accessibility settings</h2></div><button className="icon-button" onClick={() => setSettingsOpen(false)} aria-label="Close accessibility settings"><X /></button></div>
          <p className="settings-intro">Adjust this demo to make reading and navigating more comfortable. Your preferences are saved in this browser.</p>
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
