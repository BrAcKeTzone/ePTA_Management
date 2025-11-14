/**
 * Check Announcements Status
 * Quick diagnostic script to see what's in the database
 */

const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function checkAnnouncements() {
  try {
    console.log("=".repeat(70));
    console.log("ANNOUNCEMENT DATABASE DIAGNOSTIC");
    console.log("=".repeat(70));
    console.log();

    // Get ALL announcements
    const allAnnouncements = await prisma.announcement.findMany({
      select: {
        id: true,
        title: true,
        isPublished: true,
        publishDate: true,
        isArchived: true,
        expiryDate: true,
        createdAt: true,
        priority: true,
      },
      orderBy: { id: "asc" },
    });

    console.log(
      `📊 TOTAL ANNOUNCEMENTS IN DATABASE: ${allAnnouncements.length}\n`
    );

    if (allAnnouncements.length === 0) {
      console.log("❌ NO ANNOUNCEMENTS FOUND IN DATABASE!\n");
      console.log(
        "You need to create announcements from the admin panel first.\n"
      );
      return;
    }

    // Show all announcements
    console.log("📋 ALL ANNOUNCEMENTS:\n");
    allAnnouncements.forEach((ann) => {
      console.log(`ID: ${ann.id}`);
      console.log(`Title: "${ann.title}"`);
      console.log(`Priority: ${ann.priority}`);
      console.log(`isPublished: ${ann.isPublished}`);
      console.log(`publishDate: ${ann.publishDate || "NULL"}`);
      console.log(`isArchived: ${ann.isArchived}`);
      console.log(`expiryDate: ${ann.expiryDate || "NULL"}`);
      console.log(`createdAt: ${ann.createdAt}`);

      // Check if this would be visible to parents
      const now = new Date();
      const notExpired = !ann.expiryDate || new Date(ann.expiryDate) >= now;
      const wouldBeVisible =
        ann.isPublished &&
        !ann.isArchived &&
        notExpired &&
        ann.publishDate !== null;

      console.log(
        `✓ Would be visible to parents: ${wouldBeVisible ? "✅ YES" : "❌ NO"}`
      );

      if (!wouldBeVisible) {
        const reasons = [];
        if (!ann.isPublished) reasons.push("not published");
        if (ann.isArchived) reasons.push("archived");
        if (!notExpired) reasons.push("expired");
        if (!ann.publishDate) reasons.push("publishDate is NULL");
        console.log(`  Reasons: ${reasons.join(", ")}`);
      }

      console.log("-".repeat(70));
      console.log();
    });

    // Statistics
    const published = allAnnouncements.filter((a) => a.isPublished).length;
    const withPublishDate = allAnnouncements.filter(
      (a) => a.publishDate !== null
    ).length;
    const archived = allAnnouncements.filter((a) => a.isArchived).length;
    const now = new Date();
    const expired = allAnnouncements.filter(
      (a) => a.expiryDate && new Date(a.expiryDate) < now
    ).length;
    const visibleToParents = allAnnouncements.filter((a) => {
      const notExpired = !a.expiryDate || new Date(a.expiryDate) >= now;
      return (
        a.isPublished && !a.isArchived && notExpired && a.publishDate !== null
      );
    }).length;

    console.log("=".repeat(70));
    console.log("STATISTICS:");
    console.log("=".repeat(70));
    console.log(`Total: ${allAnnouncements.length}`);
    console.log(`Published (isPublished=true): ${published}`);
    console.log(`With publishDate set: ${withPublishDate}`);
    console.log(`Archived: ${archived}`);
    console.log(`Expired: ${expired}`);
    console.log(`\n🎯 VISIBLE TO PARENTS: ${visibleToParents}`);
    console.log("=".repeat(70));
    console.log();

    // Test the actual query used by getActiveAnnouncements
    console.log("🔍 TESTING getActiveAnnouncements QUERY:\n");

    const whereClause = {
      isPublished: true,
      isArchived: false,
      OR: [{ expiryDate: null }, { expiryDate: { gte: now } }],
    };

    const activeAnnouncements = await prisma.announcement.findMany({
      where: whereClause,
      orderBy: [{ priority: "desc" }, { publishDate: "desc" }],
      select: {
        id: true,
        title: true,
        publishDate: true,
        priority: true,
      },
    });

    console.log(
      `Results from getActiveAnnouncements query: ${activeAnnouncements.length}\n`
    );

    if (activeAnnouncements.length > 0) {
      console.log("✅ Query returns these announcements:");
      activeAnnouncements.forEach((ann, index) => {
        console.log(
          `${index + 1}. ID ${ann.id}: "${ann.title}" (${
            ann.priority
          }, published: ${ann.publishDate})`
        );
      });
    } else {
      console.log("❌ Query returns ZERO announcements!");
      console.log("\nPossible issues:");
      if (published === 0) {
        console.log("  - No announcements are published (isPublished=true)");
      }
      if (withPublishDate === 0) {
        console.log("  - No announcements have publishDate set");
      }
      if (archived === allAnnouncements.length) {
        console.log("  - All announcements are archived");
      }
    }
    console.log();
  } catch (error) {
    console.error("❌ Error:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

checkAnnouncements()
  .then(() => {
    console.log("✅ Diagnostic complete!\n");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Script failed:", error);
    process.exit(1);
  });
