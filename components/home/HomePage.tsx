import prisma from "@/lib/prisma";

import HeroSection from "./HeroSection";
import PostsSection from "./PostsSection";
import PhilosophyCarousel from "./PhilosophyCarousel";

type HomePageProps = {
  searchParams: Promise<{
    page?: string;
  }>;
};

const POSTS_PER_PAGE = 12;

export default async function HomePage({
  searchParams,
}: HomePageProps) {
  const { page } = await searchParams;

  const parsedPage = Number(page);
  const requestedPage =
    Number.isFinite(parsedPage) && parsedPage > 0
      ? Math.floor(parsedPage)
      : 1;

  // Tổng số bài viết
  const totalPosts = await prisma.post.count();

  // Tính số trang
  const totalPages = Math.ceil(totalPosts / POSTS_PER_PAGE);

  // Không cho phép trang vượt quá giới hạn
  const currentPage = Math.min(
    requestedPage,
    Math.max(totalPages, 1)
  );

  // Lấy bài viết theo trang
  const posts = await prisma.post.findMany({
    skip: (currentPage - 1) * POSTS_PER_PAGE,
    take: POSTS_PER_PAGE,
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      slug: true,
      title: true,
      coverImage: true,
      category: true,
      excerpt: true,
      createdAt: true,
    },
  });

  return (
    <>
      {currentPage === 1 && <HeroSection />}
      {currentPage === 1 && <PhilosophyCarousel />}

      <PostsSection
        posts={posts}
        totalPosts={totalPosts}
        currentPage={currentPage}
        totalPages={totalPages}
      />
    </>
  );
}