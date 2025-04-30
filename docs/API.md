# Documentação da API - OAB-GO Projetos

## Configuração do Supabase

O sistema OAB-GO Projetos utiliza o Supabase como backend, fornecendo banco de dados, autenticação e funções serverless. Esta documentação descreve as APIs disponíveis e como utilizá-las.

### Estrutura do Banco de Dados

O banco de dados PostgreSQL no Supabase contém as seguintes tabelas:

1. **projetos**: Armazena informações sobre ideias de projetos
2. **categorias**: Lista de categorias para classificação dos projetos
3. **projetos_categorias**: Relacionamento entre projetos e categorias (N:N)
4. **comentarios**: Comentários feitos pelos usuários em projetos
5. **votos**: Registro de votos dos usuários em projetos
6. **usuarios**: Informações detalhadas sobre os membros da comissão

## Edge Functions

O sistema utiliza duas Edge Functions principais para fornecer a API:

### 1. auth-api

Responsável por operações de autenticação:

#### Endpoints

| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `/auth-api/registro` | POST | Registra novo usuário |
| `/auth-api/login` | POST | Autentica um usuário |
| `/auth-api/logout` | POST | Encerra sessão |
| `/auth-api/recuperar-senha` | POST | Inicia o processo de recuperação de senha |
| `/auth-api/redefinir-senha` | POST | Redefine a senha do usuário |
| `/auth-api/verificar` | GET | Verifica se o token é válido e retorna dados do usuário |

### 2. projetos-api

Responsável por operações relacionadas a projetos, categorias, comentários e votos:

#### Endpoints

| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `/projetos-api/projetos` | GET | Lista todos os projetos |
| `/projetos-api/projetos` | POST | Cria novo projeto |
| `/projetos-api/projetos/:id` | GET | Obtém detalhes de um projeto específico |
| `/projetos-api/projetos/:id` | PUT | Atualiza um projeto |
| `/projetos-api/projetos/:id` | DELETE | Exclui um projeto |
| `/projetos-api/comentarios/:projetoId` | GET | Lista comentários de um projeto |
| `/projetos-api/comentarios/:projetoId` | POST | Adiciona comentário a um projeto |
| `/projetos-api/comentarios/:id` | DELETE | Remove um comentário |
| `/projetos-api/votar/:projetoId` | POST | Vota/remove voto em um projeto |
| `/projetos-api/categorias` | GET | Lista todas as categorias |
| `/projetos-api/categorias` | POST | Cria nova categoria |
| `/projetos-api/categorias/:id` | PUT | Atualiza uma categoria |
| `/projetos-api/categorias/:id` | DELETE | Remove uma categoria |
| `/projetos-api/usuarios` | GET | Lista todos os usuários (admin) |
| `/projetos-api/usuarios/:id` | GET | Obtém detalhes de um usuário |
| `/projetos-api/usuarios/:id` | PUT | Atualiza informações de um usuário |
| `/projetos-api/dashboard` | GET | Obtém estatísticas para o dashboard |

## Autenticação

Todas as requisições (exceto registro e login) exigem autenticação via token JWT no header:

```
Authorization: Bearer seu_token_jwt
```

O token é obtido durante o login e deve ser armazenado no cliente (localStorage).

## Exemplos de Uso

### Registro de Usuário

**Requisição:**
```http
POST /auth-api/registro
Content-Type: application/json

{
  "nome": "João Silva",
  "email": "joao.silva@exemplo.com",
  "senha": "senha123",
  "numero_oab": "GO12345",
  "cargo": "Membro",
  "area_atuacao": "Direito Digital"
}
```

**Resposta:**
```json
{
  "data": {
    "user": {
      "id": "abc123",
      "email": "joao.silva@exemplo.com",
      "user_metadata": {
        "nome": "João Silva",
        "numero_oab": "GO12345"
      }
    },
    "session": {
      "access_token": "seu_token_jwt"
    }
  },
  "error": null
}
```

### Login

**Requisição:**
```http
POST /auth-api/login
Content-Type: application/json

{
  "email": "joao.silva@exemplo.com",
  "senha": "senha123"
}
```

**Resposta:**
```json
{
  "data": {
    "user": {
      "id": "abc123",
      "email": "joao.silva@exemplo.com"
    },
    "session": {
      "access_token": "seu_token_jwt"
    }
  },
  "error": null
}
```

### Criar Novo Projeto

**Requisição:**
```http
POST /projetos-api/projetos
Authorization: Bearer seu_token_jwt
Content-Type: application/json

{
  "titulo": "Sistema de Monitoramento de LGPD",
  "descricao": "Sistema para auxiliar advogados no monitoramento de compliance com a LGPD.",
  "objetivo": "Desenvolver uma ferramenta que facilite o trabalho dos advogados na área de proteção de dados.",
  "publico_alvo": "Advogados e escritórios jurídicos",
  "beneficios": "Maior eficiência na gestão de compliance com a LGPD.",
  "recursos_necessarios": "Desenvolvimento de software",
  "prazo_estimado": "6 meses"
}
```

**Resposta:**
```json
{
  "data": {
    "id": "def456",
    "titulo": "Sistema de Monitoramento de LGPD",
    "descricao": "Sistema para auxiliar advogados no monitoramento de compliance com a LGPD.",
    "status": "Proposto",
    "autor_id": "abc123",
    "autor_nome": "João Silva",
    "votos": 0,
    "data_criacao": "2025-05-01T10:00:00Z"
  },
  "error": null
}
```

