import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { authService } from "../../services/api/authService";
import Button from "../../components/ui/atoms/Button";
import Input from "../../components/ui/atoms/Input";

const AdminRegister = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await authService.adminRegister(form);
      toast.success("Admin registration successful. Check email for OTP.");
      navigate("/admin/verify-email", { state: { email: form.email } });
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Registration failed. Please try again.",
      );
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-gray-900 p-8 rounded-xl shadow-lg w-full max-w-md space-y-5 mx-auto"
    >
      <h1 className="text-2xl font-semibold text-white">Admin Register</h1>

      <Input
        placeholder="Name"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
        className="w-full p-3 rounded bg-slate-800 text-white"
      />
      <Input
        placeholder="Email"
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
        Register as Admin
      </Button>

      <div className="flex justify-between items-center text-sm text-slate-400">
        <button
          type="button"
          onClick={() => navigate("/admin/login")}
          className="text-blue-400 hover:underline"
        >
          Admin login
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

export default AdminRegister;
