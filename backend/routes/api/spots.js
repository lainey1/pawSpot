// backend/routes/api/spots.js
const express = require("express");
const { Spot } = require("../../db/models");
const { SpotImage } = require("../../db/models");
const { check } = require("express-validator");
const { handleValidationErrors } = require("../../utils/validation");
const { requireAuth } = require("../../utils/auth");
const { Review, User, ReviewImage } = require("../../db/models");
const { Op, fn, col } = require("sequelize");
const { validationResult, query } = require("express-validator");
const Sequelize = require("sequelize");

const router = express.Router();

//* Validation for creating and updating spots (CORRECTED)
const validateSpot = [
  check("address")
    .exists({ checkFalsy: true })
    .withMessage("Street address is required"),
  check("city").exists({ checkFalsy: true }).withMessage("City is required"),
  check("state").exists({ checkFalsy: true }).withMessage("State is required"),
  check("country")
    .exists({ checkFalsy: true })
    .withMessage("Country is required"),
  check("lat")
    .isFloat({ min: -90, max: 90 })
    .withMessage("Latitude must be within -90 and 90"),
  check("lng")
    .isFloat({ min: -180, max: 180 })
    .withMessage("Longitude must be within -180 and 180"),
  check("name")
    .exists({ checkFalsy: true })
    .isLength({ max: 50 })
    .withMessage("Name must be less than 50 characters"),
  check("description")
    .exists({ checkFalsy: true })
    .withMessage("Description is required"),
  check("price")
    .isDecimal()
    .withMessage("Price per day must be a positive number"),
  handleValidationErrors,
];

// Validation Middleware for Get Spots
const validateQueryParams = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be greater than or equal to 1"),
  query("size")
    .optional()
    .isInt({ min: 1, max: 20 })
    .withMessage("Size must be between 1 and 20"),
  query("minLat")
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage("Minimum latitude is invalid"),
  query("maxLat")
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage("Maximum latitude is invalid"),
  query("minLng")
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage("Minimum longitude is invalid"),
  query("maxLng")
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage("Maximum longitude is invalid"),
  query("minPrice")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Minimum price must be greater than or equal to 0"),
  query("maxPrice")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Maximum price must be greater than or equal to 0"),
  handleValidationErrors,
];

//* GET all Spots owned by the Current User (v2) (CHECKED)

router.get("/current", async (req, res) => {
  try {
    // Get the current user's ID
    const userId = req.user.id;

    // Fetch spots owned by the current user
    const spots = await Spot.findAll({
      where: { ownerId: userId }, // Filter by the current user's ID
      include: [
        {
          model: Review,
          attributes: [], // Only need the stars for aggregation
          required: false,
        },
        {
          model: SpotImage,
          where: { preview: true }, // Only fetch preview images
          attributes: ["url"], // Only get the URL of the image
          required: false, // Include spots without preview images
        },
      ],
      group: ["Spot.id", "SpotImages.id"], // Group by Spot and SpotImage
      attributes: {
        include: [[fn("AVG", col("Reviews.stars")), "avgStarRating"]], // Calculate avgRating
      },
    });

    // Format the response
    const formattedSpots = spots.map((spot) => {
      return {
        id: spot.id,
        ownerId: spot.ownerId,
        address: spot.address,
        city: spot.city,
        state: spot.state,
        country: spot.country,
        lat: spot.lat,
        lng: spot.lng,
        name: spot.name,
        description: spot.description,
        price: spot.price,
        createdAt: spot.createdAt,
        updatedAt: spot.updatedAt,
        avgRating: spot.dataValues.avgStarRating
          ? Number(spot.dataValues.avgStarRating).toFixed(2)
          : null, // Format average rating
        previewImage: spot.SpotImages.length ? spot.SpotImages[0].url : null, // Get preview image URL
      };
    });

    return res.json({ Spots: formattedSpots });
  } catch (err) {
    return res.status(401).json({ message: "Unauthorized" });
  }
});

