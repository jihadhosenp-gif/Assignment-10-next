// src/app/unauthorized/page.jsx
export default function UnauthorizedPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-2xl font-bold text-red-500">Unauthorized</h1>
      <p className="text-gray-400 mt-2">আপনার এই page এ access নেই।</p>
      <a href="/" className="mt-4 text-blue-400 underline">Home এ ফিরে যান</a>
    </div>
  );
}