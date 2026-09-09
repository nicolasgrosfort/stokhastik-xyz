import { createUnsubscribeToken } from "@/libs/unsubscribe-token";
import nodemailer from "nodemailer";

const adminBcc = process.env.ADMIN_EMAIL || undefined;
const emailPort = Number(process.env.EMAIL_PORT);
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: emailPort,
  secure: emailPort === 465,
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD,
  },
});

type MailDiagnostics = {
  config: {
    EMAIL_HOST: boolean;
    EMAIL_PORT: boolean;
    EMAIL_USERNAME: boolean;
    EMAIL_PASSWORD: boolean;
    EMAIL_FROM: boolean;
    ADMIN_EMAIL: boolean;
    SITE_URL: boolean;
  };
  adminEmail: string | null;
  verify: { ok: boolean; error: string | null };
  send: { ok: boolean; error: string | null; messageId: string | null } | null;
};

/**
 * Vérifie la connexion SMTP et envoie un email de test à ADMIN_EMAIL
 * (avec la même adresse en copie cachée que les emails transactionnels).
 * Renvoie un diagnostic complet plutôt que de lever une exception.
 */
export async function runMailDiagnostics(): Promise<MailDiagnostics> {
  const result: MailDiagnostics = {
    config: {
      EMAIL_HOST: Boolean(process.env.EMAIL_HOST),
      EMAIL_PORT: Boolean(process.env.EMAIL_PORT),
      EMAIL_USERNAME: Boolean(process.env.EMAIL_USERNAME),
      EMAIL_PASSWORD: Boolean(process.env.EMAIL_PASSWORD),
      EMAIL_FROM: Boolean(process.env.EMAIL_FROM),
      ADMIN_EMAIL: Boolean(process.env.ADMIN_EMAIL),
      SITE_URL: Boolean(process.env.SITE_URL),
    },
    adminEmail: adminBcc ?? null,
    verify: { ok: false, error: null },
    send: null,
  };

  try {
    await transporter.verify();
    result.verify.ok = true;
  } catch (error) {
    result.verify.error = error instanceof Error ? error.message : String(error);
    return result;
  }

  const to = process.env.ADMIN_EMAIL || process.env.EMAIL_FROM;

  if (!to) {
    result.send = {
      ok: false,
      error: "Aucune adresse de destination (ADMIN_EMAIL / EMAIL_FROM absents).",
      messageId: null,
    };
    return result;
  }

  const now = new Date().toISOString();

  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      bcc: adminBcc,
      subject: `Test email Stokhastik — ${now}`,
      text: `Ceci est un email de test envoyé depuis l'admin Stokhastik.\n\nDate : ${now}\nCopie cachée (bcc) : ${adminBcc ?? "aucune"}\n\nSi tu reçois ce message, l'envoi et la copie fonctionnent.`,
      html: renderEmailHtml({
        body: `
          <p style="margin: 0 0 16px;">Ceci est un email de test envoyé depuis l'admin Stokhastik.</p>
          <p style="margin: 0 0 8px;">Date : ${now}</p>
          <p style="margin: 0 0 24px;">Copie cachée (bcc) : ${adminBcc ?? "aucune"}</p>
        `,
        ctaLabel: "Ouvrir Stokhastik",
        ctaUrl: process.env.SITE_URL ?? "https://stokhastik.xyz",
      }),
    });

    result.send = {
      ok: true,
      error: null,
      messageId: info.messageId ?? null,
    };
  } catch (error) {
    result.send = {
      ok: false,
      error: error instanceof Error ? error.message : String(error),
      messageId: null,
    };
  }

  return result;
}

function renderEmailHtml({
  body,
  ctaLabel,
  ctaUrl,
  footerNote,
}: {
  body: string;
  ctaLabel: string;
  ctaUrl: string;
  footerNote?: string;
}) {
  return `
    <body style="margin: 0; padding: 24px 16px; background-color: #ffffff;">
      <div style="font-family: 'SFMono-Regular', Menlo, Consolas, monospace; max-width: 420px; margin: 0 auto; color: #171717; border: 1px solid #171717;">
        <div style="padding: 16px; border-bottom: 1px solid #171717; text-align: center;">
          <span style="font-size: 20px; font-weight: bold; letter-spacing: 0.05em;">STOKHASTIK</span>
        </div>
        <div style="padding: 24px 16px;">
          ${body}
          <a href="${ctaUrl}" style="display: block; text-align: center; background-color: #171717; color: #ffffff; text-decoration: none; text-transform: uppercase; font-size: 12px; padding: 10px; border: 1px solid #171717;">
            ${ctaLabel}
          </a>
        </div>
        <div style="padding: 16px; border-top: 1px solid #171717; text-align: center; font-size: 12px;">
          À bientôt,<br>Nicolas.
          ${footerNote ? `<div style="margin-top: 12px; color: #737373;">${footerNote}</div>` : ""}
        </div>
      </div>
    </body>
  `;
}

export async function sendWelcomeEmail({
  to,
  firstName,
}: {
  to: string;
  firstName: string;
}) {
  const accountUrl = `${process.env.SITE_URL}/user/profile`;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    bcc: adminBcc,
    subject: "Bienvenue sur Stokhastik",
    text: `Salut ${firstName},\n\nTon compte Stokhastik vient d'être créé. Merci pour ton soutien et ton intérêt !\n\nAccède à ton compte : ${accountUrl}\n\nÀ bientôt,\nNicolas.`,
    html: renderEmailHtml({
      body: `
        <p style="margin: 0 0 16px;">Salut ${firstName},</p>
        <p style="margin: 0 0 24px;">Ton compte Stokhastik vient d'être créé. Merci pour ton soutien et ton intérêt !</p>
      `,
      ctaLabel: "Accéder à mon compte",
      ctaUrl: accountUrl,
    }),
  });
}

