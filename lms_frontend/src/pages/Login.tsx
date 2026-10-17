import { useState } from "react";
import type { FormEvent } from "react";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import loginImage from "../assets/img-auth-2.jpg";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import api from "../api";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await api.post("/auth/login", { email, password });
      // console.log("res -> ",res.data)
      localStorage.setItem("token", res.data.data.token);
      localStorage.setItem("user", res.data.data.email);
      localStorage.setItem("name", res.data.data.name);

      navigate("/books");
    } catch (err) {
      setError(
        axios.isAxiosError(err)
          ? (err.response?.data?.message ?? "Can't reach the server.")
          : "Something went wrong.",
      );
      setLoading(false);
    }
  };

  const handleGoogle = async (idToken: string) => {
    setError("");
    setLoading(true);

    try {
      const res = await api.post("/auth/google", { idToken });
      console.log("res -> ", res);
      localStorage.setItem("token", res.data.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.data.user));
      localStorage.setItem("name", JSON.stringify(res.data.data.name));

      navigate("/books");
    } catch (err) {
      setError(
        axios.isAxiosError(err)
          ? (err.response?.data?.message ?? "Google sign in failed.")
          : "Google sign in failed.",
      );
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-black px-22">
      <div className="flex w-full items-center justify-center bg-white px-6 py-12 sm:px-10 lg:w-1/2 lg:px-16">
        <div className="w-full max-w-[26rem]">
          <h1 className="text-[2rem] leading-[1.15] font-bold tracking-tight text-slate-900">
            Library Management System
          </h1>
          <p className="mt-0.5 text-[2rem] leading-[1.15] font-bold tracking-tight text-[#c8860d]">
            Login
          </p>

          <p className="mt-4 text-sm leading-relaxed text-slate-500">
            Sign in to manage the catalogue, students and issued books.
          </p>

          {error && (
            <p
              role="alert"
              className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              {error}
            </p>
          )}

          <form onSubmit={handleSubmit} className="mt-8">
            <label
              htmlFor="email"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Email
            </label>
            <div className="relative mb-4">
              <Mail className="pointer-events-none absolute top-1/2 left-3.5 h-[18px] w-[18px] -translate-y-1/2 text-slate-400" />
              <input
                id="email"
                type="email"
                required
                autoFocus
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter Email"
                className="w-full rounded-lg border border-slate-200 bg-slate-50/70 py-3 pr-3 pl-11 text-sm text-slate-800 transition placeholder:text-slate-400 focus:border-[#f5b700] focus:bg-white focus:ring-4 focus:ring-amber-100 focus:outline-none"
              />
            </div>

            <label
              htmlFor="password"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Password
            </label>
            <div className="relative mb-5">
              <Lock className="pointer-events-none absolute top-1/2 left-3.5 h-[18px] w-[18px] -translate-y-1/2 text-slate-400" />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full rounded-lg border border-slate-200 bg-slate-50/70 py-3 pr-11 pl-11 text-sm text-slate-800 transition placeholder:text-slate-400 focus:border-[#f5b700] focus:bg-white focus:ring-4 focus:ring-amber-100 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute top-1/2 right-3 -translate-y-1/2 rounded p-1 text-slate-400 transition hover:text-slate-600"
              >
                {showPassword ? (
                  <EyeOff className="h-[18px] w-[18px] cursor-pointer" />
                ) : (
                  <Eye className="h-[18px] w-[18px] cursor-pointer" />
                )}
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full cursor-pointer rounded-lg bg-[#f5b700] py-3 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-[#e5aa00] focus:ring-4 focus:ring-amber-200 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>

            <div className="my-6 flex items-center gap-4">
              <span className="h-px flex-1 bg-slate-200" />
              <span className="text-xs text-slate-400">or</span>
              <span className="h-px flex-1 bg-slate-200" />
            </div>

            <div className="flex justify-center">
              <GoogleLogin
                onSuccess={(res) => {
                  if (res.credential) {
                    handleGoogle(res.credential);
                  }
                }}
                onError={() => setError("Google sign in failed.")}
                width="368"
              />
            </div>
          </form>
        </div>
      </div>

      <div className="hidden bg-white lg:block lg:w-1/2">
        <img
          src={loginImage}
          alt=""
          className="h-full w-full object-contain object-center"
        />
      </div>
    </div>
  );
}
