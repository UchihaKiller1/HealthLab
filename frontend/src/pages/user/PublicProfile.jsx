import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  Avatar,
  Typography,
  Container,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Box,
} from "@mui/material";
import { styled } from "@mui/system";
import api from "../../utils/api";
import Navbar from "./component/Navbar";
import Footer from "./component/Footer";

const StyledCard = styled(Card)(({ theme }) => ({
  marginTop: theme.spacing(3),
  borderRadius: "12px",
  boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
}));

const ProfileHeader = styled(Box)(({ theme }) => ({
  padding: theme.spacing(4),
  backgroundColor: "#f8f9fa",
  borderRadius: "12px 12px 0 0",
  textAlign: "center",
}));

const PublicProfile = () => {
  const { userId } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        console.log("Fetching profile for user ID:", userId);
        const response = await api.get(`/users/${userId}`);
        
        if (response.data) {
          setProfile(response.data);
        } else {
          throw new Error('No data received from server');
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
        setError(err.response?.data?.message || err.message || "Failed to load profile. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchProfile();
    }
  }, [userId]);

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="80vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Typography color="error" variant="h6" align="center">
          {error}
        </Typography>
      </Container>
    );
  }

  /*console.log("Current profile state:", profile);*/

  if (!profile) {
    return (
      <Container maxWidth="md" sx={{ py: 4, textAlign: "center" }}>
        <Typography variant="h6" gutterBottom>
          {error || "User not found"}
        </Typography>
        <Typography variant="body1" color="textSecondary">
          The requested profile could not be loaded.
        </Typography>
      </Container>
    );
  }

  return (
    <div>
      {/*<Navbar />*/}
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <StyledCard>
          <ProfileHeader>
            <Avatar
              src={profile.profilePicture || "/default-avatar.png"}
              sx={{
                width: 120,
                height: 120,
                margin: "0 auto 16px",
                border: "4px solid white",
              }}
            />
            <Typography variant="h4" component="h1" gutterBottom>
              {profile.firstname} {profile.lastname}
            </Typography>
            <Typography variant="subtitle1" color="textSecondary">
              @{profile.username}
            </Typography>
            {profile.bio && (
              <Typography
                variant="body1"
                sx={{ mt: 2, maxWidth: "600px", mx: "auto" }}
              >
                {profile.bio}
              </Typography>
            )}
            <Box mt={2}>
              <Typography variant="body2" color="textSecondary">
                Joined {new Date(profile.joinDate).toLocaleDateString()}
              </Typography>
            </Box>
          </ProfileHeader>

          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ mt: 2, mb: 3 }}>
              Activity
            </Typography>

            {/* Add user activity or experiments here */}
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="subtitle1" color="primary">
                    Joined Experiments
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {profile.joinedExperiments?.length || 0} experiments
                  </Typography>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="subtitle1" color="primary">
                    Contributions
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {profile.contributions || 0} contributions
                  </Typography>
                </Card>
              </Grid>
            </Grid>
          </CardContent>
        </StyledCard>
      </Container>
      <Footer />
    </div>
  );
};

export default PublicProfile;
