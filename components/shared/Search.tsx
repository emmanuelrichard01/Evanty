'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { Input } from '../ui/input';
import { formUrlQuery, removeKeysFromQuery } from '@/lib/utils';
import { useRouter, useSearchParams } from 'next/navigation';

type SearchProps = {
  placeholder?: string;
  initialQuery?: string;
};

const Search = ({ placeholder = 'Search title...', initialQuery = '' }: SearchProps) => {
  const [query, setQuery] = useState(initialQuery);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      let newUrl = query
        ? formUrlQuery({
          params: searchParams.toString(),
          key: 'query',
          value: query,
        })
        : removeKeysFromQuery({
          params: searchParams.toString(),
          keysToRemove: ['query'],
        });

      router.push(newUrl, { scroll: false });
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [query, searchParams, router]);

  return (
    <div className="flex items-center min-h-[54px] w-full overflow-hidden rounded-full bg-grey-50 px-4 py-2">
      <Image src="/assets/icons/search.svg" alt="search" width={24} height={24} />
      <Input
        type="text"
        placeholder={placeholder}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="p-regular-16 border-0 bg-grey-50 outline-none placeholder:text-grey-500 focus:ring-0"
      />
    </div>
  );
};

export default Search;
