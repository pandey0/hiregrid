import { toast as sonnerToast } from "sonner";

/**
 * ARCHITECTURAL TOAST SYSTEM
 * Standardized, icon-free notifications for HireGrid.
 */

type ToastOptions = {
  description?: string;
  traceId?: string;
};

export const toast = {
  success: (message: string, options: ToastOptions = {}) => {
    sonnerToast.custom((t) => (
      <div className="arch-card px-6 py-4 bg-app-card border-emerald-500/30 flex flex-col gap-1 min-w-[320px]">
        <div className="flex items-center justify-between gap-4">
          <span className="font-mono text-[10px] font-black bg-emerald-500 text-white px-2 py-0.5 rounded uppercase tracking-widest shrink-0">
            [ SUCCESS ]
          </span>
          {options.traceId && (
            <span className="font-mono text-[9px] text-app-text-sub/40 font-bold uppercase tracking-tighter">
              ID // {options.traceId}
            </span>
          )}
        </div>
        <p className="text-[13px] font-bold text-app-text-main mt-1">{message}</p>
        {options.description && (
          <p className="text-[11px] text-app-text-sub font-medium leading-tight">{options.description}</p>
        )}
      </div>
    ), { duration: 4000 });
  },

  error: (message: string, options: ToastOptions = {}) => {
    sonnerToast.custom((t) => (
      <div className="arch-card px-6 py-4 bg-app-card border-rose-500/30 flex flex-col gap-1 min-w-[320px]">
        <div className="flex items-center justify-between gap-4">
          <span className="font-mono text-[10px] font-black bg-rose-600 text-white px-2 py-0.5 rounded uppercase tracking-widest shrink-0">
            [ FAILED ]
          </span>
          {options.traceId && (
            <span className="font-mono text-[9px] text-app-text-sub/40 font-bold uppercase tracking-tighter">
              ID // {options.traceId}
            </span>
          )}
        </div>
        <p className="text-[13px] font-bold text-app-text-main mt-1">{message}</p>
        {options.description && (
          <p className="text-[11px] text-app-text-sub font-medium leading-tight">{options.description}</p>
        )}
      </div>
    ), { duration: 6000 });
  },

  info: (message: string, options: ToastOptions = {}) => {
    sonnerToast.custom((t) => (
      <div className="arch-card px-6 py-4 bg-app-card border-app-accent/30 flex flex-col gap-1 min-w-[320px]">
        <div className="flex items-center justify-between gap-4">
          <span className="font-mono text-[10px] font-black bg-app-accent text-white px-2 py-0.5 rounded uppercase tracking-widest shrink-0">
            [ NOTIFY ]
          </span>
          {options.traceId && (
            <span className="font-mono text-[9px] text-app-text-sub/40 font-bold uppercase tracking-tighter">
              ID // {options.traceId}
            </span>
          )}
        </div>
        <p className="text-[13px] font-bold text-app-text-main mt-1">{message}</p>
        {options.description && (
          <p className="text-[11px] text-app-text-sub font-medium leading-tight">{options.description}</p>
        )}
      </div>
    ), { duration: 4000 });
  }
};
