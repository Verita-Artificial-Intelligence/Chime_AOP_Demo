import React from 'react';

interface Column {
  key: string;
  label: string;
  render?: (row: any) => React.ReactNode;
}

interface DataTableProps {
  columns: Column[];
  data: any[];
  className?: string;
}

const DataTable: React.FC<DataTableProps> = ({ columns, data, className = '' }) => (
  <div className={`overflow-x-auto ${className}`}>
    <table className="w-full border-collapse">
      <thead>
        <tr className="bg-gray-800">
          {columns.map(col => (
            <th key={col.key} className="border border-gray-700 p-2 text-left">{col.label}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row, idx) => (
          <tr key={idx} className="bg-gray-900 hover:bg-gray-800">
            {columns.map(col => (
              <td key={col.key} className="border border-gray-700 p-2">
                {col.render ? col.render(row) : row[col.key]}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default DataTable; 