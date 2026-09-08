import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../firebase/config';
import { 
  collection, 
  doc, 
  onSnapshot, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { CRAFTSMAN_CONFIG } from '../config/craftsman.config';

const PortfolioContext = createContext();

export const usePortfolio = () => {
  const context = useContext(PortfolioContext);
  if (!context) throw new Error("usePortfolio must be used within PortfolioProvider");
  return context;
};

// Initial Sample Projects for instant gorgeous display
const INITIAL_SAMPLE_PROJECTS = [
  {
    id: "proj_bed_101",
    code: "BED-101",
    title: "غرفة نوم ماستر مودرن — تشطيب دوكو فرن مط",
    desc: "تشطيب كامل لغرفة نوم رئيسية بدهان دوكو فرن إيطالي عالي المقاومة، معالجة فواصل الخشب، ملمس حريري مطفي فخم غير عاكس للبصمات.",
    folderId: "bedrooms",
    subcategoryId: "bedrooms_duco",
    woodType: "خشب زان أحمر روماني + قشرة أرو",
    paintType: "دوكو فرن إيطالي مطفي (Silky Matt)",
    color: "رمادي كشميري دافئ (Warm Greige)",
    duration: "10 أيام عمل",
    isFeatured: true,
    images: [
      "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1540518614846-7ede433c4ef0?auto=format&fit=crop&w=1200&q=80"
    ],
    createdAt: new Date().toISOString()
  },
  {
    id: "proj_bed_102",
    code: "BED-102",
    title: "غرفة نوم كلاسيك — إستر وتعتيق باتينا ملكي",
    desc: "دهان وتشطيب إستر شفاف عالي اللمعان مع إبراز عروق القشرة الطبيعية، وتعتيق الحليات والأويمة ببودرة ذهبية وباتينا فرنسية فخمة.",
    folderId: "bedrooms",
    subcategoryId: "bedrooms_ester",
    woodType: "خشب زان مجفف + قشرة جوز تركي",
    paintType: "إستر بوليستر كريستال ولميع",
    color: "بني عسلي غامق وتعتيق ذهبي",
    duration: "14 يوم عمل",
    isFeatured: true,
    images: [
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80"
    ],
    createdAt: new Date().toISOString()
  },
  {
    id: "proj_din_201",
    code: "DIN-201",
    title: "سفرة وبوفيه مودرن — دوكو أوف وايت وميتاليك",
    desc: "تشطيب طاولة سفرة و8 كراسي وبوفيه بدهان دوكو بولي يوريثان مقاوم للحرارة والخدش مع لمسات ميتاليك شامبين في القوائم.",
    folderId: "dining_rooms",
    subcategoryId: "dining_duco",
    woodType: "خشب زان أحمر",
    paintType: "دوكو بولي يوريثان مقاوم للسوائل",
    color: "أوف وايت ناعم + شامبين جولد",
    duration: "12 يوم عمل",
    isFeatured: true,
    images: [
      "https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&w=1200&q=80"
    ],
    createdAt: new Date().toISOString()
  },
  {
    id: "proj_door_301",
    code: "DOOR-301",
    title: "أبواب شقق وفيلات — عازل دوكو كابينة فرن",
    desc: "تشطيب أبواب غرف وشقق كابينة فرن بضغط حراري، طبقات أساس عازلة ضد الرطوبة وتغيرات الجو مع لمعان زجاجي فائق.",
    folderId: "doors_windows",
    subcategoryId: "doors_duco",
    woodType: "خشب موسكي روسي مع كبس قشرة أرو",
    paintType: "دوكو كابينة فرن ضد الرطوبة",
    color: "رمادي أنثراسيت مودرن (Anthracite)",
    duration: "7 أيام عمل",
    isFeatured: true,
    images: [
      "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=1200&q=80"
    ],
    createdAt: new Date().toISOString()
  },
  {
    id: "proj_kit_401",
    code: "KIT-401",
    title: "مطبخ خشب أرو طبيعي — تشطيب مائي صديق للبيئة",
    desc: "دهان وحدات مطبخ كاملة بمواد دهان ألمانية مائية مقاومة للبخار والزيوت مع إبراز مسام وعروق خشب الأرو الطبيعي.",
    folderId: "kitchens_dressing",
    subcategoryId: "kitchens_wood",
    woodType: "خشب أرو ماسيف طبيعي",
    paintType: "ورنيش مائي ألماني عالي التحمل",
    color: "خشب طبيعي هادئ (Natural Oak)",
    duration: "10 أيام عمل",
    isFeatured: false,
    images: [
      "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=1200&q=80"
    ],
    createdAt: new Date().toISOString()
  },
  {
    id: "proj_sal_501",
    code: "SAL-501",
    title: "صالون كلاسيك ملكي — تجديد وورق ذهب إيطالي",
    desc: "إعادة تأهيل ودهان صالون قديم بالكامل، صيانة الأخشاب، تذهيب الأويمة بورق ذهب إيطالي عيار 24 مع ورنيش حماية شفاف.",
    folderId: "living_salons",
    subcategoryId: "salons_gold",
    woodType: "خشب زان أصلي قديم",
    paintType: "تذهيب ورق دهب إيطالي وباتينا",
    color: "ذهب ملكي عتيق",
    duration: "15 يوم عمل",
    isFeatured: true,
    images: [
      "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1200&q=80"
    ],
    createdAt: new Date().toISOString()
  }
];

export const PortfolioProvider = ({ children }) => {
  const [folders, setFolders] = useState(() => {
    try {
      const cached = localStorage.getItem('wood_cached_folders');
      return cached ? JSON.parse(cached) : CRAFTSMAN_CONFIG.defaultFolders;
    } catch {
      return CRAFTSMAN_CONFIG.defaultFolders;
    }
  });

  const [projects, setProjects] = useState(() => {
    try {
      const cached = localStorage.getItem('wood_cached_projects');
      return cached ? JSON.parse(cached) : INITIAL_SAMPLE_PROJECTS;
    } catch {
      return INITIAL_SAMPLE_PROJECTS;
    }
  });

  const [craftsmanInfo, setCraftsmanInfo] = useState(CRAFTSMAN_CONFIG);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // 1. Realtime Firestore Listeners
  useEffect(() => {
    let unsubFolders = () => {};
    let unsubProjects = () => {};
    let unsubInfo = () => {};

    try {
      // Folders listener
      unsubFolders = onSnapshot(collection(db, "folders"), (snap) => {
        if (!snap.empty) {
          const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
          setFolders(list);
          try { localStorage.setItem('wood_cached_folders', JSON.stringify(list)); } catch(e){}
        }
      }, (err) => {
        console.warn("Folders snapshot error:", err.message);
      });

      // Projects listener
      unsubProjects = onSnapshot(collection(db, "projects"), (snap) => {
        if (!snap.empty) {
          const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
          setProjects(list);
          try { localStorage.setItem('wood_cached_projects', JSON.stringify(list)); } catch(e){}
        }
        setLoading(false);
      }, (err) => {
        console.warn("Projects snapshot error:", err.message);
        setLoading(false);
      });

      // Craftsman Info listener
      unsubInfo = onSnapshot(doc(db, "settings", "craftsman_info"), (docSnap) => {
        if (docSnap.exists()) {
          setCraftsmanInfo({ ...CRAFTSMAN_CONFIG, ...docSnap.data() });
        }
      }, (err) => {
        console.warn("Settings error:", err.message);
      });

    } catch (e) {
      console.error("Firestore init error:", e);
      setLoading(false);
    }

    return () => {
      unsubFolders();
      unsubProjects();
      unsubInfo();
    };
  }, []);

  // ── Queries & Helpers ─────────────────────────────────────
  
  const getFolderById = (folderId) => {
    return folders.find(f => f.id === folderId);
  };

  const getProjectsByFolder = (folderId, subcategoryId = null) => {
    return projects.filter(p => {
      const matchFolder = p.folderId === folderId;
      const matchSub = subcategoryId ? p.subcategoryId === subcategoryId : true;
      return matchFolder && matchSub;
    });
  };

  const getProjectByIdOrCode = (idOrCode) => {
    if (!idOrCode) return null;
    const clean = idOrCode.toLowerCase().trim();
    return projects.find(p => 
      p.id.toLowerCase() === clean || 
      p.code?.toLowerCase() === clean ||
      p.code?.toLowerCase() === `#${clean}`
    );
  };

  const getFeaturedProjects = () => {
    return projects.filter(p => p.isFeatured);
  };

  const getBannerProjects = () => {
    return bannerProjectIds
      .map(projectId => projects.find(project => project.id === projectId))
      .filter(Boolean);
  };

  // ── Admin Actions (Firestore CRUD with timeout & Local Persistence) ─────────────────────────

  // Add / Edit Project
  const saveProject = async (projectData, projectId = null) => {
    const defaultCode = projectData.code?.trim().toUpperCase() || `WOOD-${Math.floor(100 + Math.random() * 900)}`;
    const finalProjectData = {
      ...projectData,
      code: defaultCode,
      updatedAt: new Date().toISOString()
    };

    // Instant local state update for immediate feedback
    if (projectId) {
      setProjects(prev => {
        const next = prev.map(p => p.id === projectId ? { ...p, ...finalProjectData } : p);
        try { localStorage.setItem('wood_cached_projects', JSON.stringify(next)); } catch(e){}
        return next;
      });
    } else {
      const tempId = `proj_${Date.now()}`;
      setProjects(prev => {
        const next = [{ id: tempId, ...finalProjectData, createdAt: new Date().toISOString() }, ...prev];
        try { localStorage.setItem('wood_cached_projects', JSON.stringify(next)); } catch(e){}
        return next;
      });
    }

    // Persist to Firestore with 4-second timeout to avoid hanging
    try {
      const firestorePromise = projectId
        ? updateDoc(doc(db, "projects", projectId), {
            ...finalProjectData,
            updatedAt: serverTimestamp()
          })
        : addDoc(collection(db, "projects"), {
            ...finalProjectData,
            createdAt: serverTimestamp()
          });

      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Firestore timeout, saved locally")), 4000)
      );

      await Promise.race([firestorePromise, timeoutPromise]);
      return { success: true };
    } catch (err) {
      console.warn("Firestore sync warning (data preserved locally):", err.message);
      return { success: true, localOnly: true };
    }
  };

  const deleteProject = async (projectId) => {
    const remaining = projects.filter(p => p.id !== projectId);
    setProjects(remaining);
    try { localStorage.setItem('wood_cached_projects', JSON.stringify(remaining)); } catch(e){}

    try {
      await deleteDoc(doc(db, "projects", projectId));
      for (const p of remaining) {
        await setDoc(doc(db, "projects", p.id), p, { merge: true });
      }
    } catch (e) {
      console.warn("Delete firestore error:", e.message);
    }
  };

  // Add / Edit Folder
  const saveFolder = async (folderData, folderId = null) => {
    const id = folderId || folderData.id || folderData.name.trim().toLowerCase().replace(/\s+/g, '_');
    const updatedFolder = { ...folderData, id, updatedAt: new Date().toISOString() };
    
    setFolders(prev => {
      const exists = prev.some(f => f.id === id);
      const next = exists ? prev.map(f => f.id === id ? { ...f, ...updatedFolder } : f) : [...prev, updatedFolder];
      try { localStorage.setItem('wood_cached_folders', JSON.stringify(next)); } catch(e){}
      return next;
    });

    try {
      await setDoc(doc(db, "folders", id), {
        ...folderData,
        id,
        updatedAt: serverTimestamp()
      }, { merge: true });
      return { success: true };
    } catch (err) {
      console.error("Error saving folder:", err);
      return { success: true, localOnly: true };
    }
  };

  const deleteFolder = async (folderId) => {
    const remaining = folders.filter(f => f.id !== folderId);
    setFolders(remaining);
    try { localStorage.setItem('wood_cached_folders', JSON.stringify(remaining)); } catch(e){}

    try {
      await deleteDoc(doc(db, "folders", folderId));
      for (const f of remaining) {
        await setDoc(doc(db, "folders", f.id), f, { merge: true });
      }
    } catch (e) {
      console.warn("Delete firestore error:", e.message);
    }
  };

  return (
    <PortfolioContext.Provider value={{
      folders,
      projects,
      craftsmanInfo,
      loading,
      searchQuery,
      setSearchQuery,
      getFolderById,
      getProjectsByFolder,
      getProjectByIdOrCode,
      getFeaturedProjects,
      saveProject,
      deleteProject,
      saveFolder,
      deleteFolder,
      setCraftsmanInfo
    }}>
      {children}
    </PortfolioContext.Provider>
  );
};
