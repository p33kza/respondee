import {
  useMutation,
  useQuery,
  useQueryClient
} from '@tanstack/react-query';

import {
  checkAvailabilityAPI,
  approveRequestAPI,
  returnItemsAPI,
  createInventoryItemAPI,
  fetchInventoryItemsAPI,
  fetchInventoryItemAPI,
  updateInventoryItemAPI,
  deleteInventoryItemAPI,
  cancelRequest,
  borrowItemsAPI,
  returnItemsMobileAPI,
  confirmReturnAPI,
  cancelRequestAdminAPI
} from '../apis/inventoryAPI';

export const useCheckAvailability = (items) =>
  useQuery({
    queryKey: ['availability', items],
    queryFn: () => checkAvailabilityAPI(items),
    enabled: !!items?.length
  });

export const useApproveRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: approveRequestAPI,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['requests'] });
    }
  });
};

export const useReturnItems = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({requestId, returns}) => returnItemsAPI({requestId, returns}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['requests'] });
    }
  });
};

export const useInventoryItems = () => {
  return useQuery({
    queryKey: ['inventory'],
    queryFn: fetchInventoryItemsAPI,
    staleTime: 1000 * 60 * 5
  });
};

export const useInventoryItem = (itemName) => {
  return useQuery({
    queryKey: ['inventory', itemName],
    queryFn: () => fetchInventoryItemAPI(itemName),
    enabled: !!itemName
  });
};

export const useCreateInventoryItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createInventoryItemAPI,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
    }
  });
};

export const useUpdateInventoryItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateInventoryItemAPI,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
    }
  });
};

export const useDeleteInventoryItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteInventoryItemAPI,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
    }
  });
};

export const useCancelRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: cancelRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requests'] });
    }
  });
};

export const useBorrowItems = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: borrowItemsAPI,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requests'] });
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
    }
  });
};

export const useReturnItemsMobile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: returnItemsMobileAPI,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requests'] });
    }
  });
};

export const useConfirmReturn = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: confirmReturnAPI,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['requests'] });
    }
  });
};

export const useCancelRequestAdmin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: cancelRequestAdminAPI,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['requests'] });
    }
  });
};