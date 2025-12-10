export interface Database {
  public: {
    Tables: {
      courses: {
        Row: {
          id: string;
          course_number: string;
          course_name: string;
          course_color: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          course_number: string;
          course_name: string;
          course_color?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          course_number?: string;
          course_name?: string;
          course_color?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      assignments: {
        Row: {
          id: string;
          course_id: string;
          assignment_name: string;
          due_date: string;
          estimated_duration: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          course_id: string;
          assignment_name: string;
          due_date: string;
          estimated_duration: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          course_id?: string;
          assignment_name?: string;
          due_date?: string;
          estimated_duration?: number;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "assignments_course_id_fkey";
            columns: ["course_id"];
            isOneToOne: false;
            referencedRelation: "courses";
            referencedColumns: ["id"];
          },
        ];
      };
      user_courses: {
        Row: {
          course_id: string | null;
          created_at: string | null;
          id: string;
          user_id: string | null;
        };
        Insert: {
          course_id?: string | null;
          created_at?: string | null;
          id?: string;
          user_id?: string | null;
        };
        Update: {
          course_id?: string | null;
          created_at?: string | null;
          id?: string;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "user_courses_course_id_fkey";
            columns: ["course_id"];
            isOneToOne: false;
            referencedRelation: "courses";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
