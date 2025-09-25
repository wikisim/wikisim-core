// Update by running `node ./scripts/update_interface.cjs` and then copy over the
// interface2.ts file into here and manually revert any other changes as needed.
// node ./scripts/update_interface.cjs will run this command:
// `npx supabase gen types typescript --project-id sfkgqscbwofiphfxhnxg --schema public > src/supabase/interface2.ts`

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      data_components: {
        Row: {
          bytes_changed: number
          comment: string | null
          created_at: string
          datetime_range_end: string | null
          datetime_range_start: string | null
          datetime_repeat_every:
            | Database["public"]["Enums"]["data_component_datetime_repeat_every"]
            | null
          description: string
          dimension_ids: string[] | null
          editor_id: string
          function_arguments: Json | null
          id: number
          input_value: string | null
          label_ids: number[] | null
          owner_id: string | null
          plain_description: string
          // plain_search_text: string | null
          plain_title: string
          recursive_dependency_ids: string[] | null
          result_value: string | null
          scenarios: Json | null
          // search_vector: unknown | null
          test_run_id: string | null
          title: string
          units: string | null
          value_number_display_type:
            | Database["public"]["Enums"]["data_component_value_number_display_type"]
            | null
          value_number_sig_figs: number | null
          value_type:
            | Database["public"]["Enums"]["data_component_value_type"]
            | null
          version_number: number
          version_rolled_back_to: number | null
          version_type:
            | Database["public"]["Enums"]["data_component_version_type"]
            | null
        }
        Insert: {
          bytes_changed: number
          comment?: string | null
          created_at?: string
          datetime_range_end?: string | null
          datetime_range_start?: string | null
          datetime_repeat_every?:
            | Database["public"]["Enums"]["data_component_datetime_repeat_every"]
            | null
          description: string
          dimension_ids?: string[] | null
          editor_id: string
          function_arguments?: Json | null
          id?: number
          input_value?: string | null
          label_ids?: number[] | null
          owner_id?: string | null
          plain_description: string
          // plain_search_text?: string | null
          plain_title: string
          recursive_dependency_ids?: string[] | null
          result_value?: string | null
          scenarios?: Json | null
          // search_vector?: unknown | null
          test_run_id?: string | null
          title: string
          units?: string | null
          value_number_display_type?:
            | Database["public"]["Enums"]["data_component_value_number_display_type"]
            | null
          value_number_sig_figs?: number | null
          value_type?:
            | Database["public"]["Enums"]["data_component_value_type"]
            | null
          version_number: number
          version_rolled_back_to?: number | null
          version_type?:
            | Database["public"]["Enums"]["data_component_version_type"]
            | null
        }
        Update: {
          bytes_changed?: number
          comment?: string | null
          created_at?: string
          datetime_range_end?: string | null
          datetime_range_start?: string | null
          datetime_repeat_every?:
            | Database["public"]["Enums"]["data_component_datetime_repeat_every"]
            | null
          description?: string
          dimension_ids?: string[] | null
          editor_id?: string
          function_arguments?: Json | null
          id?: number
          input_value?: string | null
          label_ids?: number[] | null
          owner_id?: string | null
          plain_description?: string
          // plain_search_text?: string | null
          plain_title?: string
          recursive_dependency_ids?: string[] | null
          result_value?: string | null
          scenarios?: Json | null
          // search_vector?: unknown | null
          test_run_id?: string | null
          title?: string
          units?: string | null
          value_number_display_type?:
            | Database["public"]["Enums"]["data_component_value_number_display_type"]
            | null
          value_number_sig_figs?: number | null
          value_type?:
            | Database["public"]["Enums"]["data_component_value_type"]
            | null
          version_number?: number
          version_rolled_back_to?: number | null
          version_type?:
            | Database["public"]["Enums"]["data_component_version_type"]
            | null
        }
        Relationships: []
      }
      data_components_history: {
        Row: {
          bytes_changed: number
          comment: string | null
          created_at: string
          datetime_range_end: string | null
          datetime_range_start: string | null
          datetime_repeat_every:
            | Database["public"]["Enums"]["data_component_datetime_repeat_every"]
            | null
          description: string
          dimension_ids: string[] | null
          editor_id: string
          function_arguments: Json | null
          id: number
          input_value: string | null
          label_ids: number[] | null
          owner_id: string | null
          plain_description: string
          plain_title: string
          recursive_dependency_ids: string[] | null
          result_value: string | null
          scenarios: Json | null
          test_run_id: string | null
          title: string
          units: string | null
          value_number_display_type:
            | Database["public"]["Enums"]["data_component_value_number_display_type"]
            | null
          value_number_sig_figs: number | null
          value_type:
            | Database["public"]["Enums"]["data_component_value_type"]
            | null
          version_number: number
          version_rolled_back_to: number | null
          version_type:
            | Database["public"]["Enums"]["data_component_version_type"]
            | null
        }
        Insert: {
          bytes_changed: number
          comment?: string | null
          created_at?: string
          datetime_range_end?: string | null
          datetime_range_start?: string | null
          datetime_repeat_every?:
            | Database["public"]["Enums"]["data_component_datetime_repeat_every"]
            | null
          description: string
          dimension_ids?: string[] | null
          editor_id: string
          function_arguments?: Json | null
          id: number
          input_value?: string | null
          label_ids?: number[] | null
          owner_id?: string | null
          plain_description: string
          plain_title: string
          recursive_dependency_ids?: string[] | null
          result_value?: string | null
          scenarios?: Json | null
          test_run_id?: string | null
          title: string
          units?: string | null
          value_number_display_type?:
            | Database["public"]["Enums"]["data_component_value_number_display_type"]
            | null
          value_number_sig_figs?: number | null
          value_type?:
            | Database["public"]["Enums"]["data_component_value_type"]
            | null
          version_number: number
          version_rolled_back_to?: number | null
          version_type?:
            | Database["public"]["Enums"]["data_component_version_type"]
            | null
        }
        Update: {
          bytes_changed?: number
          comment?: string | null
          created_at?: string
          datetime_range_end?: string | null
          datetime_range_start?: string | null
          datetime_repeat_every?:
            | Database["public"]["Enums"]["data_component_datetime_repeat_every"]
            | null
          description?: string
          dimension_ids?: string[] | null
          editor_id?: string
          function_arguments?: Json | null
          id?: number
          input_value?: string | null
          label_ids?: number[] | null
          owner_id?: string | null
          plain_description?: string
          plain_title?: string
          recursive_dependency_ids?: string[] | null
          result_value?: string | null
          scenarios?: Json | null
          test_run_id?: string | null
          title?: string
          units?: string | null
          value_number_display_type?:
            | Database["public"]["Enums"]["data_component_value_number_display_type"]
            | null
          value_number_sig_figs?: number | null
          value_type?:
            | Database["public"]["Enums"]["data_component_value_type"]
            | null
          version_number?: number
          version_rolled_back_to?: number | null
          version_type?:
            | Database["public"]["Enums"]["data_component_version_type"]
            | null
        }
        Relationships: [
          {
            foreignKeyName: "data_components_history_id_fkey"
            columns: ["id"]
            isOneToOne: false
            referencedRelation: "data_components"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          id: string
          name: string
          name_lowercase: string | null
        }
        Insert: {
          id: string
          name?: string
          name_lowercase?: string | null
        }
        Update: {
          id?: string
          name?: string
          name_lowercase?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      __testing_insert_test_data_component: {
        Args: { p_id: number; p_test_run_id: string }
        Returns: {
          bytes_changed: number
          comment: string | null
          created_at: string
          datetime_range_end: string | null
          datetime_range_start: string | null
          datetime_repeat_every:
            | Database["public"]["Enums"]["data_component_datetime_repeat_every"]
            | null
          description: string
          dimension_ids: string[] | null
          editor_id: string
          function_arguments: Json | null
          id: number
          input_value: string | null
          label_ids: number[] | null
          owner_id: string | null
          plain_description: string
          // plain_search_text: string | null
          plain_title: string
          recursive_dependency_ids: string[] | null
          result_value: string | null
          scenarios: Json | null
          // search_vector: unknown | null
          test_run_id: string | null
          title: string
          units: string | null
          value_number_display_type:
            | Database["public"]["Enums"]["data_component_value_number_display_type"]
            | null
          value_number_sig_figs: number | null
          value_type:
            | Database["public"]["Enums"]["data_component_value_type"]
            | null
          version_number: number
          version_rolled_back_to: number | null
          version_type:
            | Database["public"]["Enums"]["data_component_version_type"]
            | null
        }
      }
      insert_data_component_v2: {
        Args: {
          components: Database["public"]["CompositeTypes"]["data_component_insert_params"][]
          server_secret: string
        }
        Returns: {
          bytes_changed: number
          comment: string | null
          created_at: string
          datetime_range_end: string | null
          datetime_range_start: string | null
          datetime_repeat_every:
            | Database["public"]["Enums"]["data_component_datetime_repeat_every"]
            | null
          description: string
          dimension_ids: string[] | null
          editor_id: string
          function_arguments: Json | null
          id: number
          input_value: string | null
          label_ids: number[] | null
          owner_id: string | null
          plain_description: string
          // plain_search_text: string | null
          plain_title: string
          recursive_dependency_ids: string[] | null
          result_value: string | null
          scenarios: Json | null
          // search_vector: unknown | null
          test_run_id: string | null
          title: string
          units: string | null
          value_number_display_type:
            | Database["public"]["Enums"]["data_component_value_number_display_type"]
            | null
          value_number_sig_figs: number | null
          value_type:
            | Database["public"]["Enums"]["data_component_value_type"]
            | null
          version_number: number
          version_rolled_back_to: number | null
          version_type:
            | Database["public"]["Enums"]["data_component_version_type"]
            | null
        }[]
      }
      search_data_components: {
        Args: {
          filter_by_component_id?: string
          filter_by_label_id?: number
          filter_by_owner_id?: string
          filter_by_wiki_or_owned?: Database["public"]["Enums"]["search_data_components_filter_by_wiki_or_owned"]
          limit_n?: number
          offset_n?: number
          order_by?: Database["public"]["Enums"]["search_data_components_order_by"]
          query: string
          similarity_threshold?: number
        }
        Returns: {
          bytes_changed: number
          comment: string
          created_at: string
          datetime_range_end: string
          datetime_range_start: string
          datetime_repeat_every: Database["public"]["Enums"]["data_component_datetime_repeat_every"]
          description: string
          dimension_ids: string[]
          editor_id: string
          function_arguments: Json
          id: number
          input_value: string
          label_ids: number[]
          method: number
          owner_id: string
          plain_description: string
          plain_title: string
          recursive_dependency_ids: string[]
          result_value: string
          scenarios: Json
          score: number
          test_run_id: string
          title: string
          units: string
          value_number_display_type: Database["public"]["Enums"]["data_component_value_number_display_type"]
          value_number_sig_figs: number
          value_type: Database["public"]["Enums"]["data_component_value_type"]
          version_number: number
          version_rolled_back_to: number
          version_type: Database["public"]["Enums"]["data_component_version_type"]
        }[]
      }
      update_data_component_v2: {
        Args: {
          components: Database["public"]["CompositeTypes"]["data_component_update_params"][]
          server_secret: string
        }
        Returns: {
          bytes_changed: number
          comment: string | null
          created_at: string
          datetime_range_end: string | null
          datetime_range_start: string | null
          datetime_repeat_every:
            | Database["public"]["Enums"]["data_component_datetime_repeat_every"]
            | null
          description: string
          dimension_ids: string[] | null
          editor_id: string
          function_arguments: Json | null
          id: number
          input_value: string | null
          label_ids: number[] | null
          owner_id: string | null
          plain_description: string
          // plain_search_text: string | null
          plain_title: string
          recursive_dependency_ids: string[] | null
          result_value: string | null
          scenarios: Json | null
          // search_vector: unknown | null
          test_run_id: string | null
          title: string
          units: string | null
          value_number_display_type:
            | Database["public"]["Enums"]["data_component_value_number_display_type"]
            | null
          value_number_sig_figs: number | null
          value_type:
            | Database["public"]["Enums"]["data_component_value_type"]
            | null
          version_number: number
          version_rolled_back_to: number | null
          version_type:
            | Database["public"]["Enums"]["data_component_version_type"]
            | null
        }[]
      }
    }
    Enums: {
      data_component_datetime_repeat_every:
        | "second"
        | "minute"
        | "hour"
        | "day"
        | "month"
        | "year"
        | "decade"
        | "century"
      data_component_value_number_display_type:
        | "bare"
        | "simple"
        | "scaled"
        | "abbreviated_scaled"
        | "percentage"
        | "scientific"
      data_component_value_type:
        | "number"
        | "datetime_range"
        | "number_array"
        | "function"
      data_component_version_type: "minor" | "rollback"
      search_data_components_filter_by_wiki_or_owned: "wiki" | "owned"
      search_data_components_order_by:
        | "score"
        | "created_at DESC"
        | "created_at ASC"
    }
    CompositeTypes: {
      data_component_insert_params: {
        p_title: string //| null
        p_description: string //| null
        p_plain_title: string //| null
        p_plain_description: string //| null
        p_bytes_changed: number //| null
        p_owner_id: string | null
        p_comment: string | null
        p_version_type:
          | Database["public"]["Enums"]["data_component_version_type"]
          | null
        p_version_rolled_back_to: number | null
        p_label_ids: number[] | null
        p_input_value: string | null
        p_result_value: string | null
        p_value_type:
          | Database["public"]["Enums"]["data_component_value_type"]
          | null
        p_value_number_display_type:
          | Database["public"]["Enums"]["data_component_value_number_display_type"]
          | null
        p_value_number_sig_figs: number | null
        p_datetime_range_start: string | null
        p_datetime_range_end: string | null
        p_datetime_repeat_every:
          | Database["public"]["Enums"]["data_component_datetime_repeat_every"]
          | null
        p_units: string | null
        p_dimension_ids: string[] | null
        p_function_arguments: Json | null
        p_scenarios: Json | null
        p_test_run_id: string | null
        p_id: number | null
        p_recursive_dependency_ids: string[] | null
      }
      data_component_update_params: {
        p_id: number //| null
        p_version_number: number //| null
        p_title: string //| null
        p_description: string //| null
        p_plain_title: string //| null
        p_plain_description: string //| null
        p_bytes_changed: number //| null
        p_comment: string | null
        p_version_type:
          | Database["public"]["Enums"]["data_component_version_type"]
          | null
        p_version_rolled_back_to: number | null
        p_label_ids: number[] | null
        p_input_value: string | null
        p_result_value: string | null
        p_value_type:
          | Database["public"]["Enums"]["data_component_value_type"]
          | null
        p_value_number_display_type:
          | Database["public"]["Enums"]["data_component_value_number_display_type"]
          | null
        p_value_number_sig_figs: number | null
        p_datetime_range_start: string | null
        p_datetime_range_end: string | null
        p_datetime_repeat_every:
          | Database["public"]["Enums"]["data_component_datetime_repeat_every"]
          | null
        p_units: string | null
        p_dimension_ids: string[] | null
        p_function_arguments: Json | null
        p_scenarios: Json | null
        p_recursive_dependency_ids: string[] | null
      }
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      data_component_datetime_repeat_every: [
        "second",
        "minute",
        "hour",
        "day",
        "month",
        "year",
        "decade",
        "century",
      ],
      data_component_value_number_display_type: [
        "bare",
        "simple",
        "scaled",
        "abbreviated_scaled",
        "percentage",
        "scientific",
      ],
      data_component_value_type: [
        "number",
        "datetime_range",
        "number_array",
        "function",
      ],
      data_component_version_type: ["minor", "rollback"],
      search_data_components_filter_by_wiki_or_owned: ["wiki", "owned"],
      search_data_components_order_by: [
        "score",
        "created_at DESC",
        "created_at ASC",
      ],
    },
  },
} as const
