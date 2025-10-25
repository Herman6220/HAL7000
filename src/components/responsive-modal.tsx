import { useIsMobile } from "@/hooks/use-mobile";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "./ui/drawer";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";


interface ResponsiveModalProps{
    children: React.ReactNode;
    open: boolean,
    title: string,
    onOpenChange: (open: boolean) => void;
}

export const ResponsiveModal = ({
    children,
    open,
    title,
    onOpenChange,
}: ResponsiveModalProps) => {
    const isMobile = useIsMobile();

    if(isMobile){
        return(
            <Drawer open={open} onOpenChange={onOpenChange}>
                <DrawerContent className="pb-10 px-2">
                    <DrawerHeader>
                        <DrawerTitle>
                            {title}
                        </DrawerTitle>
                    </DrawerHeader>
                    {children}
                </DrawerContent>
            </Drawer>
        )
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="rounded-[34px] left-[82%] top-[40%]">
                <DialogHeader className="hidden">
                    <DialogTitle>
                        {title}
                    </DialogTitle>
                </DialogHeader>
                {children}
            </DialogContent>
        </Dialog>
    )
}