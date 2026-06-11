const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
      <div className="bg-white rounded-2xl shadow-xl p-10 text-center max-w-md w-full">
        <h1 className="text-7xl font-extrabold text-red-600">404</h1>

        <p className="mt-4 text-2xl font-semibold text-gray-800">
          Oops! Page Not Found
        </p>

        <p className="mt-2 text-gray-500">
          The page you're looking for doesn't exist or has been removed.
        </p>

        <a
          href="/"
          className="inline-block mt-6 px-5 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all"
        >
          Back to Home
        </a>
      </div>
    </div>
  );
};

export default NotFound;