//* Add an Image to a Spot based on the Spot's id (CHECKED)
router.post("/:spotId/images", requireAuth, async (req, res) => {
  const { spotId } = req.params; // from URL
  const userId = req.user.id; // Get the current user's ID from authentication
  const spot = await Spot.findByPk(spotId); // find spot by ID

  // Check if the spot exists
  if (!spot) {
    return res.status(404).json({
      message: "Spot couldn't be found",
    });
  }

  // Check if the authenticated user is the owner of the spot
  if (spot.ownerId !== userId) {
    return res.status(403).json({
      title: "Forbidden",
      message: "Only the owner can add images to this spot.",
    });
  }
  const { url, preview } = req.body;

  // Create the image for spot
  const image = await SpotImage.create({
    spotId: spot.id, //!FIX Need to associate the image with the spot
    url,
    preview,
  });

  // Create a response object without createdAt and updatedAt
  const response = {
    id: image.id,
    spotId: image.spotId,
    url: image.url,
    preview: image.preview,
  };

  return res.status(201).json(response);
});

//* GET details of a Spot by ID (CHECKED)
router.get("/:spotId", async (req, res) => {
  const { spotId } = req.params; // GET from URL

  const spot = await Spot.findByPk(spotId, {
    include: [
      {
        model: Review,
        attributes: [],
        required: false,
      },
      {
        model: SpotImage,
        as: "SpotImages",
        attributes: ["id", "url", "preview"],
      },
      {
        model: User,
        as: "Owner",
        attributes: ["id", "firstName", "lastName"],
      },
    ],
    // Group by required attributes
    group: ["Spot.id", "Owner.id", "SpotImages.id", "Reviews.id"], // Group by spot ID to aggregate correctly
    attributes: {
      include: [
        [fn("COUNT", col("Reviews.id")), "reviewCount"],
        [fn("AVG", col("Reviews.stars")), "avgStarRating"],
      ],
    },
  });

  // Check if the spot exists
  if (!spot) {
    return res.status(404).json({
      message: "Spot couldn't be found",
    });
  }

  // Prepare response object
  const response = {
    id: spot.id,
    ownerId: spot.Owner.id,
    address: spot.address,
    city: spot.city,
    state: spot.state,
    country: spot.country,
    lat: spot.lat,
    lng: spot.lng,
    name: spot.name,
    description: spot.description,
    price: spot.price,
    createdAt: spot.createdAt,
    updatedAt: spot.updatedAt,
    numReviews: spot.dataValues.reviewCount || 0, // Default to 0 if no reviews
    avgStarRating: spot.dataValues.avgStarRating || 0, // Default to 0 if no ratings
    SpotImages: spot.SpotImages, // Directly include the SpotImages
    Owner: {
      id: spot.Owner.id,
      firstName: spot.Owner.firstName,
      lastName: spot.Owner.lastName,
    },
  };

  return res.status(200).json(response);
});

//* Edit a Spot (CHECKED)
router.put("/:spotId", requireAuth, validateSpot, async (req, res) => {
  const userId = req.user.id; // GET authenticated userId
  const { spotId } = req.params; // GET from URL
  const { address, city, state, country, lat, lng, name, description, price } =
    req.body;

  const spot = await Spot.findByPk(spotId); // Find spot by ID;

  // Check if the spot exists
  if (!spot) {
    return res.status(404).json({
      message: "Spot couldn't be found",
    });
  }

  // Check if the authenticated user is the spot's owner
  if (spot.ownerId !== userId) {
    return res.status(403).json({
      message: "Forbidden",
      errors: {
        authorization: "Only the owner can edit this spot",
      },
    });
  }

  // After the spot exists and user is authorized, we run validation
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: "Bad Request",
      errors: errors.array().reduce((acc, error) => {
        acc[error.param] = error.msg;
        return acc;
      }, {}),
    });
  }

  //Update the spot with new details
  spot.address = address;
  spot.city = city;
  spot.state = state;
  spot.country = country;
  spot.lat = lat;
  spot.lng = lng;
  spot.name = name;
  spot.description = description;
  spot.price = price;

  await spot.save(); // save the updated spot

  // response with updated spot
  return res.status(200).json(spot);
});

