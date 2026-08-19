import { Homepage } from "@/components/site/homepage";
import { getHomepageContent } from "@/lib/homepage";

export default async function Home() {
  const content = await getHomepageContent();

  return <Homepage content={content} />;
}
