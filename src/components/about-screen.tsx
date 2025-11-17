import { Link } from "react-router-dom";

export const AboutScreen = () => {
    return (
    <div className="p-4">
        <h2>About Page</h2>
        <p>This is a simple about page.</p>
        <Link to="/">Go back to Home</Link>
    </div>
    );
};