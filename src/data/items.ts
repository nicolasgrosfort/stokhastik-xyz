import { Item } from "@/components/Item";

export const items: Item[] = [
  {
    id: "1",
    name: "Chocolate",
    model: "/models/chocolat.glb",
    thumbnail: "/thumbnails/chocolate.png",
    price: 10,
    position: 1.5,
    rotation: -Math.PI * 0.25,
    status: "available",
    description:
      "A rock is a naturally occurring solid aggregate of minerals or mineraloid matter.",
  },
  {
    id: "2",
    name: "Coffee",
    model: "/models/coffee.glb",
    thumbnail: "/thumbnails/coffee.png",
    price: 10,
    position: 1,
    rotation: -Math.PI * 0.25,
    status: "available",
    description:
      "A rock is a naturally occurring solid aggregate of minerals or mineraloid matter.",
  },
  {
    id: "3",
    name: "Candy",
    model: "/models/candy.glb",
    thumbnail: "/thumbnails/candy.png",
    price: 20,
    position: 1.4,
    rotation: -Math.PI * 0.25,
    status: "available",
    description:
      "A rock is a naturally occurring solid aggregate of minerals or mineraloid matter.",
  },
];
