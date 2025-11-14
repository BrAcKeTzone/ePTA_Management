/**
 * Fix Published Announcements Script
 *
 * This script updates all published announcements that don't have a publishDate
 * by setting their publishDate to their createdAt timestamp.
 *
 * Run: node fix-publish-dates.js
 */

const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function fixPublishDates() {
  try {
    console.log(
      "🔍 Checking for published announcements without publishDate...\n"
    );

    // Find announcements that need fixing
    const announcementsToFix = await prisma.announcement.findMany({
      where: {
        isPublished: true,
        publishDate: null,
      },
      select: {
        id: true,
        title: true,
        createdAt: true,
        isPublished: true,
        publishDate: true,
      },
    });

    if (announcementsToFix.length === 0) {
      console.log(
        "✅ No announcements need fixing. All published announcements have publishDate set.\n"
      );
      return;
    }

    console.log(
      `📝 Found ${announcementsToFix.length} published announcement(s) without publishDate:\n`
    );
    announcementsToFix.forEach((announcement, index) => {
      console.log(`${index + 1}. ID: ${announcement.id}`);
      console.log(`   Title: "${announcement.title}"`);
      console.log(`   Created: ${announcement.createdAt}`);
      console.log(`   publishDate: ${announcement.publishDate || "NULL"}\n`);
    });

    console.log(
      "🔧 Updating publishDate to createdAt for these announcements...\n"
    );

    // Update each announcement
    let updatedCount = 0;
    for (const announcement of announcementsToFix) {
      await prisma.announcement.update({
        where: { id: announcement.id },
        data: { publishDate: announcement.createdAt },
      });
      updatedCount++;
      console.log(
        `✓ Updated announcement #${announcement.id}: "${announcement.title}"`
      );
    }

    console.log(`\n✅ Successfully updated ${updatedCount} announcement(s)!\n`);

    // Verify the fix
    console.log(
      "🔍 Verifying all published announcements now have publishDate...\n"
    );
    const remainingIssues = await prisma.announcement.count({
      where: {
        isPublished: true,
        publishDate: null,
      },
    });

    if (remainingIssues === 0) {
      console.log("✅ All published announcements now have publishDate set!\n");

      // Show sample of updated announcements
      const updatedAnnouncements = await prisma.announcement.findMany({
        where: {
          isPublished: true,
        },
        select: {
          id: true,
          title: true,
          publishDate: true,
          isPublished: true,
        },
        orderBy: {
          publishDate: "desc",
        },
        take: 5,
      });

      console.log(
        "📋 Sample of published announcements (most recent first):\n"
      );
      updatedAnnouncements.forEach((announcement, index) => {
        console.log(`${index + 1}. "${announcement.title}"`);
        console.log(`   Published: ${announcement.publishDate}`);
        console.log(`   ID: ${announcement.id}\n`);
      });
    } else {
      console.log(
        `⚠️  Warning: ${remainingIssues} announcement(s) still have issues.\n`
      );
    }
  } catch (error) {
    console.error("❌ Error fixing publish dates:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
fixPublishDates()
  .then(() => {
    console.log("🎉 Script completed successfully!\n");
    console.log(
      "You can now check the parent announcements page - they should appear."
    );
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Script failed:", error);
    process.exit(1);
  });
