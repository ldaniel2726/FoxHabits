'use client';

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
    const router = useRouter(); 

    const handleLogout = async () => {
        await fetch('/logout', { method: 'GET' });
        router.push('/login'); 
        router.refresh();
    };

    return (
        <Button variant="secondary" className="bg-transparent shadow-none text-base" onClick={handleLogout}>
            Kijelentkezés
        </Button>
    );
}
