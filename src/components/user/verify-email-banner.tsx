"use client";

import { useState } from "react";

export function VerifyEmailBanner() {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle",
  );

  const handleResend = async () => {
    setStatus("sending");

    try {
      const res = await fetch("/api/auth/resend-verification", {
        method: "POST",
      });

      setStatus(res.ok ? "sent" : "error");
    } catch {
      setStatus("error");
    }
  };

  return (
    <p className="text-xs font-mono text-center p-2 bg-foreground text-background">
      Confirme ton adresse email pour sécuriser ton compte (vérifie ta boîte
      mail).{" "}
      {status === "sent" ? (
        "Email renvoyé !"
      ) : (
        <button
          type="button"
          onClick={handleResend}
          disabled={status === "sending"}
          className="underline enabled:cursor-pointer"
        >
          {status === "sending" ? "Envoi..." : "Renvoyer un email de vérification"}
        </button>
      )}
      {status === "error" && (
        <span className="block text-red-400">
          Un erreur s&apos;est produite, réessaie plus tard.
        </span>
      )}
    </p>
  );
}
