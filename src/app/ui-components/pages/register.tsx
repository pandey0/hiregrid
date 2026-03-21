"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Mail,
  Lock,
  Loader2,
  CheckCircle,
  Building2,
  Sparkles,
  User,
} from "lucide-react";
import { toast } from "sonner";
import { signUp } from "@/lib/auth-client";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");

  const router = useRouter();

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.42, 0, 0.58, 1] as [number, number, number, number],
      },
    },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      },
    },
  };

 const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  // Start loading
  setIsLoading(true);

  try {
    // Basic validations
    if (!name || !email || !password || !confirmPassword) {
      toast.error("Please fill in all fields.");
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      setIsLoading(false);
      return;
    }

    // Sign-up call
    await signUp.email(
      { email, password, name },
      {
        onRequest: () => {
          toast.loading("Creating your account...");
        },
        onResponse: () => {
          toast.dismiss(); // Remove the loading toast
          toast.success("Registration successful 🎉", {
            description: "Please check your email for verification.",
          });
        },
        onError: (err: any) => {
          toast.dismiss();
          toast.error("Registration failed", {
            description: err?.error.message || "Something went wrong",
          });
        },
      }
    );
  } catch (err: any) {
    toast.error("Registration failed", {
      description: err?.message || "Something went wrong",
    });
  } finally {
    setIsLoading(false);
  }
};

  return (
    <div className="min-h-screen flex bg-[#0D0D0D] text-white relative overflow-hidden">
      {/* Background animation */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-600/10 to-purple-600/10" />
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10"
            style={{
              width: Math.random() * 300 + 200,
              height: Math.random() * 300 + 200,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              filter: "blur(80px)",
            }}
            animate={{
              x: [0, Math.random() * 100 - 50],
              y: [0, Math.random() * 100 - 50],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* Left section */}
      <div className="hidden lg:flex w-1/2 p-12 flex-col justify-center items-center relative">
        <motion.div
          className="text-center relative z-10"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={fadeInUp} className="mb-8">
            <div className="w-32 h-32 mx-auto relative">
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur opacity-70"
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, 180, 360],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "linear",
                }}
              />
              <div className="relative bg-[#0D0D0D] rounded-full w-full h-full flex items-center justify-center">
                <CheckCircle className="w-16 h-16 text-blue-400" />
              </div>
            </div>
          </motion.div>

          <motion.h1 variants={fadeInUp} className="text-5xl font-bold mb-6">
            Join
            <span className="block mt-2 bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 text-transparent bg-clip-text">
              HireGrid
            </span>
          </motion.h1>

          <motion.p variants={fadeInUp} className="text-xl text-gray-300 mb-12">
            Build your dream hiring workflow 🛠️
          </motion.p>

          <motion.div
            variants={fadeInUp}
            className="grid grid-cols-2 gap-6 max-w-xl mx-auto"
          >
            <div className="flex items-start space-x-3">
              <div className="bg-white/5 backdrop-blur-xl p-3 rounded-xl">
                <Building2 className="w-6 h-6 text-blue-400" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold mb-1">Scale with Ease</h3>
                <p className="text-sm text-gray-400">
                  Grow your team effortlessly
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="bg-white/5 backdrop-blur-xl p-3 rounded-xl">
                <Sparkles className="w-6 h-6 text-purple-400" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold mb-1">AI Smart Tools</h3>
                <p className="text-sm text-gray-400">
                  Smart screening & analytics
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Right form section */}
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div
          className="w-full max-w-md space-y-8"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          <Card className="border-0 shadow-xl bg-white/5 backdrop-blur-xl text-white">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold text-center">
                Create your account
              </CardTitle>
              <CardDescription className="text-center text-gray-400">
                Join the future of hiring today
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm text-gray-300">
                    Full Name
                  </Label>
                  <div className="relative group">
                    <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <Input
                      id="name"
                      placeholder="Jane Doe"
                      className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-500"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm text-gray-300">
                    Email
                  </Label>
                  <div className="relative group">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-500"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm text-gray-300">
                    Password
                  </Label>
                  <div className="relative group">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <Input
                      id="password"
                      type="password"
                      className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-500"
                      value={password}
                      placeholder="password"
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="confirm-password"
                      className="text-sm text-gray-300"
                    >
                      Confirm Password
                    </Label>
                    <div className="relative group">
                      <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      <Input
                        id="confirm-password"
                        type="password"
                        placeholder="Confirm password"
                        className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-500"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-blue-500/25 transition-all duration-200"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    "Sign up"
                  )}
                </Button>
              </form>

              <div className="text-center pt-4 text-sm">
                <span className="text-gray-400">Already have an account? </span>
                <Button
                  variant="link"
                  className="p-0 text-blue-400 hover:text-blue-300 font-medium"
                  onClick={() => router.push("/sign-in")}
                >
                  Sign in
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Register;
