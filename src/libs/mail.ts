import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const adminBcc = process.env.ADMIN_EMAIL || undefined;

export async function sendWelcomeEmail({
  to,
  firstName,
}: {
  to: string;
  firstName: string;
}) {
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    bcc: adminBcc,
    subject: "Bienvenue sur Stokhastik",
    text: `Bonjour ${firstName},\n\nTon compte Stokhastik vient d'être créé. Merci !\n\nÀ bientôt,\nL'équipe Stokhastik`,
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
