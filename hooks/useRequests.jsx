import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { requestsApi } from '../apis/requestAPI';
import { useRealtimeMessages } from './useRealtimeMessages';

export const useRequests = () => {
  const queryClient = useQueryClient();

  const useGetAllRequests = () => {
    return useQuery({
      queryKey: ['requests'],
      queryFn: requestsApi.getAll,
    });
  };

  const useGetRequest = (id) => {
    return useQuery({
      queryKey: ['requests', id],
      queryFn: () => requestsApi.getById(id),
      enabled: !!id,
    });
  };

  const useCreateRequest = () => {
    return useMutation({
      mutationFn: requestsApi.create,
      onSuccess: () => {
        queryClient.invalidateQueries(['requests']);
      },
    });
  };

  const useUpdateRequest = () => {
    return useMutation({
      mutationFn: ({ id, ...data }) => requestsApi.update(id, data),
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries(['requests']);
        queryClient.invalidateQueries(['requests', variables.id]);
      },
    });
  };

  const usePartialUpdateRequest = () => {
    return useMutation({
      mutationFn: ({ id, ...data }) => requestsApi.partialUpdate(id, data),
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries(['requests']);
        queryClient.invalidateQueries(['requests', variables.id]);
      },
    });
  };

  const useDeleteRequest = () => {
    return useMutation({
      mutationFn: requestsApi.delete,
      onSuccess: () => {
        queryClient.invalidateQueries(['requests']);
      },
    });
  };

  const useGetRequestsByUser = (userId) => {
    return useQuery({
      queryKey: ['requests', 'user', userId],
      queryFn: () => requestsApi.getByUserId(userId),
      enabled: !!userId,
    });
  };

  const useGetRequestsByStatus = (status) => {
    return useQuery({
      queryKey: ['requests', 'status', status],
      queryFn: () => requestsApi.getByStatus(status),
      enabled: !!status,
    });
  };

  const useGetRequestsByPriority = (priority) => {
    return useQuery({
      queryKey: ['requests', 'priority', priority],
      queryFn: () => requestsApi.getByPriority(priority),
      enabled: !!priority,
    });
  };

  const useGetRequestsByType = (type) => {
    return useQuery({
      queryKey: ['requests', 'type', type],
      queryFn: () => requestsApi.getByType(type),
      enabled: !!type,
    });
  };

  const useGetAssignedRequests = (assignedTo) => {
    return useQuery({
      queryKey: ['requests', 'assigned', assignedTo],
      queryFn: () => requestsApi.getByAssignedTo(assignedTo),
      enabled: !!assignedTo,
    });
  };

  const useGetStarredRequests = () => {
    return useQuery({
      queryKey: ['requests', 'starred'],
      queryFn: requestsApi.getStarred,
    });
  };

  const useGetSpamRequests = () => {
    return useQuery({
      queryKey: ['requests', 'spam'],
      queryFn: requestsApi.getSpam,
    });
  };

  const useGetUnreadRequests = () => {
    return useQuery({
      queryKey: ['requests', 'unread'],
      queryFn: requestsApi.getUnread,
    });
  };

  const useGetNewRequests = () => {
    return useQuery({
      queryKey: ['requests', 'new'],
      queryFn: requestsApi.getNew,
    });
  };

  const useGetRequestsByLabel = (label) => {
    return useQuery({
      queryKey: ['requests', 'label', label],
      queryFn: () => requestsApi.getByLabel(label),
      enabled: !!label,
    });
  };

  const useMarkAsRead = () => {
    return useMutation({
      mutationFn: requestsApi.markAsRead,
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries(['requests']);
        queryClient.invalidateQueries(['requests', variables]);
        queryClient.invalidateQueries(['requests', 'unread']);
        queryClient.invalidateQueries(['requests', 'new']);
      },
    });
  };

  const useToggleStar = () => {
    return useMutation({
      mutationFn: requestsApi.toggleStar,
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries(['requests']);
        queryClient.invalidateQueries(['requests', variables]);
        queryClient.invalidateQueries(['requests', 'starred']);
      },
    });
  };

  const useToggleSpam = () => {
    return useMutation({
      mutationFn: requestsApi.toggleSpam,
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries(['requests']);
        queryClient.invalidateQueries(['requests', variables]);
        queryClient.invalidateQueries(['requests', 'spam']);
      },
    });
  };

  const useAssignRequest = () => {
    return useMutation({
      mutationFn: ({ id, assignedTo, status }) =>
        requestsApi.assignRequest(id, assignedTo, status),
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries(['requests']);
        queryClient.invalidateQueries(['requests', variables.id]);
        queryClient.invalidateQueries(['requests', 'assigned', variables.assignedTo]);
      },
    });
  };

  const useUpdateLabel = () => {
    return useMutation({
      mutationFn: ({ id, labelAs }) => requestsApi.updateLabel(id, labelAs),
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries(['requests']);
        queryClient.invalidateQueries(['requests', variables.id]);
        queryClient.invalidateQueries(['requests', 'label', variables.labelAs]);
      },
    });
  };

  const useUpdateLogisticsSync = () => {
    return useMutation({
      mutationFn: ({ id, isSynced }) => requestsApi.updateLogisticsSync(id, isSynced),
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries(['requests']);
        queryClient.invalidateQueries(['requests', variables.id]);
      },
    });
  };

  const useUpdateLogisticsReturn = () => {
    return useMutation({
      mutationFn: ({ id, isReturned }) => requestsApi.updateLogisticsReturn(id, isReturned),
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries(['requests']);
        queryClient.invalidateQueries(['requests', variables.id]);
      },
    });
  };

  const useFilterRequests = (filters) => {
    return useQuery({
      queryKey: ['requests', 'filter', filters],
      queryFn: () => requestsApi.filterRequests(filters),
      enabled: !!filters && Object.keys(filters).length > 0,
    });
  };

  const useGetMessages = (requestId) => {
    return useQuery({
      queryKey: ['requests', requestId, 'messages'],
      queryFn: () => requestsApi.getMessages(requestId),
      enabled: !!requestId,
    });
  };

  const useAddMessage = () => {
    return useMutation({
      mutationFn: ({ requestId, ...messageData }) => 
        requestsApi.addMessage(requestId, messageData),
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries(['requests', variables.requestId, 'messages']);
        queryClient.invalidateQueries(['requests', variables.requestId]);
        queryClient.invalidateQueries(['requests']);
      },
    });
  };

  const useUpdateMessages = () => {
    return useMutation({
      mutationFn: ({ requestId, messages }) => 
        requestsApi.updateMessages(requestId, messages),
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries(['requests', variables.requestId, 'messages']);
        queryClient.invalidateQueries(['requests', variables.requestId]);
        queryClient.invalidateQueries(['requests']);
      },
    });
  };

  const useUpdateMessage = () => {
    return useMutation({
      mutationFn: ({ requestId, messageIndex, ...messageData }) => 
        requestsApi.updateMessage(requestId, messageIndex, messageData),
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries(['requests', variables.requestId, 'messages']);
        queryClient.invalidateQueries(['requests', variables.requestId]);
        queryClient.invalidateQueries(['requests']);
      },
    });
  };

  const useDeleteMessage = () => {
    return useMutation({
      mutationFn: ({ requestId, messageIndex }) => 
        requestsApi.deleteMessage(requestId, messageIndex),
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries(['requests', variables.requestId, 'messages']);
        queryClient.invalidateQueries(['requests', variables.requestId]);
        queryClient.invalidateQueries(['requests']);
      },
    });
  };

  const useRefreshRequests = () => {
    return {
      refetchAll: () => queryClient.invalidateQueries(['requests']),
      refetchById: (id) => queryClient.invalidateQueries(['requests', id]),
      refetchByUser: (userId) => queryClient.invalidateQueries(['requests', 'user', userId]),
      refetchByStatus: (status) => queryClient.invalidateQueries(['requests', 'status', status]),
      refetchByPriority: (priority) => queryClient.invalidateQueries(['requests', 'priority', priority]),
      refetchByType: (type) => queryClient.invalidateQueries(['requests', 'type', type]),
      refetchAssigned: (assignedTo) => queryClient.invalidateQueries(['requests', 'assigned', assignedTo]),
      refetchStarred: () => queryClient.invalidateQueries(['requests', 'starred']),
      refetchSpam: () => queryClient.invalidateQueries(['requests', 'spam']),
      refetchUnread: () => queryClient.invalidateQueries(['requests', 'unread']),
      refetchNew: () => queryClient.invalidateQueries(['requests', 'new']),
      refetchByLabel: (label) => queryClient.invalidateQueries(['requests', 'label', label]),
      refetchFiltered: (filters) => queryClient.invalidateQueries(['requests', 'filter', filters]),
      refetchMessages: (requestId) => queryClient.invalidateQueries(['requests', requestId, 'messages']),
    };
  };

  return {
    useGetAllRequests,
    useGetRequest,
    useCreateRequest,
    useUpdateRequest,
    usePartialUpdateRequest,
    useDeleteRequest,
    useGetRequestsByUser,
    useGetRequestsByStatus,
    useGetRequestsByPriority,
    useGetRequestsByType,
    useGetAssignedRequests,
    useGetStarredRequests,
    useGetSpamRequests,
    useGetUnreadRequests,
    useGetNewRequests,
    useGetRequestsByLabel,
    useMarkAsRead,
    useToggleStar,
    useToggleSpam,
    useAssignRequest,
    useUpdateLabel,
    useUpdateLogisticsSync,
    useUpdateLogisticsReturn,
    useFilterRequests,
    useRefreshRequests,
    useGetMessages,
    useAddMessage,
    useUpdateMessages,
    useUpdateMessage,
    useDeleteMessage,
  };
};