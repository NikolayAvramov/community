// app/page.tsx
"use client";

import { useContext, useEffect, useState } from "react";
import { AuthContext } from "./context/AuthContext";

type Post = {
  id: number;
  title: string;
  content: string;
  author: { name: string };
};

// отделен компонент за един пост
const PostItem = ({ post }: { post: Post }) => (
  <li className="p-4 border rounded">
    <h2 className="font-bold">{post.title}</h2>
    <p>{post.content}</p>
    <span className="text-sm text-gray-500">By {post.author.name}</span>
  </li>
);

export default function Home() {
  const { user } = useContext(AuthContext);
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    if (!user) return;

    const fetchPosts = async () => {
      try {
        const res = await fetch("/api/posts", {
          credentials: "include", // изпраща HTTP-only cookie
        });
        const data: Post[] = await res.json();
        setPosts(data);
      } catch (err) {
        console.error("Error fetching posts:", err);
      }
    };

    fetchPosts();
  }, [user]);

  return (
    <div>
      <main className="p-8">
        <h1 className="text-3xl font-bold mb-4">Welcome to My Community</h1>

        {!user ? (
          <p>Please login to see the posts.</p>
        ) : posts.length === 0 ? (
          <p>Loading posts...</p>
        ) : (
          <ul className="space-y-4">
            {posts.map((post) => (
              <PostItem key={post.id} post={post} />
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
