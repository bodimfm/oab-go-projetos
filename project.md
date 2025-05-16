Implementação do Sistema de Gestão de Comissões OAB-GO
Este documento contém instruções detalhadas para implementar do zero até o deploy uma aplicação de gerenciamento de projetos e comissões da OAB-GO. Estas instruções são projetadas para serem seguidas por agentes de IA como CLAUDE CODE.
Índice

Configuração do Ambiente
Configuração do Supabase
Criação da Estrutura do Banco de Dados
Implementação das Edge Functions
Criação do Frontend React
Deploy da Aplicação
Próximos Passos

1. Configuração do Ambiente
Requisitos

Node.js (versão 18 ou superior)
npm (versão 8 ou superior)
Git
Conta Supabase

Instalação das Ferramentas
bash# Verifique a versão do Node.js
node -v

# Verifique a versão do npm
npm -v

# Instale a CLI do Supabase
npm install -g supabase
2. Configuração do Supabase
Acesso ao Projeto

Acesse o projeto Supabase com ID qnsbjljmnflihwcovuwz
Obtenha as credenciais necessárias:

URL do projeto
Chave anônima (public key)
Chave de serviço (service_role key)



Conexão com o Projeto
bash# Configurar as credenciais do Supabase como variáveis de ambiente
export SUPABASE_URL=https://qnsbjljmnflihwcovuwz.supabase.co
export SUPABASE_ANON_KEY=eyJh...  # Sua chave anônima
export SUPABASE_SERVICE_ROLE_KEY=eyJh...  # Sua chave de serviço
3. Criação da Estrutura do Banco de Dados
Utilize o SQL fornecido no arquivo database.sql para criar todas as tabelas necessárias. O arquivo contém os comandos para:

Criar tabelas para comissões
Criar tabelas para projetos
Criar tabelas de relacionamento entre projetos e comissões
Criar tabelas para membros de comissões
Criar índices para otimização de consultas
Criar funções para busca e sugestão de integrações
Inserir dados de exemplo

Execute os comandos SQL no painel SQL do Supabase ou utilize a CLI:
bash# Aplicar o script SQL usando a CLI do Supabase (se disponível)
supabase db execute --project-ref qnsbjljmnflihwcovuwz -f database.sql
4. Implementação das Edge Functions
As Edge Functions servem como API para a aplicação frontend se comunicar com o banco de dados.
Estrutura da Edge Function

Crie uma nova pasta para a função:

bashmkdir -p supabase/functions/oab-comissoes-api
cd supabase/functions/oab-comissoes-api

Crie o arquivo index.ts com o seguinte conteúdo:

