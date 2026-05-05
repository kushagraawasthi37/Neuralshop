import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { userApi } from "../../api/user";
import { useAuthStore } from "../../store/authStore";

function FormField({ label, register, name, type = "text", ...props }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <label
        style={{
          fontSize: 10,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: "rgba(240,230,208,0.38)",
        }}
      >
        {label}
      </label>
      <input
        type={type}
        {...(register ? register(name) : {})}
        {...props}
        style={{
          padding: "13px 16px",
          background: "rgba(255,255,255,0.02)",
          border: "1px solid rgba(201,169,110,0.18)",
          color: "#f0e6d0",
          fontFamily: "'DM Sans',sans-serif",
          fontSize: 14,
          outline: "none",
          width: "100%",
          minHeight: 44,
          transition: "border-color 0.3s",
          ...props.style,
        }}
        onFocus={(e) => (e.target.style.borderColor = "rgba(201,169,110,0.5)")}
        onBlur={(e) => (e.target.style.borderColor = "rgba(201,169,110,0.18)")}
      />
    </div>
  );
}

function Toast({ msg, show }) {
  return (
    <div
      style={{
        position: "fixed",
        bottom: "clamp(16px,4vw,28px)",
        right: "clamp(16px,4vw,28px)",
        left: "clamp(16px,4vw,auto)",
        zIndex: 9999,
        background: "#1a1916",
        border: "1px solid rgba(201,169,110,0.18)",
        padding: "14px 22px",
        display: "flex",
        alignItems: "center",
        gap: 10,
        fontSize: 12,
        color: "#f0e6d0",
        transform: show ? "translateY(0)" : "translateY(70px)",
        opacity: show ? 1 : 0,
        transition: "all 0.5s cubic-bezier(0.23,1,0.32,1)",
        minWidth: "min(240px, calc(100vw - 32px))",
      }}
    >
      <div
        style={{
          width: 5,
          height: 5,
          background: "#c9a96e",
          borderRadius: "50%",
          flexShrink: 0,
        }}
      />
      {msg}
    </div>
  );
}

const NAV_TABS = [
  { id: "personal", label: "Personal Info", icon: "👤" },
  { id: "addresses", label: "Addresses", icon: "📍" },
  { id: "security", label: "Security", icon: "🔒" },
  { id: "orders", label: "Orders", icon: "📦" },
  { id: "return", label: "Returns", icon: "↩" },
  { id: "wishlist", label: "Wishlist", icon: "♡" },
];

