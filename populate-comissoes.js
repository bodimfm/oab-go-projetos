const API_URL = 'https://qnsbjljmnflihwcovuwz.supabase.co/rest/v1';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFuc2JqbGptbmZsaWh3Y292dXd6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY5NjcyNjQsImV4cCI6MjA2MjU0MzI2NH0.UWGXOyL8J7e11W_CE3zIo5bn-5LwKQ1YtAS1V72DTtk';

// Headers padrão para todas as requisições
const defaultHeaders = {
  'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
  'apikey': SUPABASE_ANON_KEY,
  'Content-Type': 'application/json',
  'Prefer': 'return=minimal'
};

// Lista de comissões extraídas do site da OAB-GO
const comissoes = [
  { nome: "COMISSÃO DA ADVOCACIA DOCENTE (CAD)", descricao: "Comissão responsável por assuntos relacionados à advocacia docente", area_atuacao: "advocacia docente,educação jurídica" },
  { nome: "COMISSÃO DA ADVOCACIA JOVEM (CAJ)", descricao: "Comissão dedicada aos interesses e desafios dos advogados em início de carreira", area_atuacao: "advocacia jovem,início de carreira" },
  { nome: "COMISSÃO DA ADVOCACIA MUNICIPALISTA (CAM)", descricao: "Comissão especializada em questões relacionadas ao direito municipal", area_atuacao: "direito municipal,advocacia municipalista" },
  { nome: "COMISSÃO DA ADVOCACIA PÚBLICA (CAP)", descricao: "Comissão que representa os interesses dos advogados públicos", area_atuacao: "advocacia pública,direito público" },
  { nome: "COMISSÃO DA DIVERSIDADE SEXUAL E DE GÊNERO (CDSG)", descricao: "Comissão que trata de questões relacionadas à diversidade sexual e de gênero", area_atuacao: "diversidade,gênero,direitos LGBTQIA+" },
  { nome: "COMISSÃO DA MULHER ADVOGADA (CMA)", descricao: "Comissão voltada para as questões específicas das mulheres na advocacia", area_atuacao: "mulher,advocacia feminina,igualdade de gênero" },
  { nome: "COMISSÃO DAS SOCIEDADES DE ADVOGADOS (CSA)", descricao: "Comissão que trata de questões relacionadas às sociedades de advogados", area_atuacao: "sociedades de advogados,gestão de escritórios" },
  { nome: "COMISSÃO DE ACOMPANHAMENTO E PROCESSO LEGISLATIVO (CAPL)", descricao: "Comissão responsável pelo acompanhamento de projetos de lei", area_atuacao: "processo legislativo,projetos de lei" },
  { nome: "COMISSÃO DE ACOMPANHAMENTO FORENSE (CAF)", descricao: "Comissão que acompanha questões relacionadas à prática forense", area_atuacao: "prática forense,atuação judicial" },
  { nome: "COMISSÃO DE CULTURA (CC)", descricao: "Comissão responsável por promover atividades culturais na OAB", area_atuacao: "cultura,eventos culturais" },
  { nome: "COMISSÃO DE DIREITO AGRÁRIO (CDAGR)", descricao: "Comissão especializada em direito agrário e questões fundiárias", area_atuacao: "direito agrário,questões fundiárias" },
  { nome: "COMISSÃO DE DIREITO AMBIENTAL (CDA)", descricao: "Comissão dedicada ao estudo e aplicação do direito ambiental", area_atuacao: "direito ambiental,meio ambiente" },
  { nome: "COMISSÃO DE DIREITO BANCÁRIO (CDB)", descricao: "Comissão especializada em direito bancário e financeiro", area_atuacao: "direito bancário,sistema financeiro" },
  { nome: "COMISSÃO DE DIREITO CONSTITUCIONAL E LEGISLAÇÃO (CDCL)", descricao: "Comissão que trata de questões de direito constitucional", area_atuacao: "direito constitucional,legislação" },
  { nome: "COMISSÃO DE DIREITO COOPERATIVO (CDCOOP)", descricao: "Comissão especializada no direito das cooperativas", area_atuacao: "direito cooperativo,cooperativas" },
  { nome: "COMISSÃO DE DIREITO CRIMINAL (CDCRIM)", descricao: "Comissão dedicada ao estudo e prática do direito criminal", area_atuacao: "direito criminal,direito penal" },
  { nome: "COMISSÃO DE DIREITO DA SAÚDE (CDSA)", descricao: "Comissão especializada em direito da saúde", area_atuacao: "direito da saúde,saúde pública" },
  { nome: "COMISSÃO DE DIREITO DAS FAMÍLIAS (CDF)", descricao: "Comissão dedicada ao estudo e prática do direito das famílias", area_atuacao: "direito das famílias,família" },
  { nome: "COMISSÃO DE DIREITO DAS SUCESSÕES (CDS)", descricao: "Comissão especializada em direito sucessório", area_atuacao: "direito das sucessões,herança" },
  { nome: "COMISSÃO DE DIREITO DESPORTIVO (CDD)", descricao: "Comissão dedicada ao estudo e prática do direito desportivo", area_atuacao: "direito desportivo,esporte" },
  { nome: "COMISSÃO DE DIREITO DIGITAL E INFORMÁTICA (CDDI)", descricao: "Comissão especializada em direito digital e tecnologia", area_atuacao: "direito digital,tecnologia,informática" },
  { nome: "COMISSÃO DE DIREITO DO CONSUMIDOR (CDC)", descricao: "Comissão dedicada ao estudo e prática do direito do consumidor", area_atuacao: "direito do consumidor,defesa do consumidor" },
  { nome: "COMISSÃO DE DIREITO DO TERCEIRO SETOR (CTS)", descricao: "Comissão especializada em questões jurídicas do terceiro setor", area_atuacao: "terceiro setor,organizações sem fins lucrativos" },
  { nome: "COMISSÃO DE DIREITO DO TRABALHO (CDTRAB)", descricao: "Comissão dedicada ao estudo e prática do direito do trabalho", area_atuacao: "direito do trabalho,relações trabalhistas" },
  { nome: "COMISSÃO DE DIREITO DO TRÂNSITO (CDT)", descricao: "Comissão especializada em direito do trânsito", area_atuacao: "direito do trânsito,mobilidade urbana" },
  { nome: "COMISSÃO DE DIREITO EMPRESARIAL (CDE)", descricao: "Comissão dedicada ao estudo e prática do direito empresarial", area_atuacao: "direito empresarial,direito comercial" },
  { nome: "COMISSÃO DE DIREITO IMOBILIÁRIO E URBANÍSTICO (CDIU)", descricao: "Comissão especializada em direito imobiliário e urbanístico", area_atuacao: "direito imobiliário,direito urbanístico" },
  { nome: "COMISSÃO DE DIREITO MINERÁRIO (CDM)", descricao: "Comissão dedicada ao estudo e prática do direito minerário", area_atuacao: "direito minerário,mineração" },
  { nome: "COMISSÃO DE DIREITO NOTARIAL E REGISTRAL (CDNR)", descricao: "Comissão especializada em direito notarial e registral", area_atuacao: "direito notarial,registro público" },
  { nome: "COMISSÃO DE DIREITO POLÍTICO E ELEITORAL (CDPE)", descricao: "Comissão dedicada ao estudo e prática do direito político e eleitoral", area_atuacao: "direito político,direito eleitoral" },
  { nome: "COMISSÃO DE DIREITO PREVIDENCIÁRIO (CDPREV)", descricao: "Comissão especializada em direito previdenciário", area_atuacao: "direito previdenciário,seguridade social" },
  { nome: "COMISSÃO DE DIREITO SINDICAL (CDSIND)", descricao: "Comissão dedicada ao estudo e prática do direito sindical", area_atuacao: "direito sindical,sindicatos" },
  { nome: "COMISSÃO DE DIREITO TRIBUTÁRIO (CDTRIB)", descricao: "Comissão especializada em direito tributário", area_atuacao: "direito tributário,impostos" },
  { nome: "COMISSÃO DE DIREITOS HUMANOS (CDH)", descricao: "Comissão dedicada à defesa e promoção dos direitos humanos", area_atuacao: "direitos humanos,garantias fundamentais" },
  { nome: "COMISSÃO ESPECIAL DE COMPLIANCE (CECOMP)", descricao: "Comissão especializada em compliance e governança corporativa", area_atuacao: "compliance,governança,ética" },
  { nome: "COMISSÃO ESPECIAL DE DIREITO ADMINISTRATIVO (CEDADM)", descricao: "Comissão dedicada ao estudo e prática do direito administrativo", area_atuacao: "direito administrativo,administração pública" },
  { nome: "COMISSÃO ESPECIAL DE DIREITO CIVIL (CEDCIVIL)", descricao: "Comissão especializada em direito civil", area_atuacao: "direito civil,obrigações,contratos" },
  { nome: "COMISSÃO ESPECIAL DE DIREITO INTERNACIONAL (CEDI)", descricao: "Comissão dedicada ao estudo e prática do direito internacional", area_atuacao: "direito internacional,relações internacionais" },
  { nome: "COMISSÃO ESPECIAL DE MEDIAÇÃO E CONCILIAÇÃO (CMC)", descricao: "Comissão especializada em métodos alternativos de resolução de conflitos", area_atuacao: "mediação,conciliação,resolução de conflitos" },
  { nome: "COMISSÃO ESPECIAL DE TECNOLOGIA E INOVAÇÃO", descricao: "Comissão dedicada a discutir e promover tecnologias e inovações no âmbito jurídico", area_atuacao: "tecnologia,inovação,legal tech,transformação digital" },
  { nome: "COMISSÃO ESPECIAL DE PROTEÇÃO DE DADOS", descricao: "Comissão especializada na aplicação da LGPD e outras legislações de proteção de dados", area_atuacao: "proteção de dados,LGPD,privacidade,segurança da informação" },
  { nome: "COMISSÃO ESPECIAL DE STARTUPS", descricao: "Comissão voltada para questões jurídicas relacionadas ao ecossistema de startups", area_atuacao: "startups,empreendedorismo,inovação,venture capital" },
  { nome: "COMISSÃO ESPECIAL DE PROPRIEDADE INTELECTUAL", descricao: "Comissão que trata de direitos autorais, marcas, patentes e outros aspectos da propriedade intelectual", area_atuacao: "propriedade intelectual,direitos autorais,marcas,patentes" }
];

// Função para inserir comissões no Supabase
async function inserirComissoes() {
  try {
    console.log(`Iniciando inserção de ${comissoes.length} comissões...`);
    
    // Limpar a tabela de comissões existente (opcional)
    console.log('Limpando tabela...');
    await fetch(`${API_URL}/comissoes?`, {
      method: 'DELETE',
      headers: defaultHeaders
    });
    
    // Inserir as novas comissões
    console.log('Inserindo comissões...');
    const response = await fetch(`${API_URL}/comissoes`, {
      method: 'POST',
      headers: defaultHeaders,
      body: JSON.stringify(comissoes)
    });
    
    if (!response.ok) {
      throw new Error(`Erro ao inserir comissões: ${response.status} ${response.statusText}`);
    }
    
    console.log('Comissões inseridas com sucesso!');
  } catch (error) {
    console.error('Erro ao inserir comissões:', error);
  }
}

// Executar a função
inserirComissoes(); 