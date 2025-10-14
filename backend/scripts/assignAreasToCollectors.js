import mongoose from 'mongoose';
import Collector from '../models/collectorModel.js';
import Schedule from '../models/scheduleModel.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Script to assign areas to collectors based on existing schedules
 * Run this if you have existing schedules created before the fix
 */

const assignAreasToCollectors = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Get all schedules
    const schedules = await Schedule.find({});
    console.log(`📋 Found ${schedules.length} schedules`);

    let assignedCount = 0;
    let skippedCount = 0;

    // Process each schedule
    for (const schedule of schedules) {
      const collector = await Collector.findById(schedule.collectorId);
      
      if (!collector) {
        console.log(`⚠️ Collector not found for schedule ${schedule._id}`);
        continue;
      }

      // Check if area already assigned
      const areaAlreadyAssigned = collector.assignedAreas.some(
        area => area.toString() === schedule.area.toString()
      );

      if (areaAlreadyAssigned) {
        console.log(`⏭️ Area ${schedule.area} already assigned to ${collector.collectorName}`);
        skippedCount++;
        continue;
      }

      // Assign area to collector
      collector.assignedAreas.push(schedule.area);
      await collector.save();
      
      console.log(`✅ Assigned area ${schedule.area} to ${collector.collectorName}`);
      assignedCount++;
    }

    console.log('\n📊 Summary:');
    console.log(`✅ Areas assigned: ${assignedCount}`);
    console.log(`⏭️ Areas skipped (already assigned): ${skippedCount}`);
    console.log('\n🎉 Done!');

    // Disconnect
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

// Run the script
console.log('🚀 Starting area assignment script...\n');
assignAreasToCollectors();
