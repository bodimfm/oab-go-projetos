'use client';

export default function Footer() {
  return (
    <footer className="bg-oab-primary-dark text-white py-8 mt-auto">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-6 md:mb-0">
            <h2 className="text-2xl font-bold">OAB GOIÁS</h2>
            <p className="text-white/80 mt-2 text-lg">
              Sistema de Gestão de Projetos e Comissões
            </p>
          </div>

          <div className="text-center md:text-right space-y-2">
            <p className="text-white/80">
              &copy; {new Date().getFullYear()} OAB-GO. Todos os direitos reservados.
            </p>
            <div className="text-sm text-white/70">
              <span>Rua 1121, nº 200, Setor Marista - Goiânia-GO</span>
            </div>
            <div className="text-sm text-white/80 italic">
              Feito com ❤️ pela Comissão de Direito Digital para OAB Goiás
            </div>
            <div className="text-sm text-white/80">
              Apoio: RM SOFTWARES E TREINAMENTOS LTDA
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}