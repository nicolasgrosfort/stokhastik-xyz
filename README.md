# Stokhastik

A space made for prototyping and research.

## Update the dependencies.

Automatically with Claude Code:

```base
    claude
```
Then run `/upgrade-deps` command

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
npx prisma migrate deploy
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

## Omikuji

Omikuji machine running locally with [Ollama](https://ollama.com). Ask a question, get an omikuji grounded (RAG) in a folder of markdown files.

Models: `embeddinggemma-2` (retrieval), `nimble` (luck rank), `gemma4:31b-mlx` (writing).

### Build the index

Reads every `.md` file of the folder (recursively), splits it into passages and stores their embeddings in `data/omikuji/embeddings.json`. Unchanged passages are not embedded again. Run it again whenever the markdown files change.

```bash
yarn omikuji:index /absolute/path/to/markdown/folder
```

The path can also be set with `OMIKUJI_CORPUS`.

Obsidian syntax is resolved before splitting: transclusions (`![[Note]]`, `![[Note#Heading]]`, `![[Note#^block]]`) are replaced by the embedded content (recursively, cycles ignored), notes are found by name anywhere in the folder, `[[Note|alias]]` keeps only its text, and non-markdown embeds and `%%comments%%` are dropped.

### Draw an omikuji

```bash
yarn omikuji "Should I change jobs this spring?"
```

Each draw is saved as its own markdown file in `data/omikuji/draws/` (`<date>-<question>.md`, with the question, fortune and sources in the frontmatter).

Use `DEBUG=1` to print the retrieved passages and their scores. `OLLAMA_HOST` overrides the default `http://localhost:11434`.

## Tools

- [Convert PNG to AVIF](https://cloudconvert.com/png-to-avif)
- [Optimise GLTF](https://optimizeglb.com/dashboard)
- [Edit PLY](https://superspl.at)