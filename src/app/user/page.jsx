import UserManagement from "@/components/user-management/UserManagement";
import React from "react";

export const metadata = {
  title: "User Management Dashboard",
  description: "Designed by Yash",
};

const page = () => {
  return (
    <>
      <UserManagement />
    </>
  );
};

export default page;
