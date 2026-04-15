const nodemailer = require('nodemailer');

class EmailService {
    constructor() {
        this.transporter = null;
        this.adminEmail = process.env.ADMIN_EMAIL || 'admin@agrosmart.com';

        // Initialize email transporter if credentials are available
        if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
            this.transporter = nodemailer.createTransport({
                service: process.env.EMAIL_SERVICE || 'gmail',
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASSWORD
                }
            });
        }
    }

    async sendEmail(to, subject, html) {
        try {
            // If email is not configured, log the message instead
            if (!this.transporter) {
                console.log('📧 Email (Mock Mode):', {
                    to,
                    subject,
                    html,
                    timestamp: new Date().toISOString()
                });
                return {
                    success: true,
                    mock: true,
                    message: 'Email logged (Email service not configured)'
                };
            }

            const result = await this.transporter.sendMail({
                from: `"AgroSmart System" <${process.env.EMAIL_USER}>`,
                to,
                subject,
                html
            });

            console.log('✅ Email sent successfully:', result.messageId);
            return {
                success: true,
                messageId: result.messageId
            };
        } catch (error) {
            console.error('❌ Email sending failed:', error.message);
            return {
                success: false,
                error: error.message
            };
        }
    }

    async sendNewUserRegistrationAlert(user) {
        const subject = '🌱 New User Registration - AgroSmart';
        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
                    .content { background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }
                    .info-row { margin: 10px 0; padding: 10px; background: white; border-radius: 4px; }
                    .label { font-weight: bold; color: #059669; }
                    .footer { background: #1f2937; color: #9ca3af; padding: 15px; text-align: center; border-radius: 0 0 8px 8px; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h2 style="margin: 0;">🌱 New User Registration</h2>
                        <p style="margin: 5px 0 0 0;">AgroSmart Hill Platform</p>
                    </div>
                    <div class="content">
                        <p>A new user has registered on the AgroSmart platform:</p>
                        
                        <div class="info-row">
                            <span class="label">👤 Name:</span> ${user.name}
                        </div>
                        
                        <div class="info-row">
                            <span class="label">📧 Email:</span> ${user.email}
                        </div>
                        
                        <div class="info-row">
                            <span class="label">📱 Phone:</span> ${user.phone}
                        </div>
                        
                        ${user.farmDetails?.farmName ? `
                        <div class="info-row">
                            <span class="label">🏡 Farm Name:</span> ${user.farmDetails.farmName}
                        </div>
                        ` : ''}
                        
                        ${user.farmDetails?.location?.address ? `
                        <div class="info-row">
                            <span class="label">📍 Location:</span> ${user.farmDetails.location.address}
                        </div>
                        ` : ''}
                        
                        ${user.farmDetails?.farmSize ? `
                        <div class="info-row">
                            <span class="label">📏 Farm Size:</span> ${user.farmDetails.farmSize} acres
                        </div>
                        ` : ''}
                        
                        ${user.farmDetails?.cropType ? `
                        <div class="info-row">
                            <span class="label">🌾 Crop Type:</span> ${user.farmDetails.cropType}
                        </div>
                        ` : ''}
                        
                        <div class="info-row">
                            <span class="label">🕒 Registration Time:</span> ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
                        </div>
                    </div>
                    <div class="footer">
                        <p style="margin: 0;">AgroSmart Hill - Smart Irrigation System</p>
                        <p style="margin: 5px 0 0 0;">Automated notification - Please do not reply to this email</p>
                    </div>
                </div>
            </body>
            </html>
        `;

        return await this.sendEmail(this.adminEmail, subject, html);
    }

    async sendWelcomeEmail(user) {
        const subject = '🌱 Welcome to AgroSmart Hill!';
        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center; }
                    .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }
                    .button { display: inline-block; background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
                    .footer { background: #1f2937; color: #9ca3af; padding: 15px; text-align: center; border-radius: 0 0 8px 8px; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1 style="margin: 0;">🌱 Welcome to AgroSmart Hill!</h1>
                    </div>
                    <div class="content">
                        <h2>Hello ${user.name}! 👋</h2>
                        <p>Thank you for joining AgroSmart Hill, your intelligent irrigation management platform.</p>
                        
                        <p>Your account has been successfully created and you can now:</p>
                        <ul>
                            <li>📊 Monitor real-time sensor data</li>
                            <li>💧 Control irrigation systems</li>
                            <li>🌾 Manage crop information</li>
                            <li>📱 Receive SMS and email alerts</li>
                            <li>📈 View analytics and insights</li>
                        </ul>
                        
                        <p><strong>Next Steps:</strong></p>
                        <ol>
                            <li>Complete your farm profile</li>
                            <li>Configure alert preferences</li>
                            <li>Connect your IoT sensors (when ready)</li>
                        </ol>
                        
                        <p>If you have any questions, feel free to reach out to our support team.</p>
                        
                        <p>Happy farming! 🌾</p>
                    </div>
                    <div class="footer">
                        <p style="margin: 0;">AgroSmart Hill - Smart Irrigation System</p>
                    </div>
                </div>
            </body>
            </html>
        `;

        return await this.sendEmail(user.email, subject, html);
    }

    async sendThresholdAlertEmail(user, title, message) {
        const subject = `🚨 AgroSmart Alert: ${title}`;
        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;}
                    .content { background: #fdf2f8; padding: 30px; border: 1px solid #fce7f3; }
                    .footer { background: #1f2937; color: #9ca3af; padding: 15px; text-align: center; border-radius: 0 0 8px 8px; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h2 style="margin: 0;">🚨 Critical Threshold Alert</h2>
                    </div>
                    <div class="content">
                        <h3>Operator: ${user.name}</h3>
                        <p><strong>System Event:</strong> ${title}</p>
                        <p style="font-size: 16px; color: #b91c1c; padding: 15px; background: #fee2e2; border-radius: 8px;">
                            ${message}
                        </p>
                        <p>Please check your AgroSmart Dashboard for real-time telemetry.</p>
                    </div>
                    <div class="footer">
                        <p style="margin: 0;">AgroSmart Hill - Automated Security Logic</p>
                    </div>
                </div>
            </body>
            </html>
        `;

        return await this.sendEmail(user.email, subject, html);
    }
}

module.exports = new EmailService();
