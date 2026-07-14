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
  status: "available",
};

export const Item = ({ item }: { item: Item }) => {
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

export const BuyButton = () => {
  const handleBuy = async () => {
    const contactApi =
      process.env.NODE_ENV === "production" ? "/api/buy.php" : "/api/buy";
    const res = await fetch(contactApi, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: "100",
        firstname: "Nicolas",
        lastname: "Grosfort",
        email: "grosfort.nicols@gmail.com",
        message: "Hello, I would like to buy this item.",
        honeypot: "",
      }),
    });

    const data = await res.json();
    if (!data.success) throw new Error(data.error);

    console.log("Message sent successfully");
  };

  return <button onClick={handleBuy}>Buy</button>;
};

export const StatusButton = () => {
  const handleStatus = async () => {
    const contactApi =
      process.env.NODE_ENV === "production" ? "/api/status.php" : "/api/status";
    const res = await fetch(contactApi, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    const data = await res.json();
    if (!data.success) throw new Error(data.error);

    console.log("Status fetched successfully", data);
  };

  return <button onClick={handleStatus}>Check Status</button>;
};
