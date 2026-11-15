import { createContext, useContext, useState, type ReactNode } from 'react';

import { ConfirmDialog, type DialogOptions } from '@/components/ConfirmDialog';

type ShowDialog = (options: DialogOptions) => Promise<boolean>;

type PendingDialog = {
  options: DialogOptions;
  resolve: (confirmed: boolean) => void;
};

const DialogContext = createContext<ShowDialog | null>(null);

export function DialogProvider({ children }: { children: ReactNode }) {
  const [pending, setPending] = useState<PendingDialog | null>(null);

  function showDialog(options: DialogOptions): Promise<boolean> {
    return new Promise((resolve) => {
      setPending((previous) => {
        previous?.resolve(false);
        return { options, resolve };
      });
    });
  }

  function handleResult(confirmed: boolean) {
    pending?.resolve(confirmed);
    setPending(null);
  }

  return (
    <DialogContext.Provider value={showDialog}>
      {children}
      <ConfirmDialog options={pending?.options ?? null} onResult={handleResult} />
    </DialogContext.Provider>
  );
}

export function useDialog(): ShowDialog {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error('useDialog must be used within DialogProvider');
  }
  return context;
}
