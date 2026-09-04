// lib/resolve-craft-links.ts
export function resolveCraftLinks(markdown: string): string {
  return (
    markdown
      // lien vers un autre bloc/article -> route interne /blog/[id]
      .replace(/\]\(block:\/\/([a-zA-Z0-9-]+)\)/g, "](/blog/$1)")
      // lien vers une daily note -> adapte la route si tu en as une
      .replace(/\]\(date:\/\/([\d-]+)\)/g, "](/journal/$1)")
      // lien hors scope : on neutralise plutôt que de laisser un lien mort
      .replace(/\]\(invalid:out_of_scope\)/g, "](#)")
  );
}
