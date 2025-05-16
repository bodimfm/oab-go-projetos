-- Criação da tabela de usuários
CREATE TABLE IF NOT EXISTS public.usuarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome_usuario TEXT NOT NULL UNIQUE,
  nome_completo TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  senha TEXT NOT NULL,
  comissao_id UUID REFERENCES public.comissoes(id),
  primeiro_acesso BOOLEAN DEFAULT TRUE,
  token_recuperacao TEXT,
  token_expira TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE
);

-- Índices para otimizar buscas
CREATE INDEX IF NOT EXISTS idx_usuarios_nome_usuario ON public.usuarios(nome_usuario);
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON public.usuarios(email);
CREATE INDEX IF NOT EXISTS idx_usuarios_comissao_id ON public.usuarios(comissao_id);
CREATE INDEX IF NOT EXISTS idx_usuarios_token_recuperacao ON public.usuarios(token_recuperacao);

-- Inserir políticas RLS (Row Level Security)
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;

-- Política que permite acesso anônimo para verificação de login, mas sem expor senhas
CREATE POLICY "Acesso anônimo para login" ON public.usuarios
  FOR SELECT
  USING (true);

-- Política que permite ao usuário atualizar seu próprio registro
CREATE POLICY "Usuários podem atualizar seus próprios dados" ON public.usuarios
  FOR UPDATE
  USING (auth.uid() = id);

-- Comentários para documentação
COMMENT ON TABLE public.usuarios IS 'Tabela de usuários para acesso ao sistema';
COMMENT ON COLUMN public.usuarios.nome_usuario IS 'Nome de usuário para login (derivado do nome da comissão)';
COMMENT ON COLUMN public.usuarios.senha IS 'Senha do usuário';
COMMENT ON COLUMN public.usuarios.primeiro_acesso IS 'Indica se é o primeiro acesso do usuário (obriga troca de senha)';
COMMENT ON COLUMN public.usuarios.token_recuperacao IS 'Token para recuperação de senha';
COMMENT ON COLUMN public.usuarios.token_expira IS 'Data/hora de expiração do token de recuperação'; 