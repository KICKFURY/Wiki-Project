import { useState, useEffect, useCallback } from 'react';
import { Recurso, RecursoForm, RecursoFilters, LoadingState } from '../types';
import { recursoService } from '../services/recurso.service';

export const useRecursos = () => {
  const [recursos, setRecursos] = useState<Recurso[]>([]);
  const [loadingState, setLoadingState] = useState<LoadingState>({
    isLoading: false,
    error: null,
  });

  const fetchRecursos = useCallback(async () => {
    setLoadingState({ isLoading: true, error: null });
    try {
      const response = await recursoService.getAll();
      if (response.data) {
        setRecursos(response.data);
        setLoadingState({ isLoading: false, error: null });
      } else {
        setLoadingState({ isLoading: false, error: response.error || 'Failed to load recursos' });
      }
    } catch (error) {
      setLoadingState({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to load recursos'
      });
    }
  }, []);

  const createRecurso = async (recursoData: RecursoForm) => {
    setLoadingState(prev => ({ ...prev, isLoading: true }));
    try {
      const response = await recursoService.create(recursoData);
      if (response.data) {
        setRecursos(prev => [response.data as Recurso, ...prev]);
        setLoadingState({ isLoading: false, error: null });
        return { success: true };
      } else {
        setLoadingState({ isLoading: false, error: response.error || 'Failed to create recurso' });
        return { success: false, error: response.error };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create recurso';
      setLoadingState({ isLoading: false, error: errorMessage });
      return { success: false, error: errorMessage };
    }
  };

  const updateRecurso = async (id: string, recursoData: Partial<RecursoForm>) => {
    setLoadingState(prev => ({ ...prev, isLoading: true }));
    try {
      const response = await recursoService.update(id, recursoData);
      if (response.data) {
        setRecursos(prev => prev.map(r => r._id === id ? response.data as Recurso : r));
        setLoadingState({ isLoading: false, error: null });
        return { success: true };
      } else {
        setLoadingState({ isLoading: false, error: response.error || 'Failed to update recurso' });
        return { success: false, error: response.error };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update recurso';
      setLoadingState({ isLoading: false, error: errorMessage });
      return { success: false, error: errorMessage };
    }
  };

  const deleteRecurso = async (id: string) => {
    setLoadingState(prev => ({ ...prev, isLoading: true }));
    try {
      const response = await recursoService.delete(id);
      if (!response.error) {
        setRecursos(prev => prev.filter(r => r._id !== id));
        setLoadingState({ isLoading: false, error: null });
        return { success: true };
      } else {
        setLoadingState({ isLoading: false, error: response.error || 'Failed to delete recurso' });
        return { success: false, error: response.error };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete recurso';
      setLoadingState({ isLoading: false, error: errorMessage });
      return { success: false, error: errorMessage };
    }
  };

  const filterRecursos = useCallback((filters: RecursoFilters) => {
    return recursos.filter(recurso => {
      const matchesCategory = !filters.category || filters.category === 'Popular' || recurso.category === filters.category;
      const matchesSearch = !filters.searchQuery ||
        recurso.title.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
        recurso.category.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
        recurso.author.username.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
        (recurso.content && recurso.content.toLowerCase().includes(filters.searchQuery.toLowerCase()));

      return matchesCategory && matchesSearch;
    });
  }, [recursos]);

  useEffect(() => {
    fetchRecursos();
  }, [fetchRecursos]);

  return {
    recursos,
    ...loadingState,
    fetchRecursos,
    createRecurso,
    updateRecurso,
    deleteRecurso,
    filterRecursos,
  };
};
