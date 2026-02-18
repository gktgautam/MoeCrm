export default function Demo() {
  return (
    <div className="min-h-screen">
      <main className="p-6">
        <div className="max-w-xl rounded-[--radius-lg] bg-surface border border-border shadow-[--shadow-md] p-6">
          <div className="text-muted">Tailwind tokens drive everything</div>

          {/* Buttons */}
          <div className="mt-4 flex gap-3">
            {/* Tailwind Button */}
            <button className="bg-primary text-primary-contrast px-4 py-2 rounded-[--radius-md] shadow-[--shadow-sm] hover:opacity-90 transition">
              Tailwind Button
            </button>

            {/* MUI Button - Tailwind Equivalent */}
            <button className="bg-blue-600 text-white px-4 py-2 rounded-[--radius-md] shadow-sm hover:bg-blue-700 transition">
              MUI Button
            </button>
          </div>

          {/* Card */}
          <div className="mt-6 border border-border bg-white rounded-[--radius-lg] shadow-sm p-4">
            <div className="space-y-3">
              {/* TextField Equivalent */}
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium">Segment name</label>
                <input
                  type="text"
                  className="
                    w-full px-3 py-2 border border-gray-300 rounded-[--radius-md]
                    focus:ring-2 focus:ring-primary focus:border-primary outline-none
                  "
                  placeholder=""
                />
              </div>

              {/* Outlined Button Equivalent */}
              <button className="
                border border-gray-400 text-gray-700 px-4 py-2 rounded-[--radius-md]
                hover:bg-gray-100 transition
              ">
                Save
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
