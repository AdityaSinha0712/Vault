export default function StatusMessage({ kind = 'info', title, children }) {
  return (
    <div className={`status status-${kind}`} role={kind === 'error' ? 'alert' : 'status'}>
      <p className="status-title">{title}</p>
      {children && <p className="status-detail">{children}</p>}
    </div>
  );
}
