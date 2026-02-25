import { useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import { useAuth } from './useAuth';

const fetchMyShop = async () => {
  const res = await api.get('/api/shops/me');
  return res.data;
};

export const useMyShop = () => {
  const { token, user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['shop/me', user?.id],
    queryFn: fetchMyShop,
    enabled: !!token && !!user,
    retry: 1,
    staleTime: 0,
  });

  const clearShopCache = useCallback(() => {
    queryClient.removeQueries(['shop/me']);
  }, [queryClient]);

  return {
    ...query,
    clearShopCache,
  };
};
