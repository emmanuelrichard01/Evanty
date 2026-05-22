import { IEvent } from '@/types';
import { formatDateTime } from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import { DeleteConfirmation } from './DeleteConfirmation';

type CardProps = {
  event: IEvent;
  hasOrderLink?: boolean;
  hidePrice?: boolean;
  userId?: string | null;
};

const Card = ({ event, hasOrderLink = false, hidePrice = false, userId }: CardProps) => {
  const isEventCreator = userId === event.organizer.id;

  return (
    <div className="group relative flex flex-col w-full overflow-hidden rounded-2xl border border-slate-200/60 bg-white shadow-[0_2px_12px_rgba(0,0,0,0.015)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_20px_40px_rgba(0,0,0,0.04)] hover:border-slate-300/60">
      
      {/* Event Cover Image */}
      <Link
        href={`/events/${event.id}`}
        className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100"
      >
        <Image
          src={event.imageUrl}
          alt={event.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />
        {/* Soft Image Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </Link>

      {/* Editor Actions */}
      {isEventCreator && !hidePrice && (
        <div className="absolute right-3 top-3 flex flex-col gap-2 rounded-xl border border-slate-200/50 bg-white/95 p-2 backdrop-blur-sm shadow-md opacity-0 translate-y-1 transition-all group-hover:opacity-100 group-hover:translate-y-0 duration-200">
          <Link href={`/events/${event.id}/update`} className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-slate-50 transition-colors">
            <Image src="/assets/icons/edit.svg" alt="edit" width={18} height={18} className="opacity-70 hover:opacity-100" />
          </Link>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-red-50 text-red-600 transition-colors">
            <DeleteConfirmation eventId={event.id} />
          </div>
        </div>
      )}

      {/* Event Details Content */}
      <div className="flex flex-col gap-3.5 p-5 flex-1">
        
        {/* Badges Row */}
        {!hidePrice && (
          <div className="flex flex-wrap items-center gap-2">
            <span className={`inline-flex items-center rounded-lg px-2.5 py-0.5 text-xs font-semibold tracking-wide border ${
              event.isFree 
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200/80' 
                : 'bg-indigo-50 text-indigo-700 border-indigo-200/80'
            }`}>
              {event.isFree ? 'FREE' : `$${event.price}`}
            </span>
            <span className="inline-flex items-center rounded-lg bg-slate-50 border border-slate-200/60 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              {event.category.name}
            </span>
          </div>
        )}

        {/* Date Stamp */}
        <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-violet-600">
          <span>📅</span>
          <span>{formatDateTime(event.startDateTime).dateTime}</span>
        </div>

        {/* Title */}
        <Link href={`/events/${event.id}`} className="group/title">
          <h3 className="font-semibold text-slate-800 group-hover/title:text-indigo-600 transition-colors text-base md:text-lg leading-snug line-clamp-2 min-h-[44px]">
            {event.title}
          </h3>
        </Link>

        {/* Footer (Organizer / Order Details) */}
        <div className="mt-auto pt-4 border-t border-slate-100/80 flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-full bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-[10px] font-bold text-white uppercase shadow-sm">
              {event.organizer.firstName?.[0] || 'O'}
            </div>
            <p className="text-xs font-medium text-slate-500">
              {event.organizer.firstName} {event.organizer.lastName}
            </p>
          </div>
          
          {hasOrderLink && (
            <Link 
              href={`/orders?eventId=${event.id}`} 
              className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700 hover:underline transition-colors"
            >
              Order Details
              <Image src="/assets/icons/arrow.svg" alt="order details" width={10} height={10} className="filter-indigo" />
            </Link>
          )}
        </div>

      </div>
    </div>
  );
};

export default Card;
