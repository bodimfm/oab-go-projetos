-- Habilitar RLS em todas as tabelas principais
ALTER TABLE public.comissoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.membros_comissoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projetos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projetos_comissoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags_projetos ENABLE ROW LEVEL SECURITY;

-- Políticas para tabela de comissões
-- Todos podem visualizar todas as comissões
CREATE POLICY "Todos podem visualizar comissões" ON public.comissoes
  FOR SELECT USING (true);

-- Usuários só podem modificar sua própria comissão
CREATE POLICY "Usuários podem modificar sua própria comissão" ON public.comissoes
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.usuarios
      WHERE usuarios.comissao_id = comissoes.id
      AND usuarios.id = auth.uid()
    )
  );

-- Usuários só podem excluir sua própria comissão (caso necessário)
CREATE POLICY "Usuários podem excluir sua própria comissão" ON public.comissoes
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.usuarios
      WHERE usuarios.comissao_id = comissoes.id
      AND usuarios.id = auth.uid()
    )
  );

-- Políticas para tabela de membros de comissões
-- Todos podem visualizar todos os membros
CREATE POLICY "Todos podem visualizar membros" ON public.membros_comissoes
  FOR SELECT USING (true);

-- Usuários só podem modificar membros da sua comissão
CREATE POLICY "Usuários podem modificar membros da sua comissão" ON public.membros_comissoes
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.usuarios
      WHERE usuarios.comissao_id = membros_comissoes.comissao_id
      AND usuarios.id = auth.uid()
    )
  );

-- Usuários só podem excluir membros da sua comissão
CREATE POLICY "Usuários podem excluir membros da sua comissão" ON public.membros_comissoes
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.usuarios
      WHERE usuarios.comissao_id = membros_comissoes.comissao_id
      AND usuarios.id = auth.uid()
    )
  );

-- Usuários só podem inserir membros na sua comissão
CREATE POLICY "Usuários podem inserir membros na sua comissão" ON public.membros_comissoes
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.usuarios
      WHERE usuarios.comissao_id = membros_comissoes.comissao_id
      AND usuarios.id = auth.uid()
    )
  );

-- Políticas para tabela de projetos
-- Todos podem visualizar todos os projetos
CREATE POLICY "Todos podem visualizar projetos" ON public.projetos
  FOR SELECT USING (true);

-- Usuários só podem modificar projetos vinculados à sua comissão
CREATE POLICY "Usuários podem modificar projetos de sua comissão" ON public.projetos
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.projetos_comissoes pc
      JOIN public.usuarios u ON pc.comissao_id = u.comissao_id
      WHERE pc.projeto_id = projetos.id
      AND u.id = auth.uid()
    )
  );

-- Usuários só podem excluir projetos vinculados à sua comissão
CREATE POLICY "Usuários podem excluir projetos de sua comissão" ON public.projetos
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.projetos_comissoes pc
      JOIN public.usuarios u ON pc.comissao_id = u.comissao_id
      WHERE pc.projeto_id = projetos.id
      AND u.id = auth.uid()
    )
  );

-- Todos podem inserir projetos (depois serão vinculados a comissões)
CREATE POLICY "Todos podem inserir projetos" ON public.projetos
  FOR INSERT WITH CHECK (true);

-- Políticas para tabela de projetos_comissoes
-- Todos podem visualizar todas as relações projeto-comissão
CREATE POLICY "Todos podem visualizar relações projeto-comissão" ON public.projetos_comissoes
  FOR SELECT USING (true);

-- Usuários só podem modificar relações envolvendo sua comissão
CREATE POLICY "Usuários podem modificar relações de sua comissão" ON public.projetos_comissoes
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.usuarios
      WHERE usuarios.comissao_id = projetos_comissoes.comissao_id
      AND usuarios.id = auth.uid()
    )
  );

-- Usuários só podem excluir relações envolvendo sua comissão
CREATE POLICY "Usuários podem excluir relações de sua comissão" ON public.projetos_comissoes
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.usuarios
      WHERE usuarios.comissao_id = projetos_comissoes.comissao_id
      AND usuarios.id = auth.uid()
    )
  );

-- Usuários só podem inserir relações para sua comissão
CREATE POLICY "Usuários podem inserir relações para sua comissão" ON public.projetos_comissoes
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.usuarios
      WHERE usuarios.comissao_id = projetos_comissoes.comissao_id
      AND usuarios.id = auth.uid()
    )
  );

-- Políticas para tabela de tags_projetos
-- Todos podem visualizar todas as tags
CREATE POLICY "Todos podem visualizar tags" ON public.tags_projetos
  FOR SELECT USING (true);

-- Usuários só podem modificar tags de projetos vinculados à sua comissão
CREATE POLICY "Usuários podem modificar tags de projetos de sua comissão" ON public.tags_projetos
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.projetos_comissoes pc
      JOIN public.usuarios u ON pc.comissao_id = u.comissao_id
      WHERE pc.projeto_id = tags_projetos.projeto_id
      AND u.id = auth.uid()
    )
  );

-- Usuários só podem excluir tags de projetos vinculados à sua comissão
CREATE POLICY "Usuários podem excluir tags de projetos de sua comissão" ON public.tags_projetos
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.projetos_comissoes pc
      JOIN public.usuarios u ON pc.comissao_id = u.comissao_id
      WHERE pc.projeto_id = tags_projetos.projeto_id
      AND u.id = auth.uid()
    )
  );

-- Usuários só podem inserir tags para projetos vinculados à sua comissão
CREATE POLICY "Usuários podem inserir tags para projetos de sua comissão" ON public.tags_projetos
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.projetos_comissoes pc
      JOIN public.usuarios u ON pc.comissao_id = u.comissao_id
      WHERE pc.projeto_id = tags_projetos.projeto_id
      AND u.id = auth.uid()
    )
  ); 