import { useLocation } from "react-router-dom";

/** Marks where a redirect landed in tests: "Stub: <route pattern> <url>". */
const Stub = ({ name }: { name: string }) => {
  const { pathname, search } = useLocation();
  return (
    <div>
      Stub: {name} {pathname + search}
    </div>
  );
};

export default Stub;
