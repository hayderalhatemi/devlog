"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const DEMO_EMAIL = "demo@devlog.app";
const DEMO_PASSWORD = "demo1234";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  async function login(loginEmail: string, loginPassword: string) {
    setError("");
    setLoading(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: loginEmail,
            password: loginPassword,
          }),
        },
      );

      const data = await response.json();

      if (data.success) {
        localStorage.setItem("token", data.data.token);
        router.push("/dashboard");
      } else {
        setError(data.message || "Failed to sign in");
      }
    } catch {
      setError("Failed to sign in");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await login(email, password);
  }

  async function handleDemoLogin() {
    setEmail(DEMO_EMAIL);
    setPassword(DEMO_PASSWORD);

    await login(DEMO_EMAIL, DEMO_PASSWORD);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
        <h1 className="mb-2 text-3xl font-bold">DevLog</h1>
        <p className="mb-6 text-gray-600">Sign in to your account</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="mb-1 block font-medium">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-1 block font-medium">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2"
              required
            />
          </div>

          {error && (
            <p role="alert" className="text-red-600">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full cursor-pointer rounded-md bg-black px-4 py-2 font-medium text-white disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>

          <button
            type="button"
            onClick={handleDemoLogin}
            disabled={loading}
            className="w-full cursor-pointer rounded-md border border-gray-300 px-4 py-2 font-medium disabled:opacity-50"
          >
            Try Demo
          </button>
        </form>

        <div className="mt-4 rounded-md bg-gray-100 p-3 text-sm">
          <p className="font-medium">Demo account</p>
          <p>Email: {DEMO_EMAIL}</p>
          <p>Password: {DEMO_PASSWORD}</p>
        </div>

        <p className="mt-4 text-center text-sm">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="font-medium underline">
            Register
          </Link>
        </p>
      </div>
    </main>
  );
}
