import {
  Form,
  LoaderFunctionArgs,
  Outlet,
  RouterProvider,
  createBrowserRouter,
  redirect,
  useActionData,
  useFetcher,
  useLocation,
  useNavigate,
  useNavigation,
  useRevalidator,
  useRouteLoaderData,
} from "react-router-dom";
import { fakeAuthProvider } from "./auth";
import io from "socket.io-client";
import NewPost, {
  action as newPostAction,
  loader as newPostLoader,
} from "./routes/new";
import { downVotePost, getPosts, upVotePost } from "./posts";
import Youtube, { YouTubeProps } from "react-youtube";
import {
  Box,
  Button,
  Container,
  Divider,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import { ThumbDown, ThumbUp } from "@mui/icons-material";
import { ReadMoreText } from "./components/ui/ReadMoreText";
import { useState, useEffect } from "react";
import { Post } from "./types/post";

const apiURL = import.meta.env.VITE_API_URL as string;

const router = createBrowserRouter([
  {
    id: "root",
    path: "/",
    action: loginAction,
    loader: async () => {
      const posts = await getPosts();
      return { user: fakeAuthProvider.username, posts };
    },
    Component: Layout,
    children: [
      {
        index: true,
        Component: PublicPage,
      },
      {
        loader: protectedLoader,
        path: "protected",
        Component: ProtectedPage,
      },
      {
        path: "new",
        action: newPostAction,
        loader: newPostLoader,
        Component: NewPost,
      },
    ],
  },
  {
    path: "/logout",
    async action() {
      // We signout in a "resource route" that we can hit from a fetcher.Form
      await fakeAuthProvider.signout();
      return redirect("/");
    },
  },
]);

function App() {
  return (
    <RouterProvider router={router} fallbackElement={<p>Inital Load...</p>} />
  );
}

function Layout() {
  const navigate = useNavigate();

  const [snackBarOpen, setSnackBarOpen] = useState(false);
  const [recentPost, setRecentPost] = useState<Post | null>(null);

  const handleClick = (post: Post) => {
    setSnackBarOpen((snackBarOpen) => !snackBarOpen);
    setRecentPost(post);
  };

  const handleClose = () => {
    setSnackBarOpen(false);
    setRecentPost(null);
  };

  useEffect(() => {
    const socket = io(apiURL);
    socket.on("connect", () => {
      console.log("Connected to server");
    });
    socket.on("newPost", (data) => {
      console.log("New post received", data);
      try {
        const post = JSON.parse(data);
        handleClick(post);
      } catch (e) {
        console.error(e);
      }
      // revalidator.revalidate();
    });
    return () => {
      socket.close();
    };
  }, []);
  return (
    <Box px={6}>
      {/** Navigation */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        px={2}
        sx={{
          backgroundColor: "grey.100",
        }}
      >
        <Button
          onClick={() => {
            navigate("/", { replace: true });
          }}
        >
          <Stack direction="row" spacing={2} alignItems="center">
            <HomeIcon fontSize="large" />
            <Typography variant="h6">Funny Movies</Typography>
          </Stack>
        </Button>
        <AuthStatus />
      </Stack>
      <Divider sx={{ my: 2 }} />
      <Snackbar
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        open={snackBarOpen}
        onClose={handleClose}
        message={`New post added: ${recentPost?.title} from ${recentPost?.user.username}. Check it out!`}
        key={Math.random()}
      />
      {/* Routes will be rendered here */}
      <Container>
        <Outlet />
      </Container>
    </Box>
  );
}

function AuthStatus() {
  const { user } = useRouteLoaderData("root") as { user: string | null };
  const fetcher = useFetcher();
  const navigate = useNavigate();

  if (!user) {
    return <Login />;
  }

  const isLoggingOut = fetcher.formData != null;
  const handleShareClick = () => {
    navigate("/new", { replace: true });
  };

  return (
    <Stack direction="row" spacing={2} padding={2} alignItems="center">
      <Typography variant="body2">Welcome {user}</Typography>
      <Button variant="contained" onClick={handleShareClick}>
        Share a movie
      </Button>
      <fetcher.Form method="post" action="/logout">
        <Button type="submit" disabled={isLoggingOut}>
          {isLoggingOut ? "Logging out..." : "Logout"}
        </Button>
      </fetcher.Form>
    </Stack>
  );
}

async function loginAction({ request }: LoaderFunctionArgs) {
  const formData = await request.formData();
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;
  if (!username) {
    return {
      error: "You must provide a username",
    };
  }
  if (!password) {
    return {
      error: "You must provide a password",
    };
  }

  try {
    await fakeAuthProvider.signin(username, password);
  } catch (error) {
    return {
      error: "Invalid username or password",
    };
  }

  const redirectTo = formData.get("redirectTo") as string | undefined;
  return redirect(redirectTo || "/");
}

function Login() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const from = params.get("from") || "/";

  const navigation = useNavigation();
  const isLoggingIn = navigation.formData?.get("username") != null;

  const actionData = useActionData() as { error: string } | undefined;

  return (
    <Form method="post" replace>
      <Stack direction="row" spacing={2} padding={2}>
        <TextField type="hidden" name="redirectTo" value={from} />
        <TextField
          size="small"
          name="username"
          placeholder="Username"
          type="text"
        />
        <TextField
          size="small"
          name="password"
          placeholder="Password"
          type="password"
        />
        <Button
          size="small"
          variant="contained"
          type="submit"
          disabled={isLoggingIn}
        >
          {isLoggingIn ? "Logging in..." : "Login/Register"}
        </Button>
      </Stack>
      {actionData && actionData.error ? (
        <Typography variant="body2" color="error" textAlign="center">
          {actionData.error}
        </Typography>
      ) : null}
    </Form>
  );
}
function PublicPage() {
  const { posts } = useRouteLoaderData("root") as { posts: Post[] };
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
              <Youtube
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

function protectedLoader({ request }: LoaderFunctionArgs) {
  // If the user is not logged in and tries to access `/protected`, we redirect
  // them to `/login` with a `from` parameter that allows login to redirect back
  // to this page upon successful authentication
  if (!fakeAuthProvider.isAuthenticated) {
    const params = new URLSearchParams();
    params.set("from", new URL(request.url).pathname);
    return redirect("/?" + params.toString());
  }
  return null;
}

function ProtectedPage() {
  return <h3>Protected</h3>;
}

export default App;
