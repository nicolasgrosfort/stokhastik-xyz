import { SignOutButton } from "@/components/auth/signout-button";
import { H1 } from "@/components/h1";
import { authOptions } from "@/libs/auth";
import { prisma } from "@/libs/prisma";
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/signin?callbackUrl=/profile");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user) {
    redirect("/auth/signin?callbackUrl=/profile");
  }

  return (
    <section className="flex flex-col items-center justify-center gap-4 h-full p-4 bg-background">
      <H1>Mon profil</H1>

      <div className="flex flex-col gap-4 sm:max-w-104 w-full font-mono text-sm">
        <div>
          <p className="text-xs uppercase font-bold">Prénom</p>
          <p>{user.firstName}</p>
        </div>

        <div>
          <p className="text-xs uppercase font-bold">Nom</p>
          <p>{user.lastName}</p>
        </div>

        <div>
          <p className="text-xs uppercase font-bold">Email</p>
          <p>{user.email}</p>
        </div>

        <SignOutButton />
      </div>
    </section>
  );
}
