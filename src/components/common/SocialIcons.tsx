import { FACEBOOK_URL, YOUTUBE_SUBSCRIBE_URL, YOUTUBE_URL } from "@/constants/social";

/** Brand marks (Material Symbols has no brand icons). */
export const YouTubeIcon = ({ size = 18, className = "" }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" className={className}>
    <path
      fill="currentColor"
      d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2 31.3 31.3 0 0 0 0 12a31.3 31.3 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1A31.3 31.3 0 0 0 24 12a31.3 31.3 0 0 0-.5-5.8zM9.6 15.6V8.4l6.3 3.6-6.3 3.6z"
    />
  </svg>
);

export const FacebookIcon = ({ size = 18, className = "" }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" className={className}>
    <path
      fill="currentColor"
      d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.69 4.53-4.69 1.31 0 2.68.24 2.68.24v2.97h-1.51c-1.49 0-1.96.93-1.96 1.89v2.25h3.33l-.53 3.49h-2.8V24C19.61 23.1 24 18.1 24 12.07z"
    />
  </svg>
);

/** Round YouTube + Facebook links for the dark footer. */
export const SocialLinks = ({ className = "" }: { className?: string }) => (
  <div className={`flex items-center gap-2.5 ${className}`}>
    <a
      href={YOUTUBE_URL}
      target="_blank"
      rel="noreferrer"
      aria-label="BrainXNext on YouTube"
      title="YouTube"
      className="flex h-9.5 w-9.5 items-center justify-center rounded-full bg-white/8 text-[#A9BFD8] transition-colors hover:bg-[#FF0000] hover:text-white"
    >
      <YouTubeIcon />
    </a>
    <a
      href={FACEBOOK_URL}
      target="_blank"
      rel="noreferrer"
      aria-label="BrainXNext on Facebook"
      title="Facebook"
      className="flex h-9.5 w-9.5 items-center justify-center rounded-full bg-white/8 text-[#A9BFD8] transition-colors hover:bg-[#1877F2] hover:text-white"
    >
      <FacebookIcon />
    </a>
  </div>
);

/** Red "Subscribe" pill that opens YouTube's subscribe prompt. */
export const YouTubeSubscribe = ({ className = "" }: { className?: string }) => (
  <a
    href={YOUTUBE_SUBSCRIBE_URL}
    target="_blank"
    rel="noreferrer"
    className={`inline-flex items-center gap-1.5 rounded-full bg-[#FF0000] px-3.5 py-1.75 text-[12.5px] font-extrabold text-white transition-colors hover:bg-[#CC0000] hover:text-white ${className}`}
  >
    <YouTubeIcon size={15} />
    Subscribe
  </a>
);