//* Create a Spot
router.post(
  "/",
  validateSpot, // Use validateSpot middleware to handle validation
  async (req, res) => {
    try {
      // Get the current user's ID (Assuming authentication middleware sets req.user)
      const userId = req.user.id;

      // Destructure the spot data from the request body
      const {
        address,
        city,
        state,
        country,
        lat,
        lng,
        name,
        description,
        price,
        imageUrls, // FIXED need to ensure server can handle this in form submission
      } = req.body;

      // Create the new spot in the database
      const newSpot = await Spot.create({
        ownerId: userId, // Set the owner ID to the current user
        address,
        city,
        state,
        country,
        lat,
        lng,
        name,
        description,
        price,
      });

      // FIXED CREATE spot images in database
      if (imageUrls && imageUrls.length) {
        const spotImages = imageUrls.map((url, index) => ({
          spotId: newSpot.id,
          url,
          preview: index === 0, // Set first image as the preview image
        }));

        await SpotImage.bulkCreate({ spotImages });
      }
      // Return the newly created spot
      return res.status(201).json({
        id: newSpot.id,
        ownerId: newSpot.ownerId,
        address: newSpot.address,
        city: newSpot.city,
        state: newSpot.state,
        country: newSpot.country,
        lat: newSpot.lat,
        lng: newSpot.lng,
        name: newSpot.name,
        description: newSpot.description,
        price: newSpot.price,
        createdAt: newSpot.createdAt,
        updatedAt: newSpot.updatedAt,
      });
    } catch (err) {
      console.error(err); // DEBUGGING
      return res.status(401).json({ message: "Unauthorized" });
    }
  }
);

//* Create a Review for a Spot based on the Spot's id (CHECKED)

router.post("/:spotId/reviews", requireAuth, async (req, res) => {
  try {
    const { review, stars } = req.body;
    const { spotId } = req.params;
    const userId = req.user.id;

    // Check if the user has already submitted a review for this spot
    const errors = {};
    const existingReview = await Review.findOne({
      where: { spotId, userId },
    });

    if (existingReview) {
      return res
        .status(500)
        .json({ message: "User already has a review for this spot" });
    }
    // Validate the input
    if (!review || typeof review !== "string" || review.trim() === "") {
      errors.review = "Review text is required";
    }
    if (!stars || !Number.isInteger(stars) || stars < 1 || stars > 5) {
      errors.stars = "Stars must be an integer from 1 to 5";
    }
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        message: "Bad Request",
        errors,
      });
    }

    // Check if the spot exists
    const spot = await Spot.findByPk(spotId);
    if (!spot) {
      return res.status(404).json({
        message: "Spot couldn't be found",
      });
    }

    // Create a new review
    const newReview = await Review.create({
      userId,
      spotId,
      review,
      stars,
    });

    // Return the newly created review
    return res.status(201).json({
      id: newReview.id,
      userId: newReview.userId,
      spotId: newReview.spotId,
      review: newReview.review,
      stars: newReview.stars,
      createdAt: newReview.createdAt,
      updatedAt: newReview.updatedAt,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server Error",
      error: error.message, // For debugging, but avoid sending this in production
    });
  }
});

//* GET all reviews for a spot
router.get("/:spotId/reviews", async (req, res) => {
  const { spotId } = req.params;

  // Check if the spot exists
  const spot = await Spot.findByPk(spotId);
  if (!spot) {
    return res.status(404).json({
      message: "Spot couldn't be found",
    });
  }

  // Fetch reviews for the spot, include associated User and ReviewImages
  const reviews = await Review.findAll({
    where: { spotId },
    include: [
      {
        model: User,
        as: "User", // Use the alias defined in the association
        attributes: ["id", "firstName", "lastName"],
      },
      {
        model: ReviewImage,
        as: "ReviewImages",
        attributes: ["id", "url"],
      },
    ],
  });

  return res.status(200).json({ Reviews: reviews });
});

