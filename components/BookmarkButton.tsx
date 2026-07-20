"use client";

import { useState, useTransition } from "react";
import { toggleSaveCompanion } from "@/lib/actions/companion.actions";
import Image from "next/image";

interface BookmarkButtonProps {
  companionId: string;
  initialIsSaved: boolean;
}

export const BookmarkButton = ({
  companionId,
  initialIsSaved,
}: BookmarkButtonProps) => {
  // 1. Estado local para cambio instantáneo de UI
  const [isSaved, setIsSaved] = useState(initialIsSaved);
  const [isPending, startTransition] = useTransition();

  const handleBookmarkClick = async (e: React.MouseEvent) => {
    e.preventDefault(); // Evita navegar si el botón está dentro de un Link/Card
    e.stopPropagation();

    // 2. Actualización optimista: Cambiamos la UI de inmediato
    const nextState = !isSaved;
    setIsSaved(nextState);

    // 3. Ejecutamos la Server Action en segundo plano
    startTransition(async () => {
      try {
        await toggleSaveCompanion(companionId);
      } catch (error) {
        // Si falla en el servidor, revertimos el estado visual
        setIsSaved(!nextState);
        console.error("Error al guardar en la biblioteca:", error);
      }
    });
  };

  return (
    <button
      onClick={handleBookmarkClick}
      disabled={isPending}
      aria-label={
        isSaved ? "Quitar de la biblioteca" : "Guardar en la biblioteca"
      }
      className="companion-bookmark"
    >
      {isSaved ? (
        <Image
          src="/icons/bookmark-filled.svg"
          alt="bookmark-filled"
          width={12.5}
          height={15}
        />
      ) : (
        <Image
          src="/icons/bookmark.svg"
          alt="bookmark"
          width={12.5}
          height={15}
        />
      )}
    </button>
  );
};
