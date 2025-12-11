'use client';
import React, { useEffect } from 'react'
import Navigation from '@/components/Navigation';


const App = ({ children }: { children: React.ReactNode }) => {

  useEffect(() => {
    document.documentElement.classList.add('dark-mode');
  }, []);

  return (
    <section className='min-h-screen bg-background'>
      <Navigation />
      {children}
    </section>
  );
};

export default App;
