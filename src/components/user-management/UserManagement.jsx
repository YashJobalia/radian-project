"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/navbar/Navbar";
import styles from "./UserManagement.module.css";
import Group from "@/components/group/Group";
import Card from "@/components/card/Card";
import {
  loadRadianData,
  removeUsersFromLocalStorage,
  resetLocalStorage,
} from "@/lib/storageUtils";

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [groupA, setGroupA] = useState([]);
  const [groupB, setGroupB] = useState([]);
  const [initialData, setInitialData] = useState({});

  useEffect(() => {
    const radianUsers = loadRadianData();
    if (radianUsers.length > 0) {
      setUsers(radianUsers);
      setInitialData(
        radianUsers.reduce((acc, user) => {
          acc[user.id] = user;
          return acc;
        }, {})
      );
    }
  }, []);

  const handleDragStart = (event, user) => {
    event.dataTransfer.setData("userId", user.id);
  };

  const handleDrop = (event, setGroup, group) => {
    const userId = event.dataTransfer.getData("userId");
    const draggedUser =
      users.find((user) => user.id === userId) ||
      groupA.find((user) => user.id === userId) ||
      groupB.find((user) => user.id === userId);

    if (draggedUser) {
      setUsers(users.filter((user) => user.id !== userId));
      setGroupA(groupA.filter((user) => user.id !== userId));
      setGroupB(groupB.filter((user) => user.id !== userId));

      setGroup((prevGroup) => [...prevGroup, draggedUser]);
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault(); // Allow drop
  };

  const handleUserClick = (userId) => {
    window.location.href = `/user/${userId}`;
  };

  const handleSubmit = () => {
    if (users.length > 0) {
      alert(
        "Please assign all users to either Keep Users or Remove Users before submitting."
      );
      return;
    }

    // Get IDs of users in Group B
    const groupBIds = groupB.map((user) => user.id);

    // Call the function to remove these users from local storage
    removeUsersFromLocalStorage(groupBIds);

    // Optionally clear Group B after submission
    setGroupB([]);

    alert("Users in 'Remove Users' have been removed from local storage.");

    // Refresh the page after submission
    window.location.reload();
  };

  const handleReset = () => {
    setUsers(loadRadianData());
    setGroupA([]);
    setGroupB([]);
    resetLocalStorage(initialData);
  };

  const handleAddRemainingUsersToGroup = (setGroup, group) => {
    setGroup([...group, ...users]);
    setUsers([]);
  };

  return (
    <div className={styles.container}>
      <Navbar
        title="User Management Dashboard"
        buttonLabel="Add User"
        buttonLink="/"
      />
      <button
        className={styles.addButton}
        onClick={() => (window.location.href = "/signup")}
      >
        Add More Users
      </button>

      <div className={styles.topSection}>
        <div
          className={styles.userContainer}
          onDrop={(event) => handleDrop(event, setUsers, users)}
          onDragOver={handleDragOver}
        >
          {users.map((user) => (
            <Card
              key={user.id}
              user={user}
              onDragStart={(event) => handleDragStart(event, user)}
              onClick={() => handleUserClick(user.id)}
              color="white"
            />
          ))}
        </div>
      </div>

      <div className={styles.bottomSection}>
        <Group
          title="Keep Users"
          users={groupA}
          onDrop={(event) => handleDrop(event, setGroupA, groupA)}
          onDragOver={handleDragOver}
          onDragStart={(event, user) => handleDragStart(event, user)}
          onClick={handleUserClick}
          cardColor="green"
        >
          <button
            className={`${styles.addRemainingButton} ${styles.greenButton} `}
            onClick={() => handleAddRemainingUsersToGroup(setGroupA, groupA)}
          >
            Add Remaining
          </button>
        </Group>

        <Group
          title="Remove Users"
          users={groupB}
          onDrop={(event) => handleDrop(event, setGroupB, groupB)}
          onDragOver={handleDragOver}
          onDragStart={(event, user) => handleDragStart(event, user)}
          onClick={handleUserClick}
          cardColor="red"
        >
          <button
            className={`${styles.addRemainingButton} ${styles.redButton}`}
            onClick={() => handleAddRemainingUsersToGroup(setGroupB, groupB)}
          >
            Add Remaining
          </button>
        </Group>
      </div>

      <div className={styles.buttonContainer}>
        <button className={styles.submitButton} onClick={handleSubmit}>
          Submit
        </button>
        <button className={styles.resetButton} onClick={handleReset}>
          Reset
        </button>
      </div>
    </div>
  );
}
