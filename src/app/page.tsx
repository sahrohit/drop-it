"use client";

import { Button } from "@/components/ui/button";
import { auth } from "@/firebase";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { useAuthState } from "react-firebase-hooks/auth";

const Home = () => {
  const [user, loading, error] = useAuthState(auth);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>Error: {error.message}</p>;
  }

  return (
    <div className="grid place-items-center h-screen">
      <div>
        <p>Email: {user?.email}</p>
        <p>Display Name: {user?.displayName}</p>
        <p>UID: {user?.uid}</p>
        <p>Email Verified: {user?.emailVerified?.toString()}</p>
      </div>
      {user?.email ? (
        <Button
          onClick={() => {
            auth.signOut();
          }}
        >
          Logout
        </Button>
      ) : (
        <Button
          onClick={() => {
            signInWithPopup(auth, new GoogleAuthProvider());
          }}
        >
          Continue with Google
        </Button>
      )}
    </div>
  );
};

export default Home;
