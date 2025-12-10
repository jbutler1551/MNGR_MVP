import { ReactNode } from 'react';
import CreatorSidebar from './CreatorSidebar';

interface CreatorLayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  actions?: ReactNode;
}

export default function CreatorLayout({ children, title, subtitle, actions }: CreatorLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <CreatorSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        {(title || actions) && (
          <header className="bg-white border-b border-gray-200 px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                {title && <h1 className="text-2xl font-bold text-gray-900">{title}</h1>}
                {subtitle && <p className="text-gray-500 mt-1">{subtitle}</p>}
              </div>
              {actions && <div className="flex items-center gap-4">{actions}</div>}
            </div>
          </header>
        )}

        {/* Main Content */}
        <main className="flex-1 p-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
