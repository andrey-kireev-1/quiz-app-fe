export function ErrorNotification({ message }) {
  return (
    <div className="fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded shadow-lg">
      {message}
    </div>
  );
}