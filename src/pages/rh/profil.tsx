// src/pages/profile/index.tsx — Smart Business · Page Profil
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  LuBadgeCheck,
  LuBanknote,
  LuCalendarDays,
  LuChevronLeft,
  LuChevronRight,
  LuCircleAlert,
  LuKeyRound,
  LuLoader,
  LuLock,
  LuLogOut,
  LuMail,
  LuPencil,
  LuPhone,
  LuPlus,
  LuRefreshCw,
  LuShield,
  LuShieldCheck,
  LuShieldOff,
  LuSmartphone,
  LuToggleLeft,
  LuToggleRight,
  LuUser,
  LuUserX,
  LuX,
  LuCheck,
} from "react-icons/lu";
import { useAuth } from "../../contexts/AuthContext";

// ── Palette Smart Business ────────────────────────────────────────────────────
const SB = {
  blue:       "#2E86AB",
  cyan:       "#17A8B8",
  teal:       "#1B8A5A",
  red:        "#E05A5A",
  amber:      "#D97706",
  text1:      "#1a2940",
  text2:      "#3d5a73",
  text3:      "#7a95aa",
  bg:         "#f4f7fa",
  surface:    "#ffffff",
  surfaceAlt: "#eef3f8",
  border:     "rgba(46,134,171,0.14)",
};

// ── Types ─────────────────────────────────────────────────────────────────────
interface UserProfile {
  id: number;
  nom: string;
  email: string;
  telephone?: string;
  cin?: string;
  sexe?: "HOMME" | "FEMME";
  situation?: "MARIE" | "CELIBATAIRE";
  enfants?: number;
  dateEmbauche?: string;
  role: string;
  salaire: number;
  boolcnaps?: boolean;
  numeroCnaps?: string;
  profession: { poste: string; idEntreprise: number };
  cnaps?: {
    montantPersonnel?: number;
    montantEntreprise?: number;
  } | null;
  conges?: Array<{
    id: number;
    dateDebut: string;
    dateFin: string;
    type?: string;
    valide?: boolean;
  }>;
}

type TabId = "profil" | "cnaps" | "salaire" | "conges" | "securite";

