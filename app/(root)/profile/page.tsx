import Collection from '@/components/shared/Collection'
import { Button } from '@/components/ui/button'
import { getEventsByUser } from '@/lib/actions/event.actions'
import { getOrdersByUser } from '@/lib/actions/order.actions'
import { SearchParamProps } from '@/types'
import { getUserIdFromSession } from '@/lib/authUtils'
import { getUserById } from '@/lib/repositories/user.repo'
import Link from 'next/link'
import React from 'react'
import { Plus, Compass, Calendar, Ticket } from 'lucide-react'

export const dynamic = 'force-dynamic';

const ProfilePage = async ({ searchParams }: SearchParamProps) => {
  const userId = await getUserIdFromSession() as string;
  const resolvedSearchParams = await searchParams;

  const ordersPage = Number(resolvedSearchParams?.ordersPage) || 1;
  const eventsPage = Number(resolvedSearchParams?.eventsPage) || 1;
  const currentTab = (resolvedSearchParams?.tab as string) || 'tickets';

  const orders = await getOrdersByUser({ userId, page: ordersPage })
  const orderedEvents = orders?.data.map((order: any) => order.event) || [];
  const organizedEvents = await getEventsByUser({ userId, page: eventsPage })
  
  const user = await getUserById(userId);
  const userInitials = user?.fullName
    ? user.fullName
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .toUpperCase()
    : 'U';

  const isTicketsTab = currentTab === 'tickets';
  const isOrganizedTab = currentTab === 'organized';

  return (
    <div className="min-h-screen bg-slate-50/20 pb-16">
      {/* Profile Bento Header */}
      <section className="border-b border-slate-200/50 bg-white py-10 md:py-14 shadow-[0_1px_3px_rgba(0,0,0,0.01)]">
        <div className="wrapper flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
          
          {/* User Card */}
          <div className="flex items-center gap-5">
            <div className="relative h-20 w-20 rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 p-[3px] shadow-sm">
              <div className="h-full w-full rounded-[13px] bg-white overflow-hidden flex items-center justify-center">
                {user?.avatarUrl ? (
                  <img src={user.avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
                ) : (
                  <span className="text-2xl font-bold text-slate-700 font-sans">{userInitials}</span>
                )}
              </div>
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight leading-none">{user?.fullName || 'User Profile'}</h1>
                <span className="inline-flex items-center rounded-full bg-indigo-50 border border-indigo-100 px-2 py-0.5 text-[10px] font-semibold text-indigo-600 uppercase tracking-wider">
                  Organizer
                </span>
              </div>
              <p className="text-sm text-slate-500 mt-1 font-medium">{user?.email}</p>
            </div>
          </div>

          {/* Bento Stats */}
          <div className="grid grid-cols-2 gap-4 w-full lg:w-auto min-w-[280px] sm:min-w-[360px]">
            <div className="bg-slate-50/60 border border-slate-200/50 p-4 rounded-2xl flex flex-col gap-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Ticket className="h-3 w-3 text-indigo-500" /> Tickets Booked
              </span>
              <span className="text-2xl font-bold text-slate-900 mt-1">{orders?.data?.length || 0}</span>
            </div>
            <div className="bg-slate-50/60 border border-slate-200/50 p-4 rounded-2xl flex flex-col gap-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Calendar className="h-3 w-3 text-indigo-500" /> Events Created
              </span>
              <span className="text-2xl font-bold text-slate-900 mt-1">{organizedEvents?.data?.length || 0}</span>
            </div>
          </div>

        </div>
      </section>

      {/* Tabs and Collections wrapper */}
      <div className="wrapper mt-10">
        
        {/* Navigation Tabs */}
        <div className="border-b border-slate-200/60 mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex gap-8">
            <Link 
              href={`/profile?tab=tickets`} 
              scroll={false}
              className={`pb-4 text-sm font-semibold transition-all duration-200 relative flex items-center gap-2 ${
                isTicketsTab 
                  ? 'text-indigo-600' 
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              My Tickets
              <span className={`inline-flex items-center justify-center px-2 py-0.5 text-xs font-semibold rounded-full ${
                isTicketsTab ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-600'
              }`}>
                {orders?.data?.length || 0}
              </span>
              {isTicketsTab && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-full" />
              )}
            </Link>
            <Link 
              href={`/profile?tab=organized`}
              scroll={false}
              className={`pb-4 text-sm font-semibold transition-all duration-200 relative flex items-center gap-2 ${
                isOrganizedTab 
                  ? 'text-indigo-600' 
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Events Organized
              <span className={`inline-flex items-center justify-center px-2 py-0.5 text-xs font-semibold rounded-full ${
                isOrganizedTab ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-600'
              }`}>
                {organizedEvents?.data?.length || 0}
              </span>
              {isOrganizedTab && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-full" />
              )}
            </Link>
          </div>

          <div className="pb-4 sm:pb-0">
            {isTicketsTab ? (
              <Button asChild size="sm" className="rounded-xl bg-slate-950 hover:bg-slate-900 text-white font-medium h-9 px-4 shadow-sm active:scale-[0.98] transition-all gap-1.5">
                <Link href="/#events">
                  <Compass className="h-4 w-4" /> Explore Events
                </Link>
              </Button>
            ) : (
              <Button asChild size="sm" className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium h-9 px-4 shadow-sm active:scale-[0.98] transition-all gap-1.5">
                <Link href="/events/create">
                  <Plus className="h-4 w-4" /> Create Event
                </Link>
              </Button>
            )}
          </div>
        </div>

        {/* Tab Content Panels */}
        <div className="transition-all duration-300">
          {isTicketsTab ? (
            <div>
              <Collection
                data={orderedEvents}
                emptyTitle="No event tickets purchased yet"
                emptyStateSubtext="No worries - plenty of exciting events to explore!"
                collectionType="My_Tickets"
                limit={3}
                page={ordersPage}
                urlParamName="ordersPage"
                totalPages={orders?.totalPages}
                userId={userId}
              />
            </div>
          ) : (
            <div>
              <Collection
                data={organizedEvents?.data}
                emptyTitle="No events have been created yet"
                emptyStateSubtext="Launch your first event and start selling tickets today!"
                collectionType="Events_Organized"
                limit={3}
                page={eventsPage}
                urlParamName="eventsPage"
                totalPages={organizedEvents?.totalPages}
                userId={userId}
              />
            </div>
          )}
        </div>

      </div>
    </div>
  )
}

export default ProfilePage