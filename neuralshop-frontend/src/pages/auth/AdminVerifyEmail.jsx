import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-hot-toast";
import { authService } from "../../services/api/authService";
import Button from "../../components/ui/atoms/Button";
import Input from "../../components/ui/atoms/Input";

const AdminVerifyEmail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState(location.state?.email || "");
  const [otp, setOtp] = useState("");
  const [isResending, setIsResending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await authService.verifyAdminEmail({ email, otp });
      toast.success("Admin email verified. Please login.");
      navigate("/admin/login");
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Verification failed. Check the OTP.",
      );
    }
  };

  const handleResend = async () => {
    if (!email) {
      toast.error("Please enter your email to resend OTP.");
      return;
    }
    setIsResending(true);
    try {
      await authService.resendOtp({
        email,
        type: "verification",
        role: "admin",
      });
      toast.success("Verification OTP resent. Check your email.");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to resend OTP.");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-gray-900 p-8 rounded-xl shadow-lg w-full max-w-md space-y-5 mx-auto"
    >
      <h1 className="text-2xl font-semibold text-white">
        Admin Email Verification
      </h1>

      <Input
        placeholder="Admin email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full p-3 rounded bg-slate-800 text-white"
      />

      <p className="text-sm text-slate-400">
        Enter the OTP sent to your admin email.
      </p>

      <Input
        placeholder="OTP"
        value={otp}
        onChange={(e) => setOtp(e.target.value)}
        className="w-full p-3 rounded bg-slate-800 text-white"
      />

      <Button
        type="submit"
        className="w-full px-4 py-3 rounded bg-emerald-500 hover:bg-emerald-600"
      >
        Verify & Continue
      </Button>

      <div className="flex justify-between items-center text-sm text-slate-400">
        <button
          type="button"
          onClick={handleResend}
          disabled={isResending}
          className="text-blue-400 hover:underline disabled:text-slate-600"
        >
          {isResending ? "Resending..." : "Resend OTP"}
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

export default AdminVerifyEmail;
