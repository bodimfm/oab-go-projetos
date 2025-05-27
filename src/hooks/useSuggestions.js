import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { integrationSuggestionsService } from '../services/integrationSuggestions';

export function useSuggestions(filters = {}) {
  return useQuery({
    queryKey: ['suggestions', filters],
    queryFn: () => integrationSuggestionsService.getAllSuggestions(filters),
  });
}

export function useSuggestionById(id) {
  return useQuery({
    queryKey: ['suggestion', id],
    queryFn: () => integrationSuggestionsService.getSuggestionById(id),
    enabled: !!id,
  });
}

export function useSuggestionsByCompatibility(systems = []) {
  return useQuery({
    queryKey: ['suggestionsByCompatibility', systems],
    queryFn: () => integrationSuggestionsService.getSuggestionsByCompatibility(systems),
    enabled: systems.length > 0,
  });
}

export function useSuggestionsByTags(tags = []) {
  return useQuery({
    queryKey: ['suggestionsByTags', tags],
    queryFn: () => integrationSuggestionsService.getSuggestionsByTags(tags),
    enabled: tags.length > 0,
  });
}

export function useSuggestionStats() {
  return useQuery({
    queryKey: ['suggestionStats'],
    queryFn: () => integrationSuggestionsService.getSuggestionStats(),
  });
}

export function useCreateSuggestion() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (suggestion) => integrationSuggestionsService.createSuggestion(suggestion),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suggestions'] });
    },
  });
}

export function useUpdateSuggestion() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, updates }) => integrationSuggestionsService.updateSuggestion(id, updates),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['suggestions'] });
      queryClient.invalidateQueries({ queryKey: ['suggestion', data.id] });
    },
  });
}

export function useDeactivateSuggestion() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id) => integrationSuggestionsService.deactivateSuggestion(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suggestions'] });
    },
  });
} 