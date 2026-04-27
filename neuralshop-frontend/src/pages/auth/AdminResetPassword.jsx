import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { authService } from "../../services/api/authService";
import Button from "../../components/ui/atoms/Button";
import Input from "../../components/ui/atoms/Input";

const AdminResetPassword = () => {
  const { state } = useLocation();
  const [email, setEmail] = useState(state?.email || "");
  const [form, setForm] = useState({ otp: "", newPassword: "" });
  const [sending, setSending] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await authService.resetPassword({
        email,
        otp: form.otp,
        newPassword: form.newPassword,
        role: "admin",
      });
      toast.success("Admin password reset successful. Please login.");
      navigate("/admin/login");
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Reset failed. Check OTP and try again.",
      );
    }
  };

  const handleResend = async () => {
    if (!email) {
      toast.error("Enter your email first to resend OTP.");
      return;
    }

    setSending(true);
    try {
      await authService.resendOtp({ email, type: "reset", role: "admin" });
      toast.success("Reset OTP resent. Check your email.");
    } catch (err) {
      toast.error(err.response?.data?.message || "Unable to resend OTP.");
    } finally {
      setSending(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-gray-900 p-8 rounded-xl shadow-lg w-full max-w-md space-y-5 mx-auto"
    >
      <h1 className="text-2xl font-semibold text-white">
        Admin Reset Password
      </h1>

      <Input
        placeholder="Admin email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full p-3 rounded bg-slate-800 text-white"
      />
      <Input
        placeholder="OTP"
        value={form.otp}
        onChange={(e) => setForm({ ...form, otp: e.target.value })}
        className="w-full p-3 rounded bg-slate-800 text-white"
      />
      <Input
        type="password"
        placeholder="New Password"
        value={form.newPassword}
        onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
        className="w-full p-3 rounded bg-slate-800 text-white"
      />

      <Button
        type="submit"
        className="w-full px-4 py-3 rounded bg-emerald-500 hover:bg-emerald-600"
      >
        Reset Password
      </Button>

      <div className="flex justify-between items-center text-sm text-slate-400">
        <button
          type="button"
          onClick={handleResend}
          disabled={sending}
          className="text-blue-400 hover:underline disabled:text-slate-600"
        >
          {sending ? "Resending..." : "Resend OTP"}
        </button>
        <button
          type="button"
          onClick={() => navigate("/admin/login")}
          className="text-blue-400 hover:underline"
        >
          Back to admin login
        </button>
      </div>
    </form>
  );
};

export default AdminResetPassword;
