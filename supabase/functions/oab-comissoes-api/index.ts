import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
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