import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { usePortfolio } from '../context/PortfolioContext';
import { auth } from '../firebase/config';
import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  sendPasswordResetEmail
} from 'firebase/auth';
import { 
  ShieldCheck, 
  Lock, 
  Plus, 
  Trash2, 
  Edit3, 
  FolderPlus, 
  Layers, 
  Sparkles, 
  Save, 
  X, 
  Eye, 
  EyeOff,
  CheckCircle2, 
  AlertCircle,
  FolderTree,
  Phone,
  MessageCircle,
  Home,
  ImagePlus,
  UploadCloud,
  Check,
  Star,
  Loader2,
  Settings,
  Mail,
  KeyRound,
  LogOut
} from 'lucide-react';

// Helper: Compress image to optimized JPEG Data URL via HTML5 Canvas (Fail-safe for Mobile & Large Photos)
const compressImage = (file, maxWidth = 800, quality = 0.65) => {
  return new Promise((resolve) => {
    if (typeof file === 'string') return resolve(file);

    const timeout = setTimeout(() => {
      console.warn("Image compression timeout fallback");
      resolve("");
    }, 5000);

    try {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          clearTimeout(timeout);
          try {
            const elem = document.createElement('canvas');
            let width = img.width || 800;
            let height = img.height || 600;

            if (width > maxWidth) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            }

            elem.width = width;
            elem.height = height;
            const ctx = elem.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);

            const dataUrl = elem.toDataURL('image/jpeg', quality);
            resolve(dataUrl);
          } catch (e) {
            console.warn("Canvas export fallback:", e);
            resolve(event.target?.result || "");
          }
        };
        img.onerror = () => {
          clearTimeout(timeout);
          resolve(event.target?.result || "");
        };
        img.src = event.target?.result;
      };
      reader.onerror = () => {
        clearTimeout(timeout);
        resolve("");
      };
      reader.readAsDataURL(file);
    } catch (e) {
      clearTimeout(timeout);
      resolve("");
    }
  });
};

