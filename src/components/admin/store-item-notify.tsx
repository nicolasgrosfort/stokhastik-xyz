"use client";

import { ToggleGroup } from "@/components/common/toggle-group";
import { StoreItem } from "@prisma/client";
import { useState } from "react";

export function StoreItemNotify({ item }: { item: StoreItem }) {
  const [kind, setKind] = useState<"new" | "update">("new");
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleSend = async () => {
    setSending(true);
    setMessage(null);

    try {
      const res = await fetch(`/api/admin/store-items/${item.id}/notify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isNew: kind === "new" }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage({
          type: "error",
          text: data.error ?? "Une erreur s'est produite.",
        });
        return;
      }

      setMessage({ type: "success", text: "Newsletter envoyée." });
    } catch {
      setMessage({ type: "error", text: "Une erreur s'est produite." });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex flex-col gap-2 w-full max-w-md border border-dark-green p-3">
      <span className="text-xs font-mono uppercase">
        Envoyer la newsletter
      </span>
      <ToggleGroup
        value={kind}
        onChange={setKind}
        options={[
          { value: "new", label: "Nouveau produit" },
          { value: "update", label: "Mise à jour" },
        ]}
      />
      <button
        type="button"
        disabled={sending}
        onClick={handleSend}
        className="bg-foreground text-background border border-foreground font-mono text-xs uppercase p-1 block w-full enabled:cursor-pointer text-center enabled:hover:underline"
      >
        {sending ? "Envoi..." : "Envoyer"}
      </button>
      {message && (
        <p
          className={`text-xs font-mono ${message.type === "error" ? "text-red-500" : "text-green-600"}`}
        >
          {message.text}
        </p>
      )}
    </div>
  );
}
