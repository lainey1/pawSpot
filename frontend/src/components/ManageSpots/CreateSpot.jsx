import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { fetchSpot, createNewSpot } from "../../store/spots/thunks";

import "./Form.css";

const UpdateSpot = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { spotId } = useParams();

  // State Hooks
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    country: "",
    address: "",
    city: "",
    state: "",
    lat: "",
    lng: "",
    name: "",
    description: "",
    price: "",
    previewImageUrl: "",
    imageUrls: ["", "", "", ""],
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setLoading(true);
    dispatch(fetchSpot(spotId))
      .then(() => setLoading(false))
      .catch(() => setLoading(false));
  }, [dispatch, spotId]);

  // Validation helper functions
  const validateForm = () => {
    const newErrors = {};

    if (!formData.country) newErrors.country = "Country is required";
    if (!formData.address) newErrors.address = "Address is required";
    if (!formData.city) newErrors.city = "City is required";
    if (!formData.state) newErrors.state = "State is required";
    if (!formData.name) newErrors.name = "Name of your spot is required";
    if (!formData.description || formData.description.length < 30)
      newErrors.description = "Description needs 30 or more characters";

    if (!formData.price) {
      newErrors.price = "Price per night is required";
    } else if (isNaN(Number(formData.price))) {
      newErrors.price = "Price must be a valid number";
    }

    if (!formData.previewImageUrl.trim())
      newErrors.previewImageUrl = "Preview Image URL is required";

    return newErrors;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value.trimStart(),
    }));
  };

  const handleImageChange = (index, value) => {
    const newImageUrls = [...formData.imageUrls];
    newImageUrls[index] = value;
    setFormData((prev) => ({
      ...prev,
      imageUrls: newImageUrls,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const newSpotData = {
      ...formData,
      lat: parseFloat(formData.lat),
      lng: parseFloat(formData.lng),
      price: parseFloat(formData.price),
      imageUrls: [formData.previewImageUrl, ...formData.imageUrls].filter(
        (url) => url
      ),
    };

    try {
      // Await the dispatch to get the spotId returned from createNewSpot
      const spotId = await dispatch(createNewSpot(newSpotData)); // Ensure this returns the ID
      navigate(`/spots/${spotId}`); // Use the returned spotId for navigation
    } catch (error) {
      console.error("Failed to create spot:", error);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <form onSubmit={handleSubmit} className="form">
        <h1>Create a New Spot</h1>

        <section>
          <h2>Where&apos;s your place located?</h2>
          <p>
            Guests will only get your exact address once they booked a
            reservation.
          </p>

          <select
            className="select-field"
            name="country"
            value={formData.country}
            onChange={handleInputChange}
            placeholder="Country"
            required
          >
            <option value="" disabled>
              Select a Country
            </option>
            <option value="United States">United States</option>
            <option value="Canada">Canada</option>
            <option value="United Kingdom">United Kingdom</option>
            <option value="France">France</option>
            <option value="Germany">Germany</option>
            <option value="Australia">Australia</option>
            <option value="Japan">Japan</option>
            <option value="Mexico">Mexico</option>
            <option value="Italy">Italy</option>
            <option value="Spain">Spain</option>
          </select>
          {errors.country && <p className="error-message">{errors.country}</p>}
          <input
            className="input-field"
            name="address"
            value={formData.address}
            onChange={handleInputChange}
            placeholder="Street Address"
            required
          />
          {errors.address && <p className="error-message">{errors.address}</p>}
          <input
            className="input-field"
            name="city"
            value={formData.city}
            onChange={handleInputChange}
            placeholder="City"
            required
          />
          {errors.city && <p className="error-message">{errors.city}</p>}
          <input
            className="input-field"
            name="state"
            value={formData.state}
            onChange={handleInputChange}
            placeholder="State"
            required
          />
          {errors.state && <p className="error-message">{errors.state}</p>}
          <div id="lat-long">
            <input
              className="lat"
              type="number"
              name="lat"
              value={formData.lat}
              onChange={handleInputChange}
              placeholder="Latitude"
            />
            ,
            <input
              className="long"
              type="number"
              name="lng"
              value={formData.lng}
              onChange={handleInputChange}
              placeholder="Longitude"
            />{" "}
          </div>
          <div
            style={{
              fontSize: "0.8em",
              fontStyle: "italic",
              textAlign: "right",
              marginRight: "1em",
              paddingBottom: "1em",
            }}
          >
            *Optional
          </div>
        </section>

        <section>
          <h2>Describe your place to guests</h2>
          <p>
            Mention the best features of your space, any special amenities like
            fast wifi or parking, and what you love about the neighborhood.
          </p>

          <textarea
            className="textarea-field"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Please write at least 30 characters"
            required
          />
          {errors.description && (
            <p className="error-message">{errors.description}</p>
          )}
        </section>

        <section>
          <h2>Create a title for your spot</h2>
          <p>
            Catch guests&apos; attention with a spot title that highlights what
            makes your place special.
          </p>
          <input
            className="input-field"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Name of your spot"
            required
          />
          {errors.name && <p className="error-message">{errors.name}</p>}
        </section>

        <section>
          <h2>Set a base price for your spot</h2>
          <p>
            Competitive pricing can help your listing stand out and rank higher
            in search results.
          </p>
          <input
            className="input-field"
            type="number"
            name="price"
            step="0.01"
            value={formData.price}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                price: parseFloat(e.target.value) || "",
              }))
            }
            placeholder="Price per night (USD)"
            required
          />

          {errors.price && <p className="error-message">{errors.price}</p>}
        </section>

        <section>
          <h2>Liven up your spot with photos</h2>
          <p>Submit a link to at least one photo to publish your spot.</p>

          <div className="image-url-container">
            <input
              className="input-field"
              name="previewImageUrl"
              value={formData.previewImageUrl}
              onChange={handleInputChange}
              placeholder="Required: Preview Image URL"
            />

            {errors.previewImageUrl && (
              <p className="error-message">{errors.previewImageUrl}</p>
            )}

            {formData.imageUrls.map((url, index) => (
              <input
                key={index}
                className="input-field"
                value={url}
                onChange={(e) => handleImageChange(index, e.target.value)}
                placeholder="Image URL"
              />
            ))}
          </div>
        </section>

        <button type="submit">Create Spot</button>
      </form>
    </div>
  );
};

export default UpdateSpot;
