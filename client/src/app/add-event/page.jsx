import NavBar from "../components/NavBar";
import AddEventPage from "./AddEventPage";

export default function Page() {
  return (
    <>
      <NavBar currentPage="create" />
      <AddEventPage />
    </>
  );
}
