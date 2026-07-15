"use client";

import { Badge } from "@/components/badge";
import { Price } from "@/components/price";
import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export type Status = "available" | "sold";

export type Item = {
  id: string;
  name: string;
  model: string;
  thumbnail: string;
  position: number;
  rotation: number;
  price: number;
  description?: string;
};

export type ItemWithStatus = Item & {
  status: Status;
};

export const BLANK_ITEM: Item = {
  id: "",
  name: "",
  model: "",
  thumbnail: "",
  price: 0,
  position: 0,
  rotation: 0,
  description: "",
};

export const Item = ({ item }: { item: ItemWithStatus }) => {
  const [isHovered, setIsHovered] = useState(false);
  const router = useRouter();

  return (
    <article
      className="flex flex-col items-center justify-center w-full h-full relative hover:bg-foreground/10 cursor-pointer overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => router.push(`/store/${item.id}`)}
    >
      <motion.section
        className="w-full h-full relative"
        whileHover={{ scale: 1.1 }}
      >
        <Image
          src={item.thumbnail}
          alt={item.name}
          fill
          draggable={false}
          className="object-cover"
        />
      </motion.section>

      <footer className="w-full h-6 flex items-center justify-between absolute bottom-2 px-2">
        <AnimatePresence>
          {isHovered ? (
            <motion.div
              key="toggle-wanted"
              className="w-full"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
            >
              <Link
                href={`/store/${item.id}`}
                className="bg-background text-foreground border border-foreground font-mono text-xs uppercase p-1 block w-full cursor-pointer text-center hover:bg-foreground hover:text-background"
              >
                Let me see
              </Link>
            </motion.div>
          ) : (
            <>
              <p className="font-mono text-xs uppercase">{item.name}</p>
              {item.status === "available" ? (
                <Price price={item.price} />
              ) : (
                <Badge status={item.status} />
              )}
            </>
          )}
        </AnimatePresence>
      </footer>
    </article>
  );
};
