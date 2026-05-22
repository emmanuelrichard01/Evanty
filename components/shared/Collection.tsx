import React from 'react';
import { IEvent } from '@/types';
import Card from './Card';
import Pagination from './Pagination';

type CollectionProps = {
  data: IEvent[];
  emptyTitle: string;
  emptyStateSubtext: string;
  limit: number;
  page: number | string;
  totalPages?: number;
  urlParamName?: string;
  collectionType?: 'Events_Organized' | 'My_Tickets' | 'All_Events';
  userId?: string | null;
};

const Collection = ({
  data,
  emptyTitle,
  emptyStateSubtext,
  page,
  totalPages = 0,
  collectionType,
  urlParamName,
  userId,
}: CollectionProps) => {
  const renderContent = () => {
    if (data.length > 0) {
      return (
        <div className="flex flex-col items-center gap-12">
          <ul className="grid w-full grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 md:gap-8 xl:gap-10">
            {data.map((event) => {
              const hasOrderLink = collectionType === 'Events_Organized';
              const hidePrice = collectionType === 'My_Tickets';
              return (
                <li key={event.id} className="flex justify-center w-full">
                  <Card event={event} hasOrderLink={hasOrderLink} hidePrice={hidePrice} userId={userId} />
                </li>
              );
            })}
          </ul>
          {totalPages > 1 && (
            <Pagination urlParamName={urlParamName} page={page} totalPages={totalPages} />
          )}
        </div>
      );
    } else {
      return (
        <div className="flex flex-col items-center justify-center min-h-[320px] w-full gap-5 rounded-3xl border-2 border-dashed border-slate-200/80 bg-white/50 p-12 text-center backdrop-blur-md shadow-[0_8px_30px_rgb(0,0,0,0.01)]">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 text-2xl shadow-sm">
            📅
          </div>
          <div className="flex flex-col gap-1.5 max-w-sm">
            <h3 className="font-bold text-slate-800 text-base md:text-lg">{emptyTitle}</h3>
            <p className="text-sm text-slate-500 font-medium leading-relaxed">{emptyStateSubtext}</p>
          </div>
        </div>
      );
    }
  };

  return <>{renderContent()}</>;
};

export default Collection;
