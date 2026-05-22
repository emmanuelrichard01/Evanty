import CategoryFilter from '@/components/shared/CategoryFilter';
import Collection from '@/components/shared/Collection';
import Search from '@/components/shared/Search';
import { Button } from '@/components/ui/button';
import { getAllEvents } from '@/lib/actions/event.actions';
import { SearchParamProps } from '@/types';
import { getUserIdFromSession } from '@/lib/authUtils';
import Image from 'next/image';
import Link from 'next/link';

type HomeProps = {
  searchParams: SearchParamProps['searchParams'];
};

export const dynamic = 'force-dynamic';

export default async function Home({ searchParams }: HomeProps) {
  const resolvedSearchParams = await searchParams;
  const page = Number(resolvedSearchParams.page) || 1;
  const searchText = (resolvedSearchParams.query as string) || '';
  const category = (resolvedSearchParams.category as string) || '';
  const userId = await getUserIdFromSession();

  const events = await getAllEvents({
    query: searchText,
    category,
    page,
    limit: 6,
  });

  return (
    <>
      <section className="relative overflow-hidden pt-16 pb-24 md:pt-24 md:pb-32 hero">
        {/* Modern Dot Grid Overlay */}
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-35" />
        
        <div className="wrapper flex flex-col items-center text-center gap-8 md:gap-12">
          
          {/* Premium Glowing Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-100/80 bg-indigo-50/40 px-4 py-1.5 text-xs md:text-sm font-semibold text-indigo-700 backdrop-blur-md shadow-sm transition-all hover:bg-indigo-50/80 hover:border-indigo-200">
            <span className="flex h-2 w-2 rounded-full bg-indigo-600 animate-pulse" />
            Introducing Evanty 2.0 — The Premium Event Experience
          </div>

          {/* Heading & Subheading */}
          <div className="flex flex-col gap-5 max-w-3xl">
            <h1 className="h1-bolder leading-[1.1] tracking-tight">
              Experience & Connect with{' '}
              <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-700 text-transparent bg-clip-text font-extrabold animate-gradient bg-300%">
                Global Events
              </span>
            </h1>
            <p className="text-slate-600 text-lg md:text-xl font-normal leading-relaxed max-w-2xl mx-auto">
              Network with global communities, secure premium tickets, and host high-fidelity conferences on our state-of-the-art virtual platform.
            </p>
          </div>

          {/* CTA Buttons with hover transformations */}
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center">
            <Button size="lg" asChild className="rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-medium px-8 h-12 shadow-lg shadow-indigo-600/10 hover:shadow-indigo-600/20 transition-all hover:-translate-y-0.5 active:translate-y-0 duration-200">
              <Link href="#events">Explore Events</Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="rounded-xl border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-medium px-8 h-12 transition-all hover:-translate-y-0.5 active:translate-y-0 duration-200">
              <Link href="/events/create">Host an Event</Link>
            </Button>
          </div>

          {/* Mockup Preview Container styled like a real app window */}
          <div className="relative mt-10 w-full max-w-5xl rounded-3xl border border-slate-200 bg-slate-100/60 p-2.5 backdrop-blur-md shadow-2xl transition-all hover:scale-[1.005] duration-300">
            {/* Glowing backgrounds */}
            <div className="absolute -inset-1 -z-10 rounded-3xl bg-gradient-to-r from-violet-600 to-indigo-600 opacity-20 blur-2xl transition-all duration-300" />
            
            <div className="overflow-hidden rounded-2xl border border-slate-200/50 bg-slate-950 shadow-2xl">
              {/* Window Controls bar */}
              <div className="flex items-center gap-1.5 px-4 py-3 bg-slate-900/80 border-b border-slate-800/40">
                <span className="h-2.5 w-2.5 rounded-full bg-rose-500/80" />
                <span className="h-2.5 w-2.5 rounded-full bg-amber-500/80" />
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
                <div className="mx-auto text-[10px] text-slate-400 font-mono select-none truncate max-w-xs bg-slate-950/60 px-4 py-0.5 rounded border border-slate-800/30">
                  evanty.app/dashboard
                </div>
              </div>
              
              <Image
                src="/assets/images/hero_dashboard_preview.png"
                alt="Evanty Premium Dashboard Mockup"
                width={1200}
                height={675}
                priority
                className="w-full h-auto object-cover opacity-95 transition-opacity hover:opacity-100"
              />
            </div>
          </div>

          {/* Stats / Social Proof Section */}
          <div className="w-full max-w-5xl mt-12 grid grid-cols-2 md:grid-cols-4 gap-8 border-t border-slate-200/60 pt-10">
            {[
              { value: '10k+', label: 'Events Hosted' },
              { value: '500k+', label: 'Tickets Sold' },
              { value: '99.9%', label: 'Scan Success' },
              { value: '150+', label: 'Countries Active' },
            ].map((stat, i) => (
              <div key={i} className="flex flex-col items-center justify-center text-center">
                <span className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-transparent bg-clip-text font-sans tracking-tight">
                  {stat.value}
                </span>
                <span className="text-[10px] md:text-xs font-semibold text-slate-400 mt-1 uppercase tracking-wider">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* Bento Features Grid */}
      <section className="wrapper py-20 md:py-28 border-t border-slate-100 bg-slate-50/20">
        <div className="flex flex-col items-center text-center gap-4 mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-indigo-600 bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full">
            Features
          </span>
          <h2 className="h2-bold max-w-2xl leading-tight">
            Everything you need to host & attend premium events
          </h2>
          <p className="text-slate-500 text-base max-w-lg">
            Host modern virtual and hybrid events with integrated global payouts, QR validations, and robust analytical tools.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {/* Bento Card 1: Ticket Payments (Stripe/Paystack) - Col span 2 */}
          <div className="md:col-span-2 group relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-8 shadow-[0_2px_8px_rgba(0,0,0,0.01)] transition-all duration-300 hover:shadow-[0_12px_24px_rgba(0,0,0,0.04)] hover:border-slate-300/80 hover:-translate-y-0.5">
            <div className="absolute -right-10 -bottom-10 h-40 w-40 rounded-full bg-indigo-500/5 blur-2xl group-hover:bg-indigo-500/10 transition-colors" />
            <div className="flex flex-col h-full justify-between gap-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 border border-indigo-100 text-xl font-bold shadow-sm">
                💳
              </div>
              <div className="flex flex-col gap-2">
                <h3 className="text-xl font-bold text-slate-800">Sleek Ticket Payments</h3>
                <p className="text-slate-500 text-sm leading-relaxed max-w-md">
                  Seamless checkout experience powered by Stripe and Paystack. Support global credit cards, bank transfers, and local currency wallets with high conversion rates.
                </p>
              </div>
            </div>
          </div>

          {/* Bento Card 2: QR Validation - Col span 1 */}
          <div className="group relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-8 shadow-[0_2px_8px_rgba(0,0,0,0.01)] transition-all duration-300 hover:shadow-[0_12px_24px_rgba(0,0,0,0.04)] hover:border-slate-300/80 hover:-translate-y-0.5">
            <div className="absolute -right-10 -bottom-10 h-40 w-40 rounded-full bg-emerald-500/5 blur-2xl group-hover:bg-emerald-500/10 transition-colors" />
            <div className="flex flex-col h-full justify-between gap-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 border border-emerald-100 text-xl font-bold shadow-sm">
                📷
              </div>
              <div className="flex flex-col gap-2">
                <h3 className="text-xl font-bold text-slate-800">QR Code Entry</h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Generate secure tickets with unique QR codes. Organizers validate attendees in real time via our secure scanner to prevent duplicates.
                </p>
              </div>
            </div>
          </div>

          {/* Bento Card 3: Instant Analytics - Col span 1 */}
          <div className="group relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-8 shadow-[0_2px_8px_rgba(0,0,0,0.01)] transition-all duration-300 hover:shadow-[0_12px_24px_rgba(0,0,0,0.04)] hover:border-slate-300/80 hover:-translate-y-0.5">
            <div className="absolute -right-10 -bottom-10 h-40 w-40 rounded-full bg-amber-500/5 blur-2xl group-hover:bg-amber-500/10 transition-colors" />
            <div className="flex flex-col h-full justify-between gap-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 border border-amber-100 text-xl font-bold shadow-sm">
                📊
              </div>
              <div className="flex flex-col gap-2">
                <h3 className="text-xl font-bold text-slate-800">Real-time Analytics</h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Track visual statistics, ticket sales, registration velocity, and viewer check-ins. Keep pulse of your revenue and attendee demographics.
                </p>
              </div>
            </div>
          </div>

          {/* Bento Card 4: Hybrid Event Management - Col span 2 */}
          <div className="md:col-span-2 group relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-8 shadow-[0_2px_8px_rgba(0,0,0,0.01)] transition-all duration-300 hover:shadow-[0_12px_24px_rgba(0,0,0,0.04)] hover:border-slate-300/80 hover:-translate-y-0.5">
            <div className="absolute -right-10 -bottom-10 h-40 w-40 rounded-full bg-violet-500/5 blur-2xl group-hover:bg-violet-500/10 transition-colors" />
            <div className="flex flex-col h-full justify-between gap-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-50 border border-violet-100 text-xl font-bold shadow-sm">
                🌐
              </div>
              <div className="flex flex-col gap-2">
                <h3 className="text-xl font-bold text-slate-800">Hybrid Event Spaces</h3>
                <p className="text-slate-500 text-sm leading-relaxed max-w-md">
                  Built for hybrid conferences, local meetups, webinars, and developer hackathons. Setup links, physical venues, and schedules seamlessly.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Events Listing Section */}
      <section id="events" className="wrapper my-16 md:my-24 flex flex-col gap-10 scroll-mt-20">
        <div className="items-center flex flex-col gap-3 text-center max-w-2xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-widest text-indigo-600 bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full">
            Discover
          </span>
          <h2 className="h2-bold leading-tight">Explore Upcoming Events</h2>
          <p className="text-slate-500 text-base">
            Connect with the Evanty community at live conferences, online seminars, and developer hackathons around the globe.
          </p>
        </div>

        {/* Discovery & Search Track */}
        <div className="flex w-full flex-col gap-4 md:flex-row p-4 rounded-2xl bg-white/60 border border-slate-200/50 backdrop-blur-md shadow-[0_8px_30px_rgb(0,0,0,0.015)]">
          <Search initialQuery={searchText} />
          <CategoryFilter initialCategory={category} />
        </div>

        <Collection
          data={events?.data}
          emptyTitle="No Events Found"
          emptyStateSubtext="Check back soon for new events, or host one yourself!"
          collectionType="All_Events"
          limit={6}
          page={page}
          totalPages={events?.totalPages}
          userId={userId}
        />
      </section>
    </>
  );
}
