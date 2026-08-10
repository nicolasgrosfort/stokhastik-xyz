import { slugify } from "@/libs/utils";
import { Prisma } from "@prisma/client";

export type StoreItemInput = {
  name: string;
  slug: string;
  description: string | null;
  model: string;
  thumbnail: string;
  price: number;
  position: number;
  rotation: number;
  releaseDate: Date;
};

export function parseStoreItemInput(
  body: unknown,
): { data: StoreItemInput } | { error: string } {
  if (
    typeof body !== "object" ||
    body === null ||
    !("name" in body) ||
    !("slug" in body) ||
    !("model" in body) ||
    !("thumbnail" in body) ||
    !("price" in body) ||
    !("position" in body) ||
    !("rotation" in body) ||
    !("releaseDate" in body) ||
    typeof body.name !== "string" ||
    typeof body.slug !== "string" ||
    typeof body.model !== "string" ||
    typeof body.thumbnail !== "string" ||
    typeof body.price !== "number" ||
    typeof body.position !== "number" ||
    typeof body.rotation !== "number" ||
    typeof body.releaseDate !== "string" ||
    !body.name.trim() ||
    !body.slug.trim() ||
    !body.model.trim() ||
    !body.thumbnail.trim() ||
    !Number.isFinite(body.price) ||
    body.price <= 0 ||
    !Number.isFinite(body.position) ||
    !Number.isFinite(body.rotation)
  ) {
    return { error: "Merci de remplir correctement tous les champs requis." };
  }

  const {
    name,
    slug,
    model,
    thumbnail,
    price,
    position,
    rotation,
    releaseDate,
  } = body;

  const description =
    "description" in body &&
    typeof body.description === "string" &&
    body.description.trim()
      ? body.description
      : null;

  const parsedReleaseDate = new Date(releaseDate);

  if (Number.isNaN(parsedReleaseDate.getTime())) {
    return { error: "Date de sortie invalide." };
  }

  if (slugify(slug) !== slug) {
    return {
      error:
        "Le slug ne doit contenir que des lettres minuscules, chiffres et tirets.",
    };
  }

  return {
    data: {
      name,
      slug,
      description,
      model,
      thumbnail,
      price,
      position,
      rotation,
      releaseDate: parsedReleaseDate,
    },
  };
}

export const getStoreItemArgs = {
  orderBy: [{ releaseDate: "desc" }],

  include: {
    buyer: {
      select: {
        firstName: true,
      },
    },
  },
} satisfies Prisma.StoreItemFindManyArgs;

export type GetStoreItem = Prisma.StoreItemGetPayload<typeof getStoreItemArgs>;
