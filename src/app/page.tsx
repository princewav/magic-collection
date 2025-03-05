import CardGrid from "@/components/CardGrid";
import { getPageNumber } from "@/lib/utils";
import { Metadata } from "next";
import Filters from "@/components/Filters";
import CardModal from "@/components/CardModal";
import { CardModalProvider } from "@/contexts/CardModalContext";

export const metadata: Metadata = {
  title: "My Awesome Cards",
};

const Page = (props: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) => {
  const searchParams = props.searchParams || {};
  const currentPage = getPageNumber(searchParams);

  return (
    <div className="min-h-screen px-4 pt-2 pb-4">
      <Filters />
      <CardModalProvider>
        <main className="antialiased">
          <CardGrid currentPage={currentPage} />
        </main>
        <CardModal />
      </CardModalProvider>
    </div>
  );
};

export default Page;
