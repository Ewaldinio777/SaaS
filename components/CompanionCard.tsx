import {
  isCompanionSaved,
  toggleSaveCompanion,
} from "@/lib/actions/companion.actions";
import Image from "next/image";
import Link from "next/link";
import { BookmarkButton } from "./BookmarkButton";

interface CompanionCardProps {
  id: string;
  name: string;
  topic: string;
  subject: string;
  duration: number;
  color: string;
}

const CompanionCard = async ({
  id,
  name,
  topic,
  subject,
  duration,
  color,
}: CompanionCardProps) => {
  const initialIsSaved = await isCompanionSaved(id);

  return (
    <article className="companion-card" style={{ backgroundColor: color }}>
      <div className="flex justify-between items-center">
        <div className="subject-badge">{subject}</div>
        <BookmarkButton companionId={id} initialIsSaved={initialIsSaved} />
      </div>

      <h2 className="text-2xl font-bold">{name}</h2>
      <p className="text-sm">{topic}</p>
      <div className="flex items-center gap-2">
        <Image
          src="/icons/clock.svg"
          alt="duration"
          width={13.5}
          height={13.5}
        />
        <p className="text-sm">{duration} minutes</p>
      </div>
      <Link href={`/companions/${id}`} className="w-full">
        <button className="btn-primary w-full justify-center">
          Launch Session
        </button>
      </Link>
    </article>
  );
};

export default CompanionCard;
