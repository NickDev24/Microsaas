'use client';

import { useCallback, useEffect, useState } from 'react';
import { DataTable } from '@/components/admin/DataTable';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/components/ui/Toast';
import type { Invoice } from '@/types';

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { addToast } = useToast();

  const fetchInvoices = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/invoices');
      const data = await res.json();
      setInvoices(data);
    } catch { addToast('Error', 'error'); }
    finally { setIsLoading(false); }
  }, [addToast]);

  useEffect(() => { fetchInvoices(); }, [fetchInvoices]);

  const columns = [
    { header: 'Nro Factura', accessor: 'invoice_number' },
    { header: 'Cliente', accessor: 'customer_name' },
    { header: 'Emisión', accessor: (row: Invoice) => new Date(row.issued_at ?? row.created_at).toLocaleDateString() },
    { header: 'Subtotal', accessor: (row: Invoice) => `$${row.subtotal.toLocaleString()}` },
    { header: 'Impuestos (21%)', accessor: (row: Invoice) => `$${row.tax_amount.toLocaleString()}` },
    { header: 'Total', accessor: (row: Invoice) => <span className="font-bold">${row.total.toLocaleString()}</span> },
    { 
      header: 'Estado', 
      accessor: (row: Invoice) => (
        <Badge variant={row.status === 'emitida' ? 'success' : 'default'}>
          {row.status.toUpperCase()}
        </Badge>
      ) 
    },
    {
      header: 'Acciones',
      accessor: () => (
        <Button variant="ghost" size="sm" onClick={() => window.print()}>Imprimir</Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Facturación</h1>
          <p className="text-muted text-sm">Historial de comprobantes emitidos</p>
        </div>
      </div>

      <DataTable columns={columns} data={invoices} isLoading={isLoading} />
    </div>
  );
}
