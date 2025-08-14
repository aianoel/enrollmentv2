import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Folder, FileText, Share2, Plus, Upload, Eye, Calendar, Users } from "lucide-react";

interface TeacherFolder {
  id: number;
  name: string;
  description: string | null;
  teacherId: number;
  createdAt: string;
}

interface FolderDocument {
  id: number;
  folderId: number;
  name: string;
  fileUrl: string;
  fileType: string | null;
  fileSize: number | null;
  uploadedAt: string;
}

interface Section {
  id: number;
  name: string;
  gradeLevel: string;
}

export default function FolderManagement() {
  const [selectedFolder, setSelectedFolder] = useState<TeacherFolder | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [newFolderDescription, setNewFolderDescription] = useState("");
  const [selectedSections, setSelectedSections] = useState<number[]>([]);
  const [newDocumentName, setNewDocumentName] = useState("");
  const [newDocumentUrl, setNewDocumentUrl] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch teacher folders
  const { data: folders = [], isLoading: foldersLoading } = useQuery<TeacherFolder[]>({
    queryKey: ['/api/teacher/folders']
  });

  // Fetch sections for sharing
  const { data: sections = [] } = useQuery<Section[]>({
    queryKey: ['/api/teacher/sections']
  });

  // Fetch documents for selected folder
  const { data: documents = [] } = useQuery<FolderDocument[]>({
    queryKey: ['/api/teacher/folders', selectedFolder?.id, 'documents'],
    enabled: !!selectedFolder?.id
  });

  // Create folder mutation
  const createFolderMutation = useMutation({
    mutationFn: async (data: { name: string; description: string }) => {
      return apiRequest('/api/teacher/folders', 'POST', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/teacher/folders'] });
      setShowCreateDialog(false);
      setNewFolderName("");
      setNewFolderDescription("");
      toast({
        title: "Success",
        description: "Folder created successfully"
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create folder",
        variant: "destructive"
      });
    }
  });

  // Share folder mutation
  const shareFolderMutation = useMutation({
    mutationFn: async (data: { folderId: number; sectionIds: number[] }) => {
      return apiRequest(`/api/teacher/folders/${data.folderId}/share`, 'POST', { sectionIds: data.sectionIds });
    },
    onSuccess: () => {
      setShowShareDialog(false);
      setSelectedSections([]);
      toast({
        title: "Success",
        description: "Folder shared successfully"
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to share folder",
        variant: "destructive"
      });
    }
  });

  // Upload document mutation
  const uploadDocumentMutation = useMutation({
    mutationFn: async (data: { folderId: number; name: string; fileUrl: string }) => {
      return apiRequest(`/api/teacher/folders/${data.folderId}/documents`, 'POST', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ['/api/teacher/folders', selectedFolder?.id, 'documents'] 
      });
      setShowUploadDialog(false);
      setNewDocumentName("");
      setNewDocumentUrl("");
      toast({
        title: "Success",
        description: "Document uploaded successfully"
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to upload document",
        variant: "destructive"
      });
    }
  });

  const handleCreateFolder = () => {
    if (!newFolderName.trim()) return;
    createFolderMutation.mutate({
      name: newFolderName,
      description: newFolderDescription
    });
  };

  const handleShareFolder = () => {
    if (!selectedFolder || selectedSections.length === 0) return;
    shareFolderMutation.mutate({
      folderId: selectedFolder.id,
      sectionIds: selectedSections
    });
  };

  const handleUploadDocument = () => {
    if (!selectedFolder || !newDocumentName.trim() || !newDocumentUrl.trim()) return;
    uploadDocumentMutation.mutate({
      folderId: selectedFolder.id,
      name: newDocumentName,
      fileUrl: newDocumentUrl
    });
  };

  const handleSectionToggle = (sectionId: number) => {
    setSelectedSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Learning Materials Manager</h1>
          <p className="text-gray-600">Create folders, upload documents, and share learning materials with your sections</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Folders List */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center gap-2">
                    <Folder className="h-5 w-5" />
                    My Folders
                  </CardTitle>
                  <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                    <DialogTrigger asChild>
                      <Button size="sm" data-testid="button-create-folder">
                        <Plus className="h-4 w-4 mr-1" />
                        New
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Create New Folder</DialogTitle>
                        <DialogDescription>
                          Create a new folder to organize your learning materials
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium">Folder Name</label>
                          <Input
                            value={newFolderName}
                            onChange={(e) => setNewFolderName(e.target.value)}
                            placeholder="Enter folder name"
                            data-testid="input-folder-name"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Description (Optional)</label>
                          <Textarea
                            value={newFolderDescription}
                            onChange={(e) => setNewFolderDescription(e.target.value)}
                            placeholder="Enter folder description"
                            data-testid="input-folder-description"
                          />
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                            Cancel
                          </Button>
                          <Button 
                            onClick={handleCreateFolder}
                            disabled={createFolderMutation.isPending}
                            data-testid="button-save-folder"
                          >
                            {createFolderMutation.isPending ? "Creating..." : "Create"}
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {foldersLoading ? (
                  <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-16 bg-gray-100 rounded-md animate-pulse" />
                    ))}
                  </div>
                ) : folders.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    <Folder className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No folders yet</p>
                    <p className="text-sm">Create your first folder to get started</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {folders.map((folder) => (
                      <div
                        key={folder.id}
                        className={`p-3 rounded-md border cursor-pointer transition-colors ${
                          selectedFolder?.id === folder.id
                            ? 'bg-green-50 border-green-200'
                            : 'bg-white border-gray-200 hover:bg-gray-50'
                        }`}
                        onClick={() => setSelectedFolder(folder)}
                        data-testid={`folder-item-${folder.id}`}
                      >
                        <div className="flex items-start gap-2">
                          <Folder className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-sm truncate">{folder.name}</h3>
                            {folder.description && (
                              <p className="text-xs text-gray-500 line-clamp-2 mt-1">
                                {folder.description}
                              </p>
                            )}
                            <div className="flex items-center gap-1 mt-2">
                              <Calendar className="h-3 w-3 text-gray-400" />
                              <span className="text-xs text-gray-500">
                                {new Date(folder.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Folder Details */}
          <div className="lg:col-span-2">
            {selectedFolder ? (
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Folder className="h-5 w-5 text-green-600" />
                        {selectedFolder.name}
                      </CardTitle>
                      {selectedFolder.description && (
                        <CardDescription className="mt-1">
                          {selectedFolder.description}
                        </CardDescription>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" data-testid="button-share-folder">
                            <Share2 className="h-4 w-4 mr-1" />
                            Share
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Share Folder with Sections</DialogTitle>
                            <DialogDescription>
                              Select the sections you want to share this folder with
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            {sections.length === 0 ? (
                              <p className="text-gray-500">No sections available</p>
                            ) : (
                              <div className="space-y-2 max-h-60 overflow-y-auto">
                                {sections.map((section) => (
                                  <div key={section.id} className="flex items-center space-x-2">
                                    <Checkbox
                                      id={`section-${section.id}`}
                                      checked={selectedSections.includes(section.id)}
                                      onCheckedChange={() => handleSectionToggle(section.id)}
                                      data-testid={`checkbox-section-${section.id}`}
                                    />
                                    <label 
                                      htmlFor={`section-${section.id}`}
                                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                    >
                                      {section.name} ({section.gradeLevel})
                                    </label>
                                  </div>
                                ))}
                              </div>
                            )}
                            <div className="flex justify-end gap-2">
                              <Button variant="outline" onClick={() => setShowShareDialog(false)}>
                                Cancel
                              </Button>
                              <Button 
                                onClick={handleShareFolder}
                                disabled={shareFolderMutation.isPending || selectedSections.length === 0}
                                data-testid="button-confirm-share"
                              >
                                {shareFolderMutation.isPending ? "Sharing..." : "Share"}
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>

                      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
                        <DialogTrigger asChild>
                          <Button size="sm" data-testid="button-upload-document">
                            <Upload className="h-4 w-4 mr-1" />
                            Upload
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Upload Document</DialogTitle>
                            <DialogDescription>
                              Add a new document to this folder
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <label className="text-sm font-medium">Document Name</label>
                              <Input
                                value={newDocumentName}
                                onChange={(e) => setNewDocumentName(e.target.value)}
                                placeholder="Enter document name"
                                data-testid="input-document-name"
                              />
                            </div>
                            <div>
                              <label className="text-sm font-medium">File URL</label>
                              <Input
                                value={newDocumentUrl}
                                onChange={(e) => setNewDocumentUrl(e.target.value)}
                                placeholder="Enter file URL (e.g., Google Drive link)"
                                data-testid="input-document-url"
                              />
                            </div>
                            <div className="flex justify-end gap-2">
                              <Button variant="outline" onClick={() => setShowUploadDialog(false)}>
                                Cancel
                              </Button>
                              <Button 
                                onClick={handleUploadDocument}
                                disabled={uploadDocumentMutation.isPending}
                                data-testid="button-save-document"
                              >
                                {uploadDocumentMutation.isPending ? "Uploading..." : "Upload"}
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        Created: {new Date(selectedFolder.createdAt).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-1">
                        <FileText className="h-4 w-4" />
                        {documents.length} documents
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      <h3 className="font-medium mb-3">Documents</h3>
                      {documents.length === 0 ? (
                        <div className="text-center text-gray-500 py-8">
                          <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                          <p>No documents yet</p>
                          <p className="text-sm">Upload your first document to get started</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {documents.map((document) => (
                            <div
                              key={document.id}
                              className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
                              data-testid={`document-item-${document.id}`}
                            >
                              <div className="flex items-center gap-3">
                                <FileText className="h-5 w-5 text-blue-600" />
                                <div>
                                  <h4 className="font-medium text-sm">{document.name}</h4>
                                  <p className="text-xs text-gray-500">
                                    Uploaded {new Date(document.uploadedAt).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => window.open(document.fileUrl, '_blank')}
                                data-testid={`button-view-document-${document.id}`}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <Folder className="h-16 w-16 text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No folder selected</h3>
                  <p className="text-gray-500 text-center">
                    Select a folder from the left to view its contents and manage documents
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}