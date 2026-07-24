import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";
import brain from "../assests/images/brain.jpg";
export default function LandingPage() {
  console.log(brain);
  const containerRef = useRef(null);

  // Reproduces the original IntersectionObserver scroll-in animation
  // for every .glass-card inside this page.
  useEffect(() => {
    const cards = containerRef.current?.querySelectorAll(".glass-card") ?? [];
    cards.forEach((card) => {
      card.classList.add("transition-all", "duration-700", "opacity-0", "translate-y-10");
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("opacity-100", "translate-y-0");
            entry.target.classList.remove("opacity-0", "translate-y-10");
          }
        });
      },
      { threshold: 0.1 }
    );

    cards.forEach((card) => observer.observe(card));
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="selection:bg-primary-fixed-dim selection:text-on-primary-fixed">
      <Navbar />

      <main>
        {/* Hero Section */}
       {/* Hero Section */}
        <section className="relative overflow-hidden pt-4 pb-32 lg:pt-4 lg:pb-20">
          <div className="blob-animation top-0 left-0 bg-primary" />
          <div className="blob-animation bottom-0 right-0 bg-secondary" style={{ animationDelay: "-5s" }} />

          <div className="max-w-container-max mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              
              {/* LEFT SIDE: Added 'w-full' to prevent grid collapse */}
              <div className="space-y-8 w-full">
                <div className="inline-flex items-center gap-2 px-2 py-0 bg-primary-container/10 border border-primary/20 rounded-full text-primary font-label-sm text-label-sm">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
                  </span>
                  New: AI Study Companion 2.0
                </div>

                <h1 className="text-display-lg font-display-lg leading-tight lg:text-[64px]">
                  Knowledge Guru, <br />
                  <span className="primary-gradient-text">Where Ambition Meets Mastery</span>
                </h1>

                {/* TEXT FIX: Added 'w-full min-w-[300px]' so words don't fall vertically */}
                <p className="text-body-lg text-on-surface-variant max-w-xl w-full min-w-[300px]">
                  Unlock your potential with an adaptive learning platform that identifies your
                  knowledge gaps and builds a custom curriculum just for you.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <Link
                    to="/register"
                    className="primary-gradient text-on-primary px-8 py-4 rounded-xl font-label-md text-lg shadow-lg hover:shadow-indigo-500/20 transition-all transform hover:-translate-y-1 active:scale-95 text-center"
                  >
                    Get Started Free
                  </Link>
                  <Link to="/register" className="flex items-center justify-center gap-2 bg-surface-container-low border border-outline-variant text-on-surface px-8 py-4 rounded-xl font-label-md text-lg hover:bg-surface-container-high transition-all">
                    <span className="material-symbols-outlined">play_circle</span>
                    View Courses
                  </Link>
                </div>

                <div className="flex items-center gap-6 pt-6">
                  <div className="flex -space-x-3">
                    <img
                      className="w-10 h-10 rounded-full border-2 border-surface object-cover"
                      alt="A diverse female student smiling warmly"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuChZ5wg-jXfXzCuoTM7ixc43RLa5PVppknCJYEBDYqBFFblneFTMjNYPgPRSoAnQwv9PLUrs26ik0X2V4p4_dQrA3V0Yzz6t6oQtce9f1cm3d51Pp8HEGnwYg1JXhjHkzl-aJI2JqnLqaKoLZtKgxNmfC7mBP0p8LJmV-39vRlFJFmlbjxTgJH0xHvlK8uIYD4UbdjQ-zINQ335EB6jmABqBAmtBoRftuD0XzNnAvpTroIgLz_guTy_mtWtS0RZZMoW97djl8vfv4o"
                    />
                    <img
                      className="w-10 h-10 rounded-full border-2 border-surface object-cover"
                      alt="A professional young man in a modern office"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuA7VNOXJJgq6qjX9OBsBZAlIpVNPU8uqjnrpjZQKN4g4dS33iRx7SAu6QrjWRuFH4xmzNQAVy_SO2dVziSC1sn1XInDLvJwIV4QiFuJrIXYT7lF43pwYb5GAmPp-b2jnB6_-eNe_IpE6Uvod67ipjFPD5Txr9leWjDCy-N1H09kVhVukgJ03hMVEuDY4wNrer_pnUBjtWTvnrJdvadwn1d7a2XwZw8iiJXsQMfAhX6weJQtZMCyCoy0boQqUv0LaWMbi-xR_5gJCKQ"
                    />
                    <img
                      className="w-10 h-10 rounded-full border-2 border-surface object-cover"
                      alt="A cheerful diverse student wearing glasses"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuCm3pb41TUksamlb9kmR2QdJZCPjpIKR1dBUsehdixv13RoT8EzdPaosok5Udytmos0P4GXaw3O3yzkEWk-E95Ka-TC8adwkB0kKPIsthYRI6nwWUv9zTSfbqNR03uS1gNkm0Q91bKKlwUg63naaVVhM64fLjgKzXIY863P67f_kCsE3rvfmEt3cP004OdxibC7VqIG1i-hxGsD_xU7jiMOjtnLj1T7hXQVsE8m8J5bAv4IgVyYoHU8x3NDY4YyQd9MKRYchU85NaY"
                    />
                  </div>
                  <p className="text-label-sm text-on-surface-variant">
                    Join <span className="font-bold text-on-surface">50,000+</span> active learners today.
                  </p>
                </div>
              </div>

              {/* RIGHT SIDE FIX: Added 'w-full mt-10 lg:mt-0' */}
              <div className="relative lg:h-[600px] flex items-center justify-center w-full mt-10 lg:mt-0">
                {/* IMAGE FRAME FIX: Added 'aspect-square' to hold shape, prevents card overlap */}
                <div className="glass-card p-4 rounded-3xl  relative z-10 aspect-square flex flex-col justify-center">
                  
                  {/* Added 'w-full h-full object-cover' so image fills the square properly */}
                  <img
                    className="w-full h-full object-cover rounded-2xl"
                    alt="A 3D illustration of a glowing holographic brain being scanned by golden laser lines"
                    src={brain} 
                  />

                  <div
                    className="absolute -top-6 -right-6 glass-card px-6 py-4 rounded-2xl flex items-center gap-3 animate-bounce shadow-xl"
                    style={{ animationDuration: "3s" }}
                  >
                    <div className="bg-primary/10 p-2 rounded-lg">
                      <span className="material-symbols-outlined text-primary">psychology</span>
                    </div>
                    <div>
                      <p className="text-label-sm font-bold">Analysis Complete</p>
                      <p className="text-[10px] text-on-surface-variant">Gap in 'Quantum Physics' found</p>
                    </div>
                  </div>

                  <div className="absolute -bottom-10 -left-6 glass-card px-6 py-4 rounded-2xl flex items-center gap-3 shadow-xl">
                    <div className="bg-secondary/10 p-2 rounded-lg">
                      <span className="material-symbols-outlined text-secondary">trending_up</span>
                    </div>
                    <div>
                      <p className="text-label-sm font-bold">+24% Mastery</p>
                      <p className="text-[10px] text-on-surface-variant">Your learning velocity increased</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Row - Theme intact */}
        <section className="py-12 bg-surface-container-low border-y border-black/5">
          <div className="max-w-container-max mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 text-center">
              <div className="space-y-1">
                <p className="text-headline-lg font-bold text-primary">50k+</p>
                <p className="text-label-md text-on-surface-variant">Global Students</p>
              </div>
              <div className="space-y-1">
                <p className="text-headline-lg font-bold text-primary">1k+</p>
                <p className="text-label-md text-on-surface-variant">Expert Courses</p>
              </div>
              <div className="space-y-1">
                <p className="text-headline-lg font-bold text-primary">98%</p>
                <p className="text-label-md text-on-surface-variant">Success Rate</p>
              </div>
              <div className="hidden lg:block space-y-1">
                <p className="text-headline-lg font-bold text-primary">24/7</p>
                <p className="text-label-md text-on-surface-variant">AI Support</p>
              </div>
            </div>
          </div>
        </section>
        {/* Features Bento Grid */}
        <section id="courses" className="py-24 lg:py-32 scroll-mt-24">
          <div className="max-w-container-max mx-auto px-4">
            <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
              <h2 className="text-headline-lg font-headline-lg">Everything you need to master any subject</h2>
              <p className="text-body-md text-on-surface-variant">
                Our AI-driven ecosystem adapts to your unique learning style, pace, and existing knowledge.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="glass-card p-8 rounded-3xl flex flex-col gap-6 group hover:border-primary/30 transition-all">
                <div className="w-14 h-14 primary-gradient rounded-2xl flex items-center justify-center text-on-primary">
                  <span className="material-symbols-outlined text-3xl">troubleshoot</span>
                </div>
                <div className="space-y-3">
                  <h3 className="text-headline-md font-bold">Knowledge Gap Detection</h3>
                  <p className="text-body-md text-on-surface-variant">
                    Stop wasting time on what you already know. Our AI identifies specific weaknesses
                    and targets them immediately.
                  </p>
                </div>
                <div className="mt-auto pt-4">
                  <Link to="/register" className="text-primary font-bold inline-flex items-center gap-1 group-hover:gap-2 transition-all" href="#">
                    Learn more <span className="material-symbols-outlined">arrow_forward</span>
                  </Link>
                </div>
              </div>

              <div className="glass-card p-8 rounded-3xl flex flex-col gap-6 border-2 border-primary/10 shadow-xl shadow-indigo-500/5 group">
                <div className="w-14 h-14 bg-secondary rounded-2xl flex items-center justify-center text-on-primary">
                  <span className="material-symbols-outlined text-3xl">auto_awesome</span>
                </div>
                <div className="space-y-3">
                  <h3 className="text-headline-md font-bold">AI Recommendations</h3>
                  <p className="text-body-md text-on-surface-variant">
                    Receive personalized daily learning paths based on your goals, career interests,
                    and performance data.
                  </p>
                </div>
                <div className="mt-auto pt-4">
                  <Link to="/register" className="text-primary font-bold inline-flex items-center gap-1 group-hover:gap-2 transition-all" href="#">
                    Learn more <span className="material-symbols-outlined">arrow_forward</span>
                  </Link>
                </div>
              </div>

              <div className="glass-card p-8 rounded-3xl flex flex-col gap-6 group hover:border-primary/30 transition-all">
                <div className="w-14 h-14 bg-tertiary-container rounded-2xl flex items-center justify-center text-on-primary">
                  <span className="material-symbols-outlined text-3xl">quiz</span>
                </div>
                <div className="space-y-3">
                  <h3 className="text-headline-md font-bold">Interactive Quizzes</h3>
                  <p className="text-body-md text-on-surface-variant">
                    Dynamic assessments that change in difficulty as you answer, ensuring you're
                    always in the 'Goldilocks Zone' of learning.
                  </p>
                </div>
                <div className="mt-auto pt-4">
                  <Link to="/register" className="text-primary font-bold inline-flex items-center gap-1 group-hover:gap-2 transition-all" href="#">
                    Learn more <span className="material-symbols-outlined">arrow_forward</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section id="enterprise" className="py-24 bg-surface-container scroll-mt-24">
          <div className="max-w-container-max mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="space-y-6">
                <h2 className="text-display-lg font-display-lg leading-tight">
                  Hear from our community of achievers
                </h2>
                <p className="text-body-lg text-on-surface-variant">
                  Don't just take our word for it. Thousands of professionals have accelerated their
                  careers with .
                </p>
                <div className="flex gap-4">
                  <button
                    className="w-12 h-12 rounded-full border border-outline-variant flex items-center justify-center hover:bg-surface-container-high transition-colors"
                    aria-label="Previous testimonial"
                  >
                    <span className="material-symbols-outlined">arrow_back</span>
                  </button>
                  <button
                    className="w-12 h-12 rounded-full border border-outline-variant flex items-center justify-center hover:bg-surface-container-high transition-colors"
                    aria-label="Next testimonial"
                  >
                    <span className="material-symbols-outlined">arrow_forward</span>
                  </button>
                </div>
              </div>

              <div className="grid gap-6">
                <div className="glass-card p-8 rounded-3xl relative">
                  <div className="absolute -top-4 -left-4 w-12 h-12 primary-gradient rounded-full flex items-center justify-center text-on-primary shadow-lg">
                    <span className="material-symbols-outlined">format_quote</span>
                  </div>
                  <p className="text-body-lg italic text-on-surface mb-6">
                    "The knowledge gap detection is a game changer. I saved nearly 30 hours of study
                    time by skipping concepts I already mastered in my previous job."
                  </p>
                  <div className="flex items-center gap-4">
                    <img
                      className="w-14 h-14 rounded-full object-cover"
                      alt="A professional headshot of a smiling woman with glasses"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuB3l90adFa_YY2S7YqJ6xiBvWC-6mXCX-aTPd1Yd4Nkx-q5w3VD9C0yWKRxv9xQOfudrZRGZQRWMC9pw__oastECeGQ2m9JXw-Lp0jph-3VMwAkcVU8Y_0MaSumvIVq1_J1Nv180WcKDT3E-Fi6yC6Xu3G2Ow3YOP9ohxOHEWgkWtg2d2Q7dPywD_duI7dM3YdzxkIYLC5_OPfJI6_Hr5B8BuJjMagIdekMeym7krVfIFI4wwtshDayG1OfQThnPtPzZrOzDjM-sI8"
                    />
                    <div>
                      <p className="font-bold">Sarah Jenkins</p>
                      <p className="text-label-sm text-on-surface-variant">Senior Dev at CloudScale</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section id="pricing" className="py-24 scroll-mt-24">
          <div className="max-w-container-max mx-auto px-4">
            <div className="primary-gradient rounded-[40px] p-8 lg:p-20 text-center text-on-primary relative overflow-hidden">
              <div className="relative z-10 space-y-8">
                <h2 className="text-display-lg font-display-lg">Ready to transform your learning?</h2>
                <p className="text-body-lg opacity-90 max-w-2xl mx-auto">
                  Start your 14-day free trial today. No credit card required. Experience the power
                  of AI-personalized education.
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                  <Link
                    to="/register"
                    className="bg-white text-primary px-10 py-4 rounded-xl font-bold text-lg hover:bg-surface-container-lowest transition-all transform hover:-translate-y-1 text-center"
                  >
                    Create Free Account
                  </Link>
                  <Link to="/register" className="bg-primary-container text-white px-10 py-4 rounded-xl font-bold text-lg hover:bg-primary-container/80 transition-all border border-white/20">
                    Contact Sales
                  </Link>
                </div>
              </div>

              <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
