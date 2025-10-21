import { ReactNode } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';

interface LayoutProps {
  children: ReactNode;
  hideHeader?: boolean;
  hideFooter?: boolean;
  onSearch?: (query: string) => void;
  searchQuery?: string;
}

export const Layout = ({ 
  children, 
  hideHeader = false, 
  hideFooter = false,
  onSearch,
  searchQuery 
}: LayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col">
      {!hideHeader && (
        <Header onSearch={onSearch} searchQuery={searchQuery} />
      )}
      
      <main className="flex-1">
        {children}
      </main>
      
      {!hideFooter && <Footer />}
    </div>
  );
};