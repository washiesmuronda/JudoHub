function Competition({ events = [], tournaments = [] }) {
  return (
    <div className="min-h-screen py-10 sm:py-16 bg-gray-50">
      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-left">
        <h1 className="text-3xl sm:text-4xl font-black text-gray-900 uppercase tracking-wide mb-3">Competition</h1>
        <p className="text-lg sm:text-xl text-gray-600 font-medium mb-10">
          Competition management and event operations for Judo Association of Zimbabwe.
        </p>
        
        <div className="quick-access-grid grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="access-tile bg-white rounded-lg shadow-md p-4 sm:p-6 text-center flex flex-col items-center justify-center hover:shadow-lg transition-shadow duration-200">
            <span className="tile-icon text-4xl sm:text-5xl mb-2">📝</span><span className="text-base sm:text-lg font-semibold text-gray-700">Competition Entries</span></div>
          <div className="access-tile bg-white rounded-lg shadow-md p-4 sm:p-6 text-center flex flex-col items-center justify-center hover:shadow-lg transition-shadow duration-200">
            <span className="tile-icon text-4xl sm:text-5xl mb-2">📊</span><span className="text-base sm:text-lg font-semibold text-gray-700">Draws</span></div>
          <div className="access-tile bg-white rounded-lg shadow-md p-4 sm:p-6 text-center flex flex-col items-center justify-center hover:shadow-lg transition-shadow duration-200">
            <span className="tile-icon text-4xl sm:text-5xl mb-2">⚖️</span><span className="text-base sm:text-lg font-semibold text-gray-700">Weigh-In</span></div>
          <div className="access-tile bg-white rounded-lg shadow-md p-4 sm:p-6 text-center flex flex-col items-center justify-center hover:shadow-lg transition-shadow duration-200">
            <span className="tile-icon text-4xl sm:text-5xl mb-2">🏅</span><span className="text-base sm:text-lg font-semibold text-gray-700">Results</span></div>
          <div className="access-tile bg-white rounded-lg shadow-md p-4 sm:p-6 text-center flex flex-col items-center justify-center hover:shadow-lg transition-shadow duration-200">
            <span className="tile-icon text-4xl sm:text-5xl mb-2">🥇</span><span className="text-base sm:text-lg font-semibold text-gray-700">Medal Table</span></div>
          <div className="access-tile bg-white rounded-lg shadow-md p-4 sm:p-6 text-center flex flex-col items-center justify-center hover:shadow-lg transition-shadow duration-200">
            <span className="tile-icon text-4xl sm:text-5xl mb-2">👨‍⚖️</span><span className="text-base sm:text-lg font-semibold text-gray-700">Officials</span></div>
          <div className="access-tile bg-white rounded-lg shadow-md p-4 sm:p-6 text-center flex flex-col items-center justify-center hover:shadow-lg transition-shadow duration-200">
            <span className="tile-icon text-4xl sm:text-5xl mb-2">📑</span><span className="text-base sm:text-lg font-semibold text-gray-700">Reports</span></div>
        </div>
      </div>
    </div>
  );
}

export default Competition;