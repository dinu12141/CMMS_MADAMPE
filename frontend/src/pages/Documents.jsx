import React, { useState, useRef } from 'react';
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
  Printer
} from 'lucide-react';
import { documents } from '../mockData';

const Documents = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    name: '',
    description: '',
    category: '',
    relatedTo: '',
    expiryDate: '',
    tags: ''
  });
  const [selectedFile, setSelectedFile] = useState(null);
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

  const categories = ['all', ...documentCategories];

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          doc.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || doc.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

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
    if (!uploadForm.name || !uploadForm.category || !selectedFile) {
      alert('Please fill in all required fields and select a file');
      return;
    }

    // In a real app, this would be an API call to upload the document
    console.log('Uploading document with selected category:', {
      ...uploadForm,
      file: selectedFile
    });

    // Reset form
    setUploadForm({
      name: '',
      description: '',
      category: '',  // Reset category selection
      relatedTo: '',
      expiryDate: '',
      tags: ''
    });
    setSelectedFile(null);
    setShowUploadModal(false);
    alert(`Document uploaded successfully with category: ${uploadForm.category}!`);
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

  const handlePrintDocument = (document) => {
    // In a real app, this would open a print dialog for the document
    console.log('Printing document:', document);
    window.print();
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
          <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => setShowUploadModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Upload Document
          </Button>
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          <Button
            key="all"
            variant={categoryFilter === 'all' ? 'default' : 'outline'}
            onClick={() => setCategoryFilter('all')}
            className={`capitalize whitespace-nowrap ${categoryFilter === 'all' ? 'ring-2 ring-blue-500' : ''}`}
          >
            All Documents
          </Button>
          {documentCategories.map((category) => (
            <Button
              key={category}
              variant={categoryFilter === category ? 'default' : 'outline'}
              onClick={() => setCategoryFilter(category)}
              className={`capitalize whitespace-nowrap ${categoryFilter === category ? 'ring-2 ring-blue-500' : ''}`}
            >
              {category}
            </Button>
          ))}
        </div>

        {/* Documents Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDocuments.map((doc) => (
            <Card key={doc.id} className="hover:shadow-lg transition-all duration-200">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FileText className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-slate-900 mb-1 truncate">{doc.name}</h3>
                      <Badge className={getFileTypeColor(doc.fileType)}>
                        {doc.fileType.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                </div>

                <p className="text-sm text-slate-600 mb-4 line-clamp-2">{doc.description}</p>

                <div className="space-y-2 mb-4 pb-4 border-b border-slate-200">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">Category</span>
                    <Badge variant="outline" className="capitalize font-bold">{doc.category}</Badge>
                  </div>
                  {doc.relatedTo && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500">Related To</span>
                      <span className="font-medium text-slate-900">{doc.relatedTo}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">Size</span>
                    <span className="font-medium text-slate-900">{formatFileSize(doc.fileSize)}</span>
                  </div>
                </div>

                <div className="space-y-2 text-sm mb-4">
                  <div className="flex items-center gap-2 text-slate-600">
                    <User className="w-4 h-4" />
                    <span>Uploaded by {doc.uploadedBy}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(doc.uploadedDate).toLocaleDateString()}</span>
                  </div>
                  {doc.expiryDate && (
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-orange-500" />
                      <span className="text-orange-600 font-medium">
                        Expires: {new Date(doc.expiryDate).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Eye className="w-4 h-4 mr-1" />
                    View
                  </Button>
                  <Button size="sm" className="flex-1 bg-blue-600 hover:bg-blue-700">
                    <Download className="w-4 h-4 mr-1" />
                    Download
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => handlePrintDocument(doc)}
                  >
                    <Printer className="w-4 h-4 mr-1" />
                    Print
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredDocuments.length === 0 && (
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
                      File *
                    </label>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      className="hidden"
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.png"
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
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={triggerFileSelect}
                          className="text-blue-600 hover:text-blue-800 flex flex-col items-center w-full"
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
                    onClick={() => setShowUploadModal(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                  >
                    Upload Document
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