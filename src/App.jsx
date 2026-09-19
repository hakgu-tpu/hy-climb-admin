import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from '@/contexts/AuthContext'
import RequireAuth from '@/components/RequireAuth'
import AdminLayout from '@/components/AdminLayout'
import LoginPage from '@/pages/LoginPage'
import CentersListPage from '@/pages/CentersListPage'
import CenterFormPage from '@/pages/CenterFormPage'
import EventsListPage from '@/pages/EventsListPage'
import EventFormPage from '@/pages/EventFormPage'
import MeetingsListPage from '@/pages/MeetingsListPage'
import MeetingFormPage from '@/pages/MeetingFormPage'
import ConfigPage from '@/pages/ConfigPage'

const App = () => (
  <AuthProvider>
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          element={
            <RequireAuth>
              <AdminLayout />
            </RequireAuth>
          }
        >
          <Route path="/" element={<Navigate to="/centers" replace />} />
          <Route path="/centers" element={<CentersListPage />} />
          <Route path="/centers/new" element={<CenterFormPage mode="create" />} />
          <Route path="/centers/:id" element={<CenterFormPage mode="edit" />} />
          <Route path="/events" element={<EventsListPage />} />
          <Route path="/events/new" element={<EventFormPage mode="create" />} />
          <Route path="/events/:id" element={<EventFormPage mode="edit" />} />
          <Route path="/meetings" element={<MeetingsListPage />} />
          <Route path="/meetings/new" element={<MeetingFormPage mode="create" />} />
          <Route path="/meetings/:id" element={<MeetingFormPage mode="edit" />} />
          <Route path="/config" element={<ConfigPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  </AuthProvider>
)

export default App
