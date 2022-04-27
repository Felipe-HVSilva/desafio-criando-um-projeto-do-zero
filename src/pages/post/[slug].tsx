/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { GetStaticPaths, GetStaticProps } from 'next';
import { FiCalendar, FiClock, FiUser } from 'react-icons/fi';
import format from 'date-fns/format';
import ptBR from 'date-fns/locale/pt-BR';
import { RichText } from 'prismic-dom';
import { useRouter } from 'next/router';
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

export default function Post({ post }: PostProps) {
  let totalString = 0;

  post.data.content.forEach(body => {
    body.body.forEach(string => {
      totalString += string.text.split(' ').length;
    });
  });

  const readTime = Math.ceil(totalString / 200);

  const router = useRouter();

  if (router.isFallback) {
    return <p>Carregando...</p>;
  }

  return (
    <>
      <Header />
      <div className={styles.postImage}>
        <img src={post.data.banner.url} alt={post.data.title} />
      </div>

      <main className={`${commonStyles.content} ${styles.postContainer}`}>
        <h1>{post.data.title}</h1>
        <div className={styles.postDetails}>
          <time>
            <FiCalendar size={20} />
            {format(new Date(post.first_publication_date), 'dd MMM yyy', {
              locale: ptBR,
            })}
          </time>

          <p>
            <FiUser size={20} />
            {post.data.author}
          </p>

          <p>
            <FiClock size={20} />
            {readTime} min
          </p>
        </div>

        <div className={styles.postContent}>
          {post.data.content.map(content => {
            return (
              <div>
                <h2>{content.heading}</h2>
                <div
                  // eslint-disable-next-line react/no-danger
                  dangerouslySetInnerHTML={{
                    __html: RichText.asHtml(content.body),
                  }}
                />
              </div>
            );
          })}
        </div>
      </main>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient({});
  const posts = await prismic.getByType('posts');

  const paths = posts.results.map(post => ({
    params: {
      slug: post.uid,
    },
  }));

  return {
    paths,
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { slug } = params;
  const prismic = getPrismicClient({});
  const response = await prismic.getByUID('posts', String(slug), {});

  const post = {
    uid: response.uid,
    first_publication_date: response.first_publication_date,
    data: {
      title: response.data.title,
      subtitle: response.data.subtitle,
      banner: response.data.banner,
      author: response.data.author,
      content: response.data.content,
    },
  };

  return {
    props: {
      post,
    },
    redirect: 60 * 30, // 30 Minutes
  };
};
