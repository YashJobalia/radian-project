import React, { useState } from "react";
import styles from "./Card.module.css";
import Modal from "@/components/modal/Modal";

export default function Card({ user, onDragStart, color }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <div
        className={`${styles.card} ${
          color === "greenCard"
            ? styles.greenCard
            : color === "redCard"
            ? styles.redCard
            : ""
        }`}
        draggable
        onDragStart={onDragStart}
      >
        <div className={styles.cardHeader}>
          <h3 className={styles.cardTitle}>
            {user.firstName} {user.lastName}
          </h3>
          <p className={styles.cardUsername}>{user.username}</p>
        </div>
        <button className={styles.viewButton} onClick={handleOpenModal}>
          View Details
        </button>
      </div>

      {isModalOpen && (
        <Modal onClose={handleCloseModal}>
          <h2
            style={{
              textAlign: "center",
              fontSize: "24px",
              color: "#13274C",
              marginBottom: "20px",
            }}
          >
            {user.firstName} {user.middleName} {user.lastName}
          </h2>
          <p style={{ color: "#13274C", margin: "10px 0" }}>
            <strong>Username:</strong> {user.username}
          </p>
          <p style={{ color: "#13274C", margin: "10px 0" }}>
            <strong>Email:</strong> {user.email}
          </p>
          <p style={{ color: "#13274C", margin: "10px 0" }}>
            <strong>Phone:</strong> {user.phoneCode} {user.phone}
          </p>
          <p style={{ color: "#13274C", margin: "10px 0" }}>
            <strong>Date of Birth:</strong> {user.dob}
          </p>
          <p style={{ color: "#13274C", margin: "10px 0" }}>
            <strong>Gender:</strong> {user.gender}
          </p>
          <p style={{ color: "#13274C", margin: "10px 0" }}>
            <strong>Address:</strong> {user.address}
          </p>
          <p style={{ color: "#13274C", margin: "10px 0" }}>
            <strong>Department:</strong> {user.department}
          </p>
          <p style={{ color: "#13274C", margin: "10px 0" }}>
            <strong>Location Preferences:</strong>{" "}
            {user.locationPreferences.join(", ")}
          </p>
          <p style={{ color: "#13274C", margin: "10px 0" }}>
            <strong>Plan:</strong> {user.plan}
          </p>
          <p style={{ color: "#13274C", margin: "10px 0" }}>
            <strong>Payment Cycle:</strong> {user.paymentCycle}
          </p>
          <button onClick={handleCloseModal} className={styles.modalButton}>
            Close
          </button>
        </Modal>
      )}
    </>
  );
}
