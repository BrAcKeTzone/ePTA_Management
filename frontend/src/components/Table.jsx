import React from "react";

const Table = ({
  columns = [],
  data = [],
  className = "",
  onRowClick = null,
  loading = false,
  emptyMessage = "No data available",
  sortBy = null,
  sortOrder = "asc",
  onSort = null,
}) => {
  // Ensure data is always an array
  const safeData = Array.isArray(data) ? data : [];

  const getSortIcon = (column) => {
    if (!column.sortable || !onSort) return null;

    if (sortBy === column.key) {
      return sortOrder === "asc" ? (
        <svg
          className="w-4 h-4 ml-1"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 15l7-7 7 7"
          />
        </svg>
      ) : (
        <svg
          className="w-4 h-4 ml-1"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      );
    }

    return (
      <svg
        className="w-4 h-4 ml-1 opacity-50"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M8 9l4-4 4 4m0 6l-4 4-4-4"
        />
      </svg>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (safeData.length === 0) {
    return <div className="text-center py-8 text-gray-500">{emptyMessage}</div>;
  }

  return (
    <div
      className={`overflow-x-auto shadow border-b border-gray-200 sm:rounded-lg ${className}`}
    >
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((column, index) => (
              <th
                key={index}
                scope="col"
                className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                  column.sortable && onSort
                    ? "cursor-pointer hover:bg-gray-100"
                    : ""
                }`}
                onClick={() => column.sortable && onSort && onSort(column.key)}
              >
                <div className="flex items-center">
                  {column.header}
                  {getSortIcon(column)}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {safeData.map((row, rowIndex) => (
            <tr
              key={rowIndex}
              className={`${
                onRowClick ? "cursor-pointer hover:bg-gray-50" : ""
              }`}
              onClick={() => onRowClick && onRowClick(row)}
            >
              {columns.map((column, columnIndex) => (
                <td
                  key={columnIndex}
                  className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                >
                  {column.render
                    ? column.render(row)
                    : column.cell
                    ? column.cell(row)
                    : row[column.accessor || column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
