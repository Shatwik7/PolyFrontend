import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Download, Eye, MoreVertical } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Asset } from '@/types/api';
import { useAuth } from '@/hooks/useAuth';
import { apiService } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

interface AssetCardProps {
  asset: Asset;
  onLike?: (assetId: string) => void;
  onDownload?: (assetId: string) => void;
}

export const AssetCard = ({ asset, onLike, onDownload }: AssetCardProps) => {
  const [isLiked, setIsLiked] = useState(asset.user_liked || false);
  const [likes, setLikes] = useState(asset.likes);
  const [downloads, setDownloads] = useState(asset.downloads);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to like assets.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      await apiService.likeAsset(asset.id);
      setIsLiked(!isLiked);
      setLikes(prev => isLiked ? prev - 1 : prev + 1);
      onLike?.(asset.id);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to like asset. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to download assets.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      await apiService.downloadAsset(asset.id);
      setDownloads(prev => prev + 1);
      onDownload?.(asset.id);
      toast({
        title: "Download started",
        description: "Your download will begin shortly.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download asset. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="group overflow-hidden transition-smooth hover:shadow-card hover:shadow-glow/20 gradient-card border-border/50">
      <Link to={`/asset/${asset.id}`}>
        <div className="relative aspect-square overflow-hidden">
          <img
            src={asset.thumbnail_url || asset.preview_url}
            alt={asset.file_name}
            className="w-full h-full object-cover transition-smooth group-hover:scale-105"
          />
          
          {/* Format badge */}
          <Badge 
            variant="secondary" 
            className="absolute top-2 left-2 bg-background/80 backdrop-blur-sm"
          >
            {asset.file_format.toUpperCase()}
          </Badge>

          {/* Quick actions overlay */}
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-smooth flex items-center justify-center">
            <Button variant="secondary" size="sm" className="bg-background/90 backdrop-blur-sm">
              <Eye className="h-4 w-4 mr-2" />
              View Details
            </Button>
          </div>
        </div>
      </Link>

      <CardContent className="p-4">
        {/* Asset title */}
        <Link to={`/asset/${asset.id}`}>
          <h3 className="font-semibold text-lg mb-2 line-clamp-1 hover:text-primary transition-smooth">
            {asset.file_name.replace(/\.[^/.]+$/, "")}
          </h3>
        </Link>

        {/* Description */}
        {asset.description && (
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
            {asset.description}
          </p>
        )}

        {/* Tags */}
        {asset.tags && asset.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {asset.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
            {asset.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{asset.tags.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* Creator info */}
        {asset.creator && (
          <Link 
            to={`/profile/${asset.creator.id}`}
            className="flex items-center space-x-2 mb-3 group/creator"
          >
            <Avatar className="h-6 w-6">
              <AvatarImage src={asset.creator.profile_picture_url} />
              <AvatarFallback className="text-xs">
                {asset.creator.username[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm text-muted-foreground group-hover/creator:text-primary transition-smooth">
              {asset.creator.username}
            </span>
          </Link>
        )}

        {/* Stats and actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            <span className="flex items-center space-x-1">
              <Heart className="h-4 w-4" />
              <span>{likes}</span>
            </span>
            <span className="flex items-center space-x-1">
              <Download className="h-4 w-4" />
              <span>{downloads}</span>
            </span>
          </div>

          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              disabled={isLoading}
              className={isLiked ? "text-red-500 hover:text-red-600" : ""}
            >
              <Heart className={`h-4 w-4 ${isLiked ? "fill-current" : ""}`} />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDownload}
              disabled={isLoading}
            >
              <Download className="h-4 w-4" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Share</DropdownMenuItem>
                <DropdownMenuItem>Report</DropdownMenuItem>
                <DropdownMenuItem>Add to Collection</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};