import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/features/auth";
import { getApiErrorMessage, getApiErrorCode, getApiRequestId } from "@/core/http/api-error";

import {
  Alert,
  Box,
  Button,
  CircularProgress, 
  IconButton,
  InputAdornment,
  Link,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import VisibilityOffRoundedIcon from "@mui/icons-material/VisibilityOffRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";

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
      // ✅ normalize email to avoid invisible failures (spaces/case)
      const safeEmail = email.trim().toLowerCase();

      await login({ email: safeEmail, password });
      navigate("/", { replace: true });
    } catch (error: unknown) {
      // ✅ IMPORTANT: pass the caught error (not event)
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
      
      <div className=" p-6 sm:p-8 bg-white rounded-2xl border border-gray-200 shadow-[0_12px_30px_rgba(0,0,0,0.06)] ">

          <div className=" flex flex-col gap-4">
            
            <div className="mb-8">
              <h1 className="text-2xl font-semibold">Welcome back</h1>
              <p>Sign in to continue to your dashboard.</p>
            </div>
            
            

            

            <Box component="form" onSubmit={handleSubmit} noValidate>
              <Stack spacing={2.25}>
                <TextField
                  label="Email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  fullWidth
                  error={!!emailError}
                  helperText={emailError || " "}
                />

                <TextField
                  label="Password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type={showPass ? "text" : "password"}
                  autoComplete="current-password"
                  fullWidth
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label={showPass ? "Hide password" : "Show password"}
                          onClick={() => setShowPass((s) => !s)}
                          edge="end"
                        >
                          {showPass ? <VisibilityOffRoundedIcon /> : <VisibilityRoundedIcon />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />

                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Typography variant="body2" color="text.secondary">
                    Use your work account
                  </Typography>

                  <Link
                    component="button"
                    type="button"
                    underline="hover"
                    sx={{ fontSize: 14 }}
                    onClick={() => {
                      // navigate("/forgot-password")
                    }}
                  >
                    Forgot password?
                  </Link>
                </Box>

                <Button
                  type="submit"
                  size="large"
                  variant="contained"
                  disableElevation
                  disabled={loading}
                  sx={{
                    py: 1.2,
                    borderRadius: 2,
                    textTransform: "none",
                    fontWeight: 700,
                  }}
                  startIcon={loading ? <CircularProgress size={18} /> : null}
                >
                  {loading ? "Signing in..." : "Sign in"}
                </Button>

                <Typography variant="caption" color="text.secondary" sx={{ textAlign: "center" }}>
                  By continuing, you agree to the Terms & Privacy Policy.
                </Typography>
              </Stack>
            </Box>

            {err ? (
              <Alert severity="error" variant="outlined">
                {err}
              </Alert>
            ) : null}
            
          </div>
        </div>

        
       
    </div>
  );
}
