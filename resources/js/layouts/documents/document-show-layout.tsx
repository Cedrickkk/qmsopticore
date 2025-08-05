import React from 'react';

export default function DocumentShowLayout({ children }: { children: React.ReactNode }) {
  const [left, right] = React.Children.toArray(children);
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto max-w-6xl py-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="md:col-span-2">{left}</div>
          <div>{right}</div>
        </div>
      </div>
    </div>
  );
}
