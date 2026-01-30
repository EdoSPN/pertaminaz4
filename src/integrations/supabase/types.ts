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
      chart_datasets: {
        Row: {
          chart_type: string | null
          columns: Json
          created_at: string | null
          created_by: string
          data: Json
          id: string
          name: string
          updated_at: string | null
          x_axis: string | null
          y_axis: string | null
        }
        Insert: {
          chart_type?: string | null
          columns?: Json
          created_at?: string | null
          created_by: string
          data?: Json
          id?: string
          name: string
          updated_at?: string | null
          x_axis?: string | null
          y_axis?: string | null
        }
        Update: {
          chart_type?: string | null
          columns?: Json
          created_at?: string | null
          created_by?: string
          data?: Json
          id?: string
          name?: string
          updated_at?: string | null
          x_axis?: string | null
          y_axis?: string | null
        }
        Relationships: []
      }
      document_file_logs: {
        Row: {
          action: string
          created_at: string | null
          document_file_id: string | null
          id: string
          monitoring_data_id: string
          status_category: string
          user_id: string
          user_name: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          document_file_id?: string | null
          id?: string
          monitoring_data_id: string
          status_category: string
          user_id: string
          user_name?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          document_file_id?: string | null
          id?: string
          monitoring_data_id?: string
          status_category?: string
          user_id?: string
          user_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "document_file_logs_document_file_id_fkey"
            columns: ["document_file_id"]
            isOneToOne: false
            referencedRelation: "document_files"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_file_logs_monitoring_data_id_fkey"
            columns: ["monitoring_data_id"]
            isOneToOne: false
            referencedRelation: "prabumulih_monitoring_data"
            referencedColumns: ["id"]
          },
        ]
      }
      document_files: {
        Row: {
          file_name: string
          file_path: string
          file_size: number | null
          file_type: string | null
          id: string
          monitoring_data_id: string
          status_category: string
          uploaded_at: string | null
          uploaded_by: string
        }
        Insert: {
          file_name: string
          file_path: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          monitoring_data_id: string
          status_category: string
          uploaded_at?: string | null
          uploaded_by: string
        }
        Update: {
          file_name?: string
          file_path?: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          monitoring_data_id?: string
          status_category?: string
          uploaded_at?: string | null
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "document_files_monitoring_data_id_fkey"
            columns: ["monitoring_data_id"]
            isOneToOne: false
            referencedRelation: "prabumulih_monitoring_data"
            referencedColumns: ["id"]
          },
        ]
      }
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
      limau_monitoring_data: {
        Row: {
          actual_submit_ifa: string | null
          actual_submit_ifb: string | null
          actual_submit_ifr: string | null
          approval_comment: string | null
          approval_status: Database["public"]["Enums"]["approval_status"]
          created_at: string | null
          document_number: string | null
          file_name: string
          id: string
          pic: string | null
          project_id: string
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
          document_number?: string | null
          file_name: string
          id?: string
          pic?: string | null
          project_id: string
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
          document_number?: string | null
          file_name?: string
          id?: string
          pic?: string | null
          project_id?: string
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
        Relationships: [
          {
            foreignKeyName: "limau_monitoring_data_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "limau_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      limau_projects: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          finished_at: string | null
          id: string
          project_name: string
          status: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          finished_at?: string | null
          id?: string
          project_name: string
          status?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          finished_at?: string | null
          id?: string
          project_name?: string
          status?: string | null
          updated_at?: string
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
          document_number: string | null
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
          document_number?: string | null
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
          document_number?: string | null
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
      okrt_monitoring_data: {
        Row: {
          actual_submit_ifa: string | null
          actual_submit_ifb: string | null
          actual_submit_ifr: string | null
          approval_comment: string | null
          approval_status: Database["public"]["Enums"]["approval_status"]
          created_at: string | null
          document_number: string | null
          file_name: string
          id: string
          pic: string | null
          project_id: string
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
          document_number?: string | null
          file_name: string
          id?: string
          pic?: string | null
          project_id: string
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
          document_number?: string | null
          file_name?: string
          id?: string
          pic?: string | null
          project_id?: string
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
        Relationships: [
          {
            foreignKeyName: "okrt_monitoring_data_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "okrt_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      okrt_projects: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          finished_at: string | null
          id: string
          project_name: string
          status: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          finished_at?: string | null
          id?: string
          project_name: string
          status?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          finished_at?: string | null
          id?: string
          project_name?: string
          status?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      prabumulih_monitoring_data: {
        Row: {
          actual_submit_ifa: string | null
          actual_submit_ifb: string | null
          actual_submit_ifr: string | null
          approval_comment: string | null
          approval_status: Database["public"]["Enums"]["approval_status"]
          created_at: string | null
          document_number: string | null
          field: string | null
          file_name: string
          id: string
          pic: string | null
          project_id: string
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
          document_number?: string | null
          field?: string | null
          file_name: string
          id?: string
          pic?: string | null
          project_id: string
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
          document_number?: string | null
          field?: string | null
          file_name?: string
          id?: string
          pic?: string | null
          project_id?: string
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
        Relationships: [
          {
            foreignKeyName: "prabumulih_monitoring_data_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "prabumulih_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      prabumulih_projects: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          finished_at: string | null
          id: string
          project_name: string
          status: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          finished_at?: string | null
          id?: string
          project_name: string
          status?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          finished_at?: string | null
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
      approval_status: "Approved" | "Denied" | "Pending" | "Denied with Comment"
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
      approval_status: ["Approved", "Denied", "Pending", "Denied with Comment"],
      status_category: ["IFR", "IFA", "IFB"],
      status_description: ["Not Yet", "In-Progress", "Complete"],
    },
  },
} as const
