import { UserForm } from "@/components/admin/user-form";
import { H3 } from "@/components/common/h3";
import { authOptions } from "@/libs/auth";
import { prisma } from "@/libs/prisma";
import { getServerSession } from "next-auth/next";
import { notFound } from "next/navigation";

export default async function EditUserPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [session, user] = await Promise.all([
    getServerSession(authOptions),
    prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        newsletter: true,
      },
    }),
  ]);

  if (!user) {
    notFound();
  }

  return (
    <section className="text-foreground bg-background h-full w-full min-h-0 flex flex-col items-center gap-4 p-4 overflow-y-auto">
      <H3 className="uppercase">Modifier l&apos;utilisateur</H3>
      <UserForm user={user} isSelf={session?.user.id === user.id} />
    </section>
  );
}
