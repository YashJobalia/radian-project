import React, { useState, useEffect } from "react";
import styles from "./Navbar.module.css";

export default function Navbar({ title, buttonLabel, buttonLink }) {
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!isMobileMenuOpen);
  };

  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth <= 768);
    };

    handleResize(); // Check on initial load
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <nav className={styles.navbar}>
      <div className={styles.navbarContainer}>
        <a href="/" className={styles.navbarLogo}>
          <img
            src="https://www.radiangroup.com/wp-content/uploads/2022/10/radian-logo.svg"
            alt="Company Logo"
            className={styles.logo}
          />
        </a>
        {!isMobileView && <h1 className={styles.navbarTitle}>{title}</h1>}
        <div className={styles.navbarActions}>
          {!isMobileView && (
            <a href={buttonLink} className={styles.navbarButton}>
              {buttonLabel}
            </a>
          )}
          <div className={styles.navbarToggle} onClick={toggleMobileMenu}>
            <span className={styles.bar}></span>
            <span className={styles.bar}></span>
            <span className={styles.bar}></span>
          </div>
        </div>
      </div>
      {isMobileMenuOpen && isMobileView && (
        <div className={styles.navbarMenu}>
          <h1 className={styles.mobileTitle}>{title}</h1>
          <a href={buttonLink} className={styles.navbarButton}>
            {buttonLabel}
          </a>
        </div>
      )}
    </nav>
  );
}
