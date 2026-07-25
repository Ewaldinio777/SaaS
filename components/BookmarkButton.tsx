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
  const [isSaved, setIsSaved] = useState(initialIsSaved);
  const [isPending, startTransition] = useTransition();

  const handleBookmarkClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const nextState = !isSaved;
    setIsSaved(nextState);

    startTransition(async () => {
      try {
        await toggleSaveCompanion(companionId);
      } catch (error) {
        setIsSaved(!nextState);
        console.error("Error saving in the library:", error);
      }
    });
  };

  return (
    <button
      onClick={handleBookmarkClick}
      disabled={isPending}
      aria-label={isSaved ? "Remove from the library" : "Save in the library"}
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
