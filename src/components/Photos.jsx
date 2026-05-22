import React, { useState, useEffect } from 'react';
import { Camera, Plus, Trash2, Download, X, Calendar, MapPin, Eye, Upload, Image as ImageIcon, Loader2 } from 'lucide-react';
import { supabase } from '../supabaseClient';

// Helper function to compress images client-side using HTML5 Canvas
const compressImage = (file, maxWidth = 1920, maxHeight = 1080, quality = 0.8) => {
  return new Promise((resolve) => {
    // If it's not a standard compressible image, return the original file
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      resolve(file);
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Maintain aspect ratio
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              resolve(file); // Fallback to original
              return;
            }
            const compressedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          },
          'image/jpeg',
          quality
        );
      };
      img.onerror = () => resolve(file); // Fallback
    };
    reader.onerror = () => resolve(file); // Fallback
  });
};

const Photos = ({ activeProjectId, onSelectProject }) => {
  const [photos, setPhotos] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [activePhoto, setActivePhoto] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  // Form state
  const [newPhoto, setNewPhoto] = useState({
    file: null,
    name: '',
    project_id: ''
  });

  useEffect(() => {
    fetchPhotos();
    fetchProjects();
  }, [activeProjectId]);

  const fetchPhotos = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('documents')
        .select(`
          *,
          projects ( name, location )
        `)
        .eq('category', 'Progress Photos');

      if (activeProjectId && activeProjectId !== 'all') {
        query = query.eq('project_id', activeProjectId);
      }

      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      setPhotos(data || []);
    } catch (error) {
      console.error('Error fetching progress photos:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase.from('projects').select('id, name');
      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error('Error fetching projects:', error.message);
    }
  };

  // Drag and drop handlers
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        setNewPhoto(prev => ({
          ...prev,
          file: file,
          name: prev.name || file.name.replace(/\.[^/.]+$/, "")
        }));
      } else {
        alert('Please select an image file (PNG, JPG, WEBP).');
      }
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type.startsWith('image/')) {
        setNewPhoto(prev => ({
          ...prev,
          file: file,
          name: prev.name || file.name.replace(/\.[^/.]+$/, "")
        }));
      } else {
        alert('Please select an image file (PNG, JPG, WEBP).');
      }
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    const targetProjectId = newPhoto.project_id || activeProjectId;
    
    if (!newPhoto.file) {
      alert('Please select a photo file.');
      return;
    }
    if (!targetProjectId || targetProjectId === 'all') {
      alert('Please select a project for this photo.');
      return;
    }

    try {
      setUploading(true);
      
      // Perform client-side image compression
      const compressedFile = await compressImage(newPhoto.file);
      console.log(
        `Image compressed successfully: Original = ${(newPhoto.file.size / 1024).toFixed(1)} KB, ` +
        `Compressed = ${(compressedFile.size / 1024).toFixed(1)} KB`
      );

      const fileExt = compressedFile.name.split('.').pop();
      // Generate clean filename
      const cleanFileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
      const filePath = `${targetProjectId}/photos/${cleanFileName}`;

      // Upload compressed file to 'documents' bucket
      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, compressedFile);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from('documents')
        .getPublicUrl(filePath);

      const fileUrl = publicUrlData.publicUrl;

      // Save document record in the DB
      const { error: dbError } = await supabase
        .from('documents')
        .insert([
          {
            name: newPhoto.name || compressedFile.name,
            category: 'Progress Photos',
            project_id: targetProjectId,
            size_mb: (compressedFile.size / (1024 * 1024)).toFixed(2),
            file_type: 'Image',
            file_url: fileUrl
          }
        ]);

      if (dbError) throw dbError;

      alert('Progress photo compressed and uploaded successfully!');
      setIsUploadModalOpen(false);
      setNewPhoto({ file: null, name: '', project_id: '' });
      fetchPhotos();
    } catch (error) {
      console.error('Error uploading progress photo:', error.message);
      alert('Upload failed: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDeletePhoto = async (photo) => {
    if (!window.confirm('Are you sure you want to delete this progress photo? This action cannot be undone.')) {
      return;
    }

    try {
      setLoading(true);
      
      // Attempt to extract the storage path from the URL
      // E.g., http://.../storage/v1/object/public/documents/project_id/photos/filename
      if (photo.file_url && photo.file_url !== '#') {
        const parts = photo.file_url.split('/storage/v1/object/public/documents/');
        if (parts.length > 1) {
          const storagePath = parts[1];
          const { error: storageError } = await supabase.storage
            .from('documents')
            .remove([storagePath]);
          
          if (storageError) {
            console.warn('Could not delete file from storage bucket:', storageError.message);
          }
        }
      }

      // Delete database record
      const { error: dbError } = await supabase
        .from('documents')
        .delete()
        .eq('id', photo.id);

      if (dbError) throw dbError;

      alert('Photo deleted successfully.');
      setActivePhoto(null);
      fetchPhotos();
    } catch (error) {
      console.error('Error deleting photo:', error.message);
      alert('Delete failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {/* Header Panel */}
      <div className="content-card glass" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Camera size={24} color="var(--primary-color)" />
              <span>Project Progress Photos</span>
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
              Upload and track the visual timeline and milestones of construction progress.
            </p>
          </div>
          
          <button 
            className="btn btn-primary"
            onClick={() => {
              setNewPhoto({
                file: null,
                name: '',
                project_id: (activeProjectId && activeProjectId !== 'all') ? activeProjectId : ''
              });
              setIsUploadModalOpen(true);
            }}
          >
            <Plus size={18} />
            <span>Upload Photo</span>
          </button>
        </div>
      </div>

      {/* Main Grid Area */}
      {loading && photos.length === 0 ? (
        <div className="glass" style={{ padding: '4rem 2rem', borderRadius: '1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          <Loader2 size={36} className="animate-spin" style={{ margin: '0 auto 1rem', color: 'var(--primary-color)' }} />
          <p>Loading progress photos...</p>
        </div>
      ) : photos.length === 0 ? (
        <div className="glass" style={{
          padding: '5rem 2rem',
          borderRadius: '1rem',
          textAlign: 'center',
          border: '1px dashed var(--border-color)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1rem'
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'rgba(59, 130, 246, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--primary-color)'
          }}>
            <ImageIcon size={32} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.25rem', color: '#fff', fontWeight: '600' }}>No progress photos found</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', maxWidth: '400px', margin: '0.5rem auto 0' }}>
              {activeProjectId === 'all' 
                ? "No photos have been uploaded to any project yet. Choose a project or click Upload Photo to begin."
                : "No progress photos have been uploaded for this project yet. Start compiling your visual history today."
              }
            </p>
          </div>
          <button 
            className="btn btn-secondary"
            style={{ marginTop: '0.5rem' }}
            onClick={() => setIsUploadModalOpen(true)}
          >
            <Upload size={16} />
            <span>Upload First Photo</span>
          </button>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '2rem',
          paddingBottom: '2rem'
        }}>
          {photos.map(photo => (
            <div 
              key={photo.id}
              className="glass"
              style={{
                borderRadius: '1rem',
                overflow: 'hidden',
                border: '1px solid var(--border-color)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                display: 'flex',
                flexDirection: 'column',
                cursor: 'pointer',
                position: 'relative'
              }}
              onClick={() => setActivePhoto(photo)}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.boxShadow = '0 12px 30px rgba(0, 0, 0, 0.4), 0 0 15px rgba(59, 130, 246, 0.1)';
                e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.borderColor = 'var(--border-color)';
              }}
            >
              {/* Photo Area */}
              <div style={{ 
                width: '100%', 
                height: '200px', 
                backgroundColor: '#10141d',
                position: 'relative',
                overflow: 'hidden',
                borderBottom: '1px solid var(--border-color)'
              }}>
                <img 
                  src={photo.file_url} 
                  alt={photo.name}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    transition: 'transform 0.5s ease'
                  }}
                  onMouseEnter={(e) => e.target.style.transform = 'scale(1.08)'}
                  onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=600&q=80';
                  }}
                />
                
                {/* Visual Eye Overlay on Hover */}
                <div style={{
                  position: 'absolute',
                  top: 0, left: 0, right: 0, bottom: 0,
                  backgroundColor: 'rgba(5, 5, 5, 0.4)',
                  opacity: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'opacity 0.3s ease',
                  pointerEvents: 'none'
                }}
                className="photo-overlay"
                >
                  <div style={{
                    padding: '0.75rem',
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.1)',
                    backdropFilter: 'blur(4px)',
                    color: '#fff'
                  }}>
                    <Eye size={22} />
                  </div>
                </div>
              </div>

              {/* Photo Details */}
              <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', flexGrow: 1 }}>
                <div>
                  <h4 style={{ 
                    fontSize: '1.1rem', 
                    fontWeight: '600', 
                    color: '#fff',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {photo.name}
                  </h4>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    File size: {photo.size_mb} MB
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '0.75rem', marginTop: 'auto' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    <Calendar size={14} color="var(--primary-color)" />
                    <span>{new Date(photo.created_at).toLocaleDateString()}</span>
                  </div>
                  {activeProjectId === 'all' && photo.projects && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      <MapPin size={14} color="var(--secondary-color)" />
                      <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {photo.projects.name}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {isUploadModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(5px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000
        }}>
          <div className="content-card glass" style={{ width: '480px', padding: '2rem', border: '1px solid var(--border-color)', boxShadow: '0 24px 50px rgba(0,0,0,0.5)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Camera size={20} color="var(--primary-color)" />
                <span>Upload Progress Photo</span>
              </h2>
              <button 
                onClick={() => setIsUploadModalOpen(false)} 
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '0.25rem' }}
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Drag and Drop Zone */}
              <div 
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                style={{
                  width: '100%',
                  height: '160px',
                  borderRadius: '0.75rem',
                  border: `2px dashed ${dragActive ? 'var(--primary-color)' : newPhoto.file ? 'var(--secondary-color)' : 'var(--border-color)'}`,
                  background: dragActive ? 'rgba(59, 130, 246, 0.05)' : newPhoto.file ? 'rgba(16, 185, 129, 0.03)' : 'rgba(255, 255, 255, 0.01)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  padding: '1rem',
                  textAlign: 'center',
                  position: 'relative',
                  transition: 'all 0.2s ease'
                }}
                onClick={() => document.getElementById('photo-file-input').click()}
              >
                <input 
                  id="photo-file-input"
                  type="file" 
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handleFileChange}
                />
                
                {newPhoto.file ? (
                  <>
                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--secondary-color)', marginBottom: '0.5rem' }}>
                      <ImageIcon size={24} />
                    </div>
                    <span style={{ fontSize: '0.85rem', color: '#fff', fontWeight: '500', maxWidth: '280px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {newPhoto.file.name}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                      {(newPhoto.file.size / (1024 * 1024)).toFixed(2)} MB - Click or drag to replace
                    </span>
                  </>
                ) : (
                  <>
                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(59, 130, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-color)', marginBottom: '0.5rem' }}>
                      <Upload size={24} />
                    </div>
                    <span style={{ fontSize: '0.875rem', color: '#fff', fontWeight: '500' }}>
                      Drag and drop your photo here, or <span style={{ color: 'var(--primary-color)', textDecoration: 'underline' }}>browse</span>
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                      Supports JPEG, PNG, WEBP up to 10MB
                    </span>
                  </>
                )}
              </div>

              {/* Title Input */}
              <div className="form-group">
                <label className="form-label">Photo Description / Milestone</label>
                <input 
                  type="text" 
                  className="form-input" 
                  required 
                  value={newPhoto.name}
                  onChange={(e) => setNewPhoto({ ...newPhoto, name: e.target.value })}
                  placeholder="e.g. Pouring foundations, drywall finished"
                />
              </div>

              {/* Project selector if in All Projects mode */}
              {(!activeProjectId || activeProjectId === 'all') ? (
                <div className="form-group">
                  <label className="form-label">Associated Project</label>
                  <select 
                    className="form-input" 
                    required
                    value={newPhoto.project_id}
                    onChange={(e) => setNewPhoto({ ...newPhoto, project_id: e.target.value })}
                  >
                    <option value="">Select a project...</option>
                    {projects.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
              ) : null}

              {/* Buttons */}
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  style={{ flex: 1, justifyContent: 'center' }} 
                  onClick={() => setIsUploadModalOpen(false)}
                  disabled={uploading}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary" 
                  style={{ flex: 1, justifyContent: 'center' }}
                  disabled={uploading || !newPhoto.file}
                >
                  {uploading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Uploading...</span>
                    </>
                  ) : (
                    <span>Upload Photo</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lightbox / Preview Modal */}
      {activePhoto && (
        <div 
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(5, 5, 10, 0.92)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 1100,
            padding: '1.5rem'
          }}
          onClick={() => setActivePhoto(null)}
        >
          {/* Lightbox Controls */}
          <div 
            style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              width: '100%', 
              maxWidth: '1200px', 
              margin: '0 auto 1rem',
              color: '#fff',
              zIndex: 2
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '700' }}>{activePhoto.name}</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <Calendar size={14} color="var(--primary-color)" />
                  {new Date(activePhoto.created_at).toLocaleDateString()}
                </span>
                {activePhoto.projects && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <MapPin size={14} color="var(--secondary-color)" />
                    {activePhoto.projects.name}
                  </span>
                )}
                <span>Size: {activePhoto.size_mb} MB</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              {/* Download */}
              <a 
                href={activePhoto.file_url} 
                download={activePhoto.name}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary"
                style={{ padding: '0.6rem', background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }}
                title="Download image"
              >
                <Download size={18} />
              </a>

              {/* Delete */}
              <button 
                className="btn btn-secondary"
                style={{ padding: '0.6rem', color: 'var(--danger-color)', border: '1px solid rgba(239, 68, 68, 0.2)', background: 'rgba(239, 68, 68, 0.05)' }}
                onClick={() => handleDeletePhoto(activePhoto)}
                title="Delete Photo"
              >
                <Trash2 size={18} />
              </button>

              {/* Close */}
              <button 
                className="btn btn-secondary"
                style={{ padding: '0.6rem', background: 'rgba(255,255,255,0.1)', color: '#fff', border: 'none' }}
                onClick={() => setActivePhoto(null)}
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Large Image Frame */}
          <div 
            style={{ 
              flex: 1, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              width: '100%',
              maxWidth: '1200px',
              margin: '0 auto',
              position: 'relative',
              overflow: 'hidden'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <img 
              src={activePhoto.file_url} 
              alt={activePhoto.name}
              style={{
                maxWidth: '100%',
                maxHeight: '80vh',
                objectFit: 'contain',
                borderRadius: '0.5rem',
                boxShadow: '0 20px 60px rgba(0,0,0,0.8), 0 0 40px rgba(59, 130, 246, 0.15)'
              }}
              onError={(e) => {
                e.target.src = 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=1200&q=80';
              }}
            />
          </div>
        </div>
      )}

      {/* Global CSS Inject to support visual overlays and animations */}
      <style>{`
        .photo-overlay {
          display: flex !important;
          opacity: 0 !important;
        }
        div[key]:hover .photo-overlay {
          opacity: 1 !important;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default Photos;
