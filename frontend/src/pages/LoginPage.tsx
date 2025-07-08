import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { HiLockClosed, HiUser } from "react-icons/hi2";

export function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // Simulate authentication delay
    setTimeout(() => {
      // Simple validation - in production this would call an auth API
      if (username && password) {
        // Store authentication state
        localStorage.setItem("isAuthenticated", "true");
        localStorage.setItem("currentUser", username);
        
        // Redirect to home page
        navigate("/");
      } else {
        setError("Please enter both username and password");
      }
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-primaryLight via-brand-secondaryLight to-white">
      <div className="max-w-md w-full space-y-8 p-10 bg-white rounded-2xl shadow-xl border border-brand-borderLight">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-gradient-brand rounded-full flex items-center justify-center shadow-lg">
            <HiLockClosed className="h-8 w-8 text-white" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-brand-heading">
            Welcome to Verita AI
          </h2>
          <p className="mt-2 text-sm text-brand-muted">
            Sign in to access your workflow management platform
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-brand-danger/10 border border-brand-danger text-brand-danger px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <label htmlFor="username" className="sr-only">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <HiUser className="h-5 w-5 text-brand-muted" />
                </div>
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="appearance-none relative block w-full pl-10 pr-3 py-3 border border-brand-border placeholder-brand-muted text-brand-text bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary focus:z-10 sm:text-sm transition-colors"
                  placeholder="Username"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <HiLockClosed className="h-5 w-5 text-brand-muted" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none relative block w-full pl-10 pr-3 py-3 border border-brand-border placeholder-brand-muted text-brand-text bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary focus:z-10 sm:text-sm transition-colors"
                  placeholder="Password"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-brand-primary focus:ring-brand-primary border-brand-border rounded bg-white"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-brand-text">
                Remember me
              </label>
            </div>

            <div className="text-sm">
              <a href="#" className="font-medium text-brand-primary hover:text-brand-primaryDark transition-colors">
                Forgot your password?
              </a>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-brand hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02]"
            >
              {isLoading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </span>
              ) : (
                "Sign in"
              )}
            </button>
          </div>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-brand-borderLight"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-brand-muted">Secure authentication required</span>
              </div>
            </div>
          </div>
        </form>

        <div className="text-center text-xs text-brand-muted">
          <p>Your data is protected and accessible only to authorized users.</p>
          <p className="mt-1">Each user has their own secure workspace.</p>
        </div>
      </div>
    </div>
  );
}