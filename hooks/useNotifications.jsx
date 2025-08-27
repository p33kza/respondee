import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import {
  fetchAllNotifications,
  fetchNotificationById,
  createNotification,
  updateNotification,
  deleteNotification,
  fetchNotificationsByUserId,
  fetchNotificationsByRequestId,
  fetchNotificationsByStatus,
  fetchUnreadNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  clearAllReadNotifications,
} from '../apis/notificationsAPI';

export const useNotifications = () => {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: fetchAllNotifications,
  });
};

export const useNotification = (id) => {
  return useQuery({
    queryKey: ['notifications', id],
    queryFn: () => fetchNotificationById(id),
    enabled: !!id, 
  });
};

export const useCreateNotification = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createNotification,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
};

export const useUpdateNotification = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateNotification,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', data.id] });
    },
  });
};

export const useDeleteNotification = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteNotification,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
};

export const useUserNotifications = (userId) => {
  return useQuery({
    queryKey: ['notifications', 'user', userId],
    queryFn: () => fetchNotificationsByUserId(userId),
    enabled: !!userId,
  });
};

export const useRequestNotifications = (requestId) => {
  return useQuery({
    queryKey: ['notifications', 'request', requestId],
    queryFn: () => fetchNotificationsByRequestId(requestId),
    enabled: !!requestId,
  });
};

export const useNotificationsByStatus = (isRead) => {
  return useQuery({
    queryKey: ['notifications', 'status', isRead],
    queryFn: () => fetchNotificationsByStatus(isRead),
  });
};

export const useUnreadNotifications = (userId) => {
  return useQuery({
    queryKey: ['notifications', 'unread', userId],
    queryFn: () => fetchUnreadNotifications(userId),
    enabled: !!userId,
  });
};

export const useMarkAsRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: markNotificationAsRead,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', data.id] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread', data.userId] });
    },
  });
};

export const useMarkAllAsRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: markAllNotificationsAsRead,
    onSuccess: (data, userId) => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'user', userId] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread', userId] });
    },
  });
};

export const useClearAllRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: clearAllReadNotifications,
    onSuccess: (_, userId) => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['userNotifications', userId] });
      queryClient.invalidateQueries({ queryKey: ['readNotifications', userId] });
    },
  });
};