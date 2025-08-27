import React from "react";
import Navbar from "./component/Navbar";
import EditProfileForm from "./component/form/EditProfileForm";
import Footer from "./component/Footer";

const EditProfile = () => {
  return (
    <div>
      <Navbar />
      <EditProfileForm />
      <Footer />
    </div>
  );
};

export default EditProfile;
