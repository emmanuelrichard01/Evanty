'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import React from 'react';
import { Button } from '../ui/button';
import { formUrlQuery } from '@/lib/utils';

type PaginationProps = {
  page: number | string;
  totalPages: number;
  urlParamName?: string;
};

const Pagination = ({ page, totalPages, urlParamName = 'page' }: PaginationProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handlePageChange = (direction: 'next' | 'prev') => {
    const currentPage = Number(page);
    const newPage = direction === 'next' ? currentPage + 1 : currentPage - 1;

    const newUrl = formUrlQuery({
      params: searchParams.toString(),
      key: urlParamName,
      value: newPage.toString(),
    });

    router.push(newUrl, { scroll: false });
  };

  return (
    <div className="flex gap-2">
      <Button
        size="lg"
        variant="outline"
        className="w-28"
        onClick={() => handlePageChange('prev')}
        disabled={Number(page) <= 1}
      >
        Previous
      </Button>
      <Button
        size="lg"
        variant="outline"
        className="w-28"
        onClick={() => handlePageChange('next')}
        disabled={Number(page) >= totalPages}
      >
        Next
      </Button>
    </div>
  );
};

export default Pagination;
