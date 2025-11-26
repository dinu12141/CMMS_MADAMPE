import React, { useState, useRef, useEffect } from 'react';
import Header from '../components/Header';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import {
  Plus, 
  FileText,
  Download,
  Eye,
  Calendar,
  User,
  FolderOpen,
  Upload,
  X,
  Printer,
  Loader2,
  Edit
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
// Remove mock data import
import { documentsApi } from '../services/api';

const Documents = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingDocument, setEditingDocument] = useState(null);
  const [uploadForm, setUploadForm] = useState({
    name: '',
    description: '',
    category: '',
    relatedTo: '',
    expiryDate: '',
    tags: ''
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  // Required document categories
  const documentCategories = [
    'RCA',
    'Preventive Maintenance',
    'License & Certification',
    'Stack Commission',
    'Daily records',
    'Quotation',
    'Brakedown Report'
  ];

  // Load documents on component mount
  useEffect(() => {
    loadDocuments();
  }, []);

  // Reload documents when filters change
  useEffect(() => {
    loadDocuments();
  }, [searchTerm, categoryFilter]);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const filters = {};
      if (categoryFilter !== 'all') {
        filters.category = categoryFilter;
      }
      if (searchTerm) {
        filters.search = searchTerm;
      }
      const docs = await documentsApi.getAll(filters);
      setDocuments(docs);
    } catch (error) {
      console.error('Error loading documents:', error);
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredDocuments = documents; // Filtering is now done on the backend

  const getFileTypeColor = (type) => {
    switch (type.toLowerCase()) {
      case 'pdf': return 'bg-red-100 text-red-700';
      case 'doc': case 'docx': return 'bg-blue-100 text-blue-700';
      case 'xls': case 'xlsx': return 'bg-green-100 text-green-700';
      case 'jpg': case 'png': return 'bg-purple-100 text-purple-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUploadFormChange = (field, value) => {
    setUploadForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!uploadForm.name || !uploadForm.category) {
      alert('Please fill in all required fields');
      return;
    }
    
    // In edit mode, file is optional
    if (!isEditMode && !selectedFile) {
      alert('Please select a file');
      return;
    }

    try {
      setUploading(true);
      
      if (isEditMode) {
        // Update existing document (without file)
        const updateData = {
          name: uploadForm.name,
          description: uploadForm.description,
          category: uploadForm.category,
          relatedTo: uploadForm.relatedTo || '',
          expiryDate: uploadForm.expiryDate || '',
          tags: uploadForm.tags ? uploadForm.tags.split(',').map(tag => tag.trim()) : []
        };
        
        await documentsApi.update(editingDocument._id || editingDocument.id, updateData);
        
        // Reset form
        setUploadForm({
          name: '',
          description: '',
          category: '',
          relatedTo: '',
          expiryDate: '',
          tags: ''
        });
        setSelectedFile(null);
        setShowUploadModal(false);
        setIsEditMode(false);
        setEditingDocument(null);
        
        // Reload documents
        await loadDocuments();
        
        alert('Document updated successfully!');
      } else {
        // Create new document with file upload
        if (!selectedFile) {
          alert('Please select a file');
          return;
        }
        
        // Create FormData object for file upload
        const formData = new FormData();
        formData.append('name', uploadForm.name);
        formData.append('description', uploadForm.description);
        formData.append('category', uploadForm.category);
        formData.append('relatedTo', uploadForm.relatedTo || '');
        formData.append('expiryDate', uploadForm.expiryDate || '');
        formData.append('tags', uploadForm.tags || '');
        formData.append('file', selectedFile);
        
        // Upload document
        await documentsApi.upload(formData);
        
        // Reset form
        setUploadForm({
          name: '',
          description: '',
          category: '',
          relatedTo: '',
          expiryDate: '',
          tags: ''
        });
        setSelectedFile(null);
        setShowUploadModal(false);
        
        // Reload documents
        await loadDocuments();
        
        alert('Document uploaded successfully!');
      }
    } catch (error) {
      console.error('Error saving document:', error);
      alert('Error saving document: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current.click();
  };

  const removeSelectedFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleViewDocument = async (document) => {
    try {
      // Open document in a new tab using the view endpoint
      const documentId = document._id || document.id;
      const viewUrl = `http://localhost:8000/api/documents/${documentId}/view`;
      window.open(viewUrl, '_blank');
    } catch (error) {
      console.error('Error viewing document:', error);
      alert('Error viewing document: ' + error.message);
    }
  };

  const handleDownloadDocument = async (document) => {
    try {
      const documentId = document._id || document.id;
      const downloadUrl = `http://localhost:8000/api/documents/${documentId}/download`;
      // Create a temporary link and trigger download
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = document.fileName || document.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading document:', error);
      alert('Error downloading document: ' + error.message);
    }
  };

  const handlePrintDocument = async (document) => {
    try {
      const documentId = document._id || document.id;
      const viewUrl = `http://localhost:8000/api/documents/${documentId}/view`;
      
      // Open in a new window for printing
      const printWindow = window.open(viewUrl, '_blank');
      // Note: We can't directly call window.print() here because it's a different origin
      // The user will need to manually print from the new window
    } catch (error) {
      console.error('Error preparing document for print:', error);
      alert('Error preparing document for print: ' + error.message);
    }
  };

  const handleEditDocument = (doc) => {
    // Set edit mode
    setIsEditMode(true);
    setEditingDocument(doc);
    
    // Populate form with existing document data
    setUploadForm({
      name: doc.name || '',
      description: doc.description || '',
      category: doc.category || '',
      relatedTo: doc.relatedTo || '',
      expiryDate: doc.expiryDate ? doc.expiryDate.split('T')[0] : '', // Format date for input
      tags: Array.isArray(doc.tags) ? doc.tags.join(', ') : (doc.tags || '')
    });
    
    // Clear any previously selected file
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    
    // Show the modal
    setShowUploadModal(true);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header 
        title="Document Management" 
        subtitle="Store and manage maintenance documents, manuals, and certifications"
      />
      
      <div className="p-8">
        {/* Actions Bar */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Input
              type="text"
              placeholder="Search documents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-80"
            />
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => {
            // Reset form for new document
            setIsEditMode(false);
            setEditingDocument(null);
            setUploadForm({
              name: '',
              description: '',
              category: '',
              relatedTo: '',
              expiryDate: '',
              tags: ''
            });
            setSelectedFile(null);
            if (fileInputRef.current) {
              fileInputRef.current.value = '';
            }
            setShowUploadModal(true);
          }}>
            <Plus className="w-4 h-4 mr-2" />
            Upload Document
          </Button>
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 mb-6">
          <Select value={categoryFilter} onValueChange={(value) => setCategoryFilter(value)}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Documents</SelectItem>
              {documentCategories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Loading indicator */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        )}

        {/* Documents Grid */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDocuments.map((doc) => (
              <Card key={doc._id || doc.id} className="hover:shadow-lg transition-all duration-200">
                <CardContent className="p-4">
                  <div className="grid grid-cols-1 gap-3">
                    {/* Document Name and File Type */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-2">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                          <FileText className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-900 text-sm mb-1">{doc.name}</h3>
                          <Badge className={`${getFileTypeColor(doc.fileType)} text-xs px-1.5 py-0.5`}>
                            {doc.fileType?.toUpperCase() || 'FILE'}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {/* Document Details Grid */}
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <p className="text-slate-500">Category</p>
                        <p className="font-medium text-slate-900 truncate">{doc.category}</p>
                      </div>
                      {doc.relatedTo && (
                        <div>
                          <p className="text-slate-500">Related To</p>
                          <p className="font-medium text-slate-900 truncate">{doc.relatedTo}</p>
                        </div>
                      )}
                      <div>
                        <p className="text-slate-500">Size</p>
                        <p className="font-medium text-slate-900">{formatFileSize(doc.fileSize || 0)}</p>
                      </div>
                      {doc.expiryDate && (
                        <div>
                          <p className="text-slate-500">Expires</p>
                          <p className="font-medium text-slate-900">
                            {new Date(doc.expiryDate).toLocaleDateString()}
                          </p>
                        </div>
                      )}
                      <div>
                        <p className="text-slate-500">Uploaded By</p>
                        <p className="font-medium text-slate-900 truncate">{doc.uploadedBy || 'Unknown'}</p>
                      </div>
                      <div>
                        <p className="text-slate-500">Date</p>
                        <p className="font-medium text-slate-900">
                          {doc.uploadedDate ? new Date(doc.uploadedDate).toLocaleDateString() : 'Unknown'}
                        </p>
                      </div>
                    </div>

                    {/* Description */}
                    {doc.description && (
                      <div className="pt-1">
                        <p className="text-xs text-slate-600 line-clamp-2">{doc.description}</p>
                      </div>
                    )}
                  </div>

                  {/* Action Bar - 2x2 Grid Layout */}
                  <div className="grid grid-cols-2 gap-2 mt-4">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-8 text-xs"
                      onClick={() => handleViewDocument(doc)}
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      View
                    </Button>
                    <Button 
                      size="sm" 
                      className="h-8 text-xs bg-blue-600 hover:bg-blue-700"
                      onClick={() => handleDownloadDocument(doc)}
                    >
                      <Download className="w-3 h-3 mr-1" />
                      Download
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-8 text-xs"
                      onClick={() => handlePrintDocument(doc)}
                    >
                      <Printer className="w-3 h-3 mr-1" />
                      Print
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-8 text-xs"
                      onClick={() => handleEditDocument(doc)}
                    >
                      <Edit className="w-3 h-3 mr-1" />
                      Edit
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!loading && filteredDocuments.length === 0 && (
          <div className="text-center py-12">
            <FolderOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">No documents found matching your criteria.</p>
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Upload Document</h2>
                <button 
                  onClick={() => setShowUploadModal(false)}
                  className="text-slate-500 hover:text-slate-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleUploadSubmit}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Document Name *
                    </label>
                    <Input
                      type="text"
                      value={uploadForm.name}
                      onChange={(e) => handleUploadFormChange('name', e.target.value)}
                      placeholder="Enter document name"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Description
                    </label>
                    <Textarea
                      value={uploadForm.description}
                      onChange={(e) => handleUploadFormChange('description', e.target.value)}
                      placeholder="Enter document description"
                      rows={3}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Category * <span className="text-xs text-slate-500">(Selected: {uploadForm.category || 'None'})</span>
                    </label>
                    <select
                      value={uploadForm.category}
                      onChange={(e) => handleUploadFormChange('category', e.target.value)}
                      className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Select a category</option>
                      {documentCategories.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Related To
                    </label>
                    <Input
                      type="text"
                      value={uploadForm.relatedTo}
                      onChange={(e) => handleUploadFormChange('relatedTo', e.target.value)}
                      placeholder="Related asset, work order, etc."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Expiry Date
                    </label>
                    <Input
                      type="date"
                      value={uploadForm.expiryDate}
                      onChange={(e) => handleUploadFormChange('expiryDate', e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Tags
                    </label>
                    <Input
                      type="text"
                      value={uploadForm.tags}
                      onChange={(e) => handleUploadFormChange('tags', e.target.value)}
                      placeholder="Comma separated tags"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      File {isEditMode ? '' : '*'}
                    </label>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      className="hidden"
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.png"
                      disabled={isEditMode} // Disable file selection in edit mode
                    />
                    <div className="border-2 border-dashed border-slate-300 rounded-lg p-4 text-center">
                      {selectedFile ? (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-600 truncate">
                            {selectedFile.name}
                          </span>
                          <button 
                            type="button"
                            onClick={removeSelectedFile}
                            className="text-slate-500 hover:text-slate-700"
                            disabled={isEditMode} // Disable file removal in edit mode
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : isEditMode ? (
                        <div className="text-sm text-slate-500">
                          File cannot be changed in edit mode. Current file: {editingDocument?.fileName || 'Unknown'}
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={triggerFileSelect}
                          className="text-blue-600 hover:text-blue-800 flex flex-col items-center w-full"
                          disabled={isEditMode} // Disable file selection in edit mode
                        >
                          <Upload className="w-6 h-6 mx-auto mb-1" />
                          <span className="text-sm">Click to select file</span>
                          <span className="text-xs text-slate-500 mt-1">
                            PDF, DOC, XLS, JPG, PNG files allowed
                          </span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      setShowUploadModal(false);
                      setIsEditMode(false);
                      setEditingDocument(null);
                    }}
                    className="flex-1"
                    disabled={uploading}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                    disabled={uploading}
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        {isEditMode ? 'Updating...' : 'Uploading...'}
                      </>
                    ) : (
                      isEditMode ? 'Update Document' : 'Upload Document'
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Documents;