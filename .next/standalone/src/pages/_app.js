import '../styles/globals.css';
import { AuthProvider } from '../contexts/AuthContext';
import Layout from '../components/layout/Layout';
import ProtectedRoute from '../components/layout/ProtectedRoute';
import { useRouter } from 'next/router';

function MyApp({ Component, pageProps }) {
  const router = useRouter();
  
  // Lista de rotas públicas que não precisam de autenticação
  const publicRoutes = ['/login', '/cadastro', '/recuperar-senha', '/alterar-senha'];
  const isPublicRoute = publicRoutes.includes(router.pathname);

  return (
    <AuthProvider>
      <Layout>
        {isPublicRoute ? (
          <Component {...pageProps} />
        ) : (
          <ProtectedRoute>
            <Component {...pageProps} />
          </ProtectedRoute>
        )}
      </Layout>
    </AuthProvider>
  );
}

export default MyApp;