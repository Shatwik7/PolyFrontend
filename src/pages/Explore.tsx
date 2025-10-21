import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, Grid, List, SortAsc, SortDesc } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Checkbox } from '@/components/ui/checkbox';
import { AssetCard } from '@/components/assets/AssetCard';
import { apiService } from '@/services/api';
import { Asset, AssetFilter } from '@/types/api';
import { categories, popularTags } from '@/services/mockData';

export default function Explore() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Filters
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedTags, setSelectedTags] = useState<string[]>(
    searchParams.get('tags')?.split(',').filter(Boolean) || []
  );
  const [selectedFormats, setSelectedFormats] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<string>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const loadAssets = async () => {
    setLoading(true);
    try {
      const filters: AssetFilter = {
        search: searchQuery || undefined,
        tags: selectedTags.length > 0 ? selectedTags : undefined,
        file_format: selectedFormats.length > 0 ? selectedFormats : undefined,
        sort: sortBy as any,
        order: sortOrder,
        page,
        limit: 12
      };

      const { assets: loadedAssets, total: totalCount } = await apiService.getAssets(filters);
      setAssets(loadedAssets);
      setTotal(totalCount);
    } catch (error) {
      console.error('Failed to load assets:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAssets();
  }, [searchQuery, selectedTags, selectedFormats, sortBy, sortOrder, page]);

  useEffect(() => {
    // Update URL params
    const params = new URLSearchParams();
    if (searchQuery) params.set('search', searchQuery);
    if (selectedTags.length > 0) params.set('tags', selectedTags.join(','));
    setSearchParams(params);
  }, [searchQuery, selectedTags, setSearchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadAssets();
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
    setPage(1);
  };

  const toggleFormat = (format: string) => {
    setSelectedFormats(prev => 
      prev.includes(format) 
        ? prev.filter(f => f !== format)
        : [...prev, format]
    );
    setPage(1);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedTags([]);
    setSelectedFormats([]);
    setPage(1);
  };

  const FiltersPanel = () => (
    <div className="space-y-6">
      {/* Categories */}
      <div>
        <h3 className="font-semibold mb-3">Categories</h3>
        <div className="space-y-2">
          {categories.slice(1).map((category) => (
            <div key={category} className="flex items-center space-x-2">
              <Checkbox 
                id={category}
                checked={selectedTags.includes(category.toLowerCase())}
                onCheckedChange={() => toggleTag(category.toLowerCase())}
              />
              <label htmlFor={category} className="text-sm cursor-pointer">
                {category}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* File Formats */}
      <div>
        <h3 className="font-semibold mb-3">File Formats</h3>
        <div className="space-y-2">
          {['glb', 'gltf', 'obj'].map((format) => (
            <div key={format} className="flex items-center space-x-2">
              <Checkbox 
                id={format}
                checked={selectedFormats.includes(format)}
                onCheckedChange={() => toggleFormat(format)}
              />
              <label htmlFor={format} className="text-sm cursor-pointer">
                {format.toUpperCase()}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Popular Tags */}
      <div>
        <h3 className="font-semibold mb-3">Popular Tags</h3>
        <div className="flex flex-wrap gap-2">
          {popularTags.map((tag) => (
            <Badge
              key={tag}
              variant={selectedTags.includes(tag) ? "default" : "outline"}
              className="cursor-pointer transition-smooth"
              onClick={() => toggleTag(tag)}
            >
              {tag}
            </Badge>
          ))}
        </div>
      </div>

      <Button variant="outline" onClick={clearFilters} className="w-full">
        Clear Filters
      </Button>
    </div>
  );

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">Explore 3D Assets</h1>
          <p className="text-muted-foreground">
            Discover amazing 3D models created by talented artists from around the world
          </p>
        </div>

        {/* Search and Controls */}
        <div className="mb-8 space-y-4">
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex gap-2">
            <Input
              type="text"
              placeholder="Search assets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" variant="outline">
              Search
            </Button>
          </form>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <div className="flex gap-2">
              {/* Mobile Filters */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" className="lg:hidden">
                    <Filter className="h-4 w-4 mr-2" />
                    Filters
                  </Button>
                </SheetTrigger>
                <SheetContent side="left">
                  <SheetHeader>
                    <SheetTitle>Filters</SheetTitle>
                    <SheetDescription>
                      Refine your search results
                    </SheetDescription>
                  </SheetHeader>
                  <div className="mt-6">
                    <FiltersPanel />
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            <div className="flex gap-2">
              {/* Sort */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="created_at">Latest</SelectItem>
                  <SelectItem value="likes">Most Liked</SelectItem>
                  <SelectItem value="downloads">Most Downloaded</SelectItem>
                  <SelectItem value="name">Name</SelectItem>
                </SelectContent>
              </Select>

              {/* Sort Order */}
              <Button
                variant="outline"
                size="icon"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              >
                {sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
              </Button>

              {/* View Mode */}
              <div className="flex border rounded-lg">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="rounded-r-none"
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="rounded-l-none"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Active Filters */}
          {(selectedTags.length > 0 || selectedFormats.length > 0) && (
            <div className="flex flex-wrap gap-2">
              <span className="text-sm text-muted-foreground">Active filters:</span>
              {selectedTags.map((tag) => (
                <Badge key={tag} variant="secondary" className="cursor-pointer" onClick={() => toggleTag(tag)}>
                  {tag} ×
                </Badge>
              ))}
              {selectedFormats.map((format) => (
                <Badge key={format} variant="secondary" className="cursor-pointer" onClick={() => toggleFormat(format)}>
                  {format.toUpperCase()} ×
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar Filters - Desktop */}
          <div className="hidden lg:block">
            <Card>
              <CardContent className="p-6">
                <FiltersPanel />
              </CardContent>
            </Card>
          </div>

          {/* Assets Grid */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {Array.from({ length: 9 }).map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <div className="aspect-square bg-muted" />
                    <CardContent className="p-4">
                      <div className="h-4 bg-muted rounded mb-2" />
                      <div className="h-3 bg-muted rounded w-2/3" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : assets.length > 0 ? (
              <>
                <div className="flex justify-between items-center mb-6">
                  <p className="text-muted-foreground">
                    Showing {assets.length} of {total} assets
                  </p>
                </div>

                <div className={`grid gap-6 ${
                  viewMode === 'grid' 
                    ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3' 
                    : 'grid-cols-1'
                }`}>
                  {assets.map((asset) => (
                    <AssetCard key={asset.id} asset={asset} />
                  ))}
                </div>

                {/* Pagination */}
                {total > 12 && (
                  <div className="flex justify-center mt-8">
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        disabled={page === 1}
                        onClick={() => setPage(page - 1)}
                      >
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        disabled={page * 12 >= total}
                        onClick={() => setPage(page + 1)}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <h3 className="text-2xl font-semibold mb-2">No assets found</h3>
                <p className="text-muted-foreground mb-4">
                  Try adjusting your search criteria or browse our featured content
                </p>
                <Button onClick={clearFilters}>Clear Filters</Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}