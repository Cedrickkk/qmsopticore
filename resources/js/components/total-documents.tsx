import { FileText } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';

export default function TotalDocuments({ totalDocuments }: { totalDocuments: number | undefined }) {
  return (
    <Card className="col-span-2 rounded-xs transition duration-300 ease-linear hover:bg-gray-50 xl:col-span-1 dark:hover:bg-gray-800">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-2xl font-bold">
          <span>{totalDocuments}</span>
          <span>
            <FileText className="size-7" />
          </span>
        </CardTitle>
        <CardDescription>Total Documents</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-primary text-sm font-medium dark:text-[var(--primary-light)]">
          <span className="font-bold">+15%</span> from last month
        </p>
      </CardContent>
    </Card>
  );
}
