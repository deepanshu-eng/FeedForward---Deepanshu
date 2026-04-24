const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const donationSchema = new mongoose.Schema({
  pickupTime: Date,
  expiryTime: Date,
}, { strict: false });

const DonationRequest = mongoose.model('DonationRequest', donationSchema, 'donationrequests');

async function updateDates() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/foodDonationDB');
    console.log('Connected to DB');
    
    const donations = await DonationRequest.find();
    console.log(`Found ${donations.length} total donations. Applying specific date scenarios.`);
    
    // We will set exact dates for 26th and 27th April 2026
    const base26 = new Date('2026-04-26T10:00:00+05:30').getTime();
    const base27 = new Date('2026-04-27T10:00:00+05:30').getTime();
    const now = Date.now();
    
    for (let i = 0; i < donations.length; i++) {
      const d = donations[i];
      
      if (i < 2) {
        // EXPIRED (2 items) - Expires 2 hrs ago, Pickup was 4 hrs ago
        d.expiryTime = new Date(now - 2 * 60 * 60 * 1000);
        d.pickupTime = new Date(now - 4 * 60 * 60 * 1000);
      } else if (i < 4) {
        // URGENT (2 items) - Expires in 4 hours, Pickup in 2 hours
        d.expiryTime = new Date(now + 4 * 60 * 60 * 1000);
        d.pickupTime = new Date(now + 2 * 60 * 60 * 1000);
      } else if (i < 7) {
        // APRIL 26 (3 items) - Between 10 AM and 6 PM
        const offset = Math.floor(Math.random() * 8) * 60 * 60 * 1000;
        d.pickupTime = new Date(base26 + offset);
        d.expiryTime = new Date(base26 + offset + 2 * 60 * 60 * 1000); // Expires 2 hrs after pickup
      } else {
        // APRIL 27 (3 items) - Between 10 AM and 6 PM
        const offset = Math.floor(Math.random() * 8) * 60 * 60 * 1000;
        d.pickupTime = new Date(base27 + offset);
        d.expiryTime = new Date(base27 + offset + 2 * 60 * 60 * 1000);
      }
      
      await d.save();
    }
    
    console.log('✅ Done updating to explicit dates (April 26 & 27)!');
    mongoose.disconnect();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

updateDates();
