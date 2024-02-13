"use client";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

const getURL = () => {
  let url =
    process.env.NEXT_PUBLIC_SITE_URL ?? // Set this to your site URL in production env.
    process.env.NEXT_PUBLIC_VERCEL_URL ?? // Automatically set by Vercel.
    "http://localhost:3000/";

  // Make sure to include https:// when not localhost.
  url = url.includes("http") ? url : `https://${url}`;
  // Make sure to including trailing /.
  url = url.charAt(url.length - 1) === "/" ? url : `${url}/`;
  return url;
};

export default function Home() {
  const supabase = createClientComponentClient();

  async function getSupabaseUser() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    console.log(user);
    if (user) {
      // redirect to editor page
      window.location.href = "/editor";
    } else {
      console.log("user is not logged in");
    }
  }

  getSupabaseUser();

  async function signIn() {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${getURL()}auth/callback`,
      },
    });
    if (error) {
      console.error(error);
      return;
    }
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

            <button
              type="button"
              className="rounded-md bg-btn-background px-4 py-2 no-underline hover:bg-btn-background-hover"
              onClick={signIn}
            >
              Login
            </button>
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
