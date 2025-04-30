# Guia de Integração com o Supabase

Este guia descreve os passos necessários para configurar o Supabase como backend do sistema OAB-GO Projetos.

## 1. Criação do Projeto no Supabase

1. Acesse [https://supabase.com](https://supabase.com) e faça login ou crie uma conta
2. Clique em "New Project"
3. Preencha as informações:
   - Name: `oab-go-projetos`
   - Database Password: [defina uma senha forte]
   - Region: `South America (São Paulo)`
   - Pricing Plan: Free tier (ou escolha outro plano conforme necessidade)
4. Clique em "Create new project"

## 2. Configuração do Banco de Dados

### Criar Tabelas

Execute os seguintes scripts SQL no SQL Editor do Supabase:

```sql
-- Criação da tabela de projetos
CREATE TABLE projetos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  titulo VARCHAR(255) NOT NULL,
  descricao TEXT,
  objetivo TEXT,
  publico_alvo TEXT,
  beneficios TEXT,
  recursos_necessarios TEXT,
  prazo_estimado VARCHAR(100),
  status VARCHAR(50) DEFAULT 'Proposto',
  autor_id UUID,
  autor_nome VARCHAR(255),
  votos INTEGER DEFAULT 0,
  data_criacao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  data_atualizacao TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criação de índices para otimizar consultas
CREATE INDEX idx_projetos_status ON projetos(status);
CREATE INDEX idx_projetos_autor_id ON projetos(autor_id);

-- Tabela de categorias
CREATE TABLE categorias (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome VARCHAR(100) NOT NULL UNIQUE,
  descricao TEXT,
  data_criacao TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Relacionamento projetos-categorias (N:N)
CREATE TABLE projetos_categorias (
  projeto_id UUID REFERENCES projetos(id) ON DELETE CASCADE,
  categoria_id UUID REFERENCES categorias(id) ON DELETE CASCADE,
  PRIMARY KEY (projeto_id, categoria_id)
);

-- Criação de índices
CREATE INDEX idx_projetos_categorias_projeto_id ON projetos_categorias(projeto_id);
CREATE INDEX idx_projetos_categorias_categoria_id ON projetos_categorias(categoria_id);

-- Tabela de comentários
CREATE TABLE comentarios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  projeto_id UUID NOT NULL REFERENCES projetos(id) ON DELETE CASCADE,
  autor_id UUID,
  autor_nome VARCHAR(255),
  conteudo TEXT NOT NULL,
  data_criacao TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criação de índice
CREATE INDEX idx_comentarios_projeto_id ON comentarios(projeto_id);

-- Tabela de votos
CREATE TABLE votos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  projeto_id UUID NOT NULL REFERENCES projetos(id) ON DELETE CASCADE,
  usuario_id UUID NOT NULL,
  data_voto TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Garantir que cada usuário só possa votar uma vez por projeto
  CONSTRAINT unique_projeto_usuario UNIQUE (projeto_id, usuario_id)
);

-- Criação de índices
CREATE INDEX idx_votos_projeto_id ON votos(projeto_id);
CREATE INDEX idx_votos_usuario_id ON votos(usuario_id);

-- Tabela de usuários
CREATE TABLE usuarios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  numero_oab VARCHAR(50),
  cargo VARCHAR(100),
  area_atuacao VARCHAR(255),
  data_cadastro TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ultima_atualizacao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  perfil VARCHAR(50) DEFAULT 'membro' -- Opções: 'membro', 'moderador', 'administrador'
);

-- Criação de índices
CREATE INDEX idx_usuarios_email ON usuarios(email);
CREATE INDEX idx_usuarios_numero_oab ON usuarios(numero_oab);
```

### Criar Funções e Triggers

```sql
-- Função para atualizar a contagem de votos em um projeto
CREATE OR REPLACE FUNCTION atualizar_contagem_votos()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Incrementa o contador de votos
    UPDATE projetos SET votos = votos + 1 WHERE id = NEW.projeto_id;
  ELSIF TG_OP = 'DELETE' THEN
    -- Decrementa o contador de votos
    UPDATE projetos SET votos = votos - 1 WHERE id = OLD.projeto_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar a contagem de votos quando um voto é adicionado ou removido
CREATE TRIGGER trigger_atualizar_votos
AFTER INSERT OR DELETE ON votos
FOR EACH ROW
EXECUTE FUNCTION atualizar_contagem_votos();

-- Função para atualizar a data_atualizacao de um projeto
CREATE OR REPLACE FUNCTION atualizar_data_modificacao()
RETURNS TRIGGER AS $$
BEGIN
  NEW.data_atualizacao = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar a data_atualizacao quando um projeto é modificado
CREATE TRIGGER trigger_atualizar_data_modificacao
BEFORE UPDATE ON projetos
FOR EACH ROW
EXECUTE FUNCTION atualizar_data_modificacao();
```

### Configurar Políticas de Segurança (RLS)

```sql
-- Habilitar RLS para todas as tabelas
ALTER TABLE projetos ENABLE ROW LEVEL SECURITY;
ALTER TABLE comentarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE votos ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE projetos_categorias ENABLE ROW LEVEL SECURITY;

-- Criar políticas para projetos
-- Qualquer pessoa autenticada pode ver projetos
CREATE POLICY projetos_select ON projetos
  FOR SELECT USING (true);

-- Apenas o autor ou moderadores/administradores podem editar projetos
CREATE POLICY projetos_update ON projetos
  FOR UPDATE USING (
    autor_id = auth.uid() OR 
    EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid() AND perfil IN ('moderador', 'administrador'))
  );

-- Qualquer pessoa autenticada pode criar projetos
CREATE POLICY projetos_insert ON projetos
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Apenas o autor ou moderadores/administradores podem excluir projetos
CREATE POLICY projetos_delete ON projetos
  FOR DELETE USING (
    autor_id = auth.uid() OR 
    EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid() AND perfil IN ('moderador', 'administrador'))
  );

-- Políticas para comentários
-- Qualquer pessoa autenticada pode ver comentários
CREATE POLICY comentarios_select ON comentarios
  FOR SELECT USING (true);

-- Apenas o autor pode editar seus comentários
CREATE POLICY comentarios_update ON comentarios
  FOR UPDATE USING (autor_id = auth.uid());

-- Qualquer pessoa autenticada pode criar comentários
CREATE POLICY comentarios_insert ON comentarios
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Apenas o autor ou moderadores/administradores podem excluir comentários
CREATE POLICY comentarios_delete ON comentarios
  FOR DELETE USING (
    autor_id = auth.uid() OR 
    EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid() AND perfil IN ('moderador', 'administrador'))
  );

-- Políticas para votos
-- Qualquer pessoa autenticada pode ver votos
CREATE POLICY votos_select ON votos
  FOR SELECT USING (true);

-- Apenas o próprio usuário pode criar um voto com seu ID
CREATE POLICY votos_insert ON votos
  FOR INSERT WITH CHECK (usuario_id = auth.uid());

-- Apenas o próprio usuário pode excluir seu voto
CREATE POLICY votos_delete ON votos
  FOR DELETE USING (usuario_id = auth.uid());

-- Políticas para usuários
-- Apenas administradores podem ver todos os usuários
CREATE POLICY usuarios_select_admin ON usuarios
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid() AND perfil = 'administrador')
  );

-- Usuários podem ver seu próprio perfil
CREATE POLICY usuarios_select_own ON usuarios
  FOR SELECT USING (id = auth.uid());

-- Usuários podem editar seus próprios dados
CREATE POLICY usuarios_update_own ON usuarios
  FOR UPDATE USING (id = auth.uid());

-- Apenas administradores podem editar outros usuários
CREATE POLICY usuarios_update_admin ON usuarios
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid() AND perfil = 'administrador')
  );

-- Políticas para categorias
-- Qualquer pessoa pode ver categorias
CREATE POLICY categorias_select ON categorias
  FOR SELECT USING (true);

-- Apenas moderadores e administradores podem criar, editar ou excluir categorias
CREATE POLICY categorias_insert ON categorias
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid() AND perfil IN ('moderador', 'administrador'))
  );

CREATE POLICY categorias_update ON categorias
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid() AND perfil IN ('moderador', 'administrador'))
  );

CREATE POLICY categorias_delete ON categorias
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid() AND perfil IN ('moderador', 'administrador'))
  );

-- Políticas para projetos_categorias
-- Qualquer pessoa pode ver relacionamentos de projetos_categorias
CREATE POLICY projetos_categorias_select ON projetos_categorias
  FOR SELECT USING (true);

-- Apenas o autor do projeto ou moderadores/administradores podem adicionar/remover categorias
CREATE POLICY projetos_categorias_insert ON projetos_categorias
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM projetos 
      WHERE id = projeto_id AND (
        autor_id = auth.uid() OR
        EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid() AND perfil IN ('moderador', 'administrador'))
      )
    )
  );

CREATE POLICY projetos_categorias_delete ON projetos_categorias
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM projetos 
      WHERE id = projeto_id AND (
        autor_id = auth.uid() OR
        EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid() AND perfil IN ('moderador', 'administrador'))
      )
    )
  );
```

### Inserir Categorias Iniciais

```sql
-- Inserir categorias iniciais
INSERT INTO categorias (nome, descricao) VALUES
('Proteção de Dados', 'Projetos relacionados à proteção de dados pessoais e LGPD'),
('Inteligência Artificial', 'Projetos relacionados ao uso ético e legal da inteligência artificial'),
('Direitos Digitais', 'Projetos relacionados à proteção e promoção de direitos fundamentais no ambiente digital'),
('Crimes Cibernéticos', 'Projetos relacionados à prevenção e combate a crimes cibernéticos'),
('Tecnologia Jurídica', 'Projetos relacionados ao uso de tecnologia para melhorar serviços jurídicos'),
('Educação Digital', 'Projetos educacionais sobre temas de direito digital'),
('Compliance Digital', 'Projetos relacionados à conformidade com normas e regulamentos digitais'),
('Transformação Digital', 'Projetos que auxiliam na transformação digital de serviços jurídicos'),
('Blockchain e Contratos Inteligentes', 'Projetos relacionados a tecnologias blockchain e smart contracts'),
('Metaverso e Novas Tecnologias', 'Projetos relacionados aos aspectos jurídicos de novas tecnologias');
```

## 3. Configuração da Autenticação

1. No painel do Supabase, vá para **Authentication** > **Settings**
2. Configure o serviço de e-mail:
   - Em **Email Auth**, configure um provedor de e-mail (SMTP) para envio das confirmações
   - Defina os templates de e-mail para confirmação, redefinição de senha, etc.
3. Configure as URLs de redirecionamento
   - Em **URL Configuration**, adicione as URLs do seu aplicativo (ex: `http://localhost:3000/*)` para desenvolvimento

## 4. Criar Edge Functions

1. Instale o Supabase CLI seguindo as instruções em: https://supabase.com/docs/guides/cli
2. Faça login:
   ```
   supabase login
   ```
3. Inicialize o projeto:
   ```
   supabase init
   ```
4. Crie as Edge Functions:

### Auth API Function
```typescript
// auth-api/index.ts
import { createClient } from '@supabase/supabase-js';

Deno.serve(async (req) => {
  try {
    // Verificar se a requisição é OPTIONS (preflight)
    if (req.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
        }
      });
    }

    // Obter a URL da requisição e extrair o caminho
    const url = new URL(req.url);
    const path = url.pathname.split('/').filter(segment => segment);
    
    // Ignore o primeiro segmento 'auth-api'
    const action = path[1] || '';
    
    // Criar cliente Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    let result;
    
    switch (action) {
      case 'registro':
        // Lógica para registro de usuário
        // [Implementação completa]
        break;
      
      case 'login':
        // Lógica para login
        // [Implementação completa]
        break;
      
      // [Demais endpoints]
    }
    
    // Retornar resposta com resultado
    return new Response(JSON.stringify(result), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch (error) {
    // Tratamento de erros
    return new Response(JSON.stringify({ error: error.message || 'Erro interno do servidor' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
});
```

### Projetos API Function
```typescript
// projetos-api/index.ts
import { createClient } from '@supabase/supabase-js';

Deno.serve(async (req) => {
  try {
    // Verificar se a requisição é OPTIONS (preflight)
    if (req.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
        }
      });
    }

    // Obter a URL da requisição e extrair o caminho
    const url = new URL(req.url);
    const path = url.pathname.split('/').filter(segment => segment);
    
    // Ignore o primeiro segmento 'projetos-api'
    const resource = path[1] || '';
    const id = path[2] || '';
    
    // Criar cliente Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Verificar autenticação
    const authHeader = req.headers.get('Authorization') || '';
    if (!authHeader.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Acesso não autorizado' }), {
        status: 401,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
    
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Acesso não autorizado' }), {
        status: 401,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
    
    // Roteamento baseado no método HTTP e recurso
    let result;
    
    switch (resource) {
      case 'projetos':
        // Lógica para projetos
        // [Implementação completa]
        break;
      
      // [Demais endpoints]
    }
    
    // Retornar resposta com resultado
    return new Response(JSON.stringify(result), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch (error) {
    // Tratamento de erros
    return new Response(JSON.stringify({ error: error.message || 'Erro interno do servidor' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
});
```

5. Implante as Edge Functions:
```
supabase functions deploy auth-api --project-ref seu-project-ref
supabase functions deploy projetos-api --project-ref seu-project-ref
```

## 5. Configuração do Frontend

1. Crie um arquivo `.env.local` na raiz do projeto:
```
NEXT_PUBLIC_API_URL=https://seu-project-id.supabase.co
```

2. Utilize os endpoints da API conforme documentado em [docs/API.md](./API.md)

## 6. Considerações de Segurança

1. **Segurança das Funções Edge**:
   - Sempre valide tokens no servidor
   - Implemente limitação de taxa (rate limiting)
   - Configure CORS adequadamente

2. **Políticas RLS**:
   - Certifique-se de que as políticas de segurança estão funcionando corretamente
   - Teste os diferentes níveis de acesso (membros, moderadores, administradores)

3. **Autenticação**:
   - Utilize tokens JWT para autenticação
   - Implemente refresh tokens para melhor experiência do usuário
   - Considere autenticação de dois fatores para maior segurança

## 7. Monitoramento e Manutenção

1. **Configurar Logs**:
   - Ative logs detalhados para funções edge e banco de dados

2. **Backups**:
   - Configure backups automáticos do banco de dados

3. **Monitoramento**:
   - Use o painel do Supabase para monitorar o uso de recursos
   - Configure alertas para eventos importantes

## 8. Escalabilidade

O Supabase oferece diferentes planos conforme suas necessidades crescem:

1. **Free tier**: Adequado para desenvolvimento e projetos pequenos
2. **Pro plan**: Para projetos em produção com mais recursos e limites maiores
3. **Enterprise**: Para necessidades avançadas e suporte dedicado

Avalie regularmente as necessidades do projeto e considere fazer upgrade de plano conforme o uso aumenta.
