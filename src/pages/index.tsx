import Head from 'next/head';
import { GetStaticProps } from 'next';
import { useState } from 'react';
import { FiCalendar, FiUser } from 'react-icons/fi';
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
  const [nextPage, setNextPage] = useState(postsPagination.next_page);
  const [results, setResults] = useState<Post[]>(
    postsPagination.results.map(post => {
      return {
        ...post,
      };
    })
  );

  function nextPageHandler(): Promise<void> {
    return fetch(nextPage).then(response => {
      response.json().then(nextPageResponse => {
        setNextPage(nextPageResponse.next_page);

        const nextPosts = nextPageResponse.results.map(post => {
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

        setResults([...results, ...nextPosts]);
      });
    });
  }

  return (
    <>
      <Head>
        <title>Home</title>
      </Head>

      <div className={commonStyles.container}>
        {results.map(post => (
          <div key={post.uid} className={styles.postPreview}>
            <h1>{post.data.title}</h1>
            <p>{post.data.subtitle}</p>
            <div className={styles.dateAndAuthor}>
              <div>
                <FiCalendar /> {post.first_publication_date}
              </div>
              <div>
                <FiUser />
                {post.data.author}
              </div>
            </div>
          </div>
        ))}

        {postsPagination.next_page !== null && (
          <div>
            <button
              className={styles.showMoreBtn}
              type="button"
              onClick={() => nextPageHandler()}
            >
              Carregar mais posts
            </button>
          </div>
        )}
      </div>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient({});
  const response = await prismic.getByType('post', {
    fetch: ['post.title', 'post.subtitle', 'post.author'],
    pageSize: 2,
  });

  const posts = response.results.map(post => {
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
    } as Post;
  });

  return {
    props: {
      postsPagination: {
        next_page: response.next_page,
        results: posts,
      },
    },
    redirect: 60 * 30,
  };
};
