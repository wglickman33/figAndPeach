import { IconClose } from "./ui/IconClose";
import "./ToastContainer.css";

type Toast = {
  id: string;
  message: string;
};

type ToastContainerProps = {
  toasts: Toast[];
  onDismiss: (id: string) => void;
};

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <div className="toast-container" role="region" aria-label="Notifications">
      {toasts.map((toast) => (
        <div key={toast.id} className="toast toast--success" role="status" aria-live="polite">
          <span className="toast__icon" aria-hidden="true">
            ✓
          </span>
          <p className="toast__message">{toast.message}</p>
          <button
            type="button"
            className="toast__close"
            onClick={() => onDismiss(toast.id)}
            aria-label="Dismiss notification"
          >
            <IconClose />
          </button>
        </div>
      ))}
    </div>
  );
}
