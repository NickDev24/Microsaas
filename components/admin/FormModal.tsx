'use client';

import { ReactNode } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';

interface FormModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  onSubmit: (e: React.FormEvent) => void;
  isLoading?: boolean;
  submitLabel?: string;
}

export function FormModal({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  onSubmit, 
  isLoading,
  submitLabel = 'Guardar Cambios' 
}: FormModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      footer={
        <div className="flex gap-3">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button type="submit" form="modal-form" isLoading={isLoading}>
            {submitLabel}
          </Button>
        </div>
      }
    >
      <form id="modal-form" onSubmit={onSubmit} className="space-y-4">
        {children}
      </form>
    </Modal>
  );
}
