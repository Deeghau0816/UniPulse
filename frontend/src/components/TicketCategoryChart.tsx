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
  color = '#FCA5A5'; // pale red for highest
} else if (rank === 1) {
  color = '#FCD34D'; // pale yellow for second highest
} else if (rank === 2) {
  color = '#6EE7B7'; // pale green for third highest
} else if (rank === 3) {
  color = '#93C5FD'; // pale blue for fourth
} else {
  color = '#C4B5FD'; // pale purple for others
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

    const radius = 80;
    const centerX = 100;
    const centerY = 100;
    let currentAngle = -90; // Start from top

    return (
      <svg width="200" height="200" viewBox="0 0 200 200">
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

  
  const renderBarChart = () => {
    const chartData = getChartData();
    if (chartData.length === 0) return null;

    const maxCount = Math.max(...chartData.map(item => item.count));
    const barWidth = 25;
    const barSpacing = 50;
    const chartHeight = 120;
    const chartWidth = chartData.length * (barWidth + barSpacing) + barSpacing;

    return (
      <svg width={chartWidth} height={chartHeight + 40} viewBox={`0 0 ${chartWidth} ${chartHeight + 40}`}>
        {chartData.map((item, index) => {
          const barHeight = (item.count / maxCount) * chartHeight;
          const x = barSpacing + index * (barWidth + barSpacing);
          const y = chartHeight - barHeight + 20;

          return (
            <g key={index}>
              {/* Bar */}
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                fill={item.color}
                className="hover:opacity-80 transition-opacity cursor-pointer"
                rx="4"
              />
              
              {/* Count label on top of bar */}
              <text
                x={x + barWidth / 2}
                y={y - 5}
                fill="#374151"
                fontSize="12"
                fontWeight="bold"
                textAnchor="middle"
              >
                {item.count}
              </text>
              
              {/* Category label below bar */}
              <text
                x={x + barWidth / 2}
                y={chartHeight + 35}
                fill="#6B7280"
                fontSize="11"
                textAnchor="middle"
              >
                {item.category.length > 8 ? item.category.substring(0, 8) + '...' : item.category.replace('_', ' ')}
              </text>
            </g>
          );
        })}
        
        {/* Y-axis line */}
        <line
          x1={barSpacing / 2}
          y1={20}
          x2={barSpacing / 2}
          y2={chartHeight + 20}
          stroke="#E5E7EB"
          strokeWidth="2"
        />
        
        {/* X-axis line */}
        <line
          x1={barSpacing / 2}
          y1={chartHeight + 20}
          x2={chartWidth - barSpacing / 2}
          y2={chartHeight + 20}
          stroke="#E5E7EB"
          strokeWidth="2"
        />
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
      <div className={`w-3/4 mx-auto bg-white rounded-lg shadow-md p-4 ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Left Column: Pie Chart Placeholder */}
            <div className="flex-1">
              <div className="flex items-center space-x-4">
                <div className="w-32 h-32 bg-gray-200 rounded-full"></div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-20"></div>
                  <div className="h-3 bg-gray-200 rounded w-16"></div>
                  <div className="h-3 bg-gray-200 rounded w-24"></div>
                </div>
              </div>
            </div>
            {/* Right Column: Bar Chart Placeholder */}
            <div className="flex-1">
              <div className="h-24 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`w-3/4 mx-auto bg-white rounded-lg shadow-md p-4 ${className}`}>
        <h3 className="text-base font-semibold text-gray-800 mb-4">Ticket Categories</h3>
        <div className="text-red-500 text-sm">{error}</div>
      </div>
    );
  }

  const chartData = getChartData();
  
  return (
    <div className={`w-3/4 mx-auto bg-white rounded-lg shadow-md p-4 ${className}`}>
      <h3 className="text-base font-semibold text-gray-800 mb-4">Ticket Categories Distribution</h3>
      
      {chartData.length === 0 ? (
        <div className="text-gray-500 text-center py-8">
          No ticket data available
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Column: Pie Chart */}
          <div className="flex-1">
            <div className="flex items-center justify-center space-x-8">
              <div className="flex-shrink-0">
                <h4 className="text-sm font-medium text-gray-600 mb-3 text-center">Pie Chart</h4>
                {renderPieChart()}
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-medium text-gray-600 mb-3">Legend</h4>
                {renderLegend()}
              </div>
            </div>
          </div>
          
          {/* Right Column: Bar Chart */}
          <div className="flex-1">
            <h4 className="text-sm font-medium text-gray-600 mb-4 text-center">Bar Chart</h4>
            <div className="flex justify-center overflow-x-auto">
              {renderBarChart()}
            </div>
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
