function Login() {
  return (
    <div className="min-h-screen py-10 sm:py-16 bg-gray-50 flex items-center justify-center">
      <div className="w-full max-w-md mx-auto px-4 sm:px-6 lg:px-8 bg-white rounded-lg shadow-xl p-8 sm:p-10 text-center">
        <h1 className="text-3xl sm:text-4xl font-black text-gray-900 uppercase tracking-wide mb-6">Login</h1>
        <p className="text-lg text-gray-600 mb-8">Access your JudoHub account.</p>
        
        {/* Placeholder for a login form */}
        <div className="bg-gray-100 p-6 rounded-md text-gray-700">
          <p>Login functionality will be implemented here.</p>
          <input type="text" placeholder="Email" className="form-input mt-4" />
          <input type="password" placeholder="Password" className="form-input mt-4" />
          <button className="btn-premium btn-primary w-full mt-6">Log In</button>
        </div>
      </div>
    </div>
  );
}

export default Login;