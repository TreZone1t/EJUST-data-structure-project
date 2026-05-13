import React from 'react';

export interface CustomerData {
  id: number;
  x: number;
  y: number;
  arrivalTime: number;
  transactionTime: number;
  queueWaitTime: number;
  windowOpenTime: number;
  serviceEndTime: number;
  serverId: number;
}

interface CustomerTableProps {
  customers: CustomerData[];
}

export const CustomerTable: React.FC<CustomerTableProps> = ({ customers }) => {
  return (
    <div className="overflow-x-auto rounded-lg shadow ring-1 ring-black ring-opacity-5">
      <table className="min-w-full divide-y divide-gray-300">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Ticket #</th>
            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Arrival Time</th>
            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Service Time</th>
            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Wait Time</th>
            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Start Time</th>
            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">End Time</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {customers.map((c) => (
            <tr key={c.id} className="hover:bg-gray-50 transition-colors">
              <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                #{c.id}
              </td>
              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{c.arrivalTime}</td>
              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{c.transactionTime}</td>
              <td className="whitespace-nowrap px-3 py-4 text-sm font-medium text-amber-600">
                {c.queueWaitTime > 0 ? c.queueWaitTime : <span className="text-gray-400">0</span>}
              </td>
              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{c.windowOpenTime}</td>
              <td className="whitespace-nowrap px-3 py-4 text-sm font-medium text-blue-600">{c.serviceEndTime}</td>
            </tr>
          ))}
          {customers.length === 0 && (
            <tr>
              <td colSpan={6} className="py-8 text-center text-sm text-gray-500">
                No customers to display. Run the simulation first.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};
