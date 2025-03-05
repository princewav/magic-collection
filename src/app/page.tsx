import CardGrid from "./components/CardGrid";
import { getPageNumber } from "./lib/utils";
import { Metadata } from "next";
import Navbar from "@/app/components/Navbar";
import Filters from "@/app/components/Filters";
import CardModal from "@/app/components/CardModal";
import { CardModalProvider } from "@/app/contexts/CardModalContext";

export const metadata: Metadata = {
  title: "My Awesome Cards",
};

const Page = (props: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) => {
  const searchParams = props.searchParams || {};
  const currentPage = getPageNumber(searchParams);

  return (
    <div className="text-white min-h-screen p-4">
      <Navbar />
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
