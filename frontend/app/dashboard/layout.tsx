import type { Metadata } from 'next';
import ClientLayout from './ClientLayout';

export const metadata: Metadata = {
  title: 'Dashboard | AnswerBase',
  openGraph: {
    title: 'Dashboard | AnswerBase',
    images: [],
  },
  twitter: {
    card: 'summary',
    title: 'Dashboard | AnswerBase',
    images: [],
  }
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <ClientLayout>{children}</ClientLayout>;
}
