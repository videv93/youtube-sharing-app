import { fakeAuthProvider } from "@/api/auth";
import { upVotePost, downVotePost, getPosts } from "@/api/posts";
import { ReadMoreText } from "@/components/ReadMoreText";
import { Post } from "@/types/post";
import { ThumbUp, ThumbDown } from "@mui/icons-material";
import { Stack, Box, Typography, Button } from "@mui/material";
import { useRevalidator, useLoaderData } from "react-router-dom";
import YouTube, { YouTubeProps } from "react-youtube";

export function PostList() {
  const { posts } = useLoaderData() as { posts: Post[] };
  const revalidator = useRevalidator();

  const opts = {
    height: "390",
    width: "640",
    playerVars: {
      // https://developers.google.com/youtube/player_parameters
      autoplay: 1,
    },
  };

  const onPlayerReady: YouTubeProps["onReady"] = (event) => {
    // access to player in all event handlers via event.target
    event.target.pauseVideo();
  };

  const handleUpVoteClick = async (post: Post) => {
    try {
      await upVotePost(post._id);
      revalidator.revalidate();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDownVoteClick = async (post: Post) => {
    try {
      await downVotePost(post._id);
      revalidator.revalidate();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div>
      <ul>
        {posts.map((post) => (
          <Stack key={post._id} direction="row" spacing={2} p={2}>
            <Box>
              <YouTube
                videoId={post.videoId}
                opts={opts}
                onReady={onPlayerReady}
              />
            </Box>
            <Stack spacing={1}>
              <Typography variant="h5">{post.title}</Typography>
              <Typography variant="body2">{`Shared by: ${post.user.username}`}</Typography>
              <Stack direction="row" spacing={1}>
                <Button
                  disabled={!fakeAuthProvider.isAuthenticated || post.voted}
                  onClick={() => handleUpVoteClick(post)}
                >
                  <Stack spacing={1} direction="row" alignItems="center">
                    <Typography variant="body2">{post.upvotes}</Typography>
                    <ThumbUp />
                  </Stack>
                </Button>
                <Button
                  disabled={!fakeAuthProvider.isAuthenticated || post.voted}
                  onClick={() => handleDownVoteClick(post)}
                >
                  <Stack spacing={1} direction="row" alignItems="center">
                    <Typography variant="body2">{post.downvotes}</Typography>
                    <ThumbDown />
                  </Stack>
                </Button>
              </Stack>
              <Typography variant="body2">Description:</Typography>
              <ReadMoreText text={post.description} />
            </Stack>
          </Stack>
        ))}
      </ul>
    </div>
  );
}

async function loader() {
  const posts = await getPosts();
  return { posts };
}

export const postListRoute = {
  loader,
  element: <PostList />,
};