export default function AdminPage() {
  const { 
    folders, 
    projects, 
    craftsmanInfo, 
    saveProject, 
    deleteProject, 
    saveFolder, 
    deleteFolder 
  } = usePortfolio();

  // ── Authentication State (Firebase Auth) ────────────────
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [emailInput, setEmailInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  // Password Reset State
  const [isResetMode, setIsResetMode] = useState(false);
  const [resetSuccess, setResetSuccess] = useState("");

  // Tabs: 'projects' | 'folders'
  const [activeTab, setActiveTab] = useState("projects");

  // Project Modal State
  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [isProcessingImages, setIsProcessingImages] = useState(false);
  const [isSavingProject, setIsSavingProject] = useState(false);
  const [projectFormError, setProjectFormError] = useState("");
  const [projectForm, setProjectForm] = useState({
    title: "",
    code: "",
    desc: "",
    folderId: "",
    subcategoryId: "",
    paintType: "دوكو فرن مط",
    woodType: "خشب زان أحمر",
    color: "",
    duration: "10 أيام",
    isFeatured: true,
    images: [] // Array of image data URLs or URLs
  });

  // Folder Modal State
  const [folderModalOpen, setFolderModalOpen] = useState(false);
  const [editingFolder, setEditingFolder] = useState(null);
  const [isProcessingFolderImage, setIsProcessingFolderImage] = useState(false);
  const [isSavingFolder, setIsSavingFolder] = useState(false);
  const [folderFormError, setFolderFormError] = useState("");
  const [folderForm, setFolderForm] = useState({
    id: "",
    name: "",
    desc: "",
    image: "",
    subcategoriesText: "" // newline separated subcategory names
  });

  // Action notification toast
  const [actionStatus, setActionStatus] = useState("");

  // Firebase Auth State Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setIsAuthChecking(false);
    });
    return () => unsubscribe();
  }, []);

  // Helper for translating Firebase Auth errors to clear Arabic
  const formatAuthError = (errCode) => {
    switch (errCode) {
      case 'auth/invalid-email':
        return 'صيغة البريد الإلكتروني غير صحيحة.';
      case 'auth/user-disabled':
        return 'تم تعطيل هذا الحساب من قبل المسؤول.';
      case 'auth/user-not-found':
        return 'لا يوجد حساب مسجل بهذا البريد الإلكتروني.';
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        return 'البريد الإلكتروني أو كلمة المرور غير صحيحة.';
      case 'auth/too-many-requests':
        return 'تم حظر الدخول مؤقتاً بسبب كثرة المحاولات الخاطئة. حاول لاحقاً.';
      case 'auth/network-request-failed':
        return 'تعذر الاتصال بالشبكة. يرجى التحقق من اتصال الإنترنت.';
      case 'auth/missing-password':
        return 'يرجى إدخال كلمة المرور.';
      default:
        return 'حدث خطأ أثناء تسجيل الدخول: ' + (errCode || 'حاول مجدداً');
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthError("");
    setResetSuccess("");

    if (!emailInput.trim() || !passwordInput) {
      setAuthError("يرجى كتابة البريد الإلكتروني وكلمة المرور.");
      return;
    }

    setAuthLoading(true);
    try {
      await signInWithEmailAndPassword(auth, emailInput.trim(), passwordInput);
      setAuthError("");
    } catch (err) {
      console.error("Firebase Login Error:", err);
      setAuthError(formatAuthError(err.code));
    } finally {
      setAuthLoading(false);
    }
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setAuthError("");
    setResetSuccess("");

    if (!emailInput.trim()) {
      setAuthError("يرجى كتابة بريدك الإلكتروني لإرسال رابط استعادة كلمة المرور.");
      return;
    }

    setAuthLoading(true);
    try {
      await sendPasswordResetEmail(auth, emailInput.trim());
      setResetSuccess("تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني بنجاح.");
    } catch (err) {
      console.error("Firebase Reset Error:", err);
      setAuthError(formatAuthError(err.code));
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error("Firebase SignOut Error:", err);
    }
  };

  // ── Project Modal Handlers ───────────────────────────────
  const openAddProject = () => {
    if (folders.length === 0) {
      alert("يرجى إنشاء قسم أولاً من تبويب 'إدارة الأقسام' قبل إضافة أعمال جديدة.");
      setActiveTab("folders");
      return;
    }
    const defaultFolder = folders[0]?.id || "";
    const defaultSub = folders[0]?.subcategories?.[0]?.id || "";
    setEditingProject(null);
    setProjectFormError("");
    setProjectForm({
      title: "",
      code: `WOOD-${Math.floor(100 + Math.random() * 900)}`,
      desc: "",
      folderId: defaultFolder,
      subcategoryId: defaultSub,
      paintType: "دوكو فرن إيطالي",
      woodType: "خشب زان أحمر",
      color: "أوف وايت ناعم",
      duration: "10 أيام",
      isFeatured: true,
      images: []
    });
    setProjectModalOpen(true);
  };

  const openEditProject = (proj) => {
    setEditingProject(proj);
    setProjectFormError("");
    setProjectForm({
      title: proj.title || "",
      code: proj.code || "",
      desc: proj.desc || "",
      folderId: proj.folderId || folders[0]?.id || "",
      subcategoryId: proj.subcategoryId || "",
      paintType: proj.paintType || "",
      woodType: proj.woodType || "",
      color: proj.color || "",
      duration: proj.duration || "",
      isFeatured: !!proj.isFeatured,
      images: proj.images || []
    });
    setProjectModalOpen(true);
  };

  // Handle image files selection from device for Project
  const handleProjectImageFiles = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setIsProcessingImages(true);
    setProjectFormError("");
    try {
      const compressedList = await Promise.all(
        files.map(file => compressImage(file, 850, 0.68))
      );
      setProjectForm(prev => ({
        ...prev,
        images: [...prev.images, ...compressedList]
      }));
    } catch (err) {
      console.error("Error compressing images:", err);
      setProjectFormError("حدث خطأ أثناء معالجة الصور من الجهاز.");
    } finally {
      setIsProcessingImages(false);
      e.target.value = ""; // reset input
    }
  };

  const removeProjectImage = (indexToRemove) => {
    setProjectForm(prev => ({
      ...prev,
      images: prev.images.filter((_, idx) => idx !== indexToRemove)
    }));
  };

  const makeCoverProjectImage = (indexToCover) => {
    setProjectForm(prev => {
      const selected = prev.images[indexToCover];
      const others = prev.images.filter((_, idx) => idx !== indexToCover);
      return {
        ...prev,
        images: [selected, ...others]
      };
    });
  };

  const handleSaveProject = async (e) => {
    e.preventDefault();
    setProjectFormError("");

    if (!projectForm.title.trim()) {
      setProjectFormError("يرجى كتابة اسم العمل / الموديل");
      return;
    }

    let finalImages = projectForm.images;
    // If user didn't upload any picture, assign a luxury default sample image
    if (finalImages.length === 0) {
      finalImages = ["https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=1200&q=80"];
    }

    const projectData = {
      title: projectForm.title.trim(),
      code: projectForm.code.trim().toUpperCase() || `WOOD-${Math.floor(100 + Math.random() * 900)}`,
      desc: projectForm.desc.trim(),
      folderId: projectForm.folderId || folders[0]?.id || "bedrooms",
      subcategoryId: projectForm.subcategoryId || "",
      paintType: projectForm.paintType.trim() || "دوكو فرن مط",
      woodType: projectForm.woodType.trim() || "خشب زان أحمر",
      color: projectForm.color.trim() || "",
      duration: projectForm.duration.trim() || "",
      isFeatured: !!projectForm.isFeatured,
      images: finalImages
    };

    setIsSavingProject(true);
    try {
      await saveProject(projectData, editingProject?.id);
      setActionStatus("✅ تم حفظ العمل بنجاح ونشره في المعرض!");
      setTimeout(() => setActionStatus(""), 4000);
      setProjectModalOpen(false);
    } catch (err) {
      console.error("Error in handleSaveProject:", err);
      setProjectFormError("حدث خطأ أثناء الحفظ: " + (err.message || "حاول مجدداً"));
    } finally {
      setIsSavingProject(false);
    }
  };

  // ── Folder Modal Handlers ────────────────────────────────
  const openAddFolder = () => {
    setEditingFolder(null);
    setFolderFormError("");
    setFolderForm({
      id: "",
      name: "",
      desc: "",
      image: "",
      subcategoriesText: "دوكو فرن مط\nإستر وبوليستر وتعتيق\nقشرة أرو وزان\nتجديد ودهان قديم"
    });
    setFolderModalOpen(true);
  };

  const openEditFolder = (folder) => {
    setEditingFolder(folder);
    setFolderFormError("");
    setFolderForm({
      id: folder.id,
      name: folder.name || "",
      desc: folder.desc || "",
      image: folder.image || "",
      subcategoriesText: (folder.subcategories || []).map(s => s.name).join("\n")
    });
    setFolderModalOpen(true);
  };

  // Handle single image file selection from device for Folder
  const handleFolderImageFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessingFolderImage(true);
    setFolderFormError("");
    try {
      const dataUrl = await compressImage(file, 850, 0.68);
      setFolderForm(prev => ({ ...prev, image: dataUrl }));
    } catch (err) {
      console.error("Error compressing folder image:", err);
      setFolderFormError("حدث خطأ أثناء معالجة صورة القسم.");
    } finally {
      setIsProcessingFolderImage(false);
      e.target.value = "";
    }
  };

  const handleSaveFolder = async (e) => {
    e.preventDefault();
    setFolderFormError("");

    if (!folderForm.name.trim()) {
      setFolderFormError("يرجى كتابة اسم القسم");
      return;
    }

    const subcategories = folderForm.subcategoriesText
      .split("\n")
      .map(name => name.trim())
      .filter(name => name.length > 0)
      .map((name, idx) => ({
        id: `${(folderForm.id || folderForm.name).toLowerCase().replace(/\s+/g, '_')}_sub_${idx + 1}`,
        name
      }));

    const folderData = {
      name: folderForm.name.trim(),
      desc: "",
      image: folderForm.image || "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=800&q=80",
      icon: "Layers",
      subcategories
    };

    setIsSavingFolder(true);
    try {
      await saveFolder(folderData, editingFolder?.id);
      setActionStatus("✅ تم حفظ القسم بنجاح!");
      setTimeout(() => setActionStatus(""), 4000);
      setFolderModalOpen(false);
    } catch (err) {
      console.error("Error in handleSaveFolder:", err);
      setFolderFormError("حدث خطأ أثناء حفظ القسم: " + (err.message || "حاول مجدداً"));
    } finally {
      setIsSavingFolder(false);
    }
  };

  // ── FIREBASE AUTH CHECKING SCREEN ───────────────────────
  if (isAuthChecking) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[#0F0D0B] text-wood-cream">
        <Loader2 className="w-10 h-10 text-wood-amber animate-spin mb-3" />
        <p className="text-xs font-bold text-wood-muted">جاري التحقق من هوية المسؤول...</p>
      </div>
    );
  }

  // ── FIREBASE LOGIN SCREEN ────────────────────────────────
  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[#0F0D0B]">
        <div className="w-full max-w-md glass-card p-8 rounded-3xl border border-wood-700/80 shadow-2xl bg-wood-850/95">
          
          {/* Logo / Header */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-wood-amber/20 border border-wood-amber/40 flex items-center justify-center text-wood-amber mx-auto mb-4 shadow-inner">
              <ShieldCheck className="w-8 h-8 stroke-[2.5]" />
            </div>
            <h2 className="text-xl font-black font-alexandria text-wood-cream">لوحة إدارة المعرض</h2>
            <p className="text-xs font-bold text-wood-muted mt-1">
              {isResetMode ? "استعادة كلمة المرور عبر البريد الإلكتروني" : "تسجيل الدخول للمسؤول عبر Firebase"}
            </p>
          </div>

          {/* Success Banner */}
          {resetSuccess && (
            <div className="mb-5 p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-start gap-3 text-emerald-300 text-xs font-bold">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <span>{resetSuccess}</span>
            </div>
          )}

          {/* Error Banner */}
          {authError && (
            <div className="mb-5 p-4 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-start gap-3 text-rose-300 text-xs font-bold">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <span>{authError}</span>
            </div>
          )}

          {!isResetMode ? (
            /* Login Form */
            <form onSubmit={handleLogin} className="space-y-4">
              {/* Email Input */}
              <div>
                <label className="block text-xs font-black text-wood-cream mb-1.5 text-right">
                  البريد الإلكتروني
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="admin@example.com"
                    dir="ltr"
                    className="w-full bg-wood-900 border border-wood-700 rounded-xl px-4 py-3 pl-11 text-wood-cream placeholder:text-wood-muted/40 text-sm font-semibold outline-none focus:border-wood-amber transition-colors text-left"
                    required
                  />
                  <Mail className="w-5 h-5 text-wood-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-black text-wood-cream">
                    كلمة المرور
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setIsResetMode(true);
                      setAuthError("");
                      setResetSuccess("");
                    }}
                    className="text-[11px] font-black text-wood-amber hover:underline"
                  >
                    نسيت كلمة المرور؟
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="••••••••"
                    dir="ltr"
                    className="w-full bg-wood-900 border border-wood-700 rounded-xl px-4 py-3 pr-11 text-wood-cream placeholder:text-wood-muted/40 text-sm font-semibold outline-none focus:border-wood-amber transition-colors text-left"
                    required
                  />
                  <KeyRound className="w-5 h-5 text-wood-muted absolute right-3.5 top-1/2 -translate-y-1/2" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-wood-muted hover:text-wood-cream transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={authLoading}
                className="w-full py-3.5 rounded-xl bg-wood-amber hover:bg-wood-gold active:bg-wood-amber text-white font-black text-sm shadow-lg shadow-wood-amber/30 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
              >
                {authLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>جاري التحقق...</span>
                  </>
                ) : (
                  <span>تسجيل الدخول</span>
                )}
              </button>
            </form>
          ) : (
            /* Reset Password Form */
            <form onSubmit={handlePasswordReset} className="space-y-4">
              <div>
                <label className="block text-xs font-black text-wood-cream mb-1.5 text-right">
                  أدخل بريدك الإلكتروني المسجل
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="admin@example.com"
                    dir="ltr"
                    className="w-full bg-wood-900 border border-wood-700 rounded-xl px-4 py-3 pl-11 text-wood-cream placeholder:text-wood-muted/40 text-sm font-semibold outline-none focus:border-wood-amber transition-colors text-left"
                    required
                  />
                  <Mail className="w-5 h-5 text-wood-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <button
                type="submit"
                disabled={authLoading}
                className="w-full py-3.5 rounded-xl bg-wood-amber hover:bg-wood-gold text-white font-black text-sm shadow-lg shadow-wood-amber/30 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {authLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>جاري الإرسال...</span>
                  </>
                ) : (
                  <span>إرسال رابط إعادة التعيين</span>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsResetMode(false);
                  setAuthError("");
                  setResetSuccess("");
                }}
                className="w-full text-xs font-black text-wood-muted hover:text-wood-cream text-center pt-2 transition-colors"
              >
                ← العودة لنموذج تسجيل الدخول
              </button>
            </form>
          )}

          <div className="mt-6 pt-5 border-t border-wood-700/60 text-center">
            <Link to="/" className="text-xs font-black text-wood-muted hover:text-wood-cream transition-colors">
              ← العودة للمعرض الرئيسي
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── AUTHENTICATED DASHBOARD ──────────────────────────────
  return (
    <div className="min-h-screen pb-24 text-wood-cream bg-[#0F0D0B]">
      
      {/* Admin Topbar */}
      <header className="sticky top-0 z-40 bg-[#0F0D0B]/95 backdrop-blur-xl border-b border-wood-700/60 px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-wood-amber flex items-center justify-center text-white font-black text-lg shadow-md shadow-wood-amber/30">
              ع
            </div>
            <div>
              <h1 className="font-alexandria font-black text-sm sm:text-base text-wood-cream">لوحة تحكم المعرض</h1>
              <span className="text-[11px] font-bold text-emerald-400 block sm:inline">
                ● {currentUser.email || "مسؤول المعرض"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/"
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-wood-850 hover:bg-wood-800 text-wood-cream text-xs font-black border border-wood-700 transition-all"
            >
              <Home className="w-3.5 h-3.5 text-wood-amber stroke-[2.5]" />
              <span>الموقع</span>
            </Link>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 text-xs font-black border border-rose-500/30 transition-all"
              title="تسجيل الخروج"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>خروج</span>
            </button>
          </div>
        </div>
      </header>

      {/* Tabs Bar */}
      <div className="max-w-6xl mx-auto px-4 pt-6">
        <div className="flex items-center gap-2 border-b border-wood-700/60 pb-3 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab("projects")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-black whitespace-nowrap transition-all ${
              activeTab === "projects" ? "bg-wood-amber text-white shadow-lg shadow-wood-amber/20" : "bg-wood-850 text-wood-muted hover:text-wood-cream border border-wood-700/60"
            }`}
          >
            <Sparkles className="w-4 h-4 stroke-[2.5]" />
            <span>الأعمال والمشاريع ({projects.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("folders")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-black whitespace-nowrap transition-all ${
              activeTab === "folders" ? "bg-wood-amber text-white shadow-lg shadow-wood-amber/20" : "bg-wood-850 text-wood-muted hover:text-wood-cream border border-wood-700/60"
            }`}
          >
            <FolderTree className="w-4 h-4 stroke-[2.5]" />
            <span>أقسام المعرض ({folders.length})</span>
          </button>
        </div>

        {actionStatus && (
          <div className="mt-4 p-3 rounded-xl bg-wood-gold/20 border border-wood-gold/40 text-wood-gold text-xs font-black text-center">
            {actionStatus}
          </div>
        )}
      </div>

      {/* ── TAB 1: PROJECTS MANAGER ─────────────────────────────────── */}
      {activeTab === "projects" && (
        <main className="max-w-6xl mx-auto px-4 pt-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-alexandria font-black text-base sm:text-lg text-wood-cream">قائمة الأعمال والتشطيبات المنفذة</h2>
            <button
              onClick={openAddProject}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-wood-amber hover:bg-wood-gold text-white font-black text-xs shadow-lg shadow-wood-amber/20 active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>إضافة عمل جديد من جهازك</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {projects.map((proj) => (
              <div key={proj.id} className="glass-card rounded-2xl overflow-hidden border border-wood-700/70 p-4 flex flex-col justify-between bg-wood-850/90 shadow-lg">
                <div>
                  <div className="relative aspect-[16/10] rounded-xl overflow-hidden mb-3 bg-wood-900 border border-wood-700/60">
                    <img 
                      src={proj.images?.[0] || "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=800&q=80"} 
                      alt={proj.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 right-2 px-2.5 py-1 rounded-lg bg-wood-amber text-white font-black text-xs shadow-md">
                      #{proj.code || proj.id}
                    </div>
                    {proj.images?.length > 1 && (
                      <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-black/80 text-[10px] text-white backdrop-blur-sm font-black">
                        {proj.images.length} صور
                      </div>
                    )}
                  </div>

                  <h3 className="font-alexandria font-black text-sm sm:text-base text-wood-cream line-clamp-1 leading-snug">{proj.title}</h3>
                  
                  <div className="flex flex-wrap gap-1.5 mt-2.5">
                    {proj.paintType && (
                      <span className="text-[11px] bg-wood-800 text-wood-amber px-2.5 py-1 rounded-lg font-black border border-wood-700/60">
                        ✨ {proj.paintType}
                      </span>
                    )}
                    {proj.woodType && (
                      <span className="text-[11px] bg-wood-800 text-wood-muted px-2.5 py-1 rounded-lg font-bold border border-wood-700/60">
                        🪵 {proj.woodType}
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-wood-700/50 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEditProject(proj)}
                      className="px-3 py-1.5 rounded-xl bg-wood-800 hover:bg-wood-700 text-wood-cream text-xs font-black flex items-center gap-1.5 border border-wood-700 transition-all"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-wood-amber stroke-[2.5]" />
                      <span>تعديل</span>
                    </button>
                    
                    <Link
                      to={`/project/${proj.id}`}
                      target="_blank"
                      className="p-2 rounded-xl bg-wood-800 hover:bg-wood-700 text-wood-muted hover:text-wood-cream text-xs border border-wood-700 transition-all"
                      title="معاينة العمل"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </Link>
                  </div>

                  <button
                    onClick={() => {
                      if (confirm(`هل أنت متأكد من حذف العمل "${proj.title}"؟`)) {
                        deleteProject(proj.id);
                      }
                    }}
                    className="p-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 text-xs border border-rose-500/30 transition-all"
                    title="حذف"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

              </div>
            ))}
          </div>
        </main>
      )}

      {/* ── TAB 3: FOLDERS / SECTIONS MANAGER ───────────────────────── */}
      {activeTab === "folders" && (
        <main className="max-w-6xl mx-auto px-4 pt-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-alexandria font-black text-base sm:text-lg text-wood-cream">إدارة أقسام المعرض</h2>
            <button
              onClick={openAddFolder}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-wood-amber hover:bg-wood-gold text-white font-black text-xs shadow-lg shadow-wood-amber/20 active:scale-95 transition-all"
            >
              <FolderPlus className="w-4 h-4 stroke-[3]" />
              <span>إضافة قسم جديد</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {folders.map((fld) => (
              <div key={fld.id} className="glass-card rounded-2xl border border-wood-700/70 p-5 space-y-4 bg-wood-850/90 shadow-lg">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img 
                      src={fld.image || "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=800&q=80"} 
                      alt={fld.name}
                      className="w-16 h-16 rounded-2xl object-cover border border-wood-700 shrink-0 shadow-md"
                    />
                    <div>
                      <h3 className="font-alexandria font-black text-base text-wood-cream">{fld.name}</h3>
                      <span className="text-[11px] font-bold text-wood-amber mt-0.5 block">
                        {fld.subcategories?.length || 0} أقسام فرعية
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEditFolder(fld)}
                      className="p-2.5 rounded-xl bg-wood-800 hover:bg-wood-700 text-wood-amber border border-wood-700 transition-all"
                      title="تعديل القسم"
                    >
                      <Edit3 className="w-4 h-4 stroke-[2.5]" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`هل أنت متأكد من حذف قسم "${fld.name}"؟`)) {
                          deleteFolder(fld.id);
                        }
                      }}
                      className="p-2.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 border border-rose-500/30 transition-all"
                      title="حذف"
                    >
                      <Trash2 className="w-4 h-4 stroke-[2.5]" />
                    </button>
                  </div>
                </div>

                {/* Subcategories list */}
                <div className="pt-3 border-t border-wood-700/50">
                  <span className="text-[11px] text-wood-muted font-black block mb-2">الأقسام الفرعية التابعة:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {fld.subcategories?.map((sub) => (
                      <span key={sub.id} className="px-3 py-1 rounded-xl bg-wood-900 text-xs font-black text-wood-cream border border-wood-700/70">
                        {sub.name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </main>
      )}

      {/* ── PROJECT ADD/EDIT MODAL ───────────────────────────────────── */}
      {projectModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-xl glass-wood rounded-3xl border border-wood-700 p-6 my-8 shadow-2xl bg-wood-900">
            <div className="flex items-center justify-between pb-4 border-b border-wood-700 mb-5">
              <h3 className="font-alexandria font-black text-base text-wood-cream">
                {editingProject ? "تعديل بيانات العمل" : "إضافة عمل جديد للمعرض"}
              </h3>
              <button onClick={() => setProjectModalOpen(false)} className="text-wood-muted hover:text-white p-1 rounded-lg">
                <X className="w-5 h-5 stroke-[2.5]" />
              </button>
            </div>

            <form onSubmit={handleSaveProject} className="space-y-4 text-xs">
              
              {projectFormError && (
                <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 font-black text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{projectFormError}</span>
                </div>
              )}
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-wood-muted font-black mb-1">اسم العمل / الموديل *</label>
                  <input
                    type="text"
                    value={projectForm.title}
                    onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })}
                    placeholder="مثال: غرفة نوم ماستر دوكو فرن مط"
                    className="w-full bg-wood-850 border border-wood-700 rounded-xl px-3.5 py-2.5 text-wood-cream font-bold outline-none focus:border-wood-amber"
                  />
                </div>

                <div>
                  <label className="block text-wood-muted font-black mb-1">كود العمل (تلقائي)</label>
                  <input
                    type="text"
                    value={projectForm.code}
                    onChange={(e) => setProjectForm({ ...projectForm, code: e.target.value })}
                    placeholder="BED-101"
                    className="w-full bg-wood-850 border border-wood-700 rounded-xl px-3.5 py-2.5 text-wood-gold font-black outline-none focus:border-wood-amber text-center"
                  />
                </div>
              </div>

              {/* Folder and Subcategory selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-wood-muted font-black mb-1">القسم الرئيسي *</label>
                  <select
                    value={projectForm.folderId}
                    onChange={(e) => {
                      const fId = e.target.value;
                      const f = folders.find(x => x.id === fId);
                      setProjectForm({ 
                        ...projectForm, 
                        folderId: fId,
                        subcategoryId: f?.subcategories?.[0]?.id || ""
                      });
                    }}
                    className="w-full bg-wood-850 border border-wood-700 rounded-xl px-3.5 py-2.5 text-wood-cream font-bold outline-none focus:border-wood-amber"
                  >
                    {folders.map(f => (
                      <option key={f.id} value={f.id}>{f.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-wood-muted font-black mb-1">القسم الفرعي / نوع التشطيب</label>
                  <select
                    value={projectForm.subcategoryId}
                    onChange={(e) => setProjectForm({ ...projectForm, subcategoryId: e.target.value })}
                    className="w-full bg-wood-850 border border-wood-700 rounded-xl px-3.5 py-2.5 text-wood-cream font-bold outline-none focus:border-wood-amber"
                  >
                    <option value="">بدون قسم فرعي محدد</option>
                    {folders.find(f => f.id === projectForm.folderId)?.subcategories?.map(sub => (
                      <option key={sub.id} value={sub.id}>{sub.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Finish Specs */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-wood-muted font-black mb-1">نوع الدهان والتشطيب</label>
                  <input
                    type="text"
                    value={projectForm.paintType}
                    onChange={(e) => setProjectForm({ ...projectForm, paintType: e.target.value })}
                    placeholder="دوكو فرن مط / إستر وبوليستر"
                    className="w-full bg-wood-850 border border-wood-700 rounded-xl px-3 py-2 text-wood-cream font-bold outline-none focus:border-wood-amber"
                  />
                </div>

                <div>
                  <label className="block text-wood-muted font-black mb-1">نوع الخشب (اختياري)</label>
                  <input
                    type="text"
                    value={projectForm.woodType}
                    onChange={(e) => setProjectForm({ ...projectForm, woodType: e.target.value })}
                    placeholder="خشب زان أحمر / قشرة أرو"
                    className="w-full bg-wood-850 border border-wood-700 rounded-xl px-3 py-2 text-wood-cream font-bold outline-none focus:border-wood-amber"
                  />
                </div>
              </div>

              {/* ── DEVICE IMAGE UPLOAD SECTION ──────────────────────── */}
              <div className="pt-2 border-t border-wood-700/60">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-wood-cream font-black text-xs flex items-center gap-1.5">
                    <ImagePlus className="w-4 h-4 text-wood-amber stroke-[2.5]" />
                    <span>صور العمل من الهاتف أو الكمبيوتر ({projectForm.images.length})</span>
                  </label>
                  <span className="text-[10px] font-bold text-wood-muted">اضغط على أي صورة لجعلها الغلاف الرئيسي</span>
                </div>

                {/* Upload Button Box */}
                <label className="cursor-pointer flex flex-col items-center justify-center p-5 border-2 border-dashed border-wood-amber/40 hover:border-wood-amber rounded-2xl bg-wood-850/60 hover:bg-wood-800/60 transition-all text-center group">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleProjectImageFiles}
                    disabled={isProcessingImages}
                    className="hidden"
                  />
                  {isProcessingImages ? (
                    <div className="flex items-center gap-2 text-wood-amber font-black py-2">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>جاري معالجة وضغط الصور...</span>
                    </div>
                  ) : (
                    <>
                      <div className="w-10 h-10 rounded-full bg-wood-amber/20 flex items-center justify-center text-wood-amber mb-2 group-hover:scale-110 transition-transform">
                        <UploadCloud className="w-5 h-5 stroke-[2.5]" />
                      </div>
                      <strong className="text-wood-cream block text-xs font-black">
                        اضغط هنا لاختيار صور من المعرض أو التقاط من الكاميرا
                      </strong>
                      <span className="text-[11px] text-wood-muted mt-0.5 font-bold">
                        يمكنك اختيار عدة صور دفعة واحدة
                      </span>
                    </>
                  )}
                </label>

                {/* Preview Grid of Selected Images */}
                {projectForm.images.length > 0 && (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5 mt-3 max-h-48 overflow-y-auto p-1.5 bg-wood-900/80 rounded-xl border border-wood-700/50">
                    {projectForm.images.map((imgUrl, idx) => (
                      <div key={idx} className="relative aspect-square rounded-xl overflow-hidden group border border-wood-700 bg-wood-850">
                        <img src={imgUrl} alt={`preview ${idx + 1}`} className="w-full h-full object-cover" />
                        
                        {/* Primary Cover Badge */}
                        {idx === 0 ? (
                          <div className="absolute top-1 right-1 bg-wood-amber text-white px-1.5 py-0.5 rounded text-[9px] font-black shadow-md flex items-center gap-0.5">
                            <Star className="w-2.5 h-2.5 fill-white" />
                            <span>الغلاف</span>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => makeCoverProjectImage(idx)}
                            className="absolute top-1 right-1 bg-black/80 hover:bg-wood-amber text-white px-1.5 py-0.5 rounded text-[9px] font-black opacity-0 group-hover:opacity-100 transition-opacity"
                            title="تعيين كصورة غلاف رئيسية"
                          >
                            تعيين كغلاف
                          </button>
                        )}

                        {/* Remove Button */}
                        <button
                          type="button"
                          onClick={() => removeProjectImage(idx)}
                          className="absolute bottom-1 left-1 p-1 rounded-full bg-rose-600/90 text-white hover:bg-rose-500 shadow-md transition-all"
                          title="حذف الصورة"
                        >
                          <X className="w-3 h-3 stroke-[2.5]" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Featured toggle */}
              <label className="flex items-center gap-2 cursor-pointer pt-2">
                <input
                  type="checkbox"
                  checked={projectForm.isFeatured}
                  onChange={(e) => setProjectForm({ ...projectForm, isFeatured: e.target.checked })}
                  className="w-4 h-4 rounded text-wood-amber focus:ring-0 bg-wood-850 border-wood-700 accent-wood-amber"
                />
                <span className="text-wood-cream font-black text-xs">عرض كعمل مميز في الصفحة الرئيسية</span>
              </label>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-wood-700">
                <button
                  type="button"
                  onClick={() => setProjectModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-wood-850 hover:bg-wood-800 text-wood-muted font-black"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSavingProject || isProcessingImages}
                  className="px-6 py-2.5 rounded-xl bg-wood-amber hover:bg-wood-gold text-white font-black shadow-lg shadow-wood-amber/20 disabled:opacity-50 flex items-center gap-2 transition-all active:scale-95"
                >
                  {isSavingProject ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>جاري الحفظ...</span>
                    </>
                  ) : (
                    <span>حفظ العمل</span>
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ── FOLDER / SECTION ADD/EDIT MODAL ──────────────────────────── */}
      {folderModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-lg glass-wood rounded-3xl border border-wood-700 p-6 shadow-2xl bg-wood-900">
            <div className="flex items-center justify-between pb-4 border-b border-wood-700 mb-5">
              <h3 className="font-alexandria font-black text-base text-wood-cream">
                {editingFolder ? "تعديل القسم" : "إضافة قسم جديد"}
              </h3>
              <button onClick={() => setFolderModalOpen(false)} className="text-wood-muted hover:text-white p-1 rounded-lg">
                <X className="w-5 h-5 stroke-[2.5]" />
              </button>
            </div>

            <form onSubmit={handleSaveFolder} className="space-y-4 text-xs">
              {folderFormError && (
                <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 font-black text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{folderFormError}</span>
                </div>
              )}

              <div>
                <label className="block text-wood-muted font-black mb-1">اسم القسم *</label>
                <input
                  type="text"
                  value={folderForm.name}
                  onChange={(e) => setFolderForm({ ...folderForm, name: e.target.value })}
                  placeholder="مثال: غرف نوم ماستر"
                  className="w-full bg-wood-850 border border-wood-700 rounded-xl px-3.5 py-2.5 text-wood-cream font-bold outline-none focus:border-wood-amber"
                />
              </div>

              {/* Folder Cover Image from device */}
              <div>
                <label className="block text-wood-muted font-black mb-1">صورة غلاف القسم</label>
                <div className="flex items-center gap-3">
                  {folderForm.image && (
                    <img src={folderForm.image} alt="preview" className="w-14 h-14 rounded-2xl object-cover border border-wood-700 shrink-0 shadow-md" />
                  )}
                  <label className="flex-1 cursor-pointer flex items-center justify-center gap-2 p-3.5 rounded-xl border border-dashed border-wood-amber/50 bg-wood-850/60 hover:bg-wood-800 text-wood-amber font-black text-xs transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFolderImageFile}
                      disabled={isProcessingFolderImage}
                      className="hidden"
                    />
                    {isProcessingFolderImage ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <UploadCloud className="w-4 h-4 stroke-[2.5]" />
                        <span>اختر صورة غلاف من جهازك</span>
                      </>
                    )}
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-wood-muted font-black mb-1">
                  الأقسام والتشطيبات التابعة (اكتب كل قسم فرعي في سطر جديد)
                </label>
                <textarea
                  rows={4}
                  value={folderForm.subcategoriesText}
                  onChange={(e) => setFolderForm({ ...folderForm, subcategoriesText: e.target.value })}
                  placeholder="دوكو فرن مط&#10;إستر وبوليستر وتعتيق&#10;قشرة أرو وزان"
                  className="w-full bg-wood-850 border border-wood-700 rounded-xl p-3 text-wood-cream font-bold outline-none focus:border-wood-amber leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-wood-700">
                <button
                  type="button"
                  onClick={() => setFolderModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-wood-850 hover:bg-wood-800 text-wood-muted font-black"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSavingFolder || isProcessingFolderImage}
                  className="px-6 py-2.5 rounded-xl bg-wood-amber hover:bg-wood-gold text-white font-black shadow-lg shadow-wood-amber/20 disabled:opacity-50 flex items-center gap-2 transition-all active:scale-95"
                >
                  {isSavingFolder ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>جاري الحفظ...</span>
                    </>
                  ) : (
                    <span>حفظ القسم</span>
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
