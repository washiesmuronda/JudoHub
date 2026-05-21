function Events({ events = [] }) {
  return (
    <div className="min-h-screen py-10 sm:py-16 bg-gray-50">
      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl sm:text-4xl font-black text-gray-900 uppercase tracking-wide mb-3 text-center">Events</h1>
        <p className="text-lg sm:text-xl text-gray-600 font-medium mb-10 text-center">Upcoming and past events of the Judo Association of Zimbabwe.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {events.length > 0 ? (
            events.map(event => (
              <div key={event.id} className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                <h2 className="text-xl font-bold text-gray-800 mb-2">{event.title}</h2>
                <p className="text-gray-600 mb-1"><strong>Location:</strong> {event.loc}</p>
                <p className="text-gray-600 mb-1"><strong>Date:</strong> {new Date(event.date).toLocaleDateString()}</p>
                <p className="text-gray-600"><strong>Status:</strong> <span className={`font-semibold ${event.status === 'Upcoming' ? 'text-blue-600' : 'text-green-600'}`}>{event.status}</span></p>
                {/* Add more event details as needed */}
              </div>
            ))
          ) : (
            <div className="md:col-span-2 bg-white rounded-lg shadow-md p-8 text-center text-gray-500">
              <p className="text-lg">No events found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Events;