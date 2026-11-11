import HomePage from "@/components/home/HomePage";

type PageProps = {
  searchParams: Promise<{
    page?: string;
  }>;
};

export default function Page({ searchParams }: PageProps) {
  return <HomePage searchParams={searchParams} />;
}