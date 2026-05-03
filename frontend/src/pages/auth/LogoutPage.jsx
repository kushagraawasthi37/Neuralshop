import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthCenter } from "../../components/auth/AuthLayout";
import {
  AuthBtn,
  GhostBtn,
  TextLink,
  FormTitle,
  FormSubtitle,
} from "../../components/auth/AuthField";
import { useAuthStore } from "../../store/authStore";
import { authApi } from "../../api/auth";

const LogoutPage = () => {
  const navigate = useNavigate();
  const { pendingRole, logout } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const confirmLogout = async () => {
    setLoading(true);
    setError("");

    try {
      if (pendingRole === "admin") {
        await authApi.adminLogout();
      } else {
        await authApi.logout(pendingRole);
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Logout failed. Please try again.",
      );
      setLoading(false);
      return;
    }

    logout();
    navigate("/logged-out");
  };

  return (
    <AuthCenter>
      <div style={{ textAlign: "center" }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "4px 12px",
            border: "1px solid rgba(201,169,110,0.25)",
            background: "rgba(201,169,110,0.06)",
            fontSize: 10,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "#c9a96e",
            marginBottom: 14,
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "#c9a96e",
            }}
          />
          Confirm sign out
        </div>

        <FormTitle style={{ marginBottom: 12 }}>
          Are you sure?
          <br />
          Sign out now.
        </FormTitle>
        <FormSubtitle style={{ marginBottom: 28 }}>
          This will invalidate your current session and remove access to
          protected pages until you sign in again.
        </FormSubtitle>

        <div
          style={{ display: "grid", gap: 12, maxWidth: 320, margin: "0 auto" }}
        >
          <AuthBtn type="button" loading={loading} onClick={confirmLogout}>
            Confirm Sign Out
          </AuthBtn>
          <GhostBtn
            type="button"
            onClick={() => navigate(-1)}
            disabled={loading}
          >
            Cancel
          </GhostBtn>
        </div>

        {error && (
          <p style={{ marginTop: 24, color: "#e87f7f", fontSize: 13 }}>
            {error}
          </p>
        )}

        <div
          style={{
            marginTop: 24,
            display: "flex",
            gap: 16,
            justifyContent: "center",
          }}
        >
          <TextLink onClick={() => navigate("/")}>← Home</TextLink>
          <TextLink onClick={() => navigate("/account")}>
            Stay signed in
          </TextLink>
        </div>
      </div>
    </AuthCenter>
  );
};

export default LogoutPage;
