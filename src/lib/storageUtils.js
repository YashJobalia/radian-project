// storageUtils.js

// Function to retrieve and parse user data from local storage
export const loadRadianData = () => {
  const radianData = localStorage.getItem("radian");
  if (!radianData) return []; // Return an empty array if no data found

  const parsedData = JSON.parse(radianData);
  const users = Object.values(parsedData); // Extract all users into an array

  return users; // Return the array of users
};

// Function to save user data to local storage
export const saveRadianData = (users) => {
  const dataToSave = {};
  users.forEach((user) => {
    dataToSave[user.id] = user; // Use user ID as the key
  });

  localStorage.setItem("radian", JSON.stringify(dataToSave)); // Save the updated users object to local storage
};

export const removeUsersFromLocalStorage = (userIds) => {
  const storedUsers = JSON.parse(localStorage.getItem("radian")) || {};

  userIds.forEach((id) => {
    delete storedUsers[id]; // Remove user by ID
  });

  localStorage.setItem("radian", JSON.stringify(storedUsers));
};

// Function to reset local storage to initial state
export const resetLocalStorage = (initialData) => {
  localStorage.setItem("radian", JSON.stringify(initialData));
};
