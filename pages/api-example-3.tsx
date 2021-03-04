import { useSession } from 'next-auth/client'
import { useSWRInfinite } from 'swr';
import Link from 'next/link';

import Layout from '../components/layout';
import AccessDenied from '../components/access-denied';
import { User } from '@interfaces/User';
import ViewSource from '../components/view-source';
import { PAGE_SIZE } from '../utils/constants'
import { CAMPUS_ID } from '../utils/constants'

function getKey(pageIndex, previousPageData) {
  if (previousPageData && !previousPageData.length) return null;
  console.log('GETTING KEY: ', `/api/examples/users?page=${pageIndex}&limit=${PAGE_SIZE}`);
  return `/api/examples/users?page=${pageIndex + 1}&limit=${PAGE_SIZE}`;
}

function isValidUser(user: User) {
  return !user.login.includes('3b3-')
    && !user.login.includes('unko')
    && !user.login.includes('aaaaaa')
    && !user.login.includes('test');
}

function ApiExamplePage() {
  const [session, loading] = useSession();

  // Data is an array of pages of User array
  const { data, error, size, setSize } = useSWRInfinite(getKey);
  const users: User[] = data ? [].concat(...data) : [];
  const isLoadingInitialData = !data && !error;
  const isLoadingMore = isLoadingInitialData || (size > 0 && data && typeof data[size - 1] === 'undefined');
  const isEmpty = data?.[0]?.length === 0;
  const isReachingEnd = isEmpty || (data && data[data.length - 1]?.length < PAGE_SIZE);

  // Session
  if (typeof window !== 'undefined' && loading) return null;
  if (!session) return <Layout><AccessDenied/></Layout>;

  return (
    <Layout>
      <div className="hidden md:block">
        <ViewSource pathname=''/>
      </div>
      <div className="mb-8">
        <h1 className="font-semibold text-2xl">42APIテスト users</h1>
        <p className="text-sm"><em>/v2/campus/{CAMPUS_ID}/users?sort=-id</em></p>
      </div>
      <div className="w-full">
        <p>{isEmpty ? <p>No users found.</p> : null}</p>
        <ul className="flex flex-wrap space-y-4">
          {users.map((user) => (
            isValidUser(user) &&
            <>
              <li key={user.id} className="w-1/2">
                <div className="flex flex-row space-x-4">
                  <div className="relative h-24 w-24">
                    <img
                      className="object-cover h-24 w-24"
                      src={`https://cdn.intra.42.fr/users/small_${user.login}.jpg`}
                      alt={`${user.login}`}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = `https://cdn.intra.42.fr/users/small_default.jpg`
                      }}
                    />
                  </div>
                  <div>
                    <p>ID: {user.id}</p>
                    <p>login: {user.login}</p>
                    <Link href={`https://profile.intra.42.fr/users/${user.login}`}>
                      <a className="text-blue-700">プロフィールを見る</a>
                    </Link>
                  </div>
                </div>
              </li>
            </>
          ))}
        </ul>
        <p>
          <button
            disabled={isLoadingMore || isReachingEnd}
            onClick={() => setSize(size + 1)}
          >
            {isLoadingMore
              ? 'ロード中'
              : isReachingEnd
                ? 'これ以上ユーザーはいません'
                : 'もっと見る'}
          </button>
        </p>
      </div>
    </Layout>
  );
}

export default ApiExamplePage;
