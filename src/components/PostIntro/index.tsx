import { FiCalendar, FiUser } from 'react-icons/fi';
import Link from 'next/link';
import styles from './post.intro.module.scss';

interface PostIntroProps {
  uid?: string;
  publication: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

export default function PostIntro({
  uid,
  data,
  publication,
}: PostIntroProps): JSX.Element {
  return (
    <Link href={`/post/${uid}`}>
      <div key={uid} className={styles.postPreview}>
        <h2>{data.title}</h2>
        <p>{data.subtitle}</p>
        <div className={styles.dateAndAuthor}>
          <div>
            <FiCalendar /> {publication}
          </div>
          <div>
            <FiUser />
            {data.author}
          </div>
        </div>
      </div>
    </Link>
  );
}
