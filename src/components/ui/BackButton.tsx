import { useNavigate } from "react-router-dom";
import { ArrowLeftIcon } from "@radix-ui/react-icons";

export function BackButton() {
  const navigate = useNavigate();

  return (
    <button onClick={() => navigate(-1)}>
      <ArrowLeftIcon />
    </button>
  );
}
