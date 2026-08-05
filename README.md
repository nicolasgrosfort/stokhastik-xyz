# Stokhastik

A space made for prototyping and research.

## Docker

To run the application with Docker, use the following commands:

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
npx prisma migrate reset
npx prisma migrate dev
npx prisma generate
npx prisma studio
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