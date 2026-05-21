function Tournaments({ tournaments = [] }) {
  return (
    <div className="min-h-screen py-10 sm:py-16 bg-gray-50">
      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl sm:text-4xl font-black text-gray-900 uppercase tracking-wide mb-3 text-center">Tournaments</h1>
        <p className="text-lg sm:text-xl text-gray-600 font-medium mb-10 text-center">Details on past and upcoming tournaments organized by JAZ.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {tournaments.length > 0 ? (
            tournaments.map(tournament => (
              <div key={tournament.id} className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                <h2 className="text-xl font-bold text-gray-800 mb-2">{tournament.name}</h2>
                <p className="text-gray-600 mb-1"><strong>Location:</strong> {tournament.location}</p>
                <p className="text-gray-600 mb-1"><strong>Date:</strong> {new Date(tournament.date).toLocaleDateString()}</p>
                <p className="text-gray-600"><strong>Status:</strong> <span className={`font-semibold ${tournament.status === 'Scheduled' ? 'text-blue-600' : 'text-green-600'}`}>{tournament.status}</span></p>
                {/* Add more tournament details as needed */}
              </div>
            ))
          ) : (
            <div className="md:col-span-2 bg-white rounded-lg shadow-md p-8 text-center text-gray-500">
              <p className="text-lg">No tournaments found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Tournaments;