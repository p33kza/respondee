import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as usersAPI from '../apis/userAPI';

export const useUsers = () =>
    useQuery({ queryKey: ['users'], queryFn: usersAPI.getUsers });

export const useUser = (id) =>
    useQuery({ queryKey: ['user', id], queryFn: () => usersAPI.getUserById(id), enabled: !!id });

export const useCreateUser = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: usersAPI.createUser,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
    });
};

export const useUpdateUser = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: usersAPI.updateUser,
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: ['user', id] });
            queryClient.invalidateQueries({ queryKey: ['users'] });
        },
    });
};

export const useDeleteUser = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: usersAPI.deleteUser,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
    });
};
export const useAdmins = () => 
    useQuery({
        queryKey: ['users', 'admins'],
        queryFn: usersAPI.getUsers,
        select: (data) => data.filter(user => user.role === 'admin'),
    });