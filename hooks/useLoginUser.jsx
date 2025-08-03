import { useMutation } from "@tanstack/react-query";
import { signInWithEmailAndPassword } from "firebase/auth";
import { getUserById } from "../apis/userAPI";
import { auth } from "../firebase";

export const useLoginUser = () => {
  return useMutation({
    mutationFn: async ({ email, password }) => {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const user = cred.user;

      const idToken = await user.getIdToken();
      const profile = await getUserById(user.uid);

      localStorage.setItem("token", idToken);
      localStorage.setItem("user", JSON.stringify({ ...profile, uid: user.uid }));

      return { uid: user.uid, email: user.email, idToken, profile };
    },
  });
};
