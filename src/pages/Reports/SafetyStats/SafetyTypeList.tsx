import React from 'react';
import { Shield } from 'lucide-react';

interface SafetyTypeData {
  type: string;
  count: number;
  color: string;
  description: string;
}

interface SafetyTypeListProps {
  data: SafetyTypeData[];
  total: number;
}

const SafetyTypeList: React.FC<SafetyTypeListProps> = ({ data, total }) => {
  const getColorClass = (type: string): string => {
    switch (type.toLowerCase()) {
      case 'emergency':
        return 'bg-red-100 text-red-800';
      case 'observation':
        return 'bg-yellow-100 text-yellow-800';
      case 'short stay':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const calculatePercentage = (count: number): number => {
    return Math.round((count / (total || 1)) * 100);
  };

  return (
    <div className="space-y-4">
      {data.map(({ type, count, color, description }) => (
        <div key={type} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-3">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: color }}
              aria-hidden="true"
            />
            <div>
              <span className="text-sm font-medium text-gray-900">{type}</span>
              <p className="text-xs text-gray-500">
                {calculatePercentage(count)}% of safety admissions
              </p>
              <p className="text-xs text-gray-500 mt-1">{description}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-900">{count}</span>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getColorClass(type)}`}>
              <Shield className="h-3 w-3 mr-1" />
              {type}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SafetyTypeList;