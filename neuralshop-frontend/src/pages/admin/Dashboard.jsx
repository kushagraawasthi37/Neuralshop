import { Link } from "react-router-dom";

const AdminDashboard = () => {
  return (
    <div className="min-h-screen bg-slate-950 px-6 py-24 text-white">
      <div className="mx-auto max-w-4xl rounded-3xl border border-white/10 bg-slate-900/90 p-10 shadow-2xl">
        <div className="flex flex-col gap-8">
          <div>
            <h1 className="text-4xl font-semibold">Admin Dashboard</h1>
            <p className="mt-2 text-slate-400">
              Use the logout button below to sign out of the admin account.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Link
              to="/admin/logout"
              className="rounded-2xl bg-blue-500 px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-blue-400"
            >
              Logout as Admin
            </Link>
            <Link
              to="/"
              className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Back to Store
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
