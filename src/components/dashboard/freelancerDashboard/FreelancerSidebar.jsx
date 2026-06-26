"use client";


import { useState } from "react";

const navItems = [
  {
    label: "Dashboard",
    icon: (
      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    label: "Browse Tasks",
    icon: (
      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24">
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
    ),
  },
  {
    label: "My Proposals",
    icon: (
      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24">
        <rect x="4" y="3" width="16" height="18" rx="2" />
        <line x1="8" y1="8" x2="16" y2="8" />
        <line x1="8" y1="12" x2="16" y2="12" />
        <line x1="8" y1="16" x2="12" y2="16" />
      </svg>
    ),
  },
  {
    label: "Active Projects",
    icon: (
      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
      </svg>
    ),
  },
  {
    label: "My Earnings",
    icon: (
      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24">
        <rect x="2" y="5" width="20" height="14" rx="2" />
        <path d="M2 10h20" />
        <path d="M6 15h4" />
      </svg>
    ),
  },
  {
    label: "Edit Profile",
    icon: (
      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24">
        <circle cx="12" cy="8" r="4" />
        <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
      </svg>
    ),
  },
  {
    label: "Settings",
    icon: (
      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    ),
  },
];

export default function Sidebar() {
  const [active, setActive] = useState("Dashboard");

  return (
    <div style={styles.wrapper}>
      {/* Logo / Brand */}
      <div style={styles.brand}>
        <span style={styles.brandDot} />
        <span style={styles.brandName}>FreelanceHub</span>
      </div>

      {/* Nav Items */}
      <nav style={styles.nav}>
        {navItems.map((item) => {
          const isActive = active === item.label;
          return (
            <button
              key={item.label}
              onClick={() => setActive(item.label)}
              style={{
                ...styles.navItem,
                ...(isActive ? styles.navItemActive : {}),
              }}
            >
              <span
                style={{
                  ...styles.icon,
                  ...(isActive ? styles.iconActive : {}),
                }}
              >
                {item.icon}
              </span>
              <span
                style={{
                  ...styles.label,
                  ...(isActive ? styles.labelActive : {}),
                }}
              >
                {item.label}
              </span>
              {isActive && <span style={styles.activePill} />}
            </button>
          );
        })}
      </nav>

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Divider */}
      <div style={styles.divider} />

      {/* Logout */}
      <button style={styles.logout}>
        <span style={styles.icon}>
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
        </span>
        <span style={styles.label}>Logout</span>
      </button>
    </div>
  );
}

const styles = {
  wrapper: {
    width: "240px",
    minHeight: "100vh",
    backgroundColor: "#111318",
    display: "flex",
    flexDirection: "column",
    padding: "24px 12px 20px",
    boxSizing: "border-box",
    borderRight: "1px solid #1e2028",
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
  },
  brand: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    paddingLeft: "12px",
    marginBottom: "36px",
  },
  brandDot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    backgroundColor: "#6c8fff",
  },
  brandName: {
    color: "#e2e4ed",
    fontSize: "15px",
    fontWeight: "600",
    letterSpacing: "0.02em",
  },
  nav: {
    display: "flex",
    flexDirection: "column",
    gap: "2px",
  },
  navItem: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "11px 14px",
    borderRadius: "10px",
    border: "none",
    background: "transparent",
    cursor: "pointer",
    position: "relative",
    transition: "background 0.15s ease",
    textAlign: "left",
    width: "100%",
  },
  navItemActive: {
    backgroundColor: "#1a1d27",
  },
  icon: {
    color: "#5a5f72",
    display: "flex",
    alignItems: "center",
    flexShrink: 0,
    transition: "color 0.15s ease",
  },
  iconActive: {
    color: "#6c8fff",
  },
  label: {
    color: "#6b7080",
    fontSize: "14px",
    fontWeight: "400",
    transition: "color 0.15s ease",
  },
  labelActive: {
    color: "#dde1f0",
    fontWeight: "500",
  },
  activePill: {
    position: "absolute",
    right: "10px",
    width: "4px",
    height: "4px",
    borderRadius: "50%",
    backgroundColor: "#6c8fff",
  },
  divider: {
    height: "1px",
    backgroundColor: "#1e2028",
    margin: "12px 4px",
  },
  logout: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "11px 14px",
    borderRadius: "10px",
    border: "none",
    background: "transparent",
    cursor: "pointer",
    width: "100%",
    textAlign: "left",
  },
};