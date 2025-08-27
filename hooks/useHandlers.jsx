import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as handlersAPI from '../apis/handlerAPI';

export const useHandlers = () =>
    useQuery({ queryKey: ['handlers'], queryFn: handlersAPI.getAllHandlers });

export const useLogisticsHandlers = () =>
    useQuery({ queryKey: ['logisticsHandlers'], queryFn: handlersAPI.getLogisticsHandlers });

export const useComplaintsHandlers = () =>
    useQuery({ queryKey: ['complaintsHandlers'], queryFn: handlersAPI.getComplaintsHandlers });

export const useCreateHandler = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: handlersAPI.createHandler,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['handlers'] });
            queryClient.invalidateQueries({ queryKey: ['logisticsHandlers'] });
            queryClient.invalidateQueries({ queryKey: ['complaintsHandlers'] });
        },
    });
};

export const useUpdateHandler = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: handlersAPI.updateHandler,
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: ['handlers'] });
            queryClient.invalidateQueries({ queryKey: ['logisticsHandlers'] });
            queryClient.invalidateQueries({ queryKey: ['complaintsHandlers'] });
            queryClient.invalidateQueries({ queryKey: ['handler', id] });
        },
    });
};

export const useDeleteHandler = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: handlersAPI.deleteHandler,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['handlers'] });
            queryClient.invalidateQueries({ queryKey: ['logisticsHandlers'] });
            queryClient.invalidateQueries({ queryKey: ['complaintsHandlers'] });
        },
    });
};
