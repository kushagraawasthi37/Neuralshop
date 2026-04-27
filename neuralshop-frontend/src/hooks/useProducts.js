import { useQuery } from "@tanstack/react-query"
import { productService } from "../services/api/productService"

export const useTrending = () => {
  return useQuery({
    queryKey: ["trending"],
    queryFn: () => productService.getTrending().then(res => res.data),
  })
}

export const useTopRated = () => {
  return useQuery({
    queryKey: ["topRated"],
    queryFn: () => productService.getTopRated().then(res => res.data),
  })
}


export const useProduct = (id) => {
  return useQuery({
    queryKey: ["product", id],
    queryFn: () => productService.getById(id).then(res => res.data),
    enabled: !!id,
  })
}