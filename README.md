# Plataforma de Projetos da OAB-GO

Sistema desenvolvido para a comissão de direito digital da OAB Goiás, permitindo a gestão centralizada, aberta e democrática de ideias de projetos.

## Funcionalidades

- **Gestão de Projetos**: Cadastro, edição, visualização e exclusão de projetos
- **Votação**: Sistema de votação para priorização de projetos
- **Comentários**: Possibilidade de discussão sobre cada projeto
- **Categorização**: Organização por categorias para melhor gestão
- **Painel de Administração**: Gerenciamento de usuários, categorias e projetos
- **Autenticação**: Sistema de login, registro e recuperação de senha

## Tecnologias Utilizadas

### Backend

- **Supabase**: Plataforma de banco de dados e autenticação
- **PostgreSQL**: Banco de dados relacional
- **Edge Functions**: Funções serverless para APIs personalizadas
- **Auth**: Sistema de autenticação integrado

### Frontend

- **Next.js**: Framework React para desenvolvimento de aplicações web
- **React**: Biblioteca JavaScript para construção de interfaces
- **TailwindCSS**: Framework CSS para estilização
- **Supabase Client**: Cliente JavaScript para integração com o Supabase

## Estrutura do Banco de Dados

- **projetos**: Armazena as ideias de projetos
- **categorias**: Categorias para classificação dos projetos
- **projetos_categorias**: Relacionamento entre projetos e categorias
- **comentarios**: Comentários sobre os projetos
- **votos**: Registro de votos dos usuários em projetos
- **usuarios**: Informações dos membros da comissão

## Instalação e Configuração

### Pré-requisitos

- Node.js (versão 14 ou superior)
- NPM ou Yarn
- Conta no Supabase

### Passos para instalação

1. Clone o repositório:
   ```bash
   git clone https://github.com/bodimfm/oab-go-projetos.git
   cd oab-go-projetos
   ```

2. Instale as dependências:
   ```bash
   npm install
   # ou
   yarn install
   ```

3. Configure as variáveis de ambiente:
   Crie um arquivo `.env.local` na raiz do projeto e adicione:
   ```
   NEXT_PUBLIC_API_URL=https://seu-projeto.supabase.co
   ```

4. Execute o projeto em ambiente de desenvolvimento:
   ```bash
   npm run dev
   # ou
   yarn dev
   ```

5. Acesse o projeto no navegador:
   ```
   http://localhost:3000
   ```

## Estrutura de Permissões

- **Administrador**: Acesso total ao sistema
- **Moderador**: Gerenciamento de projetos e categorias
- **Membro**: Proposição e votação em projetos

## Fluxo de Trabalho para Proposição de Projetos

1. Membro cadastra nova ideia de projeto
2. Outros membros podem votar e comentar no projeto
3. Moderadores podem alterar o status do projeto
4. Projetos podem seguir o fluxo: Proposto → Em Análise → Aprovado → Em Execução → Concluído (ou Arquivado)

## Contribuição

Para contribuir com o projeto, siga os passos:

1. Faça um fork do repositório
2. Crie uma branch para sua feature (`git checkout -b feature/nova-funcionalidade`)
3. Faça commit das alterações (`git commit -m 'Adiciona nova funcionalidade'`)
4. Faça push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

## Licença

Este projeto está licenciado sob a licença MIT - veja o arquivo LICENSE para detalhes.

## Contato

Para mais informações, entre em contato com a comissão de direito digital da OAB Goiás.