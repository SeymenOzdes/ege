export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      ad_placements: {
        Row: {
          created_at: string;
          desktop_media_id: string | null;
          destination_url: string;
          ends_at: string | null;
          id: string;
          is_active: boolean;
          mobile_media_id: string | null;
          placement_key: Database["public"]["Enums"]["ad_placement_key"];
          sponsor: string;
          starts_at: string;
          topic_id: string | null;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          desktop_media_id?: string | null;
          destination_url: string;
          ends_at?: string | null;
          id?: string;
          is_active?: boolean;
          mobile_media_id?: string | null;
          placement_key: Database["public"]["Enums"]["ad_placement_key"];
          sponsor: string;
          starts_at?: string;
          topic_id?: string | null;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          desktop_media_id?: string | null;
          destination_url?: string;
          ends_at?: string | null;
          id?: string;
          is_active?: boolean;
          mobile_media_id?: string | null;
          placement_key?: Database["public"]["Enums"]["ad_placement_key"];
          sponsor?: string;
          starts_at?: string;
          topic_id?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "ad_placements_desktop_media_id_fkey";
            columns: ["desktop_media_id"];
            isOneToOne: false;
            referencedRelation: "media_assets";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "ad_placements_mobile_media_id_fkey";
            columns: ["mobile_media_id"];
            isOneToOne: false;
            referencedRelation: "media_assets";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "ad_placements_topic_id_fkey";
            columns: ["topic_id"];
            isOneToOne: false;
            referencedRelation: "topics";
            referencedColumns: ["id"];
          },
        ];
      };
      article_revisions: {
        Row: {
          article_id: string;
          created_at: string;
          created_by: string;
          id: string;
          revision_number: number;
          snapshot: Json;
        };
        Insert: {
          article_id: string;
          created_at?: string;
          created_by: string;
          id?: string;
          revision_number: number;
          snapshot: Json;
        };
        Update: {
          article_id?: string;
          created_at?: string;
          created_by?: string;
          id?: string;
          revision_number?: number;
          snapshot?: Json;
        };
        Relationships: [
          {
            foreignKeyName: "article_revisions_article_id_fkey";
            columns: ["article_id"];
            isOneToOne: false;
            referencedRelation: "articles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "article_revisions_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      articles: {
        Row: {
          archived_at: string | null;
          article_type: Database["public"]["Enums"]["article_type"];
          author_id: string | null;
          body: Json;
          body_text: string;
          breaking_expires_at: string | null;
          created_at: string;
          created_by: string | null;
          hero_media_id: string | null;
          id: string;
          is_breaking: boolean;
          location_id: string | null;
          published_at: string | null;
          scheduled_at: string | null;
          search_vector: unknown;
          seo_description: string | null;
          seo_title: string | null;
          slug: string;
          social_media_id: string | null;
          status: Database["public"]["Enums"]["article_status"];
          summary: string | null;
          title: string;
          topic_id: string | null;
          updated_at: string;
          updated_by: string | null;
        };
        Insert: {
          archived_at?: string | null;
          article_type?: Database["public"]["Enums"]["article_type"];
          author_id?: string | null;
          body?: Json;
          body_text?: string;
          breaking_expires_at?: string | null;
          created_at?: string;
          created_by?: string | null;
          hero_media_id?: string | null;
          id?: string;
          is_breaking?: boolean;
          location_id?: string | null;
          published_at?: string | null;
          scheduled_at?: string | null;
          search_vector?: unknown;
          seo_description?: string | null;
          seo_title?: string | null;
          slug: string;
          social_media_id?: string | null;
          status?: Database["public"]["Enums"]["article_status"];
          summary?: string | null;
          title: string;
          topic_id?: string | null;
          updated_at?: string;
          updated_by?: string | null;
        };
        Update: {
          archived_at?: string | null;
          article_type?: Database["public"]["Enums"]["article_type"];
          author_id?: string | null;
          body?: Json;
          body_text?: string;
          breaking_expires_at?: string | null;
          created_at?: string;
          created_by?: string | null;
          hero_media_id?: string | null;
          id?: string;
          is_breaking?: boolean;
          location_id?: string | null;
          published_at?: string | null;
          scheduled_at?: string | null;
          search_vector?: unknown;
          seo_description?: string | null;
          seo_title?: string | null;
          slug?: string;
          social_media_id?: string | null;
          status?: Database["public"]["Enums"]["article_status"];
          summary?: string | null;
          title?: string;
          topic_id?: string | null;
          updated_at?: string;
          updated_by?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "articles_author_id_fkey";
            columns: ["author_id"];
            isOneToOne: false;
            referencedRelation: "authors";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "articles_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "articles_hero_media_id_fkey";
            columns: ["hero_media_id"];
            isOneToOne: false;
            referencedRelation: "media_assets";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "articles_location_id_fkey";
            columns: ["location_id"];
            isOneToOne: false;
            referencedRelation: "locations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "articles_social_media_id_fkey";
            columns: ["social_media_id"];
            isOneToOne: false;
            referencedRelation: "media_assets";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "articles_topic_id_fkey";
            columns: ["topic_id"];
            isOneToOne: false;
            referencedRelation: "topics";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "articles_updated_by_fkey";
            columns: ["updated_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      audit_logs: {
        Row: {
          action: string;
          actor_id: string | null;
          created_at: string;
          id: string;
          metadata: Json;
          target_id: string | null;
          target_table: string;
        };
        Insert: {
          action: string;
          actor_id?: string | null;
          created_at?: string;
          id?: string;
          metadata?: Json;
          target_id?: string | null;
          target_table: string;
        };
        Update: {
          action?: string;
          actor_id?: string | null;
          created_at?: string;
          id?: string;
          metadata?: Json;
          target_id?: string | null;
          target_table?: string;
        };
        Relationships: [
          {
            foreignKeyName: "audit_logs_actor_id_fkey";
            columns: ["actor_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      authors: {
        Row: {
          avatar_url: string | null;
          bio: string | null;
          created_at: string;
          id: string;
          name: string;
          profile_id: string | null;
          role_label: string | null;
          slug: string;
          updated_at: string;
        };
        Insert: {
          avatar_url?: string | null;
          bio?: string | null;
          created_at?: string;
          id?: string;
          name: string;
          profile_id?: string | null;
          role_label?: string | null;
          slug: string;
          updated_at?: string;
        };
        Update: {
          avatar_url?: string | null;
          bio?: string | null;
          created_at?: string;
          id?: string;
          name?: string;
          profile_id?: string | null;
          role_label?: string | null;
          slug?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "authors_profile_id_fkey";
            columns: ["profile_id"];
            isOneToOne: true;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      bookmarks: {
        Row: {
          article_id: string;
          created_at: string;
          profile_id: string;
        };
        Insert: {
          article_id: string;
          created_at?: string;
          profile_id: string;
        };
        Update: {
          article_id?: string;
          created_at?: string;
          profile_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "bookmarks_article_id_fkey";
            columns: ["article_id"];
            isOneToOne: false;
            referencedRelation: "articles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "bookmarks_profile_id_fkey";
            columns: ["profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      locations: {
        Row: {
          created_at: string;
          id: string;
          name: string;
          province_code: string | null;
          slug: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          name: string;
          province_code?: string | null;
          slug: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          name?: string;
          province_code?: string | null;
          slug?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      media_assets: {
        Row: {
          alt_text: string;
          bucket_id: string;
          byte_size: number;
          caption: string | null;
          created_at: string;
          credit: string | null;
          focal_point_x: number | null;
          focal_point_y: number | null;
          height: number | null;
          id: string;
          mime_type: string;
          object_path: string;
          updated_at: string;
          uploaded_by: string | null;
          width: number | null;
        };
        Insert: {
          alt_text: string;
          bucket_id?: string;
          byte_size: number;
          caption?: string | null;
          created_at?: string;
          credit?: string | null;
          focal_point_x?: number | null;
          focal_point_y?: number | null;
          height?: number | null;
          id?: string;
          mime_type: string;
          object_path: string;
          updated_at?: string;
          uploaded_by?: string | null;
          width?: number | null;
        };
        Update: {
          alt_text?: string;
          bucket_id?: string;
          byte_size?: number;
          caption?: string | null;
          created_at?: string;
          credit?: string | null;
          focal_point_x?: number | null;
          focal_point_y?: number | null;
          height?: number | null;
          id?: string;
          mime_type?: string;
          object_path?: string;
          updated_at?: string;
          uploaded_by?: string | null;
          width?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "media_assets_uploaded_by_fkey";
            columns: ["uploaded_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      newsletter_subscriptions: {
        Row: {
          confirmation_token_digest: string | null;
          confirmed_at: string | null;
          consented_at: string;
          created_at: string;
          email: string;
          email_normalized: string | null;
          id: string;
          profile_id: string | null;
          status: Database["public"]["Enums"]["newsletter_subscription_status"];
          unsubscribe_token_digest: string | null;
          unsubscribed_at: string | null;
          updated_at: string;
        };
        Insert: {
          confirmation_token_digest?: string | null;
          confirmed_at?: string | null;
          consented_at?: string;
          created_at?: string;
          email: string;
          email_normalized?: string | null;
          id?: string;
          profile_id?: string | null;
          status?: Database["public"]["Enums"]["newsletter_subscription_status"];
          unsubscribe_token_digest?: string | null;
          unsubscribed_at?: string | null;
          updated_at?: string;
        };
        Update: {
          confirmation_token_digest?: string | null;
          confirmed_at?: string | null;
          consented_at?: string;
          created_at?: string;
          email?: string;
          email_normalized?: string | null;
          id?: string;
          profile_id?: string | null;
          status?: Database["public"]["Enums"]["newsletter_subscription_status"];
          unsubscribe_token_digest?: string | null;
          unsubscribed_at?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "newsletter_subscriptions_profile_id_fkey";
            columns: ["profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          created_at: string;
          display_name: string | null;
          id: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          display_name?: string | null;
          id: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          display_name?: string | null;
          id?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      push_subscriptions: {
        Row: {
          auth_key: string;
          created_at: string;
          endpoint: string;
          expires_at: string | null;
          id: string;
          is_active: boolean;
          p256dh_key: string;
          profile_id: string | null;
          updated_at: string;
          user_agent: string | null;
        };
        Insert: {
          auth_key: string;
          created_at?: string;
          endpoint: string;
          expires_at?: string | null;
          id?: string;
          is_active?: boolean;
          p256dh_key: string;
          profile_id?: string | null;
          updated_at?: string;
          user_agent?: string | null;
        };
        Update: {
          auth_key?: string;
          created_at?: string;
          endpoint?: string;
          expires_at?: string | null;
          id?: string;
          is_active?: boolean;
          p256dh_key?: string;
          profile_id?: string | null;
          updated_at?: string;
          user_agent?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "push_subscriptions_profile_id_fkey";
            columns: ["profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      redirects: {
        Row: {
          created_at: string;
          from_path: string;
          id: string;
          status_code: number;
          target_article_id: string | null;
          to_path: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          from_path: string;
          id?: string;
          status_code?: number;
          target_article_id?: string | null;
          to_path: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          from_path?: string;
          id?: string;
          status_code?: number;
          target_article_id?: string | null;
          to_path?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "redirects_target_article_id_fkey";
            columns: ["target_article_id"];
            isOneToOne: false;
            referencedRelation: "articles";
            referencedColumns: ["id"];
          },
        ];
      };
      search_queries: {
        Row: {
          created_at: string;
          id: string;
          location_slug: string | null;
          query: string;
          query_normalized: string;
          result_count: number;
          topic_slug: string | null;
        };
        Insert: {
          created_at?: string;
          id?: string;
          location_slug?: string | null;
          query: string;
          query_normalized: string;
          result_count?: number;
          topic_slug?: string | null;
        };
        Update: {
          created_at?: string;
          id?: string;
          location_slug?: string | null;
          query?: string;
          query_normalized?: string;
          result_count?: number;
          topic_slug?: string | null;
        };
        Relationships: [];
      };
      topics: {
        Row: {
          created_at: string;
          description: string | null;
          id: string;
          name: string;
          slug: string;
          sort_order: number;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          description?: string | null;
          id?: string;
          name: string;
          slug: string;
          sort_order?: number;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          description?: string | null;
          id?: string;
          name?: string;
          slug?: string;
          sort_order?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      search_published_articles: {
        Args: {
          p_limit?: number;
          p_location?: string;
          p_offset?: number;
          p_query: string;
          p_topic?: string;
        };
        Returns: {
          headline: string;
          id: string;
          location_name: string;
          location_slug: string;
          published_at: string;
          rank: number;
          slug: string;
          summary: string;
          title: string;
          topic_name: string;
          topic_slug: string;
          total_count: number;
          word_count: number;
        }[];
      };
    };
    Enums: {
      ad_placement_key: "HOME_LEADER" | "HOME_INLINE" | "ARTICLE_MID" | "ARTICLE_END";
      article_status: "DRAFT" | "IN_REVIEW" | "SCHEDULED" | "PUBLISHED" | "ARCHIVED";
      article_type: "NEWS" | "OPINION" | "INTERVIEW" | "PHOTO_STORY";
      newsletter_subscription_status: "PENDING" | "CONFIRMED" | "UNSUBSCRIBED";
      notification_type: "BREAKING_NEWS";
      user_role: "ADMIN" | "EDITOR" | "READER";
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
      ad_placement_key: ["HOME_LEADER", "HOME_INLINE", "ARTICLE_MID", "ARTICLE_END"],
      article_status: ["DRAFT", "IN_REVIEW", "SCHEDULED", "PUBLISHED", "ARCHIVED"],
      article_type: ["NEWS", "OPINION", "INTERVIEW", "PHOTO_STORY"],
      newsletter_subscription_status: ["PENDING", "CONFIRMED", "UNSUBSCRIBED"],
      notification_type: ["BREAKING_NEWS"],
      user_role: ["ADMIN", "EDITOR", "READER"],
    },
  },
} as const;
