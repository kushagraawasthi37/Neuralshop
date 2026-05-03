import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminProfileApi } from "../../../api/admin";

function Field({ label, children }) {
  return (
    <div className="form-group">
      <div className="form-label">{label}</div>
      {children}
    </div>
  );
}

function Section({ title, sub, children }) {
  return (
    <div style={{ marginBottom: 40 }}>
      <div
        style={{
          marginBottom: 24,
          paddingBottom: 16,
          borderBottom: "1px solid var(--border-gold)",
        }}
      >
        <div
          style={{
            fontSize: 13,
            color: "var(--champagne)",
            letterSpacing: "0.04em",
            marginBottom: 4,
          }}
        >
          {title}
        </div>
        {sub && (
          <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{sub}</div>
        )}
      </div>
      {children}
    </div>
  );
}

export default function ProfilePanel({ showToast }) {
  const qc = useQueryClient();

  const { data: profile, isLoading } = useQuery({
    queryKey: ["admin-profile"],
    queryFn: () => adminProfileApi.get().then((r) => r.data.data || r.data),
    retry: false,
  });

  const [info, setInfo] = useState({ name: "", email: "", businessName: "" });
  const [infoInit, setInfoInit] = useState(false);

  if (profile && !infoInit) {
    setInfo({
      name: profile.name || profile.username || "",
      email: profile.email || "",
      businessName: profile.businessName || profile.storeName || "",
    });
    setInfoInit(true);
  }

  const [pw, setPw] = useState({ current: "", next: "", confirm: "" });
  const [pwVisible, setPwVisible] = useState({
    current: false,
    next: false,
    confirm: false,
  });
  const [pwError, setPwError] = useState("");

  const updateMutation = useMutation({
    mutationFn: (data) => adminProfileApi.update(data),
    onSuccess: () => {
      qc.invalidateQueries(["admin-profile"]);
      showToast("Profile updated successfully");
    },
    onError: () => showToast("Failed to update profile"),
  });

  const passwordMutation = useMutation({
    mutationFn: (data) => adminProfileApi.changePassword(data),
    onSuccess: () => {
      setPw({ current: "", next: "", confirm: "" });
      setPwError("");
      showToast("Password changed successfully");
    },
    onError: (err) => {
      const msg = err?.response?.data?.message || "Failed to change password";
      setPwError(msg);
    },
  });

  const handleInfoSave = (e) => {
    e.preventDefault();
    if (!info.name.trim()) return showToast("Name is required");
    updateMutation.mutate({
      name: info.name.trim(),
      businessName: info.businessName.trim(),
    });
  };

  const handlePasswordSave = (e) => {
    e.preventDefault();
    setPwError("");
    if (!pw.current) return setPwError("Current password is required");
    if (pw.next.length < 8)
      return setPwError("New password must be at least 8 characters");
    if (pw.next !== pw.confirm) return setPwError("Passwords do not match");
    passwordMutation.mutate({
      currentPassword: pw.current,
      newPassword: pw.next,
    });
  };

  const initials = (info.name || "A")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const EyeIcon = ({ open }) => (
    <svg
      width="14"
      height="14"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
    >
      {open ? (
        <>
          <path d="M1 10s3.5-7 9-7 9 7 9 7-3.5 7-9 7-9-7-9-7z" />
          <circle cx="10" cy="10" r="3" />
        </>
      ) : (
        <>
          <path d="M17.94 11.94A10 10 0 0 1 1 10M3.06 8.06A10 10 0 0 1 19 10" />
          <path d="M1 1l18 18" />
        </>
      )}
    </svg>
  );

  return (
    <div className="ns-content">
      {/* Avatar header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 24,
          marginBottom: 48,
          padding: "28px 24px",
          background: "rgba(201,169,110,0.025)",
          border: "1px solid var(--border-gold)",
          flexWrap: "wrap",
        }}
      >
        <div
          style={{
            width: 72,
            height: 72,
            background: "rgba(201,169,110,0.12)",
            border: "1px solid rgba(201,169,110,0.35)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <span
            style={{
              fontFamily: "'Cormorant Garamond',serif",
              fontSize: 28,
              fontWeight: 300,
              color: "var(--gold)",
            }}
          >
            {initials}
          </span>
        </div>
        <div>
          <div
            style={{
              fontFamily: "'Cormorant Garamond',serif",
              fontSize: 26,
              fontWeight: 300,
              color: "var(--champagne)",
              marginBottom: 4,
            }}
          >
            {isLoading ? "Loading…" : info.name || "Admin"}
          </div>
          <div
            style={{
              fontSize: 11,
              color: "var(--text-muted)",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              marginBottom: 8,
            }}
          >
            {profile?.role || "Administrator"}
          </div>
          <div style={{ display: "flex", gap: 16 }}>
            <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
              <span style={{ color: "var(--gold)", marginRight: 6 }}>✉</span>
              {info.email || "—"}
            </div>
            {info.businessName && (
              <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
                <span style={{ color: "var(--gold)", marginRight: 6 }}>◈</span>
                {info.businessName}
              </div>
            )}
          </div>
        </div>

        <div
          style={{
            marginLeft: "auto",
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            gap: 6,
          }}
        >
          <div
            style={{
              fontSize: 9,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "var(--text-muted)",
            }}
          >
            Account Status
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "#4a8c47",
              }}
            />
            <span style={{ fontSize: 11, color: "var(--champagne)" }}>
              Active
            </span>
          </div>
        </div>
      </div>

      <div
        className="profile-grid-override"
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 32,
          alignItems: "start",
        }}
      >
        {/* Left — Personal Info */}
        <div>
          <Section
            title="Personal Information"
            sub="Update your display name and business details"
          >
            <form onSubmit={handleInfoSave}>
              <div
                className="form-row"
                style={{ gridTemplateColumns: "1fr", marginBottom: 0 }}
              >
                <Field label="Display Name">
                  <input
                    className="ns-input"
                    placeholder="Your name"
                    value={info.name}
                    onChange={(e) =>
                      setInfo((s) => ({ ...s, name: e.target.value }))
                    }
                  />
                </Field>
                <Field label="Email Address">
                  <input
                    className="ns-input"
                    type="email"
                    placeholder="admin@example.com"
                    value={info.email}
                    readOnly
                    style={{ opacity: 0.55, cursor: "not-allowed" }}
                    title="Email cannot be changed here"
                  />
                  <div
                    style={{
                      fontSize: 10,
                      color: "var(--text-muted)",
                      marginTop: 6,
                      letterSpacing: "0.04em",
                    }}
                  >
                    Contact support to change your email address.
                  </div>
                </Field>
                <Field label="Business / Store Name">
                  <input
                    className="ns-input"
                    placeholder="Your store name"
                    value={info.businessName}
                    onChange={(e) =>
                      setInfo((s) => ({ ...s, businessName: e.target.value }))
                    }
                  />
                </Field>
              </div>

              <div style={{ marginTop: 24 }}>
                <button
                  type="submit"
                  className="ns-btn ns-btn-primary"
                  disabled={updateMutation.isPending}
                  style={{ minWidth: 140 }}
                >
                  {updateMutation.isPending ? "Saving…" : "Save Changes"}
                </button>
              </div>
            </form>
          </Section>
        </div>

        {/* Right — Password + Account Info */}
        <div>
          <Section
            title="Change Password"
            sub="Use a strong password with at least 8 characters"
          >
            <form onSubmit={handlePasswordSave}>
              <div
                className="form-row"
                style={{ gridTemplateColumns: "1fr", marginBottom: 0 }}
              >
                {[
                  {
                    key: "current",
                    label: "Current Password",
                    placeholder: "Enter current password",
                  },
                  {
                    key: "next",
                    label: "New Password",
                    placeholder: "At least 8 characters",
                  },
                  {
                    key: "confirm",
                    label: "Confirm New Password",
                    placeholder: "Repeat new password",
                  },
                ].map(({ key, label, placeholder }) => (
                  <Field key={key} label={label}>
                    <div style={{ position: "relative" }}>
                      <input
                        className="ns-input"
                        type={pwVisible[key] ? "text" : "password"}
                        placeholder={placeholder}
                        value={pw[key]}
                        onChange={(e) =>
                          setPw((s) => ({ ...s, [key]: e.target.value }))
                        }
                        style={{ paddingRight: 40 }}
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setPwVisible((s) => ({ ...s, [key]: !s[key] }))
                        }
                        style={{
                          position: "absolute",
                          right: 12,
                          top: "50%",
                          transform: "translateY(-50%)",
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          color: "var(--text-muted)",
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        <EyeIcon open={pwVisible[key]} />
                      </button>
                    </div>
                  </Field>
                ))}
              </div>

              {pwError && (
                <div
                  style={{
                    fontSize: 11,
                    color: "#c05050",
                    marginTop: 8,
                    padding: "8px 12px",
                    background: "rgba(192,80,80,0.08)",
                    border: "1px solid rgba(192,80,80,0.2)",
                  }}
                >
                  {pwError}
                </div>
              )}

              <div style={{ marginTop: 24 }}>
                <button
                  type="submit"
                  className="ns-btn ns-btn-primary"
                  disabled={passwordMutation.isPending}
                  style={{ minWidth: 160 }}
                >
                  {passwordMutation.isPending ? "Updating…" : "Update Password"}
                </button>
              </div>
            </form>
          </Section>

          {/* Account meta */}
          <Section title="Account Details" sub="Read-only account information">
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                {
                  label: "Account ID",
                  value: profile?.id || profile?._id || "—",
                },
                { label: "Role", value: profile?.role || "Administrator" },
                {
                  label: "Member Since",
                  value: profile?.createdAt
                    ? new Date(profile.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })
                    : "—",
                },
                {
                  label: "Last Login",
                  value: profile?.lastLogin
                    ? new Date(profile.lastLogin).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })
                    : "—",
                },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "10px 0",
                    borderBottom: "1px solid rgba(201,169,110,0.06)",
                  }}
                >
                  <span
                    style={{
                      fontSize: 11,
                      color: "var(--text-muted)",
                      letterSpacing: "0.06em",
                    }}
                  >
                    {label}
                  </span>
                  <span
                    style={{
                      fontSize: 12,
                      color: "var(--champagne)",
                      fontFamily: "'DM Mono',monospace",
                    }}
                  >
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
}
