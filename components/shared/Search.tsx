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
    <div className="flex items-center h-12 w-full overflow-hidden rounded-xl border border-slate-200/80 bg-white px-4 shadow-sm focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/10 transition-all">
      <Image 
        src="/assets/icons/search.svg" 
        alt="search" 
        width={20} 
        height={20} 
        className="text-slate-400 opacity-60"
      />
      <Input
        type="text"
        placeholder={placeholder}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="p-regular-16 border-0 bg-transparent outline-none placeholder:text-slate-400 focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-0 h-full w-full"
      />
    </div>
  );
};

export default Search;
