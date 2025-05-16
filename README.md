# OAB-GO Projetos

Sistema de gerenciamento de projetos das comissões da OAB-GO.

## Tecnologias

- Next.js 14
- React 18
- Tailwind CSS
- Supabase (PostgreSQL)

## Funcionalidades

- Cadastro e gerenciamento de projetos
- Associação de projetos às comissões da OAB-GO
- Pesquisa de projetos e comissões
- Sugestões de integração entre projetos
- Sistema de autenticação para comissões
- Políticas de segurança (RLS) para controle de acesso

## Sistema de Autenticação

O sistema utiliza autenticação baseada em nome de usuário e senha:

- O nome de usuário é derivado do nome da comissão (sem espaços e acentos)
- A senha padrão para primeiro acesso é `OABGONEXT`
- No primeiro login, o usuário é obrigado a alterar sua senha
- Recuperação de senha via email cadastrado
- Cada comissão pode ter apenas um usuário vinculado

### Políticas de Segurança (RLS)

O sistema implementa políticas de Row Level Security (RLS) no banco de dados:

- Todos os usuários podem visualizar todas as informações (projetos, comissões, membros)
- Cada usuário só pode editar/excluir dados relacionados à sua própria comissão
- Projetos compartilhados entre comissões podem ser editados por qualquer comissão participante

## Desenvolvimento local

1. Clone o repositório:
```bash
git clone https://github.com/bodimfm/oab-go-projetos.git
cd oab-go-projetos
```

2. Instale as dependências:
```bash
npm install
```

3. Crie um arquivo `.env.local` na raiz do projeto com as seguintes variáveis:
```
NEXT_PUBLIC_SUPABASE_URL=https://qnsbjljmnflihwcovuwz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFuc2JqbGptbmZsaWh3Y292dXd6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY5NjcyNjQsImV4cCI6MjA2MjU0MzI2NH0.UWGXOyL8J7e11W_CE3zIo5bn-5LwKQ1YtAS1V72DTtk
```

4. Execute o servidor de desenvolvimento:
```bash
npm run dev
```

5. Acesse o projeto em [http://localhost:3000](http://localhost:3000)

## Populando a base de dados

Para popular a base de dados com as comissões da OAB-GO, execute:

```bash
node populate-comissoes.js
```

## Aplicação de migrações

Para aplicar as migrações do banco de dados, execute os scripts SQL na seguinte ordem:

1. `criar_tabela_usuarios.sql` - Cria a tabela de usuários
2. `politicas_rls.sql` - Aplica as políticas de segurança RLS

## Deploy no Vercel

1. Certifique-se de ter uma conta no [Vercel](https://vercel.com)

2. Instale a CLI do Vercel (opcional):
```bash
npm i -g vercel
```

3. Faça o deploy:
```bash
vercel
```

Ou use o método de deploy via GitHub:

1. Faça o push do seu código para um repositório GitHub
2. Importe o projeto no [Dashboard da Vercel](https://vercel.com/dashboard)
3. Configure as variáveis de ambiente:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Clique em "Deploy"

## Licença

Este projeto está licenciado sob a Licença ISC. 