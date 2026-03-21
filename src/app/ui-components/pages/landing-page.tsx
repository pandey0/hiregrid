
"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence, useScroll, useTransform, useSpring } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ArrowRight,
  Calendar,
  FileCheck,
  Users,
  CheckCircle,
  ClipboardList,
  BarChart3,
  Clock,
  Lightbulb,
  Check,
  Clock1,
  Clock2,
  Clock3,
  Sparkles,
  Shield,
  Zap,
  Lock,
  RefreshCw,
  Building2,
  Star,
  Rocket,
  Heart
} from 'lucide-react';
import type { TargetAndTransition } from "framer-motion";


// Define types for workflow steps
type WorkflowStep = {
  title: string;
  description: string;
  icon: React.ReactNode;
};

type WorkflowSteps = {
  candidates: WorkflowStep[];
  admins: WorkflowStep[];
  panel: WorkflowStep[];
};

export default function LandingPage() {
const router = useRouter();
  const [activeTab, setActiveTab] = useState('candidates');
  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  useEffect(() => {
    setIsVisible(true);
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Enhanced animations
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.42, 0, 0.58, 1] as [number, number, number, number] // ✅ explicit tuple type
    }
  }
};



  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  };


const floatingAnimation: TargetAndTransition = {
  y: [-10, 10],
  transition: {
    duration: 2,
    repeat: Infinity,
    repeatType: "reverse",
    ease: "easeInOut" // ✅ Now allowed because of explicit cast
  }
};


  // Interactive workflow steps
  const workflowSteps: WorkflowSteps = {
    candidates: [
      {
        title: "Fill Personal Details",
        description: "Complete your profile and submit required information through customized forms.",
        icon: <Users className="h-8 w-8 text-blue-600" />
      },
      {
        title: "Select Interview Slot",
        description: "Choose your preferred interview time from available slots.",
        icon: <Calendar className="h-8 w-8 text-blue-600" />
      },
      {
        title: "Track Application Status",
        description: "Monitor your interview progress through a personal dashboard.",
        icon: <BarChart3 className="h-8 w-8 text-blue-600" />
      }
    ],
    admins: [
      {
        title: "Configure Interview Process",
        description: "Define custom forms, interview rounds, and panel requirements.",
        icon: <ClipboardList className="h-8 w-8 text-blue-600" />
      },
      {
        title: "Manage Communications",
        description: "Send automated emails and updates to candidates and panelists.",
        icon: <FileCheck className="h-8 w-8 text-blue-600" />
      },
      {
        title: "Track & Schedule Interviews",
        description: "Monitor progress, schedule rounds, and collect feedback.",
        icon: <Clock className="h-8 w-8 text-blue-600" />
      }
    ],
    panel: [
      {
        title: "Set Availability",
        description: "Mark your available time slots for interview scheduling.",
        icon: <Calendar className="h-8 w-8 text-blue-600" />
      },
      {
        title: "Conduct Interviews",
        description: "Attend scheduled interviews with candidates.",
        icon: <Users className="h-8 w-8 text-blue-600" />
      },
      {
        title: "Submit Feedback",
        description: "Provide structured feedback through customized forms.",
        icon: <FileCheck className="h-8 w-8 text-blue-600" />
      }
    ]
  };

  const features = [
    {
      icon: <Users className="h-10 w-10 text-blue-600/80" />,
      title: 'Candidate Management',
      description: 'Efficiently manage and track candidates throughout your interview pipeline'
    },
    {
      icon: <FileCheck className="h-10 w-10 text-blue-600/80" />,
      title: 'Resume Processing',
      description: 'Streamlined resume handling with bulk upload capabilities and calendar integration'
    },
    {
      icon: <Calendar className="h-10 w-10 text-blue-600/80" />,
      title: 'Calendar Integration',
      description: 'Seamless Microsoft Calendar integration for efficient interview scheduling'
    },
    {
      icon: <ClipboardList className="h-10 w-10 text-blue-600/80" />,
      title: 'Program Customization',
      description: 'Create tailored interview programs with multiple rounds and expert panelists'
    },
    {
      icon: <Clock className="h-10 w-10 text-blue-600/80" />,
      title: 'Availability Management',
      description: 'Intelligent scheduling system for coordinating interviewer availability'
    },
    {
      icon: <BarChart3 className="h-10 w-10 text-blue-600/80" />,
      title: 'Analytics Dashboard',
      description: 'Comprehensive tracking and insights for your interview process'
    }
  ];

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-white overflow-hidden">
      {/* Progress bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-blue-600 origin-left z-50"
        style={{ scaleX }}
      />

      {/* Enhanced Header */}
      <header 
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          isScrolled ? 'bg-[#0D0D0D]/80 backdrop-blur-xl border-b border-white/10' : 'bg-transparent'
        }`}
      >
        <div className="container mx-auto py-4 px-6">
          <div className="flex justify-between items-center">
            <motion.div 
              className="flex items-center space-x-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
            <div className="relative">
                <motion.div 
                  className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur opacity-70"
                  animate={{ 
                    scale: [1, 1.2, 1],
                    rotate: [0, 180, 360] 
                  }}
                  transition={{ 
                    duration: 3,
                    repeat: Infinity,
                    ease: "linear" 
                  }}
                />
                <CheckCircle className="h-8 w-8 text-white relative" />
            </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 text-transparent bg-clip-text">
              HireGrid
            </h1>
            </motion.div>

            <motion.div 
              className="flex items-center space-x-4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Button
                variant="ghost"
onClick={() => router.push('/sign-in')}
                className="text-white hover:bg-white/10 transition-all duration-200"
            >
              Sign In
            </Button>
            <Button
onClick={() => router.push('/sign-up')}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-blue-500/25 transition-all duration-200"
            >
              Sign Up
            </Button>
            </motion.div>
          </div>
        </div>
      </header>

      {/* Hero Section with enhanced animations */}
      <section className="pt-32 pb-20 md:pt-40 md:pb-32 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-600/10 to-purple-600/10" />
        
        {/* Animated background elements */}
        {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
            className="absolute rounded-full bg-gradient-to-r from-blue-500 to-purple-500"
              style={{
              width: Math.random() * 100 + 50,
              height: Math.random() * 100 + 50,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              opacity: 0.1,
              filter: 'blur(40px)',
              }}
              animate={{
              scale: [1, 1.2, 1],
              x: [0, Math.random() * 50 - 25],
              y: [0, Math.random() * 50 - 25],
              }}
              transition={{
              duration: Math.random() * 5 + 5,
                repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut",
              }}
            />
          ))}

        <div className="container mx-auto px-6 relative z-10">
        <motion.div
            className="text-center max-w-5xl mx-auto"
            variants={staggerContainer}
          initial="hidden"
          animate="visible"
            >
            <motion.div variants={fadeInUp} >
              <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold mb-6 leading-tight">
                Transform Your
                <motion.span 
                  className="block mt-2 bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 text-transparent bg-clip-text"
                  animate={{ 
                    backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                  }}
                  transition={{ 
                    duration: 5,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                >
                  Hiring Process
                </motion.span>
          </h1>
        </motion.div>

            <motion.p 
              className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed mb-12"
              variants={fadeInUp}
            >
              Streamline your interview management with AI-powered coordination and intelligent matching ✨
            </motion.p>

        <motion.div
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
              variants={fadeInUp}
            >
              <Button
onClick={() => router.push('/sign-in')}
                className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-6 text-lg rounded-xl shadow-lg hover:shadow-blue-500/25 transition-all duration-200 flex items-center justify-center group relative overflow-hidden"
              >
                <motion.span
                  className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20"
                  animate={{
                    scale: [1, 1.5],
                    opacity: [0, 0.5, 0],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeOut",
                  }}
                />
                Get Started Free
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>

              <Button
                variant="outline"
                className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-6 text-lg rounded-xl shadow-lg hover:shadow-blue-500/25 transition-all duration-200 flex items-center justify-center group relative overflow-hidden"
              >
                <Calendar className="mr-2 h-5 w-5 group-hover:rotate-12 transition-transform" />
                Schedule a Demo
              </Button>
            </motion.div>
            </motion.div>

          {/* Feature highlights with enhanced animations */}
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mt-20"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {[
              {
                icon: <Rocket className="h-6 w-6 text-blue-400" />,
                  title: "AI-Powered Matching",
                description: "Intelligent candidate-interviewer pairing for optimal results"
                },
                {
                icon: <Star className="h-6 w-6 text-purple-400" />,
                  title: "Enterprise Security",
                description: "Advanced protection for your sensitive data"
              },
              {
                icon: <Heart className="h-6 w-6 text-pink-400" />,
                title: "Culture Alignment",
                description: "Smart assessment of organizational fit"
                }
              ].map((feature, index) => (
                <motion.div
                  key={index}
                className="bg-white/5 backdrop-blur-xl rounded-xl p-6 border border-white/10 hover:border-white/20 transition-all duration-200"
                variants={fadeInUp}
                whileHover={{ y: -5, scale: 1.02 }}
              >
                <motion.div 
                  className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 w-12 h-12 rounded-lg flex items-center justify-center mb-4"
                  animate={floatingAnimation}
                >
                    {feature.icon}
                </motion.div>
                <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
                </motion.div>
              ))}
          </motion.div>
                  </div>
      </section>

      {/* Workflow Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-[#111] bg-opacity-50 backdrop-blur-3xl" />
        
        {/* Animated gradient orbs */}
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20"
            style={{
              width: Math.random() * 300 + 200,
              height: Math.random() * 300 + 200,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              filter: 'blur(80px)',
            }}
            animate={{
              x: [0, Math.random() * 100 - 50],
              y: [0, Math.random() * 100 - 50],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              repeatType: "reverse" as const,
              ease: "easeInOut",
            }}
          />
        ))}

        <div className="container mx-auto px-6 relative z-10">
        <motion.div
            className="text-center mb-16"
            variants={staggerContainer}
          initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <motion.span 
              variants={fadeInUp}
              className="text-blue-400 font-semibold mb-4 inline-block text-lg"
            >
              How It Works
            </motion.span>
            <motion.h2 
              variants={fadeInUp} 
              className="text-4xl md:text-5xl font-bold mb-6 text-white"
            >
              Intelligent Interview
              <span className="block mt-2 bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 text-transparent bg-clip-text">
              Management
            </span>
            </motion.h2>
            <motion.p 
              variants={fadeInUp}
              className="text-xl text-gray-300 max-w-3xl mx-auto"
            >
              Experience seamless coordination with our advanced workflow system
            </motion.p>
        </motion.div>

          <Tabs defaultValue="candidates" className="w-full" onValueChange={setActiveTab}>
            <motion.div 
              className="flex justify-center mb-12"
              variants={fadeInUp}
            >
              <TabsList className="inline-flex bg-white/5 backdrop-blur-xl shadow-lg rounded-2xl p-2 gap-2 border border-white/10">
              <TabsTrigger
                value="candidates"
                  className="min-w-[160px] px-6 py-3 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200 text-gray-300"
              >
                Candidates
              </TabsTrigger>
              <TabsTrigger
                  value="admins"
                  className="min-w-[160px] px-6 py-3 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200 text-gray-300"
              >
                  HR/Admins
              </TabsTrigger>
              <TabsTrigger
                  value="panel"
                  className="min-w-[160px] px-6 py-3 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200 text-gray-300"
              >
                  Panel
              </TabsTrigger>
            </TabsList>
            </motion.div>

          <AnimatePresence mode="wait">
            {(Object.keys(workflowSteps) as Array<keyof WorkflowSteps>).map((tabKey) => (
              activeTab === tabKey && (
                <TabsContent key={tabKey} value={tabKey} className="mt-0 pt-0">
                  <motion.div
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                      variants={staggerContainer}
                    className="max-w-5xl mx-auto"
                  >
                    <div className="grid md:grid-cols-3 gap-8">
                      {workflowSteps[tabKey].map((step: WorkflowStep, index: number) => (
                        <motion.div
                          key={index}
                            variants={fadeInUp}
                            className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10 hover:border-white/20 transition-all duration-300 group"
                            whileHover={{ y: -5, scale: 1.02 }}
                        >
                          <div className="mb-6 relative">
                              <motion.div 
                                className="absolute -inset-2 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-2xl"
                                animate={floatingAnimation}
                              />
                              <div className="relative bg-white/5 w-14 h-14 rounded-xl shadow-sm flex items-center justify-center text-blue-400 group-hover:text-blue-300 transition-colors duration-300">
                            {step.icon}
                          </div>
                          </div>
                            <h3 className="text-xl font-semibold mb-3 text-white group-hover:text-blue-400 transition-colors duration-300">
                            {step.title}
                          </h3>
                            <p className="text-gray-400 leading-relaxed">
                            {step.description}
                          </p>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                </TabsContent>
              )
            ))}
          </AnimatePresence>
        </Tabs>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-600/5 via-purple-600/5 to-blue-600/5" />

        <div className="container mx-auto px-6 relative z-10">
        <motion.div
          className="text-center mb-16"
            variants={staggerContainer}
          initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <motion.span 
              variants={fadeInUp}
              className="text-blue-400 font-semibold mb-4 inline-block text-lg"
            >
              Features
            </motion.span>
            <motion.h2 
              variants={fadeInUp}
              className="text-4xl md:text-5xl font-bold mb-6 text-white"
            >
              Everything You Need for
              <span className="block mt-2 bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 text-transparent bg-clip-text">
                Modern Hiring
              </span>
            </motion.h2>
            <motion.p 
              variants={fadeInUp}
              className="text-xl text-gray-300 max-w-3xl mx-auto"
            >
              Comprehensive tools designed to enhance your recruitment process
            </motion.p>
        </motion.div>

          <motion.div 
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
          {features.map((feature, index) => (
            <motion.div
              key={index}
                variants={fadeInUp}
                className="group relative"
                whileHover={{ y: -5, scale: 1.02 }}
              >
                <div className="absolute -inset-px bg-gradient-to-r from-blue-600/50 to-purple-600/30 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10 hover:border-white/20 transition-all duration-300">
                  <div className="mb-6">
                    <motion.div 
                      className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 w-16 h-16 rounded-xl flex items-center justify-center text-blue-400 group-hover:text-blue-300 transition-colors duration-300"
                      animate={floatingAnimation}
                    >
                      {feature.icon}
                    </motion.div>
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-white group-hover:text-blue-400 transition-colors duration-300">
                    {feature.title}
                  </h3>
                  <p className="text-gray-400 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
            </motion.div>
          ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-purple-600/5 to-blue-600/10" />
          
          {/* Animated shapes */}
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
            className="absolute bg-gradient-to-r from-blue-500/10 to-purple-500/10"
              style={{
              width: Math.random() * 500 + 300,
              height: Math.random() * 500 + 300,
                borderRadius: '40%',
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              filter: 'blur(100px)',
              }}
              animate={{
              x: [0, Math.random() * 100 - 50],
              y: [0, Math.random() * 100 - 50],
              rotate: [0, 360],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: Math.random() * 20 + 20,
                repeat: Infinity,
              repeatType: "reverse" as const,
              ease: "easeInOut",
              }}
            />
          ))}

        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-5xl mx-auto text-center">
          <motion.div
              initial="hidden"
              whileInView="visible"
            viewport={{ once: true }}
              variants={staggerContainer}
            >
              <motion.h2 
                variants={fadeInUp}
                className="text-4xl md:text-6xl font-bold mb-8 text-white"
              >
                Ready to Transform Your
                <motion.span 
                  className="block mt-3 bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 text-transparent bg-clip-text"
                  animate={{ 
                    backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                  }}
                  transition={{ 
                    duration: 5,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                >
                  Hiring Process?
                </motion.span>
              </motion.h2>
              <motion.p 
                variants={fadeInUp}
                className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto"
              >
                Join leading companies leveraging HireGrid's intelligent platform for better hiring outcomes
              </motion.p>
              <motion.div 
                variants={fadeInUp}
                className="flex flex-col sm:flex-row items-center justify-center gap-6"
              >
                <Button
onClick={() => router.push('/sign-in')}
                  className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-6 text-lg rounded-xl shadow-lg hover:shadow-blue-500/25 transition-all duration-200 flex items-center justify-center group relative overflow-hidden"
                >
                  <motion.span
                    className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20"
                    animate={{
                      scale: [1, 1.5],
                      opacity: [0, 0.5, 0],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "easeOut",
                    }}
                  />
                  Get Started Free
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button
                variant="outline"
                className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-6 text-lg rounded-xl shadow-lg hover:shadow-blue-500/25 transition-all duration-200 flex items-center justify-center group relative overflow-hidden"
              >
                <Calendar className="mr-2 h-5 w-5 group-hover:rotate-12 transition-transform" />
                Schedule a Demo
              </Button>
              </motion.div>
          </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-[#111] bg-opacity-50 backdrop-blur-3xl" />
        
        <div className="container mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
              <div className="space-y-6">
                <div className="flex items-center space-x-3">
                <motion.div 
                  className="relative"
                  animate={{ 
                    rotate: [0, 360] 
                  }}
                  transition={{ 
                    duration: 20,
                    repeat: Infinity,
                    ease: "linear" 
                  }}
                >
                  <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur opacity-70" />
                  <CheckCircle className="h-8 w-8 text-white relative" />
                </motion.div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 text-transparent bg-clip-text">
                  HireGrid
                </h2>
              </div>
              <p className="text-gray-400">
                  Transforming the interview process for hiring teams worldwide.
              </p>
            </div>
              {[
                {
                  title: "Product",
                  links: ["Features", "Pricing", "Case Studies", "Documentation"]
                },
                {
                  title: "Company",
                  links: ["About Us", "Careers", "Blog", "Contact"]
                },
                {
                  title: "Legal",
                links: ["Privacy Policy", "Terms of Service", "Security"]
                }
              ].map((section, index) => (
                <div key={index}>
                  <h3 className="text-lg font-semibold text-white mb-6">{section.title}</h3>
                  <ul className="space-y-4">
                    {section.links.map((link, linkIndex) => (
                      <li key={linkIndex}>
                        <a
                          href="#"
                        className="text-gray-400 hover:text-blue-400 transition-colors duration-200"
                        >
                          {link}
                        </a>
                      </li>
                    ))}
              </ul>
            </div>
              ))}
            </div>
          <div className="mt-12 pt-8 border-t border-white/10 text-center text-sm text-gray-400">
            © {new Date().getFullYear()} HireGrid. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
