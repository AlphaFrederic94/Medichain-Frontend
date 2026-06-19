'use client'

import type { ReactNode } from 'react'
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'

export interface DataTableColumn<T> {
  /** Column header label */
  header: string
  /** Key to access the data value, or a render function */
  accessor: keyof T | ((row: T) => ReactNode)
  /** Optional custom class for header cells */
  headerClassName?: string
  /** Optional custom class for body cells */
  cellClassName?: string
}

export interface DataTableProps<T> {
  /** Column definitions */
  columns: DataTableColumn<T>[]
  /** Row data array */
  data: T[]
  /** Optional key accessor for rows. Defaults to index */
  rowKey?: keyof T | ((row: T, index: number) => string | number)
  /** Callback when a row is clicked */
  onRowClick?: (row: T, index: number) => void
  /** Maximum height before scrolling */
  maxHeight?: string
  /** Additional class names */
  className?: string
}

export function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  rowKey,
  onRowClick,
  maxHeight = 'max-h-96',
  className,
}: DataTableProps<T>) {
  const getRowKey = (row: T, index: number): string | number => {
    if (!rowKey) return index
    if (typeof rowKey === 'function') return rowKey(row, index)
    const val = row[rowKey]
    return typeof val === 'string' || typeof val === 'number'
      ? val
      : index
  }

  const getCellValue = (row: T, accessor: DataTableColumn<T>['accessor']) => {
    if (typeof accessor === 'function') return accessor(row)
    return row[accessor] as ReactNode
  }

  if (!data.length) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <p className="text-sm">No data available</p>
      </div>
    )
  }

  return (
    <div
      className={cn('rounded-lg border overflow-hidden', className)}
    >
      <div className={cn('overflow-y-auto custom-scrollbar', maxHeight)}>
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              {columns.map((col, i) => (
                <TableHead
                  key={i}
                  className={cn(
                    'text-xs font-semibold uppercase tracking-wider text-muted-foreground',
                    col.headerClassName
                  )}
                >
                  {col.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row, rowIndex) => (
              <TableRow
                key={getRowKey(row, rowIndex)}
                onClick={
                  onRowClick
                    ? () => onRowClick(row, rowIndex)
                    : undefined
                }
                className={cn(
                  'transition-colors',
                  rowIndex % 2 === 1 && 'bg-muted/20',
                  onRowClick && 'cursor-pointer'
                )}
              >
                {columns.map((col, colIndex) => (
                  <TableCell
                    key={colIndex}
                    className={cn('text-sm', col.cellClassName)}
                  >
                    {getCellValue(row, col.accessor)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
