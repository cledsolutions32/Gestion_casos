import type { Case } from "@/types";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { useAuth } from "@/lib/auth-context";
import { API_URL, getAuthHeaders } from "@/lib/api";

type CasesContextValue = {
  cases: Case[];
  isLoading: boolean;
  error: string | null;
  refreshCases: () => Promise<void>;
  clearError: () => void;
  getCaseById: (id: string) => Promise<Case | null>;
};

const CasesContext = createContext<CasesContextValue | null>(null);

export function CasesProvider({ children }: { children: ReactNode }) {
  const { session } = useAuth();
  const [cases, setCases] = useState<Case[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);

  const clearError = useCallback(() => setError(null), []);

  const fetchCases = useCallback(async () => {
    setError(null);
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/cases`, {
        method: "GET",
        headers: getAuthHeaders(session?.access_token),
      });

      if (!response.ok) {
        const errorText = await response
          .text()
          .catch(() => response.statusText);

        throw new Error(`Error ${response.status}: ${errorText}`);
      }
      const data = await response.json();

      setCases((data as Case[]) ?? []);
    } catch (err) {
      let errorMessage = "Error al obtener los casos";

      if (err instanceof Error) {
        if (
          err.message.includes("Failed to fetch") ||
          err.message.includes("NetworkError")
        ) {
          errorMessage =
            "No se pudo conectar con el servidor. Verifica que el backend esté corriendo en " +
            API_URL;
        } else {
          errorMessage = err.message;
        }
      }
      setError(errorMessage);
      setCases([]);
    } finally {
      setIsLoading(false);
      setHasLoaded(true);
    }
  }, [session?.access_token]);

  const refreshCases = useCallback(async () => {
    await fetchCases();
  }, [fetchCases]);

  const getCaseById = useCallback(async (id: string): Promise<Case | null> => {
    try {
      const response = await fetch(`${API_URL}/cases/${id}`, {
        method: "GET",
        headers: getAuthHeaders(session?.access_token),
      });

      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        const errorText = await response
          .text()
          .catch(() => response.statusText);

        throw new Error(`Error ${response.status}: ${errorText}`);
      }
      const data = await response.json();

      return data as Case;
    } catch (err) {
      console.error("Error al obtener el caso:", err);
      throw err;
    }
  }, [session?.access_token]);

  // Cargar casos solo una vez cuando el provider se monta
  useEffect(() => {
    if (!hasLoaded) {
      fetchCases();
    }
  }, [hasLoaded, fetchCases]);

  const value = useMemo<CasesContextValue>(
    () => ({
      cases,
      isLoading,
      error,
      refreshCases,
      clearError,
      getCaseById,
    }),
    [cases, isLoading, error, refreshCases, clearError, getCaseById],
  );

  return (
    <CasesContext.Provider value={value}>{children}</CasesContext.Provider>
  );
}

export function useCases(): CasesContextValue {
  const context = useContext(CasesContext);

  if (!context) {
    throw new Error("useCases debe usarse dentro de un CasesProvider");
  }

  return context;
}
