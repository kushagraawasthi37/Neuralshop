import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { authService } from "../../services/api/authService";
import Button from "../../components/ui/atoms/Button";
import Input from "../../components/ui/atoms/Input";

const AdminLogin = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await authService.adminLogin(form);
      toast.success("Admin login successful.");
      navigate("/admin");
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Admin login failed. Please try again.",
      );
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-gray-900 p-8 rounded-xl shadow-lg w-full max-w-md space-y-5 mx-auto"
    >
      <h1 className="text-2xl font-semibold text-white">Admin Login</h1>

      <Input
        placeholder="Admin email"
        type="email"
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
        className="w-full p-3 rounded bg-slate-800 text-white"
      />

      <Input
        type="password"
        placeholder="Password"
        value={form.password}
        onChange={(e) => setForm({ ...form, password: e.target.value })}
        className="w-full p-3 rounded bg-slate-800 text-white"
      />

      <Button type="submit" className="w-full px-4 py-3 rounded">
        Sign in
      </Button>

      <div className="flex justify-between items-center text-sm text-slate-400">
        <button
          type="button"
          onClick={() => navigate("/admin/forgot-password")}
          className="text-blue-400 hover:underline"
        >
          Forgot Password?
        </button>
        <button
          type="button"
          onClick={() => navigate("/login")}
          className="text-blue-400 hover:underline"
        >
          User Login
        </button>
      </div>

      <p className="text-sm text-slate-400 text-center">
        New admin?{" "}
        <span
          onClick={() => navigate("/admin/register")}
          className="text-blue-400 cursor-pointer"
        >
          Register here
        </span>
      </p>
    </form>
  );
};

export default AdminLogin;
