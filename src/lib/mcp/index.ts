import { auth, defineMcp } from "@lovable.dev/mcp-js";
import searchBusinesses from "./tools/search-businesses";
import listMyFavorites from "./tools/list-my-favorites";
import addFavorite from "./tools/add-favorite";
import listMyReviews from "./tools/list-my-reviews";

// Use the direct Supabase auth issuer, not the .lovable.cloud proxy — the
// discovery document mcp-js fetches must match this exactly (RFC 8414).
const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "chingubase-mcp",
  title: "친구Base",
  version: "0.1.0",
  instructions:
    "Tools for 친구Base — a directory of trusted, English-friendly services in Korea. Use `search_businesses` to find listings, `list_my_favorites` / `add_favorite` to manage the signed-in user's saved businesses, and `list_my_reviews` to read their reviews.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [searchBusinesses, listMyFavorites, addFavorite, listMyReviews],
});
