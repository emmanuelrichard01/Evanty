"use client";
import { useEffect, useState } from 'react';
import EventForm from '@/components/shared/EventForm';

const CreateEvent = () => {
  const [userId, setUserId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const res = await fetch('/api/get-user-id');
        if (!res.ok) {
          throw new Error('User not authenticated');
        }
        const data = await res.json();
        setUserId(data.userId);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('An unknown error occurred');
        }
      }
    };

    fetchUserId();
  }, []);

  if (error) {
    return (
      <div className="wrapper my-8">
        <p className="text-center text-red-500">{error}</p>
      </div>
    );
  }

  if (!userId) {
    return (
      <div className="wrapper my-8">
        <p className="text-center text-red-500">Loading...</p>
      </div>
    );
  }

  return (
    <>
      <section className="bg-primary-50 bg-dotted-pattern bg-cover bg-center py-5 md:py-10">
        <h3 className="wrapper h3-bold text-center sm:text-left">Create Event</h3>
      </section>

      <div className="wrapper my-8">
        <EventForm userId={userId} type="Create" />
      </div>
    </>
  );
};

export default CreateEvent;
