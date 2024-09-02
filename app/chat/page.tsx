"use client";

import Header from "@/app/components/header";
import ClientWrapper from "../components/ClientWrapper";
import { supabase } from "../supabaseClient"; // Adjust the import path as needed
import { useRouter } from "next/navigation";


export default function Home() {
  const router = useRouter();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      localStorage.removeItem(process.env.NEXT_PUBLIC_TOKEN_ID || "");
      localStorage.removeItem("user_data");
      router.push("/login");
    } else {
      console.error("Error during sign out:", error);
    }
  };

  return (
    <main className="h-screen w-screen flex justify-center items-center background-gradient">
      <div className="absolute top-4 right-4">
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded"
        >
          Logout
        </button>
      </div>
      <div className="space-y-2 lg:space-y-10 w-[90%] lg:w-[60rem]">
        <Header />
        <div className="h-[65vh] flex">
          <ClientWrapper />
        </div>
      </div>
    </main>
  );
}
