import { LogOutIcon, PlusIcon } from "lucide-react";
import { ResponsiveModal } from "./responsive-modal";
import { UserAvatar } from "./user-avatar";
import { signOutAction } from "@/app/actions/auth";


interface AccountManageModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    name: string;
    email: string;
    imageUrl: string;
}

export const AccountManageModal = ({
    open,
    onOpenChange,
    name,
    email,
    imageUrl,
}: AccountManageModalProps) => {
    return (
        <ResponsiveModal
            title=""
            open={open}
            onOpenChange={onOpenChange}
        >
            <div className="flex flex-col gap-4 items-center">
                <div className="flex flex-col gap-2 items-center">
                    <p className="text-sm font-extralight">{email}</p>
                    <div className="rounded-full border-2 border-blue-500 p-0.5">
                        <UserAvatar
                            imageUrl={imageUrl}
                            name={name}
                            size="lg"
                        />
                    </div>
                    <p>Hi, {name}!</p>
                </div>
                <button 
                    disabled={true}
                    className="text-sm rounded-full border border-neutral-200 py-2 px-4 text-blue-400 hover:bg-neutral-800 cursor-pointer disabled:opacity-50">
                    Manage your accounts
                </button>
                <div className="w-full flex flex-col gap-1">

                    <div className="bg-neutral-950 w-full p-4 px-8 rounded-t-3xl rounded text-sm">
                        Accounts
                    </div>
                    <button
                        disabled={true} 
                        className="bg-neutral-950 hover:bg-neutral-800 rounded p-4 px-8 text-sm flex items-center gap-1.5 disabled:opacity-50">
                        <PlusIcon size="18" className="bg-blue-500/40 rounded-full p-0.5" />
                        Add another account
                    </button>
                    <form action={signOutAction} className="w-full">
                        <button
                            type="submit"
                            className="bg-neutral-950 hover:bg-neutral-800 rounded rounded-b-3xl p-4 px-8 text-sm flex items-center gap-1.5 w-full"
                        >
                            <LogOutIcon size="18" />
                            Sign out
                        </button>
                    </form>
                </div>
            </div>
        </ResponsiveModal>
    )
}