import React from 'react'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import HeroSection from '../components/home/HeroSection'
import FeaturedItems from '../components/home/FeaturedItems'
import MissionSection from '../components/home/MissionSection'

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main>
        <HeroSection />
        <FeaturedItems />
        <MissionSection />
      </main>
      <Footer />
    </div>
  )
}

export default LandingPage 