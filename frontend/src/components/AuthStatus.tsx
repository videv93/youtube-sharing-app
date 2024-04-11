import { Button, Stack, Typography } from "@mui/material";
import { useFetcher, useNavigate, useRouteLoaderData } from "react-router-dom";
import { Login } from "./Login";

export function AuthStatus() {
  const { user } = useRouteLoaderData("root") as { user: string | null };
  const fetcher = useFetcher();
  const navigate = useNavigate();

  if (!user) {
    return <Login />;
  }

  const isLoggingOut = fetcher.formData != null;
  const handleShareClick = () => {
    navigate("/posts/new", { replace: true });
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
