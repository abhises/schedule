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
  router.replace("/sign-in"); // ⬅ replace, not push
};


  return (
    <div>
      {/* Top bar */}
      <div className="p-4">
        <CustomButton onClick={handleLogout}>
          <span className="flex items-center gap-2">
            <ArrowLeft size={14} />
            Back
          </span>
        </CustomButton>
      </div>

      {/* Content */}
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-center px-4">
        <h1 className="text-2xl font-bold text-yellow-700">
          You’re on the waitlist
        </h1>

        <p className="mt-4 text-gray-600 max-w-md">
          Your account has been created successfully, but access to the dashboard
          hasn’t been granted yet.
        </p>

        <p className="mt-2 text-gray-500 max-w-md">
          Please contact your administrator or wait until your access is approved.
        </p>
      </div>
    </div>
  );
};

export default Page;
