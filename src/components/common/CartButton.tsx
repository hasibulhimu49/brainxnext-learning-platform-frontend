import { Link } from "react-router-dom";
import Icon from "./Icon";
import { useCartCount } from "@/stores/shopStore";

/** Navbar cart icon with the item count (F-004). */
const CartButton = ({ className = "" }: { className?: string }) => {
  const count = useCartCount();
  return (
    <Link
      to="/cart"
      aria-label={count ? `Cart, ${count} ${count === 1 ? "course" : "courses"}` : "Cart"}
      title="Cart"
      className={`icon-btn relative text-ink ${className}`}
    >
      <Icon name="shopping_cart" size={20} />
      {count > 0 && (
        <span
          aria-hidden="true"
          className="absolute -top-1 -right-1 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-danger px-1 text-[10.5px] leading-none font-extrabold text-white"
        >
          {count}
        </span>
      )}
    </Link>
  );
};

export default CartButton;
