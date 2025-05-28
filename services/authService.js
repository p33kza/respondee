// src/services/authService.js
import { supabase } from '../lib/supabase';

// 🔵 Web App Employee Login
export async function loginEmployee(email, password) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single();

  if (error || !data) throw new Error('User not found.');

  if (data.password !== password) throw new Error('Incorrect password.');

  if (data.role !== 'Admin' && data.role !== 'Complaint Handler' && data.role !== 'Logistics Handler') {
    throw new Error('Unauthorized: Only employees can log in here.');
  }

  // Save user session (Web: localStorage)
  localStorage.setItem('user', JSON.stringify(data));

  return data;
}

// 🟠 Mobile App Resident Login
export async function loginResident(email, password) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single();

  if (error || !data) throw new Error('User not found.');

  if (data.password !== password) throw new Error('Incorrect password.');

  if (data.role !== 'Resident') {
    throw new Error('Unauthorized: Only residents can log in here.');
  }

  // Save user session (Mobile: AsyncStorage)
  // (This part will be handled inside login.js because AsyncStorage is async)

  return data;
}
