import { useEffect, useState } from "react";
import { Modal, ModalContent, ModalBody } from "@heroui/modal";

import { title } from "./primitives";
import { AlertCircleIcon, CheckCircleIcon } from "./icons";

type NotificationModalProps = {
  isOpen: boolean;
  onClose: () => void;
  type: "success" | "error";
  message: string;
};

export function NotificationModal({
  isOpen,
  onClose,
  type,
  message,
}: NotificationModalProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      // Cerrar automáticamente después de 1 segundo
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => {
          onClose();
        }, 500); // Esperar a que termine la animación
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  return (
    <Modal
      hideCloseButton={true}
      isDismissable={false}
      isKeyboardDismissDisabled={true}
      isOpen={isVisible}
      size="sm"
      onClose={onClose}
    >
      <ModalContent>
        <ModalBody className="py-6">
          <div className="flex flex-col items-center justify-center text-center gap-4">
            <div
              className={`flex items-center justify-center w-12 h-12 rounded-full ${
                type === "success" ? "bg-success-100" : "bg-danger-100"
              }`}
            >
              {type === "success" ? <CheckCircleIcon /> : <AlertCircleIcon />}
            </div>
            <p className={title({ size: "md", fontWeight: "bold" })}>
              {message}
            </p>
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
