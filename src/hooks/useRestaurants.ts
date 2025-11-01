import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { Database } from '@/types/database.types'

type Restaurant = Database['public']['Tables']['restaurants']['Row']

// 获取所有激活的餐厅
export const useRestaurants = () => {
  return useQuery({
    queryKey: ['restaurants'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('restaurants')
        .select('*')
        .eq('is_active', true)
        .order('name')
      
      if (error) throw error
      return data as Restaurant[]
    }
  })
}

// 按分类获取餐厅
export const useRestaurantsByCategory = (category: string) => {
  return useQuery({
    queryKey: ['restaurants', category],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('restaurants')
        .select('*')
        .eq('is_active', true)
        .eq('category', category)
        .order('name')
      
      if (error) throw error
      return data as Restaurant[]
    },
    enabled: !!category
  })
}

// 获取所有分类
export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('restaurants')
        .select('category')
        .eq('is_active', true)
      
      if (error) throw error
      
      // 去重
      const uniqueCategories = [...new Set(data.map(r => r.category))]
      return uniqueCategories
    }
  })
}
