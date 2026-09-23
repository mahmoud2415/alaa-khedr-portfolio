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
  LogOut, 
  ArrowUp, 
  ArrowDown,
  Cloud,
  CloudUpload,
  RefreshCw,
  Database,
  ExternalLink,
  CheckCircle,
  HelpCircle
} from 'lucide-react';
import { 
  uploadToCloudinary, 
  isBase64Image, 
  getCloudinaryConfig, 
  saveCustomCloudinaryConfig 
} from '../services/cloudinary';

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
    deleteFolder,
    moveFolder 
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

  // Tabs: 'projects' | 'folders' | 'settings'
  const [activeTab, setActiveTab] = useState("projects");

  // Cloudinary Config State
  const [cloudNameInput, setCloudNameInput] = useState(() => getCloudinaryConfig().cloudName);
  const [presetInput, setPresetInput] = useState(() => getCloudinaryConfig().uploadPreset);
  const [configToast, setConfigToast] = useState("");

  // Migration State
  const [isMigrating, setIsMigrating] = useState(false);
  const [migrationStatus, setMigrationStatus] = useState("");
  const [migrationProgress, setMigrationProgress] = useState(0);

  // Upload Progress
  const [uploadStatusText, setUploadStatusText] = useState("");

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
    paintType: "",
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
    image: ""
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
    setEditingProject(null);
    setProjectFormError("");
    setProjectForm({
      title: "",
      code: `WOOD-${Math.floor(100 + Math.random() * 900)}`,
      desc: "",
      folderId: defaultFolder,
      paintType: "",
      woodType: "",
      color: "",
      duration: "",
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
      paintType: (proj.paintType || "").replace(/دوكو فرن\s*(إيطالي|مط)?/g, "").trim(),
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

    const config = getCloudinaryConfig();
    if (!config.cloudName || !config.uploadPreset) {
      setProjectFormError("يرجى إدخال Cloud Name و Upload Preset في تبويب 'إعدادات CDN' أولاً لرفع الصور إلى السحابة.");
      return;
    }

    setIsProcessingImages(true);
    setProjectFormError("");
    setUploadStatusText(`جاري تجهيز ${files.length} صورة...`);

    try {
      const uploadedUrls = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setUploadStatusText(`جاري ضغط ورفع صورة (${i + 1} من ${files.length}) إلى Cloudinary CDN...`);
        const compressedBase64 = await compressImage(file, 1400, 0.82);
        const cdnUrl = await uploadToCloudinary(compressedBase64 || file);
        uploadedUrls.push(cdnUrl);
      }

      setProjectForm(prev => ({
        ...prev,
        images: [...prev.images, ...uploadedUrls]
      }));
    } catch (err) {
      console.error("Error uploading project images:", err);
      setProjectFormError("حدث خطأ أثناء الرفع إلى Cloudinary: " + (err.message || "حاول مجدداً"));
    } finally {
      setIsProcessingImages(false);
      setUploadStatusText("");
      e.target.value = "";
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
      folderId: projectForm.folderId || folders[0]?.id || "",
      paintType: projectForm.paintType.trim().replace(/دوكو فرن\s*(إيطالي|مط)?/g, "").trim(),
      woodType: projectForm.woodType.trim(),
      color: projectForm.color.trim(),
      duration: projectForm.duration.trim(),
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
      image: ""
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
      image: folder.image || ""
    });
    setFolderModalOpen(true);
  };

  // Handle single image file selection from device for Folder
  const handleFolderImageFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const config = getCloudinaryConfig();
    if (!config.cloudName || !config.uploadPreset) {
      setFolderFormError("يرجى إدخال Cloud Name و Upload Preset في تبويب 'إعدادات CDN' أولاً لرفع الصور إلى السحابة.");
      return;
    }

    setIsProcessingFolderImage(true);
    setFolderFormError("");
    try {
      const compressedBase64 = await compressImage(file, 1000, 0.82);
      const cdnUrl = await uploadToCloudinary(compressedBase64 || file);
      setFolderForm(prev => ({ ...prev, image: cdnUrl }));
    } catch (err) {
      console.error("Error uploading folder image:", err);
      setFolderFormError("حدث خطأ أثناء رفع صورة القسم إلى Cloudinary: " + (err.message || "حاول مجدداً"));
    } finally {
      setIsProcessingFolderImage(false);
      e.target.value = "";
    }
  };

  // ── Cloudinary Settings & Base64 Migration Handlers ───────
  const handleSaveCloudinarySettings = (e) => {
    e.preventDefault();
    saveCustomCloudinaryConfig(cloudNameInput, presetInput);
    setConfigToast("تم حفظ إعدادات Cloudinary بنجاح! جاهز لرفع الصور.");
    setTimeout(() => setConfigToast(""), 4000);
  };

  const handleMigrateBase64Images = async () => {
    const config = getCloudinaryConfig();
    if (!config.cloudName || !config.uploadPreset) {
      alert("يرجى إدخال وحفظ بيانات Cloud Name و Upload Preset أولاً قبل بدء الترحيل.");
      return;
    }

    // Identify items needing migration
    const projectsWithBase64 = projects.filter(p => (p.images || []).some(isBase64Image));
    const foldersWithBase64 = folders.filter(f => isBase64Image(f.image));

    let totalImagesToMigrate = 0;
    projectsWithBase64.forEach(p => {
      totalImagesToMigrate += (p.images || []).filter(isBase64Image).length;
    });
    totalImagesToMigrate += foldersWithBase64.length;

    if (totalImagesToMigrate === 0) {
      alert("رائع! جميع الصور في المعرض مستضافة على روابط CDN سريعة ولا توجد أي صور Base64 تحتاج لترحيل. 🎉");
      return;
    }

    if (!confirm(`تم العثور على ${totalImagesToMigrate} صورة Base64 مخزنة داخل قاعدة البيانات.\n\nهل تريد بدء ترحيلها إلى Cloudinary الآن؟`)) {
      return;
    }

    setIsMigrating(true);
    let migratedCount = 0;
    setMigrationStatus(`بدء الترحيل... (0 من ${totalImagesToMigrate})`);
    setMigrationProgress(0);

    try {
      // 1. Migrate Folders
      for (const folder of foldersWithBase64) {
        if (isBase64Image(folder.image)) {
          setMigrationStatus(`جاري ترحيل صورة قسم "${folder.name}" (${migratedCount + 1}/${totalImagesToMigrate})...`);
          const newUrl = await uploadToCloudinary(folder.image);
          await saveFolder({ ...folder, image: newUrl }, folder.id);
          migratedCount++;
          setMigrationProgress(Math.round((migratedCount / totalImagesToMigrate) * 100));
        }
      }

      // 2. Migrate Projects
      for (const project of projectsWithBase64) {
        const updatedImages = [];
        for (const img of (project.images || [])) {
          if (isBase64Image(img)) {
            setMigrationStatus(`جاري ترحيل صورة لعمل "${project.title}" (${migratedCount + 1}/${totalImagesToMigrate})...`);
            const newUrl = await uploadToCloudinary(img);
            updatedImages.push(newUrl);
            migratedCount++;
            setMigrationProgress(Math.round((migratedCount / totalImagesToMigrate) * 100));
          } else {
            updatedImages.push(img);
          }
        }
        await saveProject({ ...project, images: updatedImages }, project.id);
      }

      // 3. Clear bloated old LocalStorage caches
      try {
        localStorage.removeItem('wood_projects_v2');
        localStorage.removeItem('wood_folders_v2');
      } catch(e) {}

      setMigrationStatus(`✅ تم ترحيل ${migratedCount} صورة بنجاح إلى Cloudinary وتحديث قاعدة البيانات بالكامل!`);
      setActionStatus(`🎉 تم تحويل جميع الصور إلى Cloudinary CDN بنجاح!`);
      setTimeout(() => setActionStatus(""), 6000);
    } catch (err) {
      console.error("Migration error:", err);
      setMigrationStatus(`❌ حدث خطأ أثناء الترحيل: ${err.message}`);
    } finally {
      setIsMigrating(false);
    }
  };

  const handleSaveFolder = async (e) => {
    e.preventDefault();
    setFolderFormError("");

    if (!folderForm.name.trim()) {
      setFolderFormError("يرجى كتابة اسم القسم");
      return;
    }

    const folderData = {
      name: folderForm.name.trim(),
      desc: "",
      image: folderForm.image || "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=800&q=80",
      icon: "Layers",
      subcategories: []
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

          <button
            onClick={() => setActiveTab("settings")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-black whitespace-nowrap transition-all ${
              activeTab === "settings" ? "bg-wood-amber text-white shadow-lg shadow-wood-amber/20" : "bg-wood-850 text-wood-muted hover:text-wood-cream border border-wood-700/60"
            }`}
          >
            <Cloud className="w-4 h-4 stroke-[2.5]" />
            <span>السحابة و CDN {projects.reduce((acc, p) => acc + (p.images?.filter(isBase64Image).length || 0), 0) + folders.filter(f => isBase64Image(f.image)).length > 0 ? '(⚠️ ترحيل)' : '(جاهز)'}</span>
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
            {folders.map((fld, index) => (
              <div key={fld.id} className="glass-card rounded-2xl border border-wood-700/70 p-5 space-y-4 bg-wood-850/90 shadow-lg">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <img 
                        src={fld.image || "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=800&q=80"} 
                        alt={fld.name}
                        className="w-16 h-16 rounded-2xl object-cover border border-wood-700 shrink-0 shadow-md"
                      />
                      <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-wood-amber text-white text-[11px] font-black flex items-center justify-center shadow-md">
                        {index + 1}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-alexandria font-black text-base text-wood-cream">{fld.name}</h3>
                      <span className="text-[11px] text-wood-muted font-bold block mt-0.5">
                        ترتيب الظهور: #{index + 1}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* Reorder Up / Down Buttons */}
                    <div className="flex items-center bg-wood-900 border border-wood-700/80 rounded-xl p-1 gap-1">
                      <button
                        type="button"
                        onClick={() => moveFolder(fld.id, 'up')}
                        disabled={index === 0}
                        className="p-1.5 rounded-lg text-wood-cream hover:text-wood-amber hover:bg-wood-800 disabled:opacity-25 disabled:hover:bg-transparent disabled:hover:text-wood-cream transition-all active:scale-95"
                        title="تحريك للأعلى / لليمين"
                      >
                        <ArrowUp className="w-4 h-4 stroke-[2.5]" />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveFolder(fld.id, 'down')}
                        disabled={index === folders.length - 1}
                        className="p-1.5 rounded-lg text-wood-cream hover:text-wood-amber hover:bg-wood-800 disabled:opacity-25 disabled:hover:bg-transparent disabled:hover:text-wood-cream transition-all active:scale-95"
                        title="تحريك للأسفل / لليسار"
                      >
                        <ArrowDown className="w-4 h-4 stroke-[2.5]" />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => openEditFolder(fld)}
                      className="p-2.5 rounded-xl bg-wood-800 hover:bg-wood-700 text-wood-amber border border-wood-700 transition-all active:scale-95"
                      title="تعديل القسم"
                    >
                      <Edit3 className="w-4 h-4 stroke-[2.5]" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`هل أنت متأكد من حذف قسم "${fld.name}"؟`)) {
                          deleteFolder(fld.id);
                        }
                      }}
                      className="p-2.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 border border-rose-500/30 transition-all active:scale-95"
                      title="حذف"
                    >
                      <Trash2 className="w-4 h-4 stroke-[2.5]" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </main>
      )}

      {/* ── TAB 3: CLOUDINARY & CDN SETTINGS ──────────────────────── */}
      {activeTab === "settings" && (
        <main className="max-w-4xl mx-auto px-4 pt-6 space-y-6">
          
          {/* Section Header */}
          <div>
            <h2 className="font-alexandria font-black text-base sm:text-lg text-wood-cream flex items-center gap-2">
              <Cloud className="w-5 h-5 text-wood-amber" />
              <span>إعدادات التخزين السحابي و CDN (Cloudinary)</span>
            </h2>
            <p className="text-xs text-wood-muted font-bold mt-1">
              إدارة ربط صور المعرض بـ Cloudinary CDN لتسريع التصفح وتفادي استهلاك مساحة الذاكرة.
            </p>
          </div>

          {/* Config Card */}
          <div className="glass-card rounded-2xl border border-wood-700/70 p-6 bg-wood-850/90 shadow-xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-wood-700/60">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-wood-amber/20 text-wood-amber flex items-center justify-center font-black">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-alexandria font-black text-sm text-wood-cream">بيانات الاتصال بـ Cloudinary</h3>
                  <p className="text-[11px] text-wood-muted font-bold">يمكنك إدخال بيانات حسابك هنا مباشرة وسيتم حفظها للعمل فوراً</p>
                </div>
              </div>
            </div>

            {configToast && (
              <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-black text-xs flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{configToast}</span>
              </div>
            )}

            <form onSubmit={handleSaveCloudinarySettings} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-wood-muted font-black mb-1.5">
                    Cloud Name *
                  </label>
                  <input
                    type="text"
                    dir="ltr"
                    placeholder="e.g. dxyz1234"
                    value={cloudNameInput}
                    onChange={(e) => setCloudNameInput(e.target.value)}
                    className="w-full bg-wood-900 border border-wood-700 rounded-xl px-3.5 py-2.5 text-wood-cream font-mono font-bold outline-none focus:border-wood-amber transition-all"
                  />
                  <span className="text-[10px] text-wood-muted mt-1 block">اسم السحابة / الحساب في Cloudinary</span>
                </div>

                <div>
                  <label className="block text-wood-muted font-black mb-1.5">
                    Upload Preset (Unsigned) *
                  </label>
                  <input
                    type="text"
                    dir="ltr"
                    placeholder="e.g. alaa_portfolio_preset"
                    value={presetInput}
                    onChange={(e) => setPresetInput(e.target.value)}
                    className="w-full bg-wood-900 border border-wood-700 rounded-xl px-3.5 py-2.5 text-wood-cream font-mono font-bold outline-none focus:border-wood-amber transition-all"
                  />
                  <span className="text-[10px] text-wood-muted mt-1 block">الـ Preset المحدد كـ Unsigned لرفع الصور من المتصفح</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <a
                  href="https://cloudinary.com/console"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-wood-amber hover:underline text-xs font-black flex items-center gap-1"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>فتح لوحة تحكم Cloudinary Console</span>
                </a>

                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-wood-amber hover:bg-wood-gold text-white font-black text-xs shadow-lg shadow-wood-amber/20 active:scale-95 transition-all flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4 stroke-[2.5]" />
                  <span>حفظ إعدادات الربط</span>
                </button>
              </div>
            </form>
          </div>

          {/* Migration Tool Card */}
          <div className="glass-card rounded-2xl border border-wood-700/70 p-6 bg-wood-850/90 shadow-xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-wood-700/60">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-black">
                  <RefreshCw className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-alexandria font-black text-sm text-wood-cream">أداة ترحيل الصور القديمة (Base64 Migration)</h3>
                  <p className="text-[11px] text-wood-muted font-bold">فحص المعرض وتحويل أي صور مخزنة مسبقاً بصيغة Base64 إلى روابط CDN سريعة</p>
                </div>
              </div>
            </div>

            {/* Stats Overview */}
            {(() => {
              const base64InProjects = projects.reduce((acc, p) => acc + (p.images?.filter(isBase64Image).length || 0), 0);
              const base64InFolders = folders.filter(f => isBase64Image(f.image)).length;
              const totalBase64 = base64InProjects + base64InFolders;
              const totalProjectsImages = projects.reduce((acc, p) => acc + (p.images?.length || 0), 0);
              const totalCdn = (totalProjectsImages - base64InProjects) + (folders.length - base64InFolders);

              return (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div className="p-3.5 rounded-xl bg-wood-900/90 border border-wood-700/60">
                      <span className="text-[11px] text-wood-muted font-black block">صور Base64 المتبقية</span>
                      <strong className={`text-lg font-black font-mono ${totalBase64 > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                        {totalBase64} صور
                      </strong>
                    </div>

                    <div className="p-3.5 rounded-xl bg-wood-900/90 border border-wood-700/60">
                      <span className="text-[11px] text-wood-muted font-black block">صور CDN سريعة</span>
                      <strong className="text-lg font-black font-mono text-emerald-400">
                        {totalCdn} صور
                      </strong>
                    </div>

                    <div className="p-3.5 rounded-xl bg-wood-900/90 border border-wood-700/60 col-span-2 sm:col-span-1">
                      <span className="text-[11px] text-wood-muted font-black block">حالة المعرض</span>
                      <strong className={`text-xs font-black block mt-1 ${totalBase64 === 0 ? 'text-emerald-400' : 'text-amber-300'}`}>
                        {totalBase64 === 0 ? '✅ ممتاز، لا توجد صور Base64' : '⚠️ يحتاج ترحيل إلى السحابة'}
                      </strong>
                    </div>
                  </div>

                  {/* Migration Status message */}
                  {migrationStatus && (
                    <div className="p-4 rounded-xl bg-wood-900 border border-wood-700/80 space-y-2">
                      <p className="text-xs font-black text-wood-cream flex items-center gap-2">
                        {isMigrating && <Loader2 className="w-4 h-4 text-wood-amber animate-spin" />}
                        <span>{migrationStatus}</span>
                      </p>
                      {isMigrating && (
                        <div className="w-full bg-wood-800 rounded-full h-2.5 overflow-hidden">
                          <div
                            className="bg-wood-amber h-2.5 rounded-full transition-all duration-300"
                            style={{ width: `${migrationProgress}%` }}
                          />
                        </div>
                      )}
                    </div>
                  )}

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={handleMigrateBase64Images}
                      disabled={isMigrating}
                      className="w-full sm:w-auto px-6 py-3 rounded-xl bg-wood-amber hover:bg-wood-gold text-white font-black text-xs shadow-lg shadow-wood-amber/20 disabled:opacity-50 flex items-center justify-center gap-2 transition-all active:scale-95"
                    >
                      {isMigrating ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>جاري الترحيل ورفع الصور...</span>
                        </>
                      ) : (
                        <>
                          <CloudUpload className="w-4 h-4 stroke-[2.5]" />
                          <span>
                            {totalBase64 > 0 ? `بدء ترحيل ${totalBase64} صورة إلى Cloudinary الآن` : 'إعادة فحص الصور وتحديث الكاش'}
                          </span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Quick Setup Instructions */}
          <div className="p-5 rounded-2xl bg-wood-900/60 border border-wood-700/40 text-xs space-y-2 text-wood-muted">
            <h4 className="font-alexandria font-black text-wood-cream text-xs flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-wood-amber" />
              <span>كيفية إنشاء Unsigned Upload Preset في دقيقة واحدة مجاناً:</span>
            </h4>
            <ol className="list-decimal list-inside space-y-1 text-[11px] leading-relaxed pr-2 font-bold">
              <li>سجل دخولك في <strong className="text-wood-cream">cloudinary.com</strong></li>
              <li>انتقل إلى <strong className="text-wood-cream">Settings (رمز الترس)</strong> ثم اضغط على <strong className="text-wood-cream">Upload</strong></li>
              <li>انزل لأسفل واضغط على <strong className="text-wood-cream">Add upload preset</strong></li>
              <li>غيّر خيار <strong className="text-wood-cream">Signing Mode</strong> من Signed إلى <strong className="text-amber-400">Unsigned</strong></li>
              <li>احفظ وانسخ اسم الـ Preset وضعه في الحقل بالأعلى مع اسم الـ Cloud Name الخاص بك.</li>
            </ol>
          </div>

        </main>
      )}

      {/* ── PROJECT ADD/EDIT MODAL ───────────────────────────────────── */}
      {projectModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-start justify-center overflow-y-auto px-4 pt-14 sm:pt-10 pb-28">
          <div className="w-full max-w-xl glass-wood rounded-3xl border border-wood-700 p-5 sm:p-6 shadow-2xl bg-wood-900">
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
              
              <div>
                <label className="block text-wood-muted font-black mb-1">اسم العمل / الموديل *</label>
                <input
                  type="text"
                  value={projectForm.title}
                  onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })}
                  className="w-full bg-wood-850 border border-wood-700 rounded-xl px-3.5 py-2.5 text-wood-cream font-bold outline-none focus:border-wood-amber"
                />
              </div>

              {/* Folder selection */}
              <div>
                <label className="block text-wood-muted font-black mb-1">القسم الرئيسي *</label>
                <select
                  value={projectForm.folderId}
                  onChange={(e) => setProjectForm({ ...projectForm, folderId: e.target.value })}
                  className="w-full bg-wood-850 border border-wood-700 rounded-xl px-3.5 py-2.5 text-wood-cream font-bold outline-none focus:border-wood-amber"
                >
                  {folders.map(f => (
                    <option key={f.id} value={f.id}>{f.name}</option>
                  ))}
                </select>
              </div>

              {/* Finish Specs */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-wood-muted font-black mb-1">نوع الدهان والتشطيب</label>
                  <input
                    type="text"
                    value={projectForm.paintType}
                    onChange={(e) => setProjectForm({ ...projectForm, paintType: e.target.value })}
                    className="w-full bg-wood-850 border border-wood-700 rounded-xl px-3 py-2 text-wood-cream font-bold outline-none focus:border-wood-amber"
                  />
                </div>

                <div>
                  <label className="block text-wood-muted font-black mb-1">نوع الخشب (اختياري)</label>
                  <input
                    type="text"
                    value={projectForm.woodType}
                    onChange={(e) => setProjectForm({ ...projectForm, woodType: e.target.value })}
                    className="w-full bg-wood-850 border border-wood-700 rounded-xl px-3 py-2 text-wood-cream font-bold outline-none focus:border-wood-amber"
                  />
                </div>

                <div>
                  <label className="block text-wood-muted font-black mb-1">درجة اللون واللمعان (اختياري)</label>
                  <input
                    type="text"
                    value={projectForm.color}
                    onChange={(e) => setProjectForm({ ...projectForm, color: e.target.value })}
                    className="w-full bg-wood-850 border border-wood-700 rounded-xl px-3 py-2 text-wood-cream font-bold outline-none focus:border-wood-amber"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-wood-muted font-black mb-1">تفاصيل ووصف العمل (اختياري)</label>
                <textarea
                  rows={2}
                  value={projectForm.desc}
                  onChange={(e) => setProjectForm({ ...projectForm, desc: e.target.value })}
                  className="w-full bg-wood-850 border border-wood-700 rounded-xl p-3 text-wood-cream font-bold outline-none focus:border-wood-amber leading-relaxed"
                />
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
                      <span>{uploadStatusText || "جاري معالجة ورفع الصور إلى Cloudinary..."}</span>
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
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-start justify-center overflow-y-auto px-4 pt-14 sm:pt-10 pb-28">
          <div className="w-full max-w-lg glass-wood rounded-3xl border border-wood-700 p-5 sm:p-6 shadow-2xl bg-wood-900">
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