export async function sendVerificationEmail({
  to,
  firstName,
  token,
}: {
  to: string;
  firstName: string;
  token: string;
}) {
  const verifyUrl = `${process.env.SITE_URL}/api/auth/verify-email?token=${token}`;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject: "Confirme ton adresse email — Stokhastik",
    text: `Salut ${firstName},\n\nConfirme ton adresse email pour activer ton compte Stokhastik (lien valable 24h) :\n\n${verifyUrl}\n\nSi tu n'es pas à l'origine de cette demande, ignore cet email.\n\nÀ bientôt,\nNicolas.`,
    html: renderEmailHtml({
      body: `
        <p style="margin: 0 0 16px;">Salut ${firstName},</p>
        <p style="margin: 0 0 24px;">Confirme ton adresse email pour activer ton compte Stokhastik. Ce lien est valable 24h. Si tu n'es pas à l'origine de cette demande, ignore cet email.</p>
      `,
      ctaLabel: "Confirmer mon email",
      ctaUrl: verifyUrl,
    }),
  });
}

export async function sendRechargeEmail({
  to,
  firstName,
  tokens,
  amount,
}: {
  to: string;
  firstName: string;
  tokens: number;
  amount: number;
}) {
  const chf = (amount / 100).toFixed(2);
  const accountUrl = `${process.env.SITE_URL}/user/profile`;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    bcc: adminBcc,
    subject: "Ton compte Stokhastik a bien été crédité !",
    text: `Salut ${firstName},\n\nTa recharge de ${tokens} STKH (${chf} CHF) a bien été créditée sur ton compte. Merci !\n\nAccède à ton compte : ${accountUrl}\n\nÀ bientôt,\nNicolas.`,
    html: renderEmailHtml({
      body: `
        <p style="margin: 0 0 16px;">Salut ${firstName},</p>
        <p style="margin: 0 0 24px;">Ta recharge de ${tokens} STKH (${chf} CHF) a bien été créditée sur ton compte. Merci !</p>
      `,
      ctaLabel: "Voir mon compte",
      ctaUrl: accountUrl,
    }),
  });
}

export async function sendStoreItemNotificationEmail({
  to,
  userId,
  firstName,
  itemName,
  itemSlug,
  itemImage,
  price,
  isNew,
}: {
  to: string;
  userId: string;
  firstName: string;
  itemName: string;
  itemSlug: string;
  itemImage: string;
  price: number;
  isNew: boolean;
}) {
  const itemUrl = `${process.env.SITE_URL}/store/${itemSlug}`;
  const itemImageUrl = `${process.env.SITE_URL}${itemImage}`;
  const unsubscribeUrl = `${process.env.SITE_URL}/api/user/unsubscribe?uid=${userId}&token=${createUnsubscribeToken(userId)}`;

  const subject = isNew
    ? "Nouvel item disponible sur Stokhastik"
    : `« ${itemName} » a été mis à jour`;

  const introText = isNew
    ? `Un nouvel item, « ${itemName} » (${price} STKH), est maintenant disponible dans le store !`
    : `L'item « ${itemName} » (${price} STKH) vient d'être mis à jour dans le store.`;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject,
    text: `Salut ${firstName},\n\n${introText}\n\nVoir l'article : ${itemUrl}\n\nÀ bientôt,\nNicolas.\n\nSe désinscrire de la newsletter : ${unsubscribeUrl}`,
    html: renderEmailHtml({
      body: `
        <p style="margin: 0 0 16px;">Salut ${firstName},</p>
        <img src="${itemImageUrl}" alt="${itemName}" width="388" style="display: block; width: 100%; max-width: 388px; margin: 0 0 16px;">
        <p style="margin: 0 0 24px;">${introText}</p>
      `,
      ctaLabel: "Voir l'article",
      ctaUrl: itemUrl,
      footerNote: `<a href="${unsubscribeUrl}" style="color: #737373;">Se désinscrire de la newsletter</a>`,
    }),
  });
}

export async function sendPurchaseEmail({
  to,
  firstName,
  itemName,
  itemSlug,
  itemImage,
  price,
}: {
  to: string;
  firstName: string;
  itemName: string;
  itemSlug: string;
  itemImage: string;
  price: number;
}) {
  const itemUrl = `${process.env.SITE_URL}/store/${itemSlug}`;
  const itemImageUrl = `${process.env.SITE_URL}${itemImage}`;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    bcc: adminBcc,
    subject: "Ta commande Stokhastik est confirmée",
    text: `Salut ${firstName},\n\nTon achat de « ${itemName} » (${price} STKH) est confirmé. Merci !\n\nVoir l'article : ${itemUrl}\n\nÀ bientôt,\nNicolas.`,
    html: renderEmailHtml({
      body: `
        <p style="margin: 0 0 16px;">Salut ${firstName},</p>
        <img src="${itemImageUrl}" alt="${itemName}" width="388" style="display: block; width: 100%; max-width: 388px; margin: 0 0 16px;m">
        <p style="margin: 0 0 24px;">Ton achat de « ${itemName} » (${price} STKH) est confirmé. Merci !</p>
      `,
      ctaLabel: "Voir l'article",
      ctaUrl: itemUrl,
    }),
  });
}
