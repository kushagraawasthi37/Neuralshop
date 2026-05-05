export default function Toast({ msg, show }) {
  return (
    <div
      className={`toast${show ? " toast--visible" : ""}`}
      role="alert"
      aria-live="polite"
    >
      <div className="toast__dot" />
      <span className="toast__msg">{msg}</span>
    </div>
  );
}
