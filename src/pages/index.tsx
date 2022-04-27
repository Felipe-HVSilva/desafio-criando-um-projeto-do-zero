/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { GetStaticProps } from 'next';
import { useState } from 'react';
import format from 'date-fns/format';
import ptBR from 'date-fns/locale/pt-BR';
import Link from 'next/link';
import { FiCalendar, FiUser } from 'react-icons/fi';
import Header from '../components/Header';

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

export default function Home({ postsPagination }: HomeProps) {
  const [posts, setPosts] = useState(postsPagination.results);
  const [nextPage, setNextPage] = useState(postsPagination.next_page);

  async function handleGetMorePosts() {
    const response = await fetch(nextPage).then(data => data.json());

    const newPost = response.results.map((post: Post) => ({
      uid: post.uid,

      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author,
      },

      first_publication_date: post.first_publication_date,
    }));

    setNextPage(response.next_page);
    setPosts(oldState => [...oldState, ...newPost]);
  }

  return (
    <>
      <Header />

      <main className={commonStyles.content}>
        {posts.map(post => (
          <article className={styles.container}>
            <Link href={`/post/${post.uid}`}>
              <a href="">
                <h1>{post.data.title}</h1>
              </a>
            </Link>
            <p>{post.data?.subtitle}</p>
            <span>
              <time>
                <FiCalendar size={20} />
                {format(new Date(post.first_publication_date), 'dd MMM yyy', {
                  locale: ptBR,
                })}
              </time>
              <small>
                <FiUser size={20} />
                {post.data.author}
              </small>
            </span>
          </article>
        ))}

        {!!nextPage && (
          <button
            className={styles.button}
            type="button"
            onClick={handleGetMorePosts}
          >
            Carregar mais posts
          </button>
        )}
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient({});

  const postsResponse = await prismic.getByType('posts', {
    pageSize: 1,
  });

  const { results, next_page } = postsResponse;

  const posts = results.map(post => {
    return {
      uid: post.uid,
      first_publication_date: post.first_publication_date,
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author,
      },
    };
  });

  return {
    props: {
      postsPagination: {
        results: posts,
        next_page,
      },
    },
  };
};
