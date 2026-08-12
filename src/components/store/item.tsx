"use client";

import { Badge } from "@/components/common/badge";
import { FormatedDate } from "@/components/common/formated-date";
import { Price } from "@/components/common/price";
import { GetStoreItem } from "@/libs/store-item";
import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export const Item = ({ item }: { item: GetStoreItem }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [canHover, setCanHover] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setCanHover(window.matchMedia("(hover: hover)").matches);
  }, []);

  return (
    <article
      className="flex flex-col items-center justify-center w-full h-full relative hover:bg-foreground/10 cursor-pointer overflow-hidden"
      onMouseEnter={() => canHover && setIsHovered(true)}
      onMouseLeave={() => canHover && setIsHovered(false)}
      onClick={() => router.push(`/store/${item.slug}`)}
    >
      <header className="w-full h-6 flex items-center justify-between absolute top-2 px-2">
        <p className="font-mono text-sm uppercase text-ellipsis overflow-hidden whitespace-nowrap">
          {item.name}
        </p>
      </header>
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
          sizes="(max-width: 639px) 50vw, (max-width: 1279px) 25vw, 12.5vw"
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
                href={`/store/${item.slug}`}
                className="bg-background text-foreground border border-foreground font-mono text-xs uppercase p-1 block w-full cursor-pointer text-center"
              >
                Fait voir !
              </Link>
            </motion.div>
          ) : (
            <>
              <FormatedDate date={item.releaseDate} />
              {item.buyerId === null ? (
                <Price price={item.price} highlighted />
              ) : (
                <Badge>Vendu !</Badge>
              )}
            </>
          )}
        </AnimatePresence>
      </footer>
    </article>
  );
};
