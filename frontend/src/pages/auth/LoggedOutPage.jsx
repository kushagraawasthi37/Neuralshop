import { useNavigate } from "react-router-dom";
import AuthLayout, { AuthCenter } from "../../components/auth/AuthLayout";
import {
  AuthBtn,
  GhostBtn,
  TextLink,
  FormTitle,
  FormSubtitle,
} from "../../components/auth/AuthField";
import { useAuthStore } from "../../store/authStore";

export default function LoggedOutPage() {
  const navigate = useNavigate();
  const logout = useAuthStore((s) => s.logout);

  const handleGuest = () => {
    logout();
    navigate("/");
  };

  const handleSignin = () => {
    logout();
  };

  return (
    <AuthCenter>
      <div style={{ textAlign: "center" }}>
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: "50%",
            background: "rgba(74,124,89,0.12)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 28px",
          }}
        >
          <svg
            width="36"
            height="36"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#c9a96e"
            strokeWidth="2"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>

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
              background: "#4a7c59",
            }}
          />
          Session Terminated
        </div>

        <FormTitle style={{ marginBottom: 12 }}>
          You've been
          <br />
          signed out.
        </FormTitle>
        <FormSubtitle style={{ marginBottom: 32 }}>
          Your session token has been invalidated. Protected routes are now
          inaccessible until you sign in again.
        </FormSubtitle>

        <div
          style={{ display: "grid", gap: 12, maxWidth: 320, margin: "0 auto" }}
        >
          <AuthBtn type="button" onClick={handleSignin}>
            Sign Back In →
          </AuthBtn>
          <GhostBtn type="button" onClick={handleGuest}>
            Continue as Guest
          </GhostBtn>
        </div>

        <div
          style={{
            marginTop: 24,
            display: "flex",
            gap: 16,
            justifyContent: "center",
          }}
        >
          <TextLink onClick={() => navigate("/")}>← Home</TextLink>
          <TextLink onClick={() => navigate("/register")}>
            Create Account
          </TextLink>
        </div>
      </div>
    </AuthCenter>
  );
}
