# Stellar Sleep - Sleep Study Management System

A comprehensive web application for managing sleep study patients, built with Django and Next.js.

## Project Structure

The project is organized into two main directories:

- `backend/`: Django REST API server
- `frontend/`: Next.js frontend application

## Backend (Django)

The backend is built with Django and Django REST Framework, providing a robust API for the frontend to consume.

### Features

- User authentication and authorization
- Patient management
- Address management
- API endpoints for all core functionality

### Setup

1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Create and activate a virtual environment:
   ```
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

4. Run migrations:
   ```
   python manage.py migrate
   ```

5. Start the development server:
   ```
   python manage.py runserver
   ```

## Frontend (Next.js)

The frontend is built with Next.js, React, and Tailwind CSS, providing a modern and responsive user interface.

### Features

- User authentication
- Dashboard with statistics
- Patient management (list, create, view, edit)
- Responsive design for mobile and desktop
- Modern UI with Tailwind CSS

### Setup

1. Navigate to the frontend directory:
   ```
   cd frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm run dev
   ```

## Authentication

The application uses JWT (JSON Web Tokens) for authentication. Users can:

- Register a new account
- Log in with email and password
- Log out

## Patient Management

The patient management system allows users to:

- View a list of all patients
- Search patients by name
- View detailed patient information
- Create new patients
- Edit existing patient information
- Delete patients

Each patient record includes:
- Personal information (name, date of birth, status)
- Address information
- Custom fields (configurable)

## UI/UX Features

- Responsive sidebar navigation
- Mobile-friendly design with collapsible menu
- Clean, modern interface with Tailwind CSS
- Intuitive forms for data entry
- Search functionality for finding patients

## Development

### Backend Development

The backend API is built with Django REST Framework, providing endpoints for all core functionality. The API follows RESTful principles and uses JWT for authentication.

### Frontend Development

The frontend is built with Next.js and React, using modern hooks and functional components. The UI is styled with Tailwind CSS, providing a responsive and modern design.

## Getting Started

1. Clone the repository
2. Set up the backend (follow instructions above)
3. Set up the frontend (follow instructions above)
4. Access the application at http://localhost:3000

## License

This project is licensed under the MIT License.