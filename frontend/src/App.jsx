// frontend/src/App.jsx

// # IMPORT HOOKS
import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { createBrowserRouter, RouterProvider, Outlet } from "react-router-dom";

//# IMPORT STORES - centralized place that stores the entire state of app which can be read/modified through actions and reducers.
import * as sessionActions from "./store/session";

//# IMPORT COMPONENT - reusable piece of UI that defines how a certain part of the application looks or behaves.
import Navigation from "./components/Navigation/Navigation";
import SpotsBrowser from "./components/SpotsBrowser";
import SpotDetail from "./components/SpotDetail/SpotDetail";
import CreateSpot from "./components/CreateNewSpotForm/CreateNewSpotForm";
import CreateReview from "./components/CreateReviewForm/CreateReviewForm";

function Layout() {
  const dispatch = useDispatch();
  const [isLoaded, setIsLoaded] = useState(false); //* isLoaded: Tracks whether the user session has been restored

  useEffect(() => {
    //* DISPATCH ACTION on component mount
    dispatch(sessionActions.restoreUser()).then(() => {
      setIsLoaded(true);
    });
  }, [dispatch]);

  return (
    <>
      {/* Displays the Navigation component and conditionally renders the Outlet only if the user session is loaded. */}
      <Navigation isLoaded={isLoaded} />
      {isLoaded && <Outlet />}
    </>
  );
}

//# CREATE AND CONFIGURE ROUTING FOR THE APPLICATION, specifying the Layout component for the main structure and defining child routes

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      {
        //* SET SPOT BROWSER AS THE LANDING PAGE
        path: "/",
        element: <SpotsBrowser />,
      },
      {
        path: "/spots/:spotId",
        element: <SpotDetail />,
      },
      {
        path: "/create-spot",
        element: <CreateSpot />,
      },
      {
        path: "/create-review",
        element: <CreateReview />,
      },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
