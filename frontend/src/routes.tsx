import { Navigate, redirect } from "react-router-dom";
import { fakeAuthProvider } from "./api/auth";
import { loader, action } from "./components/Login";
import { RootLayout } from "./layouts/RootLayout";
import { newPostRoute } from "./pages/NewPost";
import { postListRoute } from "./pages/PostList";

export const routes = [
  {
    id: "root",
    path: "/",
    // loader from Login component
    loader,
    // action from Login component
    action,
    // RootLayout component include Login in the headers
    element: <RootLayout />,
    children: [
      { index: true, element: <Navigate to="/posts" /> },
      {
        path: "posts",
        children: [
          {
            index: true,
            ...postListRoute,
          },
          {
            path: "new",
            ...newPostRoute,
          },
        ],
      },
      {
        path: "logout",
        async action() {
          await fakeAuthProvider.signout();
          return redirect("/");
        },
      },
      { path: "*", element: <h1>404 - Page Not Found</h1> },
    ],
  },
];
