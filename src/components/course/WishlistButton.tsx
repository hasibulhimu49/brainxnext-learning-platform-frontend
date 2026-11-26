import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import Icon from "@/components/common/Icon";
import { useIsWishlisted, useShopStore } from "@/stores/shopStore";

interface WishlistButtonProps {
  courseId: string;
  title: string;
  /** "icon": round heart over a course cover · "full": outline button with a label (course page) */
  variant?: "icon" | "full";
  className?: string;
}

/** solid heart when saved (Material Symbols FILL axis) */
const FILLED = { fontVariationSettings: "'FILL' 1" };

/** Heart toggle that saves a course to the wishlist (F-004). Works for guests too. */
const WishlistButton = ({ courseId, title, variant = "icon", className = "" }: WishlistButtonProps) => {
  const navigate = useNavigate();
  const saved = useIsWishlisted(courseId);
  const toggle = useShopStore((s) => s.toggleWishlist);
  const onClick = () => {
    toggle(courseId);
    toast(saved ? "Removed from your wishlist" : "Saved to your wishlist", {
      description: title,
      action: saved ? undefined : { label: "View", onClick: () => void navigate("/wishlist") },
    });
  };
  const label = saved ? `Remove ${title} from wishlist` : `Save ${title} to wishlist`;

  if (variant === "full") {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-pressed={saved}
        className={`btn btn-outline rounded-[13px] bg-transparent! px-4.5 py-3 ${saved ? "border-danger/50! text-danger!" : ""} ${className}`}
      >
        <Icon name="favorite" size={17} style={saved ? FILLED : undefined} />
        {saved ? "Saved to wishlist" : "Save to wishlist"}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={saved}
      aria-label={label}
      title={saved ? "Remove from wishlist" : "Save to wishlist"}
      className={`flex h-9 w-9 items-center justify-center rounded-full border-0 bg-white/92 shadow-[0_6px_16px_rgba(0,0,0,.22)] transition-transform hover:scale-110 ${saved ? "text-danger" : "text-[#41566F]"} ${className}`}
    >
      <Icon name="favorite" size={19} style={saved ? FILLED : undefined} />
    </button>
  );
};

export default WishlistButton;