export default function ProfilePage() {
  const qc = useQueryClient();
  const [activeTab, setActiveTab] = useState("personal");
  const [toast, setToast] = useState({ show: false, msg: "" });
  const [editingAddrId, setEditingAddrId] = useState(null);
  const [showNewAddr, setShowNewAddr] = useState(false);
  const [addrForm, setAddrForm] = useState({
    label: "Home",
    phone: "",
    street: "",
    city: "",
    state: "",
    zipCode: "",
    country: "India",
  });

  const showToast = (msg) => {
    setToast({ show: true, msg });
    setTimeout(() => setToast({ show: false, msg: "" }), 3000);
  };

  const navigate = useNavigate();
  const { isLoggedIn, role } = useAuthStore();

  useEffect(() => {
    if (!isLoggedIn) {
      showToast("Login required to view your profile");
      setTimeout(() => navigate("/login"), 1500);
    } else if (role === "admin") {
      showToast("Admin accounts cannot access user profile");
      setTimeout(() => navigate("/admin/dashboard"), 1500);
    }
  }, [isLoggedIn, role, navigate]);

  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: () => userApi.getProfile().then((r) => r.data.data),
  });
  const { data: addresses = [] } = useQuery({
    queryKey: ["addresses"],
    queryFn: () => userApi.getAddresses().then((r) => r.data.data || []),
  });

  const { register, handleSubmit, reset } = useForm({
    values: profile ? { name: profile.name, phone: profile.phone } : {},
  });

  const updateProfileMutation = useMutation({
    mutationFn: (data) => userApi.updateProfile(data),
    onSuccess: () => {
      qc.invalidateQueries(["profile"]);
      showToast("Profile updated successfully");
    },
    onError: () => showToast("Failed to update profile"),
  });

  const createAddrMutation = useMutation({
    mutationFn: (data) => userApi.createAddress(data),
    onSuccess: () => {
      qc.invalidateQueries(["addresses"]);
      setShowNewAddr(false);
      setAddrForm({
        label: "Home",
        phone: "",
        street: "",
        city: "",
        state: "",
        zipCode: "",
        country: "India",
      });
      showToast("Address added");
    },
    onError: () => showToast("Failed to add address"),
  });

  const deleteAddrMutation = useMutation({
    mutationFn: (id) => userApi.deleteAddress(id),
    onSuccess: () => {
      qc.invalidateQueries(["addresses"]);
      showToast("Address removed");
    },
  });

  const initials = profile?.name
    ? profile.name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "?";

  return (
    <div style={{ minHeight: "100vh", paddingTop: "var(--nav-h, 80px)" }}>
      <style>{`
        /* Profile sidebar card */
        .profile-stat {
          background: rgba(201,169,110,0.03);
          border: 1px solid rgba(201,169,110,0.18);
          padding: 12px;
          text-align: center;
        }
        .profile-tab-btn {
          padding: 13px 16px;
          border: 1px solid rgba(201,169,110,0.18);
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 12px;
          cursor: pointer;
          transition: all 0.25s;
          letter-spacing: 0.04em;
          background: none;
          font-family: 'DM Sans', sans-serif;
          text-align: left;
          width: 100%;
          min-height: 44px;
          color: rgba(240,230,208,0.38);
          border-bottom: none;
        }
        .profile-tab-btn:last-child {
          border-bottom: 1px solid rgba(201,169,110,0.18);
        }
        .profile-tab-btn.active {
          color: #c9a96e;
          background: rgba(201,169,110,0.05);
          border-left: 2px solid #c9a96e;
          padding-left: 14px;
        }
        .profile-tab-btn:hover:not(.active) {
          color: rgba(240,230,208,0.65);
          background: rgba(255,255,255,0.02);
        }

        /* Section panel */
        .profile-section-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(22px, 4vw, 28px);
          font-weight: 300;
          color: #f0e6d0;
          margin-bottom: clamp(20px, 4vw, 32px);
        }

        /* Address card */
        .addr-card {
          padding: clamp(16px,3vw,20px) clamp(16px,3vw,24px);
          background: #1a1916;
          border: 1px solid rgba(201,169,110,0.18);
          position: relative;
        }
        .addr-card-inner {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 12px;
          flex-wrap: wrap;
        }

        /* Quick nav action panel */
        .profile-action-card {
          padding: clamp(20px,3vw,32px) clamp(16px,3vw,24px);
          background: #1a1916;
          border: 1px solid rgba(201,169,110,0.18);
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          flex-wrap: wrap;
        }
      `}</style>

      <div
        style={{
          maxWidth: 1320,
          margin: "0 auto",
          padding: "0 var(--page-px)",
        }}
      >
        {/* Page header */}
        <div className="page-header">
          <div>
            <div
              style={{
                fontSize: 10,
                letterSpacing: "0.28em",
                textTransform: "uppercase",
                color: "#c9a96e",
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 12,
              }}
            >
              <div style={{ width: 26, height: 1, background: "#c9a96e" }} />
              My Account
            </div>
            <h1 className="page-header__title">
              Your{" "}
              <em style={{ fontStyle: "italic", color: "#c9a96e" }}>Profile</em>
            </h1>
          </div>
        </div>

        {/* Mobile horizontal tab nav */}
        <div className="profile-mobile-nav">
          {NAV_TABS.map((tab) => (
            <button
              key={tab.id}
              className={`profile-mobile-nav-btn${activeTab === tab.id ? " active" : ""}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Main layout */}
        <div className="profile-layout">
          {/* Sidebar (desktop / tablet) */}
          <div className="profile-sidebar">
            <div
              style={{
                background: "#1a1916",
                border: "1px solid rgba(201,169,110,0.18)",
                padding: "clamp(20px,3vw,32px)",
              }}
            >
              {/* Avatar */}
              <div
                style={{
                  width: 80,
                  height: 80,
                  border: "1px solid rgba(201,169,110,0.18)",
                  margin: "0 auto 18px",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    background: "#252320",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: "'Cormorant Garamond',serif",
                    fontSize: 28,
                    fontWeight: 300,
                    color: "#c9a96e",
                  }}
                >
                  {initials}
                </div>
              </div>
              <div
                style={{
                  fontFamily: "'Cormorant Garamond',serif",
                  fontSize: 20,
                  fontWeight: 300,
                  color: "#f0e6d0",
                  textAlign: "center",
                  marginBottom: 4,
                }}
              >
                {profile?.name || "—"}
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: "rgba(240,230,208,0.38)",
                  textAlign: "center",
                  marginBottom: 20,
                  wordBreak: "break-all",
                }}
              >
                {profile?.email || "—"}
              </div>

              {/* Stats */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 2,
                  marginBottom: 20,
                }}
              >
                {[
                  { num: 0, label: "Orders" },
                  { num: addresses.length, label: "Addresses" },
                ].map((s, i) => (
                  <div key={i} className="profile-stat">
                    <div
                      style={{
                        fontFamily: "'Cormorant Garamond',serif",
                        fontSize: 22,
                        color: "#c9a96e",
                      }}
                    >
                      {s.num}
                    </div>
                    <div
                      style={{
                        fontSize: 9,
                        letterSpacing: "0.14em",
                        textTransform: "uppercase",
                        color: "rgba(240,230,208,0.38)",
                      }}
                    >
                      {s.label}
                    </div>
                  </div>
                ))}
              </div>

              {/* Nav tabs */}
              <div style={{ display: "flex", flexDirection: "column" }}>
                {NAV_TABS.map((tab) => (
                  <button
                    key={tab.id}
                    className={`profile-tab-btn${activeTab === tab.id ? " active" : ""}`}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    <span style={{ fontSize: 14 }}>{tab.icon}</span>
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Content panel */}
          <div>
            {activeTab === "personal" && (
              <form
                onSubmit={handleSubmit((data) =>
                  updateProfileMutation.mutate(data),
                )}
              >
                <div className="profile-section-title">
                  Personal Information
                </div>
                <div className="addr-grid-2" style={{ marginBottom: 16 }}>
                  <FormField
                    label="Full Name"
                    register={register}
                    name="name"
                    defaultValue={profile?.name}
                  />
                  <FormField
                    label="Phone"
                    register={register}
                    name="phone"
                    defaultValue={profile?.phone}
                  />
                </div>
                <div style={{ marginBottom: 28 }}>
                  <FormField
                    label="Email Address"
                    defaultValue={profile?.email}
                    disabled
                    style={{ opacity: 0.6 }}
                  />
                </div>
                <button
                  type="submit"
                  disabled={updateProfileMutation.isPending}
                  style={{
                    padding: "14px 32px",
                    background: "#c9a96e",
                    border: "none",
                    color: "#0d0c0b",
                    fontSize: 11,
                    letterSpacing: "0.18em",
                    textTransform: "uppercase",
                    fontWeight: 500,
                    cursor: "pointer",
                    fontFamily: "'DM Sans',sans-serif",
                    opacity: updateProfileMutation.isPending ? 0.7 : 1,
                    minHeight: 44,
                  }}
                >
                  {updateProfileMutation.isPending ? "Saving…" : "Save Changes"}
                </button>
              </form>
            )}

            {activeTab === "addresses" && (
              <div>
                <div className="profile-section-title">Saved Addresses</div>
                <div style={{ display: "grid", gap: 12, marginBottom: 20 }}>
                  {addresses.map((addr) => (
                    <div key={addr.id} className="addr-card">
                      <div className="addr-card-inner">
                        <div>
                          <div
                            style={{
                              fontSize: 14,
                              color: "#f0e6d0",
                              marginBottom: 6,
                            }}
                          >
                            {addr.label || "Address"}
                            {addr.isDefault && (
                              <span
                                style={{
                                  marginLeft: 8,
                                  fontSize: 9,
                                  letterSpacing: "0.12em",
                                  textTransform: "uppercase",
                                  color: "#c9a96e",
                                  border: "1px solid rgba(201,169,110,0.3)",
                                  padding: "2px 6px",
                                }}
                              >
                                Default
                              </span>
                            )}
                          </div>
                          <div
                            style={{
                              fontSize: 12,
                              color: "rgba(240,230,208,0.5)",
                              lineHeight: 1.7,
                            }}
                          >
                            {addr.street}
                            <br />
                            {addr.city}, {addr.state} {addr.zipCode}
                          </div>
                          <div
                            style={{
                              fontSize: 11,
                              color: "rgba(240,230,208,0.38)",
                              marginTop: 4,
                            }}
                          >
                            {addr.phone}
                          </div>
                        </div>
                        <button
                          onClick={() => deleteAddrMutation.mutate(addr.id)}
                          style={{
                            padding: "8px 16px",
                            border: "1px solid rgba(140,70,70,0.35)",
                            background: "none",
                            color: "rgba(190,110,110,0.75)",
                            fontSize: 9,
                            letterSpacing: "0.14em",
                            textTransform: "uppercase",
                            cursor: "pointer",
                            fontFamily: "'DM Sans',sans-serif",
                            minHeight: 36,
                            flexShrink: 0,
                          }}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                {!showNewAddr ? (
                  <button
                    onClick={() => setShowNewAddr(true)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "16px 20px",
                      border: "1px dashed rgba(201,169,110,0.2)",
                      color: "rgba(240,230,208,0.38)",
                      fontSize: 11,
                      letterSpacing: "0.14em",
                      textTransform: "uppercase",
                      background: "none",
                      cursor: "pointer",
                      fontFamily: "'DM Sans',sans-serif",
                      width: "100%",
                      justifyContent: "center",
                      minHeight: 52,
                    }}
                  >
                    + Add New Address
                  </button>
                ) : (
                  <div
                    style={{
                      padding: "clamp(16px,3vw,24px)",
                      border: "1px solid rgba(201,169,110,0.18)",
                      background: "#1a1916",
                    }}
                  >
                    <div
                      style={{
                        fontFamily: "'Cormorant Garamond',serif",
                        fontSize: 20,
                        color: "#f0e6d0",
                        marginBottom: 20,
                      }}
                    >
                      New Address
                    </div>
                    <div className="addr-grid-2">
                      <FormField
                        label="Label (Home, Work…)"
                        value={addrForm.label}
                        onChange={(e) =>
                          setAddrForm((p) => ({ ...p, label: e.target.value }))
                        }
                      />
                      <FormField
                        label="Phone"
                        value={addrForm.phone}
                        onChange={(e) =>
                          setAddrForm((p) => ({ ...p, phone: e.target.value }))
                        }
                      />
                    </div>
                    <div style={{ marginBottom: 16 }}>
                      <FormField
                        label="Street Address"
                        value={addrForm.street}
                        onChange={(e) =>
                          setAddrForm((p) => ({ ...p, street: e.target.value }))
                        }
                      />
                    </div>
                    <div className="addr-grid-3">
                      <FormField
                        label="City"
                        value={addrForm.city}
                        onChange={(e) =>
                          setAddrForm((p) => ({ ...p, city: e.target.value }))
                        }
                      />
                      <FormField
                        label="State"
                        value={addrForm.state}
                        onChange={(e) =>
                          setAddrForm((p) => ({ ...p, state: e.target.value }))
                        }
                      />
                      <FormField
                        label="ZIP / Pincode"
                        value={addrForm.zipCode}
                        onChange={(e) =>
                          setAddrForm((p) => ({
                            ...p,
                            zipCode: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                      <button
                        onClick={() => createAddrMutation.mutate(addrForm)}
                        style={{
                          padding: "12px 28px",
                          background: "#c9a96e",
                          border: "none",
                          color: "#0d0c0b",
                          fontSize: 11,
                          letterSpacing: "0.14em",
                          textTransform: "uppercase",
                          cursor: "pointer",
                          fontFamily: "'DM Sans',sans-serif",
                          minHeight: 44,
                          fontWeight: 500,
                        }}
                      >
                        Save Address
                      </button>
                      <button
                        onClick={() => setShowNewAddr(false)}
                        style={{
                          padding: "12px 20px",
                          background: "none",
                          border: "1px solid rgba(201,169,110,0.18)",
                          color: "rgba(240,230,208,0.38)",
                          fontSize: 11,
                          letterSpacing: "0.14em",
                          textTransform: "uppercase",
                          cursor: "pointer",
                          fontFamily: "'DM Sans',sans-serif",
                          minHeight: 44,
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === "security" && (
              <div>
                <div className="profile-section-title">Security Settings</div>
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 12 }}
                >
                  <div
                    style={{
                      padding: "clamp(16px,3vw,24px)",
                      background: "#1a1916",
                      border: "1px solid rgba(201,169,110,0.18)",
                    }}
                  >
                    <div
                      style={{
                        fontSize: 14,
                        color: "#f0e6d0",
                        marginBottom: 4,
                      }}
                    >
                      Password
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        color: "rgba(240,230,208,0.38)",
                        marginBottom: 16,
                      }}
                    >
                      Change your account password
                    </div>
                    <button
                      onClick={() =>
                        (window.location.href = "/forgot-password")
                      }
                      style={{
                        padding: "10px 24px",
                        background: "none",
                        border: "1px solid rgba(201,169,110,0.18)",
                        color: "rgba(240,230,208,0.55)",
                        fontSize: 11,
                        letterSpacing: "0.14em",
                        textTransform: "uppercase",
                        cursor: "pointer",
                        fontFamily: "'DM Sans',sans-serif",
                        minHeight: 44,
                      }}
                    >
                      Change Password
                    </button>
                  </div>
                  <div
                    style={{
                      padding: "clamp(16px,3vw,24px)",
                      background: "#1a1916",
                      border: "1px solid rgba(201,169,110,0.18)",
                    }}
                  >
                    <div
                      style={{
                        fontSize: 14,
                        color: "#f0e6d0",
                        marginBottom: 4,
                      }}
                    >
                      Account Email
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        color: "rgba(240,230,208,0.38)",
                        marginBottom: 6,
                      }}
                    >
                      Your verified email address
                    </div>
                    <div
                      style={{
                        fontFamily: "'DM Mono',monospace",
                        fontSize: 13,
                        color: "#c9a96e",
                        wordBreak: "break-all",
                      }}
                    >
                      {profile?.email}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "orders" && (
              <div>
                <div className="profile-section-title">My Orders</div>
                <div className="profile-action-card">
                  <div>
                    <div
                      style={{
                        fontSize: 14,
                        color: "#f0e6d0",
                        marginBottom: 4,
                      }}
                    >
                      Order History
                    </div>
                    <div
                      style={{ fontSize: 12, color: "rgba(240,230,208,0.38)" }}
                    >
                      View and track all your past orders
                    </div>
                  </div>
                  <button
                    onClick={() => navigate("/account/orders")}
                    style={{
                      padding: "12px 28px",
                      background: "#c9a96e",
                      border: "none",
                      color: "#0d0c0b",
                      fontSize: 11,
                      letterSpacing: "0.18em",
                      textTransform: "uppercase",
                      fontWeight: 500,
                      cursor: "pointer",
                      fontFamily: "'DM Sans',sans-serif",
                      whiteSpace: "nowrap",
                      minHeight: 44,
                    }}
                  >
                    View Orders
                  </button>
                </div>
              </div>
            )}

            {activeTab === "return" && (
              <div>
                <div className="profile-section-title">My Returns</div>
                <div className="profile-action-card">
                  <div>
                    <div
                      style={{
                        fontSize: 14,
                        color: "#f0e6d0",
                        marginBottom: 4,
                      }}
                    >
                      Return Requests
                    </div>
                    <div
                      style={{ fontSize: 12, color: "rgba(240,230,208,0.38)" }}
                    >
                      Manage and track your return requests
                    </div>
                  </div>
                  <button
                    onClick={() => navigate("/account/returns")}
                    style={{
                      padding: "12px 28px",
                      background: "none",
                      border: "1px solid rgba(201,169,110,0.4)",
                      color: "#c9a96e",
                      fontSize: 11,
                      letterSpacing: "0.18em",
                      textTransform: "uppercase",
                      fontWeight: 500,
                      cursor: "pointer",
                      fontFamily: "'DM Sans',sans-serif",
                      whiteSpace: "nowrap",
                      minHeight: 44,
                    }}
                  >
                    View Returns
                  </button>
                </div>
              </div>
            )}

            {activeTab === "wishlist" && (
              <div>
                <div className="profile-section-title">My Wishlist</div>
                <div className="profile-action-card">
                  <div>
                    <div
                      style={{
                        fontSize: 14,
                        color: "#f0e6d0",
                        marginBottom: 4,
                      }}
                    >
                      Saved Pieces
                    </div>
                    <div
                      style={{ fontSize: 12, color: "rgba(240,230,208,0.38)" }}
                    >
                      Items you've saved for later — ready when you are
                    </div>
                  </div>
                  <button
                    onClick={() => navigate("/account/wishlist")}
                    style={{
                      padding: "12px 28px",
                      background: "#c9a96e",
                      border: "none",
                      color: "#0d0c0b",
                      fontSize: 11,
                      letterSpacing: "0.18em",
                      textTransform: "uppercase",
                      fontWeight: 500,
                      cursor: "pointer",
                      fontFamily: "'DM Sans',sans-serif",
                      whiteSpace: "nowrap",
                      minHeight: 44,
                    }}
                  >
                    View Wishlist ♡
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <Toast msg={toast.msg} show={toast.show} />
    </div>
  );
}
