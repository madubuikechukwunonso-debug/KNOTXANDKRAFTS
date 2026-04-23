import { useState } from "react";
import { Link } from "react-router";
import Navigation from "@/components/Navigation";
import { LogIn, UserPlus, ArrowLeft } from "lucide-react";

export default function Login() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [identifier, setIdentifier] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState("");
  const [isPending, setIsPending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const trimmedPassword = password.trim();

    try {
      setIsPending(true);

      if (mode === "login") {
        const trimmedIdentifier = identifier.trim();

        if (!trimmedIdentifier || !trimmedPassword) {
          setError("Please enter your username/email and password");
          return;
        }

        const payload = {
          identifier: trimmedIdentifier,
          password: trimmedPassword,
        };

        console.log("LOGIN PAYLOAD", payload);

        const response = await fetch("/api/session/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        const data = await response.json();

        if (!response.ok || !data?.ok) {
          setError(data?.message || "Login failed");
          return;
        }

        localStorage.setItem("local_auth_token", data.token);
        window.location.href = "/";
        return;
      }

      const trimmedUsername = username.trim();
      const trimmedEmail = email.trim();
      const trimmedDisplayName = displayName.trim();

      if (!trimmedUsername || !trimmedEmail || !trimmedPassword) {
        setError("Please fill in all required fields");
        return;
      }

      const payload = {
        username: trimmedUsername,
        email: trimmedEmail,
        password: trimmedPassword,
        displayName: trimmedDisplayName || undefined,
      };

      console.log("REGISTER PAYLOAD", payload);

      const response = await fetch("/api/session/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok || !data?.ok) {
        setError(data?.message || "Registration failed");
        return;
      }

      localStorage.setItem("local_auth_token", data.token);
      window.location.href = "/";
    } catch (err: any) {
      setError(err?.message || "Something went wrong. Please try again.");
    } finally {
      setIsPending(false);
    }
  };

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
                  ? "Sign in with your username or email to manage your account, bookings, and orders."
                  : "Create an account to book services, shop products, and stay connected with KNOTXANDKRAFTS."}
              </p>

              <div className="mt-10 rounded-3xl border border-white/10 bg-white/5 p-5">
                <p className="text-[10px] uppercase tracking-[0.28em] text-white/45">
                  Direct Session Access
                </p>
                <p className="mt-3 text-sm leading-6 text-white/75">
                  Authentication now uses direct API session routes instead of
                  tRPC auth calls.
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
                        autoComplete="username"
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
                          autoComplete="username"
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
                          autoComplete="email"
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
                      autoComplete={mode === "login" ? "current-password" : "new-password"}
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
