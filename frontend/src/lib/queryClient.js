import { QueryClient } from '@tanstack/react-query'

//Tanstack query global configuration set
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

// Per-query staleTime overrides — apply these in useQuery calls:
//   products list / browse:    staleTime: 10 * 60 * 1000   (10 min)
//   product detail:            staleTime: 10 * 60 * 1000   (10 min)
//   recommendations/trending:  staleTime: 30 * 60 * 1000   (30 min)
//   paginated lists:           keepPreviousData: true
