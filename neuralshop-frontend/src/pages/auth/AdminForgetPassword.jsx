import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { authService } from "../../services/api/authService";
import Button from "../../components/ui/atoms/Button";
import Input from "../../components/ui/atoms/Input";

const AdminForgetPassword = () => {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await authService.forgotPassword({ email, role: "admin" });
      toast.success("Password reset OTP sent. Check your email.");
      navigate("/admin/reset-password", { state: { email, role: "admin" } });
    } catch (err) {
      toast.error(err.response?.data?.message || "Request failed. Try again.");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-gray-900 p-8 rounded-xl shadow-lg w-full max-w-md space-y-5 mx-auto"
    >
      <h1 className="text-2xl font-semibold text-white">
        Admin Forgot Password
      </h1>

      <Input
        placeholder="Admin email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full p-3 rounded bg-slate-800 text-white"
      />

      <Button type="submit" className="w-full px-4 py-3 rounded">
        Send OTP
      </Button>

      <div className="flex justify-between items-center text-sm text-slate-400">
        <button
          type="button"
          onClick={() => navigate("/admin/login")}
          className="text-blue-400 hover:underline"
        >
          Back to admin login
        </button>
        <button
          type="button"
          onClick={() => navigate("/login")}
          className="text-blue-400 hover:underline"
        >
          User login
        </button>
      </div>
    </form>
  );
};

export default AdminForgetPassword;
