// src/pages/admin/Settings.jsx
import { useState } from "react";
import { Save, Shield, Bot, Bell, Globe, Key } from "lucide-react";

function Toggle({ value, onChange }) {
  return (
    <button
      onClick={() => onChange(!value)}
      className={`relative w-11 h-6 rounded-full transition-colors duration-200 flex-shrink-0
        ${value ? "bg-primary" : "bg-surface-container"}`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200
          ${value ? "translate-x-5" : "translate-x-0"}`}
      />
    </button>
  );
}

function Section({ title, description, icon: Icon, children }) {
  return (
    <div className="bg-surface-container-lowest rounded-2xl shadow-sm border border-black/5 hover:shadow-md transition-shadow p-5 sm:p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-xl bg-primary-fixed flex items-center justify-center flex-shrink-0">
          <Icon size={19} className="text-primary" />
        </div>
        <div>
          <p className="text-headline-md font-bold text-on-surface">{title}</p>
          <p className="text-label-sm text-on-surface-variant">{description}</p>
        </div>
      </div>
      <div className="divide-y divide-black/5">{children}</div>
    </div>
  );
}

function Row({ label, description, children }) {
  return (
    <div className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0">
      <div>
        <p className="text-label-md font-medium text-on-surface">{label}</p>
        {description && <p className="text-label-sm text-on-surface-variant mt-0.5">{description}</p>}
      </div>
      {children}
    </div>
  );
}

export default function AdminSettings() {
  const [saved, setSaved] = useState(false);

  const [platformName, setPlatformName] = useState("Knowledge Guru");
  const [supportEmail, setSupportEmail] = useState("support@knowledgeguru.in");
  const [aiEnabled, setAiEnabled]       = useState(true);
  const [ragEnabled, setRagEnabled]     = useState(true);
  const [budgetCap, setBudgetCap]       = useState("3600");
  const [maxTokens, setMaxTokens]       = useState("1000");
  const [mfaRequired, setMfaRequired]   = useState(false);
  const [sessionTimeout, setSession]    = useState("60");
  const [auditLog, setAuditLog]         = useState(true);
  const [emailAlerts, setEmailAlerts]   = useState(true);
  const [budgetAlert, setBudgetAlert]   = useState(true);
  const [newUserAlert, setNewUserAlert] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const inputClass = "border border-black/10 rounded-xl px-3 py-2 text-label-md text-on-surface bg-background outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-shadow w-52";

  return (
    <div className="max-w-container-max mx-auto space-y-6">

      {/* Sticky save bar */}
      <div className="sticky top-0 z-10 flex justify-end -mx-4 sm:-mx-6 px-4 sm:px-6 py-2 bg-background/80 backdrop-blur-sm">
        <button
          onClick={handleSave}
          className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-label-sm font-bold shadow-sm transition-all
            ${saved ? "bg-green-500 text-white" : "primary-gradient text-white hover:opacity-90 hover:-translate-y-0.5"}`}
        >
          <Save size={16} />
          {saved ? "Saved ✓" : "Save Changes"}
        </button>
      </div>

      <Section title="General" description="Basic platform configuration" icon={Globe}>
        <Row label="Platform name" description="Shown in the browser tab and emails">
          <input value={platformName} onChange={(e) => setPlatformName(e.target.value)} className={inputClass} />
        </Row>
        <Row label="Support email" description="Where user support requests are sent">
          <input value={supportEmail} onChange={(e) => setSupportEmail(e.target.value)} className={inputClass} />
        </Row>
      </Section>

      <Section title="AI & Gemini API" description="Control AI features and cost limits" icon={Bot}>
        <Row label="Enable AI features" description="Turns on all Gemini-powered features">
          <Toggle value={aiEnabled} onChange={setAiEnabled} />
        </Row>
        <Row label="Enable RAG / Chatbot" description="Students can ask the AI tutor questions">
          <Toggle value={ragEnabled} onChange={setRagEnabled} />
        </Row>
        <Row label="Monthly budget cap (₹)" description="AI calls stop when this limit is reached">
          <input type="number" value={budgetCap} onChange={(e) => setBudgetCap(e.target.value)} className={`${inputClass} w-32`} />
        </Row>
        <Row label="Max tokens per request" description="Controls response length and cost">
          <input type="number" value={maxTokens} onChange={(e) => setMaxTokens(e.target.value)} className={`${inputClass} w-32`} />
        </Row>
      </Section>

      <Section title="Security" description="Authentication and access controls" icon={Shield}>
        <Row label="Require MFA for admins" description="Admins must verify with a second factor">
          <Toggle value={mfaRequired} onChange={setMfaRequired} />
        </Row>
        <Row label="Session timeout (minutes)" description="Users are logged out after this duration">
          <input type="number" value={sessionTimeout} onChange={(e) => setSession(e.target.value)} className={`${inputClass} w-32`} />
        </Row>
        <Row label="Enable audit logging" description="Records all admin actions for compliance">
          <Toggle value={auditLog} onChange={setAuditLog} />
        </Row>
        <Row label="API secret key" description="Used by the backend to sign JWTs">
          <button className="flex items-center gap-2 border border-black/10 rounded-xl px-3 py-2 text-label-md text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors">
            <Key size={14} />
            Rotate key
          </button>
        </Row>
      </Section>

      <Section title="Notifications" description="Control what alerts are sent to admins" icon={Bell}>
        <Row label="Email alerts" description="Send important alerts to the support email">
          <Toggle value={emailAlerts} onChange={setEmailAlerts} />
        </Row>
        <Row label="Budget exceeded alert" description="Notify when AI cost exceeds the cap">
          <Toggle value={budgetAlert} onChange={setBudgetAlert} />
        </Row>
        <Row label="New user registrations" description="Get notified when a new user signs up">
          <Toggle value={newUserAlert} onChange={setNewUserAlert} />
        </Row>
      </Section>
    </div>
  );
}