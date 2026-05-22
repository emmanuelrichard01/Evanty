import Search  from '@/components/shared/Search'
import { getOrdersByEvent } from '@/lib/actions/order.actions'
import { formatDateTime, formatPrice } from '@/lib/utils'
import { SearchParamProps } from '@/types'

const Orders = async ({ searchParams }: SearchParamProps) => {
  const resolvedSearchParams = await searchParams;
  const eventId = (resolvedSearchParams?.eventId as string) || ''
  const searchText = (resolvedSearchParams?.query as string) || ''

  const orders = await getOrdersByEvent({ eventId, searchString: searchText })

  return (
    <>
      <section className="border-b border-slate-200/80 bg-slate-50/30 py-8 md:py-12">
        <div className="wrapper flex flex-col gap-1 text-center sm:text-left">
          <h1 className='h2-bold text-slate-900'>Orders</h1>
          <p className="text-sm text-slate-500">Track purchase transactions, buyer details, and revenue logs.</p>
        </div>
      </section>

      <section className="wrapper py-6">
        <Search placeholder="Search buyer name..." />
      </section>

      <section className="wrapper pb-16">
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/75 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  <th className="px-6 py-4 font-semibold">Order ID</th>
                  <th className="px-6 py-4 font-semibold">Event Title</th>
                  <th className="px-6 py-4 font-semibold">Buyer</th>
                  <th className="px-6 py-4 font-semibold">Date Created</th>
                  <th className="px-6 py-4 text-right font-semibold">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {orders && orders.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-400 font-medium bg-slate-50/20">
                      No order transactions found.
                    </td>
                  </tr>
                ) : (
                  <>
                    {orders &&
                      orders.map((row: any) => (
                        <tr
                          key={row.id}
                          className="hover:bg-slate-50/50 transition-colors"
                        >
                          <td className="px-6 py-4 font-mono text-xs font-medium text-indigo-600 select-all">
                            <span className="bg-indigo-50 border border-indigo-100/50 px-2 py-1 rounded-md">
                              {row.id}
                            </span>
                          </td>
                          <td className="px-6 py-4 font-medium text-slate-800 max-w-[280px] truncate">{row.eventTitle}</td>
                          <td className="px-6 py-4 font-medium text-slate-600">{row.buyer}</td>
                          <td className="px-6 py-4 text-slate-500">
                            {formatDateTime(row.createdAt).dateTime}
                          </td>
                          <td className="px-6 py-4 text-right font-semibold text-slate-900">
                            {formatPrice(row.totalAmount)}
                          </td>
                        </tr>
                      ))}
                  </>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </>
  )
}

export default Orders
