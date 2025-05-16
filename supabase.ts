export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          operationName?: string
          query?: string
          variables?: Json
          extensions?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      comissoes: {
        Row: {
          area_atuacao: string | null
          ativa: boolean | null
          contato_responsavel: string | null
          created_at: string | null
          data_criacao: string | null
          descricao: string | null
          id: string
          nome: string
          updated_at: string | null
        }
        Insert: {
          area_atuacao?: string | null
          ativa?: boolean | null
          contato_responsavel?: string | null
          created_at?: string | null
          data_criacao?: string | null
          descricao?: string | null
          id?: string
          nome: string
          updated_at?: string | null
        }
        Update: {
          area_atuacao?: string | null
          ativa?: boolean | null
          contato_responsavel?: string | null
          created_at?: string | null
          data_criacao?: string | null
          descricao?: string | null
          id?: string
          nome?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      membros_comissoes: {
        Row: {
          ativo: boolean | null
          cargo: string | null
          comissao_id: string | null
          created_at: string | null
          data_ingresso: string | null
          email: string | null
          id: string
          inscricao_oab: string | null
          nome: string
          telefone: string | null
          updated_at: string | null
        }
        Insert: {
          ativo?: boolean | null
          cargo?: string | null
          comissao_id?: string | null
          created_at?: string | null
          data_ingresso?: string | null
          email?: string | null
          id?: string
          inscricao_oab?: string | null
          nome: string
          telefone?: string | null
          updated_at?: string | null
        }
        Update: {
          ativo?: boolean | null
          cargo?: string | null
          comissao_id?: string | null
          created_at?: string | null
          data_ingresso?: string | null
          email?: string | null
          id?: string
          inscricao_oab?: string | null
          nome?: string
          telefone?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "membros_comissoes_comissao_id_fkey"
            columns: ["comissao_id"]
            isOneToOne: false
            referencedRelation: "comissoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "membros_comissoes_comissao_id_fkey"
            columns: ["comissao_id"]
            isOneToOne: false
            referencedRelation: "view_membros_comissoes"
            referencedColumns: ["comissao_id"]
          },
          {
            foreignKeyName: "membros_comissoes_comissao_id_fkey"
            columns: ["comissao_id"]
            isOneToOne: false
            referencedRelation: "view_projetos_comissoes"
            referencedColumns: ["comissao_id"]
          },
        ]
      }
      projetos: {
        Row: {
          created_at: string | null
          data_fim_prevista: string | null
          data_fim_real: string | null
          data_inicio: string | null
          descricao: string | null
          id: string
          nome: string
          objetivos: string | null
          publico_alvo: string | null
          resultados_esperados: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          data_fim_prevista?: string | null
          data_fim_real?: string | null
          data_inicio?: string | null
          descricao?: string | null
          id?: string
          nome: string
          objetivos?: string | null
          publico_alvo?: string | null
          resultados_esperados?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          data_fim_prevista?: string | null
          data_fim_real?: string | null
          data_inicio?: string | null
          descricao?: string | null
          id?: string
          nome?: string
          objetivos?: string | null
          publico_alvo?: string | null
          resultados_esperados?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      projetos_comissoes: {
        Row: {
          comissao_id: string | null
          created_at: string | null
          data_entrada: string | null
          id: string
          papel_comissao: string | null
          projeto_id: string | null
          updated_at: string | null
        }
        Insert: {
          comissao_id?: string | null
          created_at?: string | null
          data_entrada?: string | null
          id?: string
          papel_comissao?: string | null
          projeto_id?: string | null
          updated_at?: string | null
        }
        Update: {
          comissao_id?: string | null
          created_at?: string | null
          data_entrada?: string | null
          id?: string
          papel_comissao?: string | null
          projeto_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "projetos_comissoes_comissao_id_fkey"
            columns: ["comissao_id"]
            isOneToOne: false
            referencedRelation: "comissoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projetos_comissoes_comissao_id_fkey"
            columns: ["comissao_id"]
            isOneToOne: false
            referencedRelation: "view_membros_comissoes"
            referencedColumns: ["comissao_id"]
          },
          {
            foreignKeyName: "projetos_comissoes_comissao_id_fkey"
            columns: ["comissao_id"]
            isOneToOne: false
            referencedRelation: "view_projetos_comissoes"
            referencedColumns: ["comissao_id"]
          },
          {
            foreignKeyName: "projetos_comissoes_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "projetos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projetos_comissoes_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "view_projetos_comissoes"
            referencedColumns: ["projeto_id"]
          },
        ]
      }
      tags_projetos: {
        Row: {
          created_at: string | null
          id: string
          projeto_id: string | null
          tag: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          projeto_id?: string | null
          tag: string
        }
        Update: {
          created_at?: string | null
          id?: string
          projeto_id?: string | null
          tag?: string
        }
        Relationships: [
          {
            foreignKeyName: "tags_projetos_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "projetos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tags_projetos_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "view_projetos_comissoes"
            referencedColumns: ["projeto_id"]
          },
        ]
      }
    }
    Views: {
      view_membros_comissoes: {
        Row: {
          area_atuacao: string | null
          ativo: boolean | null
          cargo: string | null
          comissao_descricao: string | null
          comissao_id: string | null
          comissao_nome: string | null
          data_ingresso: string | null
          email: string | null
          inscricao_oab: string | null
          membro_id: string | null
          membro_nome: string | null
          telefone: string | null
        }
        Relationships: []
      }
      view_projetos_comissoes: {
        Row: {
          area_atuacao: string | null
          comissao_descricao: string | null
          comissao_id: string | null
          comissao_nome: string | null
          data_fim_prevista: string | null
          data_inicio: string | null
          objetivos: string | null
          papel_comissao: string | null
          projeto_descricao: string | null
          projeto_id: string | null
          projeto_nome: string | null
          projeto_status: string | null
          publico_alvo: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      buscar_projetos_e_comissoes: {
        Args: { termo: string }
        Returns: {
          tipo: string
          id: string
          nome: string
          descricao: string
          match_rank: number
        }[]
      }
      encontrar_comissoes_similares: {
        Args: { comissao_id: string }
        Returns: {
          comissao_similar_id: string
          comissao_similar_nome: string
          comissao_similar_descricao: string
          projetos_similares: number
          areas_comuns: string[]
        }[]
      }
      sugerir_integracao_projetos: {
        Args: { projeto_id: string }
        Returns: {
          projeto_similar_id: string
          projeto_similar_nome: string
          projeto_similar_descricao: string
          comissoes_comuns: number
          pontuacao_similaridade: number
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const
