import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  registerUser,
  loginUser,
  updateUser,
  deleteUser,
  sendVerificationCode,
  verifyCode,
} from '../apis/authAPI';

export const useRegister = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: registerUser,
    onSuccess: (data) => {
      queryClient.invalidateQueries(['users']);
      return data;
    },
    onError: (error) => {
      throw error;
    },
  });
};

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