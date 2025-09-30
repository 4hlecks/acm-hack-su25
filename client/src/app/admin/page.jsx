'use client'

export const dynamic = 'force-dynamic'

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminView() {
    const router = useRouter();
    
    useEffect(() => {
        router.push('/admin/dashboard');
    }, [router]);
    
    return null;
}
