import {
  createBrowserRouter,
  Navigate,
  Outlet,
  RouterProvider
} from 'react-router-dom';
import Login from './pages/Login/Login';
import Dashboard from './pages/Admin/Dashboard/Dashboard';
import Customers from './pages/Admin/Customers/Customers';
import Products from './pages/Admin/Products/Products';
import Technicians from './pages/Admin/Technicians/Technicians';
import Projects from './pages/Admin/Projects/Projects';
import Documents from './pages/Admin/Documents/Documents';
import Reports from './pages/Admin/Reports/Reports';
import AdminLayout from './AdminLayout';
import TeknisiLayout from './TeknisiLayout';
import PemasanganTeknisi from './pages/Teknisi/Projects/PemasanganTeknisi';
import DetailProject from './pages/Admin/Projects/DetailProjects';
import DetailPemasanganTeknisi from './pages/Teknisi/Projects/DetailPemasanganTeknisi';

function App() {

  const currentUser = true;

  const Layout = () => {
    return (
      <AdminLayout>
        <Outlet />
      </AdminLayout>
    )
  }

  const SecondaryLayout = () => {
    return (
      <TeknisiLayout>
        <Outlet />
      </TeknisiLayout>
    )
  }

  const router = createBrowserRouter([
    {
      path: "/",
      element: <Login />
    },
    {
      path: '/admin',
      element: <Layout />,
      children: [
        {
          path: "",
          element: <Dashboard />
        },
        {
          path: "customers",
          element: <Customers />
        },
        {
          path: "products",
          element: <Products />
        },
        {
          path: "technicians",
          element: <Technicians />
        },
        {
          path: "projects",
          element: <Projects />,
        },
        {
          path: "documents",
          element: <Documents />
        },
        {
          path: "reports",
          element: <Reports />
        },
        {
          path: 'projects/:id',
          element: <DetailProject />
        }
      ]
    }, {
      path: '/teknisi',
      element: <SecondaryLayout />,
      children: [
        {
          path: "",
          element: <PemasanganTeknisi />
        },
        {
          path: ':id',
          element: <DetailPemasanganTeknisi />
        }
    ]
    }
  ])

  return (
    <div>
      <RouterProvider router={router} />
    </div>
  )
}

export default App;