import React from "react";
import styles from "./Group.module.css";
import Card from "@/components/card/Card";

export default function Group({
  title,
  users,
  onDrop,
  onDragOver,
  onDragStart,
  onClick,
  cardColor,
  children,
}) {
  return (
    <div
      className={`${styles.groupContainer} ${
        title === "Keep Users" ? styles.greenBackground : styles.redBackground
      }`}
      onDrop={onDrop}
      onDragOver={onDragOver}
    >
      <div className={styles.groupHeader}>
        <h3 className={styles.groupTitle}>{title}</h3>
        {children}
      </div>
      <div className={styles.cardContainer}>
        {users.map((user) => (
          <Card
            key={user.id}
            user={user}
            onDragStart={(event) => onDragStart(event, user)}
            onClick={() => onClick(user.id)}
            color={
              cardColor === "green" ? "greenCard" : "redCard"
            } /* Dynamically set card color */
          />
        ))}
      </div>
    </div>
  );
}
