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
  const [identifier, setIdentifier] = useState("");
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
      loginMutation.mutate({
        identifier,
        password,
      });
      return;
    }

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
  };

  const isPending = loginMutation.isPending || registerMutation.isPending;

  return (
    <>
      <Navigation />

      <main className="min-h-screen bg-[#f8f5f0] px-6 pb-16 pt-28 text-black md:px-10 lg:px-16">
        <div className="mx-auto max-w-6xl">
          <Link
            to="/"
            className="mb-8 inline-flex items-center gap-2 text-sm text-black/65 transition-opacity hover:opacity-70"
          >
            <ArrowLeft size={16} />
            Back to home
          </Link>

          <div className="grid grid-cols-1 overflow-hidden rounded-[2rem] bg-white shadow-[0_20px_60px_rgba(0,0,0,0.06)] lg:grid-cols-[0.95fr_1.05fr]">
            <div className="bg-black px-8 py-12 text-white sm:px-10 lg:px-12">
              <p className="text-[11px] uppercase tracking-[0.35em] text-white/45">
                KNOTXANDKRAFTS
              </p>

              <h1 className="mt-6 font-serif text-4xl leading-tight sm:text-5xl">
                {mode === "login" ? "Welcome Back" : "Create Your Account"}
              </h1>

              <p className="mt-5 max-w-md text-sm leading-7 text-white/70 sm:text-base">
                {mode === "login"
                  ? "Sign in with your username or email to continue managing your bookings, orders, and account."
                  : "Register your account to book services, shop products, and stay connected with KNOTXANDKRAFTS."}
              </p>

              <div className="mt-10 rounded-3xl border border-white/10 bg-white/5 p-5">
                <p className="text-[10px] uppercase tracking-[0.28em] text-white/45">
                  Quick Access
                </p>
                <p className="mt-3 text-sm leading-6 text-white/75">
                  You can continue with Google, or use local sign-in with your
                  username or email and password.
                </p>
              </div>
            </div>

            <div className="px-8 py-12 sm:px-10 lg:px-12">
              <div className="mx-auto max-w-md">
                <div className="mb-8">
                  <h2 className="font-serif text-3xl text-black">
                    {mode === "login" ? "Sign In" : "Register"}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-black/60">
                    {mode === "login"
                      ? "Access your account using your username or email."
                      : "Set up your profile in a few steps."}
                  </p>
                </div>

                <a
                  href={getOAuthUrl()}
                  className="inline-flex w-full items-center justify-center gap-3 rounded-2xl border border-black/10 px-5 py-3 text-sm font-medium text-black transition-all duration-300 hover:border-black/25 hover:bg-black hover:text-white"
                >
                  <LogIn size={18} />
                  Continue with Gmail
                </a>

                <div className="my-8 flex items-center gap-4">
                  <div className="h-px flex-1 bg-black/10" />
                  <span className="text-xs uppercase tracking-[0.3em] text-black/35">
                    or
                  </span>
                  <div className="h-px flex-1 bg-black/10" />
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  {mode === "login" ? (
                    <div>
                      <label className="mb-2 block text-xs uppercase tracking-[0.22em] text-black/55">
                        Username or Email
                      </label>
                      <input
                        type="text"
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        className="w-full rounded-2xl border border-black/10 px-4 py-3 text-sm outline-none transition-colors focus:border-black"
                        placeholder="Enter your username or email"
                        required
                      />
                    </div>
                  ) : (
                    <>
                      <div>
                        <label className="mb-2 block text-xs uppercase tracking-[0.22em] text-black/55">
                          Username
                        </label>
                        <input
                          type="text"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          className="w-full rounded-2xl border border-black/10 px-4 py-3 text-sm outline-none transition-colors focus:border-black"
                          required
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-xs uppercase tracking-[0.22em] text-black/55">
                          Email
                        </label>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full rounded-2xl border border-black/10 px-4 py-3 text-sm outline-none transition-colors focus:border-black"
                          required
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-xs uppercase tracking-[0.22em] text-black/55">
                          Display Name
                        </label>
                        <input
                          type="text"
                          value={displayName}
                          onChange={(e) => setDisplayName(e.target.value)}
                          className="w-full rounded-2xl border border-black/10 px-4 py-3 text-sm outline-none transition-colors focus:border-black"
                          placeholder="Optional"
                        />
                      </div>
                    </>
                  )}

                  <div>
                    <label className="mb-2 block text-xs uppercase tracking-[0.22em] text-black/55">
                      Password
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full rounded-2xl border border-black/10 px-4 py-3 text-sm outline-none transition-colors focus:border-black"
                      required
                      minLength={6}
                    />
                  </div>

                  {error ? (
                    <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                      {error}
                    </div>
                  ) : null}

                  <button
                    type="submit"
                    disabled={isPending}
                    className="inline-flex w-full items-center justify-center gap-3 rounded-2xl bg-black px-5 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {mode === "login" ? <LogIn size={18} /> : <UserPlus size={18} />}
                    {isPending
                      ? "Please wait..."
                      : mode === "login"
                        ? "Sign In"
                        : "Create Account"}
                  </button>
                </form>

                <div className="mt-8 text-sm text-black/65">
                  {mode === "login" ? (
                    <>
                      Don&apos;t have an account?{" "}
                      <button
                        type="button"
                        onClick={() => {
                          setMode("register");
                          setError("");
                        }}
                        className="text-black underline underline-offset-4"
                      >
                        Register
                      </button>
                    </>
                  ) : (
                    <>
                      Already have an account?{" "}
                      <button
                        type="button"
                        onClick={() => {
                          setMode("login");
                          setError("");
                        }}
                        className="text-black underline underline-offset-4"
                      >
                        Sign in
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
