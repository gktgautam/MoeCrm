import { isRouteErrorResponse, useRouteError } from "react-router-dom";
import { getApiErrorMessage, getApiRequestId } from "@/core/http/api-error";

export default function RouteError() {
  const err = useRouteError();

  // React Router thrown response (404/500 loaders etc.)
  if (isRouteErrorResponse(err)) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white shadow-md rounded-lg p-6 w-full max-w-lg">
          <h1 className="text-xl font-bold">Something went wrong</h1>
          <p className="text-gray-600 mt-1">
            {err.status} {err.statusText}
          </p>

          <div className="flex gap-3 mt-4">
            <button
              className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
              onClick={() => window.location.reload()}
            >
              Reload
            </button>
            <button
              className="px-4 py-2 rounded border border-gray-300 text-gray-700 hover:bg-gray-100"
              onClick={() => (window.location.href = "/")}
            >
              Go to dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  const message = getApiErrorMessage(err);
  const requestId = getApiRequestId(err);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white shadow-md rounded-lg p-6 w-full max-w-lg">
        <h1 className="text-xl font-bold">Unexpected error</h1>

        <p className="text-gray-600 mt-1">{message}</p>

        {requestId ? (
          <p className="text-gray-500 mt-1 text-xs">RequestId: {requestId}</p>
        ) : null}

        <div className="flex gap-3 mt-4">
          <button
            className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
            onClick={() => window.location.reload()}
          >
            Reload
          </button>

          <button
            className="px-4 py-2 rounded border border-gray-300 text-gray-700 hover:bg-gray-100"
            onClick={() => (window.location.href = "/")}
          >
            Go to dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
