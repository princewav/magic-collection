"use client";

import { generatePagination } from "@/app/lib/utils";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";

interface Props {
  totalPages: number;
  currentPage: number;
}

export default function Pagination({ totalPages, currentPage }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Create query string
  const createQueryString = (name: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set(name, value);
    return params.toString();
  };

  const pageNumbers = generatePagination(currentPage, totalPages);

  return (
    <div className="flex justify-end items-center space-x-2 my-4">
      <Button
        variant="outline"
        disabled={currentPage === 1}
        onClick={() => {
          router.push(pathname + "?" + createQueryString("page", String(currentPage - 1)));
        }}
      >
        Previous
      </Button>

      <div className="flex items-center space-x-1">
        {pageNumbers.map((page) => {
          if (page === "...") {
            return (
              <span className="px-4 py-2" key={page}>
                ...
              </span>
            );
          }

          return (
            <Button
              variant={currentPage === page ? "default" : "outline"}
              key={page}
              onClick={() => {
                router.push(pathname + "?" + createQueryString("page", String(page)));
              }}
            >
              {page}
            </Button>
          );
        })}
      </div>

      <Button
        variant="outline"
        // disabled={currentPage === totalPages}
        onClick={() => {
          router.push(pathname + "?" + createQueryString("page", String(currentPage + 1)));
        }}
      >
        Next
      </Button>
    </div>
  );
}
