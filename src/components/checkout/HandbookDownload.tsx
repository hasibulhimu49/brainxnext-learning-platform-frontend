import type { ReactNode } from "react";
import { PLACEHOLDER_PDF, handbookFileName } from "@/constants/downloads";

interface HandbookDownloadProps {
  name: string;
  className?: string;
  children: ReactNode;
  onClick?: () => void;
}

/** A real file download for a handbook (the placeholder PDF until the real ones exist). */
const HandbookDownload = ({ name, className, children, onClick }: HandbookDownloadProps) => (
  <a href={PLACEHOLDER_PDF} download={handbookFileName(name)} className={className} onClick={onClick}>
    {children}
  </a>
);

export default HandbookDownload;
