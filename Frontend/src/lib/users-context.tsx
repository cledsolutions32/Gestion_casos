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

type User = {
  id: string;
  email: string;
  nombre: string | null;
  rol: string;
  created_at: string;
  updated_at: string;
};

type CreateUserPayload = {
  email: string;
  nombre: string;
  rol: string;
};

type UpdateUserPayload = {
  id: string;
  email: string;
  nombre: string;
  rol: string;
};

type UsersContextValue = {
  users: User[];
  isLoading: boolean;
  error: string | null;
  refreshUsers: () => Promise<void>;
  clearError: () => void;
  createUser: (
    payload: CreateUserPayload,
  ) => Promise<{ success: boolean; error?: string }>;
  updateUser: (
    payload: UpdateUserPayload,
  ) => Promise<{ success: boolean; error?: string }>;
  deleteUser: (id: string) => Promise<{ success: boolean; error?: string }>;
};

const UsersContext = createContext<UsersContextValue | null>(null);

export function UsersProvider({ children }: { children: ReactNode }) {
  const { session } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);

  const clearError = useCallback(() => setError(null), []);

  const fetchUsers = useCallback(async () => {
    try {
      setError(null);
      setIsLoading(true);
      const response = await fetch(`${API_URL}/users`, {
        headers: getAuthHeaders(session?.access_token),
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      // Ordenar por created_at descendente
      const sortedData = data.sort(
        (a: User, b: User) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      );

      setUsers(sortedData);
      setHasLoaded(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al cargar usuarios");
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  }, [session?.access_token]);

  const refreshUsers = useCallback(async () => {
    await fetchUsers();
  }, [fetchUsers]);

  const createUser = useCallback(
    async (payload: CreateUserPayload) => {
      try {
        setError(null);
        const response = await fetch(`${API_URL}/users`, {
          method: "POST",
          headers: getAuthHeaders(session?.access_token),
          body: JSON.stringify(payload),
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          const msg = data?.message || `Error ${response.status}`;

          setError(msg);

          return { success: false, error: msg };
        }

        await fetchUsers();

        return { success: true };
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Error al crear usuario";

        setError(msg);

        return { success: false, error: msg };
      }
    },
    [fetchUsers, session?.access_token],
  );

  const updateUser = useCallback(
    async (payload: UpdateUserPayload) => {
      try {
        setError(null);
        const { id, email, nombre, rol } = payload;
        const response = await fetch(`${API_URL}/users/${id}`, {
          method: "PATCH",
          headers: getAuthHeaders(session?.access_token),
          body: JSON.stringify({ email, nombre, rol }),
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          const msg = data?.message || `Error ${response.status}`;

          setError(msg);

          return { success: false, error: msg };
        }

        await fetchUsers();

        return { success: true };
      } catch (e) {
        const msg =
          e instanceof Error ? e.message : "Error al actualizar usuario";

        setError(msg);

        return { success: false, error: msg };
      }
    },
    [fetchUsers, session?.access_token],
  );

  const deleteUser = useCallback(
    async (id: string) => {
      try {
        setError(null);
        const response = await fetch(`${API_URL}/users/${id}`, {
          method: "DELETE",
          headers: getAuthHeaders(session?.access_token),
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          const msg = data?.message || `Error ${response.status}`;

          setError(msg);

          return { success: false, error: msg };
        }

        await fetchUsers();

        return { success: true };
      } catch (e) {
        const msg =
          e instanceof Error ? e.message : "Error al eliminar usuario";

        setError(msg);

        return { success: false, error: msg };
      }
    },
    [fetchUsers, session?.access_token],
  );

  // Cargar usuarios solo una vez cuando el componente se monta
  useEffect(() => {
    if (!hasLoaded) {
      fetchUsers();
    }
  }, [hasLoaded, fetchUsers]);

  const value = useMemo<UsersContextValue>(
    () => ({
      users,
      isLoading,
      error,
      refreshUsers,
      clearError,
      createUser,
      updateUser,
      deleteUser,
    }),
    [
      users,
      isLoading,
      error,
      refreshUsers,
      clearError,
      createUser,
      updateUser,
      deleteUser,
    ],
  );

  return (
    <UsersContext.Provider value={value}>{children}</UsersContext.Provider>
  );
}

export function useUsers(): UsersContextValue {
  const context = useContext(UsersContext);

  if (!context) {
    throw new Error("useUsers debe usarse dentro de un UsersProvider");
  }

  return context;
}
