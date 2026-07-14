import type { Metadata } from 'next';
import ClientPage from './ClientPage';

export const metadata: Metadata = {
  title: 'AnswerBase — Your Docs. Your AI Agent. Instant Answers.',
  description: 'Upload your help articles and policies. AnswerBase builds an AI support agent that answers customer questions with pinpoint accuracy. Embed it on your site in under two minutes.',
  openGraph: {
    title: 'AnswerBase — Your Docs. Your AI Agent. Instant Answers.',
    description: 'Upload your help articles and policies. AnswerBase builds an AI support agent that answers customer questions with pinpoint accuracy. Embed it on your site in under two minutes.',
    url: 'https://answerbase.nexusmod.works/',
    siteName: 'AnswerBase',
    images: [
      {
        url: 'https://answerbase.nexusmod.works/og-image-v3.jpg',
        width: 1200,
        height: 630,
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AnswerBase — Your Docs. Your AI Agent. Instant Answers.',
    description: 'Upload your help articles and policies. AnswerBase builds an AI support agent that answers customer questions with pinpoint accuracy. Embed it on your site in under two minutes.',
    images: ['https://answerbase.nexusmod.works/og-image-v3.jpg'],
  },
};

export default function HomePage() {
  return <ClientPage />;
}
