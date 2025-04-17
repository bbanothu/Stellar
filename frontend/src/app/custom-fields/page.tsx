'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import Layout from '@/components/Layout';
import api from '@/lib/api';

interface CustomField {
  id: number;
  name: string;
  field_type: string;
  is_required: boolean;
  created_at: string;
  updated_at: string;
}

export default function CustomFieldsPage() {
  const { user, isAuthenticated, fetchUser } = useAuthStore();
  const router = useRouter();
  const [fields, setFields] = useState<CustomField[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    field_type: 'TEXT',
    is_required: false,
  });

  useEffect(() => {
    if (!isAuthenticated) {
      fetchUser().catch(() => {
        router.push('/login');
      });
    }
  }, [isAuthenticated, fetchUser, router]);

  useEffect(() => {
    const fetchFields = async () => {
      try {
        const response = await api.get('/custom-fields/');
        setFields(response.data.results || []);
      } catch (error) {
        console.error('Error fetching custom fields:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchFields();
    }
  }, [isAuthenticated]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/custom-fields/', formData);
      setIsCreating(false);
      setFormData({
        name: '',
        field_type: 'TEXT',
        is_required: false,
      });
      const response = await api.get('/custom-fields/');
      setFields(response.data.results || []);
    } catch (error) {
      console.error('Error creating custom field:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this field?')) {
      try {
        await api.delete(`/custom-fields/${id}/`);
        setFields((prev) => prev.filter((field) => field.id !== id));
      } catch (error) {
        console.error('Error deleting custom field:', error);
      }
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  if (!isAuthenticated || !user) {
    return null;
  }

  console.log('Fields state:', fields);

  return (
    <Layout>
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-semibold text-gray-900">
              Custom Fields
            </h1>
            <button
              onClick={() => setIsCreating(!isCreating)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              {isCreating ? 'Cancel' : 'Add Field'}
            </button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="py-4">
            {isCreating && (
              <form onSubmit={handleSubmit} className="mb-8">
                <div className="bg-white shadow sm:rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                      <div className="sm:col-span-4">
                        <label
                          htmlFor="name"
                          className="block text-sm font-medium text-gray-700"
                        >
                          Field Name
                        </label>
                        <div className="mt-1">
                          <input
                            type="text"
                            name="name"
                            id="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            className="input-field"
                          />
                        </div>
                      </div>

                      <div className="sm:col-span-4">
                        <label
                          htmlFor="field_type"
                          className="block text-sm font-medium text-gray-700"
                        >
                          Field Type
                        </label>
                        <div className="mt-1">
                          <select
                            id="field_type"
                            name="field_type"
                            value={formData.field_type}
                            onChange={handleChange}
                            className="input-field"
                          >
                            <option value="TEXT">Text</option>
                            <option value="NUMBER">Number</option>
                            <option value="DATE">Date</option>
                          </select>
                        </div>
                      </div>

                      <div className="sm:col-span-4">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            name="is_required"
                            id="is_required"
                            checked={formData.is_required}
                            onChange={handleChange}
                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                          />
                          <label
                            htmlFor="is_required"
                            className="ml-2 block text-sm text-gray-900"
                          >
                            Required field
                          </label>
                        </div>
                      </div>
                    </div>
                    <div className="mt-5">
                      <button
                        type="submit"
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                      >
                        Create Field
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            )}

            {isLoading ? (
              <div className="text-center py-4">Loading...</div>
            ) : (
              <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-gray-200">
                  {fields.length > 0 && fields.map((field) => (
                    <li key={field.id}>
                      <div className="px-4 py-4 sm:px-6">
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-primary-600 truncate">
                              {field.name}
                            </p>
                            <p className="mt-1 text-sm text-gray-500">
                              Type: {field.field_type}
                              {field.is_required && ' • Required'}
                            </p>
                          </div>
                          <div className="flex items-center space-x-4">
                            <button
                              onClick={() => handleDelete(field.id)}
                              className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
} 