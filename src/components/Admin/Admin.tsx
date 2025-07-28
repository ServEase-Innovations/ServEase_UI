/* eslint-disable */
import React, { useState } from "react";
import RegisterWith2FA from "./RegisterWith2FA";
import LoginWith2FA from "./LoginWith2FA";
import { Dashboard } from "@mui/icons-material";

function Admin() {
  const [view, setView] = useState<"register" | "login" | "dashboard">("register");
  const [role, setRole] = useState("");

  const handleLoginSuccess = (userRole: string) => {
    setRole(userRole);
    setView("dashboard");
  };

  return (
    <div>
      <header style={styles.header}>
        <button onClick={() => setView("register")} style={styles.button}>Register</button>
        <button onClick={() => setView("login")} style={styles.button}>Login</button>
      </header>

      <main>
        {view === "register" && <RegisterWith2FA />}
        {view === "login" && <LoginWith2FA onLoginSuccess={handleLoginSuccess} />}
        {view === "dashboard" && <Dashboard role={role} />}
      </main>
    </div>
  );
}

const styles = {
  header: {
    display: "flex",
    justifyContent: "center",
    gap: 20,
    padding: 20,
    background: "#f0f0f0",
  },
  button: {
    padding: "10px 20px",
    fontWeight: "bold",
    cursor: "pointer",
  },
};

export default Admin;
