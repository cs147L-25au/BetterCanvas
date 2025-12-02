type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

interface Database {
  public: {
    Tables: {
      courses: {
        Row: {
          id: string;
          course_number: string;
          course_name: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          course_number: string;
          course_name: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          course_number?: string;
          course_name?: string;
          created_at?: string;
        };
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
      };
    };
  };
}

// Helper types
type Course = Database["public"]["Tables"]["courses"]["Row"];
type Assignment = Database["public"]["Tables"]["assignments"]["Row"];
type CourseInsert = Database["public"]["Tables"]["courses"]["Insert"];
type AssignmentInsert = Database["public"]["Tables"]["assignments"]["Insert"];
