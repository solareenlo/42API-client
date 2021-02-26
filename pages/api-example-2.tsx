import { useState } from 'react'
import { useSession } from 'next-auth/client'
import { useRouter } from 'next/router';
import useSWR from 'swr';
import { useSWRInfinite } from 'swr';
import Link from 'next/link';

import Layout from '../components/Layout'
import AccessDenied from '../components/access-denied'
import { CursusUser } from '@interfaces/Cursus';
import ViewSource from '../components/view-source';

const PAGE_SIZE = 100;

function getKey(pageIndex, previousPageData) {
  if (previousPageData && !previousPageData.length) return null;
  console.log('GETTING KEY: ', `/api/examples/cursus_users?page=${pageIndex}&limit=100`);
  return `/api/examples/cursus_users?page=${pageIndex + 1}&limit=100`;
}

function isValidCursusUser(cursusUser: CursusUser) {
  return cursusUser.blackholed_at && !cursusUser.user.login.includes('unko');
}

function ApiExamplePage() {
  const [session, loading] = useSession();

  // Data is an array of pages of CursusUser array
  const { data, error, size, setSize } = useSWRInfinite(getKey);
  const cursusUsers: CursusUser[] = data ? [].concat(...data) : [];
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
        <h1 className="font-semibold text-2xl">42APIテスト2</h1>
        <p className="text-sm"><em>/v2/cursus/21/cursus_users?filter[campus_id]=26&sort=-blackholed_at</em></p>
      </div>
      <div className="w-full">
        <p>{isEmpty ? <p>No users found.</p> : null}</p>
        <ul className="flex flex-wrap space-y-4">
          {cursusUsers.map((cursusUser) => (
            isValidCursusUser(cursusUser) && <>
              <li key={cursusUser.id} className="w-1/2">
                <div className="flex flex-row space-x-4">
                  <div className="relative h-24 w-24">
                    <img
                      className="object-cover h-24 w-24"
                      src={`https://cdn.intra.42.fr/users/small_${cursusUser.user.login}.jpg`}
                    />
                  </div>
                  <div>
                    <p>ログイン: {cursusUser.user.login}</p>
                    <p>経験値: {cursusUser.level}</p>
                    <p>開始日: {cursusUser.begin_at?.split('T')[0]}</p>
                    <Link href={`https://profile.intra.42.fr/users/${cursusUser.user.login}`}>
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

// or simpler paginate
function Page ({pageIndex}: { pageIndex: number }) {
  const { data } = useSWR(`/api/examples/cursus_users?page=${pageIndex}`);
  return (
    <>
      {!data && <>
        <p>loading...</p>
      </>}
      {data && <>
        <div className="body">
          <h2>/v2/cursus/21/cursus_users?filter[campus_id]=26&sort=-blackholed_at</h2>
          <ul className="space-y-4">
            {data.cursusUsers.map((cursusUser) => (
              cursusUser.blackholed_at && <>
                <li key={cursusUser.id}>
                  <div className="flex flex-row space-x-4">
                    <div>
                      <img
                        className="object-cover h-32 w-32"
                        src={`https://cdn.intra.42.fr/users/small_${cursusUser.user.login}.jpg`}
                      />
                    </div>
                    <div>
                      <p>login: {cursusUser.user.login}</p>
                      <p>id: {cursusUser.id}</p>
                      <p>level: {cursusUser.level}</p>
                      <p>begin_at: {cursusUser.begin_at}</p>
                      <p>blackholed_at: {cursusUser.blackholed_at}</p>
                      <Link href={`/patterns/with-authorization-code/${cursusUser.user.login}`}>
                        <a className="text-blue-400">Check Profile</a>
                      </Link>
                    </div>
                  </div>
                </li>
              </>
            ))}
          </ul>
          <p>{data.xPageTotal}, {data.xPage}</p>
        </div>
      </>}
    </>
  )
}

// @ts-ignore
function ApiExamplesPage2 () {
  const [session, loading] = useSession();
  const [pageIndex, setPageIndex] = useState(1);
  const router = useRouter();

  // Session
  if (typeof window !== 'undefined' && loading) return null;
  if (!session) return <Layout><AccessDenied/></Layout>;

  return (
    <Layout>
      <div className="mb-8">
        <h1 className="font-semibold text-2xl">42APIテスト2</h1>
        <p className="text-sm"><em>Cursus Users ブラックホール長い順</em></p>
      </div>
      <Page pageIndex={pageIndex}/>
      <div style={{ display: 'none'}}><Page pageIndex={pageIndex + 1}/></div>
      <p>{JSON.stringify(router.query)}</p>
      <p>{router.pathname}</p>

      <button onClick={() => setPageIndex(pageIndex - 1)}>Previous</button>
      <button onClick={() => setPageIndex(pageIndex + 1)}>Next</button>
    </Layout>
  );
}
