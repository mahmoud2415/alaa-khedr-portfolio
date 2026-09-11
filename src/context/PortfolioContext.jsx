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

export const PortfolioProvider = ({ children }) => {
  // Purge any old legacy mock cache from browser
  useEffect(() => {
    try {
      localStorage.removeItem('wood_cached_projects');
      localStorage.removeItem('wood_cached_folders');
    } catch(e) {}
  }, []);

  const sortFolders = (list) => {
    return [...list].sort((a, b) => {
      const orderA = typeof a.order === 'number' ? a.order : 9999;
      const orderB = typeof b.order === 'number' ? b.order : 9999;
      if (orderA !== orderB) return orderA - orderB;
      return (a.createdAt || '').localeCompare(b.createdAt || '');
    });
  };

  const [folders, setFolders] = useState(() => {
    try {
      const cached = localStorage.getItem('wood_folders_v2');
      return cached ? sortFolders(JSON.parse(cached)) : [];
    } catch {
      return [];
    }
  });

  const cleanProjectData = (p) => {
    let pt = p.paintType || "";
    if (pt.includes("دوكو فرن")) {
      pt = pt.replace(/دوكو فرن\s*(إيطالي|مط)?/g, "").trim();
    }
    return {
      ...p,
      paintType: pt
    };
  };

  const [projects, setProjects] = useState(() => {
    try {
      const cached = localStorage.getItem('wood_projects_v2');
      return cached ? JSON.parse(cached).map(cleanProjectData) : [];
    } catch {
      return [];
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
        const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        const sorted = sortFolders(list);
        setFolders(sorted);
        try { localStorage.setItem('wood_folders_v2', JSON.stringify(sorted)); } catch(e){}
      }, (err) => {
        console.warn("Folders snapshot error:", err.message);
      });

      // Projects listener
      unsubProjects = onSnapshot(collection(db, "projects"), (snap) => {
        const list = snap.docs.map(d => cleanProjectData({ id: d.id, ...d.data() }));
        setProjects(list);
        try { localStorage.setItem('wood_projects_v2', JSON.stringify(list)); } catch(e){}
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
    const cleaned = cleanProjectData(projectData);
    const finalProjectData = {
      ...cleaned,
      code: defaultCode,
      updatedAt: new Date().toISOString()
    };

    // Instant local state update for immediate feedback
    if (projectId) {
      setProjects(prev => {
        const next = prev.map(p => p.id === projectId ? { ...p, ...finalProjectData } : p);
        try { localStorage.setItem('wood_projects_v2', JSON.stringify(next)); } catch(e){}
        return next;
      });
    } else {
      const tempId = `proj_${Date.now()}`;
      setProjects(prev => {
        const next = [{ id: tempId, ...finalProjectData, createdAt: new Date().toISOString() }, ...prev];
        try { localStorage.setItem('wood_projects_v2', JSON.stringify(next)); } catch(e){}
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
    try { localStorage.setItem('wood_projects_v2', JSON.stringify(remaining)); } catch(e){}

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
    const existingFolder = folders.find(f => f.id === id);
    const order = typeof folderData.order === 'number' 
      ? folderData.order 
      : (existingFolder?.order ?? folders.length);

    const updatedFolder = { 
      ...folderData, 
      id, 
      order,
      updatedAt: new Date().toISOString() 
    };
    
    setFolders(prev => {
      const exists = prev.some(f => f.id === id);
      const next = exists ? prev.map(f => f.id === id ? { ...f, ...updatedFolder } : f) : [...prev, updatedFolder];
      const sorted = sortFolders(next);
      try { localStorage.setItem('wood_folders_v2', JSON.stringify(sorted)); } catch(e){}
      return sorted;
    });

    try {
      await setDoc(doc(db, "folders", id), {
        ...folderData,
        id,
        order,
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
    try { localStorage.setItem('wood_folders_v2', JSON.stringify(remaining)); } catch(e){}

    try {
      await deleteDoc(doc(db, "folders", folderId));
      for (const f of remaining) {
        await setDoc(doc(db, "folders", f.id), f, { merge: true });
      }
    } catch (e) {
      console.warn("Delete firestore error:", e.message);
    }
  };

  const reorderFolders = async (orderedList) => {
    const updatedList = orderedList.map((folder, index) => ({
      ...folder,
      order: index
    }));
    setFolders(updatedList);
    try { localStorage.setItem('wood_folders_v2', JSON.stringify(updatedList)); } catch(e){}

    try {
      await Promise.all(
        updatedList.map(folder => 
          setDoc(doc(db, "folders", folder.id), { order: folder.order }, { merge: true })
        )
      );
      return { success: true };
    } catch (err) {
      console.warn("Reorder firestore sync warning:", err.message);
      return { success: true, localOnly: true };
    }
  };

  const moveFolder = async (folderId, direction) => {
    const index = folders.findIndex(f => f.id === folderId);
    if (index === -1) return;
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === folders.length - 1) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const next = [...folders];
    const temp = next[index];
    next[index] = next[targetIndex];
    next[targetIndex] = temp;

    return reorderFolders(next);
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
      reorderFolders,
      moveFolder,
      setCraftsmanInfo
    }}>
      {children}
    </PortfolioContext.Provider>
  );
};
