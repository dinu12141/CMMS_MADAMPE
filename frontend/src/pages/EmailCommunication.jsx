import React, { useState } from 'react';
import Header from '../components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';
import { 
  Mail, 
  Send, 
  User, 
  Users, 
  Clock,
  CheckCircle,
  AlertCircle,
  FileText
} from 'lucide-react';

const EmailCommunication = () => {
  const [emailForm, setEmailForm] = useState({
    to: '',
    subject: '',
    message: '',
    attachments: []
  });

  const [sentEmails] = useState([
    {
      id: 1,
      to: 'john.smith@company.com',
      subject: 'Work Order WO-001 Update',
      date: '2025-01-20 14:30',
      status: 'sent'
    },
    {
      id: 2,
      to: 'mike.chen@company.com',
      subject: 'Preventive Maintenance Schedule',
      date: '2025-01-19 10:15',
      status: 'sent'
    },
    {
      id: 3,
      to: 'sarah.johnson@company.com',
      subject: 'Monthly Maintenance Report',
      date: '2025-01-18 16:45',
      status: 'sent'
    },
    {
      id: 4,
      to: 'tom.wilson@company.com',
      subject: 'Urgent: Equipment Repair Required',
      date: '2025-01-18 09:20',
      status: 'sent'
    }
  ]);

  const [draftEmails] = useState([
    {
      id: 1,
      to: 'maintenance.team@company.com',
      subject: 'Weekly Maintenance Meeting',
      date: '2025-01-20 11:30',
      status: 'draft'
    }
  ]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEmailForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSendEmail = () => {
    if (emailForm.to && emailForm.subject && emailForm.message) {
      alert('Email sent successfully!');
      setEmailForm({
        to: '',
        subject: '',
        message: '',
        attachments: []
      });
    } else {
      alert('Please fill in all required fields.');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'sent': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header 
        title="Email Communication" 
        subtitle="Send and manage internal communications"
      />
      
      <div className="p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Email Composition */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg">Compose New Email</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <Label htmlFor="to">To *</Label>
                  <Input
                    id="to"
                    name="to"
                    value={emailForm.to}
                    onChange={handleInputChange}
                    placeholder="recipient@company.com"
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="subject">Subject *</Label>
                  <Input
                    id="subject"
                    name="subject"
                    value={emailForm.subject}
                    onChange={handleInputChange}
                    placeholder="Enter email subject"
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="message">Message *</Label>
                  <Textarea
                    id="message"
                    name="message"
                    value={emailForm.message}
                    onChange={handleInputChange}
                    placeholder="Write your message here..."
                    rows={8}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label>Attachments</Label>
                  <div className="mt-2 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 border-dashed rounded-lg">
                    <div className="space-y-1 text-center">
                      <FileText className="mx-auto h-12 w-12 text-slate-400" />
                      <div className="flex text-sm text-slate-600">
                        <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500">
                          <span>Upload a file</span>
                          <input type="file" className="sr-only" />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-slate-500">PDF, DOC, JPG up to 10MB</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <Button onClick={handleSendEmail} className="bg-blue-600 hover:bg-blue-700">
                    <Send className="w-4 h-4 mr-2" />
                    Send Email
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Email Statistics and Recent Emails */}
          <div className="space-y-6">
            {/* Email Statistics */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Email Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Send className="w-4 h-4 text-blue-600" />
                      <span className="text-sm text-slate-600">Sent Today</span>
                    </div>
                    <span className="font-bold text-slate-900">12</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-yellow-600" />
                      <span className="text-sm text-slate-600">Pending</span>
                    </div>
                    <span className="font-bold text-slate-900">3</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-slate-600">Delivered</span>
                    </div>
                    <span className="font-bold text-slate-900">142</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-red-600" />
                      <span className="text-sm text-slate-600">Failed</span>
                    </div>
                    <span className="font-bold text-slate-900">1</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Sent Emails */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recently Sent</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {sentEmails.map((email) => (
                    <div key={email.id} className="p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-900 truncate">{email.subject}</p>
                          <p className="text-xs text-slate-600 mt-1 truncate">{email.to}</p>
                          <p className="text-xs text-slate-500 mt-1">{email.date}</p>
                        </div>
                        <Badge className={getStatusColor(email.status)}>{email.status}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Draft Emails */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Drafts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {draftEmails.map((email) => (
                    <div key={email.id} className="p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-900 truncate">{email.subject}</p>
                          <p className="text-xs text-slate-600 mt-1 truncate">{email.to}</p>
                          <p className="text-xs text-slate-500 mt-1">{email.date}</p>
                        </div>
                        <Badge className={getStatusColor(email.status)}>{email.status}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailCommunication;