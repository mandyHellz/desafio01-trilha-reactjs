import { GetStaticPaths, GetStaticProps } from 'next';
import { useRouter } from 'next/router';
import { RichText } from 'prismic-dom';
import { FiCalendar, FiClock, FiUser } from 'react-icons/fi';
import Header from '../../components/Header';

import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps): JSX.Element {
  const router = useRouter();

  const readingTime = post.data.content.reduce((total, content) => {
    const textTotal = RichText.asText(content.body).split(' ').length;
    return Math.ceil(total + textTotal / 200);
  }, 0);

  if (router.isFallback) {
    return <p>Carregando...</p>;
  }

  return (
    <>
      <div className={commonStyles.container}>
        <div className={commonStyles.headerContainer}>
          <Header />
        </div>

        <img
          src={post.data.banner.url}
          alt={post.data.title}
          className={styles.banner}
        />

        <div className={`${commonStyles.container} ${styles.mainPost}`}>
          <main className={commonStyles.content}>
            <h1>{post.data.title}</h1>

            <section className={`${commonStyles.info} ${styles.infoPost}`}>
              <div>
                <FiCalendar color="#BBBBBB" />
                <time>{post.first_publication_date}</time>
              </div>
              <div>
                <FiUser color="#BBBBBB" />
                <span>{post.data.author}</span>
              </div>
              <div>
                <FiClock color="#BBBBBB" />
                <span>{readingTime} min</span>
              </div>
            </section>

            {post.data.content.map(content => (
              <div key={content.heading} className={styles.content}>
                <strong>{content?.heading}</strong>

                {content.body.map((body, index) => {
                  const key = index;

                  return body.text === 'list-item' ? (
                    <ul key={key}>
                      <li>{body.text}</li>
                    </ul>
                  ) : (
                    <p key={key}>{body.text}</p>
                  );
                })}
              </div>
            ))}
          </main>
        </div>
      </div>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient({});
  const posts = await prismic.getByType('post', {
    fetch: ['post.title', 'post.subtitle', 'post.author'],
  });

  const slugs = posts.results.map(slug => {
    return slug.uid;
  });

  return {
    paths: slugs.map(slug => {
      return {
        params: { slug },
      };
    }),
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { slug } = params;

  const prismic = getPrismicClient({});
  const response = await prismic.getByUID('post', String(slug), {});

  const post: Post = {
    first_publication_date: new Date(
      response.first_publication_date
    ).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }),
    data: {
      title: response.data.title,
      banner: {
        url: response.data.banner.url,
      },
      author: response.data.author,
      content: response.data.content.map(content => {
        return {
          heading: content.heading,
          body: content.body.map(body => {
            return {
              type: body.type,
              text: body.text,
              spans: [...body.spans],
            };
          }),
        };
      }),
    },
  };

  return {
    props: {
      post,
    },
    redirect: 60 * 30,
  };
};
