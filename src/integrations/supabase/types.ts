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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      circle_deposits: {
        Row: {
          amount: number
          circle_id: string
          deposited_at: string
          id: string
          user_id: string
        }
        Insert: {
          amount: number
          circle_id: string
          deposited_at?: string
          id?: string
          user_id: string
        }
        Update: {
          amount?: number
          circle_id?: string
          deposited_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "circle_deposits_circle_id_fkey"
            columns: ["circle_id"]
            isOneToOne: false
            referencedRelation: "circles"
            referencedColumns: ["id"]
          },
        ]
      }
      circle_goal_contributions: {
        Row: {
          amount: number
          circle_goal_id: string
          contributed_at: string
          id: string
          user_id: string
        }
        Insert: {
          amount: number
          circle_goal_id: string
          contributed_at?: string
          id?: string
          user_id: string
        }
        Update: {
          amount?: number
          circle_goal_id?: string
          contributed_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "circle_goal_contributions_circle_goal_id_fkey"
            columns: ["circle_goal_id"]
            isOneToOne: false
            referencedRelation: "circle_goals"
            referencedColumns: ["id"]
          },
        ]
      }
      circle_goals: {
        Row: {
          circle_id: string
          created_at: string
          created_by: string
          current_amount: number
          deadline: string | null
          icon: string
          id: string
          name: string
          target_amount: number
        }
        Insert: {
          circle_id: string
          created_at?: string
          created_by: string
          current_amount?: number
          deadline?: string | null
          icon?: string
          id?: string
          name: string
          target_amount?: number
        }
        Update: {
          circle_id?: string
          created_at?: string
          created_by?: string
          current_amount?: number
          deadline?: string | null
          icon?: string
          id?: string
          name?: string
          target_amount?: number
        }
        Relationships: [
          {
            foreignKeyName: "circle_goals_circle_id_fkey"
            columns: ["circle_id"]
            isOneToOne: false
            referencedRelation: "circles"
            referencedColumns: ["id"]
          },
        ]
      }
      circle_members: {
        Row: {
          circle_id: string
          display_name: string
          id: string
          joined_at: string
          user_id: string
        }
        Insert: {
          circle_id: string
          display_name?: string
          id?: string
          joined_at?: string
          user_id: string
        }
        Update: {
          circle_id?: string
          display_name?: string
          id?: string
          joined_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "circle_members_circle_id_fkey"
            columns: ["circle_id"]
            isOneToOne: false
            referencedRelation: "circles"
            referencedColumns: ["id"]
          },
        ]
      }
      circles: {
        Row: {
          created_at: string
          created_by: string
          id: string
          invite_code: string
          name: string
        }
        Insert: {
          created_at?: string
          created_by: string
          id?: string
          invite_code?: string
          name: string
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          invite_code?: string
          name?: string
        }
        Relationships: []
      }
      draft_goals: {
        Row: {
          custom_fruit_emojis: Json | null
          custom_fruit_values: Json | null
          deadline: string | null
          goal_mode: string | null
          goal_type: string | null
          icon: string | null
          id: string
          is_fun_fund: boolean | null
          motivation_text: string | null
          name: string | null
          priority: number | null
          target_amount: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          custom_fruit_emojis?: Json | null
          custom_fruit_values?: Json | null
          deadline?: string | null
          goal_mode?: string | null
          goal_type?: string | null
          icon?: string | null
          id?: string
          is_fun_fund?: boolean | null
          motivation_text?: string | null
          name?: string | null
          priority?: number | null
          target_amount?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          custom_fruit_emojis?: Json | null
          custom_fruit_values?: Json | null
          deadline?: string | null
          goal_mode?: string | null
          goal_type?: string | null
          icon?: string | null
          id?: string
          is_fun_fund?: boolean | null
          motivation_text?: string | null
          name?: string | null
          priority?: number | null
          target_amount?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      fruits: {
        Row: {
          created_at: string
          goal_id: string
          id: string
          is_special: boolean
          special_type: string | null
          tier: number
          value: number
        }
        Insert: {
          created_at?: string
          goal_id: string
          id?: string
          is_special?: boolean
          special_type?: string | null
          tier?: number
          value?: number
        }
        Update: {
          created_at?: string
          goal_id?: string
          id?: string
          is_special?: boolean
          special_type?: string | null
          tier?: number
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "fruits_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "goals"
            referencedColumns: ["id"]
          },
        ]
      }
      goal_images: {
        Row: {
          created_at: string
          goal_id: string
          id: string
          image_path: string
        }
        Insert: {
          created_at?: string
          goal_id: string
          id?: string
          image_path: string
        }
        Update: {
          created_at?: string
          goal_id?: string
          id?: string
          image_path?: string
        }
        Relationships: [
          {
            foreignKeyName: "goal_images_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "goals"
            referencedColumns: ["id"]
          },
        ]
      }
      goals: {
        Row: {
          created_at: string
          current_amount: number
          deadline: string | null
          goal_mode: string
          goal_type: string
          icon: string
          id: string
          motivation_text: string | null
          name: string
          priority: number
          target_amount: number
          user_id: string
        }
        Insert: {
          created_at?: string
          current_amount?: number
          deadline?: string | null
          goal_mode?: string
          goal_type?: string
          icon?: string
          id?: string
          motivation_text?: string | null
          name: string
          priority?: number
          target_amount?: number
          user_id: string
        }
        Update: {
          created_at?: string
          current_amount?: number
          deadline?: string | null
          goal_mode?: string
          goal_type?: string
          icon?: string
          id?: string
          motivation_text?: string | null
          name?: string
          priority?: number
          target_amount?: number
          user_id?: string
        }
        Relationships: []
      }
      market_inventory: {
        Row: {
          id: string
          item_emoji: string
          item_name: string
          item_type: string
          purchased_at: string
          user_id: string
        }
        Insert: {
          id?: string
          item_emoji: string
          item_name: string
          item_type: string
          purchased_at?: string
          user_id: string
        }
        Update: {
          id?: string
          item_emoji?: string
          item_name?: string
          item_type?: string
          purchased_at?: string
          user_id?: string
        }
        Relationships: []
      }
      redeemed_codes: {
        Row: {
          code: string
          id: string
          redeemed_at: string
          reward_type: string
          reward_value: string
          user_id: string
        }
        Insert: {
          code: string
          id?: string
          redeemed_at?: string
          reward_type: string
          reward_value: string
          user_id: string
        }
        Update: {
          code?: string
          id?: string
          redeemed_at?: string
          reward_type?: string
          reward_value?: string
          user_id?: string
        }
        Relationships: []
      }
      user_tokens: {
        Row: {
          amount: number
          created_at: string
          goal_id: string | null
          id: string
          reason: string
          user_id: string
        }
        Insert: {
          amount?: number
          created_at?: string
          goal_id?: string | null
          id?: string
          reason: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          goal_id?: string | null
          id?: string
          reason?: string
          user_id?: string
        }
        Relationships: []
      }
      wishlists: {
        Row: {
          created_at: string
          description: string | null
          goal_id: string | null
          id: string
          image_url: string | null
          link_url: string | null
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          goal_id?: string | null
          id?: string
          image_url?: string | null
          link_url?: string | null
          title: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          goal_id?: string | null
          id?: string
          image_url?: string | null
          link_url?: string | null
          title?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
