import TopNavBar from "../../components/TopNavBar"; // Import the TopNavBar component
import BottomNavBar from "../../components/BottomNavBar"; // Import the BottomNavBar component
import AuthGuard from "@/app/components/AuthGuard";

export default function DealsOffTheWeek() {
  return (
    <AuthGuard>
      <main>
        <TopNavBar />
        <h1>Deals</h1>
        <BottomNavBar />
      </main>
    </AuthGuard>
  );
}
