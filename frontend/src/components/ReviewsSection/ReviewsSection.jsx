//frontend/src/components/ReviewsSection/ReviewsSection.jsx

import "./ReviewsSection.css";

const ReviewsSection = ({
  //* set props
  currentReviews,
  formatDate,
  currentPage,
  totalPages,
  setCurrentPage,
}) => (
  <div className="reviews-section">
    <ul className="reviews-list">
      {currentReviews.map((review) => (
        <li key={review.id} className="review-item">
          <p>
            <strong>
              {review.User.firstName} {review.User.lastName}
            </strong>
          </p>
          <p className="review-date">{formatDate(review.updatedAt)}</p>
          <p>{review.review}</p>
        </li>
      ))}
    </ul>

    {/* Pagination Controls */}
    <div className="pagination">
      <button
        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
        disabled={currentPage === 1}
      >
        Previous
      </button>
      <span>
        Page {currentPage} of {totalPages}
      </span>
      <button
        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
        disabled={currentPage === totalPages}
      >
        Next
      </button>
    </div>
  </div>
);

export default ReviewsSection;
