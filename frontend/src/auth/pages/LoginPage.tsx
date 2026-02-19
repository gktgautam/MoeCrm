import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/auth";
import { getApiErrorMessage, getApiErrorCode, getApiRequestId } from "@/core/http/api-error";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Icons } from "@/components/icons";

// -----------------------------
// Validation Schema
// -----------------------------
const LoginSchema = z.object({
  email: z.string().email({ message: "Enter a valid email" }),
  password: z.string().min(1, "Password is required"),
});

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [showPass, setShowPass] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const form = useForm<z.infer<typeof LoginSchema>>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof LoginSchema>) => {
    setErr(null);
    form.clearErrors();
    form.setValue("email", values.email.trim().toLowerCase());

    try {
      await login(values);
      navigate("/", { replace: true });
    } catch (error: unknown) {
      const msg = getApiErrorMessage(error);
      const code = getApiErrorCode(error);
      const rid = getApiRequestId(error);
      setErr(rid ? `${msg} (${code ?? "ERROR"}) [${rid}]` : msg);
    }
  };

  return (
    <div className="p-10 md:min-w-100 min-w-full rounded-2xl flex justify-center">
      <Card className="w-full max-w-md border border-gray-200 shadow-xl rounded-2xl">
        <CardContent className="p-8">
          <div className="flex flex-col gap-4">
            <div className="mb-8">
              <h1 className="text-2xl font-semibold">Welcome back</h1>
              <p className="text-sm text-muted-foreground">Sign in to continue to your dashboard.</p>
            </div>

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* Email ------------------------------------------ */}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  placeholder="you@company.com"
                  {...form.register("email")}
                />
                {form.formState.errors.email && (
                  <p className="text-xs text-red-500">{form.formState.errors.email.message}</p>
                )}
              </div>

              {/* Password -------------------------------------- */}
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPass ? "text" : "password"}
                    placeholder="••••••••"
                    {...form.register("password")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass((s) => !s)}
                    className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700"
                  >
                    {showPass ? <Icons.eyeOff className="h-4 w-4" /> : <Icons.eye className="h-4 w-4" />}
                  </button>
                </div>
                {form.formState.errors.password && (
                  <p className="text-xs text-red-500">{form.formState.errors.password.message}</p>
                )}
              </div>

              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Use your work account</span>
                <button
                  type="button"
                  className="underline hover:text-primary"
                >
                  Forgot password?
                </button>
              </div>

              <Button
                type="submit"
                className="w-full font-bold"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <Icons.spinner className="h-4 w-4 animate-spin" />
                    Signing in...
                  </div>
                ) : (
                  "Sign in"
                )}
              </Button>

              <p className="text-center text-xs text-muted-foreground">
                By continuing, you agree to the Terms & Privacy Policy.
              </p>
            </form>

            {err && (
              <Alert variant="destructive">
                <AlertDescription>{err}</AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
