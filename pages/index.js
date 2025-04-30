import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../hooks/useAuth';
import ProjectCard from '../components/ProjectCard';
import DashboardStats from '../components/DashboardStats';

export default function Home() {
  const { user, loading } = useAuth();
  const [projects, setProjects] = useState([]);
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Carregar projetos e dados do dashboard quando o usuário estiver autenticado
    if (user && !loading) {
      const fetchData = async () => {
        try {
          // Obter projetos
          const projectsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/projetos-api/projetos`, {
            headers: {
              Authorization: `Bearer ${user.token}`,
            },
          });
          
          if (projectsResponse.ok) {
            const projectsData = await projectsResponse.json();
            setProjects(projectsData.data || []);
          }
          
          // Obter dados do dashboard
          const dashboardResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/projetos-api/dashboard`, {
            headers: {
              Authorization: `Bearer ${user.token}`,
            },
          });
          
          if (dashboardResponse.ok) {
            const dashboardData = await dashboardResponse.json();
            setDashboardData(dashboardData.data || null);
          }
          
          setIsLoading(false);
        } catch (error) {
          console.error('Erro ao carregar dados:', error);
          setIsLoading(false);
        }
      };
      
      fetchData();
    }
  }, [user, loading]);

  if (loading || isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Carregando...</h2>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700 mx-auto"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-6">Bem-vindo à Plataforma de Projetos da OAB-GO</h1>
          <p className="text-lg mb-8">Faça login para acessar todas as funcionalidades</p>
          <div className="flex justify-center gap-4">
            <Link href="/login">
              <a className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition">Login</a>
            </Link>
            <Link href="/registro">
              <a className="px-6 py-3 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition">Registro</a>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Bem-vindo, {user.nome || 'Usuário'}</h1>
        <p className="text-gray-600">Plataforma de Gerenciamento de Projetos da Comissão de Direito Digital da OAB-GO</p>
      </div>
      
      {dashboardData && <DashboardStats data={dashboardData} />}
      
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Projetos</h2>
        <Link href="/projetos/novo">
          <a className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition">Novo Projeto</a>
        </Link>
      </div>
      
      {projects.length === 0 ? (
        <div className="bg-white rounded-lg p-8 text-center shadow">
          <h3 className="text-xl mb-2">Nenhum projeto encontrado</h3>
          <p className="text-gray-600 mb-4">Seja o primeiro a propor uma ideia de projeto!</p>
          <Link href="/projetos/novo">
            <a className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition">Criar Projeto</a>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map(project => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  );
}