### Listar Projetos

**Requisição:**
```http
GET /projetos-api/projetos
Authorization: Bearer seu_token_jwt
```

**Resposta:**
```json
{
  "data": [
    {
      "id": "def456",
      "titulo": "Sistema de Monitoramento de LGPD",
      "descricao": "Sistema para auxiliar advogados no monitoramento de compliance com a LGPD.",
      "status": "Proposto",
      "autor_nome": "João Silva",
      "votos": 1,
      "data_criacao": "2025-05-01T10:00:00Z"
    },
    {
      "id": "ghi789",
      "titulo": "Portal de Educação Jurídica Digital",
      "descricao": "Portal para capacitação em direito digital para advogados.",
      "status": "Em Análise",
      "autor_nome": "Maria Santos",
      "votos": 3,
      "data_criacao": "2025-04-28T14:30:00Z"
    }
  ],
  "error": null
}
```

### Votar em um Projeto

**Requisição:**
```http
POST /projetos-api/votar/def456
Authorization: Bearer seu_token_jwt
```

**Resposta (ao adicionar voto):**
```json
{
  "data": {
    "action": "added",
    "voto": {
      "id": "jkl101",
      "projeto_id": "def456",
      "usuario_id": "abc123",
      "data_voto": "2025-05-02T15:45:00Z"
    }
  },
  "error": null
}
```

**Resposta (ao remover voto):**
```json
{
  "data": {
    "action": "removed"
  },
  "error": null
}
```

### Obter Dados do Dashboard

**Requisição:**
```http
GET /projetos-api/dashboard
Authorization: Bearer seu_token_jwt
```

**Resposta:**
```json
{
  "data": {
    "totalProjetos": 10,
    "projetosPorStatus": {
      "Proposto": 4,
      "Em Análise": 2,
      "Aprovado": 1,
      "Em Execução": 2,
      "Concluído": 1
    },
    "projetosMaisVotados": [
      {
        "id": "ghi789",
        "titulo": "Portal de Educação Jurídica Digital",
        "votos": 8
      },
      {
        "id": "def456",
        "titulo": "Sistema de Monitoramento de LGPD",
        "votos": 5
      }
    ],
    "projetosRecentes": [
      {
        "id": "mno102",
        "titulo": "App para Consulta de Jurisprudência em IA",
        "data_criacao": "2025-05-05T09:20:00Z"
      },
      {
        "id": "def456",
        "titulo": "Sistema de Monitoramento de LGPD",
        "data_criacao": "2025-05-01T10:00:00Z"
      }
    ]
  },
  "error": null
}
```

## Políticas de Segurança (RLS)

O Supabase utiliza Row Level Security (RLS) para garantir que os usuários acessem apenas os dados permitidos:

1. **Projetos**:
   - Todos os usuários autenticados podem ver projetos
   - Apenas o autor ou administradores/moderadores podem editar/excluir projetos

2. **Comentários**:
   - Todos os usuários autenticados podem ver comentários
   - Apenas o autor pode editar seus comentários
   - Apenas o autor ou administradores/moderadores podem excluir comentários

3. **Votos**:
   - Usuários autenticados podem ver os votos
   - Usuários só podem votar uma vez por projeto
   - Usuários só podem remover seus próprios votos

4. **Categorias**:
   - Todos podem ver categorias
   - Apenas administradores/moderadores podem criar/editar/excluir categorias

5. **Usuários**:
   - Administradores podem ver todos os usuários
   - Usuários podem ver apenas seus próprios dados
   - Administradores podem mudar o perfil de outros usuários

## Tratamento de Erros

As respostas de erro seguem um formato padrão:

```json
{
  "data": null,
  "error": {
    "message": "Mensagem descritiva do erro"
  }
}
```

Códigos de status HTTP utilizados:
- 200: Sucesso
- 400: Erro de validação ou requisição inválida
- 401: Não autenticado ou token inválido
- 403: Sem permissão para realizar a ação
- 404: Recurso não encontrado
- 500: Erro interno do servidor

## Implementação no Frontend

Para utilizar a API no frontend, utilize o seguinte padrão:

```javascript
// Exemplo de login
const login = async (email, senha) => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth-api/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, senha }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Erro ao fazer login');
    }
    
    const data = await response.json();
    const token = data.data.session.access_token;
    
    // Salvar token no localStorage
    localStorage.setItem('authToken', token);
    
    return true;
  } catch (error) {
    throw error;
  }
};
```

## Considerações Sobre Segurança

1. **Armazenamento de Tokens**: Utilize localStorage apenas em ambiente de desenvolvimento. Para produção, considere o uso de cookies HTTP-only.

2. **Autenticação**: Sempre valide tokens no servidor antes de permitir operações sensíveis.

3. **Validação de Entradas**: Todas as entradas do usuário devem ser validadas tanto no frontend quanto no backend.

4. **CORS**: Configure corretamente as políticas de CORS para permitir apenas origens confiáveis.

## Próximos Passos para Evolução da API

1. Implementar sistema de notificações para eventos (novos projetos, comentários, etc.)
2. Adicionar suporte para upload de arquivos relacionados aos projetos
3. Criar endpoints para relatórios avançados
4. Implementar sistema de tags para melhor organização além das categorias
5. Adicionar suporte para agendamento de reuniões/eventos relacionados aos projetos