"use client";

import { useEffect, useState } from "react";
import AdminShell from "@/components/AdminShell";
import type { AdminUser } from "@/lib/data";

const roleLabels: Record<string, string> = {
  admin: "Administrador",
  manager: "Gerente",
  viewer: "Visualizador",
};

const roleColors: Record<string, string> = {
  admin: "bg-purple-500/20 text-purple-400",
  manager: "bg-blue-500/20 text-blue-400",
  viewer: "bg-neutral-500/20 text-neutral-400",
};

const roleDescriptions: Record<string, string> = {
  admin: "Acesso total: pode criar/editar/excluir produtos, pedidos, usuários e configurações.",
  manager: "Pode gerenciar produtos e pedidos. Não pode alterar configurações ou excluir usuários.",
  viewer: "Apenas visualização: pode ver dados do painel mas não pode editar nada.",
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", email: "", role: "viewer" as AdminUser["role"], password: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/users", { credentials: "include" })
      .then((r) => r.json())
      .then((data) => setUsers(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  function resetForm() {
    setForm({ name: "", email: "", role: "viewer", password: "" });
    setShowForm(false);
    setEditingId(null);
    setError("");
  }

  function startEdit(user: AdminUser) {
    setForm({ name: user.name, email: user.email, role: user.role, password: "" });
    setEditingId(user.id);
    setShowForm(true);
    setError("");
  }

  async function handleSave() {
    if (!form.name.trim() || !form.email.trim()) {
      setError("Preencha nome e e-mail");
      return;
    }
    if (!editingId && !form.password.trim()) {
      setError("Defina uma senha para o novo usuário");
      return;
    }
    setSaving(true);
    setError("");

    try {
      if (editingId) {
        const res = await fetch(`/api/users/${editingId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(form),
        });
        if (res.ok) {
          const updated = await res.json();
          setUsers((prev) => prev.map((u) => (u.id === editingId ? updated : u)));
          resetForm();
        } else {
          const data = await res.json();
          setError(data.error || "Erro ao salvar");
        }
      } else {
        const res = await fetch("/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(form),
        });
        if (res.ok) {
          const created = await res.json();
          setUsers((prev) => [...prev, created]);
          resetForm();
        } else {
          const data = await res.json();
          setError(data.error || "Erro ao criar");
        }
      }
    } catch {
      setError("Erro de conexão");
    }
    setSaving(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Excluir este usuário?")) return;
    try {
      const res = await fetch(`/api/users/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        setUsers((prev) => prev.filter((u) => u.id !== id));
      } else {
        const data = await res.json();
        alert(data.error || "Erro ao excluir");
      }
    } catch { /* ignore */ }
  }

  return (
    <AdminShell>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase text-neutral-500">Equipe</p>
          <h1 className="mt-1 text-3xl font-black uppercase text-white">
            Usuários
            <span className="ml-2 text-neutral-500">({users.length})</span>
          </h1>
        </div>
        <button
          type="button"
          onClick={() => { resetForm(); setShowForm(true); }}
          className="rounded-md bg-white px-4 py-2.5 text-sm font-black uppercase text-black transition-colors hover:bg-neutral-200"
        >
          + Novo usuário
        </button>
      </div>

      {/* Role descriptions */}
      <div className="mt-5 rounded-md border border-white/10 bg-white/5 p-5">
        <h2 className="text-sm font-black uppercase text-neutral-400">Funções e permissões</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          {(["admin", "manager", "viewer"] as const).map((role) => (
            <div key={role} className="rounded-md border border-white/10 p-3">
              <span className={`inline-block rounded-full px-2.5 py-1 text-xs font-black ${roleColors[role]}`}>
                {roleLabels[role]}
              </span>
              <p className="mt-2 text-xs leading-5 text-neutral-400">{roleDescriptions[role]}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 rounded-md border border-yellow-500/20 bg-yellow-500/5 p-3">
          <p className="text-xs font-bold text-yellow-400">Como funciona a senha?</p>
          <p className="mt-1 text-xs leading-5 text-neutral-400">
            Ao criar um novo usuário, defina uma senha de acesso. O usuário usará este e-mail e senha para fazer login no painel administrativo.
            Para alterar a senha, edite o usuário e preencha o campo &quot;Nova senha&quot;. Se deixar em branco ao editar, a senha atual será mantida.
          </p>
        </div>
      </div>

      {/* Form */}
      {showForm ? (
        <div className="mt-5 rounded-md border border-white/10 bg-white/5 p-5">
          <h2 className="text-sm font-black uppercase text-neutral-400">
            {editingId ? "Editar usuário" : "Novo usuário"}
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2 text-xs font-black uppercase text-neutral-400">
              Nome
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="admin-input"
                placeholder="Nome completo"
              />
            </label>
            <label className="grid gap-2 text-xs font-black uppercase text-neutral-400">
              E-mail
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="admin-input"
                placeholder="email@exemplo.com"
              />
            </label>
            <label className="grid gap-2 text-xs font-black uppercase text-neutral-400">
              {editingId ? "Nova senha (deixe em branco para manter)" : "Senha de acesso"}
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="admin-input"
                placeholder={editingId ? "••••••••" : "Defina uma senha"}
                required={!editingId}
              />
            </label>
            <label className="grid gap-2 text-xs font-black uppercase text-neutral-400">
              Função
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value as AdminUser["role"] })}
                className="admin-input"
              >
                <option value="admin">Administrador</option>
                <option value="manager">Gerente</option>
                <option value="viewer">Visualizador</option>
              </select>
            </label>
          </div>
          {error ? <p className="mt-3 text-sm font-bold text-red-400">{error}</p> : null}
          <div className="mt-4 flex gap-3">
            <button
              type="button"
              disabled={saving}
              onClick={handleSave}
              className="rounded-md bg-white px-5 py-2 text-xs font-black uppercase text-black transition-colors hover:bg-neutral-200 disabled:opacity-50"
            >
              {saving ? "Salvando..." : editingId ? "Salvar" : "Criar"}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="rounded-md border border-white/10 px-5 py-2 text-xs font-black uppercase text-neutral-400 transition-colors hover:bg-white/5"
            >
              Cancelar
            </button>
          </div>
        </div>
      ) : null}

      {loading ? (
        <div className="mt-8 flex items-center gap-3 text-neutral-400">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/20 border-t-white" />
          Carregando...
        </div>
      ) : users.length === 0 ? (
        <div className="mt-6 rounded-md border border-dashed border-white/10 p-8 text-center">
          <p className="text-sm font-bold text-neutral-500">Nenhum usuário cadastrado.</p>
        </div>
      ) : (
        <div className="mt-5 grid gap-3">
          {users.map((user) => (
            <div
              key={user.id}
              className="flex flex-wrap items-center justify-between gap-4 rounded-md border border-white/10 bg-white/5 p-4"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-sm font-black text-white">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-bold text-white">{user.name}</p>
                  <p className="text-xs text-neutral-500">{user.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`rounded-full px-2.5 py-1 text-xs font-black ${roleColors[user.role] || "bg-white/10 text-neutral-400"}`}>
                  {roleLabels[user.role] || user.role}
                </span>
                <button
                  type="button"
                  onClick={() => startEdit(user)}
                  className="rounded-md border border-white/10 px-3 py-1.5 text-xs font-bold text-neutral-300 transition-colors hover:bg-white/10"
                >
                  Editar
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(user.id)}
                  className="rounded-md border border-red-500/30 px-3 py-1.5 text-xs font-bold text-red-400 transition-colors hover:bg-red-500/10"
                >
                  Excluir
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminShell>
  );
}
