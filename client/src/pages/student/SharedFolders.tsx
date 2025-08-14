import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Folder, FileText, User, Calendar, Eye, Download } from "lucide-react";

interface SharedFolder {
  id: number;
  name: string;
  description: string | null;
  teacherName: string;
  createdAt: string;
  documentsCount: number;
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

export default function SharedFolders() {
  const [selectedFolder, setSelectedFolder] = useState<SharedFolder | null>(null);

  // Fetch shared folders for the student
  const { data: sharedFolders = [], isLoading: foldersLoading } = useQuery<SharedFolder[]>({
    queryKey: ['/api/student/shared-folders']
  });

  // Fetch documents for selected folder
  const { data: documents = [] } = useQuery<FolderDocument[]>({
    queryKey: ['/api/teacher/folders', selectedFolder?.id, 'documents'],
    enabled: !!selectedFolder?.id
  });

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return 'Unknown size';
    
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const getFileIcon = (fileType: string | null) => {
    if (!fileType) return <FileText className="h-5 w-5 text-gray-600" />;
    
    if (fileType.includes('image')) return <FileText className="h-5 w-5 text-green-600" />;
    if (fileType.includes('pdf')) return <FileText className="h-5 w-5 text-red-600" />;
    if (fileType.includes('video')) return <FileText className="h-5 w-5 text-purple-600" />;
    if (fileType.includes('audio')) return <FileText className="h-5 w-5 text-orange-600" />;
    return <FileText className="h-5 w-5 text-blue-600" />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Shared Learning Materials</h1>
          <p className="text-gray-600">Access learning materials shared by your teachers</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Shared Folders List */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Folder className="h-5 w-5" />
                  Shared Folders
                </CardTitle>
              </CardHeader>
              <CardContent>
                {foldersLoading ? (
                  <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-20 bg-gray-100 rounded-md animate-pulse" />
                    ))}
                  </div>
                ) : sharedFolders.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    <Folder className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No shared folders</p>
                    <p className="text-sm">Your teachers haven't shared any materials yet</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {sharedFolders.map((folder) => (
                      <div
                        key={folder.id}
                        className={`p-3 rounded-md border cursor-pointer transition-colors ${
                          selectedFolder?.id === folder.id
                            ? 'bg-blue-50 border-blue-200'
                            : 'bg-white border-gray-200 hover:bg-gray-50'
                        }`}
                        onClick={() => setSelectedFolder(folder)}
                        data-testid={`shared-folder-item-${folder.id}`}
                      >
                        <div className="flex items-start gap-2">
                          <Folder className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-sm truncate">{folder.name}</h3>
                            {folder.description && (
                              <p className="text-xs text-gray-500 line-clamp-2 mt-1">
                                {folder.description}
                              </p>
                            )}
                            
                            <div className="flex items-center gap-2 mt-2">
                              <div className="flex items-center gap-1">
                                <User className="h-3 w-3 text-gray-400" />
                                <span className="text-xs text-gray-600">{folder.teacherName}</span>
                              </div>
                            </div>
                            
                            <div className="flex items-center justify-between mt-2">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3 text-gray-400" />
                                <span className="text-xs text-gray-500">
                                  {new Date(folder.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                              <Badge variant="secondary" className="text-xs">
                                {folder.documentsCount} files
                              </Badge>
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

          {/* Folder Contents */}
          <div className="lg:col-span-2">
            {selectedFolder ? (
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Folder className="h-5 w-5 text-blue-600" />
                        {selectedFolder.name}
                      </CardTitle>
                      {selectedFolder.description && (
                        <CardDescription className="mt-1">
                          {selectedFolder.description}
                        </CardDescription>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        Teacher: {selectedFolder.teacherName}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        Shared: {new Date(selectedFolder.createdAt).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-1">
                        <FileText className="h-4 w-4" />
                        {selectedFolder.documentsCount} documents
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      <h3 className="font-medium mb-3">Learning Materials</h3>
                      {documents.length === 0 ? (
                        <div className="text-center text-gray-500 py-8">
                          <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                          <p>No documents available</p>
                          <p className="text-sm">This folder doesn't contain any materials yet</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {documents.map((document) => (
                            <Card 
                              key={document.id} 
                              className="hover:shadow-md transition-shadow"
                              data-testid={`document-card-${document.id}`}
                            >
                              <CardContent className="p-4">
                                <div className="flex items-start gap-3">
                                  {getFileIcon(document.fileType)}
                                  <div className="flex-1 min-w-0">
                                    <h4 className="font-medium text-sm line-clamp-2 mb-1">
                                      {document.name}
                                    </h4>
                                    <div className="space-y-1">
                                      {document.fileType && (
                                        <Badge variant="outline" className="text-xs">
                                          {document.fileType.split('/').pop()?.toUpperCase()}
                                        </Badge>
                                      )}
                                      <p className="text-xs text-gray-500">
                                        {formatFileSize(document.fileSize)}
                                      </p>
                                      <p className="text-xs text-gray-500">
                                        Uploaded {new Date(document.uploadedAt).toLocaleDateString()}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="flex gap-2 mt-3">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex-1"
                                    onClick={() => window.open(document.fileUrl, '_blank')}
                                    data-testid={`button-view-${document.id}`}
                                  >
                                    <Eye className="h-4 w-4 mr-1" />
                                    View
                                  </Button>
                                  <Button
                                    variant="default"
                                    size="sm"
                                    className="flex-1"
                                    onClick={() => {
                                      const link = document.createElement('a');
                                      link.href = document.fileUrl;
                                      link.download = document.name;
                                      link.target = '_blank';
                                      link.click();
                                    }}
                                    data-testid={`button-download-${document.id}`}
                                  >
                                    <Download className="h-4 w-4 mr-1" />
                                    Access
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>
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
                    Select a shared folder from the left to view the learning materials
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