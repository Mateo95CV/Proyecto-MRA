import AdminSidebar from '../../components/Admin/AdminSidebar';
import { useAuth } from '../../hooks/useAuth';
import { Navigate } from 'react-router-dom';

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();

  if (!user || user.role !== 'admin') {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <div className="flex-1 ml-64 bg-neutral-light">
        <header className="bg-white shadow-sm p-6">
          <h1 className="text-2xl font-bold text-primary-purple">
            Panel de Administración
          </h1>
        </header>
        <main className="p-6 md:p-10">{children}</main>
      </div>
    </div>
  );
};

export default AdminLayout;