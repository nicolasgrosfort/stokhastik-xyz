# Stokhastik

A space made for prototyping and research.

## Docker

Run the application with Docker.

```bash
docker-compose up -d
```

## Auth

Setup NEXT_AUTH_SECRET in .env file.

```bash
npx auth secret
```

## Prisma

```bash
npx prisma migrate dev
npx prisma generate
npx prisma migrate reset
```

## Stripe

Stripe is used for payment processing. The following commands are useful for testing the Stripe integration in development.

### Listen webhook

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

### Simulate payment intent

```bash
stripe trigger payment_intent.succeeded
```

### Create payment intent

```bash
curl -X POST http://localhost:3000/api/stripe/create-payment-intent \
  -H "Content-Type: application/json" \
  -d '{"packId": "small"}'
```

## Tools

- [Convert PNG to AVIF](https://cloudconvert.com/png-to-avif)
- [Optimise GLTF](https://optimizeglb.com/dashboard)