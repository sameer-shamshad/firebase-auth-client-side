'use client';
import Link from 'next/link';
import { useState } from 'react';
import { usePathname } from 'next/navigation';

export default function Navigation() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="w-full flex items-center bg-primary text-secondary py-4 px-8">
      <Link
        href="/"
        className="text-md md:text-xl font-extrabold"
      >
        Firebase SSO
      </Link>

      <div className='flex items-center gap-0 ml-auto'>
        <Link
          href="/"
          className={`text-sm font-medium transition-colors hover:opacity-80 ${
            pathname === '/' ? 'text-primary' : 'text-primary-foreground'
          }`}
        >
          Home
        </Link>
        <Link
          href="/login"
          className={`text-sm font-medium transition-colors hover:opacity-80 ${
            pathname === '/login' ? 'text-primary' : 'text-primary-foreground'
          }`}
        >
          Login
        </Link>
        <Link
          href="/register"
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:opacity-90"
        >
          Sign Up
        </Link>
      </div>

      <button 
        type="button" 
        className='material-symbols-outlined' 
        onClick={() => setIsMenuOpen(!isMenuOpen)}
      >
        menu
      </button>
    </nav>
  );
}

