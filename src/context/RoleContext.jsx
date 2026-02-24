import { createContext, useContext, useEffect, useState } from "react";
import { nhost } from "../lib/nhost";

const RoleContext = createContext();

// list of professor emails (static for now)
const PROFESSOR_EMAILS = [
  "prof1@example.com",
  "prof2@example.com"
];

// administrators may also edit everything
const ADMIN_EMAILS = [
  "admin@example.com"
];

export const RoleProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState("student");

  // derive a role based on JWT claims if present, otherwise fall back to
  // the static email lists. when nhost is configured to add
  // `x-hasura-default-role` the token will contain it.
  const updateRole = async (userData) => {
    if (!userData) {
      setRole("student");
      return;
    }

    try {
      const token = await nhost.auth.getJWTToken();
      if (token) {
        const payload = JSON.parse(atob(token.split(".")[1]));
        const claims = payload["https://hasura.io/jwt/claims"] || {};
        const defaultRole = claims["x-hasura-default-role"];
        if (defaultRole) {
          setRole(defaultRole);
          return; // we obtained the role from the token
        }
      }
    } catch (e) {
      console.warn("unable to derive role from JWT", e);
    }

    // fallback to email lists if the token didn't contain a role
    if (ADMIN_EMAILS.includes(userData.email)) {
      setRole("admin");
    } else if (PROFESSOR_EMAILS.includes(userData.email)) {
      setRole("teacher");
    } else {
      setRole("student");
    }
  };

  const login = async (email, password) => {
    try {
      const { error } = await nhost.auth.signInEmailPassword({ email, password });
      if (error) return error;
      const u = await nhost.auth.getUser();
      setUser(u);
      await updateRole(u);
      return null;
    } catch (err) {
      // wrap any unexpected fetch/other errors into a usable object
      return { message: err.message || "Login failed" };
    }
  };

  const logout = async () => {
    try {
      const { error } = await nhost.auth.signOut();
      if (error) {
        // Nhost sometimes returns request-validation-error when no session exists
        console.warn("logout returned error:", error);
      }
    } catch (err) {
      console.warn("signOut failed:", err);
    }
    setUser(null);
    setRole("student");
  };

  useEffect(() => {
    // perform initial fetch of user when component mounts
    nhost.auth
      .getUser()
      .then(async (u) => {
        setUser(u);
        await updateRole(u);
      })
      .catch((err) => {
        // ignore unauthorized errors (no one logged in yet)
        if (err?.message?.toLowerCase().includes("unauthorized")) {
          return;
        }
        console.error("getUser failed:", err);
      });
    // note: nhost-js v4 does not expose onAuthStateChanged, so we
    // rely on explicit login/logout calls to keep state in sync.
  }, []);

  return (
    <RoleContext.Provider value={{ user, role, login, logout, setRole }}>
      {children}
    </RoleContext.Provider>
  );
};

export const useRole = () => useContext(RoleContext);
