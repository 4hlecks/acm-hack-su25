import NavBar from "../components/navbar/NavBar";
import AddEventPage from "./AddEventPage";
import TabBar from '../components/navbar/TabBar'

export default function Page() {
  return (
    <>
      <NavBar currentPage="create" />
      <AddEventPage />
      <TabBar />
    </>
  );
}
