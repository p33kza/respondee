// services/caseService.js
import { supabase } from '../lib/supabase'

export async function fileCase({
  name,
  department,
  equipment,
  request_type,
  urgency,
  reason,
  keywords
}) {
  const { data, error } = await supabase
    .from('cases')
    .insert([
      {
        name,
        department,
        equipment,
        request_type,
        urgency,
        reason,
        keywords
      }
    ])

  if (error) throw error
  return data
}

export async function getAllCases() {
    const { data, error } = await supabase
      .from('cases')
      .select('*')
      .order('created_at', { ascending: false })
  
    if (error) throw error
    return data
  }
  
  export async function getCaseDetails(caseId) {
    const { data, error } = await supabase
      .from('cases')
      .select('*, responses(*)') // fetch related responses too
      .eq('id', caseId)
      .single()
  
    if (error) throw error
    return data
  }
  