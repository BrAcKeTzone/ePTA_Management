const StatsCard = ({
  title,
  value,
  icon,
  trend,
  trendUp = true,
  className = "",
  onClick,
}) => {
  const cardClasses = `
    bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200
    ${onClick ? "cursor-pointer" : ""}
    ${className}
  `;

  return (
    <div className={cardClasses} onClick={onClick}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {trend && (
            <div
              className={`flex items-center mt-2 text-sm ${
                trendUp ? "text-green-600" : "text-red-600"
              }`}
            >
              <span className="mr-1">{trendUp ? "↗️" : "↘️"}</span>
              <span>{trend}</span>
            </div>
          )}
        </div>
        {icon && (
          <div className="flex-shrink-0">
            <span className="text-3xl">{icon}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export { StatsCard };
