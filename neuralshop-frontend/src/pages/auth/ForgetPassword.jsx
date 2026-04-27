import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../../services/api/authService";
import { toast } from "react-hot-toast";
import Button from "../../components/ui/atoms/Button";
import Input from "../../components/ui/atoms/Input";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await authService.forgotPassword({ email, role: "user" });
      toast.success("Password reset OTP sent. Check your email.");
      navigate("/reset-password", { state: { email, role: "user" } });
    } catch (err) {
      toast.error(err.response?.data?.message || "Request failed. Try again.");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-gray-900 p-8 rounded-xl shadow-lg w-full max-w-md space-y-5 mx-auto"
    >
      <h1 className="text-2xl font-semibold text-white">Forgot Password</h1>

      <Input
        placeholder="Enter your email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full p-3 rounded bg-slate-800 text-white"
      />

      <Button type="submit" className="w-full px-4 py-3 rounded">
        Send OTP
      </Button>

      <div className="flex justify-between text-sm text-slate-400">
        <button
          type="button"
          onClick={() => navigate("/login")}
          className="text-blue-400 hover:underline"
        >
          Back to login
        </button>
        <button
          type="button"
          onClick={() => navigate("/admin/forgot-password")}
          className="text-blue-400 hover:underline"
        >
          Admin reset
        </button>
      </div>
    </form>
  );
};

export default ForgotPassword;
