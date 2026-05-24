"use client";

import { useEffect, useState } from "react";
import AdminShell from "@/components/AdminShell";
import type { SiteSettings } from "@/lib/data";

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/settings", { credentials: "include" })
      .then((r) => r.json())
      .then((data) => {
        if (data && !data.error) setSettings(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function handleSave(event: React.FormEvent) {
    event.preventDefault();
    if (!settings) return;

    setSaving(true);
    setSaved(false);

    const response = await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(settings),
    });

    if (response.ok) {
      const updated = await response.json();
      setSettings(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }

    setSaving(false);
  }

  function updateField(field: keyof SiteSettings, value: string | number) {
    if (!settings) return;
    setSettings({ ...settings, [field]: value });
  }

  function updateCoupon(index: number, field: "code" | "discount", value: string | number) {
    if (!settings) return;
    const coupons = [...settings.activeCoupons];
    coupons[index] = { ...coupons[index], [field]: value };
    setSettings({ ...settings, activeCoupons: coupons });
  }

  function addCoupon() {
    if (!settings) return;
    setSettings({
      ...settings,
      activeCoupons: [...settings.activeCoupons, { code: "", discount: 0.1 }],
    });
  }

  function removeCoupon(index: number) {
    if (!settings) return;
    const coupons = settings.activeCoupons.filter((_, i) => i !== index);
    setSettings({ ...settings, activeCoupons: coupons });
  }

  return (
    <AdminShell>
      <p className="text-xs font-black uppercase text-neutral-500">Sistema</p>
      <h1 className="mt-1 text-3xl font-black uppercase text-white">Configurações</h1>

      {loading ? (
        <div className="mt-8 flex items-center gap-3 text-neutral-400">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/20 border-t-white" />
          Carregando...
        </div>
      ) : settings ? (
        <form onSubmit={handleSave} className="mt-6 grid gap-6">
          <section className="rounded-md border border-white/10 bg-white/5 p-5">
            <h2 className="text-sm font-black uppercase text-neutral-400">Dados do site</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="grid gap-2 text-xs font-black uppercase text-neutral-400">
                Nome do site
                <input
                  type="text"
                  value={settings.siteName}
                  onChange={(e) => updateField("siteName", e.target.value)}
                  className="admin-input"
                />
              </label>
              <label className="grid gap-2 text-xs font-black uppercase text-neutral-400">
                WhatsApp
                <input
                  type="text"
                  value={settings.whatsappNumber}
                  onChange={(e) => updateField("whatsappNumber", e.target.value)}
                  className="admin-input"
                  placeholder="5511999999999"
                />
              </label>
            </div>
            <label className="mt-4 grid gap-2 text-xs font-black uppercase text-neutral-400">
              Descrição do site
              <textarea
                rows={2}
                value={settings.siteDescription}
                onChange={(e) => updateField("siteDescription", e.target.value)}
                className="admin-input resize-none"
              />
            </label>
          </section>

          <section className="rounded-md border border-white/10 bg-white/5 p-5">
            <h2 className="text-sm font-black uppercase text-neutral-400">Pagamento e frete</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="grid gap-2 text-xs font-black uppercase text-neutral-400">
                Frete grátis acima de (R$)
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={settings.freeShippingThreshold}
                  onChange={(e) => updateField("freeShippingThreshold", Number(e.target.value))}
                  className="admin-input"
                />
              </label>
              <label className="grid gap-2 text-xs font-black uppercase text-neutral-400">
                Desconto Pix (%)
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="1"
                  value={Math.round(settings.pixDiscount * 100)}
                  onChange={(e) => updateField("pixDiscount", Number(e.target.value) / 100)}
                  className="admin-input"
                />
              </label>
            </div>
          </section>

          <section className="rounded-md border border-white/10 bg-white/5 p-5">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-sm font-black uppercase text-neutral-400">Cupons ativos</h2>
              <button
                type="button"
                onClick={addCoupon}
                className="rounded-md border border-white/10 px-3 py-1.5 text-xs font-bold text-neutral-300 transition-colors hover:bg-white/10"
              >
                + Adicionar cupom
              </button>
            </div>
            {settings.activeCoupons.length === 0 ? (
              <p className="mt-3 text-sm font-bold text-neutral-500">Nenhum cupom ativo.</p>
            ) : (
              <div className="mt-4 grid gap-3">
                {settings.activeCoupons.map((coupon, index) => (
                  <div key={index} className="flex items-end gap-3 rounded-md bg-white/5 p-3">
                    <label className="grid flex-1 gap-1 text-xs font-black uppercase text-neutral-500">
                      Código
                      <input
                        type="text"
                        value={coupon.code}
                        onChange={(e) => updateCoupon(index, "code", e.target.value.toUpperCase())}
                        className="admin-input"
                        placeholder="KROMA10"
                      />
                    </label>
                    <label className="grid w-28 gap-1 text-xs font-black uppercase text-neutral-500">
                      Desconto (%)
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="1"
                        value={Math.round(coupon.discount * 100)}
                        onChange={(e) => updateCoupon(index, "discount", Number(e.target.value) / 100)}
                        className="admin-input"
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() => removeCoupon(index)}
                      className="rounded-md border border-red-500/30 px-3 py-2.5 text-xs font-bold text-red-400 transition-colors hover:bg-red-500/10"
                    >
                      Remover
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          <div className="flex items-center gap-4">
            <button
              type="submit"
              disabled={saving}
              className="rounded-md bg-white px-5 py-2.5 text-sm font-black uppercase text-black transition-colors hover:bg-neutral-200 disabled:opacity-50"
            >
              {saving ? "Salvando..." : "Salvar configurações"}
            </button>
            {saved ? (
              <span className="text-sm font-bold text-green-400">Salvo com sucesso!</span>
            ) : null}
          </div>
        </form>
      ) : null}
    </AdminShell>
  );
}
