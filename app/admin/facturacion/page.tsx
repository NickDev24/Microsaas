'use client';

import { useEffect, useState } from 'react';
import { DataTable } from '@/components/admin/DataTable';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/components/ui/Toast';

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { addToast } = useToast();

  const fetchInvoices = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/invoices');
      const data = await res.json();
      setInvoices(data);
    } catch (err) { addToast('Error', 'error'); } 
    finally { setIsLoading(false); }
  };

  useEffect(() => { fetchInvoices(); }, []);

  const columns = [
    { header: 'Nro Factura', accessor: 'invoice_number' },
    { header: 'Cliente', accessor: 'customer_name' },
    { header: 'Emisión', accessor: (row: any) => new Date(row.issued_at).toLocaleDateString() },
    { header: 'Subtotal', accessor: (row: any) => `$${row.subtotal.toLocaleString()}` },
    { header: 'Impuestos (21%)', accessor: (row: any) => `$${row.tax_amount.toLocaleString()}` },
    { header: 'Total', accessor: (row: any) => <span className="font-bold">${row.total.toLocaleString()}</span> },
    { 
      header: 'Estado', 
      accessor: (row: any) => (
        <Badge variant={row.status === 'emitida' ? 'success' : 'default'}>
          {row.status.toUpperCase()}
        </Badge>
      ) 
    },
    {
      header: 'Acciones',
      accessor: (row: any) => (
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
