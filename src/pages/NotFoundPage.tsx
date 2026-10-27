import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <section>
      <h1>Seite nicht gefunden</h1>
      <p>
        <Link to="/">Zur Fahrzeugliste</Link>
      </p>
    </section>
  );
}
