// lib/supabase.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://fjhnpybtmhqcizwngswl.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZqaG5weWJ0bWhxY2l6d25nc3dsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM1ODQyNzQsImV4cCI6MjA1OTE2MDI3NH0.fVV9jGQiZ6BBRroNjVGx8FgIxw5ZvhYH_P8cYiLJ6m4'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
