import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/client";
import type { ProfileLink } from "@/lib/profile/schemas";
import EditProfileForm from "./EditProfileForm";

export const metadata: Metadata = {
  title: "Edit profile",
  description: "Update your profile details, links, and cover image.",
};

export default async function EditProfilePage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      username: true,
      email: true,
      image: true,
      bio: true,
      coverImage: true,
      links: true,
    },
  });

  if (!user) {
    redirect("/login");
  }

  const links = (user.links as ProfileLink[] | null) ?? [];

  return (
    <EditProfileForm
      initial={{
        name: user.name ?? "",
        username: user.username ?? "",
        bio: user.bio ?? "",
        image: user.image ?? "",
        coverImage: user.coverImage ?? "",
        links,
      }}
      email={user.email}
    />
  );
}