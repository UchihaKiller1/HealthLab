import React from "react";
import Navbar from "./component/Navbar";
import ProfileHeader from "./component/ProfileHeader";
import ExperimentCards from "./component/ExperimentCards";
import StatsSection from "./component/StatsSection";
import SettingsSection from "./component/SettingsSection";
import Footer from "./component/Footer";
import JoinedExperiments from "./component/JoinedExperiments";

const Profile = () => {
  return (
    <div>
      <Navbar />
      <ProfileHeader />
      <ExperimentCards />
      <JoinedExperiments />
      <StatsSection />
      <SettingsSection />
      <Footer />
    </div>
  );
};

export default Profile;
