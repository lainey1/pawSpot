import { useModal } from "../../context/Modal";

export default function OpenModalButton({
  modalComponent, // component to render inside the modal
  buttonText, // text of the button that opens the modal
  onButtonClick, // optional: callback function that will be called once the button that opens the modal is clicked
  onModalClose, // optional: callback function that will be called once the modal is closed,
  className, // optional: for styling
}) {
  const { setModalContent, setOnModalClose } = useModal();

  const handleClick = () => {
    if (onModalClose) setOnModalClose(onModalClose);
    setModalContent(modalComponent);

    if (typeof onButtonClick === "function") onButtonClick();
  };

  return (
    <button
      className={className} // Pass the className to the button
      onClick={handleClick}
    >
      {buttonText}
    </button>
  );
}
