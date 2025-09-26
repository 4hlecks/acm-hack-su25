"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import { io } from "socket.io-client";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5001";

export default function MaintenanceWrapper({ children }) {
  const pathname = usePathname();
  const router = useRouter();

  const [maintenance, setMaintenance] = useState(false);
  const [maintReady, setMaintReady] = useState(false);

  const [userRole, setUserRole] = useState(null);
  const [roleReady, setRoleReady] = useState(false);

  const socketRef = useRef(null);

  const isAuthRoute = useMemo(() => {
    if (!pathname) return false;
    return pathname.startsWith("/login") || pathname.startsWith("/signup");
  }, [pathname]);

  const shouldOverlay = useMemo(() => {
    if (!maintReady || !roleReady) return false;
    if (isAuthRoute) return false;
    return maintenance && userRole !== "admin";
  }, [maintReady, roleReady, isAuthRoute, maintenance, userRole]);

  const handleLogout = () => {
    try {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.dispatchEvent(new Event("authChanged")); // ⭐ notify wrapper
    } catch {}
    router.push("/login");
  };

  // helper to fetch role
  const loadRole = () => {
    let headers = { "Content-Type": "application/json" };
    try {
      const token = localStorage.getItem("token");
      if (token) headers["Authorization"] = `Bearer ${token}`;
    } catch {}

    fetch(`${API_BASE}/api/me`, {
      method: "GET",
      headers,
      credentials: "include",
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        console.log("Fetched /api/me:", data);
        setUserRole(data?.user?.role ?? null);
      })
      .catch(() => setUserRole(null))
      .finally(() => setRoleReady(true));
  };

  useEffect(() => {
    // socket
    const s = io(API_BASE, { withCredentials: true });
    socketRef.current = s;

    s.on("maintenance-update", (data) => {
      if (typeof data?.enabled === "boolean") {
        setMaintenance(data.enabled);
        setMaintReady(true);
      }
    });

    // fetch maintenance state once
    fetch(`${API_BASE}/api/maintenance`)
      .then((r) => r.json())
      .then((data) => {
        if (typeof data?.enabled === "boolean") setMaintenance(data.enabled);
      })
      .catch(() => {})
      .finally(() => setMaintReady(true));

    // initial role
    loadRole();

    // listen for auth change events
    const handleAuthChange = () => loadRole();
    window.addEventListener("authChanged", handleAuthChange);

    return () => {
      s.off("maintenance-update");
      s.close();
      socketRef.current = null;
      window.removeEventListener("authChanged", handleAuthChange);
    };
  }, []);

  return (
    <>
      {children}
      {shouldOverlay && (
        <Overlay
          onLogout={handleLogout}
          loggedIn={userRole === "user" || userRole === "club" || userRole === "admin"}
        />
      )}
    </>
  );
}

function Overlay({ onLogout, loggedIn }) {
  return (
    <div style={outerStyle}>
      <div style={cardStyle}>
        <h1 style={{ margin: 0, fontSize: "1.75rem" }}>Site Under Maintenance</h1>
        <p style={{ marginTop: "0.75rem", lineHeight: 1.5 }}>
          We’ll be back soon. Thanks for your patience!
        </p>

        {loggedIn ? (
          <button onClick={onLogout} style={buttonStyle}>
            Sign out
          </button>
        ) : (
          <a href="/login" style={{ ...buttonStyle, textDecoration: "none" }}>
            Go to Login
          </a>
        )}
      </div>
    </div>
  );
}

const outerStyle = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.6)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 9999,
  backdropFilter: "blur(2px)",
};

const cardStyle = {
  width: "min(560px, 92vw)",
  background: "white",
  borderRadius: "16px",
  padding: "24px 20px",
  boxShadow: "0 10px 24px rgba(0,0,0,0.2)",
};

const buttonStyle = {
  marginTop: "16px",
  display: "inline-block",
  background: "black",
  color: "white",
  border: 0,
  borderRadius: "10px",
  padding: "10px 16px",
  cursor: "pointer",
};
