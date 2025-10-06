'use client';

import RenderComponents from "@/components/render-components";
import { onEntryChange } from "@/contentstack-sdk";
import { getPageRes, metaData } from "@/helper";
import { Page } from "@/typescript/pages";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Skeleton from "react-loading-skeleton";

// Import new attractive components inspired by Goodreads
import BookDiscoveryHero from "@/components/book-discovery-hero";
import FeaturedBooks from "@/components/featured-books";
import GenreCategories from "@/components/genre-categories";
import ReadingQuotes from "@/components/reading-quotes";
import ReadingStats from "@/components/reading-stats";
import RequestNewBook from "@/components/request-new-book";

export default function Home() {
  const entryUrl = usePathname();

  const [getEntry, setEntry] = useState<Page>();

  async function fetchData() {
    try {
      // Use "/home" for the homepage instead of the root URL
      const pageUrl = entryUrl === '/' ? '/home' : entryUrl;
      const entryRes = await getPageRes(pageUrl);
      if (!entryRes) throw new Error('Status code 404');
      setEntry(entryRes);
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    onEntryChange(() => fetchData());
  }, []);

  return (
    <>
      {/* SEO Meta Tags */}
      {getEntry?.seo && getEntry.seo.enable_search_indexing && metaData(getEntry.seo)}
      
      {/* Hero Section - Inspired by Goodreads landing */}
      <BookDiscoveryHero />
      
      {/* Featured Books Section */}
      <FeaturedBooks />
      
      {/* Reading Quote Section */}
      <ReadingQuotes />
      
      {/* Genre Categories - Similar to Goodreads genre browsing */}
      <GenreCategories />
      
      {/* Reading Stats/Benefits */}
      <ReadingStats />
      
      {/* Request New Book Section */}
      <RequestNewBook />
      
      {/* CMS Content (if any) */}
      {getEntry ? (
        <RenderComponents
          pageComponents={getEntry.page_components}
          contentTypeUid='page'
          entryUid={getEntry.uid}
          locale={getEntry.locale}
        />
      ) : (
        <div style={{ display: 'none' }}>
          <Skeleton count={3} height={300} />
        </div>
      )}
    </>
  );
}
