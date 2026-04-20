import { getOrder } from '@/backend/services/orderService'
import { notFound } from 'next/navigation'
import { OrderActions } from '@/components/orders/OrderActions'

type Props = {
  params: Promise<{ id: string }>
}

export default async function OrderPage({ params }: Props) {
  const { id } = await params

  const order = await getOrder(id)

  if (!order) {
    notFound()
  }

  const { items } = order

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-1">Order</h1>

      <p className="text-gray-700 mb-1">{order.name}</p>
      <p className="text-sm text-muted-foreground mb-6">
        {new Date(order.createdAt).toLocaleString('sv-SE', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
      </p>

      <h2 className="text-lg font-semibold mb-3">
        Snacks ({items.length})
      </h2>

      {items.length === 0 ? (
        <p className="text-gray-500">No snacks on this order.</p>
      ) : (
        <table className="w-full border-collapse border border-gray-200 rounded">
          <thead>
            <tr className="bg-gray-50">
              <th className="text-left px-4 py-2 border-b border-gray-200 font-medium">Snack</th>
              <th className="text-right px-4 py-2 border-b border-gray-200 font-medium">Quantity</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.snackName} className="border-b border-gray-100 last:border-0">
                <td className="px-4 py-2">{item.snackName}</td>
                <td className="px-4 py-2 text-right text-muted-foreground">×{item.quantity}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <OrderActions orderId={order.id} />
    </main>
  )
}
