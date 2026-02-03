import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import TransitionSection from '@/components/TransitionSection';
import BenefitsSection from '@/components/BenefitsSection';
import Footer from '@/components/Footer';

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <HeroSection />
        <TransitionSection />
        <BenefitsSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
