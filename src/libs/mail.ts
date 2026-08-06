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
    text: `Hey ${firstName},\n\nTon compte Stokhastik vient d'être créé. Merci pour ton soutien et ton intérêt !\n\nAccède à ton compte : ${accountUrl}\n\nÀ bientôt,\nNicolas.`,
    html: `
      <body style="margin: 0; padding: 24px 16px; background-color: #ffffff;">
        <div style="font-family: 'SFMono-Regular', Menlo, Consolas, monospace; max-width: 420px; margin: 0 auto; color: #171717; border: 1px solid #171717;">
          <div style="padding: 16px; border-bottom: 1px solid #171717; text-align: center;">
            <span style="font-size: 20px; font-weight: bold; letter-spacing: 0.05em;">STOKHASTIK</span>
          </div>
          <div style="padding: 24px 16px;">
            <p style="margin: 0 0 16px;">Hey ${firstName},</p>
            <p style="margin: 0 0 24px;">Ton compte Stokhastik vient d'être créé. Merci pour ton soutien et ton intérêt !</p>
            <a href="${accountUrl}" style="display: block; text-align: center; background-color: #171717; color: #ffffff; text-decoration: none; text-transform: uppercase; font-size: 12px; padding: 10px; border: 1px solid #171717;">
              Accéder à mon compte
            </a>
          </div>
          <div style="padding: 16px; border-top: 1px solid #171717; text-align: center; font-size: 12px;">
            À bientôt,<br>Nicolas.
          </div>
        </div>
      </body>
    `,
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

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    bcc: adminBcc,
    subject: "Ta recharge Stokhastik a bien été effectuée",
    text: `Bonjour ${firstName},\n\nTa recharge de ${tokens} tokens (${chf} CHF) a bien été créditée sur ton compte. Merci !\n\nÀ bientôt,\nL'équipe Stokhastik`,
  });
}

export async function sendPurchaseEmail({
  to,
  firstName,
  itemName,
  price,
}: {
  to: string;
  firstName: string;
  itemName: string;
  price: number;
}) {
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    bcc: adminBcc,
    subject: "Ta commande Stokhastik est confirmée",
    text: `Bonjour ${firstName},\n\nTon achat de « ${itemName} » (${price} tokens) a bien été confirmé. Merci !\n\nÀ bientôt,\nL'équipe Stokhastik`,
  });
}
