import "./SpotReviews.css";
import { GoStarFill } from "react-icons/go";

function Reviews({ spot, reviews }) {
  console.log(reviews);

  return (
    <>
      <div id="section-divider"></div>
      <div id="header">
        <GoStarFill />
        <h2>
          {spot?.avgStarRating ? spot?.avgStarRating.toFixed(1) : <p>New</p>}
        </h2>
        <h3 id="divider"> | </h3>
        <h3>
          <p>
            {spot?.numReviews === 0
              ? "No reviews"
              : `${spot?.numReviews} ${
                  spot?.numReviews === 1 ? "review" : "reviews"
                } `}
          </p>
        </h3>
      </div>

      <div id="section">
        <ul className="list">
          {reviews?.map((review) => (
            <li key={review.id} className="item">
              <p>
                <strong>{review.User.firstName}</strong>
              </p>
              <p className="date">{review.updatedAt}</p>
              <p>{review.review}</p>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}

export default Reviews;
