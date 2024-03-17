import { fakeAuthProvider } from "@/auth";
import { createPost } from "@/posts";
import { Button, Container, FormLabel, Stack, TextField } from "@mui/material";
import { Form, LoaderFunctionArgs, redirect } from "react-router-dom";

export default function NewPost() {
  return (
    <Container maxWidth="md">
      <Form method="post" action="/new">
        <Stack spacing={2}>
          <FormLabel component="legend">Youtube URL:</FormLabel>
          <TextField type="text" name="url" />
          <Button variant="outlined" type="submit">
            Share
          </Button>
        </Stack>
      </Form>
    </Container>
  );
}

export function loader({ request }: LoaderFunctionArgs) {
  if (!fakeAuthProvider.isAuthenticated) {
    const params = new URLSearchParams();
    params.set("from", new URL(request.url).pathname);
    return redirect("/?" + params.toString());
  }
  return null;
}

export async function action({ request }: LoaderFunctionArgs) {
  const formData = await request.formData();
  const url = formData.get("url") as string;
  if (!url) {
    return {
      status: 400,
      error: "You must provide a url",
    };
  }
  await createPost(url);
  return redirect("/");
}
