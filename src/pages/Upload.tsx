import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload as UploadIcon, File, X, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

const SUPPORTED_FORMATS = ['glb', 'gltf', 'obj'];
const SUGGESTED_TAGS = [
  'character', 'environment', 'prop', 'vehicle', 'weapon', 'furniture',
  'building', 'nature', 'fantasy', 'sci-fi', 'realistic', 'lowpoly',
  'textured', 'rigged', 'animated'
];

export default function Upload() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    file: null as File | null,
    fileName: '',
    description: '',
    tags: [] as string[],
    fileFormat: '' as 'glb' | 'gltf' | 'obj' | '',
    isPublic: true
  });
  const [newTag, setNewTag] = useState('');
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Authentication Required</h1>
        <p className="text-muted-foreground mb-4">Please log in to upload assets.</p>
        <Button onClick={() => navigate('/login')}>Log In</Button>
      </div>
    );
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (file: File) => {
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    
    if (!fileExtension || !SUPPORTED_FORMATS.includes(fileExtension)) {
      toast({
        title: "Invalid file format",
        description: `Please select a file with one of these formats: ${SUPPORTED_FORMATS.join(', ')}`,
        variant: "destructive",
      });
      return;
    }

    setFormData(prev => ({
      ...prev,
      file,
      fileName: file.name,
      fileFormat: fileExtension as 'glb' | 'gltf' | 'obj'
    }));
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim().toLowerCase())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim().toLowerCase()]
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSuggestedTagClick = (tag: string) => {
    if (!formData.tags.includes(tag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.file || !formData.fileName.trim()) {
      toast({
        title: "Missing information",
        description: "Please select a file and provide a name.",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    
    try {
      // Simulate file upload and asset creation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Upload successful",
        description: "Your asset has been uploaded successfully!",
      });
      
      navigate('/my-assets');
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "There was an error uploading your asset. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Upload 3D Asset</h1>
        <p className="text-muted-foreground">
          Share your 3D creations with the community. Supported formats: GLB, GLTF, OBJ
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* File Upload */}
        <Card>
          <CardHeader>
            <CardTitle>Select File</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive 
                  ? 'border-primary bg-primary/5' 
                  : 'border-border hover:border-primary/50'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              {formData.file ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-center">
                    <File className="h-12 w-12 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{formData.file.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {(formData.file.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setFormData(prev => ({ ...prev, file: null, fileName: '', fileFormat: '' }))}
                  >
                    Choose Different File
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-center">
                    <UploadIcon className="h-12 w-12 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-lg font-medium mb-2">
                      Drag and drop your 3D file here
                    </p>
                    <p className="text-muted-foreground mb-4">
                      or click to browse files
                    </p>
                    <input
                      type="file"
                      id="file-upload"
                      className="hidden"
                      accept=".glb,.gltf,.obj"
                      onChange={handleFileInputChange}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById('file-upload')?.click()}
                    >
                      Browse Files
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Supported formats: GLB, GLTF, OBJ (Max 100MB)
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Asset Details */}
        <Card>
          <CardHeader>
            <CardTitle>Asset Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="fileName">Asset Name *</Label>
                <Input
                  id="fileName"
                  value={formData.fileName}
                  onChange={(e) => setFormData(prev => ({ ...prev, fileName: e.target.value }))}
                  placeholder="Enter asset name..."
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="fileFormat">File Format</Label>
                <Select
                  value={formData.fileFormat}
                  onValueChange={(value: 'glb' | 'gltf' | 'obj') => 
                    setFormData(prev => ({ ...prev, fileFormat: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select format" />
                  </SelectTrigger>
                  <SelectContent>
                    {SUPPORTED_FORMATS.map((format) => (
                      <SelectItem key={format} value={format}>
                        {format.toUpperCase()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe your 3D asset, its intended use, and any special features..."
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        {/* Tags */}
        <Card>
          <CardHeader>
            <CardTitle>Tags</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Current Tags */}
            {formData.tags.length > 0 && (
              <div className="space-y-2">
                <Label>Current Tags</Label>
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                      {tag}
                      <X
                        className="h-3 w-3 cursor-pointer hover:text-destructive"
                        onClick={() => handleRemoveTag(tag)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Add New Tag */}
            <div className="space-y-2">
              <Label htmlFor="newTag">Add Tag</Label>
              <div className="flex gap-2">
                <Input
                  id="newTag"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Enter a tag..."
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                />
                <Button type="button" onClick={handleAddTag} disabled={!newTag.trim()}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Suggested Tags */}
            <div className="space-y-2">
              <Label>Suggested Tags</Label>
              <div className="flex flex-wrap gap-2">
                {SUGGESTED_TAGS.filter(tag => !formData.tags.includes(tag)).map((tag) => (
                  <Badge
                    key={tag}
                    variant="outline"
                    className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-smooth"
                    onClick={() => handleSuggestedTagClick(tag)}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Visibility Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Visibility</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isPublic"
                checked={formData.isPublic}
                onCheckedChange={(checked) => 
                  setFormData(prev => ({ ...prev, isPublic: checked as boolean }))
                }
              />
              <Label htmlFor="isPublic" className="cursor-pointer">
                Make this asset public (visible to all users)
              </Label>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Private assets are only visible to you and can be made public later.
            </p>
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => navigate(-1)}>
            Cancel
          </Button>
          <Button type="submit" disabled={uploading || !formData.file}>
            {uploading ? "Uploading..." : "Upload Asset"}
          </Button>
        </div>
      </form>
    </div>
  );
}