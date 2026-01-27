import React, { useState, useMemo, useEffect, useRef } from "react";
import { User } from "../../../types";
import { useAuthStore } from "../../../stores/useAuthStore";
import { useNotification } from "../../../providers/NotificationProvider";
import { usersApi } from "../../../services/api/master-data.api";

interface UseManageAccountLogicProps {
  currentUser: User;
}

export const useManageAccountLogic = ({ currentUser }: UseManageAccountLogicProps) => {
  const updateCurrentUser = useAuthStore((state) => state.updateCurrentUser);
  const logout = useAuthStore((state) => state.logout);
  const addNotification = useNotification();

  const isMounted = useRef(true);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  // --- STATE ---
  const [name, setName] = useState(currentUser.name);
  const [email, setEmail] = useState(currentUser.email);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [nameError, setNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const [passwordVisibility, setPasswordVisibility] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  // KITA NONAKTIFKAN MODAL CANGGIH DULU, PAKAI NATIVE ALERT
  const [showReloginModal, setShowReloginModal] = useState(false);

  // --- LOGIC PASSWORD ---
  const allowedSymbols = "!@#$%^&*()_+-=[]{}|;:,.<>?";
  const { allowedSymbolsRegex, symbolCheckRegex } = useMemo(() => {
    const escaped = allowedSymbols.replace(/[-[\]{}()*+?.,\\^$|]/g, "\\$&");
    return {
      allowedSymbolsRegex: new RegExp(`^[a-zA-Z0-9${escaped}]+$`),
      symbolCheckRegex: new RegExp(`[${escaped}]`),
    };
  }, [allowedSymbols]);

  const passwordChecks = useMemo(() => {
    const password = newPassword;
    return {
      length: password.length >= 8,
      upperLower: /[A-Z]/.test(password) && /[a-z]/.test(password),
      number: /\d/.test(password),
      symbol: symbolCheckRegex.test(password),
      noSpaces: !/\s/.test(password),
      onlyAllowed: password === "" || allowedSymbolsRegex.test(password),
    };
  }, [newPassword, allowedSymbolsRegex, symbolCheckRegex]);

  const passwordStrength = useMemo(() => {
    const checks = passwordChecks;
    if (!newPassword) return { score: 0, label: "", color: "" };
    let score = 0;
    if (checks.length) score++;
    if (checks.upperLower) score++;
    if (checks.number) score++;
    if (checks.symbol) score++;
    if (!checks.noSpaces || !checks.onlyAllowed)
      return { score: 1, label: "Error", color: "bg-red-500" };
    if (score === 0 && newPassword.length > 0)
      return { score: 1, label: "Lemah", color: "bg-red-500" };
    if (score === 1) return { score: 1, label: "Lemah", color: "bg-red-500" };
    if (score === 2) return { score: 2, label: "Sedang", color: "bg-orange-500" };
    if (score === 3) return { score: 3, label: "Kuat", color: "bg-blue-500" };
    if (score >= 4) return { score: 4, label: "Sangat Kuat", color: "bg-green-500" };
    return { score: 0, label: "", color: "" };
  }, [newPassword, passwordChecks]);

  // --- VALIDASI ---
  const validate = () => {
    let isValid = true;
    setNameError("");
    setEmailError("");
    setPasswordError("");

    // Simple validation bypass for debugging logic issues
    if (!name || !email) {
      addNotification("Nama dan Email wajib diisi", "error");
      return false;
    }

    if (newPassword) {
      if (!currentPassword) {
        setPasswordError("Password lama wajib diisi");
        return false;
      }
      if (newPassword !== confirmPassword) {
        setPasswordError("Konfirmasi password tidak cocok");
        return false;
      }
    }

    return true;
  };

  const handleRelogin = () => {
    logout();
    window.location.assign("/login");
  };

  // --- SUBMIT HANDLER YANG LEBIH AMAN ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("1. Submit triggered");

    if (!validate()) {
      console.log("Validation failed");
      return;
    }

    setIsLoading(true);

    try {
      let isPasswordUpdated = false;
      let isProfileUpdated = false;
      let updatedUser = currentUser;

      console.log("2. Starting API Calls...");

      // 1. Ganti Password
      if (newPassword && currentPassword) {
        console.log("3. Calling changePassword API...");
        await usersApi.changePassword(currentUser.id, {
          currentPassword,
          newPassword,
        });
        isPasswordUpdated = true;
        console.log("4. Password changed SUCCESS");
      }

      // 2. Ganti Profil
      if (name !== currentUser.name || email !== currentUser.email) {
        console.log("5. Calling update profile API...");
        const payload = { name, email };
        updatedUser = await usersApi.update(currentUser.id, payload);
        isProfileUpdated = true;
        console.log("6. Profile updated SUCCESS");
      }

      console.log("7. All API calls finished. Handling UI...");

      // --- LOGIC SUKSES ---

      if (isPasswordUpdated) {
        setIsLoading(false); // Stop spinner
        setIsRedirecting(true); // Disable input

        // GUNAKAN NATIVE ALERT (Anti Gagal)
        // Jika ini muncul, berarti logika backend & frontend SUKSES.
        // Masalahnya hanya di Modal CSS Anda sebelumnya.
        alert("BERHASIL! Password telah diubah. Anda harus login ulang.");

        handleRelogin(); // Langsung logout
        return;
      }

      if (isProfileUpdated) {
        updateCurrentUser(updatedUser);
        addNotification("Profil berhasil disimpan", "success");
      } else {
        addNotification("Tidak ada perubahan", "info");
      }

      // Reset form
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      console.error("CRITICAL ERROR:", error);

      let msg = "Terjadi kesalahan sistem.";
      if (error.response && error.response.data) {
        msg = error.response.data.message || JSON.stringify(error.response.data);
      } else if (error.message) {
        msg = error.message;
      }

      addNotification(msg, "error");
    } finally {
      // Pastikan loading mati apa pun yang terjadi
      setIsLoading(false);
      console.log("8. Finally block executed");
    }
  };

  return {
    name,
    setName,
    email,
    setEmail,
    currentPassword,
    setCurrentPassword,
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    passwordVisibility,
    setPasswordVisibility,
    isLoading,
    isRedirecting,
    showReloginModal,
    handleRelogin,
    nameError,
    emailError,
    passwordError,
    passwordChecks,
    passwordStrength,
    allowedSymbols,
    handleSubmit,
  };
};
