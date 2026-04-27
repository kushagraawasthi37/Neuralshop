import { useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../../stores/authStore";
import { authService } from "../../services/api/authService";

const LogoutConfirm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuthStore();

  const isAdmin = useMemo(
    () => location.pathname.startsWith("/admin"),
    [location.pathname],
  );

  const handleLogout = async () => {
    try {
      if (isAdmin) {
        await authService.adminLogout();
      } else {
        await authService.logout();
      }
    } catch (error) {
      console.error("Logout request failed:", error?.response || error);
    } finally {
      logout();
      navigate(isAdmin ? "/admin/login" : "/login");
    }
  };

  const handleCancel = () => {
    navigate(isAdmin ? "/admin" : "/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-slate-900/95 p-8 shadow-2xl">
        <div className="space-y-6 text-center text-white">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-blue-300">
              Confirm Logout
            </p>
            <h1 className="mt-3 text-3xl font-semibold text-white">
              {isAdmin ? "Admin" : "User"} Logout
            </h1>
          </div>

          <p className="text-sm text-slate-300">
            Are you sure you want to sign out? You will be redirected to the
            {isAdmin ? " admin login page." : " login page."}
          </p>

          <div className="grid gap-4 sm:grid-cols-2">
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-2xl bg-blue-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-400"
            >
              Yes, log me out
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              No, keep me signed in
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogoutConfirm;
