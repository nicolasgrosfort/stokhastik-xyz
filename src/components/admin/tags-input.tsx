"use client";

import { Badge } from "@/components/common/badge";
import { TextField } from "@/components/common/text-field";
import { useState } from "react";

const normalize = (tag: string) => tag.trim().toLowerCase();

export function TagsInput({
  name,
  label,
  value,
  suggestions,
  onChange,
}: {
  name: string;
  label: string;
  value: string[];
  suggestions: string[];
  onChange: (tags: string[]) => void;
}) {
  const [draft, setDraft] = useState("");

  const add = (raw: string) => {
    const tag = normalize(raw);
    if (tag && !value.includes(tag)) onChange([...value, tag]);
    setDraft("");
  };

  const remove = (tag: string) => onChange(value.filter((t) => t !== tag));

  const matching = suggestions
    .filter((tag) => !value.includes(tag) && tag.includes(normalize(draft)))
    .slice(0, 8);

  return (
    <div className="flex flex-col gap-2 w-full">
      <TextField
        name={name}
        label={label}
        description="Entrée ou virgule pour ajouter un tag."
        value={draft}
        onChange={(next) => {
          if (next.includes(",")) {
            next.split(",").forEach((part, i, parts) => {
              if (i < parts.length - 1) add(part);
              else setDraft(part);
            });
          } else {
            setDraft(next);
          }
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            add(draft);
          } else if (event.key === "Backspace" && !draft && value.length > 0) {
            remove(value[value.length - 1]);
          }
        }}
      />

      {value.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {value.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => remove(tag)}
              aria-label={`Retirer le tag ${tag}`}
              className="cursor-pointer hover:line-through"
            >
              <Badge>{tag} ×</Badge>
            </button>
          ))}
        </div>
      )}

      {matching.length > 0 && (
        <div className="flex flex-wrap gap-1 items-center">
          <span className="text-[0.6rem] uppercase opacity-60">Existants :</span>
          {matching.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => add(tag)}
              className="cursor-pointer opacity-60 hover:opacity-100"
            >
              <Badge>+ {tag}</Badge>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
