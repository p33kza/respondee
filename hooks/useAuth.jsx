import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  registerUser,
  loginUser,
  updateUser,
  deleteUser,
  sendVerificationCode,
  verifyCode,
} from '../apis/authAPI';
import { API_BASE_URL } from '../apis/api';


export function useRegister() {
  return useMutation({
    mutationFn: async (payload) => {
      const url = `${API_BASE_URL}/api/auth/register`;

      const isFormData = typeof FormData !== 'undefined' && payload instanceof FormData;
      const headers = isFormData
        ? { Accept: 'application/json' } // let fetch set boundary
        : { 'Content-Type': 'application/json', Accept: 'application/json' };

      console.log('[useRegister] POST', url, {
        preview: isFormData
          ? 'FormData(...)'
          : { ...payload, password: payload?.password ? '***' : undefined, govId: payload?.govId ? '(omitted)' : undefined }
      });

      const res = await fetch(url, {
        method: 'POST',
        headers,
        body: isFormData ? payload : JSON.stringify(payload),
      });

      const text = await res.text();
      let data;
      try { data = text ? JSON.parse(text) : {}; } catch { data = { error: text }; }

      if (!res.ok) {
        const err = new Error(data?.error || data?.message || `HTTP ${res.status}`);
        err.status = res.status;
        err.data = data;
        throw err;
      }

      return data;
    }
  });
}

export const useLogin = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: loginUser,
    onSuccess: (data) => {
      localStorage.setItem('token', data.idToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      localStorage.setItem('uid', data.uid);
      
      queryClient.setQueryData(['currentUser'], { uid: data.uid });
      return data;
    },
    onError: (error) => {
      throw error;
    },
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ uid, ...userData }) => updateUser(uid, userData),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(['users']);
      queryClient.invalidateQueries(['currentUser']);
      return data;
    },
    onError: (error) => {
      throw error;
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (uid) => deleteUser(uid),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(['users']);
      if (localStorage.getItem('uid') === variables) {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('uid');
        queryClient.removeQueries(['currentUser']);
      }
      return data;
    },
    onError: (error) => {
      throw error;
    },
  });
};

export const useSendVerificationCode = () => {
  return useMutation({
    mutationFn: sendVerificationCode,
    onError: (error) => {
      throw error;
    },
  });
};

export const useVerifyCode = () => {
  return useMutation({
    mutationFn: verifyCode,
    onError: (error) => {
      throw error;
    },
  });
};

export const useCurrentUser = () => {
  return useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const uid = localStorage.getItem('uid');
      if (!uid) return null;
      return { uid };
    },
  });
};