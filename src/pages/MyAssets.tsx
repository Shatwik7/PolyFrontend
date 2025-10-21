import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Edit, Eye, Download, Heart, Search, Plus, Grid, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { apiService } from '@/services/api';
import { Asset } from '@/types/api';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export default function MyAssets() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'created_at' | 'likes' | 'downloads'>('created_at');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedAssets, setSelectedAssets] = useState<Set<string>>(new Set());
  const [deletingAssets, setDeletingAssets] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const loadAssets = async () => {
      try {
        setLoading(true);
        const { assets } = await apiService.getAssets({ 
          creator_id: user.id,
          sort: sortBy,
          order: 'desc',
          limit: 100
        });
        setAssets(assets);
      } catch (error) {
        console.error('Failed to load assets:', error);
        toast({
          title: "Error",
          description: "Failed to load your assets.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadAssets();
  }, [user, sortBy, navigate, toast]);

  const filteredAssets = assets.filter(asset =>
    asset.file_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    asset.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    asset.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleSelectAsset = (assetId: string, checked: boolean) => {
    const newSelected = new Set(selectedAssets);
    if (checked) {
      newSelected.add(assetId);
    } else {
      newSelected.delete(assetId);
    }
    setSelectedAssets(newSelected);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedAssets(new Set(filteredAssets.map(asset => asset.id)));
    } else {
      setSelectedAssets(new Set());
    }
  };

  const handleDeleteAsset = async (assetId: string) => {
    setDeletingAssets(prev => new Set(prev).add(assetId));
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setAssets(prev => prev.filter(asset => asset.id !== assetId));
      setSelectedAssets(prev => {
        const newSelected = new Set(prev);
        newSelected.delete(assetId);
        return newSelected;
      });
      
      toast({
        title: "Asset deleted",
        description: "Asset has been successfully deleted.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete asset.",
        variant: "destructive",
      });
    } finally {
      setDeletingAssets(prev => {
        const newDeleting = new Set(prev);
        newDeleting.delete(assetId);
        return newDeleting;
      });
    }
  };

  const handleBulkDelete = async () => {
    const assetIds = Array.from(selectedAssets);
    setDeletingAssets(new Set(assetIds));
    
    try {
      // Simulate API calls
      await Promise.all(
        assetIds.map(() => new Promise(resolve => setTimeout(resolve, 500)))
      );
      
      setAssets(prev => prev.filter(asset => !selectedAssets.has(asset.id)));
      setSelectedAssets(new Set());
      
      toast({
        title: "Assets deleted",
        description: `${assetIds.length} assets have been successfully deleted.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete some assets.",
        variant: "destructive",
      });
    } finally {
      setDeletingAssets(new Set());
    }
  };

  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-8">
          <div className="h-8 bg-muted rounded w-1/3" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-64 bg-muted rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">My Assets</h1>
        <p className="text-muted-foreground">
          Manage your uploaded 3D assets ({assets.length} total)
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-col lg:flex-row gap-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search your assets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <div className="flex gap-2">
          <Select value={sortBy} onValueChange={(value: 'created_at' | 'likes' | 'downloads') => setSortBy(value)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="created_at">Latest</SelectItem>
              <SelectItem value="likes">Most Liked</SelectItem>
              <SelectItem value="downloads">Most Downloaded</SelectItem>
            </SelectContent>
          </Select>
          
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="icon"
            onClick={() => setViewMode('grid')}
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="icon"
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Bulk Actions */}
      {filteredAssets.length > 0 && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 p-4 bg-muted/30 rounded-lg">
          <div className="flex items-center gap-4">
            <Checkbox
              checked={selectedAssets.size === filteredAssets.length && filteredAssets.length > 0}
              onCheckedChange={handleSelectAll}
            />
            <span className="text-sm">
              {selectedAssets.size > 0 
                ? `${selectedAssets.size} of ${filteredAssets.length} selected`
                : `Select all ${filteredAssets.length} assets`
              }
            </span>
          </div>
          
          <div className="flex gap-2">
            <Button asChild>
              <Link to="/upload">
                <Plus className="h-4 w-4 mr-2" />
                Upload New
              </Link>
            </Button>
            
            {selectedAssets.size > 0 && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Selected ({selectedAssets.size})
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Assets</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete {selectedAssets.size} asset(s)? 
                      This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleBulkDelete}>
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </div>
      )}

      {/* Assets Grid/List */}
      {filteredAssets.length > 0 ? (
        <div className={`grid gap-6 ${
          viewMode === 'grid' 
            ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
            : 'grid-cols-1'
        }`}>
          {filteredAssets.map((asset) => (
            <Card key={asset.id} className="group relative">
              <div className="absolute top-2 left-2 z-10">
                <Checkbox
                  checked={selectedAssets.has(asset.id)}
                  onCheckedChange={(checked) => handleSelectAsset(asset.id, checked as boolean)}
                  className="bg-background"
                />
              </div>
              
              <CardContent className="p-0">
                <div className="aspect-square bg-muted relative overflow-hidden rounded-t-lg">
                  {asset.thumbnail_url ? (
                    <img 
                      src={asset.thumbnail_url} 
                      alt={asset.file_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-4xl font-bold text-muted-foreground">
                        {asset.file_format.toUpperCase()}
                      </div>
                    </div>
                  )}
                  
                  {/* Overlay Actions */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button size="sm" variant="secondary" asChild>
                      <Link to={`/asset/${asset.id}`}>
                        <Eye className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button size="sm" variant="secondary">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button 
                          size="sm" 
                          variant="destructive"
                          disabled={deletingAssets.has(asset.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Asset</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete "{asset.file_name}"? 
                            This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => handleDeleteAsset(asset.id)}
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
                
                <div className="p-4">
                  <h3 className="font-semibold mb-2 line-clamp-1">
                    {asset.file_name.replace(/\.[^/.]+$/, "")}
                  </h3>
                  
                  <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <Heart className="h-3 w-3" />
                        {asset.likes}
                      </div>
                      <div className="flex items-center gap-1">
                        <Download className="h-3 w-3" />
                        {asset.downloads}
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {asset.file_format.toUpperCase()}
                    </Badge>
                  </div>
                  
                  {asset.tags && asset.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {asset.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {asset.tags.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{asset.tags.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}
                  
                  <p className="text-xs text-muted-foreground">
                    {new Date(asset.created_at).toLocaleDateString()}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-muted-foreground mb-4">
            {searchQuery 
              ? `No assets found matching "${searchQuery}"`
              : "You haven't uploaded any assets yet."
            }
          </div>
          {!searchQuery && (
            <Button asChild>
              <Link to="/upload">
                <Plus className="h-4 w-4 mr-2" />
                Upload Your First Asset
              </Link>
            </Button>
          )}
        </div>
      )}
    </div>
  );
}