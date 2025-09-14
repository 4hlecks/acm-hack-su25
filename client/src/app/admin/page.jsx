import { redirect } from 'next/navigation';

export default function AdminView() {
    redirect('/admin/dashboard');
}