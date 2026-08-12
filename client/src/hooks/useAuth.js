// The actual implementation lives in AuthContext.jsx, next to the provider
// it belongs to — that's the more common pattern and avoids a circular
// import between context/ and hooks/. This file exists so the project
// matches the required hooks/useAuth.js structure, and so anything that
// prefers importing hooks from hooks/ can do:
//   import { useAuth } from '../hooks/useAuth';
// instead of reaching into context/AuthContext directly.
export { useAuth } from "../context/AuthContext";
