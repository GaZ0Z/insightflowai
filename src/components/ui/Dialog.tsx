import React, { createContext, useContext, useState, useEffect } from 'react';

interface DialogContextProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const DialogContext = createContext<DialogContextProps | undefined>(undefined);

export interface DialogProps {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const Dialog = ({ children, open: controlledOpen, onOpenChange }: DialogProps) => {
  const [localOpen, setLocalOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : localOpen;

  const setOpen = (newOpen: boolean) => {
    if (!isControlled) {
      setLocalOpen(newOpen);
    }
    if (onOpenChange) {
      onOpenChange(newOpen);
    }
  };

  return (
    <DialogContext.Provider value={{ open, setOpen }}>
      {children}
    </DialogContext.Provider>
  );
};

export const DialogTrigger = ({ children }: { children: React.ReactElement }) => {
  const context = useContext(DialogContext);
  if (!context) throw new Error("DialogTrigger must be used within a Dialog");

  return React.cloneElement(children, {
    onClick: (e: React.MouseEvent) => {
      const childProps = children.props as any;
      if (childProps && typeof childProps.onClick === 'function') {
        childProps.onClick(e);
      }
      context.setOpen(true);
    },
  } as any);
};

export const DialogContent = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => {
  const context = useContext(DialogContext);
  if (!context) throw new Error("DialogContent must be used within a Dialog");

  // Prevent scroll when open
  useEffect(() => {
    if (context.open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [context.open]);

  if (!context.open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity duration-300"
        onClick={() => context.setOpen(false)}
      />
      {/* Container */}
      <div className={`relative z-10 w-full max-w-lg rounded-large border border-slate-800 bg-slate-900 p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200 ${className}`}>
        {children}
        {/* Close Button */}
        <button
          onClick={() => context.setOpen(false)}
          className="absolute right-4 top-4 rounded-md text-slate-400 hover:text-slate-100 focus:outline-none transition-colors"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export const DialogHeader = ({ className = '', ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={`flex flex-col space-y-1.5 text-left mb-4 ${className}`} {...props} />
);

export const DialogTitle = ({ className = '', ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h2 className={`text-lg font-semibold leading-none tracking-tight text-white ${className}`} {...props} />
);

export const DialogDescription = ({ className = '', ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
  <p className={`text-sm text-slate-400 ${className}`} {...props} />
);

export const DialogFooter = ({ className = '', ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={`flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 border-t border-slate-800/50 pt-4 mt-6 ${className}`} {...props} />
);

export const DialogClose = ({ children }: { children: React.ReactElement }) => {
  const context = useContext(DialogContext);
  if (!context) throw new Error("DialogClose must be used within a Dialog");

  return React.cloneElement(children, {
    onClick: (e: React.MouseEvent) => {
      const childProps = children.props as any;
      if (childProps && typeof childProps.onClick === 'function') {
        childProps.onClick(e);
      }
      context.setOpen(false);
    },
  } as any);
};
