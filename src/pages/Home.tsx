import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Upload, Download, Users, Zap, Shield, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { AssetCard } from '@/components/assets/AssetCard';
import { ModelViewer } from '@/components/3d/ModelViewer';
import { Badge } from '@/components/ui/badge';
import { apiService } from '@/services/api';
import { Asset } from '@/types/api';
import { popularTags } from '@/services/mockData';

export default function Home() {
  const [featuredAssets, setFeaturedAssets] = useState<Asset[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFeaturedAssets = async () => {
      try {
        const { assets } = await apiService.getAssets({ 
          sort: 'likes', 
          order: 'desc', 
          limit: 6 
        });
        setFeaturedAssets(assets);
      } catch (error) {
        console.error('Failed to load featured assets:', error);
      } finally {
        setLoading(false);
      }
    };

    loadFeaturedAssets();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/explore?search=${encodeURIComponent(searchQuery)}`;
    }
  };

  const features = [
    {
      icon: Upload,
      title: "Easy Upload",
      description: "Upload your Blender models in GLB, GLTF, or OBJ formats with just a few clicks"
    },
    {
      icon: Search,
      title: "Smart Discovery",
      description: "Find exactly what you need with powerful search and filtering capabilities"
    },
    {
      icon: Download,
      title: "Instant Download",
      description: "Download high-quality 3D assets immediately after preview"
    },
    {
      icon: Users,
      title: "Community Driven",
      description: "Connect with talented 3D artists and share feedback on amazing creations"
    },
    {
      icon: Zap,
      title: "Real-time Preview",
      description: "Interactive 3D previews powered by Three.js and WebGL technology"
    },
    {
      icon: Shield,
      title: "Secure & Reliable",
      description: "Your assets are safely stored and backed up with enterprise-grade security"
    }
  ];

  const stats = [
    { label: "3D Assets", value: "50K+" },
    { label: "Artists", value: "2.5K+" },
    { label: "Downloads", value: "1M+" },
    { label: "Countries", value: "120+" }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 md:py-32">
        {/* Background gradient */}
        <div className="absolute inset-0 gradient-primary opacity-10" />
        
        <div className="container mx-auto px-4 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <Badge variant="outline" className="w-fit gradient-primary text-white border-0">
                  ✨ Welcome to the future of 3D sharing
                </Badge>
                <h1 className="text-4xl md:text-6xl font-bold leading-tight">
                  Share & Discover
                  <span className="gradient-primary bg-clip-text text-transparent block">
                    3D Assets
                  </span>
                </h1>
                <p className="text-xl text-muted-foreground leading-relaxed">
                  The premier platform for Blender artists to upload, share, and discover 
                  high-quality 3D models with interactive previews and community feedback.
                </p>
              </div>

              {/* Search bar */}
              <form onSubmit={handleSearch} className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                  <Input
                    type="text"
                    placeholder="Search for 3D models, characters, environments..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 h-12 text-base bg-background/80 backdrop-blur-sm border-border"
                  />
                </div>
                <Button type="submit" variant="hero" size="lg" className="h-12 px-8">
                  Search
                </Button>
              </form>

              {/* Popular tags */}
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Popular tags:</p>
                <div className="flex flex-wrap gap-2">
                  {popularTags.slice(0, 6).map((tag) => (
                    <Link key={tag} to={`/explore?tags=${tag}`}>
                      <Badge 
                        variant="secondary" 
                        className="hover:bg-primary hover:text-primary-foreground transition-smooth cursor-pointer"
                      >
                        {tag}
                      </Badge>
                    </Link>
                  ))}
                </div>
              </div>

              {/* CTA buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Button variant="hero" size="xl" asChild>
                  <Link to="/explore">
                    Explore Assets
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button variant="outline" size="xl" asChild>
                  <Link to="/upload">
                    Upload Your Work
                    <Upload className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>
            </div>

            {/* 3D Preview */}
            <div className="lg:block">
              <ModelViewer 
                className="w-full h-96 lg:h-[500px]" 
                autoRotate={true}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl md:text-4xl font-bold gradient-primary bg-clip-text text-transparent">
                  {stat.value}
                </div>
                <div className="text-muted-foreground mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Assets */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Featured Assets
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Discover the most popular and highest-rated 3D models from our community
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <div className="aspect-square bg-muted" />
                  <CardContent className="p-4">
                    <div className="h-4 bg-muted rounded mb-2" />
                    <div className="h-3 bg-muted rounded w-2/3" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredAssets.map((asset) => (
                <AssetCard key={asset.id} asset={asset} />
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Button variant="outline" size="lg" asChild>
              <Link to="/explore">
                View All Assets
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Why Choose Polycrate?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Built by 3D artists, for 3D artists. Everything you need to share and discover amazing 3D content.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature) => (
              <Card key={feature.title} className="gradient-card border-border/50 hover:shadow-card transition-smooth">
                <CardContent className="p-6">
                  <div className="gradient-primary w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="gradient-card rounded-2xl p-8 md:p-12 text-center border border-border/50">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Share Your Creations?
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join thousands of 3D artists who trust Polycrate to showcase their work and connect with the community.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="hero" size="xl" asChild>
                <Link to="/register">
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button variant="outline" size="xl" asChild>
                <Link to="/explore">
                  Explore First
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}