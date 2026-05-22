import type { Metadata } from 'next';
import nextDynamic from 'next/dynamic';
import { getEventById, getRelatedEventsByCategory } from '@/lib/actions/event.actions';
import { formatDateTime } from '@/lib/utils';
import { SearchParamProps } from '@/types';
import { getUserIdFromSession } from '@/lib/authUtils';
import Image from 'next/image';

export const dynamic = 'force-dynamic';

// Dynamic imports for large components
const CheckoutButton = nextDynamic(() => import('@/components/shared/CheckoutButton'));
const Collection = nextDynamic(() => import('@/components/shared/Collection'));


export async function generateMetadata({ params }: SearchParamProps): Promise<Metadata> {
  const { id } = await params;
  const event = await getEventById(id);

  return {
    title: event.title,
    description: event.description,
    openGraph: {
      images: [event.imageUrl],
    },
  };
}

const EventDetails = async ({ params, searchParams }: SearchParamProps) => {
  try {
    const { id } = await params;
    const resolvedSearchParams = await searchParams;
    const event = await getEventById(id);
    const userId = await getUserIdFromSession();

    if (!event) {
      throw new Error('Event not found');
    }

    const relatedEvents = await getRelatedEventsByCategory({
      categoryId: event.category.id,
      eventId: event.id,
      page: resolvedSearchParams.page as string,
    });

    return (
      <>
        <section className="flex justify-center py-8 md:py-12 bg-slate-50/30">
          <div className="wrapper grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 max-w-6xl">
            
            {/* Left Column: Image */}
            <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm aspect-video md:aspect-[4/3] w-full">
              <Image
                src={event.imageUrl}
                alt={event.title}
                fill
                priority
                className="object-cover"
              />
            </div>
            
            {/* Right Column: Info & Booking */}
            <div className="flex flex-col justify-between gap-6 md:gap-8">
              
              {/* Event Header */}
              <div className="flex flex-col gap-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`inline-flex items-center rounded-md px-3 py-1 text-sm font-semibold tracking-wide border ${
                    event.isFree 
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200/80' 
                      : 'bg-indigo-50 text-indigo-700 border-indigo-200/80'
                  }`}>
                    {event.isFree ? 'FREE' : `$${event.price}`}
                  </span>
                  <span className="inline-flex items-center rounded-md bg-slate-100 border border-slate-200/60 px-3 py-1 text-sm font-medium text-slate-700">
                    {event.category.name}
                  </span>
                </div>

                <h1 className="h2-bold text-slate-900 leading-tight tracking-tight md:text-3xl font-extrabold">
                  {event.title}
                </h1>
                
                {/* Organizer Info */}
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-600 flex items-center justify-center text-xs font-bold text-white uppercase shadow-sm">
                    {event.organizer.firstName?.[0] || 'O'}
                  </div>
                  <p className="text-sm font-medium text-slate-600">
                    Organized by <span className="text-slate-900 font-semibold">{`${event.organizer.firstName} ${event.organizer.lastName}`}</span>
                  </p>
                </div>
              </div>

              {/* Transaction Box / Register Card */}
              <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_2px_8px_rgba(0,0,0,0.03)] flex flex-col gap-5">
                <div className="flex flex-col gap-4">
                  {/* Calendar details */}
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-50 border border-slate-100 text-slate-500">
                      <Image src="/assets/icons/calendar.svg" alt="calendar" width={20} height={20} className="opacity-60" />
                    </div>
                    <div className="flex flex-col text-sm text-slate-600">
                      <p className="font-semibold text-slate-800">Date & Time</p>
                      <p className="mt-0.5">Start: {formatDateTime(event.startDateTime).dateTime}</p>
                      <p>End: {formatDateTime(event.endDateTime).dateTime}</p>
                    </div>
                  </div>
                  
                  {/* Location details */}
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-50 border border-slate-100 text-slate-500">
                      <Image src="/assets/icons/location.svg" alt="location" width={20} height={20} className="opacity-60" />
                    </div>
                    <div className="flex flex-col text-sm text-slate-600">
                      <p className="font-semibold text-slate-800">Location</p>
                      <p className="mt-0.5">{event.location}</p>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <CheckoutButton event={event} />
                </div>
              </div>

              {/* Description & Website */}
              <div className="flex flex-col gap-3">
                <h3 className="font-semibold text-slate-800 text-base">About this Event</h3>
                <p className="text-sm text-slate-600 leading-relaxed font-normal whitespace-pre-line">{event.description}</p>
                
                {event.url && (
                  <div className="mt-2">
                    <a 
                      href={event.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-600 hover:text-indigo-700 hover:underline transition-colors"
                    >
                      Visit Event Website
                      <Image src="/assets/icons/link.svg" alt="link" width={14} height={14} className="opacity-60" />
                    </a>
                  </div>
                )}
              </div>

            </div>
          </div>
        </section>

        <section className="wrapper my-12 flex flex-col gap-8">
          <div className="flex flex-col gap-1.5">
            <h2 className="h3-bold">Related Events</h2>
            <p className="text-sm text-slate-500">Discover other upcoming events in the same category.</p>
          </div>
          <Collection
            data={relatedEvents?.data}
            emptyTitle="No Events Found"
            emptyStateSubtext="Come back later"
            collectionType="All_Events"
            limit={3}
            page={resolvedSearchParams.page as string}
            totalPages={relatedEvents?.totalPages}
            userId={userId}
          />
        </section>
      </>
    );
  } catch (error) {
    console.error('Failed to fetch event details:', error);
    return <p>Error loading event details. Please try again later.</p>;
  }
};

export default EventDetails;
