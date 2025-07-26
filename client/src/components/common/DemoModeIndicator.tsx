import React from 'react';
import { AlertCircle, Info } from 'lucide-react';
import { Card, CardContent } from '../ui/card';

interface DemoModeIndicatorProps {
  className?: string;
}

export const DemoModeIndicator: React.FC<DemoModeIndicatorProps> = ({ className = '' }) => {
  return (
    <Card className={`border-amber-200 bg-amber-50/50 dark:border-amber-700 dark:bg-amber-900/20 ${className}`}>
      <CardContent className="p-3">
        <div className="flex items-center gap-2 text-sm">
          <Info className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          <span className="text-amber-800 dark:text-amber-200 font-medium">
            Demo Mode:
          </span>
          <span className="text-amber-700 dark:text-amber-300">
            This is a demonstration. Data is simulated for testing purposes.
          </span>
        </div>
      </CardContent>
    </Card>
  );
};
