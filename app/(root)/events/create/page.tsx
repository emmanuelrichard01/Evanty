import EventForm from "@/components/shared/EventForm"
import { getUserIdFromSession } from "@/lib/authUtils";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const dynamic = 'force-dynamic';

const CreateEvent = async () => {
  const userId = await getUserIdFromSession() as string;

  return (
    <div className="min-h-screen bg-slate-50/20 pb-16">
      {/* Create Event Banner */}
      <section className="border-b border-slate-200/50 bg-white py-10 md:py-14 shadow-[0_1px_3px_rgba(0,0,0,0.01)]">
        <div className="wrapper flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex flex-col gap-1 text-left">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Create Event</h1>
            <p className="text-sm text-slate-500">Provide details below to publish your upcoming community event.</p>
          </div>
          <Button asChild variant="outline" size="sm" className="rounded-xl border-slate-200 hover:bg-slate-50 text-slate-600 font-medium h-9 px-4 shadow-sm transition-all gap-1.5">
            <Link href="/profile">
              <ArrowLeft className="h-4 w-4" /> Back to Profile
            </Link>
          </Button>
        </div>
      </section>

      <div className="wrapper my-12 max-w-4xl">
        <EventForm userId={userId} type="Create" />
      </div>
    </div>
  )
}

export default CreateEvent