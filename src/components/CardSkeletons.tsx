import { Skeleton } from '@/components/ui/skeleton';

export function CardGridSkeleton() {
  return (
    <div className="flex flex-wrap justify-center gap-4">
      {Array.from({ length: 12 }).map((_, index) => (
        <div key={index} className="w-72 sm:w-[min(100%,275px)]">
          <Skeleton className="h-[330px] w-full rounded-lg" />
        </div>
      ))}
    </div>
  );
}

export function CardListSkeleton() {
  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full table-auto border-collapse">
        <thead>
          <tr className="border-b">
            <th className="p-2 text-left align-middle">
              <Skeleton className="h-6 w-32" />
            </th>
            <th className="hidden p-2 text-left align-middle lg:table-cell">
              <Skeleton className="h-6 w-20" />
            </th>
            <th className="hidden p-2 text-left align-middle lg:table-cell">
              <Skeleton className="h-6 w-24" />
            </th>
            <th className="p-2 text-left align-middle">
              <Skeleton className="h-6 w-28" />
            </th>
            <th className="p-2 text-left align-middle">
              <Skeleton className="h-6 w-16" />
            </th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 15 }).map((_, index) => (
            <tr key={index} className="border-b">
              <td className="flex items-center gap-2 p-2 align-middle">
                <Skeleton className="h-8 w-8 rounded-md" />
                <Skeleton className="h-6 w-36" />
              </td>
              <td className="hidden p-2 align-middle lg:table-cell">
                <Skeleton className="h-4 w-24" />
              </td>
              <td className="hidden p-2 align-middle lg:table-cell">
                <Skeleton className="h-4 w-32" />
              </td>
              <td className="p-2 align-middle">
                <Skeleton className="h-4 w-16" />
              </td>
              <td className="p-2 align-middle">
                <Skeleton className="h-4 w-12" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
