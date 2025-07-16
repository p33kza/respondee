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

function parseQuantitiesFromDescription(desc) {
  const chairRegex = /(\d+)\s*(chairs?|upuan|monoblocks?)/gi;
  const tableRegex = /(\d+)\s*(tables?|lamesa|mesa)/gi;
  const tentRegex = /(\d+)\s*(tents?|tent)/gi;

  let chairs = 0, tables = 0, tents = 0;
  let match;

  while ((match = chairRegex.exec(desc)) !== null) {
    chairs += parseInt(match[1]);
  }
  while ((match = tableRegex.exec(desc)) !== null) {
    tables += parseInt(match[1]);
  }
  while ((match = tentRegex.exec(desc)) !== null) {
    tents += parseInt(match[1]);
  }

  return { chairs, tables, tents };
}

export async function fileRequest({ request_type, request_desc, emergency }) {
  try {
    // Parse quantities from description text
    const { chairs, tables, tents } = parseQuantitiesFromDescription(request_desc);

    // Generate title via backend FastAPI service (thru dev build)
    const response = await fetch('http://10.0.2.2:8004/generate-title', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ description: request_desc }),
    });
    const data = await response.json();
    const request_title = data.title || 'Untitled Request';

    // Generate title via backend FastAPI service (thru physical mobile device)
    // const response = await fetch('http://192.168.1.197:8001/generate-title', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ description: request_desc }),
    // });
    // const data = await response.json();
    // const request_title = data.title || 'Untitled Request';

    // Insert into Supabase with quantities and title
    const { error } = await supabase.from('requests').insert({
      request_title,
      request_desc,
      request_type,
      emergency,
      quan_chairs: chairs,
      quan_tables: tables,
      quan_tents: tents,
      status: 'To Verify',
      date_requested: new Date().toISOString(),
    });

    if (error) throw error;
  } catch (err) {
    console.error('❌ fileRequest failed:', err.message || err);
    throw err;
  }
}
