import type { ReactNode } from 'react';

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
}

export default function AuthLayout({ children, title }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <header className="mb-8 text-center">
           <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-16 h-16 mx-auto text-primary mb-2">
            <path d="M12 .75a8.25 8.25 0 00-6.456 13.297.75.75 0 001.02.027 6.75 6.75 0 0110.872 0 .75.75 0 001.02-.027A8.25 8.25 0 0012 .75z" />
            <path fillRule="evenodd" d="M21 12.75a8.25 8.25 0 01-2.047 5.373.75.75 0 01-1.04-.06A6.75 6.75 0 0012 15.75a6.75 6.75 0 00-5.913 2.316.75.75 0 01-1.04.061A8.25 8.25 0 013 12.75a.75.75 0 01.75-.75h16.5a.75.75 0 01.75.75zm-2.78 5.806a.75.75 0 01.185-.681 8.223 8.223 0 00-1.982-1.865A.75.75 0 0116.5 15.75V15a.75.75 0 01.75-.75H18a.75.75 0 01.75.75v.25a8.15 8.15 0 01.73 1.514.75.75 0 01-.145.825l-.01.012a.75.75 0 01-.21.118l-.001.001c-.99.494-1.926 1.038-2.795 1.625a.75.75 0 01-.613.053 6.682 6.682 0 00-9.228 0 .75.75 0 01-.613-.053c-.87-.587-1.805-1.131-2.795-1.625a.75.75 0 01-.21-.118l-.01-.012a.75.75 0 01-.145-.825 8.15 8.15 0 01.73-1.514V15a.75.75 0 01.75-.75h.75a.75.75 0 01.75.75v.265a8.224 8.224 0 00-1.983 1.865.75.75 0 11-1.226.863 9.723 9.723 0 012.26-2.11A.75.75 0 016.75 15V15a2.25 2.25 0 00-2.25-2.25H3.75a.75.75 0 00-.75.75v.703A9.75 9.75 0 0112 3.75a9.75 9.75 0 019 9.003V15a.75.75 0 00-.75-.75h-.75a2.25 2.25 0 00-2.25 2.25v.25c0 .304.059.598.172.871a9.723 9.723 0 012.26 2.11.75.75 0 11-1.226.865z" clipRule="evenodd" />
           </svg>
          <h1 className="text-3xl font-bold text-primary">{title}</h1>
          <p className="text-muted-foreground mt-1">Welcome to Exprezzzo Intelligence System</p>
        </header>
        <main className="rounded-lg border bg-card p-6 shadow-lg sm:p-8">
          {children}
        </main>
         <footer className="mt-8 text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Exprezzzo. All rights reserved.
        </footer>
      </div>
    </div>
  );
}
