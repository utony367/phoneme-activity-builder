export default function StatusMessage({ status }) {
  if (!status?.message) return null;

  return (
    <p
      className={`status-message status-message-${status.type || "info"}`}
      role={status.type === "error" ? "alert" : "status"}
    >
      {status.message}
    </p>
  );
}
