import nodemailer from "nodemailer";

const adminBcc = process.env.ADMIN_EMAIL || undefined;
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD,
  },
});

function renderEmailHtml({
  body,
  ctaLabel,
  ctaUrl,
}: {
  body: string;
  ctaLabel: string;
  ctaUrl: string;
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
  const accountUrl = `${process.env.SITE_URL}/auth/profile`;

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
  const accountUrl = `${process.env.SITE_URL}/auth/profile`;

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
