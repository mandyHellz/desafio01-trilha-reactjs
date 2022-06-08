import styles from './header.module.scss';

export default function Header(): JSX.Element {
  return (
    <div className={styles.headerContainer}>
      <a href="/">
        <img src="./Logo.svg" alt="logo" />
      </a>
    </div>
  );
}
