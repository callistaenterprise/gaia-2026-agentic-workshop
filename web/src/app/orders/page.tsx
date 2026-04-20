import { db } from '@/backend/db/dbClient'
import { orders } from '@/backend/db/schema'
import { desc } from 'drizzle-orm'
import { OrderTable } from '@/components/orders/OrderTable'

export default async function OrdersPage() {
  const allOrders = await db.select().from(orders).orderBy(desc(orders.createdAt))

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-6">Orders</h1>

      {allOrders.length === 0 ? (
        <p className="text-gray-500">No orders found.</p>
      ) : (
        <OrderTable orders={allOrders} />
      )}
    </main>
  )
}
