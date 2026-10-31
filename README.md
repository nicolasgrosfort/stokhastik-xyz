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

Omikuji machine running locally with [Ollama](https://ollama.com). Ask a question, get an omikuji grounded (RAG) in a folder of markdown files (the fragments).

Models: `embeddinggemma-2` (retrieval), `nimble` (luck rank), `gemma4:31b-mlx` (writing).

### Build the index

Reads every `.md` file of the folder (recursively), first rewrites them in plain text (Obsidian syntax resolved) in `data/fragments/`, then splits those files into passages and stores their embeddings in `data/omikuji/embeddings.json`. Unchanged passages are not embedded again. Run it again whenever the markdown files change.

```bash
yarn fragment:index /absolute/path/to/markdown/folder
```

The path can also be set with `FRAGMENTS_DIR`.

Obsidian syntax is resolved when writing the plain-text files: transclusions (`![[Note]]`, `![[Note#Heading]]`, `![[Note#^block]]`) are replaced by the embedded content (recursively, cycles ignored), notes are found by name anywhere in the folder, `[[Note|alias]]` keeps only its text, and non-markdown embeds and `%%comments%%` are dropped. The note's frontmatter `tags` are kept in the plain-text file and prepended (`Tags : a, b`) to each of its passages, so they are part of the embeddings.

### Draw an omikuji

```bash
yarn omikuji "Should I change jobs this spring?"
```

The source files of the retrieved passages are listed under the omikuji. Each draw is saved as its own markdown file in `data/omikuji/draws/` (`<date>-<question>.md`, with `création`, `fortune`, `fragments` (wikilinks to the source notes) and `question` in the frontmatter).

Use `DEBUG=1` to print the retrieved passages and their scores. `OLLAMA_HOST` overrides the default `http://localhost:11434`.

### Search the fragments

```bash
yarn search "how do we try to rule the world with technology?" [-n 5]
```

Prints the `n` fragments (default 5) closest to the question, best first. Each fragment is scored by its best-matching passage, shown with its tags. No text is generated and nothing is saved.

### List the sources

```bash
yarn source [/absolute/path/to/fragments]
```

Reads the `source` wikilink in the frontmatter of every fragment and writes one file per source (no duplicates) in `data/sources/`. Each file takes the `apa` field of the source note and lists the fragments citing it (`fragments` in the frontmatter and as a list in the body). Sources without `apa` or without a note are reported at the end.

## Tools

- [Convert PNG to AVIF](https://cloudconvert.com/png-to-avif)
- [Optimise GLTF](https://optimizeglb.com/dashboard)
- [Edit PLY](https://superspl.at)