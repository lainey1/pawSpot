// frontend/src/components/SpotsBrowser.jsx

// #1 IMPORT necessary hooks and components for building the browser interface
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, Outlet } from "react-router-dom";
import { getSpots } from "../store/spots";
import "./SpotBrowser.css";
import { GoStarFill } from "react-icons/go";

// #2 DEFINE COMPONENT
const SpotsBrowser = () => {
  //* Hooks for State and Dispatch
  const dispatch = useDispatch();
  const spots = useSelector((state) => state.spot.list); // SELECT SPOTS FROM STATE
  const loading = useSelector((state) => state.spot.loading);

  //* Effect Hook for Fetching Spots
  useEffect(() => {
    dispatch(getSpots());
  }, [dispatch]);

  // #3 RENDER METHOD
  return (
    <main>
      <nav></nav>
      <section>
        {loading ? (
          <p>Loading spots...</p>
        ) : spots.length > 0 ? (
          <div className="spots-grid">
            {spots.map((spot) => (
              <div key={spot.id} className="spot-tile">
                <Link to={`/spots/${spot.id}`} className="spot-link">
                  {spot.previewImage && (
                    <img
                      src={spot.previewImage}
                      alt={spot.name}
                      className="spot-image"
                    />
                  )}
                  <h3 className="spot-name">{spot.name}</h3>
                  <div className="spot-location-rating">
                    <p className="spot-location">
                      {spot.city}, {spot.state}
                    </p>
                    <span className="average-rating">
                      {spot.avgRating ? (
                        <>
                          <GoStarFill /> {spot.avgRating}
                        </>
                      ) : (
                        <span className="no-ratings">New</span>
                      )}
                    </span>
                  </div>
                  <p>
                    <strong>${spot.price}</strong> night
                  </p>
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <p>No spots available.</p>
        )}
      </section>
      <Outlet />
    </main>
  );
};

// #4 EXPORT
export default SpotsBrowser;