typescriptimport { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  // Configuração CORS
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization"
      }
    });
  }

  // Criar cliente Supabase
  const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
  const supabase = createClient(supabaseUrl, supabaseKey);

  // Extrair o caminho da URL
  const url = new URL(req.url);
  const path = url.pathname.split("/").filter(Boolean);
  const endpoint = path[0] || "";

  try {
    // Rotas da API
    if (req.method === "GET") {
      // Listar comissões
      if (endpoint === "comissoes") {
        const { data, error } = await supabase
          .from("comissoes")
          .select("*")
          .order("nome");

        if (error) throw error;
        return new Response(JSON.stringify({ data }), {
          headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
        });
      }

      // Listar projetos
      else if (endpoint === "projetos") {
        const { data, error } = await supabase
          .from("view_projetos_comissoes")
          .select("*");

        if (error) throw error;

        // Agrupar resultados por projeto
        const projetos = {};
        data.forEach(item => {
          if (!projetos[item.projeto_id]) {
            projetos[item.projeto_id] = {
              id: item.projeto_id,
              nome: item.projeto_nome,
              descricao: item.projeto_descricao,
              status: item.projeto_status,
              objetivos: item.objetivos,
              publico_alvo: item.publico_alvo,
              data_inicio: item.data_inicio,
              data_fim_prevista: item.data_fim_prevista,
              comissoes: []
            };
          }
          
          projetos[item.projeto_id].comissoes.push({
            id: item.comissao_id,
            nome: item.comissao_nome,
            descricao: item.comissao_descricao,
            papel: item.papel_comissao
          });
        });

        return new Response(JSON.stringify({ data: Object.values(projetos) }), {
          headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
        });
      }

      // Obter projeto por ID
      else if (endpoint === "projeto" && path[1]) {
        const projetoId = path[1];
        
        // Buscar dados do projeto
        const { data: projetoData, error: projetoError } = await supabase
          .from("projetos")
          .select("*")
          .eq("id", projetoId)
          .single();

        if (projetoError) throw projetoError;

        // Buscar comissões relacionadas
        const { data: comissoesData, error: comissoesError } = await supabase
          .from("projetos_comissoes")
          .select(`
            papel_comissao,
            comissoes (id, nome, descricao, area_atuacao)
          `)
          .eq("projeto_id", projetoId);

        if (comissoesError) throw comissoesError;

        // Buscar tags do projeto
        const { data: tagsData, error: tagsError } = await supabase
          .from("tags_projetos")
          .select("tag")
          .eq("projeto_id", projetoId);

        if (tagsError) throw tagsError;

        // Formatar resposta
        const projeto = {
          ...projetoData,
          comissoes: comissoesData.map(item => ({
            papel: item.papel_comissao,
            ...item.comissoes
          })),
          tags: tagsData.map(item => item.tag)
        };

        return new Response(JSON.stringify({ data: projeto }), {
          headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
        });
      }

      // Listar membros de comissões
      else if (endpoint === "membros") {
        const comissaoId = url.searchParams.get("comissao_id");
        let query = supabase.from("view_membros_comissoes").select("*");
        
        if (comissaoId) {
          query = query.eq("comissao_id", comissaoId);
        }
        
        const { data, error } = await query.order("comissao_nome").order("membro_nome");

        if (error) throw error;
        return new Response(JSON.stringify({ data }), {
          headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
        });
      }

      // Buscar projetos ou comissões
      else if (endpoint === "buscar") {
        const termo = url.searchParams.get("termo") || "";
        
        if (!termo) {
          return new Response(JSON.stringify({ data: [] }), {
            headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
          });
        }
        
        const { data, error } = await supabase.rpc("buscar_projetos_e_comissoes", {
          termo: termo
        });

        if (error) throw error;
        return new Response(JSON.stringify({ data }), {
          headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
        });
      }

      // Sugerir integrações de projetos
      else if (endpoint === "sugerir-integracoes" && path[1]) {
        const projetoId = path[1];
        
        const { data, error } = await supabase.rpc("sugerir_integracao_projetos", {
          projeto_id: projetoId
        });

        if (error) throw error;
        return new Response(JSON.stringify({ data }), {
          headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
        });
      }

      // Buscar comissões similares
      else if (endpoint === "comissoes-similares" && path[1]) {
        const comissaoId = path[1];
        
        const { data, error } = await supabase.rpc("encontrar_comissoes_similares", {
          comissao_id: comissaoId
        });

        if (error) throw error;
        return new Response(JSON.stringify({ data }), {
          headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
        });
      }
    }
    
    // Métodos POST para criar recursos
    else if (req.method === "POST") {
      const body = await req.json();
      
      // Criar projeto
      if (endpoint === "projetos") {
        // Extrair dados do projeto e comissões relacionadas
        const { nome, descricao, objetivos, resultados_esperados, publico_alvo, 
                data_inicio, data_fim_prevista, status, comissoes, tags } = body;
        
        // Validar campos obrigatórios
        if (!nome || !status || !comissoes || comissoes.length === 0) {
          return new Response(JSON.stringify({ 
            error: "Campos obrigatórios: nome, status e pelo menos uma comissão" 
          }), {
            status: 400,
            headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
          });
        }
        
        // Iniciar transação para criar projeto e relacionamentos
        const { data: projeto, error: projetoError } = await supabase
          .from("projetos")
          .insert({
            nome,
            descricao,
            objetivos,
            resultados_esperados,
            publico_alvo,
            data_inicio,
            data_fim_prevista,
            status
          })
          .select()
          .single();
          
        if (projetoError) throw projetoError;
        
        // Relacionar com comissões
        const projetoComissoes = comissoes.map(c => ({
          projeto_id: projeto.id,
          comissao_id: c.comissao_id,
          papel_comissao: c.papel_comissao
        }));
        
        const { error: comissoesError } = await supabase
          .from("projetos_comissoes")
          .insert(projetoComissoes);
          
        if (comissoesError) throw comissoesError;
        
        // Adicionar tags, se houver
        if (tags && tags.length > 0) {
          const projetoTags = tags.map(tag => ({
            projeto_id: projeto.id,
            tag
          }));
          
          const { error: tagsError } = await supabase
            .from("tags_projetos")
            .insert(projetoTags);
            
          if (tagsError) throw tagsError;
        }
        
        return new Response(JSON.stringify({ data: projeto }), {
          headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
        });
      }
      
      // Adicionar membro a uma comissão
      else if (endpoint === "membros") {
        const { comissao_id, nome, cargo, email, telefone, inscricao_oab } = body;
        
        // Validar campos obrigatórios
        if (!comissao_id || !nome) {
          return new Response(JSON.stringify({ 
            error: "Campos obrigatórios: comissao_id e nome" 
          }), {
            status: 400,
            headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
          });
        }
        
        const { data, error } = await supabase
          .from("membros_comissoes")
          .insert({
            comissao_id,
            nome,
            cargo,
            email,
            telefone,
            inscricao_oab
          })
          .select()
          .single();
          
        if (error) throw error;
        
        return new Response(JSON.stringify({ data }), {
          headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
        });
      }
    }

    // Endpoint não encontrado
    return new Response(JSON.stringify({ error: "Endpoint não encontrado" }), {
      status: 404,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
    });
  }
});

Implante a Edge Function:

bashsupabase functions deploy oab-comissoes-api --project-ref qnsbjljmnflihwcovuwz

