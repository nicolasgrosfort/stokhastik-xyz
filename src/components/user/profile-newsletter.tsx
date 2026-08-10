"use client";

import { Checkbox } from "@/components/common/checkbox";
import { useState } from "react";

type ProfileNewsletterProps = {
  initialNewsletter: boolean;
};

export function ProfileNewsletter({
  initialNewsletter,
}: ProfileNewsletterProps) {
  const [newsletter, setNewsletter] = useState(initialNewsletter);

  const handleChange = async (checked: boolean) => {
    setNewsletter(checked);

    try {
      await fetch("/api/user/newsletter", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newsletter: checked }),
      });
    } catch {
      setNewsletter(!checked);
    }
  };

  return (
    <Checkbox
      label="Être informé des nouveautés"
      checked={newsletter}
      onChange={handleChange}
    />
  );
}
