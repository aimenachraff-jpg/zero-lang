/**
 * Supabase Database Type Definitions
 * 
 * Generated from Supabase schema. Run `supabase gen types typescript --project-id <id> > src/types/database.ts`
 * This is a manual version for the free tier setup.
 */

export interface Json {
  [key: string]: any
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          native_language: string | null
          known_languages: string[] | null
          timezone: string | null
          created_at: string
          updated_at: string
          last_active_at: string | null
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          native_language?: string | null
          known_languages?: string[] | null
          timezone?: string | null
          created_at?: string
          updated_at?: string
          last_active_at?: string | null
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          native_language?: string | null
          known_languages?: string[] | null
          timezone?: string | null
          created_at?: string
          updated_at?: string
          last_active_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'profiles_id_fkey'
            columns: ['id']
            isOneToOne: true
            referencedRelation: 'users'
            referencedColumns: ['id']
          }
        ]
      }
      learner_profiles: {
        Row: {
          id: string
          user_id: string
          current_level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'
          target_level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'
          primary_goal: 'career_advancement' | 'academic_study' | 'migration_visa' | 'exam_preparation' | 'personal_growth' | 'social_integration'
          placement_completed: boolean
          placement_score: Json | null
          skill_profile: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          current_level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'
          target_level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'
          primary_goal: 'career_advancement' | 'academic_study' | 'migration_visa' | 'exam_preparation' | 'personal_growth' | 'social_integration'
          placement_completed?: boolean
          placement_score?: Json | null
          skill_profile?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          current_level?: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'
          target_level?: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'
          primary_goal?: 'career_advancement' | 'academic_study' | 'migration_visa' | 'exam_preparation' | 'personal_growth' | 'social_integration'
          placement_completed?: boolean
          placement_score?: Json | null
          skill_profile?: Json | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'learner_profiles_user_id_fkey'
            columns: ['user_id']
            isOneToOne: true
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          }
        ]
      }
      units: {
        Row: {
          id: string
          slug: string
          title: string
          subtitle: string
          description: string
          topic: string
          level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'
          order: number
          estimated_hours: number
          prerequisites: string[] | null
          vocabulary: Json[] | null
          learning_outcomes: Json[] | null
          assessment: Json | null
          metadata: Json | null
          published: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          slug: string
          title: string
          subtitle: string
          description: string
          topic: string
          level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'
          order: number
          estimated_hours: number
          prerequisites?: string[] | null
          vocabulary?: Json[] | null
          learning_outcomes?: Json[] | null
          assessment?: Json | null
          metadata?: Json | null
          published?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          slug?: string
          title?: string
          subtitle?: string
          description?: string
          topic?: string
          level?: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'
          order?: number
          estimated_hours?: number
          prerequisites?: string[] | null
          vocabulary?: Json[] | null
          learning_outcomes?: Json[] | null
          assessment?: Json | null
          metadata?: Json | null
          published?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      lessons: {
        Row: {
          id: string
          unit_id: string
          order: number
          type: string
          title: string
          objectives: string[] | null
          content: Json | null
          activities: Json[] | null
          estimated_minutes: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          unit_id: string
          order: number
          type: string
          title: string
          objectives?: string[] | null
          content?: Json | null
          activities?: Json[] | null
          estimated_minutes: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          unit_id?: string
          order?: number
          type?: string
          title?: string
          objectives?: string[] | null
          content?: Json | null
          activities?: Json[] | null
          estimated_minutes?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'lessons_unit_id_fkey'
            columns: ['unit_id']
            isOneToOne: false
            referencedRelation: 'units'
            referencedColumns: ['id']
          }
        ]
      }
      vocabulary: {
        Row: {
          id: string
          unit_id: string
          term: string
          lemma: string
          part_of_speech: string
          cefr_level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'
          frequency_band: number
          definitions: Json[] | null
          collocations: string[] | null
          word_family: string[] | null
          pronunciation: Json | null
          examples: Json[] | null
          tags: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          unit_id: string
          term: string
          lemma: string
          part_of_speech: string
          cefr_level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'
          frequency_band: number
          definitions?: Json[] | null
          collocations?: string[] | null
          word_family?: string[] | null
          pronunciation?: Json | null
          examples?: Json[] | null
          tags?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          unit_id?: string
          term?: string
          lemma?: string
          part_of_speech?: string
          cefr_level?: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'
          frequency_band?: number
          definitions?: Json[] | null
          collocations?: string[] | null
          word_family?: string[] | null
          pronunciation?: Json | null
          examples?: Json[] | null
          tags?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'vocabulary_unit_id_fkey'
            columns: ['unit_id']
            isOneToOne: false
            referencedRelation: 'units'
            referencedColumns: ['id']
          }
        ]
      }
      user_progress: {
        Row: {
          id: string
          user_id: string
          unit_id: string
          lesson_id: string | null
          status: 'not_started' | 'in_progress' | 'completed' | 'mastered'
          score: number | null
          time_spent_seconds: number
          attempts: number
          completed_at: string | null
          mastery_level: number | null
          last_reviewed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          unit_id: string
          lesson_id?: string | null
          status?: 'not_started' | 'in_progress' | 'completed' | 'mastered'
          score?: number | null
          time_spent_seconds?: number
          attempts?: number
          completed_at?: string | null
          mastery_level?: number | null
          last_reviewed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          unit_id?: string
          lesson_id?: string | null
          status?: 'not_started' | 'in_progress' | 'completed' | 'mastered'
          score?: number | null
          time_spent_seconds?: number
          attempts?: number
          completed_at?: string | null
          mastery_level?: number | null
          last_reviewed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'user_progress_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'user_progress_unit_id_fkey'
            columns: ['unit_id']
            isOneToOne: false
            referencedRelation: 'units'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'user_progress_lesson_id_fkey'
            columns: ['lesson_id']
            isOneToOne: false
            referencedRelation: 'lessons'
            referencedColumns: ['id']
          }
        ]
      }
      skill_profiles: {
        Row: {
          id: string
          user_id: string
          reading: Json | null
          listening: Json | null
          writing: Json | null
          speaking: Json | null
          vocabulary: Json | null
          grammar: Json | null
          overall: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'
          last_assessed: string
          evidence: Json[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          reading?: Json | null
          listening?: Json | null
          writing?: Json | null
          speaking?: Json | null
          vocabulary?: Json | null
          grammar?: Json | null
          overall?: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'
          last_assessed: string
          evidence?: Json[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          reading?: Json | null
          listening?: Json | null
          writing?: Json | null
          speaking?: Json | null
          vocabulary?: Json | null
          grammar?: Json | null
          overall?: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'
          last_assessed?: string
          evidence?: Json[] | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'skill_profiles_user_id_fkey'
            columns: ['user_id']
            isOneToOne: true
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          }
        ]
      }
      srs_items: {
        Row: {
          id: string
          user_id: string
          vocabulary_id: string
          unit_id: string
          state: 'new' | 'learning' | 'review' | 'relearning' | 'mastered'
          interval: number
          ease_factor: number
          repetitions: number
          lapses: number
          last_reviewed: string | null
          next_review: string
          stability: number | null
          difficulty: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          vocabulary_id: string
          unit_id: string
          state?: 'new' | 'learning' | 'review' | 'relearning' | 'mastered'
          interval?: number
          ease_factor?: number
          repetitions?: number
          lapses?: number
          last_reviewed?: string | null
          next_review?: string
          stability?: number | null
          difficulty?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          vocabulary_id?: string
          unit_id?: string
          state?: 'new' | 'learning' | 'review' | 'relearning' | 'mastered'
          interval?: number
          ease_factor?: number
          repetitions?: number
          lapses?: number
          last_reviewed?: string | null
          next_review?: string
          stability?: number | null
          difficulty?: number | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'srs_items_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'srs_items_vocabulary_id_fkey'
            columns: ['vocabulary_id']
            isOneToOne: false
            referencedRelation: 'vocabulary'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'srs_items_unit_id_fkey'
            columns: ['unit_id']
            isOneToOne: false
            referencedRelation: 'units'
            referencedColumns: ['id']
          }
        ]
      }
      srs_reviews: {
        Row: {
          id: string
          item_id: string
          rating: 'again' | 'hard' | 'good' | 'easy'
          reviewed_at: string
          time_taken_seconds: number
          created_at: string
        }
        Insert: {
          id?: string
          item_id: string
          rating: 'again' | 'hard' | 'good' | 'easy'
          reviewed_at?: string
          time_taken_seconds: number
          created_at?: string
        }
        Update: {
          id?: string
          item_id?: string
          rating?: 'again' | 'hard' | 'good' | 'easy'
          reviewed_at?: string
          time_taken_seconds?: number
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'srs_reviews_item_id_fkey'
            columns: ['item_id']
            isOneToOne: false
            referencedRelation: 'srs_items'
            referencedColumns: ['id']
          }
        ]
      }
      tutor_configs: {
        Row: {
          id: string
          user_id: string
          provider: 'openai' | 'anthropic' | 'local' | 'custom'
          model: string
          api_key_encrypted: string | null
          endpoint: string | null
          system_prompt: string
          temperature: number
          max_tokens: number
          capabilities: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          provider: 'openai' | 'anthropic' | 'local' | 'custom'
          model: string
          api_key_encrypted?: string | null
          endpoint?: string | null
          system_prompt: string
          temperature: number
          max_tokens: number
          capabilities?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          provider?: 'openai' | 'anthropic' | 'local' | 'custom'
          model?: string
          api_key_encrypted?: string | null
          endpoint?: string | null
          system_prompt?: string
          temperature?: number
          max_tokens?: number
          capabilities?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'tutor_configs_user_id_fkey'
            columns: ['user_id']
            isOneToOne: true
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          }
        ]
      }
      tutor_sessions: {
        Row: {
          id: string
          user_id: string
          unit_id: string | null
          lesson_id: string | null
          capability: string
          config: Json | null
          metadata: Json | null
          started_at: string
          ended_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          unit_id?: string | null
          lesson_id?: string | null
          capability: string
          config?: Json | null
          metadata?: Json | null
          started_at?: string
          ended_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          unit_id?: string | null
          lesson_id?: string | null
          capability?: string
          config?: Json | null
          metadata?: Json | null
          started_at?: string
          ended_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'tutor_sessions_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'tutor_sessions_unit_id_fkey'
            columns: ['unit_id']
            isOneToOne: false
            referencedRelation: 'units'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'tutor_sessions_lesson_id_fkey'
            columns: ['lesson_id']
            isOneToOne: false
            referencedRelation: 'lessons'
            referencedColumns: ['id']
          }
        ]
      }
      tutor_messages: {
        Row: {
          id: string
          session_id: string
          role: 'user' | 'assistant' | 'system'
          content: string
          metadata: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          session_id: string
          role: 'user' | 'assistant' | 'system'
          content: string
          metadata?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          session_id?: string
          role?: 'user' | 'assistant' | 'system'
          content?: string
          metadata?: Json | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'tutor_messages_session_id_fkey'
            columns: ['session_id']
            isOneToOne: false
            referencedRelation: 'tutor_sessions'
            referencedColumns: ['id']
          }
        ]
      }
      placement_results: {
        Row: {
          id: string
          user_id: string
          assessed_level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'
          confidence: number
          skill_breakdown: Json | null
          responses: Json[] | null
          completed_at: string
          version: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          assessed_level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'
          confidence: number
          skill_breakdown?: Json | null
          responses?: Json[] | null
          completed_at?: string
          version: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          assessed_level?: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'
          confidence?: number
          skill_breakdown?: Json | null
          responses?: Json[] | null
          completed_at?: string
          version?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'placement_results_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      cefr_level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'
      learning_goal: 'career_advancement' | 'academic_study' | 'migration_visa' | 'exam_preparation' | 'personal_growth' | 'social_integration'
      progress_status: 'not_started' | 'in_progress' | 'completed' | 'mastered'
      srs_state: 'new' | 'learning' | 'review' | 'relearning' | 'mastered'
      srs_rating: 'again' | 'hard' | 'good' | 'easy'
      tutor_provider: 'openai' | 'anthropic' | 'local' | 'custom'
      tutor_capability: 'conversation' | 'writing_feedback' | 'pronunciation' | 'vocabulary_explanation' | 'grammar_explanation' | 'debate_partner' | 'interview_simulation' | 'presentation_coach'
      message_role: 'user' | 'assistant' | 'system'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}