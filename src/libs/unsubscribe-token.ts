import crypto from "crypto";

function sign(userId: string) {
  return crypto
    .createHmac("sha256", process.env.NEXTAUTH_SECRET ?? "")
    .update(`unsubscribe:${userId}`)
    .digest("hex");
}

export function createUnsubscribeToken(userId: string) {
  return sign(userId);
}

export function verifyUnsubscribeToken(userId: string, token: string) {
  const expected = sign(userId);
  return (
    expected.length === token.length &&
    crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(token))
  );
}
