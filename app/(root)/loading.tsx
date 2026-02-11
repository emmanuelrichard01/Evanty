import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
    return (
        <div className="wrapper w-full py-8">
            <div className="flex flex-col gap-5 md:flex-row mb-8">
                <Skeleton className="h-10 w-full sm:max-w-xs" />
                <Skeleton className="h-10 w-full sm:max-w-xs" />
            </div>

            <div className="grid w-full grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:gap-10">
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="flex flex-col overflow-hidden rounded-xl bg-white shadow-sm h-[380px] md:h-[438px]">
                        <Skeleton className="h-[200px] md:h-[230px] w-full" />
                        <div className="flex flex-1 flex-col gap-3 p-5 md:gap-4">
                            <div className="flex gap-2">
                                <Skeleton className="h-6 w-16 rounded-full" />
                                <Skeleton className="h-6 w-16 rounded-full" />
                            </div>
                            <Skeleton className="h-4 w-1/3" />
                            <Skeleton className="h-6 w-full" />
                            <div className="mt-auto flex justify-between items-center w-full">
                                <Skeleton className="h-4 w-1/4" />
                                <Skeleton className="h-4 w-4 rounded-full" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
