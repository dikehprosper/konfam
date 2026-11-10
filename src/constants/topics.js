// Navigation taxonomy (topics endpoint not built yet). Server still validates the values it receives.
export const topics = ["Trending", "Governance & Policy", "Politics & Elections", "Culture & Entertainment", "Economy & Finance", "Health & Science", "Tech", "Climate & Environment", "World", "Sports", "Crypto", "Business & Industry", "Education", "Energy", "Weather"];
const allSubtopics = ["All", "AI", "Business & Companies", "Presidential", "Film & Nollywood", "Governorship", "International Relations", "Music", "Law & Order", "Monetary Policy", "Trade & Agriculture", "Capital Markets", "Temperature", "Inflation", "Infrastructure", "Health", "Science"];
const subtopicsByTopic = {
  "Governance & Policy": ["All", "Business & Companies", "Infrastructure", "Law & Order", "Presidential"],
  "Politics & Elections": ["All", "Governorship", "Presidential"],
  "Culture & Entertainment": ["All", "Film & Nollywood", "Music"],
  "Economy & Finance": ["All", "Business & Companies", "Capital Markets", "Inflation", "Monetary Policy", "Trade & Agriculture"],
  "Health & Science": ["All", "Health", "Science"],
  Tech: ["All", "AI"],
  "Climate & Environment": ["All", "Infrastructure", "Temperature"],
  World: ["All", "International Relations"],
  Sports: ["All"],
  Crypto: ["All"],
  "Business & Industry": ["All", "Business & Companies"],
  Education: ["All"],
  Energy: ["All"],
  Weather: ["All", "Temperature"],
};
export const subtopicsFor = (topic) => subtopicsByTopic[topic] || allSubtopics;
// Mirror of server limits for instant validation only. The server is the authority.
export const DEPOSIT_LIMITS = { minKobo: 5000, maxKobo: 1000000000 };
