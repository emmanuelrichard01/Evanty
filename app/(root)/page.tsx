import CategoryFilter from '@/components/shared/CategoryFilter';
import Collection from '@/components/shared/Collection';
import Search from '@/components/shared/Search';
import { Button } from '@/components/ui/button';
import { getAllEvents } from '@/lib/actions/event.actions';
import { SearchParamProps } from '@/types';
import Image from 'next/image';
import Link from 'next/link';

type HomeProps = {
  searchParams: SearchParamProps;
};

export default async function Home({ searchParams }: HomeProps) {
  const page = Number(searchParams?.page) || 1;
  const searchText = (searchParams?.query as string) || '';
  const category = (searchParams?.category as string) || '';

  const events = await getAllEvents({
    query: searchText,
    category,
    page,
    limit: 6,
  });

  return (
    <>
      <section className="bg-dotted-pattern bg-contain py-5 md:py-10 mx-8 hero">
        <div className="wrapper grid grid-cols-1 gap-5 md:grid-cols-2 2xl:gap-0">
          <div className="flex flex-col justify-center gap-6 lg:pl-20">
            <h1 className="h1-bolder max-sm:text-center">
              Experience & Connect with Global Events on{' '}
              <span className="bg-gradient-to-r from-yellow-400 via-red-600 to-blue-500 text-transparent bg-clip-text bg-300% animate-gradient">
                EVANTY
              </span>
            </h1>
            <p className="font-medium text-xl md:text-lg max-sm:text-center">
              Network with global communities and attend online events using our top-notch virtual event platform.
            </p>
            <Button size="lg" asChild className="button w-full sm:w-fit">
              <Link href="#events">Explore Now</Link>
            </Button>
          </div>
          <div className="object-contain object-center relative">
            <div className="paralax">
              <Image
                src="/assets/images/a1.png"
                alt="star1"
                width={60}
                height={60}
                className="star1 absolute left-3/4 top-56 imgfloat"
              />
            </div>
            <div className="paralax">
              <Image
                src="/assets/images/a2.png"
                alt="star2"
                width={120}
                height={120}
                className="star2 absolute top-80 imgfloat"
              />
            </div>
            <div className="paralax">
              <Image
                src="/assets/images/a3.png"
                alt="star3"
                width={30}
                height={30}
                className="star3 absolute left-36 imgfloat"
              />
            </div>
            <Image
              src="/assets/images/hero.png"
              alt="hero"
              width={500}
              height={500}
              className="imgfloat delay max-h-[70vh] 2xl:max-h-[50vh] absolute"
            />
          </div>
        </div>
      </section>
      <section id="events" className="wrapper my-8 flex flex-col gap-8 md:gap-12">
        <div className="items-center flex flex-col gap-4">
          <h2 className="h2-bold">Events</h2>
          <p className="text-base font-light text-gray-700">
            Connect with the Evanty community at conferences, meetups, and hackathons around the world.
          </p>
        </div>
        <div className="flex w-full flex-col gap-5 md:flex-row">
          <Search initialQuery={searchText} />
          <CategoryFilter initialCategory={category} />
        </div>
        <Collection
          data={events?.data}
          emptyTitle="No Events Found"
          emptyStateSubtext="Come back later"
          collectionType="All_Events"
          limit={6}
          page={page}
          totalPages={events?.totalPages}
        />
      </section>
    </>
  );
}
