import { supabase } from '../lib/supabase'

export async function fileComplaint({ complaint_type, complaint_desc, emergency }) {
  const { data, error } = await supabase
    .from('complaints')
    .insert([{
      user_id: '12345',
      complainant: 'Juan Doe',
      address: '123 Main St',
      contact_number: '01234567890',
      respondent: 'Jane Doe',
      respondent_address: '456 Main St',
      complaint_name: null,
      complaint_type,
      complaint_desc,
      emergency
    }])
  if (error) throw error
  return data
}

export async function fileRequest({ request_type, request_desc, emergency }) {
  const { data, error } = await supabase
    .from('requests')
    .insert([{
      user_id: '12345',
      client_name: 'Juan Doe',
      address: '123 Main St', 
      request_type,
      request_desc,
      emergency      
    }])
  if (error) throw error
  return data
}
