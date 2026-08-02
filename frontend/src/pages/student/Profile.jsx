import { useState, useRef } from "react";
import { useAuth } from "../../hooks/useAuth";
import API from "../../services/api";

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [form,     setForm]     = useState({ fullName: user?.fullName || "", bio: user?.bio || "", phone: user?.phone || "" });
  const [pwForm,   setPwForm]   = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [showPw,   setShowPw]   = useState({ currentPassword: false, newPassword: false, confirmPassword: false });
  const [saving,   setSaving]   = useState(false);
  const [pwSaving, setPwSaving] = useState(false);
  const [msg,      setMsg]      = useState(null); // { type: success|error, text }
  const [pwMsg,    setPwMsg]    = useState(null);
  const [tab,      setTab]      = useState("profile");
  const fileRef = useRef(null);

  const flash = (setter, type, text) => {
    setter({ type, text });
    setTimeout(() => setter(null), 4000);
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("fullName", form.fullName);
      fd.append("bio",      form.bio);
      fd.append("phone",    form.phone);
      if (fileRef.current?.files[0]) fd.append("avatar", fileRef.current.files[0]);

      const res = await API.put("/users/profile", fd, { headers: { "Content-Type": "multipart/form-data" } });
      updateUser(res.data.data);
      flash(setMsg, "success", "Profile updated successfully!");
    } catch (e) {
      flash(setMsg, "error", e.response?.data?.message || "Update failed");
    } finally { setSaving(false); }
  };

  const handleChangePassword = async () => {
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      flash(setPwMsg, "error", "Passwords do not match"); return;
    }
    if (pwForm.newPassword.length < 6) {
      flash(setPwMsg, "error", "Password must be at least 6 characters"); return;
    }
    setPwSaving(true);
    try {
      await API.put("/users/change-password", { currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      setPwForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      flash(setPwMsg, "success", "Password changed successfully!");
    } catch (e) {
      flash(setPwMsg, "error", e.response?.data?.message || "Failed to change password");
    } finally { setPwSaving(false); }
  };

  const [preview, setPreview] = useState(user?.avatar || null);
  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (f) setPreview(URL.createObjectURL(f));
  };

  const tabs = [
    { id: "profile",  icon: "person",   label: "Profile Info" },
    { id: "security", icon: "lock",     label: "Security" },
  ];

  return (
    <div className="p-5 md:p-6 space-y-5 max-w-2xl">
      {/* Profile header */}
      <div className="primary-gradient rounded-2xl p-6 relative overflow-hidden">
        <div className="blob-animation" style={{ width:200, height:200, top:-60, right:-40, opacity:0.15 }} />
        <div className="relative z-10 flex items-center gap-4">
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl overflow-hidden bg-white/20 flex items-center justify-center">
              {preview
                ? <img src={preview} className="w-full h-full object-cover" alt="avatar" />
                : <span className="text-white text-3xl font-black">{user?.fullName?.charAt(0)}</span>
              }
            </div>
            <button onClick={() => fileRef.current?.click()}
              className="absolute -bottom-1 -right-1 w-7 h-7 bg-white rounded-lg flex items-center justify-center shadow-md">
              <span className="material-symbols-outlined text-primary text-sm">photo_camera</span>
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">{user?.fullName}</h1>
            <p className="text-white/70 text-sm">{user?.email}</p>
            <span className="inline-block mt-1.5 text-[10px] font-bold bg-white/20 text-white px-2 py-0.5 rounded-full">
              {user?.role}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
              tab === t.id ? "bg-primary text-white" : "bg-white border border-outline-variant text-on-surface-variant"}`}>
            <span className="material-symbols-outlined text-base">{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Profile Info ── */}
      {tab === "profile" && (
        <div className="glass-card rounded-2xl p-5 space-y-4">
          <h2 className="font-semibold text-sm">Personal Information</h2>

          {msg && (
            <div className={`flex items-center gap-2 p-3 rounded-xl text-sm ${
              msg.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}>
              <span className="material-symbols-outlined text-base"
                style={{ fontVariationSettings: '"FILL" 1' }}>
                {msg.type === "success" ? "check_circle" : "error"}
              </span>
              {msg.text}
            </div>
          )}

          {[
            { label: "Full Name",    key: "fullName", type: "text",  icon: "person"       },
            { label: "Phone Number", key: "phone",    type: "tel",   icon: "phone"        },
          ].map(f => (
            <div key={f.key}>
              <label className="text-xs font-semibold text-on-surface-variant block mb-1.5">{f.label}</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-xl">{f.icon}</span>
                <input type={f.type} value={form[f.key]}
                  onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                  className="w-full pl-10 pr-4 py-2.5 bg-surface-container border border-outline-variant rounded-xl text-sm focus:outline-none focus:border-primary transition-colors" />
              </div>
            </div>
          ))}

          <div>
            <label className="text-xs font-semibold text-on-surface-variant block mb-1.5">Email Address</label>
            <input value={user?.email || ""} disabled
              className="w-full px-4 py-2.5 bg-surface-dim border border-outline-variant rounded-xl text-sm text-on-surface-variant" />
            <p className="text-[10px] text-on-surface-variant mt-1">Email cannot be changed</p>
          </div>

          <div>
            <label className="text-xs font-semibold text-on-surface-variant block mb-1.5">Bio</label>
            <textarea value={form.bio} rows={3}
              onChange={e => setForm(p => ({ ...p, bio: e.target.value }))}
              placeholder="Tell something about yourself…"
              className="w-full px-4 py-2.5 bg-surface-container border border-outline-variant rounded-xl text-sm focus:outline-none focus:border-primary transition-colors resize-none" />
          </div>

          <button onClick={handleSaveProfile} disabled={saving}
            className="w-full py-2.5 primary-gradient text-white text-sm font-bold rounded-xl hover:opacity-90 disabled:opacity-60 transition-opacity flex items-center justify-center gap-2">
            {saving ? (
              <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Saving…</>
            ) : (
              <><span className="material-symbols-outlined text-base">save</span>Save Changes</>
            )}
          </button>
        </div>
      )}

      {/* ── Security ── */}
      {tab === "security" && (
        <div className="glass-card rounded-2xl p-5 space-y-4">
          <h2 className="font-semibold text-sm">Change Password</h2>

          {pwMsg && (
            <div className={`flex items-center gap-2 p-3 rounded-xl text-sm ${
              pwMsg.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}>
              <span className="material-symbols-outlined text-base"
                style={{ fontVariationSettings: '"FILL" 1' }}>
                {pwMsg.type === "success" ? "check_circle" : "error"}
              </span>
              {pwMsg.text}
            </div>
          )}

          {[
            { label: "Current Password", key: "currentPassword", placeholder: "Enter current password" },
            { label: "New Password",     key: "newPassword",     placeholder: "Minimum 6 characters" },
            { label: "Confirm Password", key: "confirmPassword", placeholder: "Repeat new password" },
          ].map(f => {
            const show = showPw[f.key];
            return (
              <div key={f.key}>
                <label className="text-xs font-semibold text-on-surface-variant block mb-1.5">{f.label}</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-xl">lock</span>
                  <input type={show ? "text" : "password"} value={pwForm[f.key]}
                    onChange={e => setPwForm(p => ({ ...p, [f.key]: e.target.value }))}
                    placeholder={f.placeholder}
                    className="w-full pl-10 pr-11 py-2.5 bg-surface-container border border-outline-variant rounded-xl text-sm focus:outline-none focus:border-primary transition-colors" />
                  <button type="button" onClick={() => setShowPw(p => ({ ...p, [f.key]: !p[f.key] }))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface">
                    <span className="material-symbols-outlined text-xl">{show ? "visibility_off" : "visibility"}</span>
                  </button>
                </div>
              </div>
            );
          })}

          <button onClick={handleChangePassword} disabled={pwSaving || !pwForm.currentPassword || !pwForm.newPassword}
            className="w-full py-2.5 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary/90 disabled:opacity-60 transition-colors flex items-center justify-center gap-2">
            {pwSaving ? (
              <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Updating…</>
            ) : (
              <><span className="material-symbols-outlined text-base">lock_reset</span>Update Password</>
            )}
          </button>
        </div>
      )}
    </div>
  );
}