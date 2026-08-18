import { prisma } from "@/libs/prisma";
import { verifyUnsubscribeToken } from "@/libs/unsubscribe-token";
import { NextRequest, NextResponse } from "next/server";

function renderPage({ title, message }: { title: string; message: string }) {
  return `<!doctype html>
    <html lang="fr">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>${title} — Stokhastik</title>
      </head>
      <body style="margin: 0; padding: 24px 16px; background-color: #ffffff; display: flex; min-height: 100vh; align-items: center; justify-content: center;">
        <div style="font-family: 'SFMono-Regular', Menlo, Consolas, monospace; max-width: 420px; width: 100%; color: #171717; border: 1px solid #171717;">
          <div style="padding: 16px; border-bottom: 1px solid #171717; text-align: center;">
            <span style="font-size: 20px; font-weight: bold; letter-spacing: 0.05em;">STOKHASTIK</span>
          </div>
          <div style="padding: 24px 16px; text-align: center;">
            <p style="margin: 0 0 8px; text-transform: uppercase; font-size: 12px; letter-spacing: 0.05em;">${title}</p>
            <p style="margin: 0;">${message}</p>
          </div>
        </div>
      </body>
    </html>`;
}

function htmlResponse(html: string, status: number) {
  return new NextResponse(html, {
    status,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

export async function GET(request: NextRequest) {
  const uid = request.nextUrl.searchParams.get("uid");
  const token = request.nextUrl.searchParams.get("token");

  if (!uid || !token || !verifyUnsubscribeToken(uid, token)) {
    return htmlResponse(
      renderPage({
        title: "Lien invalide",
        message: "Ce lien de désinscription n'est pas valide.",
      }),
      400,
    );
  }

  try {
    await prisma.user.update({
      where: { id: uid },
      data: { newsletter: false },
    });
  } catch {
    return htmlResponse(
      renderPage({
        title: "Lien invalide",
        message: "Ce lien de désinscription n'est pas valide.",
      }),
      400,
    );
  }

  return htmlResponse(
    renderPage({
      title: "Désinscription confirmée",
      message: "Tu ne recevras plus les notifications de la newsletter Stokhastik.",
    }),
    200,
  );
}
