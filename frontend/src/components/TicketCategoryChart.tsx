import React, { useEffect, useState } from 'react';
import { analyticsService, type TicketCategoryData } from '../services/analyticsService';

interface TicketCategoryChartProps {
  className?: string;
}

const TicketCategoryChart: React.FC<TicketCategoryChartProps> = ({ className = '' }) => {
  const [data, setData] = useState<TicketCategoryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const categoryData = await analyticsService.getTicketCategoriesAnalytics();
        setData(categoryData);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch ticket categories analytics:', err);
        setError('Failed to load ticket categories data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getChartData = () => {
    if (!data || !data.categoryCounts) return [];
    
    const total = Object.values(data.categoryCounts).reduce((sum, count) => sum + count, 0);
    
    // Convert to array and sort by count to determine colors
    const entries = Object.entries(data.categoryCounts);
    const sortedEntries = [...entries].sort((a, b) => b[1] - a[1]);
    
    return entries.map(([category, count], index) => {
      const rank = sortedEntries.findIndex(([cat]) => cat === category);
      let color;
      
      // Assign colors based on rank: highest gets red, then yellow, then green
      if (rank === 0) {
        color = '#EF4444'; // Red for highest
      } else if (rank === 1) {
        color = '#F59E0B'; // Yellow for second highest
      } else if (rank === 2) {
        color = '#10B981'; // Green for third highest
      } else if (rank === 3) {
        color = '#3B82F6'; // Blue for fourth
      } else {
        color = '#8B5CF6'; // Purple for others
      }
      
      return {
        category,
        count,
        percentage: total > 0 ? (count / total) * 100 : 0,
        color
      };
    });
  };

  const renderPieChart = () => {
    const chartData = getChartData();
    if (chartData.length === 0) return null;

    const radius = 120;
    const centerX = 150;
    const centerY = 150;
    let currentAngle = -90; // Start from top

    return (
      <svg width="300" height="300" viewBox="0 0 300 300">
        {chartData.map((item, index) => {
          const percentage = item.percentage;
          const angle = (percentage / 100) * 360;
          const endAngle = currentAngle + angle;
          
          const x1 = centerX + radius * Math.cos((currentAngle * Math.PI) / 180);
          const y1 = centerY + radius * Math.sin((currentAngle * Math.PI) / 180);
          const x2 = centerX + radius * Math.cos((endAngle * Math.PI) / 180);
          const y2 = centerY + radius * Math.sin((endAngle * Math.PI) / 180);
          
          const largeArcFlag = angle > 180 ? 1 : 0;
          
          const pathData = [
            `M ${centerX} ${centerY}`,
            `L ${x1} ${y1}`,
            `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
            'Z'
          ].join(' ');

          currentAngle = endAngle;

          return (
            <g key={index}>
              <path
                d={pathData}
                fill={item.color}
                stroke="white"
                strokeWidth="3"
                className="hover:opacity-80 transition-opacity cursor-pointer"
              />
              {percentage > 5 && (
                <text
                  x={centerX + (radius * 0.7) * Math.cos(((currentAngle - angle/2) * Math.PI) / 180)}
                  y={centerY + (radius * 0.7) * Math.sin(((currentAngle - angle/2) * Math.PI) / 180)}
                  fill="white"
                  fontSize="14"
                  fontWeight="bold"
                  textAnchor="middle"
                  dominantBaseline="middle"
                >
                  {`${Math.round(percentage)}%`}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    );
  };

  
  const renderLegend = () => {
    const chartData = getChartData();
    
    return (
      <div className="space-y-3">
        {chartData.map((item, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div 
                className="w-5 h-5 rounded"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-sm font-medium text-gray-700">
                {item.category.replace('_', ' ')}
              </span>
            </div>
            <div className="text-sm text-gray-600">
              <span className="font-semibold">{item.count}</span>
              <span className="text-gray-400 ml-1">
                ({Math.round(item.percentage)}%)
              </span>
            </div>
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className={`w-1/2 mx-auto bg-white rounded-lg shadow-md p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="flex items-center space-x-6">
            <div className="w-48 h-48 bg-gray-200 rounded-full"></div>
            <div className="space-y-2">
              <div className="h-3 bg-gray-200 rounded w-24"></div>
              <div className="h-3 bg-gray-200 rounded w-20"></div>
              <div className="h-3 bg-gray-200 rounded w-28"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`w-1/2 mx-auto bg-white rounded-lg shadow-md p-6 ${className}`}>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Ticket Categories</h3>
        <div className="text-red-500 text-sm">{error}</div>
      </div>
    );
  }

  const chartData = getChartData();
  
  return (
    <div className={`w-1/2 mx-auto bg-white rounded-lg shadow-md p-6 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-800 mb-6">Ticket Categories Distribution</h3>
      
      {chartData.length === 0 ? (
        <div className="text-gray-500 text-center py-8">
          No ticket data available
        </div>
      ) : (
        <div className="flex items-center justify-center space-x-8">
          <div className="flex-shrink-0">
            {renderPieChart()}
          </div>
          <div className="flex-1">
            {renderLegend()}
          </div>
        </div>
      )}
      
      {data && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            Period: {data.period}
          </p>
        </div>
      )}
    </div>
  );
};

export default TicketCategoryChart;
