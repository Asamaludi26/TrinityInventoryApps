import { useState, useMemo, useEffect } from "react";
import { User } from "../../../types";
import { useAuthStore } from "../../../stores/useAuthStore";
import { useNotification } from "../../../providers/NotificationProvider";
import { usersApi } from "../../../services/api/master-data.api";

interface UseManageAccountLogicProps {
  currentUser: User;
}

export interface PasswordValidationState {
  currentPasswordValid: boolean | null;
  currentPasswordVerifying: boolean;
  currentPasswordError: string;
  confirmPasswordMatch: boolean | null;
  newPasswordSameAsCurrent: boolean; // true = kata sandi baru sama dengan saat ini (tidak boleh)
}

export const useManageAccountLogic = ({ currentUser }: UseManageAccountLogicProps) => {
  const updateCurrentUser = useAuthStore((state) => state.updateCurrentUser);
  const logout = useAuthStore((state) => state.logout);
  const addNotification = useNotification();

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
  const [showReloginModal, setShowReloginModal] = useState(false);

  const [passwordValidation, setPasswordValidation] = useState<PasswordValidationState>({
    currentPasswordValid: null,
    currentPasswordVerifying: false,
    currentPasswordError: "",
    confirmPasswordMatch: null,
    newPasswordSameAsCurrent: false,
  });

  // --- PASSWORD STRENGTH LOGIC ---
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

  // --- VERIFIKASI PASSWORD SAAT INI (useEffect dengan debounce) ---
  useEffect(() => {
    // Jika password kosong atau terlalu pendek, reset state
    if (!currentPassword || currentPassword.length < 3) {
      setPasswordValidation((prev) => ({
        ...prev,
        currentPasswordValid: null,
        currentPasswordVerifying: false,
        currentPasswordError: "",
      }));
      return;
    }

    // Set verifying state
    setPasswordValidation((prev) => ({
      ...prev,
      currentPasswordVerifying: true,
      currentPasswordValid: null,
      currentPasswordError: "",
    }));

    // Debounce 600ms
    const timer = setTimeout(() => {
      usersApi
        .verifyPassword(currentUser.id, currentPassword)
        .then((result) => {
          const isValid = result?.valid === true;
          setPasswordValidation((prev) => ({
            ...prev,
            currentPasswordValid: isValid,
            currentPasswordVerifying: false,
            currentPasswordError: isValid ? "" : "Kata sandi saat ini tidak sesuai.",
          }));
        })
        .catch(() => {
          setPasswordValidation((prev) => ({
            ...prev,
            currentPasswordValid: false,
            currentPasswordVerifying: false,
            currentPasswordError: "Gagal memverifikasi. Coba lagi.",
          }));
        });
    }, 600);

    return () => clearTimeout(timer);
  }, [currentPassword, currentUser.id]);

  // --- CEK KATA SANDI BARU TIDAK SAMA DENGAN SAAT INI ---
  useEffect(() => {
    // Kata sandi baru tidak boleh sama dengan kata sandi saat ini
    const isSame = !!(currentPassword && newPassword && currentPassword === newPassword);
    setPasswordValidation((prev) => ({
      ...prev,
      newPasswordSameAsCurrent: isSame,
    }));
  }, [currentPassword, newPassword]);

  // --- KONFIRMASI PASSWORD MATCH ---
  useEffect(() => {
    if (!confirmPassword) {
      setPasswordValidation((prev) => ({
        ...prev,
        confirmPasswordMatch: null,
      }));
      return;
    }

    const match = newPassword === confirmPassword;
    setPasswordValidation((prev) => ({
      ...prev,
      confirmPasswordMatch: match,
    }));
  }, [newPassword, confirmPassword]);

  // --- CAN SUBMIT ---
  const canSubmit = useMemo(() => {
    if (isLoading || isRedirecting) return false;
    if (!name.trim() || !email.trim()) return false;

    // Jika tidak ada password baru, hanya profil yang diubah
    if (!newPassword && !currentPassword) return true;

    // Jika ada password baru, semua validasi harus terpenuhi
    if (newPassword) {
      if (passwordValidation.currentPasswordValid !== true) return false;
      if (passwordValidation.newPasswordSameAsCurrent) return false; // Tidak boleh sama
      if (passwordValidation.confirmPasswordMatch !== true) return false;
      const allChecks = Object.values(passwordChecks).every(Boolean);
      if (!allChecks) return false;
    }

    return true;
  }, [
    isLoading,
    isRedirecting,
    name,
    email,
    newPassword,
    currentPassword,
    passwordValidation.currentPasswordValid,
    passwordValidation.newPasswordSameAsCurrent,
    passwordValidation.confirmPasswordMatch,
    passwordChecks,
  ]);

  // --- VALIDASI FORM ---
  const validate = () => {
    let isValid = true;
    setNameError("");
    setEmailError("");
    setPasswordError("");

    if (name.trim().length < 3) {
      setNameError("Nama harus memiliki minimal 3 karakter.");
      isValid = false;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError("Format email tidak valid.");
      isValid = false;
    }

    if (newPassword) {
      if (!currentPassword) {
        setPasswordError("Kata sandi saat ini wajib diisi.");
        isValid = false;
      } else if (passwordValidation.currentPasswordValid !== true) {
        setPasswordError("Kata sandi saat ini tidak valid.");
        isValid = false;
      }

      // Cek kata sandi baru tidak sama dengan saat ini
      if (passwordValidation.newPasswordSameAsCurrent) {
        setPasswordError("Kata sandi baru tidak boleh sama dengan kata sandi saat ini.");
        isValid = false;
      } else if (!passwordChecks.length) {
        setPasswordError("Kata sandi baru minimal 8 karakter.");
        isValid = false;
      } else if (!passwordChecks.upperLower) {
        setPasswordError("Kata sandi baru harus mengandung huruf besar dan kecil.");
        isValid = false;
      } else if (!passwordChecks.number) {
        setPasswordError("Kata sandi baru harus mengandung angka.");
        isValid = false;
      } else if (!passwordChecks.symbol) {
        setPasswordError("Kata sandi baru harus mengandung simbol.");
        isValid = false;
      } else if (!passwordChecks.noSpaces) {
        setPasswordError("Kata sandi baru tidak boleh mengandung spasi.");
        isValid = false;
      } else if (!passwordChecks.onlyAllowed) {
        setPasswordError("Kata sandi baru mengandung simbol yang tidak diizinkan.");
        isValid = false;
      } else if (newPassword !== confirmPassword) {
        setPasswordError("Konfirmasi kata sandi baru tidak cocok.");
        isValid = false;
      }
    }

    return isValid;
  };

  const handleRelogin = () => {
    setIsRedirecting(true);
    logout();
    setTimeout(() => {
      window.location.assign("/login");
    }, 500);
  };

  // --- SUBMIT HANDLER ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      addNotification("Harap perbaiki error pada formulir.", "error");
      return;
    }

    setIsLoading(true);

    try {
      let isPasswordUpdated = false;
      let isProfileUpdated = false;
      let updatedUser = currentUser;

      // 1. Ganti Password
      if (newPassword && currentPassword) {
        await usersApi.changePassword(currentUser.id, {
          currentPassword,
          newPassword,
        });
        isPasswordUpdated = true;
      }

      // 2. Ganti Profil
      if (name !== currentUser.name || email !== currentUser.email) {
        const payload = { name, email };
        updatedUser = await usersApi.update(currentUser.id, payload);
        isProfileUpdated = true;
      }

      // --- LOGIC SUKSES ---
      if (isPasswordUpdated) {
        setIsLoading(false);
        setShowReloginModal(true);
        return;
      }

      if (isProfileUpdated) {
        updateCurrentUser(updatedUser);
        addNotification("Profil berhasil disimpan.", "success");
      } else {
        addNotification("Tidak ada perubahan yang disimpan.", "info");
      }

      // Reset password fields
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordValidation({
        currentPasswordValid: null,
        currentPasswordVerifying: false,
        currentPasswordError: "",
        confirmPasswordMatch: null,
        newPasswordSameAsCurrent: false,
      });
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      let msg = "Terjadi kesalahan sistem.";
      if (err.response?.data?.message) {
        msg = err.response.data.message;
      } else if (err.message) {
        msg = err.message;
      }
      addNotification(msg, "error");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    // State
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

    // Errors
    nameError,
    emailError,
    passwordError,

    // Password validation
    passwordValidation,
    passwordChecks,
    passwordStrength,
    allowedSymbols,

    // Computed
    canSubmit,

    // Actions
    handleSubmit,
    handleRelogin,
  };
};
