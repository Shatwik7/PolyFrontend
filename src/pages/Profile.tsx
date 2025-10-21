import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, MapPin, Globe, Edit2, Mail, Grid, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AssetCard } from '@/components/assets/AssetCard';
import { apiService } from '@/services/api';
import { Asset, User } from '@/types/api';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export default function Profile() {
  const { id } = useParams<{ id: string }>();
  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [userAssets, setUserAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const { user: currentUser } = useAuth();
  const { toast } = useToast();

  const isOwnProfile = currentUser && profileUser && currentUser.id === profileUser.id;

  useEffect(() => {
    const loadProfileData = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const [userData, assetsData] = await Promise.all([
          apiService.getUser(id),
          apiService.getAssets({ creator_id: id, limit: 50 })
        ]);
        setProfileUser(userData);
        setUserAssets(assetsData.assets);
      } catch (error) {
        console.error('Failed to load profile:', error);
        toast({
          title: "Error",
          description: "Failed to load profile data.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadProfileData();
  }, [id, toast]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-8">
          <div className="flex items-center space-x-4">
            <div className="h-24 w-24 bg-muted rounded-full" />
            <div className="space-y-2">
              <div className="h-6 bg-muted rounded w-48" />
              <div className="h-4 bg-muted rounded w-32" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-64 bg-muted rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">User Not Found</h1>
        <p className="text-muted-foreground mb-4">The user you're looking for doesn't exist.</p>
        <Button asChild>
          <Link to="/explore">Browse Assets</Link>
        </Button>
      </div>
    );
  }

  const stats = [
    { label: 'Assets', value: userAssets.length },
    { label: 'Total Likes', value: userAssets.reduce((sum, asset) => sum + asset.likes, 0) },
    { label: 'Total Downloads', value: userAssets.reduce((sum, asset) => sum + asset.downloads, 0) },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Profile Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-6">
          <Avatar className="h-24 w-24">
            <AvatarImage src={profileUser.profile_picture_url} />
            <AvatarFallback className="text-2xl">
              {profileUser.username[0].toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 space-y-2">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold">
                  {profileUser.full_name || profileUser.username}
                </h1>
                <p className="text-lg text-muted-foreground">@{profileUser.username}</p>
              </div>
              
              {isOwnProfile && (
                <Button variant="outline" asChild>
                  <Link to="/settings">
                    <Edit2 className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Link>
                </Button>
              )}
            </div>
            
            {profileUser.bio && (
              <p className="text-muted-foreground max-w-2xl">{profileUser.bio}</p>
            )}
            
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                Joined {new Date(profileUser.created_at).toLocaleDateString()}
              </div>
              <div className="flex items-center gap-1">
                <Mail className="h-4 w-4" />
                {profileUser.email}
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {stats.map((stat) => (
            <Card key={stat.label}>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold gradient-primary bg-clip-text text-transparent">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Assets Section */}
      <Tabs defaultValue="assets" className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <TabsList>
            <TabsTrigger value="assets">
              Assets ({userAssets.length})
            </TabsTrigger>
            <TabsTrigger value="liked">
              Liked
            </TabsTrigger>
          </TabsList>
          
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
            
            {isOwnProfile && (
              <Button asChild>
                <Link to="/my-assets">
                  <Edit2 className="h-4 w-4 mr-2" />
                  Manage Assets
                </Link>
              </Button>
            )}
          </div>
        </div>

        <TabsContent value="assets">
          {userAssets.length > 0 ? (
            <div className={`grid gap-6 ${
              viewMode === 'grid' 
                ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
                : 'grid-cols-1'
            }`}>
              {userAssets.map((asset) => (
                <AssetCard key={asset.id} asset={asset} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-muted-foreground mb-4">
                {isOwnProfile ? "You haven't uploaded any assets yet." : "This user hasn't uploaded any assets yet."}
              </div>
              {isOwnProfile && (
                <Button asChild>
                  <Link to="/upload">Upload Your First Asset</Link>
                </Button>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="liked">
          <div className="text-center py-12 text-muted-foreground">
            Coming soon - Liked assets feature
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}