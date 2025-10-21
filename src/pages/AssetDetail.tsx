import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Heart, Download, Calendar, File, Tag, MessageCircle, Share2, Eye, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
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
import { ModelViewer } from '@/components/3d/ModelViewer';
import { apiService } from '@/services/api';
import { Asset, Comment } from '@/types/api';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export default function AssetDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [asset, setAsset] = useState<Asset | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [commentLoading, setCommentLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const loadAssetData = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const [assetData, commentsData] = await Promise.all([
          apiService.getAsset(id),
          apiService.getComments(id)
        ]);
        setAsset(assetData);
        setComments(commentsData);
      } catch (error) {
        console.error('Failed to load asset:', error);
        toast({
          title: "Error",
          description: "Failed to load asset details.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadAssetData();
  }, [id, toast]);

  const handleLike = async () => {
    if (!asset || !user) {
      toast({
        title: "Authentication required",
        description: "Please log in to like assets.",
        variant: "destructive",
      });
      return;
    }

    try {
      await apiService.likeAsset(asset.id);
      setAsset(prev => prev ? {
        ...prev,
        likes: prev.user_liked ? prev.likes - 1 : prev.likes + 1,
        user_liked: !prev.user_liked
      } : prev);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to like asset.",
        variant: "destructive",
      });
    }
  };

  const handleDownload = async () => {
    if (!asset || !user) {
      toast({
        title: "Authentication required",
        description: "Please log in to download assets.",
        variant: "destructive",
      });
      return;
    }

    try {
      await apiService.downloadAsset(asset.id);
      setAsset(prev => prev ? { ...prev, downloads: prev.downloads + 1 } : prev);
      toast({
        title: "Download started",
        description: "Your download will begin shortly.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download asset.",
        variant: "destructive",
      });
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!asset || !user || !newComment.trim()) return;

    try {
      setCommentLoading(true);
      const comment = await apiService.addComment(asset.id, newComment.trim());
      setComments(prev => [comment, ...prev]);
      setNewComment('');
      toast({
        title: "Comment added",
        description: "Your comment has been posted successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add comment.",
        variant: "destructive",
      });
    } finally {
      setCommentLoading(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: asset?.file_name,
          text: asset?.description,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Share cancelled');
      }
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copied",
        description: "Asset link copied to clipboard.",
      });
    }
  };

  const handleDeleteAsset = async () => {
    if (!asset) return;
    
    try {
      // Simulate API call for deletion
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Asset deleted",
        description: "Your asset has been successfully deleted.",
      });
      
      navigate('/my-assets');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete asset.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-8">
          <div className="h-8 bg-muted rounded w-1/3" />
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="aspect-square bg-muted rounded-lg" />
            <div className="space-y-4">
              <div className="h-6 bg-muted rounded" />
              <div className="h-4 bg-muted rounded w-2/3" />
              <div className="h-20 bg-muted rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!asset) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Asset Not Found</h1>
        <p className="text-muted-foreground mb-4">The asset you're looking for doesn't exist.</p>
        <Button asChild>
          <Link to="/explore">Browse Assets</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="mb-8 text-sm text-muted-foreground">
        <Link to="/" className="hover:text-primary transition-smooth">Home</Link>
        <span className="mx-2">/</span>
        <Link to="/explore" className="hover:text-primary transition-smooth">Explore</Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">{asset.file_name}</span>
      </nav>

      {/* Main Content */}
      <div className="grid lg:grid-cols-2 gap-8 mb-12">
        {/* 3D Viewer */}
        <div className="space-y-4">
          <ModelViewer 
            modelUrl={asset.file_url}
            className="w-full h-96 lg:h-[500px]"
            autoRotate={false}
          />
          
          {/* Viewer Controls */}
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Eye className="h-4 w-4 mr-2" />
              Fullscreen
            </Button>
            <Button variant="outline" size="sm">
              Reset View
            </Button>
          </div>
        </div>

        {/* Asset Details */}
        <div className="space-y-6">
          {/* Title and Actions */}
          <div>
            <h1 className="text-3xl font-bold mb-2">
              {asset.file_name.replace(/\.[^/.]+$/, "")}
            </h1>
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Heart className="h-4 w-4" />
                <span>{asset.likes}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Download className="h-4 w-4" />
                <span>{asset.downloads}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>{new Date(asset.created_at).toLocaleDateString()}</span>
              </div>
            </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2 mb-6">
            <Button 
              variant="hero" 
              onClick={handleDownload}
              disabled={!user}
              className="flex-1 sm:flex-initial"
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
            <Button 
              variant={asset.user_liked ? "default" : "outline"}
              onClick={handleLike}
              disabled={!user}
            >
              <Heart className={`h-4 w-4 mr-2 ${asset.user_liked ? "fill-current" : ""}`} />
              {asset.user_liked ? "Liked" : "Like"}
            </Button>
            <Button variant="outline" onClick={handleShare}>
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
            
            {/* Delete button for asset owner */}
            {user && asset.creator_id === user.id && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Asset</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete this asset? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteAsset}>
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
          </div>

          {/* Description */}
          {asset.description && (
            <div>
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-muted-foreground leading-relaxed">
                {asset.description}
              </p>
            </div>
          )}

          {/* Tags */}
          {asset.tags && asset.tags.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {asset.tags.map((tag) => (
                  <Badge key={tag} variant="outline">
                    <Tag className="h-3 w-3 mr-1" />
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* File Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">File Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Format:</span>
                <Badge variant="secondary">{asset.file_format.toUpperCase()}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">File Name:</span>
                <span className="font-mono text-sm">{asset.file_name}</span>
              </div>
              {asset.metadata && Object.entries(asset.metadata).map(([key, value]) => (
                <div key={key} className="flex justify-between">
                  <span className="text-muted-foreground capitalize">{key}:</span>
                  <span>{value}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Creator Info */}
          {asset.creator && (
            <Card>
              <CardContent className="p-6">
                <Link 
                  to={`/profile/${asset.creator.id}`}
                  className="flex items-center space-x-3 group"
                >
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={asset.creator.profile_picture_url} />
                    <AvatarFallback>
                      {asset.creator.username[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="font-semibold group-hover:text-primary transition-smooth">
                      {asset.creator.full_name || asset.creator.username}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      @{asset.creator.username}
                    </p>
                    {asset.creator.bio && (
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {asset.creator.bio}
                      </p>
                    )}
                  </div>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Comments Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Comments ({comments.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Add Comment */}
          {user ? (
            <form onSubmit={handleAddComment} className="space-y-4">
              <Textarea
                placeholder="Share your thoughts about this asset..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                rows={3}
              />
              <Button 
                type="submit" 
                disabled={!newComment.trim() || commentLoading}
              >
                {commentLoading ? "Posting..." : "Post Comment"}
              </Button>
            </form>
          ) : (
            <div className="text-center py-6 bg-muted/30 rounded-lg">
              <p className="text-muted-foreground mb-4">Please log in to post comments</p>
              <Button asChild>
                <Link to="/login">Log In</Link>
              </Button>
            </div>
          )}

          {/* Comments List */}
          <div className="space-y-4">
            {comments.length > 0 ? (
              comments.map((comment) => (
                <div key={comment.id} className="border-b border-border pb-4 last:border-0">
                  <div className="flex items-start space-x-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={comment.user?.profile_picture_url} />
                      <AvatarFallback>
                        {comment.user?.username[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Link 
                          to={`/profile/${comment.user?.id}`}
                          className="font-semibold text-sm hover:text-primary transition-smooth"
                        >
                          {comment.user?.username}
                        </Link>
                        <span className="text-xs text-muted-foreground">
                          {new Date(comment.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {comment.content}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <MessageCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No comments yet. Be the first to share your thoughts!</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}