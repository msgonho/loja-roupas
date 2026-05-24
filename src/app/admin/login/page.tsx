"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setLoading(true);

    const response = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ password }),
    });

    if (response.ok) {
      router.push("/admin");
    } else {
      setError("Senha incorreta");
    }

    setLoading(false);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#101010] px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex justify-center">
          <Image
            src="/kromalab-logo-transparent.png"
            alt="KromaLab"
            width={236}
            height={60}
            className="h-12 w-auto brightness-0 invert"
          />
        </div>

        <form
          onSubmit={handleLogin}
          className="rounded-lg border border-white/10 bg-white/5 p-6"
        >
          <p className="text-xs font-black uppercase text-neutral-400">
            Painel administrativo
          </p>
          <h1 className="mt-2 text-2xl font-black uppercase text-white">
            Acesso restrito
          </h1>

          <label className="mt-6 grid gap-2 text-sm font-black uppercase text-neutral-400">
            Senha
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="rounded-md border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium normal-case text-white placeholder-neutral-500 focus:border-white/30 focus:outline-none"
              placeholder="Digite a senha de administrador"
            />
          </label>

          {error ? (
            <p className="mt-3 text-sm font-bold text-red-400">{error}</p>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="mt-5 w-full rounded-md bg-white px-4 py-3 text-sm font-black uppercase text-black transition-colors hover:bg-neutral-200 disabled:opacity-50"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <p className="mt-4 text-center text-xs font-bold text-neutral-500">
          Defina a senha com a variável ADMIN_PASSWORD
        </p>
      </div>
    </main>
  );
}
