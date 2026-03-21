"use client";

import { Button } from "@/components/ui/button";
import { signOut } from "@/lib/auth-client";
        import { useRouter } from 'next/navigation';
        import { toast } from "sonner";

 export const Navbar = () => {
    const router = useRouter();
     async function handlelogout() {
         await signOut({
            fetchOptions: {
                onSuccess: () => {
                   router.push('/')
                    toast.success("Logout successful")
                },
                onError: () => {
                    toast.error("Logout failed")
                }
            }
         })
     }

   
  return (
    <nav className="bg-slate-800 text-white p-4 flex justify-between">
      <h1 className="text-lg font-bold">HireGrid AI</h1>
      <div className="flex items-center gap-4">
        {/* Add other nav links or buttons here */}
        <Button variant="ghost" onClick={handlelogout}>Logout</Button>
      </div>
    </nav>
  );
 }