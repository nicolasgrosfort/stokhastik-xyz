import { NextRequest, NextResponse } from "next/server";

const STRIPE_SCRIPT_SRC = "https://js.stripe.com";
const STRIPE_CONNECT_SRC = "https://api.stripe.com https://m.stripe.network";
const STRIPE_FRAME_SRC = "https://js.stripe.com https://hooks.stripe.com";

export function proxy(request: NextRequest) {
  const isProd = process.env.NODE_ENV === "production";
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");

  const csp = [
    `default-src 'self'`,
    isProd
      ? `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' https:`
      : `script-src 'self' 'unsafe-eval' 'unsafe-inline' ${STRIPE_SCRIPT_SRC}`,
    `style-src 'self' 'unsafe-inline'`,
    `img-src 'self' data: blob:`,
    `font-src 'self' data:`,
    `connect-src 'self' blob: ${STRIPE_CONNECT_SRC}${isProd ? "" : " ws://localhost:*"}`,
    `worker-src 'self' blob:`,
    `frame-src ${STRIPE_FRAME_SRC}`,
    `frame-ancestors 'none'`,
    `base-uri 'self'`,
    `form-action 'self'`,
    `object-src 'none'`,
    ...(isProd ? [`upgrade-insecure-requests`] : []),
  ].join("; ");

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);

  const response = NextResponse.next({ request: { headers: requestHeaders } });

  response.headers.set("Content-Security-Policy", csp);
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()",
  );
  if (isProd) {
    response.headers.set(
      "Strict-Transport-Security",
      "max-age=63072000; includeSubDomains; preload",
    );
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
