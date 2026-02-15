import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import api from '../utils/api';

interface SetupStatus {
  needsSetup: boolean;
  message: string;
}

export function SetupRoute({ children }: { children: React.ReactNode }) {
  const [setupStatus, setSetupStatus] = useState<SetupStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkSetupStatus();
  }, []);

  const checkSetupStatus = async () => {
    try {
      const response = await api.get('/setup/status');
      setSetupStatus(response.data.data);
    } catch (error) {
      console.error('Failed to check setup status:', error);
      // If we can't check status, assume setup is needed to be safe
      setSetupStatus({ needsSetup: true, message: 'Unable to check setup status' });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Checking system status...</p>
        </div>
      </div>
    );
  }

  // If setup is needed, redirect to setup page
  if (setupStatus?.needsSetup) {
    return <Navigate to="/setup" replace />;
  }

  // Otherwise, render the children
  return <>{children}</>;
}
