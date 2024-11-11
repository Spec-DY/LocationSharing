import React, { createContext, useState, useContext, useEffect } from "react";
import { FIREBASE_AUTH } from "../firebase/firebaseConfig";
import { userService } from "../firebase/services/userService";

const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 监听 Firebase Auth 状态
  useEffect(() => {
    const unsubscribe = FIREBASE_AUTH.onAuthStateChanged(
      async (firebaseUser) => {
        try {
          if (firebaseUser) {
            // 如果已登录，获取用户的完整信息
            const userProfile = await userService.getUserProfile(
              firebaseUser.uid
            );
            setUser(
              userProfile ? { ...firebaseUser, ...userProfile } : firebaseUser
            );
          } else {
            setUser(null);
          }
        } catch (error) {
          console.error("Auth state change error:", error);
        } finally {
          setLoading(false);
        }
      }
    );

    return () => unsubscribe();
  }, []);

  // 登出
  const signOut = async () => {
    try {
      await FIREBASE_AUTH.signOut();
      setUser(null);
    } catch (error) {
      console.error("Sign out error:", error);
      throw error;
    }
  };

  return (
    <UserContext.Provider
      value={{
        user,
        setUser,
        signOut,
        loading,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
