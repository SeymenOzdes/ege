import { Homepage, HomepageState } from "@/components/site/homepage";
import { getHomepageContent } from "@/lib/homepage-content";

export default async function Home() {
  const content = await getHomepageContent();

  if (content.loadError) return <HomepageState state="error" />;

  return <Homepage content={content} />;
}
