/* eslint-disable */
// Adapted from
// `npx supabase gen types typescript --project-id sfkgqscbwofiphfxhnxg --schema public > src/supabase/interface.ts`

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
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
          id: number
          label_ids: number[] | null
          plain_description: string
          plain_title: string
          test_run_id: string | null
          title: string
          units: string | null
          value: string | null
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
          id?: number
          label_ids?: number[] | null
          plain_description: string
          plain_title: string
          test_run_id?: string | null
          title: string
          units?: string | null
          value?: string | null
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
          id?: number
          label_ids?: number[] | null
          plain_description?: string
          plain_title?: string
          test_run_id?: string | null
          title?: string
          units?: string | null
          value?: string | null
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
      data_components_archive: {
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
          id: number
          label_ids: number[] | null
          plain_description: string
          plain_title: string
          test_run_id: string | null
          title: string
          units: string | null
          value: string | null
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
          id: number
          label_ids?: number[] | null
          plain_description: string
          plain_title: string
          test_run_id?: string | null
          title: string
          units?: string | null
          value?: string | null
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
          id?: number
          label_ids?: number[] | null
          plain_description?: string
          plain_title?: string
          test_run_id?: string | null
          title?: string
          units?: string | null
          value?: string | null
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
            foreignKeyName: "data_components_archive_id_fkey"
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
    }
    Functions: {
      insert_data_component: {
        Args:
          | {
              p_editor_id: string
              p_comment: string
              p_bytes_changed: number
              p_version_type: Database["public"]["Enums"]["data_component_version_type"]
              p_version_rolled_back_to: number
              p_title: string
              p_description: string
              p_label_ids: number[]
              p_value: string
              p_value_type: Database["public"]["Enums"]["data_component_value_type"]
              p_datetime_range_start: string
              p_datetime_range_end: string
              p_datetime_repeat_every: Database["public"]["Enums"]["data_component_datetime_repeat_every"]
              p_units: string
              p_dimension_ids: string[]
              p_plain_title: string
              p_plain_description: string
              p_test_run_id?: string
              p_id?: number
            }
          | {
              p_editor_id: string
              p_title: string
              p_description: string
              p_plain_title: string
              p_plain_description: string
              p_bytes_changed: number
              p_comment?: string
              p_version_type?: Database["public"]["Enums"]["data_component_version_type"]
              p_version_rolled_back_to?: number
              p_label_ids?: number[]
              p_value?: string
              p_value_type?: Database["public"]["Enums"]["data_component_value_type"]
              p_datetime_range_start?: string
              p_datetime_range_end?: string
              p_datetime_repeat_every?: Database["public"]["Enums"]["data_component_datetime_repeat_every"]
              p_units?: string
              p_dimension_ids?: string[]
              p_test_run_id?: string
              p_id?: number
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
          id: number
          label_ids: number[] | null
          plain_description: string
          plain_title: string
          test_run_id: string | null
          title: string
          units: string | null
          value: string | null
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
      update_data_component: {
        Args:
          | {
              p_id: number
              p_version_number: number
              p_editor_id: string
              p_comment: string
              p_bytes_changed: number
              p_version_type: Database["public"]["Enums"]["data_component_version_type"]
              p_version_rolled_back_to: number
              p_title: string
              p_description: string
              p_label_ids: number[]
              p_value: string
              p_value_type: Database["public"]["Enums"]["data_component_value_type"]
              p_datetime_range_start: string
              p_datetime_range_end: string
              p_datetime_repeat_every: Database["public"]["Enums"]["data_component_datetime_repeat_every"]
              p_units: string
              p_dimension_ids: string[]
              p_plain_title: string
              p_plain_description: string
            }
          | {
              p_id: number
              p_version_number: number
              p_editor_id: string
              p_title: string
              p_description: string
              p_plain_title: string
              p_plain_description: string
              p_bytes_changed: number
              p_comment?: string
              p_version_type?: Database["public"]["Enums"]["data_component_version_type"]
              p_version_rolled_back_to?: number
              p_label_ids?: number[]
              p_value?: string
              p_value_type?: Database["public"]["Enums"]["data_component_value_type"]
              p_datetime_range_start?: string
              p_datetime_range_end?: string
              p_datetime_repeat_every?: Database["public"]["Enums"]["data_component_datetime_repeat_every"]
              p_units?: string
              p_dimension_ids?: string[]
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
          id: number
          label_ids: number[] | null
          plain_description: string
          plain_title: string
          test_run_id: string | null
          title: string
          units: string | null
          value: string | null
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
      data_component_value_type: "number" | "datetime_range" | "number_array"
      data_component_version_type: "minor" | "rollback"
    }
    CompositeTypes: {
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
      data_component_value_type: ["number", "datetime_range", "number_array"],
      data_component_version_type: ["minor", "rollback"],
    },
  },
} as const
