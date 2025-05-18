import dynamic from 'next/dynamic';

const CreatePollForm = dynamic(() => import('@/components/voting-app/CreatePollForm'), { ssr: false });
const PollList = dynamic(() => import('@/components/voting-app/PollList'), { ssr: false });

export default function Home() {
  return (
    <main className="p-6 space-y-10">
      <CreatePollForm />
      <PollList />
    </main>
  );
}
