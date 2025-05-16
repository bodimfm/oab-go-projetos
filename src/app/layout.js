import './globals.css';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export const metadata = {
  title: 'Sistema de Gestão de Comissões OAB-GO',
  description: 'Aplicação para gerenciamento de projetos e comissões da OAB-GO',
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen bg-gray-100 flex flex-col">
        <Header />
        <main className="flex-grow py-6">
          <div className="container mx-auto px-4">
            {children}
          </div>
        </main>
        <Footer />
      </body>
    </html>
  );
}