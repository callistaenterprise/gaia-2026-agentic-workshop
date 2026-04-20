import { z } from 'zod';
import { participantAtEventSchema } from '@/lib/types';

type Participant = z.infer<typeof participantAtEventSchema>;

interface ParticipantsTableProps {
  participants: Participant[];
}

export default function ParticipantsTable({ participants }: ParticipantsTableProps) {
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left font-semibold text-gray-600">ID</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-600">Name</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-600">Snack Preference</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-600">Snack Options</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-600">Selected Snack</th>
            <th className="px-4 py-3 text-right font-semibold text-gray-600">Snack Price</th>
            <th className="px-4 py-3 text-right font-semibold text-gray-600">Customer satisfaction</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 bg-white">
          {participants.map((p, i) => {
            const selectedSnack = p.selectedSnackId
              ? p.snackOptions.find((s) => s.id === p.selectedSnackId)
              : null;
            return (
              <tr key={p.participantId} className={i % 2 === 1 ? 'bg-gray-50' : 'bg-white'}>
                <td className="px-4 py-3 text-gray-500 font-mono text-xs">{p.participantId}</td>
                <td className="px-4 py-3 font-medium text-gray-900">{p.participantName}</td>
                <td className="px-4 py-3 text-gray-700">{p.snackPreference}</td>
                <td className="px-4 py-3 text-gray-600">
                  {p.snackOptions.length > 0 ? (
                    <ol className="list-decimal list-inside space-y-0.5">
                      {p.snackOptions.map((s) => (
                        <li key={s.id}>{s.name}</li>
                      ))}
                    </ol>
                  ) : <span className="text-gray-400 italic">—</span>}
                </td>
                <td className="px-4 py-3">
                  {selectedSnack ? (
                    <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                      {selectedSnack.name}
                    </span>
                  ) : (
                    <span className="text-gray-400 italic">—</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right font-medium text-gray-900">
                  {p.selectedSnackPrice != null
                    ? `${p.selectedSnackPrice.toFixed(2)} kr`
                    : <span className="text-gray-400 italic">—</span>}
                </td>
                <td className="px-4 py-3 text-right font-medium text-gray-900">
                  {p.customerSatisfaction ?? <span className="text-gray-400 italic">—</span>}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
