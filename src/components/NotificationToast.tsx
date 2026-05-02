interface NotificationToastProps {
  toast: {
    type: string;
    message: string;
  } | null;
  onClose: () => void;
}

export default function NotificationToast({ toast, onClose }: NotificationToastProps) {
  if (!toast) return null;
  return (
    <div className="toast-wrapper" role="status" aria-live="polite" onClick={onClose}>
      <div className="toast">
        <div className="toast-type">{toast.type === "reply" ? "Reply" : "Query"}</div>
        <div className="toast-message">{toast.message}</div>
      </div>
    </div>
  );
}
