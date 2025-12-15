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
      file_comments: {
        Row: {
          comment: string
          created_at: string
          file_id: string
          id: string
          user_id: string
        }
        Insert: {
          comment: string
          created_at?: string
          file_id: string
          id?: string
          user_id: string
        }
        Update: {
          comment?: string
          created_at?: string
          file_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "file_comments_file_id_fkey"
            columns: ["file_id"]
            isOneToOne: false
            referencedRelation: "files"
            referencedColumns: ["id"]
          },
        ]
      }
      files: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          file_name: string
          file_path: string
          file_type: string | null
          id: string
          review_notes: string | null
          review_status: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          uploaded_at: string | null
          uploaded_by: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          file_name: string
          file_path: string
          file_type?: string | null
          id?: string
          review_notes?: string | null
          review_status?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          uploaded_at?: string | null
          uploaded_by: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          file_name?: string
          file_path?: string
          file_type?: string | null
          id?: string
          review_notes?: string | null
          review_status?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          uploaded_at?: string | null
          uploaded_by?: string
        }
        Relationships: []
      }
      monitoring_data: {
        Row: {
          actual_submit_ifa: string | null
          actual_submit_ifb: string | null
          actual_submit_ifr: string | null
          approval_comment: string | null
          approval_status: Database["public"]["Enums"]["approval_status"]
          created_at: string | null
          file_name: string
          id: string
          pic: string | null
          status_category: Database["public"]["Enums"]["status_category"]
          status_description_ifa:
            | Database["public"]["Enums"]["status_description"]
            | null
          status_description_ifb:
            | Database["public"]["Enums"]["status_description"]
            | null
          status_description_ifr:
            | Database["public"]["Enums"]["status_description"]
            | null
          target_submit_ifa: string | null
          target_submit_ifb: string | null
          target_submit_ifr: string | null
          updated_at: string | null
        }
        Insert: {
          actual_submit_ifa?: string | null
          actual_submit_ifb?: string | null
          actual_submit_ifr?: string | null
          approval_comment?: string | null
          approval_status?: Database["public"]["Enums"]["approval_status"]
          created_at?: string | null
          file_name: string
          id?: string
          pic?: string | null
          status_category?: Database["public"]["Enums"]["status_category"]
          status_description_ifa?:
            | Database["public"]["Enums"]["status_description"]
            | null
          status_description_ifb?:
            | Database["public"]["Enums"]["status_description"]
            | null
          status_description_ifr?:
            | Database["public"]["Enums"]["status_description"]
            | null
          target_submit_ifa?: string | null
          target_submit_ifb?: string | null
          target_submit_ifr?: string | null
          updated_at?: string | null
        }
        Update: {
          actual_submit_ifa?: string | null
          actual_submit_ifb?: string | null
          actual_submit_ifr?: string | null
          approval_comment?: string | null
          approval_status?: Database["public"]["Enums"]["approval_status"]
          created_at?: string | null
          file_name?: string
          id?: string
          pic?: string | null
          status_category?: Database["public"]["Enums"]["status_category"]
          status_description_ifa?:
            | Database["public"]["Enums"]["status_description"]
            | null
          status_description_ifb?:
            | Database["public"]["Enums"]["status_description"]
            | null
          status_description_ifr?:
            | Database["public"]["Enums"]["status_description"]
            | null
          target_submit_ifa?: string | null
          target_submit_ifb?: string | null
          target_submit_ifr?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      prabumulih_projects: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          id: string
          project_name: string
          status: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          project_name: string
          status?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          project_name?: string
          status?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "reviewer" | "approver" | "viewer" | "user"
      approval_status: "Approved" | "Denied" | "Pending"
      status_category: "IFR" | "IFA" | "IFB"
      status_description: "Not Yet" | "In-Progress" | "Complete"
    }
    CompositeTypes: {
      [_ in never]: never
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
      app_role: ["admin", "reviewer", "approver", "viewer", "user"],
      approval_status: ["Approved", "Denied", "Pending"],
      status_category: ["IFR", "IFA", "IFB"],
      status_description: ["Not Yet", "In-Progress", "Complete"],
    },
  },
} as const
