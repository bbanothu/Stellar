'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import Layout from '@/components/Layout';
import api from '@/lib/api';

interface Address {
  id: number;
  street: string;
  city: string;
  state: string;
  zip_code: string;
  is_primary: boolean;
}

interface CustomFieldValue {
  id: number;
  custom_field: number;
  field_name: string;
  field_type: string;
  text_value: string | null;
  number_value: number | null;
  date_value: string | null;
}

interface Patient {
  id: number;
  first_name: string;
  middle_name: string | null;
  last_name: string;
  date_of_birth: string;
  status: string;
  addresses: Address[];
  custom_field_values: CustomFieldValue[];
}

export default function PatientDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { user, isAuthenticated, fetchUser } = useAuthStore();
  const router = useRouter();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<Patient>>({});

  useEffect(() => {
    if (!isAuthenticated) {
      fetchUser().catch(() => {
        router.push('/login');
      });
    }
  }, [isAuthenticated, fetchUser, router]);

  useEffect(() => {
    const fetchPatient = async () => {
      try {
        const response = await api.get(`/patients/${params.id}/`);
        setPatient(response.data);
        setFormData(response.data);
      } catch (error) {
        console.error('Error fetching patient:', error);
        router.push('/patients');
      } finally {
        setIsLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchPatient();
    }
  }, [isAuthenticated, params.id, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.put(`/patients/${params.id}/`, formData);
      setIsEditing(false);
      const response = await api.get(`/patients/${params.id}/`);
      setPatient(response.data);
    } catch (error) {
      console.error('Error updating patient:', error);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  if (!isAuthenticated || !user || !patient) {
    return null;
  }

  return (
    <Layout>
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-semibold text-gray-900">
              Patient Details
            </h1>
            <div className="flex gap-4">
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                {isEditing ? 'Cancel' : 'Edit'}
              </button>
              <button
                onClick={() => router.push('/patients')}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Back to List
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="py-4">
            {isLoading ? (
              <div className="text-center py-4">Loading...</div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                  <div className="px-4 py-5 sm:px-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Personal Information
                    </h3>
                  </div>
                  <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                    <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                      <div className="sm:col-span-2">
                        <label
                          htmlFor="first_name"
                          className="block text-sm font-medium text-gray-700"
                        >
                          First Name
                        </label>
                        <div className="mt-1">
                          <input
                            type="text"
                            name="first_name"
                            id="first_name"
                            value={formData.first_name || ''}
                            onChange={handleChange}
                            disabled={!isEditing}
                            className={`input-field ${!isEditing ? 'input-field-disabled' : ''}`}
                          />
                        </div>
                      </div>

                      <div className="sm:col-span-2">
                        <label
                          htmlFor="middle_name"
                          className="block text-sm font-medium text-gray-700"
                        >
                          Middle Name
                        </label>
                        <div className="mt-1">
                          <input
                            type="text"
                            name="middle_name"
                            id="middle_name"
                            value={formData.middle_name || ''}
                            onChange={handleChange}
                            disabled={!isEditing}
                            className={`input-field ${!isEditing ? 'input-field-disabled' : ''}`}
                          />
                        </div>
                      </div>

                      <div className="sm:col-span-2">
                        <label
                          htmlFor="last_name"
                          className="block text-sm font-medium text-gray-700"
                        >
                          Last Name
                        </label>
                        <div className="mt-1">
                          <input
                            type="text"
                            name="last_name"
                            id="last_name"
                            value={formData.last_name || ''}
                            onChange={handleChange}
                            disabled={!isEditing}
                            className={`input-field ${!isEditing ? 'input-field-disabled' : ''}`}
                          />
                        </div>
                      </div>

                      <div className="sm:col-span-2">
                        <label
                          htmlFor="date_of_birth"
                          className="block text-sm font-medium text-gray-700"
                        >
                          Date of Birth
                        </label>
                        <div className="mt-1">
                          <input
                            type="date"
                            name="date_of_birth"
                            id="date_of_birth"
                            value={formData.date_of_birth || ''}
                            onChange={handleChange}
                            disabled={!isEditing}
                            className={`input-field ${!isEditing ? 'input-field-disabled' : ''}`}
                          />
                        </div>
                      </div>

                      <div className="sm:col-span-2">
                        <label
                          htmlFor="status"
                          className="block text-sm font-medium text-gray-700"
                        >
                          Status
                        </label>
                        <div className="mt-1">
                          <select
                            id="status"
                            name="status"
                            value={formData.status || ''}
                            onChange={handleChange}
                            disabled={!isEditing}
                            className={`input-field ${!isEditing ? 'input-field-disabled' : ''}`}
                          >
                            <option value="INQUIRY">Inquiry</option>
                            <option value="ONBOARDING">Onboarding</option>
                            <option value="ACTIVE">Active</option>
                            <option value="CHURNED">Churned</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Addresses */}
                <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                  <div className="px-4 py-5 sm:px-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Addresses
                    </h3>
                  </div>
                  <div className="border-t border-gray-200">
                    <ul className="divide-y divide-gray-200">
                      {patient.addresses.map((address) => (
                        <li key={address.id} className="px-4 py-4 sm:px-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {address.street}
                              </p>
                              <p className="text-sm text-gray-500">
                                {address.city}, {address.state} {address.zip_code}
                              </p>
                            </div>
                            {address.is_primary && (
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                Primary
                              </span>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Custom Fields */}
                <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                  <div className="px-4 py-5 sm:px-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Custom Fields
                    </h3>
                  </div>
                  <div className="border-t border-gray-200">
                    <ul className="divide-y divide-gray-200">
                      {patient.custom_field_values.map((field) => (
                        <li key={field.id} className="px-4 py-4 sm:px-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {field.field_name}
                              </p>
                              <p className="text-sm text-gray-500">
                                {field.text_value ||
                                  field.number_value ||
                                  field.date_value ||
                                  'No value'}
                              </p>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {isEditing && (
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                      Save Changes
                    </button>
                  </div>
                )}
              </form>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
} 