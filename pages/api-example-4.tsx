import { useSession } from 'next-auth/client'
import useSWR from 'swr'
import Layout from '../components/layout'
import ViewSource from 'components/view-source';
import AccessDenied from '../components/access-denied';
import { Profile } from '@interfaces/User';

function ApiExamplesPage() {
  const [session, loading] = useSession();
  // Session
  if (typeof window !== 'undefined' && loading) return null;
  if (!session) return <Layout><AccessDenied/></Layout>;

  const { data, error } = useSWR(`/api/examples/profile?name=${session.user.name}`);
  const profiles: Profile[] = data ? [].concat(data) : [];
  const isEmpty = profiles?.length === 0;

  return (
    <Layout>
      <div className="hidden md:block">
        <ViewSource pathname=''/>
      </div>
      <div className="mb-8">
        <h1 className="font-semibold text-2xl">42APIテスト profile</h1>
        <p className="text-sm"><em>/v2/users/{session.user.name}</em></p>
      </div>
      <p>{isEmpty ? <p>No users found.</p> : null}</p>
      {profiles.map((profile) => (
        !error &&
        <>
        <div>
          id: {profile.id}
        </div>
        <div>
          email: {profile.email}
        </div>
        </>
      ))}
      <iframe src={`/api/examples/profile?name=${session.user.name}`} />
    </Layout>
  );
}

export default ApiExamplesPage;

