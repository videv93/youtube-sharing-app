import { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { Post } from "../types/post";
import { io } from "socket.io-client";
import HomeIcon from "@mui/icons-material/Home";
import {
  Box,
  Button,
  Container,
  Divider,
  Snackbar,
  Stack,
  Typography,
} from "@mui/material";
import { AuthStatus } from "@/components/AuthStatus";

const apiURL = import.meta.env.VITE_API_URL as string;

export function RootLayout() {
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
