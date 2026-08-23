export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.15";
  };
  public: {
    Tables: {
      complaint_comments: {
        Row: {
          author_id: string;
          comment: string;
          complaint_id: string;
          created_at: string;
          id: string;
        };
        Insert: {
          author_id: string;
          comment: string;
          complaint_id: string;
          created_at?: string;
          id?: string;
        };
        Update: {
          author_id?: string;
          comment?: string;
          complaint_id?: string;
          created_at?: string;
          id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "complaint_comments_author_id_fkey";
            columns: ["author_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "complaint_comments_complaint_id_fkey";
            columns: ["complaint_id"];
            isOneToOne: false;
            referencedRelation: "complaints";
            referencedColumns: ["id"];
          },
        ];
      };
      complaint_history: {
        Row: {
          actor_id: string | null;
          complaint_id: string;
          created_at: string;
          id: string;
          new_status: Database["public"]["Enums"]["complaint_status"] | null;
          note: string | null;
          old_status: Database["public"]["Enums"]["complaint_status"] | null;
        };
        Insert: {
          actor_id?: string | null;
          complaint_id: string;
          created_at?: string;
          id?: string;
          new_status?: Database["public"]["Enums"]["complaint_status"] | null;
          note?: string | null;
          old_status?: Database["public"]["Enums"]["complaint_status"] | null;
        };
        Update: {
          actor_id?: string | null;
          complaint_id?: string;
          created_at?: string;
          id?: string;
          new_status?: Database["public"]["Enums"]["complaint_status"] | null;
          note?: string | null;
          old_status?: Database["public"]["Enums"]["complaint_status"] | null;
        };
        Relationships: [
          {
            foreignKeyName: "complaint_history_actor_id_fkey";
            columns: ["actor_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "complaint_history_complaint_id_fkey";
            columns: ["complaint_id"];
            isOneToOne: false;
            referencedRelation: "complaints";
            referencedColumns: ["id"];
          },
        ];
      };
      complaint_photos: {
        Row: {
          complaint_id: string;
          id: string;
          storage_path: string;
          uploaded_at: string;
        };
        Insert: {
          complaint_id: string;
          id?: string;
          storage_path: string;
          uploaded_at?: string;
        };
        Update: {
          complaint_id?: string;
          id?: string;
          storage_path?: string;
          uploaded_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "complaint_photos_complaint_id_fkey";
            columns: ["complaint_id"];
            isOneToOne: false;
            referencedRelation: "complaints";
            referencedColumns: ["id"];
          },
        ];
      };
      complaints: {
        Row: {
          category: string;
          created_at: string;
          description: string;
          id: string;
          is_overdue: boolean;
          location: string | null;
          priority: Database["public"]["Enums"]["complaint_priority"];
          resident_id: string;
          resolved_at: string | null;
          status: Database["public"]["Enums"]["complaint_status"];
          title: string;
        };
        Insert: {
          category: string;
          created_at?: string;
          description?: string;
          id?: string;
          is_overdue?: boolean;
          location?: string | null;
          priority?: Database["public"]["Enums"]["complaint_priority"];
          resident_id: string;
          resolved_at?: string | null;
          status?: Database["public"]["Enums"]["complaint_status"];
          title: string;
        };
        Update: {
          category?: string;
          created_at?: string;
          description?: string;
          id?: string;
          is_overdue?: boolean;
          location?: string | null;
          priority?: Database["public"]["Enums"]["complaint_priority"];
          resident_id?: string;
          resolved_at?: string | null;
          status?: Database["public"]["Enums"]["complaint_status"];
          title?: string;
        };
        Relationships: [
          {
            foreignKeyName: "complaints_resident_id_fkey";
            columns: ["resident_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      notices: {
        Row: {
          author_id: string | null;
          body: string;
          created_at: string;
          id: string;
          is_important: boolean;
          title: string;
        };
        Insert: {
          author_id?: string | null;
          body?: string;
          created_at?: string;
          id?: string;
          is_important?: boolean;
          title: string;
        };
        Update: {
          author_id?: string | null;
          body?: string;
          created_at?: string;
          id?: string;
          is_important?: boolean;
          title?: string;
        };
        Relationships: [
          {
            foreignKeyName: "notices_author_id_fkey";
            columns: ["author_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      overdue_thresholds: {
        Row: {
          category: string | null;
          days: number;
          id: string;
        };
        Insert: {
          category?: string | null;
          days?: number;
          id?: string;
        };
        Update: {
          category?: string | null;
          days?: number;
          id?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          block: string | null;
          created_at: string;
          full_name: string;
          id: string;
          phone: string | null;
          role: Database["public"]["Enums"]["app_role"];
          unit_number: string | null;
        };
        Insert: {
          block?: string | null;
          created_at?: string;
          full_name?: string;
          id: string;
          phone?: string | null;
          role?: Database["public"]["Enums"]["app_role"];
          unit_number?: string | null;
        };
        Update: {
          block?: string | null;
          created_at?: string;
          full_name?: string;
          id?: string;
          phone?: string | null;
          role?: Database["public"]["Enums"]["app_role"];
          unit_number?: string | null;
        };
        Relationships: [];
      };
      resolution_feedback: {
        Row: {
          comment: string | null;
          complaint_id: string;
          created_at: string;
          id: string;
          rating: number;
        };
        Insert: {
          comment?: string | null;
          complaint_id: string;
          created_at?: string;
          id?: string;
          rating: number;
        };
        Update: {
          comment?: string | null;
          complaint_id?: string;
          created_at?: string;
          id?: string;
          rating?: number;
        };
        Relationships: [
          {
            foreignKeyName: "resolution_feedback_complaint_id_fkey";
            columns: ["complaint_id"];
            isOneToOne: true;
            referencedRelation: "complaints";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"];
          _user_id: string;
        };
        Returns: boolean;
      };
      recalculate_overdue: { Args: never; Returns: undefined };
    };
    Enums: {
      app_role: "resident" | "admin";
      complaint_priority: "low" | "medium" | "high";
      complaint_status: "open" | "in_progress" | "resolved";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    keyof DefaultSchema["CompositeTypes"] | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      app_role: ["resident", "admin"],
      complaint_priority: ["low", "medium", "high"],
      complaint_status: ["open", "in_progress", "resolved"],
    },
  },
} as const;
