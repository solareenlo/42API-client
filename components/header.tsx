import { signIn, signOut, useSession } from 'next-auth/client';
import styles from './header.module.css';
import ActiveLink from '@components/active-link';

function Header() {
  const [ session, loading ] = useSession();

  return (
    <header>
      <noscript>
        <style>{`.nojs-show { opacity: 1; top: 0; }`}</style>
      </noscript>
      <div className={styles.signedInStatus}>
        <p className={`nojs-show ${(!session && loading) ? styles.loading : styles.loaded}`}>
          {!session && <>
            <span className={styles.notSignedInText}>このサイトを観覧するには42生としてログインする必要があります。</span>
            <a
              href={`/api/auth/signin`}
              className={styles.buttonPrimary}
              onClick={(e) => {
                e.preventDefault()
                signIn('42')
              }}
            >
              ログイン
            </a>
          </>}
          {session && <>
            {session.user.image && <span style={{backgroundImage: `url(${session.user.image})` }} className={styles.avatar}/>}
            <span className={styles.signedInText}>
              <small>{session.user.name}</small><br/>
              <strong>{session.user.displayName}</strong>
            </span>
            <a
              href={`/api/auth/signout`}
              className={styles.button}
              onClick={(e) => {
                e.preventDefault()
                signOut()
              }}
            >
              ログアウト
            </a>
          </>}
        </p>
      </div>
      <nav>
        <ul className={styles.navItems}>
          <li className={styles.navItem}><ActiveLink href="/"><a>Home</a></ActiveLink></li>
          <li className={styles.navItem}><ActiveLink href="/api-example-1"><a>API1</a></ActiveLink></li>
          <li className={styles.navItem}><ActiveLink href="/api-example-2"><a>API2</a></ActiveLink></li>
          <li className={styles.navItem}><ActiveLink href="/api-example-3"><a>API3</a></ActiveLink></li>
          <li className={styles.navItem}><ActiveLink href="/sheets-example-1"><a>Sheets1</a></ActiveLink></li>
          <li className={styles.navItem}><ActiveLink href="/patterns"><a>Patterns</a></ActiveLink></li>
        </ul>
      </nav>
    </header>
  );
}

export default Header;
