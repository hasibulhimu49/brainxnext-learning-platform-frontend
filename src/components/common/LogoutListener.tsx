import { useLogoutListener } from "@/queries/auth";

/** Finishes a logout once the app has navigated home (see useLogout). Mounted once in App. */
const LogoutListener = () => {
  useLogoutListener();
  return null;
};

export default LogoutListener;
