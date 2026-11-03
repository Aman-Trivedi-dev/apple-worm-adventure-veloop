import { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { Link, useNavigate } from "react-router-dom";
import { apiRequest } from "../services/api";
import "./Login.css";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Helper function to persist auth session
  const saveAuthSession = (token, user) => {
    const storage = rememberMe ? localStorage : sessionStorage;
    const otherStorage = rememberMe ? sessionStorage : localStorage;

    otherStorage.removeItem("token");
    otherStorage.removeItem("user");

    storage.setItem("token", token);
    if (user) {
      storage.setItem("user", JSON.stringify(user));
    }
  };

  // Google OAuth Success Handler
  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      if (!credentialResponse?.credential) {
        throw new Error("Google did not return a credential.");
      }

      const data = await apiRequest("/auth/google", {
        method: "POST",
        body: JSON.stringify({
          credential: credentialResponse.credential,
        }),
      });

      if (!data?.token) {
        throw new Error(data?.message || "Backend did not return a token.");
      }

      saveAuthSession(data.token, data.user);
      navigate("/dashboard", { replace: true });
    } catch (error) {
      console.error("Google login error:", error);
      alert(
        error?.message ||
          "Google login failed. Check the browser console and backend.",
      );
    }
  };

  // Standard Email/Password Form Submit Handler
  const handleLogin = async (event) => {
    event.preventDefault();
    if (isLoading) return;

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      alert("Please enter your email and password.");
      return;
    }

    setIsLoading(true);

    try {
      const data = await apiRequest("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email: trimmedEmail, password }),
      });

      const token = data?.token;
      if (!token) {
        throw new Error("Login failed. Please try again.");
      }

      saveAuthSession(token, data.user);
      navigate("/dashboard", { replace: true });
    } catch (error) {
      alert(error?.message || "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const currentYear = new Date().getFullYear();

  return (
    <main className="adventure-login">
      <div className="login-scenery">
        <span className="scenery-sun">🌎</span>
        <div className="scenery-cloud cloud-one">☁</div>
        <div className="scenery-cloud cloud-two">☁</div>
        <div className="scenery-hill hill-one" />
        <div className="scenery-hill hill-two" />
        <div className="scenery-grass">🌿 🍃 🌱 🍃 🌿</div>
      </div>

      <div className="adventure-content">
        <section className="adventure-left">
          <header className="adventure-brand">
            <span className="brand-icon">🍎</span>
            <div>
              <h1>APPLE WORM</h1>
              <p>ADVENTURE</p>
            </div>
          </header>

          <div className="adventure-heading">
            <span className="heading-label">PLAY. EARN. EXPLORE.</span>

            <h2>
              A world of
              <br />
              <span>puzzles &amp; rewards!</span>
            </h2>

            <p>
              Solve exciting puzzles, collect apples, and grow your worm. Your
              next adventure starts here.
            </p>
          </div>

          <div className="adventure-login-card">
            <div className="login-card-heading">
              <h2>Welcome Back!</h2>
              <p>Log in and keep your progress safe.</p>
            </div>

            <div className="social-buttons">
              {/* Google Login */}
              <div className="google-login-wrapper">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => {
                    alert("Google Sign-In failed. Please try again.");
                  }}
                  text="continue_with"
                  shape="pill"
                  theme="outline"
                  width="100%"
                />
              </div>
            </div>

            <div className="login-divider">
              <span>OR</span>
            </div>

            <form className="adventure-form" onSubmit={handleLogin}>
              <div className="adventure-input">
                <span>✉</span>
                <input
                  type="email"
                  name="email"
                  placeholder="Email Address"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="adventure-input">
                <span>🔒</span>
                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <div className="login-options">
                <label>
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  Remember me
                </label>

                <Link to="/forgot-password">Forgot Password?</Link>
              </div>

              <button
                type="submit"
                className="adventure-submit"
                disabled={isLoading}
              >
                {isLoading ? "Logging in..." : "Log In"}
              </button>
            </form>

            <p className="adventure-signup">
              New here? <Link to="/register">Sign Up</Link>
            </p>
          </div>
        </section>

        <aside className="adventure-right">
          <div className="game-logo-art">
            <div className="logo-puzzle">🧩</div>

            <h2>
              PUZZLE
              <span>ADVENTURE</span>
            </h2>

            <p>PLAY. EARN. EXPLORE.</p>
          </div>

          <div className="reward-list">
            <div className="reward-item">
              <span>🪙</span>
              <div>
                <strong>Solve Puzzles</strong>
                <small>Earn Coins</small>
              </div>
            </div>

            <div className="reward-item">
              <span>🎁</span>
              <div>
                <strong>Redeem Rewards</strong>
                <small>Unlock Surprises</small>
              </div>
            </div>

            <div className="reward-item">
              <span>🏆</span>
              <div>
                <strong>Level Up</strong>
                <small>Unlock More</small>
              </div>
            </div>
          </div>

          <div className="wooden-signs">
            <div>🧩 PUZZLES</div>
            <div>🪱 ADVENTURE</div>
            <div>🎁 REWARDS</div>
            <div>🌟 REAL FUN</div>
          </div>

          <p className="adventure-slogan">
            Good Players
            <br />
            Get Rewards!
          </p>
        </aside>
      </div>

      <footer className="adventure-footer">
        <p>© {currentYear} Apple Worm Adventure. All rights reserved.</p>
      </footer>
    </main>
  );
}

export default Login;