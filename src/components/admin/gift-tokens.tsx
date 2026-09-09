"use client";

import { GetUser } from "@/libs/user";
import { formatSwissNumber } from "@/libs/utils";
import { useRouter } from "next/navigation";
import { useState } from "react";

function getUserLabel(user: GetUser) {
  const name = [user.firstName, user.lastName].filter(Boolean).join(" ");
  return `${name || user.email || "—"} · ${formatSwissNumber(user.tokens)} STKH`;
}

export function GiftTokens({ users }: { users: GetUser[] }) {
  const router = useRouter();
  const [userId, setUserId] = useState("");
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setFeedback(null);

    const tokens = Number(amount);

    if (!userId) {
      setFeedback({ type: "error", text: "Sélectionne un utilisateur." });
      return;
    }

    if (!Number.isInteger(tokens) || tokens <= 0) {
      setFeedback({
        type: "error",
        text: "Le montant doit être un entier positif.",
      });
      return;
    }

    setSending(true);

    try {
      const res = await fetch("/api/admin/gift-tokens", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          tokens,
          message: message.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setFeedback({
          type: "error",
          text: data.error ?? "Une erreur s'est produite.",
        });
        return;
      }

      setFeedback({
        type: "success",
        text: `${formatSwissNumber(tokens)} STKH offerts.`,
      });
      setUserId("");
      setAmount("");
      setMessage("");
      router.refresh();
    } catch {
      setFeedback({ type: "error", text: "Une erreur s'est produite." });
    } finally {
      setSending(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-2 w-full max-w-md border border-dark-green p-3"
    >
      <span className="text-xs font-mono uppercase">Offrir des STKH</span>
      <p className="text-xs font-mono opacity-60">
        Crédite gratuitement le compte d&apos;un utilisateur (cadeau, don). Une
        transaction de type « Bonus » est enregistrée et l&apos;utilisateur
        reçoit un email.
      </p>

      <select
        value={userId}
        onChange={(event) => setUserId(event.target.value)}
        className="border border-dark-green w-full p-1 text-base font-mono focus:outline focus:-outline-offset-2 focus:outline-foreground"
      >
        <option value="">— Choisir un utilisateur —</option>
        {users.map((user) => (
          <option key={user.id} value={user.id}>
            {getUserLabel(user)}
          </option>
        ))}
      </select>

      <input
        type="number"
        min="1"
        step="1"
        value={amount}
        onChange={(event) => setAmount(event.target.value)}
        placeholder="Montant en STKH"
        className="border border-dark-green w-full p-1 text-base font-mono focus:outline focus:-outline-offset-2 focus:outline-foreground [&::-webkit-inner-spin-button]:appearance-none"
      />

      <textarea
        value={message}
        onChange={(event) => setMessage(event.target.value)}
        placeholder="Message (optionnel, visible dans l'email et la transaction)"
        rows={2}
        className="border border-dark-green w-full p-1 text-base font-mono focus:outline focus:-outline-offset-2 focus:outline-foreground"
      />

      <button
        type="submit"
        disabled={sending}
        className="bg-foreground text-background border border-foreground font-mono text-xs uppercase p-1 block w-full enabled:cursor-pointer text-center enabled:hover:underline"
      >
        {sending ? "Envoi..." : "Offrir les STKH"}
      </button>

      {feedback && (
        <p
          className={`text-xs font-mono ${feedback.type === "error" ? "text-red-500" : "text-green-600"}`}
        >
          {feedback.text}
        </p>
      )}
    </form>
  );
}
