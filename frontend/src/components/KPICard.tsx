interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    value: number;
    direction: 'up' | 'down' | 'neutral';
  };
  icon?: string;
  color?: 'primary' | 'success' | 'warning' | 'danger' | 'info';
  loading?: boolean;
  size?: 'small' | 'medium' | 'large';
}

const KPICard = ({
  title,
  value,
  subtitle,
  trend,
  icon,
  color = 'primary',
  loading = false,
  size = 'small'
}: KPICardProps) => {
  
  const getColorClasses = () => {
    const baseClasses = {
      primary: {
        bg: 'linear-gradient(135deg, #93C5FD, #ffffff)',
        lightBg: '#EFF6FF',
        text: '#1D4ED8',
        border: '#BFDBFE'
      },
      success: {
        bg: 'linear-gradient(135deg, #6EE7B7, #ffffff)',
        lightBg: '#ECFDF5',
        text: '#065F46',
        border: '#A7F3D0'
      },
      warning: {
        bg: 'linear-gradient(135deg, #FCD34D, #ffffff)',
        lightBg: '#FFFBEB',
        text: '#92400E',
        border: '#FDE68A'
      },
      danger: {
        bg: 'linear-gradient(135deg, #FCA5A5, #ffffff)',
        lightBg: '#FEF2F2',
        text: '#991B1B',
        border: '#FECACA'
      },
      info: {
        bg: 'linear-gradient(135deg, white, #f1e1b3)',
        lightBg: '#EDE9FE',
        text: 'black',
        borderColor: '#0d0d8a90'
      }
    };
    
    return baseClasses[color];
  };

  const getSizeClasses = () => {
    const baseClasses = {
      small: {
        card: 'kpi-card-small',
        value: 'kpi-value-small',
        title: 'kpi-title-small'
      },
      medium: {
        card: 'kpi-card-medium',
        value: 'kpi-value-medium',
        title: 'kpi-title-medium'
      },
      large: {
        card: 'kpi-card-large',
        value: 'kpi-value-large',
        title: 'kpi-title-large'
      }
    };
    
    return baseClasses[size];
  };

  const colors = getColorClasses();
  const sizes = getSizeClasses();

  const getTrendIcon = () => {
    if (!trend) return null;
    
    if (trend.direction === 'up') {
      return '📈';
    } else if (trend.direction === 'down') {
      return '📉';
    } else {
      return '➡️';
    }
  };

  const getTrendColor = () => {
    if (!trend) return colors.text;
    
    if (trend.direction === 'up') {
      return colors.text;
    } else if (trend.direction === 'down') {
      return colors.text;
    } else {
      return colors.text;
    }
  };

  if (loading) {
    return (
      <div className={`kpi-card ${sizes.card} kpi-loading`}>
        <div className="kpi-skeleton">
          <div className="skeleton-icon" />
          <div className="skeleton-content">
            <div className="skeleton-title" />
            <div className="skeleton-value" />
            {subtitle && <div className="skeleton-subtitle" />}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`kpi-card ${sizes.card}`}>
      <style>{`
        .kpi-card {
          borderColor: #000;
          background: ${colors.bg};
          border-radius: 18px;
          padding: 24px;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
          position: relative;
          overflow: hidden;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        
        .kpi-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 32px rgba(0, 0, 0, 0.12);
        }
        
        .kpi-card::before {
          content: '';
          position: absolute;
          top: 0;
          right: 0;
          width: 80px;
          height: 80px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 50%;
          transform: translate(20px, -20px);
        }
        
        .kpi-card-small {
          padding: 16px;
          min-height: 120px;
        }
        
        .kpi-card-medium {
          padding: 24px;
          min-height: 160px;
        }
        
        .kpi-card-large {
          padding: 32px;
          min-height: 200px;
        }
        
        .kpi-content {
          position: relative;
          z-index: 2;
          color: ${colors.text};
        }
        
        .kpi-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 16px;
        }
        
        .kpi-title {
          font-size: 14px;
          font-weight: 600;
          opacity: 0.9;
          margin: 0;
          line-height: 1.2;
        }
        
        .kpi-title-small {
          font-size: 12px;
        }
        
        .kpi-title-medium {
          font-size: 14px;
        }
        
        .kpi-title-large {
          font-size: 16px;
        }
        
        .kpi-icon {
          font-size: 24px;
          opacity: 0.8;
        }
        
        .kpi-value {
          font-size: 32px;
          font-weight: 800;
          margin: 0 0 8px 0;
          line-height: 1;
        }
        
        .kpi-value-small {
          font-size: 24px;
        }
        
        .kpi-value-medium {
          font-size: 32px;
        }
        
        .kpi-value-large {
          font-size: 40px;
        }
        
        .kpi-subtitle {
          font-size: 12px;
          opacity: 0.8;
          margin: 0;
          line-height: 1.2;
        }
        
        .kpi-trend {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-top: 8px;
        }
        
        .kpi-trend-icon {
          font-size: 14px;
        }
        
        .kpi-trend-value {
          font-size: 12px;
          font-weight: 600;
        }
        
        .kpi-loading {
          background: #f9fafb;
          border: 1px solid #e5e7eb;
        }
        
        .kpi-skeleton {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        
        .skeleton-icon {
          width: 40px;
          height: 40px;
          background: #e5e7eb;
          border-radius: 8px;
          animation: pulse 2s infinite;
        }
        
        .skeleton-content {
          flex: 1;
        }
        
        .skeleton-title {
          width: 60%;
          height: 12px;
          background: #e5e7eb;
          border-radius: 4px;
          margin-bottom: 12px;
          animation: pulse 2s infinite;
        }
        
        .skeleton-value {
          width: 40%;
          height: 24px;
          background: #e5e7eb;
          border-radius: 4px;
          margin-bottom: 8px;
          animation: pulse 2s infinite;
        }
        
        .skeleton-subtitle {
          width: 50%;
          height: 10px;
          background: #e5e7eb;
          border-radius: 4px;
          animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        
        @media (max-width: 768px) {
          .kpi-card {
            padding: 16px;
            min-height: 140px;
          }
          
          .kpi-value {
            font-size: 24px;
          }
          
          .kpi-title {
            font-size: 12px;
          }
        }
      `}</style>

      <div className="kpi-content">
        <div className="kpi-header">
          <h3 className={`kpi-title ${sizes.title}`}>{title}</h3>
          {icon && <div className="kpi-icon">{icon}</div>}
        </div>
        
        <div className={`kpi-value ${sizes.value}`}>
          {value}
        </div>
        
        {subtitle && (
          <div className="kpi-subtitle">{subtitle}</div>
        )}
        
        {trend && (
          <div className="kpi-trend">
            <span className="kpi-trend-icon">{getTrendIcon()}</span>
            <span 
              className="kpi-trend-value" 
              style={{ color: getTrendColor() }}
            >
              {trend.value > 0 ? '+' : ''}{trend.value}%
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default KPICard;