"use client";

import CustomButton from "@/components/ui/custom-button";
import { ArrowLeft } from "lucide-react";
import { useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

const Page = () => {
  const { signOut } = useClerk();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut();
    // router.push("/sign-in");
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      {/* Top bar */}
      <div className="p-3 sm:p-4">
        <CustomButton onClick={handleLogout}>
          <span className="flex items-center gap-2 text-sm">
            <ArrowLeft size={14} />
            Back
          </span>
        </CustomButton>
      </div>

      {/* Content */}
      <div className="flex flex-1 items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <h1 className="text-xl sm:text-2xl font-bold text-red-800">
            Your account has been deleted
          </h1>

          <p className="mt-3 sm:mt-4 text-sm sm:text-base text-gray-600">
            We're sorry to see you go.
            <br className="hidden sm:block" />
            If you have any questions, please contact your admin.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Page;
