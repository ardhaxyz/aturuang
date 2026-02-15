import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { api } from '../utils/api';
import { 
  Calendar, 
  CheckCircle, 
  Upload, 
  Users, 
  Building2, 
  ChevronRight, 
  ChevronLeft,
  Moon,
  Sun,
  AlertCircle,
  Download,
  FileSpreadsheet,
  Shield
} from 'lucide-react';

interface SetupStatus {
  needsSetup: boolean;
  message: string;
}

interface CsvResult {
  success: boolean;
  imported: number;
  errors: string[];
}

export function SetupPage() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [setupStatus, setSetupStatus] = useState<SetupStatus | null>(null);
  
  // Superadmin form state
  const [superadminData, setSuperadminData] = useState({
    username: '',
    password: '',
    confirmPassword: ''
  });
  const [superadminError, setSuperadminError] = useState('');
  const [superadminSuccess, setSuperadminSuccess] = useState(false);

  // CSV upload states
  const [orgCsvFile, setOrgCsvFile] = useState<File | null>(null);
  const [orgUploadResult, setOrgUploadResult] = useState<CsvResult | null>(null);
  const [orgUploading, setOrgUploading] = useState(false);

  const [userCsvFile, setUserCsvFile] = useState<File | null>(null);
  const [userUploadResult, setUserUploadResult] = useState<CsvResult | null>(null);
  const [userUploading, setUserUploading] = useState(false);

  useEffect(() => {
    checkSetupStatus();
  }, []);

  const checkSetupStatus = async () => {
    try {
      const response = await api.get('/setup/status');
      setSetupStatus(response.data.data);
      if (!response.data.data.needsSetup) {
        navigate('/login');
      }
    } catch (error) {
      console.error('Failed to check setup status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateSuperadmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuperadminError('');

    if (superadminData.password !== superadminData.confirmPassword) {
      setSuperadminError('Passwords do not match');
      return;
    }

    if (superadminData.password.length < 6) {
      setSuperadminError('Password must be at least 6 characters');
      return;
    }

    try {
      await api.post('/setup', {
        username: superadminData.username,
        password: superadminData.password
      });
      setSuperadminSuccess(true);
      setTimeout(() => setCurrentStep(1), 1500);
    } catch (err: any) {
      setSuperadminError(err.response?.data?.message || 'Failed to create superadmin');
    }
  };

  const handleOrgCsvUpload = async () => {
    if (!orgCsvFile) return;

    setOrgUploading(true);
    setOrgUploadResult(null);

    const formData = new FormData();
    formData.append('file', orgCsvFile);

    try {
      const response = await api.post('/setup/import/organizations', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setOrgUploadResult(response.data.data);
    } catch (err: any) {
      setOrgUploadResult({
        success: false,
        imported: 0,
        errors: [err.response?.data?.message || 'Upload failed']
      });
    } finally {
      setOrgUploading(false);
    }
  };

  const handleUserCsvUpload = async () => {
    if (!userCsvFile) return;

    setUserUploading(true);
    setUserUploadResult(null);

    const formData = new FormData();
    formData.append('file', userCsvFile);

    try {
      const response = await api.post('/setup/import/users', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setUserUploadResult(response.data.data);
    } catch (err: any) {
      setUserUploadResult({
        success: false,
        imported: 0,
        errors: [err.response?.data?.message || 'Upload failed']
      });
    } finally {
      setUserUploading(false);
    }
  };

  const downloadOrgTemplate = () => {
    const csvContent = `name,description
IT Department,Information Technology Department
HR Department,Human Resources Department
Finance Department,Finance and Accounting Department`;
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'organizations_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const downloadUserTemplate = () => {
    const csvContent = `username,email,password,role,organizationName
john.doe,john@example.com,password123,user,IT Department
jane.admin,jane@example.com,password123,org_admin,HR Department
super.user,super@example.com,password123,superadmin,`;
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'users_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
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

  const steps = [
    { title: 'Create Superadmin', icon: Shield },
    { title: 'Import Organizations', icon: Building2 },
    { title: 'Import Users', icon: Users },
    { title: 'Complete', icon: CheckCircle }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
      {/* Theme Toggle */}
      <div className="absolute top-4 right-4">
        <button
          onClick={toggleTheme}
          className="p-2 rounded-md text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
        >
          {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
        </button>
      </div>

      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Calendar className="h-16 w-16 text-primary-600 dark:text-primary-400" />
          </div>
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white">
            Welcome to Aturuang
          </h1>
          <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
            Meeting Room Booking System - Initial Setup
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={index} className="flex items-center">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                    index <= currentStep 
                      ? 'bg-primary-600 text-white' 
                      : 'bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-400'
                  }`}>
                    <Icon size={20} />
                  </div>
                  <span className={`ml-2 text-sm font-medium hidden sm:block ${
                    index <= currentStep 
                      ? 'text-primary-600 dark:text-primary-400' 
                      : 'text-gray-500 dark:text-gray-500'
                  }`}>
                    {step.title}
                  </span>
                  {index < steps.length - 1 && (
                    <div className={`w-full h-1 mx-4 ${
                      index < currentStep 
                        ? 'bg-primary-600' 
                        : 'bg-gray-300 dark:bg-gray-600'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Content Card */}
        <div className="bg-white dark:bg-gray-800 shadow-xl rounded-lg overflow-hidden">
          {/* Step 1: Create Superadmin */}
          {currentStep === 0 && (
            <div className="p-8">
              <div className="flex items-center mb-6">
                <Shield className="h-8 w-8 text-primary-600 dark:text-primary-400 mr-3" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Create Superadmin Account
                </h2>
              </div>
              
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                This will be the main administrator account with full system access.
              </p>

              {superadminSuccess ? (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md p-4 mb-6">
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    <p className="text-green-800 dark:text-green-400 font-medium">
                      Superadmin created successfully! Redirecting to next step...
                    </p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleCreateSuperadmin} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Username
                    </label>
                    <input
                      type="text"
                      required
                      value={superadminData.username}
                      onChange={(e) => setSuperadminData({...superadminData, username: e.target.value})}
                      className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:text-white sm:text-sm px-3 py-2"
                      placeholder="Enter username (min 3 characters)"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Password
                    </label>
                    <input
                      type="password"
                      required
                      value={superadminData.password}
                      onChange={(e) => setSuperadminData({...superadminData, password: e.target.value})}
                      className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:text-white sm:text-sm px-3 py-2"
                      placeholder="Enter password (min 6 characters)"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      required
                      value={superadminData.confirmPassword}
                      onChange={(e) => setSuperadminData({...superadminData, confirmPassword: e.target.value})}
                      className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:text-white sm:text-sm px-3 py-2"
                      placeholder="Confirm password"
                    />
                  </div>

                  {superadminError && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4">
                      <div className="flex items-center">
                        <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                        <p className="text-red-800 dark:text-red-400">{superadminError}</p>
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    Create Superadmin & Continue
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Step 2: Import Organizations */}
          {currentStep === 1 && (
            <div className="p-8">
              <div className="flex items-center mb-6">
                <Building2 className="h-8 w-8 text-primary-600 dark:text-primary-400 mr-3" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Import Organizations
                </h2>
              </div>

              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Upload a CSV file to create multiple organizations at once. This step is optional.
              </p>

              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md p-4 mb-6">
                <div className="flex items-start">
                  <FileSpreadsheet className="h-5 w-5 text-blue-500 mr-2 mt-0.5" />
                  <div>
                    <p className="text-blue-800 dark:text-blue-400 font-medium mb-2">
                      CSV Format Required:
                    </p>
                    <code className="text-sm bg-blue-100 dark:bg-blue-800 px-2 py-1 rounded">
                      name,description
                    </code>
                    <button
                      onClick={downloadOrgTemplate}
                      className="ml-4 text-blue-600 dark:text-blue-400 hover:underline text-sm flex items-center"
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Download Template
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-primary-500 transition-colors">
                  <input
                    type="file"
                    accept=".csv"
                    onChange={(e) => setOrgCsvFile(e.target.files?.[0] || null)}
                    className="hidden"
                    id="org-csv-upload"
                  />
                  <label
                    htmlFor="org-csv-upload"
                    className="cursor-pointer flex flex-col items-center"
                  >
                    <Upload className="h-12 w-12 text-gray-400 mb-2" />
                    <span className="text-gray-600 dark:text-gray-400">
                      {orgCsvFile ? orgCsvFile.name : 'Click to upload CSV file'}
                    </span>
                  </label>
                </div>

                {orgCsvFile && (
                  <button
                    onClick={handleOrgCsvUpload}
                    disabled={orgUploading}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                  >
                    {orgUploading ? 'Uploading...' : 'Upload Organizations'}
                  </button>
                )}

                {orgUploadResult && (
                  <div className={`rounded-md p-4 ${
                    orgUploadResult.success 
                      ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' 
                      : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
                  }`}>
                    <div className="flex items-center mb-2">
                      {orgUploadResult.success ? (
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                      )}
                      <p className={orgUploadResult.success ? 'text-green-800 dark:text-green-400' : 'text-red-800 dark:text-red-400'}>
                        {orgUploadResult.success 
                          ? `Successfully imported ${orgUploadResult.imported} organizations` 
                          : 'Import failed'}
                      </p>
                    </div>
                    {orgUploadResult.errors.length > 0 && (
                      <ul className="mt-2 text-sm text-red-600 dark:text-red-400 list-disc list-inside">
                        {orgUploadResult.errors.map((error, idx) => (
                          <li key={idx}>{error}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>

              <div className="mt-8 flex justify-between">
                <button
                  onClick={() => setCurrentStep(0)}
                  className="flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Back
                </button>
                <button
                  onClick={() => setCurrentStep(2)}
                  className="flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
                >
                  Continue
                  <ChevronRight className="ml-2 h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Import Users */}
          {currentStep === 2 && (
            <div className="p-8">
              <div className="flex items-center mb-6">
                <Users className="h-8 w-8 text-primary-600 dark:text-primary-400 mr-3" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Import Users
                </h2>
              </div>

              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Upload a CSV file to create multiple users at once. This step is optional.
              </p>

              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md p-4 mb-6">
                <div className="flex items-start">
                  <FileSpreadsheet className="h-5 w-5 text-blue-500 mr-2 mt-0.5" />
                  <div>
                    <p className="text-blue-800 dark:text-blue-400 font-medium mb-2">
                      CSV Format Required:
                    </p>
                    <code className="text-sm bg-blue-100 dark:bg-blue-800 px-2 py-1 rounded">
                      username,email,password,role,organizationName
                    </code>
                    <p className="text-sm text-blue-600 dark:text-blue-400 mt-2">
                      Roles: superadmin, org_admin, user<br />
                      Leave organizationName empty for superadmin
                    </p>
                    <button
                      onClick={downloadUserTemplate}
                      className="mt-2 text-blue-600 dark:text-blue-400 hover:underline text-sm flex items-center"
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Download Template
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-primary-500 transition-colors">
                  <input
                    type="file"
                    accept=".csv"
                    onChange={(e) => setUserCsvFile(e.target.files?.[0] || null)}
                    className="hidden"
                    id="user-csv-upload"
                  />
                  <label
                    htmlFor="user-csv-upload"
                    className="cursor-pointer flex flex-col items-center"
                  >
                    <Upload className="h-12 w-12 text-gray-400 mb-2" />
                    <span className="text-gray-600 dark:text-gray-400">
                      {userCsvFile ? userCsvFile.name : 'Click to upload CSV file'}
                    </span>
                  </label>
                </div>

                {userCsvFile && (
                  <button
                    onClick={handleUserCsvUpload}
                    disabled={userUploading}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                  >
                    {userUploading ? 'Uploading...' : 'Upload Users'}
                  </button>
                )}

                {userUploadResult && (
                  <div className={`rounded-md p-4 ${
                    userUploadResult.success 
                      ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' 
                      : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
                  }`}>
                    <div className="flex items-center mb-2">
                      {userUploadResult.success ? (
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                      )}
                      <p className={userUploadResult.success ? 'text-green-800 dark:text-green-400' : 'text-red-800 dark:text-red-400'}>
                        {userUploadResult.success 
                          ? `Successfully imported ${userUploadResult.imported} users` 
                          : 'Import failed'}
                      </p>
                    </div>
                    {userUploadResult.errors.length > 0 && (
                      <ul className="mt-2 text-sm text-red-600 dark:text-red-400 list-disc list-inside">
                        {userUploadResult.errors.map((error, idx) => (
                          <li key={idx}>{error}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>

              <div className="mt-8 flex justify-between">
                <button
                  onClick={() => setCurrentStep(1)}
                  className="flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Back
                </button>
                <button
                  onClick={() => setCurrentStep(3)}
                  className="flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
                >
                  Complete Setup
                  <ChevronRight className="ml-2 h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Complete */}
          {currentStep === 3 && (
            <div className="p-8 text-center">
              <div className="mb-6">
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Setup Complete!
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-8">
                Your Aturuang meeting room booking system is now ready to use.
              </p>
              
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-md p-6 mb-8">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Next Steps
                </h3>
                <ul className="text-left text-gray-600 dark:text-gray-400 space-y-2">
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Login with your superadmin credentials
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Add meeting rooms from the admin panel
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Configure room settings and facilities
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Start booking meetings!
                  </li>
                </ul>
              </div>

              <button
                onClick={() => navigate('/login')}
                className="w-full sm:w-auto flex justify-center items-center px-8 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Go to Login Page
                <ChevronRight className="ml-2 h-5 w-5" />
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>Aturuang Meeting Room Booking System v2.0</p>
        </div>
      </div>
    </div>
  );
}
