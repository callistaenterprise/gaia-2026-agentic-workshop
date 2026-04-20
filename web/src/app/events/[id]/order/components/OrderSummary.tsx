interface OrderSummaryProps {
  totalCost: number;
  noOfSnackTypes: number;
  customerSatisfaction: number;
}

export default function OrderSummary({ totalCost, noOfSnackTypes, customerSatisfaction }: OrderSummaryProps) {
  return (
    <div className="flex gap-4">
      <div className="flex-1 rounded-lg border border-gray-200 bg-white p-5">
        <p className="text-sm font-medium text-gray-500">Total Cost</p>
        <p className="mt-1 text-3xl font-bold text-gray-900">{totalCost.toFixed(2)} kr</p>
      </div>
      <div className="flex-1 rounded-lg border border-gray-200 bg-white p-5">
        <p className="text-sm font-medium text-gray-500">Snack Types</p>
        <p className="mt-1 text-3xl font-bold text-gray-900">{noOfSnackTypes}</p>
      </div>
      <div className="flex-1 rounded-lg border border-gray-200 bg-white p-5">
        <p className="text-sm font-medium text-gray-500">Customer satisfaction</p>
        <p className="mt-1 text-3xl font-bold text-gray-900">{customerSatisfaction.toFixed(1)}</p>
      </div>
    </div>
  );
}
