import React, { useState, useEffect } from 'react';
import { File, Download, Upload, X, Filter } from 'lucide-react';
import { supabase } from '../supabaseClient';

const Documents = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterCategory, setFilterCategory] = useState('All');
  const [files, setFiles] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [newDoc, setNewDoc] = useState({
    file: null,
    category: '',
    project_id: ''
  });

  useEffect(() => {
    fetchDocuments();
    fetchProjects();
  }, []);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('documents')
        .select(`
          *,
          projects ( name )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) setFiles(data);
    } catch (error) {
      console.error('Error fetching documents:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchProjects = async () => {
    const { data } = await supabase.from('projects').select('id, name');
    if (data) setProjects(data);
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!newDoc.file || !newDoc.category || !newDoc.project_id) return;

    try {
      setLoading(true);
      let fileUrl = '#';
      
      // Attempt to upload to Supabase Storage (bucket 'documents')
      // NOTE: Ensure you have created a public bucket named 'documents' in Supabase
      const fileExt = newDoc.file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${newDoc.project_id}/${fileName}`;

      const { error: uploadError, data: uploadData } = await supabase.storage
        .from('documents')
        .upload(filePath, newDoc.file);

      if (!uploadError) {
        const { data: publicUrlData } = supabase.storage
          .from('documents')
          .getPublicUrl(filePath);
        fileUrl = publicUrlData.publicUrl;
      } else {
        console.warn('Storage upload failed (bucket might not exist). Saving metadata only.', uploadError.message);
      }

      // Save document metadata
      const { error } = await supabase
        .from('documents')
        .insert([
          { 
            name: newDoc.file.name, 
            category: newDoc.category,
            project_id: newDoc.project_id,
            size_mb: (newDoc.file.size / (1024 * 1024)).toFixed(2),
            file_type: newDoc.file.type.includes('pdf') ? 'PDF' : newDoc.file.type.includes('image') ? 'Image' : 'Other',
            file_url: fileUrl
          }
        ]);

      if (error) throw error;
      
      alert(uploadError ? 'Document metadata saved. (Storage upload failed - please check "documents" bucket)' : 'Document uploaded successfully!');
      setIsModalOpen(false);
      setNewDoc({ file: null, category: '', project_id: '' });
      fetchDocuments(); // Refresh list
    } catch (error) {
      console.error('Error uploading:', error.message);
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const categories = ['All', 'Estimates', 'Invoices', 'Purchases', 'Sales', 'Contracts', 'Blueprints', 'Other'];

  const filteredFiles = filterCategory === 'All' 
    ? files 
    : files.filter(f => f.category === filterCategory);

  return (
    <div className="documents-container" style={{ position: 'relative' }}>
      <div className="content-card glass">
        <div className="card-header">
          <h2>Document Management</h2>
          <div className="header-actions">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginRight: '1rem' }}>
              <Filter size={18} color="var(--text-muted)" />
              <select 
                className="form-input" 
                style={{ padding: '0.5rem', width: 'auto' }}
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
              <Upload size={18} />
              <span>Upload File</span>
            </button>
          </div>
        </div>

        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading documents...</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>File Name</th>
                <th>Category</th>
                <th>Project</th>
                <th>Size (MB)</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredFiles.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No documents found.</td>
                </tr>
              ) : (
                filteredFiles.map(file => (
                  <tr key={file.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ padding: '0.5rem', backgroundColor: 'var(--surface-hover)', borderRadius: '0.5rem' }}>
                          <File size={20} color={
                            file.file_type === 'PDF' ? 'var(--danger-color)' : 
                            file.file_type === 'Excel' ? 'var(--secondary-color)' : 'var(--primary-color)'
                          } />
                        </div>
                        <span style={{ fontWeight: 500 }}>{file.name}</span>
                      </div>
                    </td>
                    <td>
                      <span className="badge" style={{ backgroundColor: 'var(--surface-hover)', color: 'var(--text-main)' }}>
                        {file.category}
                      </span>
                    </td>
                    <td>{file.projects?.name}</td>
                    <td style={{ color: 'var(--text-muted)' }}>{file.size_mb} MB</td>
                    <td style={{ color: 'var(--text-muted)' }}>{new Date(file.created_at).toLocaleDateString()}</td>
                    <td>
                      {file.file_url && file.file_url !== '#' ? (
                        <a href={file.file_url} target="_blank" rel="noopener noreferrer" className="btn btn-secondary" style={{ padding: '0.5rem', display: 'inline-flex', textDecoration: 'none' }}>
                          <Download size={18} />
                        </a>
                      ) : (
                        <button className="btn btn-secondary" style={{ padding: '0.5rem', opacity: 0.5, cursor: 'not-allowed' }} title="No file URL available">
                          <Download size={18} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Upload Modal */}
      {isModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000
        }}>
          <div className="content-card glass" style={{ width: '450px', padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.25rem' }}>Upload New Document</h2>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit}>
              <div className="form-group">
                <label className="form-label">File</label>
                <input 
                  type="file" 
                  className="form-input" 
                  required 
                  onChange={(e) => setNewDoc({...newDoc, file: e.target.files[0]})}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Document Category</label>
                <select 
                  className="form-input" 
                  required
                  value={newDoc.category}
                  onChange={(e) => setNewDoc({...newDoc, category: e.target.value})}
                >
                  <option value="">Select type...</option>
                  <option value="Estimates">Estimate</option>
                  <option value="Invoices">Invoice</option>
                  <option value="Purchases">Purchase Order</option>
                  <option value="Sales">Sales Receipt</option>
                  <option value="Contracts">Contract</option>
                  <option value="Blueprints">Technical Blueprints</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Related Project</label>
                <select 
                  className="form-input" 
                  required
                  value={newDoc.project_id}
                  onChange={(e) => setNewDoc({...newDoc, project_id: e.target.value})}
                >
                  <option value="">Select project...</option>
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                <button type="button" className="btn btn-secondary" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
                  <Upload size={18} /> Upload
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Documents;
