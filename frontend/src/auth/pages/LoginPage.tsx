import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/auth";
import {
  getApiErrorMessage,
  getApiErrorCode,
  getApiRequestId, 
} from "@/core/http/api-error";

import { Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const emailError = useMemo(() => {
    if (!email) return "";
    const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
    return ok ? "" : "Enter a valid email";
  }, [email]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setLoading(true);

    try {
      const safeEmail = email.trim().toLowerCase();
      await login({ email: safeEmail, password });
      navigate("/", { replace: true });
    } catch (error: unknown) {
      const msg = getApiErrorMessage(error);
      const code = getApiErrorCode(error);
      const rid = getApiRequestId(error);

      setErr(rid ? `${msg} (${code ?? "ERROR"}) [${rid}]` : msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-10 md:min-w-100 min-w-full rounded-2xl">
      <div className="p-6 sm:p-8 bg-white rounded-2xl border border-gray-200 shadow-[0_12px_30px_rgba(0,0,0,0.06)]">
        <div className="flex flex-col gap-4">
          <div className="mb-8">
            <h1 className="text-2xl font-semibold">Welcome back</h1>
            <p>Sign in to continue to your dashboard.</p>
          </div>

          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
            {/* EMAIL */}
            <div className="flex flex-col gap-1">
              <label className="font-medium text-sm">Email</label>
              <input
                type="email"
                autoComplete="email"
                value={email}
                placeholder="you@company.com"
                onChange={(e) => setEmail(e.target.value)}
                className={`
                  w-full px-3 py-2 border rounded-lg outline-none
                  focus:ring-2 focus:ring-blue-500
                  ${emailError ? "border-red-500" : "border-gray-300"}
                `}
              />
              <span className="text-xs text-red-500 min-h-[1rem]">
                {emailError || " "}
              </span>
            </div>

            {/* PASSWORD */}
            <div className="flex flex-col gap-1">
              <label className="font-medium text-sm">Password</label>

              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  onChange={(e) => setPassword(e.target.value)}
                  className="
                    w-full px-3 py-2 border border-gray-300 rounded-lg outline-none
                    focus:ring-2 focus:ring-blue-500
                  "
                />

                <button
                  type="button"
                  onClick={() => setShowPass((s) => !s)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPass ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* FOOTER INFO */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Use your work account</span>

              <button
                type="button"
                className="text-blue-600 hover:underline text-sm"
                onClick={() => {
                  // navigate("/forgot-password")
                }}
              >
                Forgot password?
              </button>
            </div>

            {/* SUBMIT BUTTON */}
            <button
              type="submit"
              disabled={loading}
              className="
                w-full py-3 rounded-lg bg-blue-600 text-white font-semibold
                hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center gap-2
              "
            >
              {loading && (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              )}
              {loading ? "Signing in..." : "Sign in"}
            </button>

            <p className="text-center text-xs text-gray-500">
              By continuing, you agree to the Terms & Privacy Policy.
            </p>
          </form>

          {/* ERROR ALERT */}
          {err && (
            <div className="border border-red-300 text-red-700 bg-red-50 px-4 py-3 rounded-lg text-sm">
              {err}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
