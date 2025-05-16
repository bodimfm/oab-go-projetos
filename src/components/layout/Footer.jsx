'use client';

export default function Footer() {
  return (
    <footer className="bg-oab-red text-white py-6 mt-auto">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <h2 className="text-xl font-bold">OAB-GO Comissões</h2>
            <p className="text-white/80 mt-1">
              Sistema de Gestão de Projetos e Comissões
            </p>
          </div>

          <div className="text-center md:text-right">
            <p className="text-white/80">
              &copy; {new Date().getFullYear()} OAB-GO. Todos os direitos reservados.
            </p>
            <div className="mt-2 text-sm text-white/70">
              <span>Rua 1121, nº 200, Setor Marista - Goiânia-GO</span>
            </div>
            <div className="mt-2 text-sm text-white/80 italic">
              Feito com ❤️ pela Comissão de Direito Digital para OAB Goiás
            </div>
            <div className="mt-1 text-sm text-white/80">
              Apoio: RM SOFTWARES E TREINAMENTOS LTDA
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}