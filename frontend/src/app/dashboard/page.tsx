'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import Layout from '@/components/Layout';
import api from '@/lib/api';
import Link from 'next/link';
import { PlusIcon, UserGroupIcon, CogIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

interface Patient {
  id: number;
  first_name: string;
  middle_name: string | null;
  last_name: string;
  date_of_birth: string;
  status: string;
  addresses: Array<{
    id: number;
    street: string;
    city: string;
    state: string;
    zip_code: string;
    is_primary: boolean;
  }>;
  custom_field_values: Array<{
    id: number;
    field_name: string;
    field_type: string;
    text_value: string | null;
    number_value: number | null;
    date_value: string | null;
  }>;
}

interface DashboardStats {
  total_patients: number;
  active_patients: number;
  inquiry_patients: number;
  onboarding_patients: number;
  churned_patients: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [recentPatients, setRecentPatients] = useState<Patient[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    const fetchDashboardData = async () => {
      try {
        const patientsResponse = await api.get('/patients/');
        const patients = patientsResponse.data.results;
        setRecentPatients(patients.slice(0, 5)); // Get 5 most recent patients
        setFilteredPatients(patients.slice(0, 5));
        
        // Calculate stats from the patients data
        setStats({
          total_patients: patients.length,
          active_patients: patients.filter((p: Patient) => p.status === 'ACTIVE').length,
          inquiry_patients: patients.filter((p: Patient) => p.status === 'INQUIRY').length,
          onboarding_patients: patients.filter((p: Patient) => p.status === 'ONBOARDING').length,
          churned_patients: patients.filter((p: Patient) => p.status === 'CHURNED').length,
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredPatients(recentPatients);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = recentPatients.filter(patient => {
      const fullName = `${patient.first_name} ${patient.middle_name || ''} ${patient.last_name}`.toLowerCase();
      const address = patient.addresses[0] ? 
        `${patient.addresses[0].city} ${patient.addresses[0].state}`.toLowerCase() : '';
      const customFields = patient.custom_field_values.map(field => 
        `${field.field_name} ${field.text_value || field.date_value || ''}`.toLowerCase()
      ).join(' ');

      return fullName.includes(query) ||
             address.includes(query) ||
             patient.status.toLowerCase().includes(query) ||
             customFields.includes(query);
    });

    setFilteredPatients(filtered);
  }, [searchQuery, recentPatients]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {user?.first_name}!
          </h1>
          <p className="mt-1 text-gray-500">
            Here's what's happening with your patients today.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            href="/patients/new"
            className="flex items-center p-4 bg-white shadow rounded-lg hover:bg-gray-50"
          >
            <div className="p-3 bg-primary-100 rounded-full">
              <PlusIcon className="h-6 w-6 text-primary-600" />
            </div>
            <div className="ml-4">
              <h2 className="text-lg font-medium text-gray-900">Add New Patient</h2>
              <p className="text-sm text-gray-500">Create a new patient record</p>
            </div>
          </Link>

          <Link
            href="/custom-fields"
            className="flex items-center p-4 bg-white shadow rounded-lg hover:bg-gray-50"
          >
            <div className="p-3 bg-primary-100 rounded-full">
              <CogIcon className="h-6 w-6 text-primary-600" />
            </div>
            <div className="ml-4">
              <h2 className="text-lg font-medium text-gray-900">Manage Custom Fields</h2>
              <p className="text-sm text-gray-500">Configure patient form fields</p>
            </div>
          </Link>
        </div>

        {/* Stats Overview */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 rounded-full">
                  <UserGroupIcon className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Patients</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.total_patients}</p>
                </div>
              </div>
            </div>
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center">
                <div className="p-3 bg-green-100 rounded-full">
                  <UserGroupIcon className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Active Patients</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.active_patients}</p>
                </div>
              </div>
            </div>
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center">
                <div className="p-3 bg-yellow-100 rounded-full">
                  <UserGroupIcon className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Inquiry</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.inquiry_patients}</p>
                </div>
              </div>
            </div>
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center">
                <div className="p-3 bg-red-100 rounded-full">
                  <UserGroupIcon className="h-6 w-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Churned</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.churned_patients}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Search Bar */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  placeholder="Search patients by name, status, or custom fields..."
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Recent Patients */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium text-gray-900">Recent Patients</h2>
              <Link
                href="/patients"
                className="text-sm font-medium text-primary-600 hover:text-primary-500"
              >
                View all
              </Link>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date of Birth
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Address
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPatients.map((patient) => (
                  <tr key={patient.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link
                        href={`/patients/${patient.id}`}
                        className="text-sm font-medium text-primary-600 hover:text-primary-500"
                      >
                        {`${patient.first_name} ${patient.middle_name ? patient.middle_name + ' ' : ''}${patient.last_name}`}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(patient.date_of_birth).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${patient.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 
                          patient.status === 'INQUIRY' ? 'bg-yellow-100 text-yellow-800' :
                          patient.status === 'ONBOARDING' ? 'bg-blue-100 text-blue-800' :
                          'bg-red-100 text-red-800'}`}>
                        {patient.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {patient.addresses[0] ? 
                        `${patient.addresses[0].city}, ${patient.addresses[0].state}` : 
                        'No address'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
}
 