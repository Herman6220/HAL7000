"use client"

import { Button } from "./ui/button"
import Link from "next/link"
import { authClient } from "@/lib/auth-client"
import { useIsMobile } from "@/hooks/use-mobile"
import { MenuIcon } from "lucide-react"
import { SidebarTrigger } from "./ui/sidebar"
import { UserAvatar } from "./user-avatar"
import { AccountManageModal } from "./account-manage-modal"
import { useState } from "react"

const Navbar = () => {

  const [isAccountManageModalOpen, setIsAccountManageModalOpen] = useState(false);

  const isMobile = useIsMobile();

  const {data: session} = authClient.useSession();

  return (
    <>
      <div className="sticky top-0 z-40 w-full bg-neutral-900 border-b-neutral-800 border-b-1 pr-2 md:px-4 py-2 min-h-15 max-h-20 flex items-center justify-between">
        <AccountManageModal 
          open={isAccountManageModalOpen}
          onOpenChange={setIsAccountManageModalOpen}
          name={session?.user.name || ""}
          email={session?.user.email || ""}
          imageUrl={session?.user.image || "/unknown(dark).svg"}
        />
        <div className="flex items-center gap-1">
        {isMobile && <SidebarTrigger><MenuIcon size="14"/></SidebarTrigger>}
        <Link href="/" className="text-blue-400 font-bold">HAL <span className="font-extralight">7000</span></Link>
        </div>
        <div className="flex items-center justify-center gap-2">
          {!session ? (
            <>
              {/* <Button className="bg-orange-500 text-white">
                <Link href="/signup">Sign Up</Link>
              </Button> */}
              <Button className="bg-blue-700 text-white">
                <Link href="/signin">Sign In</Link>
              </Button>
            </>
          ) : (
            <>
              {/* <form action={signOutAction}>
                <Button type="submit" className="bg-red-700 text-white">
                  Sign Out
                </Button>
              </form> */}
              <div className="p-0.5 rounded-full border">
              <UserAvatar 
                imageUrl={session.user?.image || "/unknown(dark).svg"} 
                name={session.user.name} 
                size="default" 
                className="" 
                onClick={() => setIsAccountManageModalOpen(true)}/>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  )
}

export default Navbar