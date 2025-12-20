"use client";

import CustomButton from "@/components/ui/custom-button";
import { ArrowLeft } from "lucide-react";
import { useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

const Page = () => {
  const { signOut } = useClerk();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut();          // 🔐 clear Clerk session
    // router.push("/sign-in");  // 🚀 redirect
  };

  return (
    <div>
      <div className="p-4">
        <CustomButton onClick={handleLogout} >
           <span className="flex items-center gap-2">
              <ArrowLeft size={14} />
              Back
            </span>
        </CustomButton>
      </div>

      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <h1 className="text-2xl font-bold text-red-800">
          Your account has been deleted.
        </h1>
        <p className="mt-4 text-gray-600">
          We're sorry to see you go. If you have any questions, please contact your admin.
        </p>
      </div>
    </div>
  );
};

export default Page;