Configure as variáveis de ambiente para a função:

bashsupabase secrets set --env production SUPABASE_URL=$SUPABASE_URL SUPABASE_SERVICE_ROLE_KEY=$SUPABASE_SERVICE_ROLE_KEY --project-ref qnsbjljmnflihwcovuwz
5. Criação do Frontend React
Inicialização do Projeto
bash# Criar um novo projeto React
npx create-react-app oab-comissoes-app
cd oab-comissoes-app

# Instalar dependências
npm install @supabase/supabase-js react-router-dom tailwindcss@latest
Configuração do Tailwind CSS

Inicialize o Tailwind CSS:

bashnpx tailwindcss init -p

Configure o arquivo tailwind.config.js:

javascript/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [],
}

Modifique o arquivo src/index.css:

css@tailwind base;
@tailwind components;
@tailwind utilities;
Configuração do Cliente Supabase
Crie o arquivo src/supabaseClient.js:
javascriptimport { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qnsbjljmnflihwcovuwz.supabase.co';
const supabaseAnonKey = 'SUA_CHAVE_ANONIMA';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
Estrutura de Arquivos
Organize os arquivos do projeto da seguinte forma:
src/
├── components/
│   ├── Header.jsx
│   ├── Footer.jsx
│   ├── projeto/
│   │   ├── ProjetosList.jsx
│   │   ├── ProjetoDetails.jsx
│   │   └── NovoProjetoForm.jsx
│   └── membro/
│       ├── MembrosList.jsx
│       └── NovoMembroForm.jsx
├── pages/
│   ├── Home.jsx
│   ├── Projetos.jsx
│   ├── Membros.jsx
│   └── Busca.jsx
├── services/
│   └── api.js
├── App.jsx
├── index.jsx
├── supabaseClient.js
└── index.css
Implementação dos Componentes Principais
App.jsx
jsximport React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Projetos from './pages/Projetos';
import ProjetoDetails from './components/projeto/ProjetoDetails';
import NovoProjetoForm from './components/projeto/NovoProjetoForm';
import Membros from './pages/Membros';
import NovoMembroForm from './components/membro/NovoMembroForm';
import Busca from './pages/Busca';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100 flex flex-col">
        <Header />
        <main className="flex-grow py-6">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/projetos" element={<Projetos />} />
            <Route path="/projetos/novo" element={<NovoProjetoForm />} />
            <Route path="/projetos/:id" element={<ProjetoDetails />} />
            <Route path="/membros" element={<Membros />} />
            <Route path="/membros/novo" element={<NovoMembroForm />} />
            <Route path="/buscar" element={<Busca />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
services/api.js
javascriptconst API_URL = 'https://qnsbjljmnflihwcovuwz.functions.supabase.co/oab-comissoes-api';

export const api = {
  // Listar comissões
  getComissoes: async () => {
    const response = await fetch(`${API_URL}/comissoes`);
    if (!response.ok) throw new Error('Erro ao carregar comissões');
    return response.json();
  },

  // Listar projetos
  getProjetos: async () => {
    const response = await fetch(`${API_URL}/projetos`);
    if (!response.ok) throw new Error('Erro ao carregar projetos');
    return response.json();
  },

  // Obter projeto por ID
  getProjeto: async (id) => {
    const response = await fetch(`${API_URL}/projeto/${id}`);
    if (!response.ok) throw new Error('Erro ao carregar detalhes do projeto');
    return response.json();
  },

  // Sugerir integrações de projetos
  getSugestoesIntegracao: async (projetoId) => {
    const response = await fetch(`${API_URL}/sugerir-integracoes/${projetoId}`);
    if (!response.ok) throw new Error('Erro ao carregar sugestões de integração');
    return response.json();
  },

  // Listar membros de comissões
  getMembros: async (comissaoId = null) => {
    let url = `${API_URL}/membros`;
    if (comissaoId) url += `?comissao_id=${comissaoId}`;
    
    const response = await fetch(url);
    if (!response.ok) throw new Error('Erro ao carregar membros');
    return response.json();
  },

  // Buscar projetos e comissões
  buscar: async (termo) => {
    const response = await fetch(`${API_URL}/buscar?termo=${encodeURIComponent(termo)}`);
    if (!response.ok) throw new Error('Erro ao realizar busca');
    return response.json();
  },

  // Criar novo projeto
  criarProjeto: async (projeto) => {
    const response = await fetch(`${API_URL}/projetos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(projeto)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Erro ao criar projeto');
    }
    
    return response.json();
  },

  // Adicionar novo membro
  adicionarMembro: async (membro) => {
    const response = await fetch(`${API_URL}/membros`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(membro)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Erro ao adicionar membro');
    }
    
    return response.json();
  }
};
Implemente os demais componentes seguindo a estrutura definida. Cada componente deve usar as funções da API para buscar e exibir os dados necessários.
6. Deploy da Aplicação
Deploy do Frontend

Construa a aplicação para produção:

bashnpm run build

Deploy no Supabase Hosting:

bash# Instalar CLI do Vercel (ou outra plataforma de sua preferência)
npm install -g vercel

# Fazer login
vercel login

# Deploy
vercel --prod
7. Próximos Passos

Implementar autenticação: Adicionar login para controlar quem pode editar projetos
Melhorar a UI/UX: Adicionar mais feedback ao usuário durante operações
Implementar testes: Adicionar testes unitários e de integração
Adicionar notificações: Implementar um sistema de notificações para atualizações de projetos


database.sql
sql-- Criação da tabela de comissões
CREATE TABLE IF NOT EXISTS comissoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT NOT NULL,
    descricao TEXT,
    area_atuacao TEXT,
    contato_responsavel TEXT,
    data_criacao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ativa BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criação da tabela de projetos
CREATE TABLE IF NOT EXISTS projetos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT NOT NULL,
    descricao TEXT,
    objetivos TEXT,
    resultados_esperados TEXT,
    publico_alvo TEXT,
    data_inicio TIMESTAMP WITH TIME ZONE,
    data_fim_prevista TIMESTAMP WITH TIME ZONE,
    data_fim_real TIMESTAMP WITH TIME ZONE,
    status TEXT CHECK (status IN ('planejamento', 'em_andamento', 'concluido', 'cancelado')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de relação entre projetos e comissões
CREATE TABLE IF NOT EXISTS projetos_comissoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    projeto_id UUID REFERENCES projetos(id) ON DELETE CASCADE,
    comissao_id UUID REFERENCES comissoes(id) ON DELETE CASCADE,
    papel_comissao TEXT CHECK (papel_comissao IN ('lider', 'participante', 'consultivo')),
    data_entrada TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(projeto_id, comissao_id)
);

-- Tabela de tags para projetos (facilita busca por palavras-chave)
CREATE TABLE IF NOT EXISTS tags_projetos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    projeto_id UUID REFERENCES projetos(id) ON DELETE CASCADE,
    tag TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criação da tabela de membros de comissões
CREATE TABLE IF NOT EXISTS membros_comissoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    comissao_id UUID REFERENCES comissoes(id) ON DELETE CASCADE,
    nome TEXT NOT NULL,
    cargo TEXT,
    email TEXT,
    telefone TEXT,
    inscricao_oab TEXT,
    data_ingresso TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para melhorar a performance de buscas
CREATE INDEX IF NOT EXISTS idx_comissoes_nome ON comissoes USING GIN (to_tsvector('portuguese', nome));
CREATE INDEX IF NOT EXISTS idx_comissoes_descricao ON comissoes USING GIN (to_tsvector('portuguese', descricao));
CREATE INDEX IF NOT EXISTS idx_projetos_nome ON projetos USING GIN (to_tsvector('portuguese', nome));
CREATE INDEX IF NOT EXISTS idx_projetos_descricao ON projetos USING GIN (to_tsvector('portuguese', descricao));
CREATE INDEX IF NOT EXISTS idx_tags_projetos_tag ON tags_projetos USING GIN (to_tsvector('portuguese', tag));
CREATE INDEX IF NOT EXISTS idx_membros_comissoes_nome ON membros_comissoes USING GIN (to_tsvector('portuguese', nome));

-- Função para atualizar o timestamp de updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para atualizar o timestamp updated_at
CREATE TRIGGER update_comissoes_updated_at
BEFORE UPDATE ON comissoes
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projetos_updated_at
BEFORE UPDATE ON projetos
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projetos_comissoes_updated_at
BEFORE UPDATE ON projetos_comissoes
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_membros_comissoes_updated_at
BEFORE UPDATE ON membros_comissoes
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Criação de uma view para facilitar a consulta de projetos com suas comissões
CREATE OR REPLACE VIEW view_projetos_comissoes AS
SELECT 
    p.id AS projeto_id,
    p.nome AS projeto_nome,
    p.descricao AS projeto_descricao,
    p.status AS projeto_status,
    p.data_inicio,
    p.data_fim_prevista,
    p.objetivos,
    p.publico_alvo,
    c.id AS comissao_id,
    c.nome AS comissao_nome,
    c.descricao AS comissao_descricao,
    c.area_atuacao,
    pc.papel_comissao
FROM 
    projetos p
JOIN 
    projetos_comissoes pc ON p.id = pc.projeto_id
JOIN 
    comissoes c ON c.id = pc.comissao_id;

-- View para consulta de membros com informações da comissão
CREATE OR REPLACE VIEW view_membros_comissoes AS
SELECT 
    m.id AS membro_id,
    m.nome AS membro_nome,
    m.cargo,
    m.email,
    m.telefone,
    m.inscricao_oab,
    m.data_ingresso,
    m.ativo,
    c.id AS comissao_id,
    c.nome AS comissao_nome,
    c.descricao AS comissao_descricao,
    c.area_atuacao
FROM 
    membros_comissoes m
JOIN 
    comissoes c ON m.comissao_id = c.id;

-- Criação de uma função de busca por palavra-chave
CREATE OR REPLACE FUNCTION buscar_projetos_e_comissoes(termo TEXT)
RETURNS TABLE (
    tipo TEXT,
    id UUID,
    nome TEXT,
    descricao TEXT,
    match_rank REAL
) AS $$
BEGIN
    RETURN QUERY
    -- Busca nas comissões
    SELECT 
        'comissao' AS tipo,
        c.id,
        c.nome,
        c.descricao,
        ts_rank(to_tsvector('portuguese', c.nome || ' ' || COALESCE(c.descricao, '') || ' ' || COALESCE(c.area_atuacao, '')), 
                plainto_tsquery('portuguese', termo)) AS match_rank
    FROM 
        comissoes c
    WHERE 
        to_tsvector('portuguese', c.nome || ' ' || COALESCE(c.descricao, '') || ' ' || COALESCE(c.area_atuacao, '')) @@ 
        plainto_tsquery('portuguese', termo)
    
    UNION ALL
    
    -- Busca nos projetos
    SELECT 
        'projeto' AS tipo,
        p.id,
        p.nome,
        p.descricao,
        ts_rank(to_tsvector('portuguese', p.nome || ' ' || COALESCE(p.descricao, '') || ' ' || 
                COALESCE(p.objetivos, '') || ' ' || COALESCE(p.publico_alvo, '')), 
                plainto_tsquery('portuguese', termo)) AS match_rank
    FROM 
        projetos p
    LEFT JOIN
        tags_projetos tp ON p.id = tp.projeto_id
    WHERE 
        to_tsvector('portuguese', p.nome || ' ' || COALESCE(p.descricao, '') || ' ' || 
        COALESCE(p.objetivos, '') || ' ' || COALESCE(p.publico_alvo, '')) @@ 
        plainto_tsquery('portuguese', termo)
        OR to_tsvector('portuguese', tp.tag) @@ plainto_tsquery('portuguese', termo)
    GROUP BY
        p.id, p.nome, p.descricao
    
    ORDER BY match_rank DESC;
END;
$$ LANGUAGE plpgsql;

-- Função para identificar comissões com potencial sinergia
CREATE OR REPLACE FUNCTION encontrar_comissoes_similares(comissao_id UUID)
RETURNS TABLE (
    comissao_similar_id UUID,
    comissao_similar_nome TEXT,
    comissao_similar_descricao TEXT,
    projetos_similares INT,
    areas_comuns TEXT[]
) AS $$
BEGIN
    RETURN QUERY
    WITH areas_da_comissao AS (
        SELECT 
            c.area_atuacao,
            string_to_array(c.area_atuacao, ',') as areas
        FROM 
            comissoes c
        WHERE 
            c.id = comissao_id
    ),
    
    projetos_da_comissao AS (
        SELECT 
            p.id,
            p.nome,
            p.descricao,
            p.objetivos,
            p.publico_alvo
        FROM 
            projetos p
        JOIN 
            projetos_comissoes pc ON p.id = pc.projeto_id
        WHERE 
            pc.comissao_id = comissao_id
    )
    
    SELECT 
        c.id AS comissao_similar_id,
        c.nome AS comissao_similar_nome,
        c.descricao AS comissao_similar_descricao,
        COUNT(DISTINCT pc.projeto_id) AS projetos_similares,
        array_agg(DISTINCT elem) AS areas_comuns
    FROM 
        comissoes c
    JOIN 
        projetos_comissoes pc ON c.id = pc.comissao_id
    JOIN 
        projetos p ON pc.projeto_id = p.id,
        areas_da_comissao ac,
        unnest(string_to_array(c.area_atuacao, ',')) elem
    WHERE 
        c.id != comissao_id AND
        (
            -- Comissões com áreas de atuação similares
            elem = ANY(ac.areas)
            OR
            -- Comissões com projetos de objetivos similares
            EXISTS (
                SELECT 1
                FROM projetos_da_comissao pdc
                WHERE 
                    to_tsvector('portuguese', pdc.nome || ' ' || COALESCE(pdc.descricao, '') || ' ' || 
                    COALESCE(pdc.objetivos, '') || ' ' || COALESCE(pdc.publico_alvo, '')) @@
                    to_tsvector('portuguese', p.nome || ' ' || COALESCE(p.descricao, '') || ' ' || 
                    COALESCE(p.objetivos, '') || ' ' || COALESCE(p.publico_alvo, ''))
            )
        )
    GROUP BY 
        c.id, c.nome, c.descricao
    ORDER BY 
        projetos_similares DESC, c.nome;
END;
$$ LANGUAGE plpgsql;

-- Função para sugerir integrações entre projetos
CREATE OR REPLACE FUNCTION sugerir_integracao_projetos(projeto_id UUID)
RETURNS TABLE (
    projeto_similar_id UUID,
    projeto_similar_nome TEXT,
    projeto_similar_descricao TEXT,
    comissoes_comuns INT,
    pontuacao_similaridade REAL
) AS $$
BEGIN
    RETURN QUERY
    WITH comissoes_do_projeto AS (
        SELECT 
            pc.comissao_id
        FROM 
            projetos_comissoes pc
        WHERE 
            pc.projeto_id = projeto_id
    ),
    
    projeto_info AS (
        SELECT 
            p.nome,
            p.descricao,
            p.objetivos,
            p.publico_alvo,
            p.status
        FROM 
            projetos p
        WHERE 
            p.id = projeto_id
    )
    
    SELECT 
        p.id AS projeto_similar_id,
        p.nome AS projeto_similar_nome,
        p.descricao AS projeto_similar_descricao,
        COUNT(DISTINCT CASE WHEN pc.comissao_id IN (SELECT comissao_id FROM comissoes_do_projeto) THEN pc.comissao_id END) AS comissoes_comuns,
        ts_rank(
            to_tsvector('portuguese', p.nome || ' ' || COALESCE(p.descricao, '') || ' ' || 
            COALESCE(p.objetivos, '') || ' ' || COALESCE(p.publico_alvo, '')),
            to_tsvector('portuguese', pi.nome || ' ' || COALESCE(pi.descricao, '') || ' ' || 
            COALESCE(pi.objetivos, '') || ' ' || COALESCE(pi.publico_alvo, ''))
        ) AS pontuacao_similaridade
    FROM 
        projetos p
    JOIN 
        projetos_comissoes pc ON p.id = pc.projeto_id
    CROSS JOIN
        projeto_info pi
    WHERE 
        p.id != projeto_id AND
        (p.status = 'planejamento' OR p.status = 'em_andamento')
    GROUP BY 
        p.id, p.nome, p.descricao,
        to_tsvector('portuguese', p.nome || ' ' || COALESCE(p.descricao, '') || ' ' || 
        COALESCE(p.objetivos, '') || ' ' || COALESCE(p.publico_alvo, '')),
        to_tsvector('portuguese', pi.nome || ' ' || COALESCE(pi.descricao, '') || ' ' || 
        COALESCE(pi.objetivos, '') || ' ' || COALESCE(pi.publico_alvo, ''))
    HAVING
        COUNT(DISTINCT CASE WHEN pc.comissao_id IN (SELECT comissao_id FROM comissoes_do_projeto) THEN pc.comissao_id END) > 0
        OR
        ts_rank(
            to_tsvector('portuguese', p.nome || ' ' || COALESCE(p.descricao, '') || ' ' || 
            COALESCE(p.objetivos, '') || ' ' || COALESCE(p.publico_alvo, '')),
            to_tsvector('portuguese', pi.nome || ' ' || COALESCE(pi.descricao, '') || ' ' || 
            COALESCE(pi.objetivos, '') || ' ' || COALESCE(pi.publico_alvo, ''))
        ) > 0.1
    ORDER BY 
        comissoes_comuns DESC, pontuacao_similaridade DESC;
END;
$$ LANGUAGE plpgsql;

-- Inserir algumas comissões de exemplo
INSERT INTO comissoes (nome, descricao, area_atuacao, contato_responsavel)
VALUES
    ('Comissão de Direito Digital', 'Comissão responsável por assuntos relacionados ao direito digital, proteção de dados e internet', 'direito digital,proteção de dados,internet,tecnologia', 'digital@oabgo.org.br'),
    ('Comissão de Propriedade Intelectual', 'Comissão que trata de direitos autorais, marcas, patentes e outros aspectos da propriedade intelectual', 'propriedade intelectual,direitos autorais,marcas,patentes', 'propintelectual@oabgo.org.br'),
    ('Comissão de Direito Empresarial', 'Comissão que atua no âmbito do direito empresarial e comercial', 'direito empresarial,direito comercial,empresas,negócios', 'empresarial@oabgo.org.br'),
    ('Comissão de Tecnologia e Inovação', 'Comissão dedicada a discutir e promover tecnologias e inovações no âmbito jurídico', 'tecnologia,inovação,legal tech,transformação digital', 'tecnologia@oabgo.org.br'),
    ('Comissão de Proteção de Dados', 'Comissão especializada na aplicação da LGPD e outras legislações de proteção de dados', 'proteção de dados,LGPD,privacidade,segurança da informação', 'dados@oabgo.org.br'),
    ('Comissão de Startups', 'Comissão voltada para questões jurídicas relacionadas ao ecossistema de startups', 'startups,empreendedorismo,inovação,venture capital', 'startups@oabgo.org.br');

-- Inserir alguns projetos de exemplo
INSERT INTO projetos (nome, descricao, objetivos, resultados_esperados, publico_alvo, data_inicio, data_fim_prevista, status)
VALUES
    ('Cartilha sobre LGPD', 'Elaboração de uma cartilha educativa sobre a Lei Geral de Proteção de Dados', 'Educar advogados e empresas sobre as obrigações da LGPD', 'Maior conscientização sobre proteção de dados e privacidade', 'Advogados e empresas', '2025-01-15', '2025-06-30', 'em_andamento'),
    
    ('Seminário de Direito Digital', 'Realização de um seminário sobre temas atuais em direito digital', 'Promover o debate sobre questões emergentes no direito digital', 'Capacitar profissionais e estudantes sobre temas atuais de direito digital', 'Advogados, estudantes e profissionais de TI', '2025-02-10', '2025-04-30', 'planejamento'),
    
    ('Curso de Propriedade Intelectual na Era Digital', 'Curso para capacitar advogados sobre propriedade intelectual no contexto digital', 'Capacitar advogados para atuarem em questões de PI no ambiente digital', 'Formação de profissionais especializados', 'Advogados', '2025-03-20', '2025-07-10', 'em_andamento'),
    
    ('Guia de Conformidade para Startups', 'Elaboração de um guia prático para startups se adequarem às legislações', 'Auxiliar startups a se conformarem com as legislações relevantes', 'Maior conformidade legal no ecossistema de startups', 'Empreendedores e startups', '2025-04-05', '2025-08-20', 'planejamento'),
    
    ('Webinars sobre Tecnologias Jurídicas', 'Série de webinars sobre tecnologias aplicadas ao direito', 'Apresentar e discutir tecnologias que podem ser aplicadas na prática jurídica', 'Maior adoção de tecnologias por escritórios e profissionais', 'Advogados e estudantes', '2025-02-28', '2025-05-30', 'em_andamento'),
    
    ('Aplicativo OAB-GO Digital', 'Desenvolvimento de um aplicativo para facilitar o acesso dos advogados aos serviços da OAB-GO', 'Criar uma plataforma digital para acesso aos serviços da OAB-GO', 'Melhoria na experiência dos advogados com a OAB-GO', 'Advogados inscritos na OAB-GO', '2025-01-10', '2025-09-30', 'em_andamento');

-- Relacionar projetos e comissões
INSERT INTO projetos_comissoes (projeto_id, comissao_id, papel_comissao)
VALUES
    -- Cartilha sobre LGPD
    ((SELECT id FROM projetos WHERE nome = 'Cartilha sobre LGPD'), 
     (SELECT id FROM comissoes WHERE nome = 'Comissão de Proteção de Dados'), 
     'lider'),
    
    ((SELECT id FROM projetos WHERE nome = 'Cartilha sobre LGPD'), 
     (SELECT id FROM comissoes WHERE nome = 'Comissão de Direito Digital'), 
     'participante'),
    
    -- Seminário de Direito Digital
    ((SELECT id FROM projetos WHERE nome = 'Seminário de Direito Digital'), 
     (SELECT id FROM comissoes WHERE nome = 'Comissão de Direito Digital'), 
     'lider'),
    
    ((SELECT id FROM projetos WHERE nome = 'Seminário de Direito Digital'), 
     (SELECT id FROM comissoes WHERE nome = 'Comissão de Tecnologia e Inovação'), 
     'participante'),
    
    -- Curso de Propriedade Intelectual na Era Digital
    ((SELECT id FROM projetos WHERE nome = 'Curso de Propriedade Intelectual na Era Digital'), 
     (SELECT id FROM comissoes WHERE nome = 'Comissão de Propriedade Intelectual'), 
     'lider'),
    
    ((SELECT id FROM projetos WHERE nome = 'Curso de Propriedade Intelectual na Era Digital'), 
     (SELECT id FROM comissoes WHERE nome = 'Comissão de Direito Digital'), 
     'participante'),
    
    -- Guia de Conformidade para Startups
    ((SELECT id FROM projetos WHERE nome = 'Guia de Conformidade para Startups'), 
     (SELECT id FROM comissoes WHERE nome = 'Comissão de Startups'), 
     'lider'),
    
    ((SELECT id FROM projetos WHERE nome = 'Guia de Conformidade para Startups'), 
     (SELECT id FROM comissoes WHERE nome = 'Comissão de Direito Empresarial'), 
     'participante'),
    
    ((SELECT id FROM projetos WHERE nome = 'Guia de Conformidade para Startups'), 
     (SELECT id FROM comissoes WHERE nome = 'Comissão de Proteção de Dados'), 
     'consultivo'),
    
    -- Webinars sobre Tecnologias Jurídicas
    ((SELECT id FROM projetos WHERE nome = 'Webinars sobre Tecnologias Jurídicas'), 
     (SELECT id FROM comissoes WHERE nome = 'Comissão de Tecnologia e Inovação'), 
     'lider'),
    
    -- Aplicativo OAB-GO Digital
    ((SELECT id FROM projetos WHERE nome = 'Aplicativo OAB-GO Digital'), 
     (SELECT id FROM comissoes WHERE nome = 'Comissão de Tecnologia e Inovação'), 
     'lider'),
    
    ((SELECT id FROM projetos WHERE nome = 'Aplicativo OAB-GO Digital'), 
     (SELECT id FROM comissoes WHERE nome = 'Comissão de Direito Digital'), 
     'participante');

-- Adicionar algumas tags aos projetos
INSERT INTO tags_projetos (projeto_id, tag)
VALUES
    ((SELECT id FROM projetos WHERE nome = 'Cartilha sobre LGPD'), 'LGPD'),
    ((SELECT id FROM projetos WHERE nome = 'Cartilha sobre LGPD'), 'proteção de dados'),
    ((SELECT id FROM projetos WHERE nome = 'Cartilha sobre LGPD'), 'privacidade'),
    ((SELECT id FROM projetos WHERE nome = 'Cartilha sobre LGPD'), 'educativo'),
    
    ((SELECT id FROM projetos WHERE nome = 'Seminário de Direito Digital'), 'direito digital'),
    ((SELECT id FROM projetos WHERE nome = 'Seminário de Direito Digital'), 'evento'),
    ((SELECT id FROM projetos WHERE nome = 'Seminário de Direito Digital'), 'capacitação'),
    
    ((SELECT id FROM projetos WHERE nome = 'Curso de Propriedade Intelectual na Era Digital'), 'propriedade intelectual'),
    ((SELECT id FROM projetos WHERE nome = 'Curso de Propriedade Intelectual na Era Digital'), 'direitos autorais'),
    ((SELECT id FROM projetos WHERE nome = 'Curso de Propriedade Intelectual na Era Digital'), 'capacitação'),
    
    ((SELECT id FROM projetos WHERE nome = 'Guia de Conformidade para Startups'), 'startups'),
    ((SELECT id FROM projetos WHERE nome = 'Guia de Conformidade para Startups'), 'conformidade'),
    ((SELECT id FROM projetos WHERE nome = 'Guia de Conformidade para Startups'), 'empreendedorismo'),
    ((SELECT id FROM projetos WHERE nome = 'Guia de Conformidade para Startups'), 'compliance'),
    
    ((SELECT id FROM projetos WHERE nome = 'Webinars sobre Tecnologias Jurídicas'), 'tecnologia'),
    ((SELECT id FROM projetos WHERE nome = 'Webinars sobre Tecnologias Jurídicas'), 'legal tech'),
    ((SELECT id FROM projetos WHERE nome = 'Webinars sobre Tecnologias Jurídicas'), 'inovação'),
    ((SELECT id FROM projetos WHERE nome = 'Webinars sobre Tecnologias Jurídicas'), 'webinar'),
    
    ((SELECT id FROM projetos WHERE nome = 'Aplicativo OAB-GO Digital'), 'aplicativo'),
    ((SELECT id FROM projetos WHERE nome = 'Aplicativo OAB-GO Digital'), 'digital'),
    ((SELECT id FROM projetos WHERE nome = 'Aplicativo OAB-GO Digital'), 'tecnologia'),
    ((SELECT id FROM projetos WHERE nome = 'Aplicativo OAB-GO Digital'), 'serviços');

-- Inserir alguns membros de exemplo
INSERT INTO membros_comissoes (comissao_id, nome, cargo, email, telefone, inscricao_oab)
VALUES
    ((SELECT id FROM comissoes WHERE nome = 'Comissão de Direito Digital'), 
     'Ana Paula Silva', 'Presidente', 'ana.silva@exemplo.adv.br', '(62) 99123-4567', 'GO12345'),
    
    ((SELECT id FROM comissoes WHERE nome = 'Comissão de Direito Digital'), 
     'Carlos Mendes', 'Vice-Presidente', 'carlos.mendes@exemplo.adv.br', '(62) 99765-4321', 'GO23456'),
    
    ((SELECT id FROM comissoes WHERE nome = 'Comissão de Direito Digital'), 
     'Maria Oliveira', 'Secretária', 'maria.oliveira@exemplo.adv.br', '(62) 98888-7777', 'GO34567'),
    
    ((SELECT id FROM comissoes WHERE nome = 'Comissão de Proteção de Dados'), 
     'João Pereira', 'Presidente', 'joao.pereira@exemplo.adv.br', '(62) 97777-8888', 'GO45678'),
    
    ((SELECT id FROM comissoes WHERE nome = 'Comissão de Proteção de Dados'), 
     'Fernanda Santos', 'Membro', 'fernanda.santos@exemplo.adv.br', '(62) 96666-5555', 'GO56789'),
    
    ((SELECT id FROM comissoes WHERE nome = 'Comissão de Propriedade Intelectual'), 
     'Roberto Almeida', 'Presidente', 'roberto.almeida@exemplo.adv.br', '(62) 95555-6666', 'GO67890'),
    
    ((SELECT id FROM comissoes WHERE nome = 'Comissão de Tecnologia e Inovação'), 
     'Luciana Martins', 'Presidente', 'luciana.martins@exemplo.adv.br', '(62) 94444-3333', 'GO78901'),
    
    ((SELECT id FROM comissoes WHERE nome = 'Comissão de Startups'), 
     'Ricardo Costa', 'Presidente', 'ricardo.costa@exemplo.adv.br', '(62) 93333-2222', 'GO89012'),
    
    ((SELECT id FROM comissoes WHERE nome = 'Comissão de Direito Empresarial'), 