import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Create a transporter object with more explicit configuration
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // true for 465, false for other ports
  requireTLS: true,
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD,
  },
  tls: {
    // Do not fail on invalid certs
    rejectUnauthorized: false
  },
  logger: true,
  debug: true
});

// Verify connection configuration
transporter.verify(function(error, success) {
  if (error) {
    console.error('Error verifying email configuration:', error);
  } else {
    console.log('Server is ready to take our messages');
  }
});

// Email template for new experiment notification
const newExperimentTemplate = (experimentName, userName) => ({
  from: `"HealthLab" <${process.env.EMAIL_USERNAME}>`,
  to: '', // Will be set when sending
  subject: `New Experiment Available: ${experimentName}`,
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2C5835;">New Experiment Available!</h2>
      <p>Hello ${userName},</p>
      <p>A new experiment "${experimentName}" has been added to HealthLab.</p>
      <p>Log in to your account to check it out and participate!</p>
      <a href="${process.env.FRONTEND_URL}/explore" 
         style="display: inline-block; padding: 10px 20px; background-color: #2C5835; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px;">
        View Experiment
      </a>
      <p style="margin-top: 30px; font-size: 0.9em; color: #666;">
        You're receiving this email because you have email notifications enabled in your account settings.
      </p>
    </div>
  `,
});

export const sendNewExperimentNotification = async (userEmail, userName, experimentName) => {
  try {
    const mailOptions = newExperimentTemplate(experimentName, userName);
    mailOptions.to = userEmail;
    
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent: %s', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: error.message };
  }
};

export const sendBulkNewExperimentNotifications = async (users, experimentName) => {
  try {
    const results = [];
    
    for (const user of users) {
      if (user.notificationPreferences?.emailNotifications !== false) {
        const result = await sendNewExperimentNotification(
          user.email,
          user.firstname || user.username,
          experimentName
        );
        results.push({
          userId: user._id,
          email: user.email,
          success: result.success,
          messageId: result.messageId,
          error: result.error
        });
      }
    }
    
    return {
      totalUsers: users.length,
      notificationsSent: results.filter(r => r.success).length,
      results
    };
  } catch (error) {
    console.error('Error sending bulk notifications:', error);
    throw error;
  }
};
