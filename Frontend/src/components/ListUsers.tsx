import { useState } from "react";
import { Button } from "@heroui/button";
import { Link } from "@heroui/link";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";

import { ArrowUpRightIcon } from "./icons";
import { CreateUserForm } from "./CreateUserForm";

import { title } from "@/components/primitives";
import { DataTable, type DataTableColumn } from "@/components/DataTable";
import { useUsers } from "@/lib/users-context";

type User = {
  id: string;
  email: string;
  nombre: string | null;
  rol: string;
  created_at: string;
  updated_at: string;
};

const formatDate = (dateStr: string) => {
  try {
    return new Date(dateStr).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
};

export const ListUsers = () => {
  const { users, isLoading, deleteUser } = useUsers();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleEdit = (user: User) => {
    setEditingUser(user);
  };

  const handleRequestDelete = (user: User) => {
    setUserToDelete(user);
  };

  const handleCancelDelete = () => {
    setUserToDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;
    setDeletingId(userToDelete.id);
    const result = await deleteUser(userToDelete.id);

    setDeletingId(null);
    setUserToDelete(null);
    if (!result.success) {
      window.alert(result.error || "Error al eliminar usuario");
    }
  };

  const columns: DataTableColumn<User>[] = [
    {
      key: "nombre",
      label: "Nombre",
      allowsSorting: true,
      renderCell: (user) => user.nombre ?? "—",
    },
    {
      key: "email",
      label: "Correo",
      allowsSorting: true,
    },
    {
      key: "created_at",
      label: "Agregado en",
      allowsSorting: true,
      sortValue: (user) => new Date(user.created_at).getTime(),
      renderCell: (user) => formatDate(user.created_at),
    },
    {
      key: "rol",
      label: "Acceso",
      allowsSorting: true,
      renderCell: (user) => (
        <div
          className={`inline-flex items-center px-4 py-0.5 rounded-full text-sm font-medium capitalize ${
            user.rol === "admin"
              ? "bg-primary text-default"
              : "bg-gray text-black"
          }`}
        >
          <span
            className={title({
              size: "sm",
              fontWeight: "medium",
              color: user.rol === "admin" ? "brown" : "default",
            })}
          >
            {user.rol}
          </span>
        </div>
      ),
    },
    {
      key: "acciones",
      label: "Acciones",
      align: "start",
      allowsSorting: false,
      renderCell: (user) => (
        <div className="flex items-center justify-start gap-4">
          <Link className="cursor-pointer" onPress={() => handleEdit(user)}>
            <span
              className={title({
                size: "sm",
                fontWeight: "bold",
                color: "blue",
                uppercase: true,
              })}
            >
              editar
            </span>
          </Link>
          <Link
            className="cursor-pointer"
            onPress={() => handleRequestDelete(user)}
          >
            <span
              className={title({
                size: "sm",
                fontWeight: "bold",
                color: "red",
                uppercase: true,
              })}
            >
              eliminar
            </span>
          </Link>
        </div>
      ),
    },
  ];

  return (
    <div className="w-full">
      {/* Contar el numero de usuarios */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <div className="bg-primary rounded-full px-2">
            <span
              className={title({
                size: "sm",
                fontWeight: "bold",
                color: "default",
              })}
            >
              {users.length}
            </span>
          </div>
          <span className={title({ size: "xl", fontWeight: "bold" })}>
            Usuarios
          </span>
        </div>
        <Button
          color="primary"
          endContent={<ArrowUpRightIcon />}
          size="sm"
          variant="solid"
          onPress={() => setIsCreateOpen(true)}
        >
          <span
            className={title({
              size: "sm",
              fontWeight: "bold",
              color: "default",
            })}
          >
            Crear usuario
          </span>
        </Button>
      </div>
      <CreateUserForm isOpen={isCreateOpen} onOpenChange={setIsCreateOpen} />
      <CreateUserForm
        isOpen={!!editingUser}
        userToEdit={editingUser}
        onOpenChange={(open) => !open && setEditingUser(null)}
      />
      <Modal
        isOpen={!!userToDelete}
        placement="center"
        size="md"
        onOpenChange={(open) => !open && handleCancelDelete()}
      >
        <ModalContent>
          <ModalHeader>
            <span className={title({ size: "lg", fontWeight: "bold" })}>
              Eliminar usuario
            </span>
          </ModalHeader>
          <ModalBody>
            <p className={title({ size: "sm", fontWeight: "normal" })}>
              ¿Estás seguro de querer eliminar a{" "}
              <span className="font-bold">
                {userToDelete?.nombre || userToDelete?.email}
              </span>
              ?
            </p>
          </ModalBody>
          <ModalFooter>
            <Button
              color="default"
              isDisabled={!!deletingId}
              variant="solid"
              onPress={handleCancelDelete}
            >
              <span
                className={title({
                  size: "sm",
                  fontWeight: "semibold",
                  color: "white",
                })}
              >
                Cancelar
              </span>
            </Button>
            <Button
              color="danger"
              isDisabled={!!deletingId}
              isLoading={deletingId === userToDelete?.id}
              variant="solid"
              onPress={handleConfirmDelete}
            >
              <span
                className={title({
                  size: "sm",
                  fontWeight: "semibold",
                  color: "white",
                })}
              >
                Eliminar
              </span>
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <DataTable<User>
        showSearch
        columns={columns}
        emptyContent="No hay usuarios registrados."
        isLoading={isLoading}
        items={users}
        keyExtractor={(user) => user.id}
        pageSize={6}
        radius="sm"
        searchKeys={["nombre", "email", "rol"]}
        searchPlaceholder="Buscar"
        shadow="none"
        showFilters={true}
        showPagination={true}
      />
    </div>
  );
};
