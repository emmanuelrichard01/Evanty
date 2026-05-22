'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import * as z from 'zod';
import { eventFormSchema } from '@/lib/validator';
import { eventDefaultValues } from '@/constants';
import { createEvent, updateEvent } from '@/lib/actions/event.actions';
import { IEvent } from '@/types';
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import Dropdown from './Dropdown';
import { FileUploader } from './FileUploader';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { toast } from "sonner"
import { FileText, MapPin, Calendar, DollarSign, Link as LinkIcon } from 'lucide-react';

type EventFormProps = {
  userId: string;
  type: 'Create' | 'Update';
  event?: IEvent;
  eventId?: string;
};

const EventForm = ({ userId, type, event, eventId }: EventFormProps) => {
  const [files, setFiles] = useState<File[]>([]);
  const router = useRouter();

  const initialValues = event && type === 'Update'
    ? {
      ...event,
      startDateTime: new Date(event.startDateTime),
      endDateTime: new Date(event.endDateTime),
    }
    : eventDefaultValues;

  const form = useForm<z.infer<typeof eventFormSchema>>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: initialValues,
  });

  async function onSubmit(values: z.infer<typeof eventFormSchema>) {
    try {
      const uploadedImageUrl = values.imageUrl;

      if (type === 'Create') {
        const newEvent = await createEvent({
          event: { ...values, imageUrl: uploadedImageUrl },
          userId,
          path: '/profile'
        });

        if (newEvent) {
          form.reset();
          router.push(`/events/${newEvent.id}`);
          toast.success('Event created successfully');
        }
      }

      if (type === 'Update' && eventId) {
        const updatedEvent = await updateEvent({
          userId,
          event: { ...values, imageUrl: uploadedImageUrl, id: eventId },
          path: `/events/${eventId}`
        });

        if (updatedEvent) {
          form.reset();
          router.push(`/events/${updatedEvent.id}`);
          toast.success('Event updated successfully');
        }
      }
    } catch (error) {
      console.error(error);
      toast.error(`${type} event failed. Please try again.`);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-8">
        
        {/* Card 1: General Details */}
        <div className="bg-white border border-slate-200/60 p-6 md:p-8 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex flex-col gap-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900">1. Event Details</h2>
            <p className="text-xs text-slate-500 mt-0.5">Name your event, assign a category, and describe what makes it special.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <FileText className="h-3.5 w-3.5 text-indigo-500" /> Event Title
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="E.g., Next.js Conf 2026" {...field} className="input-field" />
                  </FormControl>
                  <FormMessage className="text-xs text-red-500" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    Category
                  </FormLabel>
                  <FormControl>
                    <Dropdown onChangeHandler={field.onChange} value={field.value} />
                  </FormControl>
                  <FormMessage className="text-xs text-red-500" />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Description
                </FormLabel>
                <FormControl className="h-48">
                  <Textarea placeholder="Share details about speakers, agenda, schedule..." {...field} className="textarea" />
                </FormControl>
                <FormMessage className="text-xs text-red-500" />
              </FormItem>
            )}
          />
        </div>

        {/* Card 2: Event Media */}
        <div className="bg-white border border-slate-200/60 p-6 md:p-8 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex flex-col gap-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900">2. Event Media</h2>
            <p className="text-xs text-slate-500 mt-0.5">Upload a high-quality cover photo to attract attendees.</p>
          </div>
          <FormField
            control={form.control}
            name="imageUrl"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormControl className="h-72">
                  <FileUploader
                    onFieldChange={field.onChange}
                    imageUrl={field.value}
                    setFiles={setFiles}
                  />
                </FormControl>
                <FormMessage className="text-xs text-red-500" />
              </FormItem>
            )}
          />
        </div>

        {/* Card 3: Location & Schedule */}
        <div className="bg-white border border-slate-200/60 p-6 md:p-8 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex flex-col gap-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900">3. Location & Schedule</h2>
            <p className="text-xs text-slate-500 mt-0.5">Specify when and where the event will take place.</p>
          </div>

          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-indigo-500" /> Event Location
                </FormLabel>
                <FormControl>
                  <div className="flex items-center h-12 w-full overflow-hidden rounded-xl border border-slate-200 bg-white px-4 shadow-sm focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/10 transition-all">
                    <MapPin className="h-5 w-5 text-slate-400 shrink-0" strokeWidth={1.8} />
                    <Input placeholder="E.g., San Francisco, CA or Online (Zoom)" {...field} className="p-regular-16 border-0 bg-transparent outline-none placeholder:text-slate-400 focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-0 h-full w-full ml-2" />
                  </div>
                </FormControl>
                <FormMessage className="text-xs text-red-500" />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <FormField
              control={form.control}
              name="startDateTime"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-indigo-500" /> Start Date & Time
                  </FormLabel>
                  <FormControl>
                    <div className="flex items-center h-12 w-full overflow-hidden rounded-xl border border-slate-200 bg-white px-4 shadow-sm focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/10 transition-all">
                      <Calendar className="h-5 w-5 text-slate-400 shrink-0" strokeWidth={1.8} />
                      <DatePicker
                        selected={field.value}
                        onChange={(date: Date) => field.onChange(date)}
                        showTimeSelect
                        timeInputLabel="Time:"
                        dateFormat="MM/dd/yyyy h:mm aa"
                        wrapperClassName="datePicker ml-2.5"
                      />
                    </div>
                  </FormControl>
                  <FormMessage className="text-xs text-red-500" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="endDateTime"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-indigo-500" /> End Date & Time
                  </FormLabel>
                  <FormControl>
                    <div className="flex items-center h-12 w-full overflow-hidden rounded-xl border border-slate-200 bg-white px-4 shadow-sm focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/10 transition-all">
                      <Calendar className="h-5 w-5 text-slate-400 shrink-0" strokeWidth={1.8} />
                      <DatePicker
                        selected={field.value}
                        onChange={(date: Date) => field.onChange(date)}
                        showTimeSelect
                        timeInputLabel="Time:"
                        dateFormat="MM/dd/yyyy h:mm aa"
                        wrapperClassName="datePicker ml-2.5"
                      />
                    </div>
                  </FormControl>
                  <FormMessage className="text-xs text-red-500" />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Card 4: Tickets & Pricing */}
        <div className="bg-white border border-slate-200/60 p-6 md:p-8 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex flex-col gap-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900">4. Admission & Settings</h2>
            <p className="text-xs text-slate-500 mt-0.5">Control pricing options and add external ticket or registration links.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <DollarSign className="h-3.5 w-3.5 text-indigo-500" /> Ticket Price
                  </FormLabel>
                  <FormControl>
                    <div className="flex items-center h-12 w-full overflow-hidden rounded-xl border border-slate-200 bg-white px-4 shadow-sm focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/10 transition-all">
                      <DollarSign className="h-5 w-5 text-slate-400 shrink-0" strokeWidth={1.8} />
                      <Input
                        type="number"
                        placeholder="0.00"
                        {...field}
                        disabled={form.watch('isFree')}
                        className="p-regular-16 border-0 bg-transparent outline-none placeholder:text-slate-400 focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-0 h-full w-full ml-1 disabled:opacity-50"
                      />
                      <FormField
                        control={form.control}
                        name="isFree"
                        render={({ field: isFreeField }) => (
                          <FormItem className="flex items-center gap-2">
                            <FormControl>
                              <div className="flex items-center gap-2 border-l border-slate-200 pl-4 h-6">
                                <Checkbox
                                  onCheckedChange={(checked) => {
                                    isFreeField.onChange(checked);
                                    if (checked) {
                                      form.setValue('price', '0');
                                    }
                                  }}
                                  checked={isFreeField.value}
                                  id="isFree"
                                  className="h-5 w-5 rounded-md border-slate-300 text-indigo-600 focus:ring-indigo-500 focus-visible:ring-indigo-500"
                                />
                                <label
                                  htmlFor="isFree"
                                  className="text-xs font-bold uppercase tracking-wider text-slate-500 cursor-pointer whitespace-nowrap select-none"
                                >
                                  Free
                                </label>
                              </div>
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  </FormControl>
                  <FormMessage className="text-xs text-red-500" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="url"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <LinkIcon className="h-3.5 w-3.5 text-indigo-500" /> Event Webpage / Link
                  </FormLabel>
                  <FormControl>
                    <div className="flex items-center h-12 w-full overflow-hidden rounded-xl border border-slate-200 bg-white px-4 shadow-sm focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/10 transition-all">
                      <LinkIcon className="h-5 w-5 text-slate-400 shrink-0" strokeWidth={1.8} />
                      <Input placeholder="E.g., https://mysite.com/event" {...field} className="p-regular-16 border-0 bg-transparent outline-none placeholder:text-slate-400 focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-0 h-full w-full ml-2" />
                    </div>
                  </FormControl>
                  <FormMessage className="text-xs text-red-500" />
                </FormItem>
              )}
            />
          </div>
        </div>

        <Button
          type="submit"
          size="lg"
          disabled={form.formState.isSubmitting}
          className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold h-12 shadow-lg shadow-indigo-600/10 hover:shadow-indigo-600/20 transition-all active:scale-[0.98] w-full mt-4 flex items-center justify-center gap-2"
        >
          {form.formState.isSubmitting ? (
            <span className="flex items-center gap-2 justify-center">
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Saving Changes...
            </span>
          ) : (
            `${type} Event`
          )}
        </Button>
      </form>
    </Form>
  );
};

export default EventForm;
