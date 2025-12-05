type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
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
