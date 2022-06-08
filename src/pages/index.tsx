import Head from 'next/head';
import { GetStaticProps } from 'next';
import { RichText } from 'prismic-dom';

import { useState } from 'react';
import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps): JSX.Element {
  const [open, setOpen] = useState<boolean>(false);
  const totalContent = Number(postsPagination.next_page) - 1;

  return (
    <>
      <Head>
        <title>spacetraveling.</title>
      </Head>

      <main className={commonStyles.container}>
        {postsPagination.results.map((post, index) => (
          <div
            key={post.uid}
            className={
              index >= totalContent && !open
                ? `${styles.hide}`
                : `${styles.show}`
            }
          >
            <div className={styles.postPreview}>
              <h1>{post.data.title}</h1>
              <p>{post.data.subtitle}</p>
              <div className={styles.dateAndAuthor}>
                <p>{post.first_publication_date}</p>
                <p>{post.data.author}</p>
              </div>
            </div>
          </div>
        ))}

        {postsPagination.results.map((_, index) => {
          return (
            index >= totalContent && (
              <div>
                <button
                  type="button"
                  onClick={() => setOpen(!open)}
                  className={
                    index >= totalContent ? `${styles.show}` : `${styles.hide}`
                  }
                >
                  {!open && (
                    <span className="flex items-center gap-2">ver mais</span>
                  )}
                </button>
              </div>
            )
          );
        })}
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient({});
  const response = await prismic.getByType('post', {
    fetch: [
      'post.title',
      'post.subtitle',
      'post.author',
      'post.banner',
      'post.content',
    ],
    pageSize: 100,
  });

  const posts = response.results.map((post): Post => {
    return {
      uid: post.uid,
      first_publication_date: new Date(
        post.first_publication_date
      ).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      }),
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author,
      },
    };
  });

  const postsPagination = {
    results: posts,
    next_page: response.results_size,
  };

  return {
    props: {
      postsPagination,
    },
    redirect: 60 * 30,
  };
};
