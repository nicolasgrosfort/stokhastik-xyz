"use client";

import { useState } from "react";

type MailDiagnostics = {
  config: Record<string, boolean>;
  adminEmail: string | null;
  verify: { ok: boolean; error: string | null };
  send: { ok: boolean; error: string | null; messageId: string | null } | null;
};

export function MailTest() {
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<MailDiagnostics | null>(null);

  const handleRun = async () => {
    setRunning(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/admin/mail-test", { method: "POST" });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Une erreur s'est produite.");
        return;
      }

      setResult(data as MailDiagnostics);
    } catch {
      setError("Une erreur s'est produite.");
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="flex flex-col gap-2 w-full max-w-md border border-dark-green p-3">
      <span className="text-xs font-mono uppercase">Test email (prod)</span>
      <p className="text-xs font-mono opacity-60">
        Vérifie la connexion SMTP et envoie un email de test à ADMIN_EMAIL, avec
        la même copie cachée que les emails d&apos;achat et de recharge.
      </p>
      <button
        type="button"
        disabled={running}
        onClick={handleRun}
        className="bg-foreground text-background border border-foreground font-mono text-xs uppercase p-1 block w-full enabled:cursor-pointer text-center enabled:hover:underline"
      >
        {running ? "Test en cours..." : "Lancer le test"}
      </button>

      {error && <p className="text-xs font-mono text-red-500">{error}</p>}

      {result && (
        <div className="flex flex-col gap-2 text-xs font-mono">
          <div>
            <span className="uppercase">Variables d&apos;env</span>
            <ul className="mt-1">
              {Object.entries(result.config).map(([key, ok]) => (
                <li key={key} className={ok ? "text-green-600" : "text-red-500"}>
                  {ok ? "✓" : "✗"} {key}
                </li>
              ))}
            </ul>
          </div>

          <p>
            Destinataire / copie :{" "}
            <span className={result.adminEmail ? "" : "text-red-500"}>
              {result.adminEmail ?? "ADMIN_EMAIL non défini"}
            </span>
          </p>

          <p className={result.verify.ok ? "text-green-600" : "text-red-500"}>
            {result.verify.ok ? "✓" : "✗"} Connexion SMTP
            {result.verify.error ? ` — ${result.verify.error}` : ""}
          </p>

          {result.send && (
            <p className={result.send.ok ? "text-green-600" : "text-red-500"}>
              {result.send.ok ? "✓" : "✗"} Envoi
              {result.send.ok
                ? ` — envoyé (${result.send.messageId ?? "sans id"})`
                : ` — ${result.send.error}`}
            </p>
          )}

          {result.verify.ok && result.send?.ok && (
            <p className="text-green-600">
              Tout fonctionne côté serveur. Si l&apos;email n&apos;arrive pas,
              regarde les spams / la réputation du domaine expéditeur.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
