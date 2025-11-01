import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { Database } from '@/types/database.types'

type UserFavorite = Database['public']['Tables']['user_favorites']['Row']
type UserFavoriteInsert = Database['public']['Tables']['user_favorites']['Insert']

// 获取用户收藏列表（带餐厅详情）
export const useFavorites = (userId?: string) => {
  return useQuery({
    queryKey: ['favorites', userId],
    queryFn: async () => {
      let query = supabase
        .from('user_favorites')
        .select(`
          *,
          restaurants (*)
        `)
      
      if (userId) {
        query = query.eq('user_id', userId)
      } else {
        // 如果没有 userId，获取本地存储的收藏（user_id 为 null）
        query = query.is('user_id', null)
      }
      
      const { data, error } = await query
      
      if (error) throw error
      return data
    }
  })
}

// 添加收藏
export const useAddFavorite = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (favorite: UserFavoriteInsert) => {
      const { data, error } = await supabase
        .from('user_favorites')
        .insert(favorite)
        .select()
        .single()
      
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] })
    }
  })
}

// 删除收藏
export const useRemoveFavorite = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (favoriteId: string) => {
      const { error } = await supabase
        .from('user_favorites')
        .delete()
        .eq('id', favoriteId)
      
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] })
    }
  })
}
