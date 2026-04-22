"use client";

import { useState, useRef, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Upload, Search, Image as ImageIcon, Loader2, CheckCircle2, 
  AlertCircle, ChevronRight, User, LogOut, Sun, Moon, 
  Download, Maximize2, X, Check, Square, CheckSquare
} from "lucide-react";
import styles from "./page.module.css";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [userId, setUserId] = useState(null);
  const [token, setToken] = useState(null);
  const [theme, setTheme] = useState("dark");
  const [activeTab, setActiveTab] = useState("search");
  const [uploading, setUploading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState([]);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [fullscreenImage, setFullscreenImage] = useState(null);
  const [skip, setSkip] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [message, setMessage] = useState(null);
  const [searchFile, setSearchFile] = useState(null);
  const [searchPreview, setSearchPreview] = useState(null);

  const galleryInputRef = useRef(null);
  const folderInputRef = useRef(null);
  const selfieInputRef = useRef(null);

  // Check authentication and theme
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "dark";
    setTheme(savedTheme);
    document.documentElement.setAttribute("data-theme", savedTheme);

    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      const storedToken = localStorage.getItem("token");
      const storedUserId = localStorage.getItem("userId");
      
      if (storedToken && storedUserId) {
        setToken(storedToken);
        setUserId(storedUserId);
      } else {
        router.push("/login");
      }
    }
  }, [status, router]);

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
  };

  // Clear message after 5 seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const handleLogout = async () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("userRole");
    await signOut({ callbackUrl: "/login" });
  };

  const handleGalleryUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files || files.length === 0) return;

    setUploading(true);
    let successCount = 0;
    let errorCount = 0;

    // Concurrency limit: 8 parallel uploads at a time
    const CONCURRENCY = 8;
    const batches = [];
    for (let i = 0; i < files.length; i += CONCURRENCY) {
      batches.push(files.slice(i, i + CONCURRENCY));
    }

    try {
      for (const batch of batches) {
        await Promise.all(batch.map(async (file) => {
          const formData = new FormData();
          formData.append("user_id", userId);
          formData.append("files", file);

          try {
            const response = await fetch(`${API_URL}/s3-test/`, {
              method: "POST",
              body: formData,
            });
            if (response.ok) successCount++;
            else errorCount++;
          } catch (err) {
            errorCount++;
          }
        }));
      }
      
      if (errorCount === 0) {
        setMessage({ type: "success", text: `Successfully uploaded ${successCount} images!` });
      } else {
        setMessage({ type: "info", text: `Upload complete. Success: ${successCount}, Failed: ${errorCount}` });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Upload process encountered an error." });
    } finally {
      setUploading(false);
      if (galleryInputRef.current) galleryInputRef.current.value = "";
      if (folderInputRef.current) folderInputRef.current.value = "";
    }
  };

  const handleSelfieSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setSearchFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setSearchPreview(reader.result);
    reader.readAsDataURL(file);
    
    setResults([]);
    setSelectedIds(new Set());
    setSkip(0);
    setHasMore(false);
  };

  const performSearch = async (currentSkip = 0) => {
    if (!searchFile || !userId) return;

    setSearching(true);
    const formData = new FormData();
    formData.append("user_id", userId);
    formData.append("file", searchFile);
    formData.append("skip", currentSkip);
    formData.append("limit", 10);

    try {
      const response = await fetch(`${API_URL}/s3-test/search/`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Search failed");
      
      const data = await response.json();
      
      if (currentSkip === 0) {
        setResults(data);
      } else {
        setResults(prev => [...prev, ...data]);
      }
      
      setHasMore(data.length === 10);
      setSkip(currentSkip + 10);
      
      if (data.length === 0 && currentSkip === 0) {
        setMessage({ type: "info", text: "No matching photos found." });
      }
    } catch (error) {
      setMessage({ type: "error", text: error.message });
    } finally {
      setSearching(false);
    }
  };

  const loadMore = () => performSearch(skip);

  const toggleSelection = (id) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) newSelected.delete(id);
    else newSelected.add(id);
    setSelectedIds(newSelected);
  };

  const selectAll = () => {
    if (selectedIds.size === results.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(results.map(r => r.file_id)));
    }
  };

  const downloadImage = async (url, filename) => {
    try {
      // Use our backend proxy to avoid S3 CORS issues
      const proxyUrl = `${API_URL}/s3-test/download?url=${encodeURIComponent(url)}`;
      const response = await fetch(proxyUrl);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = filename || "photo.jpg";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Download failed", error);
    }
  };

  const downloadSelected = async () => {
    const selectedFiles = results.filter(r => selectedIds.has(r.file_id));
    if (selectedFiles.length === 0) return;

    setMessage({ type: "info", text: `Downloading ${selectedFiles.length} images...` });
    
    // In a real app, we'd use JSZip here. For now, we'll trigger multiple downloads.
    for (const file of selectedFiles) {
      await downloadImage(file.url, `match_${file.file_id}.jpg`);
      // Brief delay to avoid browser blocking multiple downloads
      await new Promise(r => setTimeout(r, 300));
    }
  };

  if (status === "loading" || !userId) {
    return (
      <div className={styles.container} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <Loader2 className={styles.spinner} size={48} style={{ color: '#7c3aed', marginBottom: '1rem' }} />
          <p style={{ color: '#9ca3af', fontSize: '1rem' }}>Authenticating...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.logoArea}>
          <div className={styles.logoIcon}>
            <ImageIcon className="text-white" size={32} />
          </div>
          <div className={styles.logoText}>
            <h1>FindMyClicks.Ai</h1>
            <p>Premium Face Search</p>
          </div>
        </div>

        <div className={styles.userControls}>
           <div className={styles.userInfo}>
              <button onClick={toggleTheme} className={styles.themeBtn} title="Toggle Theme">
                {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
              </button>
              <div className={styles.userBadge}>
                {session?.user?.image ? (
                  <img src={session.user.image} alt="PFP" className={styles.pfpCircle} />
                ) : (
                  <div className={styles.pfpPlaceholder}>
                    <User size={14} />
                  </div>
                )}
                <span className={styles.userName}>{session?.user?.name || session?.user?.email}</span>
              </div>
              <button onClick={handleLogout} className={styles.logoutBtn} title="Log Out">
                <LogOut size={18} />
              </button>
           </div>
        </div>
      </header>

      <main className={styles.mainGrid}>
        <div className={styles.leftColumn}>
            <div className={styles.panel}>
            <div className={styles.tabs}>
              <button 
                onClick={() => setActiveTab("search")}
                className={`${styles.tab} ${activeTab === "search" ? styles.tabActive : ""}`}
              >
                <Search size={18} /> Search
              </button>
              <button 
                onClick={() => setActiveTab("upload")}
                className={`${styles.tab} ${activeTab === "upload" ? styles.tabActive : ""}`}
              >
                <Upload size={18} /> Upload
              </button>
            </div>

            <AnimatePresence mode="wait">
              {activeTab === "search" ? (
                <motion.div 
                  key="search-tab"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className={styles.tabContent}
                >
                  <div 
                    onClick={() => selfieInputRef.current?.click()}
                    className={styles.dropzone}
                  >
                    {searchPreview ? (
                      <img src={searchPreview} className={styles.preview} alt="Selfie preview" />
                    ) : (
                      <>
                        <div className={styles.dropzoneIcon}>
                          <User size={32} />
                        </div>
                        <p style={{ fontWeight: 600 }}>Upload Selfie</p>
                        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>To find your photos</p>
                      </>
                    )}
                    <input type="file" ref={selfieInputRef} onChange={handleSelfieSelect} style={{ display: 'none' }} accept="image/*" />
                  </div>
                  
                  <button 
                    onClick={() => performSearch(0)}
                    disabled={!searchFile || searching}
                    className={styles.primaryButton}
                  >
                    {searching ? <Loader2 className={styles.spinner} size={24} /> : <Search size={24} />}
                    {searching ? "Searching..." : "Find My Photos"}
                  </button>
                </motion.div>
              ) : (
                <motion.div 
                  key="upload-tab"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className={styles.tabContent}
                >
                  <div className={styles.uploadOptions}>
                    <div 
                      onClick={() => galleryInputRef.current?.click()}
                      className={styles.dropzoneSmall}
                    >
                      <div className={styles.dropzoneIconSmall}>
                        <ImageIcon size={24} />
                      </div>
                      <p>Select Photos</p>
                      <input 
                        type="file" 
                        ref={galleryInputRef} 
                        onChange={handleGalleryUpload} 
                        multiple 
                        style={{ display: 'none' }} 
                        accept="image/*" 
                      />
                    </div>

                    <div 
                      onClick={() => folderInputRef.current?.click()}
                      className={styles.dropzoneSmall}
                    >
                      <div className={styles.dropzoneIconSmall}>
                        <Upload size={24} />
                      </div>
                      <p>Upload Folder</p>
                      <input 
                        type="file" 
                        ref={folderInputRef} 
                        onChange={handleGalleryUpload} 
                        webkitdirectory="true" 
                        directory="true" 
                        style={{ display: 'none' }} 
                      />
                    </div>
                  </div>

                  <div 
                    className={styles.dropzone}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      const files = e.dataTransfer.files;
                      handleGalleryUpload({ target: { files } });
                    }}
                  >
                    <div className={styles.dropzoneIcon}>
                      <Upload size={32} />
                    </div>
                    <p style={{ fontWeight: 600 }}>Drag & Drop Here</p>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Multiple files supported</p>
                  </div>
                  
                  {uploading && (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', marginTop: '1.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#60a5fa', fontSize: '1rem' }}>
                        <Loader2 className={styles.spinner} size={20} />
                        Uploading (Parallel x8)...
                      </div>
                      <div className={styles.progressBar}>
                        <motion.div 
                          className={styles.progressFill}
                          initial={{ width: "0%" }}
                          animate={{ width: "100%" }}
                          transition={{ duration: 2, repeat: Infinity }}
                        />
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          <div className={styles.howItWorks}>
            <h3>How it works</h3>
            <ul className={styles.stepList}>
              {[
                "Sign in with your Google account",
                "Upload photos to your private gallery",
                "Use a selfie to find your matches",
                "AI detects faces in milliseconds"
              ].map((step, i) => (
                <li key={i} className={styles.stepItem}>
                  <div className={styles.stepNumber}>{i+1}</div>
                  {step}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className={styles.rightColumn}>
          <div className={styles.panel}>
            <div className={styles.resultsHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <h2>Results {results.length > 0 && <span className={styles.countBadge}>{results.length} found</span>}</h2>
                {results.length > 0 && (
                  <button onClick={selectAll} className={styles.textBtn}>
                    {selectedIds.size === results.length ? "Deselect All" : "Select All"}
                  </button>
                )}
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                {selectedIds.size > 0 && (
                  <motion.button 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    onClick={downloadSelected} 
                    className={styles.downloadAllBtn}
                  >
                    <Download size={18} /> Download ({selectedIds.size})
                  </motion.button>
                )}
                {results.length > 0 && (
                  <button onClick={() => {setResults([]); setSelectedIds(new Set()); setSearchPreview(null); setSearchFile(null);}} className={styles.textBtn}>
                    Clear
                  </button>
                )}
              </div>
            </div>

            <AnimatePresence>
              {message && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className={`${styles.alert} ${message.type === 'success' ? styles.alertSuccess : message.type === 'error' ? styles.alertError : styles.alertInfo}`}
                >
                  {message.type === 'success' ? <CheckCircle2 size={20} /> : message.type === 'error' ? <AlertCircle size={20} /> : <Search size={20} />}
                  {message.text}
                </motion.div>
              )}
            </AnimatePresence>

            {results.length === 0 ? (
              <div className={styles.emptyState}>
                <div style={{ width: '5rem', height: '5rem', background: 'rgba(255,255,255,0.05)', borderRadius: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
                  <ImageIcon size={40} />
                </div>
                <p style={{ fontWeight: 600, fontSize: '1.125rem' }}>No results to display</p>
                <p style={{ fontSize: '1rem', marginTop: '0.5rem', maxWidth: '300px', color: 'var(--text-secondary)' }}>Perform a face search to see your matching photos here.</p>
              </div>
            ) : (
              <div>
                <div className={styles.grid}>
                  {results.map((res, idx) => {
                    const isSelected = selectedIds.has(res.file_id);
                    return (
                      <motion.div 
                        key={`${res.file_id}-${idx}`}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.05 }}
                        className={`${styles.card} ${isSelected ? styles.cardSelected : ""}`}
                        onClick={() => toggleSelection(res.file_id)}
                      >
                        <img src={res.url} alt="Match" />
                        
                        <div className={styles.cardSelectOverlay}>
                          {isSelected ? <CheckSquare size={24} className={styles.selectIconActive} /> : <Square size={24} className={styles.selectIcon} />}
                        </div>

                        <div className={styles.cardActions}>
                           <button 
                            onClick={(e) => { e.stopPropagation(); setFullscreenImage(res.url); }}
                            className={styles.cardActionBtn}
                            title="View Fullscreen"
                           >
                            <Maximize2 size={16} />
                           </button>
                           <button 
                            onClick={(e) => { e.stopPropagation(); downloadImage(res.url, `match_${res.file_id}.jpg`); }}
                            className={styles.cardActionBtn}
                            title="Download"
                           >
                            <Download size={16} />
                           </button>
                        </div>

                        <div className={styles.cardOverlay}>
                           <p className={styles.similarityLabel}>Similarity</p>
                           <p className={styles.similarityValue}>{(res.similarity * 100).toFixed(1)}%</p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {hasMore && (
                  <button onClick={loadMore} disabled={searching} className={styles.loadMore}>
                    {searching ? <Loader2 className={styles.spinner} size={20} /> : <ChevronRight size={20} />}
                    Load More Photos
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      <AnimatePresence>
        {fullscreenImage && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={styles.lightbox}
            onClick={() => setFullscreenImage(null)}
          >
            <button className={styles.closeLightbox} onClick={() => setFullscreenImage(null)}>
              <X size={32} />
            </button>
            <motion.img 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              src={fullscreenImage} 
              alt="Fullscreen" 
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <footer style={{ maxWidth: '1200px', margin: '5rem auto 0', padding: '3rem 0', borderTop: '1px solid var(--glass-border)', textAlign: 'center' }}>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>© 2026 FindMyClicks.Ai • Advanced Face Recognition Technology</p>
      </footer>
    </div>
  );
}
