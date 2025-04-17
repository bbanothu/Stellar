'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import Layout from '@/components/Layout';
import api from '@/lib/api';
import { useForm, useFieldArray } from 'react-hook-form';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';

interface CustomField {
  id: number;
  name: string;
  field_type: string;
  is_required: boolean;
  created_at: string;
  updated_at: string;
}

interface FormData {
  first_name: string;
  middle_name: string;
  last_name: string;
  date_of_birth: string;
  status: string;
  addresses: {
    street: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  }[];
  custom_fields: {
    field_id: number;
    value: string;
  }[];
}

export default function NewPatientPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [customFields, setCustomFields] = useState<CustomField[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      first_name: '',
      middle_name: '',
      last_name: '',
      date_of_birth: '',
      status: 'Inquiry',
      addresses: [{ street: '', city: '', state: '', postal_code: '', country: '' }],
      custom_fields: [],
    },
  });

  const { fields: addressFields, append: appendAddress, remove: removeAddress } = useFieldArray({
    control,
    name: 'addresses',
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    const fetchCustomFields = async () => {
      try {
        const response = await api.get('/custom-fields/');
        // Extract the results array from the paginated response
        const customFieldsData = response.data.results || response.data;
        setCustomFields(customFieldsData);
      } catch (error) {
        console.error('Error fetching custom fields:', error);
        setError('Failed to load custom fields. Please try again later.');
      }
    };

    fetchCustomFields();
  }, [isAuthenticated, router]);

  const onSubmit = async (data: FormData) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Format the data for the API
      const patientData = {
        ...data,
        custom_fields: data.custom_fields.map(field => ({
          field_id: field.field_id,
          value: field.value
        }))
      };
      
      await api.post('/patients/', patientData);
      router.push('/patients');
    } catch (error) {
      console.error('Error creating patient:', error);
      setError('Failed to create patient. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="md:flex md:items-center md:justify-between">
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
                Add New Patient
              </h2>
            </div>
          </div>

          {error && (
            <div className="mt-4 bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Error</h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>{error}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="mt-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 divide-y divide-gray-200">
              <div className="space-y-8 divide-y divide-gray-200">
                <div>
                  <div>
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Personal Information</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Enter the patient's basic information.
                    </p>
                  </div>

                  <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                    <div className="sm:col-span-2">
                      <label htmlFor="first_name" className="block text-sm font-medium text-gray-700">
                        First name
                      </label>
                      <div className="mt-1">
                        <input
                          type="text"
                          id="first_name"
                          {...register('first_name', { required: 'First name is required' })}
                          className="input-field"
                        />
                        {errors.first_name && (
                          <p className="mt-1 text-sm text-red-600">{errors.first_name.message}</p>
                        )}
                      </div>
                    </div>

                    <div className="sm:col-span-2">
                      <label htmlFor="middle_name" className="block text-sm font-medium text-gray-700">
                        Middle name
                      </label>
                      <div className="mt-1">
                        <input
                          type="text"
                          id="middle_name"
                          {...register('middle_name')}
                          className="input-field"
                        />
                      </div>
                    </div>

                    <div className="sm:col-span-2">
                      <label htmlFor="last_name" className="block text-sm font-medium text-gray-700">
                        Last name
                      </label>
                      <div className="mt-1">
                        <input
                          type="text"
                          id="last_name"
                          {...register('last_name', { required: 'Last name is required' })}
                          className="input-field"
                        />
                        {errors.last_name && (
                          <p className="mt-1 text-sm text-red-600">{errors.last_name.message}</p>
                        )}
                      </div>
                    </div>

                    <div className="sm:col-span-3">
                      <label htmlFor="date_of_birth" className="block text-sm font-medium text-gray-700">
                        Date of birth
                      </label>
                      <div className="mt-1">
                        <input
                          type="date"
                          id="date_of_birth"
                          {...register('date_of_birth', { required: 'Date of birth is required' })}
                          className="input-field"
                        />
                        {errors.date_of_birth && (
                          <p className="mt-1 text-sm text-red-600">{errors.date_of_birth.message}</p>
                        )}
                      </div>
                    </div>

                    <div className="sm:col-span-3">
                      <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                        Status
                      </label>
                      <div className="mt-1">
                        <select
                          id="status"
                          {...register('status', { required: 'Status is required' })}
                          className="input-field"
                        >
                          <option value="Inquiry">Inquiry</option>
                          <option value="Onboarding">Onboarding</option>
                          <option value="Active">Active</option>
                          <option value="Churned">Churned</option>
                        </select>
                        {errors.status && (
                          <p className="mt-1 text-sm text-red-600">{errors.status.message}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-8">
                  <div>
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Addresses</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Add one or more addresses for the patient.
                    </p>
                  </div>

                  <div className="mt-6 space-y-6">
                    {addressFields.map((field, index) => (
                      <div key={field.id} className="bg-gray-50 p-4 rounded-md">
                        <div className="flex justify-between items-center mb-4">
                          <h4 className="text-sm font-medium text-gray-900">Address {index + 1}</h4>
                          {index > 0 && (
                            <button
                              type="button"
                              onClick={() => removeAddress(index)}
                              className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                            >
                              <TrashIcon className="h-4 w-4 mr-1" />
                              Remove
                            </button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                          <div className="sm:col-span-6">
                            <label htmlFor={`addresses.${index}.street`} className="block text-sm font-medium text-gray-700">
                              Street address
                            </label>
                            <div className="mt-1">
                              <input
                                type="text"
                                id={`addresses.${index}.street`}
                                {...register(`addresses.${index}.street` as const, { required: 'Street address is required' })}
                                className="input-field"
                              />
                              {errors.addresses?.[index]?.street && (
                                <p className="mt-1 text-sm text-red-600">{errors.addresses[index]?.street?.message}</p>
                              )}
                            </div>
                          </div>

                          <div className="sm:col-span-2">
                            <label htmlFor={`addresses.${index}.city`} className="block text-sm font-medium text-gray-700">
                              City
                            </label>
                            <div className="mt-1">
                              <input
                                type="text"
                                id={`addresses.${index}.city`}
                                {...register(`addresses.${index}.city` as const, { required: 'City is required' })}
                                className="input-field"
                              />
                              {errors.addresses?.[index]?.city && (
                                <p className="mt-1 text-sm text-red-600">{errors.addresses[index]?.city?.message}</p>
                              )}
                            </div>
                          </div>

                          <div className="sm:col-span-2">
                            <label htmlFor={`addresses.${index}.state`} className="block text-sm font-medium text-gray-700">
                              State / Province
                            </label>
                            <div className="mt-1">
                              <input
                                type="text"
                                id={`addresses.${index}.state`}
                                {...register(`addresses.${index}.state` as const, { required: 'State is required' })}
                                className="input-field"
                              />
                              {errors.addresses?.[index]?.state && (
                                <p className="mt-1 text-sm text-red-600">{errors.addresses[index]?.state?.message}</p>
                              )}
                            </div>
                          </div>

                          <div className="sm:col-span-2">
                            <label htmlFor={`addresses.${index}.postal_code`} className="block text-sm font-medium text-gray-700">
                              ZIP / Postal code
                            </label>
                            <div className="mt-1">
                              <input
                                type="text"
                                id={`addresses.${index}.postal_code`}
                                {...register(`addresses.${index}.postal_code` as const, { required: 'Postal code is required' })}
                                className="input-field"
                              />
                              {errors.addresses?.[index]?.postal_code && (
                                <p className="mt-1 text-sm text-red-600">{errors.addresses[index]?.postal_code?.message}</p>
                              )}
                            </div>
                          </div>

                          <div className="sm:col-span-2">
                            <label htmlFor={`addresses.${index}.country`} className="block text-sm font-medium text-gray-700">
                              Country
                            </label>
                            <div className="mt-1">
                              <input
                                type="text"
                                id={`addresses.${index}.country`}
                                {...register(`addresses.${index}.country` as const, { required: 'Country is required' })}
                                className="input-field"
                              />
                              {errors.addresses?.[index]?.country && (
                                <p className="mt-1 text-sm text-red-600">{errors.addresses[index]?.country?.message}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}

                    <div>
                      <button
                        type="button"
                        onClick={() => appendAddress({ street: '', city: '', state: '', postal_code: '', country: '' })}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                      >
                        <PlusIcon className="h-5 w-5 mr-2" />
                        Add Another Address
                      </button>
                    </div>
                  </div>
                </div>

                {customFields.length > 0 && (
                  <div className="pt-8">
                    <div>
                      <h3 className="text-lg leading-6 font-medium text-gray-900">Custom Fields</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Fill in any custom fields defined for patients.
                      </p>
                    </div>

                    <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                      {customFields.map((field) => (
                        <div key={field.id} className="sm:col-span-3">
                          <label htmlFor={`custom_fields.${field.id}`} className="block text-sm font-medium text-gray-700">
                            {field.name} {field.is_required && <span className="text-red-500">*</span>}
                          </label>
                          <div className="mt-1">
                            <input
                              type={field.field_type === 'NUMBER' ? 'number' : field.field_type === 'DATE' ? 'date' : 'text'}
                              id={`custom_fields.${field.id}`}
                              {...register(`custom_fields.${field.id}.value` as any, { 
                                required: field.is_required ? `${field.name} is required` : false 
                              })}
                              className="input-field"
                            />
                            {errors.custom_fields?.[field.id]?.value && (
                              <p className="mt-1 text-sm text-red-600">{errors.custom_fields[field.id]?.value?.message}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-5">
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => router.push('/patients')}
                    className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    {isLoading ? 'Saving...' : 'Save Patient'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
} 