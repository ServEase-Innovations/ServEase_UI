/* eslint-disable */
import React, { useState } from "react";
import axios from "axios";

const API_URL = "https://utils-ndt3.onrender.com/api";

const RegisterWith2FA = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [qrCode, setQrCode] = useState("");
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");
  const [userId, setUserId] = useState("");
  const [step, setStep] = useState<"register" | "verify">("register");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API_URL}/register`, { username, password });
      setQrCode(res.data.qr); // base64 image
      setUsername(res.data.username); // Needed for OTP verify
      setStep("verify");
      setMessage("Scan the QR code in Google Authenticator, then enter the OTP");
    } catch (err: any) {
      setMessage(err.response?.data?.message || "Registration failed");
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API_URL}/verify`, { username, token: otp });
      setMessage("✅ 2FA setup complete! You can now login.");
      setStep("register");
      setQrCode("");
      setOtp("");
    } catch (err: any) {
      setMessage(err.response?.data?.message || "Verification failed");
    }
  };

  return (
    <div style={styles.container}>
      <h2>Register & Setup 2FA</h2>
      {message && <p style={styles.message}>{message}</p>}

      {step === "register" && (
        <form onSubmit={handleRegister}>
          <input placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} required style={styles.input} />
          <input placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required style={styles.input} />
          <button type="submit" style={styles.button}>Register</button>
        </form>
      )}

      {step === "verify" && (
        <>
          <img src={qrCode} alt="QR Code" style={{ width: "200px", margin: "20px 0" }} />
          <form onSubmit={handleVerify}>
            <input placeholder="Enter OTP from Google Authenticator" value={otp} onChange={(e) => setOtp(e.target.value)} required style={styles.input} />
            <button type="submit" style={styles.button}>Verify OTP</button>
          </form>
        </>
      )}
    </div>
  );
};

const styles = {
  container: {
    maxWidth: 400,
    margin: "50px auto",
    padding: 20,
    border: "1px solid #ccc",
    borderRadius: 10,
  },
  input: {
    width: "100%",
    marginBottom: 10,
    padding: 8,
  },
  button: {
    width: "100%",
    padding: 10,
    backgroundColor: "#1976d2",
    color: "#fff",
    border: "none",
    cursor: "pointer",
  },
  message: {
    color: "crimson",
  },
};

export default RegisterWith2FA;
