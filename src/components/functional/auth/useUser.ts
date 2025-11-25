import useAuth from "./useAuth";

const useUser = () => {
  const { auth } = useAuth();
  if (!auth || !auth.user) {
    throw new Error("User is not authenticated");
  }
  return auth.user;
};

export default useUser;
