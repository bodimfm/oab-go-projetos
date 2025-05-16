'use client';

export default function Footer() {
  return (
    <footer className="bg-blue-800 text-white py-6 mt-auto">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <h2 className="text-xl font-bold">OAB-GO Comissões</h2>
            <p className="text-blue-200 mt-1">
              Sistema de Gestão de Projetos e Comissões
            </p>
          </div>

          <div className="text-center md:text-right">
            <p className="text-blue-200">
              &copy; {new Date().getFullYear()} OAB-GO. Todos os direitos reservados.
            </p>
            <div className="mt-2 text-sm text-blue-300">
              <span>Desenvolvido com ❤️ para a OAB-GO</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}