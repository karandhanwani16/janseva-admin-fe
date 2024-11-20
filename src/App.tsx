import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/Login'
import useAuthStore from './store/useAuth'
import { Toaster } from 'react-hot-toast';
import AdminLayout from './layouts/AdminLayout';
import SubPageLayout from './layouts/SubPageLayout';
import BrandView from './components/brands/BrandView';
import BrandForm from './components/brands/BrandForm';
import CategoryView from './components/categories/CategoryView';
import CategoryForm from './components/categories/CategoryForm';
import ProductForm from './components/products/ProductForm';
import ProductView from './components/products/ProductView';
import { useTheme } from './store/useTheme';

function App() {

  const brandsTabs = [
    { path: 'upload', activeWhen: 'upload', label: 'Upload', Component: () => <BrandForm />, visible: true },
    { path: 'view', activeWhen: 'view|edit', label: 'View', Component: () => <BrandView />, visible: true },
    { path: 'edit', activeWhen: 'edit', label: 'Edit', Component: () => <BrandForm isEditMode={true} />, visible: false }
  ]

  const categoriesTabs = [
    { path: 'upload', activeWhen: 'upload', label: 'Upload', Component: () => <CategoryForm />, visible: true },
    { path: 'view', activeWhen: 'view|edit', label: 'View', Component: () => <CategoryView />, visible: true },
    { path: 'edit', activeWhen: 'edit', label: 'Edit', Component: () => <CategoryForm isEditMode={true} />, visible: false }
  ]

  const productsTabs = [
    { path: 'upload', activeWhen: 'upload', label: 'Upload', Component: () => <ProductForm />, visible: true },
    { path: 'view', activeWhen: 'view|edit', label: 'View', Component: () => <ProductView />, visible: true },
    { path: 'edit', activeWhen: 'edit', label: 'Edit', Component: () => <ProductForm isEditMode={true} />, visible: false }
  ]

  const { isAuthenticated } = useAuthStore();
  const { isDarkMode } = useTheme();

  return (
    <BrowserRouter>
      <Routes>
        {!isAuthenticated ? (
          <>
            <Route path="/" element={<LoginPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </>
        ) : (
          <>
            <Route path="/" element={<Navigate to="/admin" replace />} />
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<div>Dashboard</div>} />
              <Route path="companies" element={<SubPageLayout tabs={brandsTabs} defaultTab="upload" title="Companies" />}>
                <Route index element={<Navigate to="upload" replace />} />
                <Route path="upload" element={<BrandForm />} />
                <Route path="view" element={<BrandView />} />
                <Route path="edit/:id" element={<BrandForm isEditMode={true} />} />
              </Route>
              <Route path="categories" element={<SubPageLayout tabs={categoriesTabs} defaultTab="upload" title="Categories" />}>
                <Route index element={<Navigate to="upload" replace />} />
                <Route path="upload" element={<CategoryForm />} />
                <Route path="view" element={<CategoryView />} />
                <Route path="edit/:id" element={<CategoryForm isEditMode={true} />} />
              </Route>
              <Route path="products" element={<SubPageLayout tabs={productsTabs} defaultTab="upload" title="Products" />}>
                <Route index element={<Navigate to="upload" replace />} />
                <Route path="upload" element={<ProductForm />} />
                <Route path="view" element={<ProductView />} />
                <Route path="edit/:id" element={<ProductForm isEditMode={true} />} />
              </Route>
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </>
        )}
      </Routes>

      <Toaster
        position="top-right"
        gutter={12}
        toastOptions={{
          style: {
            borderRadius: '3rem',
            background: isDarkMode ? '#27272a' : '#ffffff',
            color: isDarkMode ? '#ffffff' : '#27272a'
          }
        }}
      />
    </BrowserRouter>
  )
}

export default App