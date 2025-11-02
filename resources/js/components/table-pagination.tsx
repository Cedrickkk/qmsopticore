import PaginationLink from '@/components/pagination-link';
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem } from '@/components/ui/pagination';
import { PaginatedData } from '@/types';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface TablePaginationProps<T> {
  data: PaginatedData<T>;
  siblingCount?: number;
}

export function TablePagination<T>({ data, siblingCount = 1 }: TablePaginationProps<T>) {
  const generatePaginationItems = () => {
    const items = [];
    const current = data.current_page;
    const total = data.last_page;

    if (total > 1) {
      items.push(
        <PaginationItem key={1}>
          <PaginationLink preserveScroll preserveState link={{ url: data.first_page_url, label: '1', active: current === 1 }} className="text-xs" />
        </PaginationItem>
      );
    }

    const rangeStart = Math.max(2, current - siblingCount);
    const rangeEnd = Math.min(total - 1, current + siblingCount);

    if (rangeStart > 2) {
      items.push(
        <PaginationItem key="ellipsis-left">
          <PaginationEllipsis />
        </PaginationItem>
      );
    }

    for (let page = rangeStart; page <= rangeEnd; page++) {
      items.push(
        <PaginationItem key={page}>
          <PaginationLink
            preserveScroll
            preserveState
            link={{
              url: data.path + `?page=${page}`,
              label: page.toString(),
              active: current === page,
            }}
            className="text-xs"
          />
        </PaginationItem>
      );
    }

    if (rangeEnd < total - 1) {
      items.push(
        <PaginationItem key="ellipsis-right">
          <PaginationEllipsis />
        </PaginationItem>
      );
    }

    if (total > 1 && rangeEnd < total) {
      items.push(
        <PaginationItem key={total}>
          <PaginationLink
            preserveScroll
            preserveState
            link={{
              url: data.last_page_url,
              label: total.toString(),
              active: current === total,
            }}
            className="text-xs"
          />
        </PaginationItem>
      );
    }

    return items;
  };

  return (
    <div className="flex items-center justify-between px-2">
      <div className="text-muted-foreground text-xs">
        Showing {data?.data?.length} of {data?.total}
      </div>

      {data?.last_page > 0 && (
        <div className="flex items-center space-x-6 lg:space-x-8">
          <div className="text-muted-foreground text-xs font-medium whitespace-nowrap">
            Page {data.current_page} of {data.last_page}
          </div>

          <Pagination>
            <PaginationContent>
              {data.prev_page_url && (
                <PaginationItem>
                  <PaginationLink
                    preserveScroll
                    preserveState
                    link={{
                      url: data.prev_page_url,
                      label: 'Previous',
                      active: false,
                    }}
                    className="flex items-center gap-1 pl-2.5 text-xs"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </PaginationLink>
                </PaginationItem>
              )}

              {generatePaginationItems()}

              {data.next_page_url && (
                <PaginationItem>
                  <PaginationLink
                    preserveScroll
                    preserveState
                    link={{
                      url: data.next_page_url,
                      label: 'Next',
                      active: false,
                    }}
                    className="flex items-center gap-1 pr-2.5 text-xs"
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </PaginationLink>
                </PaginationItem>
              )}
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}
