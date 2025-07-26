import styles from './page.module.css'
import NavBar from './components/NavBar'
import EventCarousel from './components/events/EventCarousel'

export default function Home() {
  const freeFoodEvents = [
    {
      id: 1,
      eventCover: "https://via.placeholder.com/400x200",
      eventTitle: "Free Pancake Breakfast",
      eventOwner: "Sixth College Council",
      eventDate: "2025-08-28T09:00:00",
      eventLocation: "Dogghouse",
      eventDescription: "Start your day with free pancakes and fruit!",
      eventTags: ["Free", "Food", "Breakfast"],
    },
    {
      id: 2,
      eventCover: "https://via.placeholder.com/400x200",
      eventTitle: "Pizza & Politics",
      eventOwner: "AS Civic Engagement",
      eventDate: "2025-09-02T18:00:00",
      eventLocation: "Price Center East",
      eventDescription: "Grab a slice and join a discussion on student issues.",
      eventTags: ["Free", "Food", "Discussion"],
    },
    {
      id: 3,
      eventCover: "https://via.placeholder.com/400x200",
      eventTitle: "Samosa Social",
      eventOwner: "Indian Student Association",
      eventDate: "2025-09-05T17:00:00",
      eventLocation: "ERC Green",
      eventDescription: "Meet new friends over free samosas and chai!",
      eventTags: ["Free", "Cultural", "Food"],
    },
    {
      id: 4,
      eventCover: "https://via.placeholder.com/400x200",
      eventTitle: "Food Truck Friday",
      eventOwner: "Muir College Council",
      eventDate: "2025-09-06T12:00:00",
      eventLocation: "Muir Quad",
      eventDescription: "Free food truck vouchers for the first 200 students!",
      eventTags: ["Free", "Food", "Outdoor"],
    },
    {
      id: 5,
      eventCover: "https://via.placeholder.com/400x200",
      eventTitle: "Taco Tuesday Bash",
      eventOwner: "Latinx Student Union",
      eventDate: "2025-09-09T18:30:00",
      eventLocation: "Marshall Field",
      eventDescription: "Free tacos, salsa music, and games!",
      eventTags: ["Free", "Food", "Social"],
    },
    {
      id: 6,
      eventCover: "https://via.placeholder.com/400x200",
      eventTitle: "Grill & Chill",
      eventOwner: "Triton Transfer Hub",
      eventDate: "2025-09-12T13:00:00",
      eventLocation: "Sun God Lawn",
      eventDescription: "BBQ and networking with fellow transfer students.",
      eventTags: ["Free", "Transfer", "BBQ"],
    },
    {
      id: 7,
      eventCover: "https://via.placeholder.com/400x200",
      eventTitle: "Pasta & Profs",
      eventOwner: "ERC Student Council",
      eventDate: "2025-09-13T17:00:00",
      eventLocation: "ERC Room 201",
      eventDescription: "Dinner and informal chats with ERC faculty.",
      eventTags: ["Free", "Food", "Academic"],
    },
    {
      id: 8,
      eventCover: "https://via.placeholder.com/400x200",
      eventTitle: "Donuts & Diversity",
      eventOwner: "Cross Cultural Center",
      eventDate: "2025-09-14T10:00:00",
      eventLocation: "CCC Lounge",
      eventDescription: "Free donuts and a chat about inclusive leadership.",
      eventTags: ["Free", "Food", "Discussion"],
    },
    {
      id: 9,
      eventCover: "https://via.placeholder.com/400x200",
      eventTitle: "PB&J Party",
      eventOwner: "Circle K",
      eventDate: "2025-09-15T11:00:00",
      eventLocation: "Library Walk",
      eventDescription: "Make your own sandwich and help prepare care packs.",
      eventTags: ["Free", "Food", "Volunteer"],
    },
    {
      id: 10,
      eventCover: "https://via.placeholder.com/400x200",
      eventTitle: "Pho Friday",
      eventOwner: "Vietnamese Student Association",
      eventDate: "2025-09-19T12:00:00",
      eventLocation: "PC Plaza",
      eventDescription: "Come warm up with a bowl of free pho!",
      eventTags: ["Free", "Cultural", "Food"],
    },
    {
      id: 11,
      eventCover: "https://via.placeholder.com/400x200",
      eventTitle: "Sweet Tooth Social",
      eventOwner: "Women in STEM",
      eventDate: "2025-09-21T15:00:00",
      eventLocation: "Galbraith Hall",
      eventDescription: "Free desserts while learning about STEM orgs!",
      eventTags: ["Free", "STEM", "Desserts"],
    },
    {
      id: 12,
      eventCover: "https://via.placeholder.com/400x200",
      eventTitle: "Ramen Night",
      eventOwner: "TASA",
      eventDate: "2025-09-23T18:00:00",
      eventLocation: "The Village Courtyard",
      eventDescription: "Cozy ramen bar + karaoke night!",
      eventTags: ["Free", "Food", "Karaoke"],
    },
    {
      id: 13,
      eventCover: "https://via.placeholder.com/400x200",
      eventTitle: "Snack & Study",
      eventOwner: "Psi Chi Psychology Club",
      eventDate: "2025-09-25T16:00:00",
      eventLocation: "Geisel Library Study Room 4",
      eventDescription: "Free snacks and quiet study session before midterms.",
      eventTags: ["Free", "Study", "Food"],
    },
    {
      id: 14,
      eventCover: "https://via.placeholder.com/400x200",
      eventTitle: "Cider & Crafts",
      eventOwner: "Crafts & Coffee Club",
      eventDate: "2025-09-27T14:00:00",
      eventLocation: "One Miramar Lounge",
      eventDescription: "DIY crafts and free apple cider!",
      eventTags: ["Free", "Crafts", "Food"],
    },
    {
      id: 15,
      eventCover: "https://via.placeholder.com/400x200",
      eventTitle: "Late Night Munchies",
      eventOwner: "Marshall Res Life",
      eventDate: "2025-09-29T21:00:00",
      eventLocation: "Marshall Activity Center",
      eventDescription: "Free pizza, games, and stress relief!",
      eventTags: ["Free", "Food", "Nightlife"],
    }
  ];

  const fundraiserEvents = Array.from({ length: 15 }, (_, i) => ({
    id: 100 + i,
    eventCover: "https://via.placeholder.com/400x200",
    eventTitle: `Fundraiser Event ${i + 1}`,
    eventOwner: ["Triton Fund", "Dance Marathon", "Triton Racing", "KSDT", "ACM", "Sigma Chi", "UCSD UNICEF"][i % 7],
    eventDate: `2025-10-${String(1 + i).padStart(2, '0')}T17:00:00`,
    eventLocation: ["Library Walk", "Sun God Lawn", "PC Ballroom", "Mandeville Steps"][i % 4],
    eventDescription: `Help us raise money for a great cause! Event #${i + 1}`,
    eventTags: ["Fundraiser", "Student Org", "Support"],
  }));

  const gbmEvents = Array.from({ length: 15 }, (_, i) => ({
    id: 200 + i,
    eventCover: "https://via.placeholder.com/400x200",
    eventTitle: `GBM Week ${i + 1}`,
    eventOwner: ["SDSU", "SASE", "WIC", "IEEE", "BMES", "CSSA", "MedLife", "Triton Gaming"][i % 8],
    eventDate: `2025-11-${String(1 + i).padStart(2, '0')}T18:30:00`,
    eventLocation: ["CSE 1202", "ERC Room 302", "Center Hall", "PC Forum West"][i % 4],
    eventDescription: `Learn more about our club and upcoming opportunities. GBM ${i + 1}`,
    eventTags: ["GBM", "Free", "Community"],
  }));

  return (
    <>
      <NavBar />
      <main className={styles.pageContent}>
        <h1 className={styles.pageTitle}>Home</h1>
        <EventCarousel category="Free Food" events={freeFoodEvents} />
        <EventCarousel category="Fundraisers" events={fundraiserEvents} />
        <EventCarousel category="GBMs" events={gbmEvents} />
      </main>
    </>
  );
}
