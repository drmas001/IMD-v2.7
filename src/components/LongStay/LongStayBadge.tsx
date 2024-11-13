import React from 'react';
import { Clock } from 'lucide-react';
import { calculateStayDuration } from '../../utils/stayCalculator';

interface LongStayBadgeProps {
  admissionDate: string;
  showDuration?: boolean;
}

const LongStayBadge: React.FC<LongStayBadgeProps> = ({ admissionDate, showDuration = false }) => {
  const stayDuration = calculateStayDuration(admissionDate);

  return (
    <div className="inline-flex items-center space-x-1">
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
        <Clock className="h-3 w-3 mr-1" />
        Long Stay
        {showDuration && ` (${stayDuration} days)`}
      </span>
    </div>
  );
};

export default LongStayBadge;