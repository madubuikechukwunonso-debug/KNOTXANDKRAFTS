import { useState } from "react";
import { Link } from "react-router";
import { trpc } from "@/providers/trpc";
import Navigation from "@/components/Navigation";
import { LogIn, UserPlus, ArrowLeft } from "lucide-react";

function getOAuthUrl() {
  const appID = import.meta.env.VITE_APP_ID;
  const authUrl = import.meta.env.VITE_KIMI_AUTH_URL;
  const redirectUri = `${window.location.origin}/api/oauth/callback`;
  const state = btoa(redirectUri);

  const url = new URL(`${authUrl}/api/oauth/authorize`);
  url.searchParams.set("client_id", appID);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "profile");
  url.searchParams.set("state", state);

  return url.toString();
}

export default function Login() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState("");

  const loginMutation = trpc.localAuth.login.useMutation({
    onSuccess: (data) => {
      localStorage.setItem("local_auth_token", data.token);
      window.location.href = "/";
    },
    onError: (err) => setError(err.message),
  });

  const registerMutation = trpc.localAuth.register.useMutation({
    onSuccess: (data) => {
      localStorage.setItem("local_auth_token", data.token);
      window.location.href = "/";
    },
    onError: (err) => setError(err.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (mode === "login") {
      loginMutation.mutate({ username, password });
    } else {
      if (!email) {
        setError("Email is required");
        return;
      }
      registerMutation.mutate({
        username,
        email,
        password,
        displayName: displayName || undefined,
      });
    }
  };

  const isPending = loginMutation.isPending || registerMutation.isPending;

  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      <div className="pt-24 lg:pt-32 pb-16 px-6">
        <div className="max-w-md mx-auto">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-black/50 hover:text-black transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to home
          </Link>

          <h1 className="font-serif text-4xl lg:text-5xl font-light mb-2">
            {mode === "login" ? "Welcome Back" : "Get Started"}
          </h1>
          <p className="text-black/50 text-sm mb-10">
            {mode === "login"
              ? "Sign in to your account"
              : "Create your account"}
          </p>

          {/* OAuth Button */}
          <a
            href={getOAuthUrl()}
            className="w-full flex items-center justify-center gap-3 bg-black text-white py-4 text-sm uppercase tracking-widest font-medium hover:bg-black/80 transition-colors mb-8"
          >
            <LogIn className="w-4 h-4" />
            Continue with Gmail
          </a>

          <div className="flex items-center gap-4 mb-8">
            <div className="flex-1 h-px bg-black/10" />
            <span className="text-xs text-black/40 uppercase tracking-widest">or</span>
            <div className="flex-1 h-px bg-black/10" />
          </div>

          {/* Local Auth Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs uppercase tracking-widest text-black/50 mb-2 block">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full border border-black/10 px-4 py-3 text-sm outline-none focus:border-black transition-colors"
                required
              />
            </div>

            {mode === "register" && (
              <>
                <div>
                  <label className="text-xs uppercase tracking-widest text-black/50 mb-2 block">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full border border-black/10 px-4 py-3 text-sm outline-none focus:border-black transition-colors"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-widest text-black/50 mb-2 block">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full border border-black/10 px-4 py-3 text-sm outline-none focus:border-black transition-colors"
                    placeholder="Optional"
                  />
                </div>
              </>
            )}

            <div>
              <label className="text-xs uppercase tracking-widest text-black/50 mb-2 block">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-black/10 px-4 py-3 text-sm outline-none focus:border-black transition-colors"
                required
                minLength={6}
              />
            </div>

            {error && (
              <p className="text-red-500 text-sm">{error}</p>
            )}

            <button
              type="submit"
              disabled={isPending}
              className="w-full bg-black text-white py-4 text-sm uppercase tracking-widest font-medium hover:bg-black/80 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isPending ? (
                "..."
              ) : mode === "login" ? (
                <>
                  <LogIn className="w-4 h-4" />
                  Sign In
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  Create Account
                </>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-black/50 mt-8">
            {mode === "login" ? (
              <>
                Don&apos;t have an account?{" "}
                <button
                  onClick={() => { setMode("register"); setError(""); }}
                  className="text-black underline underline-offset-4"
                >
                  Register
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button
                  onClick={() => { setMode("login"); setError(""); }}
                  className="text-black underline underline-offset-4"
                >
                  Sign in
                </button>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