// ── Hook API simplifié ────────────────────────────────────────────────────────
function useApi() {
  const baseUrl = import.meta.env.VITE_API_URL || "https://api.societesmartbusiness.com/";
  const token = localStorage.getItem("token") || "";

  const get = async(path: string) => {
    const res = await fetch(`${baseUrl}/${path}`, {
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  };

  const put = async(path: string, body: unknown)=> {
    const res = await fetch(`${baseUrl}/${path}`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  };

  const post = async(path: string, body: unknown)=> {
    const res = await fetch(`${baseUrl}/${path}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  };

  return { get, put, post };
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function fmtAr(n: number) {
  return n.toLocaleString("fr-FR") + " Ar";
}

function fmtDate(d: string | Date) {
  return new Date(d).toLocaleDateString("fr-FR", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

function diffDays(a: string | Date, b: string | Date) {
  const ms = new Date(b).getTime() - new Date(a).getTime();
  return Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)));
}

// ── Composant Badge ───────────────────────────────────────────────────────────
function Badge({ label, color, bg }: { label: string; color: string; bg: string }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center",
      padding: "3px 10px", borderRadius: 100,
      fontSize: 11, fontWeight: 600, fontFamily: "'DM Mono', monospace",
      color, background: bg, letterSpacing: "0.5px",
    }}>
      {label}
    </span>
  );
}

// ── Avatar ────────────────────────────────────────────────────────────────────
function Avatar({ nom, size = 72 }: { nom: string; size?: number }) {
  const initials = nom.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: `linear-gradient(135deg, ${SB.blue}, ${SB.cyan})`,
      display: "flex", alignItems: "center", justifyContent: "center",
      color: "#fff", fontFamily: "'DM Mono', monospace",
      fontSize: size * 0.32, fontWeight: 600, flexShrink: 0,
      boxShadow: "0 4px 16px rgba(46,134,171,0.30)",
    }}>
      {initials}
    </div>
  );
}

// ── Bouton principal ──────────────────────────────────────────────────────────
function Btn({
  children, onClick, variant = "primary", icon: Icon, disabled, small, danger,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "outline" | "ghost";
  icon?: React.ElementType;
  disabled?: boolean;
  small?: boolean;
  danger?: boolean;
}) {
  const color  = danger ? SB.red : SB.cyan;
  const styles: Record<string, React.CSSProperties> = {
    primary: {
      background: `linear-gradient(135deg, ${SB.blue}, ${SB.cyan})`,
      color: "#fff", border: "none",
      boxShadow: "0 2px 10px rgba(23,168,184,0.30)",
    },
    outline: {
      background: "transparent",
      color: danger ? SB.red : SB.blue,
      border: `1px solid ${danger ? SB.red : SB.border}`,
    },
    ghost: {
      background: danger ? "rgba(224,90,90,0.08)" : `rgba(46,134,171,0.07)`,
      color: danger ? SB.red : SB.text2,
      border: "none",
    },
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        display: "inline-flex", alignItems: "center", gap: 7,
        padding: small ? "7px 14px" : "10px 20px",
        borderRadius: 12,
        fontSize: small ? 12 : 13, fontWeight: 500,
        fontFamily: "'DM Sans', sans-serif",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.55 : 1,
        transition: "all 0.18s ease",
        ...styles[variant],
      }}
    >
      {Icon && <Icon size={small ? 13 : 15} />}
      {children}
    </button>
  );
}

// ── Champ de formulaire ───────────────────────────────────────────────────────
function Field({
  label, value, onChange, type = "text", options,
}: {
  label: string;
  value: string | number;
  onChange: (v: string) => void;
  type?: "text" | "email" | "date" | "number" | "select" | "password";
  options?: { value: string; label: string }[];
}) {
  const base: React.CSSProperties = {
    width: "100%", padding: "10px 14px",
    borderRadius: 10, border: `1px solid ${SB.border}`,
    background: SB.surfaceAlt, color: SB.text1,
    fontSize: 13, fontFamily: "'DM Sans', sans-serif",
    outline: "none", transition: "border-color 0.15s",
  };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label style={{ fontSize: 11, fontWeight: 600, color: SB.text3,
        fontFamily: "'DM Mono', monospace", textTransform: "uppercase", letterSpacing: "0.8px" }}>
        {label}
      </label>
      {type === "select" ? (
        <select value={value} onChange={(e) => onChange(e.target.value)} style={base}>
          {options?.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={base}
          onFocus={(e) => { e.target.style.borderColor = SB.cyan; }}
          onBlur={(e) => { e.target.style.borderColor = SB.border; }}
        />
      )}
    </div>
  );
}

// ── InfoRow ───────────────────────────────────────────────────────────────────
function InfoRow({ icon: Icon, label, value, accent = SB.blue }: {
  icon: React.ElementType; label: string; value?: string | number | null; accent?: string;
}) {
  if (!value && value !== 0) return null;
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 14,
      padding: "14px 0", borderBottom: `1px solid ${SB.border}`,
    }}>
      <div style={{
        width: 36, height: 36, borderRadius: 10,
        background: `${accent}12`, color: accent,
        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
      }}>
        <Icon size={17} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 11, color: SB.text3, fontFamily: "'DM Mono', monospace",
          textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 2 }}>{label}</div>
        <div style={{ fontSize: 14, color: SB.text1, fontWeight: 500 }}>{value}</div>
      </div>
    </div>
  );
}

// ── Card ──────────────────────────────────────────────────────────────────────
function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      background: SB.surface, border: `1px solid ${SB.border}`,
      borderRadius: 20, padding: "24px 28px",
      boxShadow: "0 1px 4px rgba(46,134,171,0.08)",
      ...style,
    }}>
      {children}
    </div>
  );
}

// ── Modal ─────────────────────────────────────────────────────────────────────
function Modal({ open, onClose, title, children, width = 520 }: {
  open: boolean; onClose: () => void; title: string;
  children: React.ReactNode; width?: number;
}) {
  if (!open) return null;
  return (
    <div style={{
      position: "fixed", inset: 0,
      background: "rgba(26,41,64,0.45)", backdropFilter: "blur(6px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 9999, padding: 20, animation: "fadeIn 0.18s ease",
    }} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={{
        background: SB.surface, borderRadius: 24,
        width: "100%", maxWidth: width, maxHeight: "90vh",
        overflow: "auto", boxShadow: "0 24px 60px rgba(46,134,171,0.22)",
        border: `1px solid ${SB.border}`, animation: "slideIn 0.22s ease",
      }}>
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "22px 28px 18px", borderBottom: `1px solid ${SB.border}`,
        }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: SB.text1 }}>{title}</h3>
          <button onClick={onClose} style={{
            background: SB.surfaceAlt, border: "none", borderRadius: 10,
            width: 34, height: 34, display: "flex", alignItems: "center",
            justifyContent: "center", cursor: "pointer", color: SB.text3,
          }}><LuX size={16} /></button>
        </div>
        <div style={{ padding: "24px 28px 28px" }}>{children}</div>
      </div>
    </div>
  );
}

// ── Calendrier des congés ─────────────────────────────────────────────────────
function CongesCalendar({ conges }: {
  conges: Array<{ dateDebut: string; dateFin: string; type?: string; valide?: boolean }>;
}) {
  const [date, setDate] = useState(new Date());
  const year  = date.getFullYear();
  const month = date.getMonth();

  const daysInMonth  = new Date(year, month + 1, 0).getDate();
  const firstWeekDay = new Date(year, month, 1).getDay();
  const offset       = (firstWeekDay + 6) % 7; // lundi = 0

  const monthNames = ["Janvier","Février","Mars","Avril","Mai","Juin",
    "Juillet","Août","Septembre","Octobre","Novembre","Décembre"];

  function isCongeDay(d: number) {
    const day = new Date(year, month, d);
    return conges.find((c) => {
      const s = new Date(c.dateDebut);
      const e = new Date(c.dateFin);
      return day >= s && day <= e;
    });
  }

  return (
    <div>
      {/* Nav */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
        <button onClick={() => setDate(new Date(year, month - 1))} style={{
          background: SB.surfaceAlt, border: `1px solid ${SB.border}`,
          borderRadius: 10, width: 34, height: 34,
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer", color: SB.text2,
        }}><LuChevronLeft size={16} /></button>
        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 14, fontWeight: 600, color: SB.text1 }}>
          {monthNames[month]} {year}
        </span>
        <button onClick={() => setDate(new Date(year, month + 1))} style={{
          background: SB.surfaceAlt, border: `1px solid ${SB.border}`,
          borderRadius: 10, width: 34, height: 34,
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer", color: SB.text2,
        }}><LuChevronRight size={16} /></button>
      </div>

      {/* En-têtes jours */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4, marginBottom: 8 }}>
        {["Lu","Ma","Me","Je","Ve","Sa","Di"].map((d) => (
          <div key={d} style={{ textAlign: "center", fontSize: 10, fontWeight: 700,
            color: SB.text3, fontFamily: "'DM Mono', monospace", textTransform: "uppercase" }}>
            {d}
          </div>
        ))}
      </div>

      {/* Grille */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4 }}>
        {Array.from({ length: offset }).map((_, i) => <div key={`e-${i}`} />)}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const d = i + 1;
          const conge = isCongeDay(d);
          const isToday = new Date().getFullYear() === year &&
                          new Date().getMonth() === month &&
                          new Date().getDate() === d;
          const bgColor = conge
            ? (conge.valide ? `${SB.teal}22` : `${SB.amber}18`)
            : isToday ? `${SB.blue}12` : "transparent";
          const textColor = conge
            ? (conge.valide ? SB.teal : SB.amber)
            : isToday ? SB.blue : SB.text2;
          const borderColor = isToday ? SB.blue : conge
            ? (conge.valide ? SB.teal : SB.amber) : "transparent";

          return (
            <div key={d} style={{
              textAlign: "center", padding: "6px 0", borderRadius: 8, fontSize: 12,
              fontFamily: "'DM Mono', monospace", background: bgColor,
              color: textColor, fontWeight: isToday ? 700 : 400,
              border: `1.5px solid ${borderColor}`,
              transition: "all 0.12s",
            }}>
              {d}
            </div>
          );
        })}
      </div>

      {/* Légende */}
      <div style={{ display: "flex", gap: 16, marginTop: 16 }}>
        {[
          { color: SB.teal, label: "Congé validé" },
          { color: SB.amber, label: "En attente" },
          { color: SB.blue, label: "Aujourd'hui" },
        ].map((l) => (
          <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 10, height: 10, borderRadius: 3, background: `${l.color}30`,
              border: `1.5px solid ${l.color}` }} />
            <span style={{ fontSize: 11, color: SB.text3, fontFamily: "'DM Mono', monospace" }}>{l.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Barre de progression ──────────────────────────────────────────────────────
function ProgressBar({ value, max, color = SB.cyan }: { value: number; max: number; color?: string }) {
  const pct = max > 0 ? Math.min(Math.round((value / max) * 100), 100) : 0;
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
        <span style={{ fontSize: 12, color: SB.text3 }}>{value} / {max} jours</span>
        <span style={{ fontSize: 12, fontWeight: 600, color, fontFamily: "'DM Mono', monospace" }}>{pct}%</span>
      </div>
      <div style={{ height: 6, background: "rgba(46,134,171,0.10)", borderRadius: 4, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${pct}%`, background: `linear-gradient(90deg, ${color}, ${SB.cyan})`,
          borderRadius: 4, transition: "width 1.2s ease" }} />
      </div>
    </div>
  );
}

// ── Toggle Switch ─────────────────────────────────────────────────────────────
function Toggle({ on, onToggle, label, description, icon: Icon, danger }: {
  on: boolean; onToggle: () => void; label: string;
  description?: string; icon?: React.ElementType; danger?: boolean;
}) {
  const color = danger ? SB.red : SB.teal;
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "16px 18px", borderRadius: 14,
      background: on ? `${color}08` : SB.surfaceAlt,
      border: `1px solid ${on ? `${color}25` : SB.border}`,
      transition: "all 0.2s", cursor: "pointer",
    }} onClick={onToggle}>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        {Icon && (
          <div style={{ width: 36, height: 36, borderRadius: 10, background: `${color}14`,
            color, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icon size={17} />
          </div>
        )}
        <div>
          <div style={{ fontSize: 14, fontWeight: 500, color: SB.text1 }}>{label}</div>
          {description && <div style={{ fontSize: 12, color: SB.text3, marginTop: 2 }}>{description}</div>}
        </div>
      </div>
      <div style={{ color: on ? color : SB.text3 }}>
        {on ? <LuToggleRight size={28} /> : <LuToggleLeft size={28} />}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// PAGE PRINCIPALE
// ══════════════════════════════════════════════════════════════════════════════
export default function ProfilePage() {
  const { get, put, post } = useApi();
  const {user} = useAuth()

  // ── États ─────────────────────────────────────────────────────────────────
  const [profile, setProfile]   = useState<UserProfile | null>(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>("profil");

  // Modals
  const [editOpen, setEditOpen]     = useState(false);
  const [congeOpen, setCongeOpen]   = useState(false);
  const [avanceOpen, setAvanceOpen] = useState(false);
  const [mdpOpen, setMdpOpen]       = useState(false);

  // Sécurité
  const [twoFA, setTwoFA]       = useState(false);
  const [sessions, setSessions] = useState(true);
  const [actif, setActif]       = useState(true);

  // Formulaire édition profil
  const [editForm, setEditForm] = useState({
    nom: "", email: "", telephone: "", cin: "",
    sexe: "HOMME", situation: "CELIBATAIRE", enfants: "0",
  });

  // Formulaire congé
  const [congeForm, setCongeForm] = useState({
    dateDebut: "", dateFin: "", type: "SIMPLE", motif: "",
  });

  // Formulaire avance
  const [avanceMontant, setAvanceMontant] = useState("");

  // Formulaire mdp
  const [mdpForm, setMdpForm] = useState({
    actuel: "", nouveau: "", confirmer: "",
  });

  const [saving, setSaving]   = useState(false);
  const [toast, setToast]     = useState<{ msg: string; ok: boolean } | null>(null);

  // ── Récupération du profil ────────────────────────────────────────────────
  // On utilise l'id depuis le token stocké ou depuis l'auth context
  const userId = (() => {
    try {
      const raw = localStorage.getItem("user");
      if (raw) return JSON.parse(raw)?.id;
    } catch {}
    return null;
  })();

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    try {
      const data = await get(`rh/staff/profile/${userId}`);
      setProfile(data);
      setEditForm({
        nom:        data.nom        || "",
        email:      data.email      || "",
        telephone:  data.telephone  || "",
        cin:        data.cin        || "",
        sexe:       data.sexe       || "HOMME",
        situation:  data.situation  || "CELIBATAIRE",
        enfants:    String(data.enfants ?? 0),
      });
      setActif(true);
    } catch {
      // Données de démonstration si l'API n'est pas disponible
      const demo: UserProfile = {
        id: 1, nom: "Jean Rakoto", email: "jean.rakoto@smart.mg",
        telephone: "+261 34 12 345 67", cin: "101 234 567 890",
        sexe: "HOMME", situation: "MARIE", enfants: 2,
        dateEmbauche: "2022-03-15", role: "ADMIN", salaire: 1_200_000,
        boolcnaps: true, numeroCnaps: "0012345678",
        profession: { poste: "Responsable Commercial", idEntreprise: 1 },
        cnaps: { montantPersonnel: 12_000, montantEntreprise: 15_000 },
        conges: [
          { id: 1, dateDebut: "2025-12-23", dateFin: "2025-12-27", type: "SIMPLE",  valide: true },
          { id: 2, dateDebut: "2026-02-10", dateFin: "2026-02-14", type: "MALADIE", valide: false },
          { id: 3, dateDebut: "2026-04-07", dateFin: "2026-04-11", type: "SIMPLE",  valide: true },
        ],
      };
      setProfile(demo);
      setEditForm({
        nom: demo.nom, email: demo.email, telephone: demo.telephone || "",
        cin: demo.cin || "", sexe: demo.sexe || "HOMME",
        situation: demo.situation || "CELIBATAIRE", enfants: String(demo.enfants ?? 0),
      });
      setError("Mode démonstration — données simulées");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

  // ── Toast ─────────────────────────────────────────────────────────────────
  function showToast(msg: string, ok = true) {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3200);
  }

  // ── Sauvegarde profil ─────────────────────────────────────────────────────
  async function handleSaveProfile() {
    if (!profile) return;
    setSaving(true);
    try {
      await put(`rh/staff/id/${user?.id}`, {
        ...editForm, enfants: parseInt(editForm.enfants, 10),
      });
      await fetchProfile();
      setEditOpen(false);
      showToast("Profil mis à jour avec succès");
    } catch {
      showToast("Erreur lors de la mise à jour", false);
    } finally {
      setSaving(false);
    }
  }

  // ── Demande de congé ──────────────────────────────────────────────────────
  async function handleDemanderConge() {
    if (!profile) return;
    setSaving(true);
    try {
      await post("rh/conge/demander", {
        idUser:    user?.id,
        type:      congeForm.type,
        dateDebut: congeForm.dateDebut,
        dateFin:   congeForm.dateFin,
        motif:     congeForm.motif || undefined,
      });
      await fetchProfile();
      setCongeOpen(false);
      setCongeForm({ dateDebut: "", dateFin: "", type: "SIMPLE", motif: "" });
      showToast("Demande de congé envoyée");
    } catch {
      showToast("Erreur lors de la demande de congé", false);
    } finally {
      setSaving(false);
    }
  }

  // ── Calculs congés ────────────────────────────────────────────────────────
  const congesValides = profile?.conges?.filter((c) => c.valide) ?? [];
  const congesEnAttente = profile?.conges?.filter((c) => !c.valide) ?? [];
  const SOLDE_ANNUEL   = 21;
  const joursPris = congesValides.reduce((sum, c) => sum + diffDays(c.dateDebut, c.dateFin), 0);
  const joursRestants = Math.max(SOLDE_ANNUEL - joursPris, 0);

  // ── Calculs salaire ───────────────────────────────────────────────────────
  const salaireBrut = profile?.salaire ?? 0;
  const cotisationPersonnel = profile?.cnaps?.montantPersonnel ?? Math.round(salaireBrut * 0.01);
  const salaireNet = salaireBrut - cotisationPersonnel;

  // ── Onglets ───────────────────────────────────────────────────────────────
  const tabs: { id: TabId; label: string; icon: React.ElementType }[] = [
    { id: "profil",   label: "Profil",    icon: LuUser },
    { id: "cnaps",    label: "CNAPS",     icon: LuShieldCheck },
    { id: "salaire",  label: "Salaire",   icon: LuBanknote },
    { id: "conges",   label: "Congés",    icon: LuCalendarDays },
    { id: "securite", label: "Sécurité",  icon: LuShield },
  ];

  // ── Loading ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center",
        height: "60vh", gap: 12, flexDirection: "column" }}>
        <LuLoader size={32} color={SB.cyan} style={{ animation: "spin 1s linear infinite" }} />
        <p style={{ color: SB.text3, fontFamily: "'DM Mono', monospace", fontSize: 13 }}>
          Chargement du profil…
        </p>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // RENDU
  // ══════════════════════════════════════════════════════════════════════════
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, animation: "slideIn 0.35s ease" }}>

      {/* ── CSS animations (injectées inline) ─────────────────────────────── */}
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes slideIn { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes toastIn { from { opacity: 0; transform: translateX(30px); } to { opacity: 1; transform: translateX(0); } }
      `}</style>

      {/* ── Toast ─────────────────────────────────────────────────────────── */}
      {toast && (
        <div style={{
          position: "fixed", top: 24, right: 24, zIndex: 99999,
          background: toast.ok ? `${SB.teal}F0` : `${SB.red}F0`,
          color: "#fff", borderRadius: 14, padding: "12px 20px",
          display: "flex", alignItems: "center", gap: 10,
          boxShadow: "0 8px 28px rgba(0,0,0,0.18)",
          animation: "toastIn 0.25s ease", fontSize: 13, fontWeight: 500,
        }}>
          {toast.ok ? <LuCheck size={16} /> : <LuCircleAlert size={16} />}
          {toast.msg}
        </div>
      )}

      {/* ── Bannière démo ─────────────────────────────────────────────────── */}
      {error && (
        <div style={{
          background: "#fffbeb", border: "1px solid #f59e0b",
          borderRadius: 12, padding: "10px 16px",
          display: "flex", alignItems: "center", gap: 8,
          color: "#92400e", fontSize: 12,
        }}>
          <LuCircleAlert size={14} />
          {error}
        </div>
      )}

      {/* ── Carte hero du profil ───────────────────────────────────────────── */}
      <Card style={{
        background: "linear-gradient(135deg, #f0f9ff 0%, #ffffff 50%, #f0faf5 100%)",
        border: "1px solid rgba(23,168,184,0.20)",
        position: "relative", overflow: "hidden",
      }}>
        {/* Glow décoratif */}
        <div style={{
          position: "absolute", top: -60, right: -60,
          width: 220, height: 220, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(23,168,184,0.10) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />

        <div style={{ display: "flex", alignItems: "center", gap: 22, position: "relative" }}>
          <Avatar nom={profile?.nom ?? "?"} size={80} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 6 }}>
              <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: SB.text1 }}>
                {profile?.nom}
              </h1>
              <Badge
                label={profile?.role ?? "USER"}
                color={profile?.role === "ADMIN" ? SB.blue : SB.teal}
                bg={profile?.role === "ADMIN" ? "rgba(46,134,171,0.10)" : "rgba(27,138,90,0.10)"}
              />
              <Badge
                label={actif ? "Actif" : "Inactif"}
                color={actif ? SB.teal : SB.red}
                bg={actif ? "rgba(27,138,90,0.10)" : "rgba(224,90,90,0.10)"}
              />
            </div>
            <div style={{ fontSize: 14, color: SB.text2, marginBottom: 4 }}>
              {profile?.profession?.poste}
            </div>
            <div style={{ fontSize: 12, color: SB.text3, fontFamily: "'DM Mono', monospace" }}>
              {profile?.email}
            </div>
          </div>

          <div style={{ flexShrink: 0 }}>
            <Btn icon={LuRefreshCw} variant="outline" small onClick={fetchProfile}>
              Actualiser
            </Btn>
          </div>
        </div>
      </Card>

      {/* ── Navigation par onglets ─────────────────────────────────────────── */}
      <div style={{
        display: "flex", gap: 4,
        background: SB.surface, borderRadius: 16,
        padding: 6, border: `1px solid ${SB.border}`,
        boxShadow: "0 1px 4px rgba(46,134,171,0.06)",
        overflowX: "auto",
      }}>
        {tabs.map((tab) => {
          const active = activeTab === tab.id;
          return (
            <button key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "9px 18px", borderRadius: 11,
                border: "none", cursor: "pointer",
                fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 500,
                whiteSpace: "nowrap", transition: "all 0.18s",
                background: active ? `linear-gradient(135deg, ${SB.blue}, ${SB.cyan})` : "transparent",
                color: active ? "#fff" : SB.text2,
                boxShadow: active ? "0 2px 10px rgba(23,168,184,0.30)" : "none",
              }}
            >
              <tab.icon size={15} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          ONGLET PROFIL
      ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === "profil" && (
        <Card>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
            <h2 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: SB.text1 }}>
              Informations personnelles
            </h2>
            <Btn icon={LuPencil} variant="outline" small onClick={() => setEditOpen(true)}>
              Modifier
            </Btn>
          </div>

          <InfoRow icon={LuUser}   label="Nom complet"       value={profile?.nom}        accent={SB.blue} />
          <InfoRow icon={LuMail}   label="Adresse email"     value={profile?.email}       accent={SB.cyan} />
          <InfoRow icon={LuPhone}  label="Téléphone"         value={profile?.telephone}   accent={SB.teal} />
          <InfoRow icon={LuBadgeCheck} label="CIN"           value={profile?.cin}         accent={SB.blue} />
          <InfoRow icon={LuUser}   label="Sexe"              value={profile?.sexe}        accent={SB.text3} />
          <InfoRow icon={LuUser}   label="Situation familiale" value={profile?.situation} accent={SB.text3} />
          <InfoRow icon={LuUser}   label="Nombre d'enfants"  value={profile?.enfants}     accent={SB.text3} />
          <InfoRow icon={LuCalendarDays} label="Date d'embauche"
            value={profile?.dateEmbauche ? fmtDate(profile.dateEmbauche) : undefined}
            accent={SB.amber} />
          <InfoRow icon={LuBadgeCheck} label="Poste"
            value={profile?.profession?.poste} accent={SB.blue} />
        </Card>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          ONGLET CNAPS
      ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === "cnaps" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Statut */}
          <Card>
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
              <div style={{
                width: 48, height: 48, borderRadius: 14,
                background: profile?.boolcnaps ? "rgba(27,138,90,0.12)" : "rgba(224,90,90,0.10)",
                color: profile?.boolcnaps ? SB.teal : SB.red,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                {profile?.boolcnaps ? <LuShieldCheck size={22} /> : <LuShieldOff size={22} />}
              </div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 600, color: SB.text1 }}>
                  {profile?.boolcnaps ? "Affilié CNAPS" : "Non affilié CNAPS"}
                </div>
                <div style={{ fontSize: 13, color: SB.text3, marginTop: 2 }}>
                  Caisse Nationale de Prévoyance Sociale
                </div>
              </div>
              <div style={{ marginLeft: "auto" }}>
                <Badge
                  label={profile?.boolcnaps ? "Actif" : "Inactif"}
                  color={profile?.boolcnaps ? SB.teal : SB.red}
                  bg={profile?.boolcnaps ? "rgba(27,138,90,0.10)" : "rgba(224,90,90,0.10)"}
                />
              </div>
            </div>

            <InfoRow icon={LuBadgeCheck} label="Numéro CNAPS"
              value={profile?.numeroCnaps ?? (profile?.boolcnaps ? "Non renseigné" : "—")}
              accent={SB.blue} />
          </Card>

          {/* Cotisations */}
          {profile?.boolcnaps && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <Card>
                <div style={{ fontSize: 11, fontWeight: 600, color: SB.text3,
                  fontFamily: "'DM Mono', monospace", textTransform: "uppercase",
                  letterSpacing: "0.8px", marginBottom: 12 }}>
                  Part salarié
                </div>
                <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 26, fontWeight: 700, color: SB.blue }}>
                  {fmtAr(profile?.cnaps?.montantPersonnel ?? cotisationPersonnel)}
                </div>
                <div style={{ fontSize: 12, color: SB.text3, marginTop: 6 }}>par mois</div>
              </Card>
              <Card>
                <div style={{ fontSize: 11, fontWeight: 600, color: SB.text3,
                  fontFamily: "'DM Mono', monospace", textTransform: "uppercase",
                  letterSpacing: "0.8px", marginBottom: 12 }}>
                  Part employeur
                </div>
                <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 26, fontWeight: 700, color: SB.cyan }}>
                  {fmtAr(profile?.cnaps?.montantEntreprise ?? 0)}
                </div>
                <div style={{ fontSize: 12, color: SB.text3, marginTop: 6 }}>par mois</div>
              </Card>
            </div>
          )}

          {/* Tableau récap */}
          {profile?.boolcnaps && (
            <Card>
              <div style={{ fontSize: 13, fontWeight: 600, color: SB.text1, marginBottom: 16 }}>
                Récapitulatif annuel
              </div>
              {[
                {
                  label: "Cotisation annuelle salarié",
                  value: fmtAr((profile?.cnaps?.montantPersonnel ?? cotisationPersonnel) * 12),
                  color: SB.blue,
                },
                {
                  label: "Cotisation annuelle employeur",
                  value: fmtAr((profile?.cnaps?.montantEntreprise ?? 0) * 12),
                  color: SB.cyan,
                },
                {
                  label: "Total charges annuelles",
                  value: fmtAr(((profile?.cnaps?.montantPersonnel ?? cotisationPersonnel) + (profile?.cnaps?.montantEntreprise ?? 0)) * 12),
                  color: SB.teal,
                },
              ].map((row) => (
                <div key={row.label} style={{
                  display: "flex", justifyContent: "space-between",
                  alignItems: "center", padding: "12px 0",
                  borderBottom: `1px solid ${SB.border}`,
                }}>
                  <span style={{ fontSize: 13, color: SB.text2 }}>{row.label}</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: row.color,
                    fontFamily: "'DM Mono', monospace" }}>{row.value}</span>
                </div>
              ))}
            </Card>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          ONGLET SALAIRE
      ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === "salaire" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Cartes brut / net */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <Card style={{
              background: "linear-gradient(135deg, rgba(46,134,171,0.06), rgba(23,168,184,0.04))",
              border: `1px solid rgba(23,168,184,0.20)`,
            }}>
              <div style={{ fontSize: 11, color: SB.blue, fontFamily: "'DM Mono', monospace",
                textTransform: "uppercase", letterSpacing: "0.8px", fontWeight: 600, marginBottom: 12 }}>
                Salaire brut
              </div>
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 28, fontWeight: 700, color: SB.text1 }}>
                {fmtAr(salaireBrut)}
              </div>
              <div style={{ fontSize: 12, color: SB.text3, marginTop: 6 }}>mensuel</div>
            </Card>

            <Card style={{
              background: "linear-gradient(135deg, rgba(27,138,90,0.06), rgba(23,168,184,0.04))",
              border: `1px solid rgba(27,138,90,0.20)`,
            }}>
              <div style={{ fontSize: 11, color: SB.teal, fontFamily: "'DM Mono', monospace",
                textTransform: "uppercase", letterSpacing: "0.8px", fontWeight: 600, marginBottom: 12 }}>
                Salaire net
              </div>
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 28, fontWeight: 700, color: SB.teal }}>
                {fmtAr(salaireNet)}
              </div>
              <div style={{ fontSize: 12, color: SB.text3, marginTop: 6 }}>après déductions</div>
            </Card>
          </div>

          {/* Déductions */}
          <Card>
            <div style={{ fontSize: 13, fontWeight: 600, color: SB.text1, marginBottom: 16 }}>
              Déductions mensuelles
            </div>
            {[
              { label: "Cotisation CNAPS (salarié)", value: cotisationPersonnel, color: SB.blue },
              { label: "Salaire brut",               value: salaireBrut,         color: SB.text2 },
              { label: "Salaire net à percevoir",    value: salaireNet,           color: SB.teal },
            ].map((row, i) => (
              <div key={row.label} style={{
                display: "flex", justifyContent: "space-between",
                alignItems: "center", padding: "14px 0",
                borderBottom: i < 2 ? `1px solid ${SB.border}` : "none",
              }}>
                <span style={{ fontSize: 13, color: SB.text2 }}>{row.label}</span>
                <span style={{
                  fontSize: 14, fontWeight: 700, color: row.color,
                  fontFamily: "'DM Mono', monospace",
                }}>
                  {fmtAr(row.value)}
                </span>
              </div>
            ))}
          </Card>

          {/* CTA avance */}
          <Card style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20 }}>
            <div>
              <div style={{ fontSize: 15, fontWeight: 600, color: SB.text1, marginBottom: 4 }}>
                Demande d'avance sur salaire
              </div>
              <div style={{ fontSize: 13, color: SB.text3 }}>
                Demandez une avance sur votre prochain salaire
              </div>
            </div>
            <Btn icon={LuBanknote} onClick={() => setAvanceOpen(true)}>
              Demander une avance
            </Btn>
          </Card>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          ONGLET CONGÉS
      ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === "conges" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Stats */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
            {[
              { label: "Jours pris",    value: joursPris,       color: SB.red,  bg: "rgba(224,90,90,0.08)" },
              { label: "Jours restants", value: joursRestants,  color: SB.teal, bg: "rgba(27,138,90,0.08)" },
              { label: "En attente",    value: congesEnAttente.length, color: SB.amber, bg: "rgba(217,119,6,0.08)" },
            ].map((stat) => (
              <Card key={stat.label} style={{ background: stat.bg, border: `1px solid ${stat.color}22`, textAlign: "center" }}>
                <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 32, fontWeight: 700, color: stat.color }}>
                  {stat.value}
                </div>
                <div style={{ fontSize: 12, color: SB.text3, marginTop: 4 }}>{stat.label}</div>
              </Card>
            ))}
          </div>

          {/* Barre de progression */}
          <Card>
            <div style={{ fontSize: 13, fontWeight: 600, color: SB.text1, marginBottom: 14 }}>
              Consommation congés annuels
            </div>
            <ProgressBar value={joursPris} max={SOLDE_ANNUEL} color={SB.blue} />
          </Card>

          {/* Calendrier */}
          <Card>
            <div style={{ fontSize: 13, fontWeight: 600, color: SB.text1, marginBottom: 18 }}>
              Calendrier des congés
            </div>
            <CongesCalendar conges={profile?.conges ?? []} />
          </Card>

          {/* Historique */}
          <Card>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: SB.text1 }}>Historique des congés</div>
              <Btn icon={LuPlus} small onClick={() => setCongeOpen(true)}>
                Demander un congé
              </Btn>
            </div>

            {(profile?.conges?.length ?? 0) === 0 ? (
              <div style={{ textAlign: "center", padding: "28px 0", color: SB.text3, fontSize: 13 }}>
                Aucun congé enregistré
              </div>
            ) : (
              profile?.conges?.map((c) => (
                <div key={c.id} style={{
                  display: "flex", alignItems: "center", gap: 14,
                  padding: "14px 0", borderBottom: `1px solid ${SB.border}`,
                }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                    background: c.valide ? "rgba(27,138,90,0.10)" : "rgba(217,119,6,0.10)",
                    color: c.valide ? SB.teal : SB.amber,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <LuCalendarDays size={16} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: SB.text1 }}>
                      {c.type ?? "Congé"} — {diffDays(c.dateDebut, c.dateFin)} jour(s)
                    </div>
                    <div style={{ fontSize: 12, color: SB.text3, marginTop: 2 }}>
                      {fmtDate(c.dateDebut)} → {fmtDate(c.dateFin)}
                    </div>
                  </div>
                  <Badge
                    label={c.valide ? "Validé" : "En attente"}
                    color={c.valide ? SB.teal : SB.amber}
                    bg={c.valide ? "rgba(27,138,90,0.10)" : "rgba(217,119,6,0.10)"}
                  />
                </div>
              ))
            )}
          </Card>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          ONGLET SÉCURITÉ
      ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === "securite" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Mot de passe */}
          <Card>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 600, color: SB.text1, marginBottom: 4 }}>
                  Mot de passe
                </div>
                <div style={{ fontSize: 13, color: SB.text3 }}>Dernière modification : il y a 3 mois</div>
              </div>
              <Btn icon={LuKeyRound} variant="outline" small onClick={() => setMdpOpen(true)}>
                Changer
              </Btn>
            </div>
          </Card>

          {/* Toggles sécurité */}
          <Card>
            <div style={{ fontSize: 13, fontWeight: 600, color: SB.text1, marginBottom: 16 }}>
              Options de sécurité
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <Toggle
                on={twoFA}
                onToggle={() => { setTwoFA(!twoFA); showToast(!twoFA ? "2FA activé" : "2FA désactivé"); }}
                label="Authentification à deux facteurs (2FA)"
                description="Sécurisez votre compte avec une vérification supplémentaire"
                icon={LuSmartphone}
              />
              <Toggle
                on={sessions}
                onToggle={() => { setSessions(!sessions); showToast("Paramètres sessions mis à jour"); }}
                label="Gestion des sessions actives"
                description="Déconnecter automatiquement les sessions inactives après 24h"
                icon={LuShield}
              />
            </div>
          </Card>

          {/* Zone de danger */}
          <Card style={{ border: "1px solid rgba(224,90,90,0.20)", background: "rgba(224,90,90,0.02)" }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: SB.red, marginBottom: 16,
              display: "flex", alignItems: "center", gap: 8 }}>
              <LuCircleAlert size={16} />
              Zone dangereuse
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <Toggle
                on={!actif}
                onToggle={() => {
                  setActif(!actif);
                  showToast(!actif ? "Compte réactivé" : "Compte désactivé", !actif);
                }}
                label={actif ? "Désactiver le compte" : "Réactiver le compte"}
                description="Un compte désactivé ne peut plus se connecter. Les données sont conservées."
                icon={LuUserX}
                danger
              />

              <div style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "16px 18px", borderRadius: 14,
                background: "rgba(224,90,90,0.04)", border: `1px solid rgba(224,90,90,0.15)`,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10,
                    background: "rgba(224,90,90,0.10)", color: SB.red,
                    display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <LuLogOut size={17} />
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 500, color: SB.text1 }}>
                      Déconnexion de toutes les sessions
                    </div>
                    <div style={{ fontSize: 12, color: SB.text3, marginTop: 2 }}>
                      Ferme toutes les sessions actives sur tous les appareils
                    </div>
                  </div>
                </div>
                <Btn variant="ghost" small danger onClick={() => showToast("Toutes les sessions ont été fermées")}>
                  Déconnecter tout
                </Btn>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          MODAL — Modifier le profil
      ══════════════════════════════════════════════════════════════════════ */}
      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Modifier le profil">
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <Field label="Nom complet" value={editForm.nom}
              onChange={(v) => setEditForm((f) => ({ ...f, nom: v }))} />
            <Field label="Email" value={editForm.email} type="email"
              onChange={(v) => setEditForm((f) => ({ ...f, email: v }))} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <Field label="Téléphone" value={editForm.telephone}
              onChange={(v) => setEditForm((f) => ({ ...f, telephone: v }))} />
            <Field label="CIN" value={editForm.cin}
              onChange={(v) => setEditForm((f) => ({ ...f, cin: v }))} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
            <Field label="Sexe" value={editForm.sexe} type="select"
              options={[{ value: "HOMME", label: "Homme" }, { value: "FEMME", label: "Femme" }]}
              onChange={(v) => setEditForm((f) => ({ ...f, sexe: v }))} />
            <Field label="Situation" value={editForm.situation} type="select"
              options={[{ value: "CELIBATAIRE", label: "Célibataire" }, { value: "MARIE", label: "Marié(e)" }]}
              onChange={(v) => setEditForm((f) => ({ ...f, situation: v }))} />
            <Field label="Enfants" value={editForm.enfants} type="number"
              onChange={(v) => setEditForm((f) => ({ ...f, enfants: v }))} />
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 8 }}>
            <Btn variant="outline" onClick={() => setEditOpen(false)}>Annuler</Btn>
            <Btn onClick={handleSaveProfile} disabled={saving} icon={saving ? LuLoader : undefined}>
              {saving ? "Enregistrement…" : "Enregistrer"}
            </Btn>
          </div>
        </div>
      </Modal>

      {/* ══════════════════════════════════════════════════════════════════════
          MODAL — Demande de congé
      ══════════════════════════════════════════════════════════════════════ */}
      <Modal open={congeOpen} onClose={() => setCongeOpen(false)} title="Demande de congé">
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Field label="Type de congé" value={congeForm.type} type="select"
            options={[
              { value: "SIMPLE",  label: "Congé simple" },
              { value: "MALADIE", label: "Maladie" },
              { value: "FERIE",   label: "Jour férié" },
            ]}
            onChange={(v) => setCongeForm((f) => ({ ...f, type: v }))} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <Field label="Date de début" value={congeForm.dateDebut} type="date"
              onChange={(v) => setCongeForm((f) => ({ ...f, dateDebut: v }))} />
            <Field label="Date de fin" value={congeForm.dateFin} type="date"
              onChange={(v) => setCongeForm((f) => ({ ...f, dateFin: v }))} />
          </div>
          <Field label="Motif (optionnel)" value={congeForm.motif}
            onChange={(v) => setCongeForm((f) => ({ ...f, motif: v }))} />

          {/* Résumé durée */}
          {congeForm.dateDebut && congeForm.dateFin && (
            <div style={{
              background: "rgba(46,134,171,0.06)", border: `1px solid ${SB.border}`,
              borderRadius: 12, padding: "12px 16px",
              display: "flex", alignItems: "center", gap: 8,
              fontSize: 13, color: SB.blue,
            }}>
              <LuCalendarDays size={15} />
              Durée : <strong>{diffDays(congeForm.dateDebut, congeForm.dateFin)} jour(s)</strong>
              &nbsp;·&nbsp;Solde restant après : <strong>{Math.max(joursRestants - diffDays(congeForm.dateDebut, congeForm.dateFin), 0)} jour(s)</strong>
            </div>
          )}

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 8 }}>
            <Btn variant="outline" onClick={() => setCongeOpen(false)}>Annuler</Btn>
            <Btn onClick={handleDemanderConge} disabled={saving || !congeForm.dateDebut || !congeForm.dateFin}
              icon={saving ? LuLoader : LuCalendarDays}>
              {saving ? "Envoi…" : "Envoyer la demande"}
            </Btn>
          </div>
        </div>
      </Modal>

      {/* ══════════════════════════════════════════════════════════════════════
          MODAL — Demande d'avance
      ══════════════════════════════════════════════════════════════════════ */}
      <Modal open={avanceOpen} onClose={() => setAvanceOpen(false)} title="Demande d'avance sur salaire" width={440}>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ background: "rgba(46,134,171,0.06)", borderRadius: 12, padding: "14px 16px",
            fontSize: 13, color: SB.text2, lineHeight: 1.6 }}>
            Votre salaire net mensuel : <strong style={{ color: SB.teal }}>{fmtAr(salaireNet)}</strong>
            <br />
            L'avance maximale accordée est de 50% soit <strong style={{ color: SB.blue }}>{fmtAr(Math.round(salaireNet * 0.5))}</strong>
          </div>
          <Field label="Montant demandé (Ar)" value={avanceMontant} type="number"
            onChange={setAvanceMontant} />
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 8 }}>
            <Btn variant="outline" onClick={() => setAvanceOpen(false)}>Annuler</Btn>
            <Btn icon={LuBanknote} disabled={!avanceMontant || parseInt(avanceMontant) <= 0}
              onClick={() => {
                setAvanceOpen(false);
                setAvanceMontant("");
                showToast("Demande d'avance envoyée avec succès");
              }}>
              Envoyer la demande
            </Btn>
          </div>
        </div>
      </Modal>

      {/* ══════════════════════════════════════════════════════════════════════
          MODAL — Changer mot de passe
      ══════════════════════════════════════════════════════════════════════ */}
      <Modal open={mdpOpen} onClose={() => setMdpOpen(false)} title="Changer le mot de passe" width={440}>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Field label="Mot de passe actuel" value={mdpForm.actuel} type="password"
            onChange={(v) => setMdpForm((f) => ({ ...f, actuel: v }))} />
          <Field label="Nouveau mot de passe" value={mdpForm.nouveau} type="password"
            onChange={(v) => setMdpForm((f) => ({ ...f, nouveau: v }))} />
          <Field label="Confirmer le nouveau mot de passe" value={mdpForm.confirmer} type="password"
            onChange={(v) => setMdpForm((f) => ({ ...f, confirmer: v }))} />

          {mdpForm.nouveau && mdpForm.confirmer && mdpForm.nouveau !== mdpForm.confirmer && (
            <div style={{ color: SB.red, fontSize: 12, display: "flex", alignItems: "center", gap: 6 }}>
              <LuCircleAlert size={13} /> Les mots de passe ne correspondent pas
            </div>
          )}

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 8 }}>
            <Btn variant="outline" onClick={() => setMdpOpen(false)}>Annuler</Btn>
            <Btn
              icon={LuLock}
              disabled={!mdpForm.actuel || !mdpForm.nouveau || mdpForm.nouveau !== mdpForm.confirmer}
              onClick={async () => {
                setSaving(true);
                try {
                  if (profile) {
                    await put(`rh/staff/id/${profile.id}`, { mdp: mdpForm.nouveau });
                    setMdpOpen(false);
                    setMdpForm({ actuel: "", nouveau: "", confirmer: "" });
                    showToast("Mot de passe mis à jour avec succès");
                  }
                } catch {
                  showToast("Erreur lors du changement de mot de passe", false);
                } finally {
                  setSaving(false);
                }
              }}
            >
              {saving ? "Enregistrement…" : "Changer le mot de passe"}
            </Btn>
          </div>
        </div>
      </Modal>
    </div>
  );
}