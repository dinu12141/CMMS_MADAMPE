import React, { useState } from 'react';
import Header from '../components/Header';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { 
  Plus, 
  FileText,
  Download,
  Eye,
  Calendar,
  User,
  FolderOpen,
  Upload
} from 'lucide-react';
import { documents } from '../mockData';

const Documents = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const categories = ['all', ...new Set(documents.map(d => d.category))];

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
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Upload className="w-4 h-4 mr-2" />
            Upload Document
          </Button>
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {categories.map((category) => (
            <Button
              key={category}
              variant={categoryFilter === category ? 'default' : 'outline'}
              onClick={() => setCategoryFilter(category)}
              className="capitalize whitespace-nowrap"
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
                    <Badge variant="outline" className="capitalize">{doc.category}</Badge>
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
    </div>
  );
};

export default Documents;
