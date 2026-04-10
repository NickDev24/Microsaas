'use client';

import { ReactNode } from 'react';

export interface Column<T> {
  header: string;
  accessor: keyof T | string | ((item: T) => ReactNode);
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  onRowClick?: (item: T) => void;
  isLoading?: boolean;
  emptyMessage?: string;
}

export function DataTable<T extends { id: string | number }>({ 
  columns, 
  data, 
  onRowClick, 
  isLoading,
  emptyMessage = 'No se encontraron resultados'
}: DataTableProps<T>) {
  if (isLoading) {
    return (
      <div className="w-full h-64 flex items-center justify-center bg-surface rounded-xl border border-border">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-12 h-12 bg-surface-2 rounded-full" />
          <div className="h-4 w-32 bg-surface-2 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden bg-surface border border-border rounded-xl shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-2 border-b border-border">
              {columns.map((col, i) => (
                <th key={i} className={`px-6 py-4 text-xs font-semibold text-muted uppercase tracking-wider ${col.className || ''}`}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {data.length > 0 ? (
              data.map((item) => (
                <tr 
                  key={item.id} 
                  onClick={() => onRowClick?.(item)}
                  className={`group transition-colors ${onRowClick ? 'cursor-pointer hover:bg-surface-2' : ''}`}
                >
                  {columns.map((col, i) => (
                    <td key={i} className={`px-6 py-4 text-sm text-muted ${col.className || ''}`}>
                      {typeof col.accessor === 'function'
                        ? col.accessor(item)
                        : (typeof col.accessor === 'string'
                            ? ((item as Record<string, unknown>)[col.accessor] as ReactNode)
                            : (item[col.accessor] as ReactNode))}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="px-6 py-12 text-center text-muted-2 text-sm italic">
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
