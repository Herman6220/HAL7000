"use client"

import Footer from "@/components/Footer";
import Image from "next/image";
import Link from "next/link";

export default function Home() {


  return (
    <>
      <div className="w-full min-h-screen bg-black">
        <div className="w-full flex items-center justify-center min-h-[100vh] p-10">
          <div className="flex flex-col md:flex-row gap-20 items-center justify-between w-full md:px-30">

            <div className="z-10 p-1 bg-gradient-to-br from-gray-400 via-gray-900 to-gray-100 flex flex-col items-center justify-center gap-1 relative">
              <div className="absolute w-80 aspect-square bg-red-900 rounded-full blur-3xl opacity-80 -z-10"></div>
              <div className="p-4 py-6 bg-gradient-to-b from-neutral-800 to-black"
                style={{boxShadow: "inset 0 0 30px rgba(0,0,0,1), inset 0 0 50px rgba(0,0,0,1)"}}
              >
                <div className="flex flex-col items-center">
                  <div className="flex border border-white/50 w-40 mb-40 shadow-md shadow-black">
                    <div className="bg-blue-500/50 text-end w-full px-2">
                      HAL
                    </div>
                    <div className="bg-black w-full px-2">
                      7000
                    </div>
                  </div>
                  <Image src="/hal3.jpg" alt="HAL 9000" width="180" height="180" className="" priority/>
                </div>
              </div>
              <div className=" w-full h-30 bg-neutral-700/50 bg-[radial-gradient(#000000_2px,transparent_2px)] [background-size:4px_4px]"
                style={{boxShadow: "inset 0 0 30px rgba(0,0,0,1), inset 0 0 50px rgba(0,0,0,1)"}}
              ></div>
            </div>

            <Link href="/conversation">
              <div className="w-full max-w-sm min-h-30 p-7 rounded-2xl border border-neutral-700 shadow-2xl shadow-neutral-800 hover:shadow-md hover:scale-98 bg-neutral-950">
                <h1 className="font-semibold text-2xl text-blue-500">Start now</h1>
                <p className="font-extralight text-muted-foreground text-sm">Get access to the world&apos;s fastest model.</p>
                <p className="font-extralight text-muted-foreground text-sm">HAL 7000</p>
              </div>
            </Link>

          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
