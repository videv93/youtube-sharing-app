import { fakeAuthProvider } from "@/api/auth";
import { Stack, TextField, Button, Typography } from "@mui/material";
import {
  useLocation,
  useNavigation,
  useActionData,
  LoaderFunctionArgs,
  redirect,
  Form,
} from "react-router-dom";

export function Login() {
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

// Cause the component login in home page, so loader will be define at root path
export async function loader() {
  const user = fakeAuthProvider.isAuthenticated
    ? fakeAuthProvider.username
    : null;
  return { user };
}

// Cause the component login in home page, so action will be define at root path
export async function action({ request }: LoaderFunctionArgs) {
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
