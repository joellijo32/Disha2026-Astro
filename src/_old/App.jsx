import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import HeroSection from './components/HeroSection'
import AboutDisha from './components/AboutDisha'
import Leaderboard from './components/Leaderboard'
import EventsList from './components/EventsList'
import Footer from './components/Footer'
import Team from './components/ConvenorGallery'
import './App.css'

function App() {

  useEffect(() => {
    console.log(`Greetings sailor! If you are looking to know how this was built, ask Sooraj, Alwin or George - the makers of this website :)`);
  }, []);

  return (
    <>
          <HeroSection />
          <AboutDisha />
          <Leaderboard />
          <EventsList />
          <Team />
          <Footer />
    </>
  );
}

export default App;
