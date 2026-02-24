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

  // decide role using metadata stored on the user (easiest with the
  // Hasura claim injected by nhost). if that's missing we fall back to the
  // hard‑coded email lists.
  const updateRole = (userData) => {
    if (!userData) {
      setRole("student");
      return;
    }

    // log the object during development so we see what's available
    console.debug("user object when updating role", userData);

    // nhost.auth.getUser() returns an object with `body` carrying the fields
    // including `defaultRole`. try to read that first.
    const defaultRoleFromBody = userData.body?.defaultRole;
    if (defaultRoleFromBody) {
      setRole(defaultRoleFromBody);
      return;
    }

    const claims =
      userData.metadata?.["https://hasura.io/jwt/claims"] || {};
    const defaultRole = claims["x-hasura-default-role"];
    if (defaultRole) {
      setRole(defaultRole);
      return;
    }

    // if no claim, use email lists as a fallback
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
      updateRole(u);
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
      .then((u) => {
        setUser(u);
        updateRole(u);
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
