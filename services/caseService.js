import { supabase } from '../lib/supabase';

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
  try {
    // 🧠 Step 1: Generate title from FastAPI
    const response = await fetch('http://10.0.2.2:8001/generate-title', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ description: request_desc }),
    });

    const data = await response.json();
    const request_title = data.title || 'Untitled Request';

    // 📥 Step 2: Insert into Supabase
    const { error } = await supabase.from('requests').insert({
      request_title,
      request_desc,
      request_type,
      emergency,
      status: 'To Verify',
      date_requested: new Date().toISOString(),
    });

    if (error) throw error;
  } catch (err) {
    console.error('❌ fileRequest failed:', err.message || err);
    throw err;
  }
}