//* Add Query Filters to Get All Spots (CHECKED)

router.get("/", validateQueryParams, async (req, res) => {
  try {
    let { page, size, minLat, maxLat, minLng, maxLng, minPrice, maxPrice } =
      req.query;

    // Set default values for pagination if not provided
    page = parseInt(page) || 1;
    size = parseInt(size) || 20;

    // Ensure page and size are within valid range
    if (page < 1) page = 1;
    if (size < 1 || size > 20) size = 20;

    // Create a `where` object to hold the filters
    const where = {};

    // Add filtering conditions based on query parameters
    if (minLat) where.lat = { [Op.gte]: parseFloat(minLat) };
    if (maxLat) where.lat = { ...where.lat, [Op.lte]: parseFloat(maxLat) };
    if (minLng) where.lng = { [Op.gte]: parseFloat(minLng) };
    if (maxLng) where.lng = { ...where.lng, [Op.lte]: parseFloat(maxLng) };
    if (minPrice) where.price = { [Op.gte]: parseFloat(minPrice) };
    if (maxPrice)
      where.price = { ...where.price, [Op.lte]: parseFloat(maxPrice) };

    // Query the database with filters and pagination
    const spots = await Spot.findAll({
      where,
      include: [
        {
          model: Review,
          attributes: [], // Don't return the reviews data
          required: false, // Allow spots with no reviews
        },
        {
          model: SpotImage,
          where: { preview: true }, // Only return preview images
          attributes: ["url"],
          required: false, // Allow spots with no images
        },
      ],
      group: ["Spot.id", "SpotImages.id"], // Grouping by Spot.id and SpotImages.id
      attributes: {
        include: [[fn("AVG", col("Reviews.stars")), "avgStarRating"]], // Calculate average star rating
      },
    });
    // Apply pagination manually
    const paginatedSpots = spots.slice((page - 1) * size, page * size);

    // Format the response
    const formattedSpots = paginatedSpots.map((spot) => {
      const images = spot.SpotImages.map((img) => img.url); // Collect all image URLs
      return {
        id: spot.id,
        ownerId: spot.ownerId,
        address: spot.address,
        city: spot.city,
        state: spot.state,
        country: spot.country,
        lat: spot.lat,
        lng: spot.lng,
        name: spot.name,
        description: spot.description,
        price: Number(spot.price), // Ensure price is a number
        createdAt: spot.createdAt,
        updatedAt: spot.updatedAt,
        avgRating: spot.dataValues.avgStarRating
          ? Number(spot.dataValues.avgStarRating).toFixed(1)
          : null,
        previewImage: spot.SpotImages.length ? spot.SpotImages[0].url : null,
        // images, // Add the images array
      };
    });

    // Return the response with pagination info
    return res.json({
      Spots: formattedSpots,
      page, // Include page in response
      size, // Include size in response
    });
  } catch (err) {
    return res.status(500).json({ message: "Internal server error" });
  }
});

//* DELETE a Spot by ID (CHECKED)
router.delete("/:spotId", requireAuth, async (req, res) => {
  const { spotId } = req.params; // Extract spotId from route parameters
  const userId = req.user.id; // Get the current user's ID from authentication

  // Find the spot by ID
  const spot = await Spot.findByPk(spotId);

  // If the spot doesn't exist, return a 404 error
  if (!spot) {
    return res.status(404).json({
      title: "Resource Not Found",
      message: "Spot couldn't be found",
    });
  }

  // Check if the authenticated user is the owner of the spot
  if (spot.ownerId !== userId) {
    return res.status(403).json({
      title: "Forbidden",
      message: "You are not authorized to delete this spot.",
    });
  }

  // If the user is the owner, proceed to delete the spot
  await spot.destroy();

  // Return success message after deletion
  return res.status(200).json({
    message: "Successfully deleted",
  });
});

// ***** EXPORTS *****/

module.exports = router;
