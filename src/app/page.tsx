"use client";

import { Button } from "@/components/ui/button";
import { auth } from "@/firebase";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useAuthState } from "react-firebase-hooks/auth";

const Home = () => {
  const router = useRouter();
  const [user, loading, error] = useAuthState(auth);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>Error: {error.message}</p>;
  }

  if (user) {
    router.push("/dashboard");
  }

  return (
    <div className="grid place-items-center h-screen">
      <Button
        onClick={() => {
          signInWithPopup(auth, new GoogleAuthProvider());
        }}
      >
        Continue with Google
      </Button>
    </div>
  );
};

export default Home;
