import React, { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import i18n from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MessageCircle } from "lucide-react";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import OnboardingForm from "@/components/OnboardingForm";
import BlogSection from "@/components/blog/BlogSection";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useLocation } from "react-router-dom";
import { useWebsiteContent } from "@/services/contentService";
import { useTransparencyStats } from "@/services/transparencyService";

const LandingPage = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const aboutRef = useRef<HTMLElement>(null);
  const servicesRef = useRef<HTMLElement>(null);
  const onboardingRef = useRef<HTMLElement>(null);
  const blogRef = useRef<HTMLElement>(null);
  const { content, loading } = useWebsiteContent();
  const { stats, loading: statsLoading } = useTransparencyStats();

  const scrollToSection = (ref: React.RefObject<HTMLElement>) => {
    ref.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Handle scrolling to section when navigating from other pages
  useEffect(() => {
    if (location.state && location.state.scrollTo) {
      const scrollTo = location.state.scrollTo;

      if (scrollTo === "about" && aboutRef.current) {
        scrollToSection(aboutRef);
      } else if (scrollTo === "services" && servicesRef.current) {
        scrollToSection(servicesRef);
      } else if (scrollTo === "onboarding" && onboardingRef.current) {
        scrollToSection(onboardingRef);
      } else if (scrollTo === "blog" && blogRef.current) {
        scrollToSection(blogRef);
      }
    }
  }, [location.state]);

  // Don't render until content is ready to prevent flash
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading content...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      {/* Header */}
      <Header
        scrollToSection={scrollToSection}
        aboutRef={aboutRef}
        servicesRef={servicesRef}
        onboardingRef={onboardingRef}
        blogRef={blogRef}
      />

      {/* Hero Section */}
      <section className="-mt-20 pt-20">
        <div className="h-[500px] bg-white relative flex items-center justify-center">
          <div className="container mx-auto px-4 z-20">
            <div className="max-w-3xl mx-auto text-center">
              <motion.h1
                className={`${["hi", "pa", "bn", "ne"].includes(i18n.language) ? "text-2xl md:text-3xl lg:text-4xl" : "text-3xl md:text-4xl lg:text-5xl"} font-bold text-redFiredMustard-800 mb-6`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                {["hi", "pa", "bn", "ne"].includes(i18n.language)
                  ? t("hero.title")
                  : "Bhatta Mitra™ - India's 1st Digital platform for Brick Manufacturers"}
              </motion.h1>
              <motion.div
                className="text-lg md:text-xl text-redFiredMustard-700 mb-8 space-y-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                {["hi", "pa", "bn", "ne"].includes(i18n.language) ? (
                  <>
                    <p className="leading-relaxed">
                      {t("hero.subtitle.main")}{" "}
                      <span className="font-semibold">
                        {t("hero.subtitle.eliteNetwork")}
                      </span>{" "}
                      {t("hero.subtitle.connecting")}
                    </p>
                    <p className="text-xl md:text-2xl font-bold text-redFiredMustard-800">
                      {t("hero.subtitle.revolution")}
                    </p>
                    <div className="space-y-2">
                      <p className="leading-relaxed">
                        <span className="font-medium">
                          {t("hero.subtitle.freeServices")}
                        </span>{" "}
                        {t("hero.subtitle.freeServicesDesc")}{" "}
                        <span className="font-medium">
                          {t("hero.subtitle.exclusiveServices")}
                        </span>{" "}
                        {t("hero.subtitle.exclusiveServicesDesc")}
                      </p>
                      <div className="flex flex-wrap justify-center gap-4 text-base md:text-lg font-semibold text-redFiredMustard-800">
                        <span className="bg-redFiredMustard-100 px-3 py-1 rounded-full">
                          {t("hero.subtitle.badges.handpicked")}
                        </span>
                        <span className="bg-redFiredMustard-100 px-3 py-1 rounded-full">
                          {t("hero.subtitle.badges.verified")}
                        </span>
                        <span className="bg-redFiredMustard-100 px-3 py-1 rounded-full">
                          {t("hero.subtitle.badges.innovative")}
                        </span>
                      </div>
                    </div>
                    <p className="text-lg md:text-xl font-medium">
                      {t("hero.subtitle.waitlistCall")}{" "}
                      <strong className="text-redFiredMustard-800">
                        {t("hero.subtitle.exclusiveServicesEmphasis")}
                      </strong>
                    </p>
                  </>
                ) : (
                  <>
                    <p className="leading-relaxed">
                      Bhatta Mitra™ is India's first{" "}
                      <span className="font-semibold">
                        Elite Network of Brick Manufacturers
                      </span>{" "}
                      connecting them with verified & vetted out Coal suppliers,
                      Transport providers and Labour contractors.
                    </p>
                    <p className="text-xl md:text-2xl font-bold text-redFiredMustard-800">
                      Join the Revolution !!
                    </p>
                    <div className="space-y-2">
                      <p className="leading-relaxed">
                        <span className="font-medium">Free services</span> are
                        available for manufacturers across India, and{" "}
                        <span className="font-medium">exclusive services</span>{" "}
                        are offered to a select few manufacturers in each
                        district.
                      </p>
                      <div className="flex flex-wrap justify-center gap-4 text-base md:text-lg font-semibold text-redFiredMustard-800">
                        <span className="bg-redFiredMustard-100 px-3 py-1 rounded-full">
                          HANDPICKED
                        </span>
                        <span className="bg-redFiredMustard-100 px-3 py-1 rounded-full">
                          VERIFIED
                        </span>
                        <span className="bg-redFiredMustard-100 px-3 py-1 rounded-full">
                          INNOVATIVE
                        </span>
                      </div>
                    </div>
                    <p className="text-lg md:text-xl font-medium">
                      Join the waiting list now for our{" "}
                      <strong className="text-redFiredMustard-800">
                        EXCLUSIVE SERVICES!
                      </strong>
                    </p>
                  </>
                )}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <Button
                  size="lg"
                  className="rounded-full px-8 bg-redFiredMustard-600 hover:bg-redFiredMustard-700 text-white font-semibold"
                  onClick={() => (window.location.href = "/join-waitlist")}
                >
                  {t("buttons.joinWaitlistBrickManufacturers")}
                </Button>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Overview Section */}
      <section className="py-16 bg-white -mt-1">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-redFiredMustard-700">
              {t("platformOverview.title")}
            </h2>
            <p className="text-lg text-redFiredMustard-600 max-w-2xl mx-auto">
              {t("platformOverview.subtitle")}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card
              className="overflow-hidden bg-card border-border shadow-sm hover:shadow-md transition-shadow cursor-pointer hover:shadow-lg h-full"
              onClick={() =>
                window.open("https://www.e-ENTBAZAAR.com", "_blank")
              }
            >
              <CardContent className="p-2 flex flex-col items-center justify-between text-center h-full">
                <img
                  src="/eentbazaarlogo.svg"
                  alt="e-ENT BAZAAR Logo"
                  className="h-41 w-auto object-contain max-w-full"
                />
                <h3 className="text-lg font-bold text-redFiredMustard-700 mt-1 mb-1">
                  {t("platformOverview.eentBazaar.title")}
                </h3>
                <p className="text-redFiredMustard-600 text-base font-medium leading-tight px-2 line-clamp-3 h-[4.5rem] flex items-center">
                  {t("platformOverview.eentBazaar.description")}
                </p>
              </CardContent>
            </Card>

            <Card className="overflow-hidden bg-card border-border shadow-sm hover:shadow-md transition-shadow h-full">
              <CardContent className="p-2 flex flex-col items-center justify-between text-center h-full">
                <img
                  src="/untitled177.svg"
                  alt="Coal & Transport Procurement Logo"
                  className="h-41 w-auto object-contain max-w-full"
                />
                <h3 className="text-lg font-bold text-redFiredMustard-700 mt-1 mb-1">
                  {t("platformOverview.coalTransport.title")}
                </h3>
                <p className="text-redFiredMustard-600 text-base font-medium leading-tight px-2 line-clamp-3 h-[4.5rem] flex items-center">
                  {t("platformOverview.coalTransport.description")}
                </p>
              </CardContent>
            </Card>

            <Card className="overflow-hidden bg-card border-border shadow-sm hover:shadow-md transition-shadow h-full">
              <CardContent className="p-2 flex flex-col items-center justify-between text-center h-full">
                <img
                  src="/untitled16.svg"
                  alt="Labour Hiring Logo"
                  className="h-45 w-auto object-contain max-w-full"
                />
                <h3 className="text-lg font-bold text-redFiredMustard-700 mt-1 mb-1">
                  {t("platformOverview.labourHiring.title")}
                </h3>
                <p className="text-redFiredMustard-600 text-base font-medium leading-tight px-2 line-clamp-3 h-[4.5rem] flex items-center">
                  {t("platformOverview.labourHiring.description")}
                </p>
              </CardContent>
            </Card>

            <Card className="overflow-hidden bg-card border-border shadow-sm hover:shadow-md transition-shadow h-full">
              <CardContent className="p-2 flex flex-col items-center justify-between text-center h-full">
                <img
                  src="/untitled19.svg"
                  alt="Innovation & Sustainability Logo"
                  className="h-45 w-auto object-contain max-w-full"
                />
                <h3 className="text-lg font-bold text-redFiredMustard-700 mt-1 mb-1">
                  {t("platformOverview.innovation.title")}
                </h3>
                <p className="text-redFiredMustard-600 text-base font-medium leading-tight px-2 line-clamp-3 h-[4.5rem] flex items-center">
                  {t("platformOverview.innovation.description")}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Carousel Section */}
      <section className="py-16 bg-white -mt-1">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4 text-redFiredMustard-700">
              {t("onboardingSteps.title")}
            </h2>
            <p className="text-lg text-redFiredMustard-600">
              {t("onboardingSteps.subtitle")}
            </p>
          </div>

          <Carousel
            className="w-full max-w-5xl mx-auto"
            opts={{ align: "start", loop: true }}
            plugins={[Autoplay({ delay: 4000 }) as any]}
          >
            <CarouselContent className="-ml-2 md:-ml-4">
              <CarouselItem className="pl-2 md:pl-4 md:basis-1/2 lg:basis-2/5">
                <div className="p-2">
                  <div className="bg-redFiredMustard-50 border border-redFiredMustard-200 rounded-lg p-6 h-72 flex flex-col justify-center items-center text-center">
                    <div className="w-16 h-16 bg-redFiredMustard-600 rounded-full flex items-center justify-center mb-4">
                      <span className="text-2xl text-white font-bold">1</span>
                    </div>
                    <h3 className="text-xl font-bold text-redFiredMustard-700 mb-2">
                      {t("onboardingSteps.manufacturerOnboarding.title")}
                    </h3>
                    <p className="text-redFiredMustard-600 text-sm">
                      {t("onboardingSteps.manufacturerOnboarding.description")}
                    </p>
                  </div>
                </div>
              </CarouselItem>

              <CarouselItem className="pl-2 md:pl-4 md:basis-1/2 lg:basis-2/5">
                <div className="p-2">
                  <div className="bg-redFiredMustard-50 border border-redFiredMustard-200 rounded-lg p-6 h-72 flex flex-col justify-center items-center text-center">
                    <div className="w-16 h-16 bg-redFiredMustard-600 rounded-full flex items-center justify-center mb-4">
                      <span className="text-2xl text-white font-bold">2</span>
                    </div>
                    <h3 className="text-xl font-bold text-redFiredMustard-700 mb-2">
                      {t("onboardingSteps.coalProviderOnboarding.title")}
                    </h3>
                    <p className="text-redFiredMustard-600 text-sm">
                      {t("onboardingSteps.coalProviderOnboarding.description")}
                    </p>
                  </div>
                </div>
              </CarouselItem>

              <CarouselItem className="pl-2 md:pl-4 md:basis-1/2 lg:basis-2/5">
                <div className="p-2">
                  <div className="bg-redFiredMustard-50 border border-redFiredMustard-200 rounded-lg p-6 h-72 flex flex-col justify-center items-center text-center">
                    <div className="w-16 h-16 bg-redFiredMustard-600 rounded-full flex items-center justify-center mb-4">
                      <span className="text-2xl text-white font-bold">3</span>
                    </div>
                    <h3 className="text-xl font-bold text-redFiredMustard-700 mb-2">
                      {t("onboardingSteps.transportOnboarding.title")}
                    </h3>
                    <p className="text-redFiredMustard-600 text-sm">
                      {t("onboardingSteps.transportOnboarding.description")}
                    </p>
                  </div>
                </div>
              </CarouselItem>

              <CarouselItem className="pl-2 md:pl-4 md:basis-1/2 lg:basis-2/5">
                <div className="p-2">
                  <div className="bg-redFiredMustard-50 border border-redFiredMustard-200 rounded-lg p-6 h-72 flex flex-col justify-center items-center text-center">
                    <div className="w-16 h-16 bg-redFiredMustard-600 rounded-full flex items-center justify-center mb-4">
                      <span className="text-2xl text-white font-bold">4</span>
                    </div>
                    <h3 className="text-xl font-bold text-redFiredMustard-700 mb-2">
                      {t("onboardingSteps.labourOnboarding.title")}
                    </h3>
                    <p className="text-redFiredMustard-600 text-sm">
                      {t("onboardingSteps.labourOnboarding.description")}
                    </p>
                  </div>
                </div>
              </CarouselItem>

              <CarouselItem className="pl-2 md:pl-4 md:basis-1/2 lg:basis-2/5">
                <div className="p-2">
                  <div className="bg-redFiredMustard-50 border border-redFiredMustard-200 rounded-lg p-6 h-72 flex flex-col justify-center items-center text-center">
                    <div className="w-16 h-16 bg-redFiredMustard-600 rounded-full flex items-center justify-center mb-4">
                      <span className="text-2xl text-white font-bold">5</span>
                    </div>
                    <h3 className="text-xl font-bold text-redFiredMustard-700 mb-2">
                      {t("onboardingSteps.onboardingSupport.title")}
                    </h3>
                    <p className="text-redFiredMustard-600 text-sm mb-3">
                      {t("onboardingSteps.onboardingSupport.description")}
                    </p>
                    <div className="flex flex-col items-center space-y-2 mt-2">
                      <div className="flex items-center space-x-2">
                        <a
                          href="https://wa.me/918008006245"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center space-x-1 text-redFiredMustard-700 hover:text-redFiredMustard-800 transition-colors"
                        >
                          <svg
                            className="w-4 h-4"
                            viewBox="0 0 24 24"
                            fill="#25D366"
                          >
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488" />
                          </svg>
                          <span className="text-sm font-medium">
                            (+91) 8008006245
                          </span>
                        </a>
                      </div>
                      <a
                        href="mailto:support@bhattamitra.com"
                        className="text-redFiredMustard-700 hover:text-redFiredMustard-800 text-sm font-medium transition-colors"
                      >
                        support@bhattamitra.com
                      </a>
                    </div>
                  </div>
                </div>
              </CarouselItem>
            </CarouselContent>
            <CarouselPrevious className="bg-redFiredMustard-600 hover:bg-redFiredMustard-700 text-white border-redFiredMustard-600" />
            <CarouselNext className="bg-redFiredMustard-600 hover:bg-redFiredMustard-700 text-white border-redFiredMustard-600" />
          </Carousel>

          <div className="text-center mt-8">
            <Button
              size="lg"
              className="rounded-full px-8 bg-redFiredMustard-600 hover:bg-redFiredMustard-700 text-white font-semibold"
              onClick={() => (window.location.href = "/join-waitlist")}
            >
              {t("buttons.joinWaitlistBrickManufacturers")}
            </Button>
          </div>
        </div>
      </section>

      {/* Transparency Section */}
      <section className="py-16 bg-white -mt-1">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-redFiredMustard-700">
              {t("transparencySection.title")}
            </h2>
            <p className="text-lg text-redFiredMustard-600 max-w-2xl mx-auto">
              {t("transparencySection.subtitle")}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="text-center p-6 bg-redFiredMustard-50 border-redFiredMustard-200 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-0">
                <div className="text-4xl font-bold text-redFiredMustard-700 mb-2">
                  {statsLoading ? (
                    <div className="animate-pulse">
                      <div className="bg-redFiredMustard-200 h-10 w-16 mx-auto rounded mb-1"></div>
                    </div>
                  ) : (
                    <span className="tabular-nums">
                      {stats.manufacturers.toLocaleString()}
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-semibold text-redFiredMustard-700 mb-1">
                  {t("transparencySection.manufacturers.title")}
                </h3>
                <p className="text-sm text-redFiredMustard-600">
                  {t("transparencySection.manufacturers.subtitle")}
                </p>
              </CardContent>
            </Card>

            <Card className="text-center p-6 bg-redFiredMustard-50 border-redFiredMustard-200 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-0">
                <div className="text-4xl font-bold text-redFiredMustard-700 mb-2">
                  {statsLoading ? (
                    <div className="animate-pulse">
                      <div className="bg-redFiredMustard-200 h-10 w-16 mx-auto rounded mb-1"></div>
                    </div>
                  ) : (
                    <span className="tabular-nums">
                      {stats.coalProviders.toLocaleString()}
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-semibold text-redFiredMustard-700 mb-1">
                  {t("transparencySection.coalProviders.title")}
                </h3>
                <p className="text-sm text-redFiredMustard-600">
                  {t("transparencySection.coalProviders.subtitle")}
                </p>
              </CardContent>
            </Card>

            <Card className="text-center p-6 bg-redFiredMustard-50 border-redFiredMustard-200 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-0">
                <div className="text-4xl font-bold text-redFiredMustard-700 mb-2">
                  {statsLoading ? (
                    <div className="animate-pulse">
                      <div className="bg-redFiredMustard-200 h-10 w-16 mx-auto rounded mb-1"></div>
                    </div>
                  ) : (
                    <span className="tabular-nums">
                      {stats.transportProviders.toLocaleString()}
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-semibold text-redFiredMustard-700 mb-1">
                  {t("transparencySection.transportProviders.title")}
                </h3>
                <p className="text-sm text-redFiredMustard-600">
                  {t("transparencySection.transportProviders.subtitle")}
                </p>
              </CardContent>
            </Card>

            <Card className="text-center p-6 bg-redFiredMustard-50 border-redFiredMustard-200 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-0">
                <div className="text-4xl font-bold text-redFiredMustard-700 mb-2">
                  {statsLoading ? (
                    <div className="animate-pulse">
                      <div className="bg-redFiredMustard-200 h-10 w-16 mx-auto rounded mb-1"></div>
                    </div>
                  ) : (
                    <span className="tabular-nums">
                      {stats.labour.toLocaleString()}
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-semibold text-redFiredMustard-700 mb-1">
                  {t("transparencySection.labour.title")}
                </h3>
                <p className="text-sm text-redFiredMustard-600">
                  {t("transparencySection.labour.subtitle")}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Dashboard Access Section */}
      <section className="py-16 bg-white -mt-1">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-redFiredMustard-700">
              {t("dashboardAccess.title")}
            </h2>
            <p className="text-lg text-redFiredMustard-600 max-w-2xl mx-auto">
              {t("dashboardAccess.subtitle")}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card
              className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow duration-300 bg-card border-border h-full"
              onClick={() => (window.location.href = "/manufacturer-auth")}
            >
              <CardContent className="p-6 text-center h-full flex flex-col">
                <img
                  src="/untitled25.svg"
                  alt="Manufacturer Dashboard Logo"
                  className="h-40 w-40 object-contain max-w-full mx-auto mb-3"
                />
                <h3 className="text-xl font-bold mb-3 text-redFiredMustard-700 min-h-[3.5rem] flex items-center justify-center">
                  {t("dashboardAccess.manufacturerDashboard.title")}
                </h3>
                <p className="text-redFiredMustard-600 mb-4 flex-grow flex items-center justify-center text-center">
                  {t("dashboardAccess.manufacturerDashboard.description")}
                </p>
                <Button
                  variant="outline"
                  className="w-full border-redFiredMustard-600 text-redFiredMustard-700 hover:bg-redFiredMustard-600 hover:text-white mt-auto"
                >
                  {t("dashboardAccess.manufacturerDashboard.loginRegister")}
                </Button>
              </CardContent>
            </Card>

            <Card
              className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow duration-300 bg-card border-border h-full"
              onClick={() => (window.location.href = "/coal-provider-auth")}
            >
              <CardContent className="p-6 text-center h-full flex flex-col">
                <img
                  src="/untitled23.svg"
                  alt="Coal Provider Dashboard Logo"
                  className="h-40 w-40 object-contain max-w-full mx-auto mb-3"
                />
                <h3 className="text-xl font-bold mb-3 text-redFiredMustard-700 min-h-[3.5rem] flex items-center justify-center">
                  {t("dashboardAccess.coalProviderDashboard.title")}
                </h3>
                <p className="text-redFiredMustard-600 mb-4 flex-grow flex items-center justify-center text-center">
                  {t("dashboardAccess.coalProviderDashboard.description")}
                </p>
                <Button
                  variant="outline"
                  className="w-full border-redFiredMustard-600 text-redFiredMustard-700 hover:bg-redFiredMustard-600 hover:text-white mt-auto"
                >
                  {t("dashboardAccess.coalProviderDashboard.loginRegister")}
                </Button>
              </CardContent>
            </Card>

            <Card
              className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow duration-300 bg-card border-border h-full"
              onClick={() =>
                (window.location.href = "/transport-provider-auth")
              }
            >
              <CardContent className="p-6 text-center h-full flex flex-col">
                <img
                  src="/untitled28.svg"
                  alt="Transport Provider Dashboard Logo"
                  className="h-40 w-40 object-contain max-w-full mx-auto mb-3"
                />
                <h3 className="text-xl font-bold mb-3 text-redFiredMustard-700 min-h-[3.5rem] flex items-center justify-center">
                  {t("dashboardAccess.transporterDashboard.title")}
                </h3>
                <p className="text-redFiredMustard-600 mb-4 flex-grow flex items-center justify-center text-center">
                  {t("dashboardAccess.transporterDashboard.description")}
                </p>
                <Button
                  variant="outline"
                  className="w-full border-redFiredMustard-600 text-redFiredMustard-700 hover:bg-redFiredMustard-600 hover:text-white mt-auto"
                >
                  {t("dashboardAccess.transporterDashboard.loginRegister")}
                </Button>
              </CardContent>
            </Card>

            <Card
              className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow duration-300 bg-card border-border h-full"
              onClick={() => (window.location.href = "/labour-auth")}
            >
              <CardContent className="p-6 text-center h-full flex flex-col">
                <img
                  src="/untitled27.svg"
                  alt="Labour Provider Dashboard Logo"
                  className="h-40 w-40 object-contain max-w-full mx-auto mb-3"
                />
                <h3 className="text-xl font-bold mb-3 text-redFiredMustard-700 min-h-[3.5rem] flex items-center justify-center">
                  {t("dashboardAccess.labourProviderDashboard.title")}
                </h3>
                <p className="text-redFiredMustard-600 mb-4 flex-grow flex items-center justify-center text-center">
                  {t("dashboardAccess.labourProviderDashboard.description")}
                </p>
                <Button
                  variant="outline"
                  className="w-full border-redFiredMustard-600 text-redFiredMustard-700 hover:bg-redFiredMustard-600 hover:text-white mt-auto"
                >
                  {t("dashboardAccess.labourProviderDashboard.loginRegister")}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer
        scrollToSection={scrollToSection}
        aboutRef={aboutRef}
        servicesRef={servicesRef}
        onboardingRef={onboardingRef}
        blogRef={blogRef}
      />
    </div>
  );
};

export default LandingPage;
