"use client";

import { useState } from "react"; // Import useState hook
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export default function Home() {
  const router = useRouter();

  const supabase = createClientComponentClient();

  // State for email and password
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function getSupabaseUser() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    console.log(user);
    if (user) {
      window.location.href = "/editor";
    } else {
      console.log("user is not logged in");
    }
  }

  getSupabaseUser();

  async function signIn() {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    router.refresh();
    if (error) {
      console.error(error);
      return;
    }
    // Optionally redirect the user after sign in
  }

  return (
    <>
      <div className="flex min-h-full flex-1">
        <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
          <div className="mx-auto w-full max-w-sm lg:w-96">
            <div>
              <h2 className="mt-8 text-2xl font-bold leading-9 tracking-tight text-gray-900">
                Sign in to your IDE
              </h2>
            </div>

            {/* Email input */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {/* Password input */}
            <div className="mt-4">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {/* Submit button */}
            <div className="mt-6">
              <button
                type="button"
                className="rounded-md bg-btn-background px-4 py-2 no-underline hover:bg-btn-background-hover w-full"
                onClick={signIn}
              >
                Login
              </button>
            </div>
          </div>
        </div>
        <div className="relative hidden w-0 flex-1 lg:block">
          <img
            className="absolute inset-0 h-full w-full object-cover"
            src="https://raw.githubusercontent.com/denolib/high-res-deno-logo/master/deno_hr_circle.svg"
            alt=""
          />
        </div>
      </div>
    </>
  );
}
