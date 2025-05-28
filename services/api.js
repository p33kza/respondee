// // api.js
// import { supabase } from '../lib/supabase';

// export async function fetchRecentComplaints() {
//   const { data, error } = await supabase
//     .from('complaints')
//     .select('*')
//     .order('created_at', { ascending: false })
//     .limit(5);

//   if (error) {
//     console.error('Error fetching complaints:', error);
//     return [];
//   }
//   return data;
// }

// export async function fetchRecentRequests() {
//   const { data, error } = await supabase
//     .from('requests')
//     .select('*')
//     .order('created_at', { ascending: false })
//     .limit(5);

//   if (error) {
//     console.error('Error fetching requests:', error);
//     return [];
//   }
//   return data;
// }
