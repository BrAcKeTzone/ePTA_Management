/**
 * Unarchive Published Announcements
 * Fixes announcements that are published but archived
 */

const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function unarchivePublishedAnnouncements() {
  try {
    console.log("🔍 Finding published announcements that are archived...\n");

    const archivedButPublished = await prisma.announcement.findMany({
      where: {
        isPublished: true,
        isArchived: true,
      },
      select: {
        id: true,
        title: true,
        publishDate: true,
      },
    });

    if (archivedButPublished.length === 0) {
      console.log("✅ No archived published announcements found.\n");
      return;
    }

    console.log(
      `📝 Found ${archivedButPublished.length} published announcement(s) that are archived:\n`
    );
    archivedButPublished.forEach((ann, index) => {
      console.log(`${index + 1}. ID ${ann.id}: "${ann.title}"`);
    });

    console.log("\n🔧 Unarchiving them now...\n");

    const result = await prisma.announcement.updateMany({
      where: {
        isPublished: true,
        isArchived: true,
      },
      data: {
        isArchived: false,
      },
    });

    console.log(`✅ Unarchived ${result.count} announcement(s)!\n`);

    // Verify
    console.log("🔍 Verifying visible announcements...\n");

    const now = new Date();
    const visibleAnnouncements = await prisma.announcement.findMany({
      where: {
        isPublished: true,
        isArchived: false,
        OR: [{ expiryDate: null }, { expiryDate: { gte: now } }],
      },
      orderBy: [{ priority: "desc" }, { publishDate: "desc" }],
      select: {
        id: true,
        title: true,
        priority: true,
        publishDate: true,
      },
    });

    console.log(
      `✅ ${visibleAnnouncements.length} announcement(s) now visible to parents:\n`
    );
    visibleAnnouncements.forEach((ann, index) => {
      console.log(`${index + 1}. "${ann.title}" (${ann.priority})`);
      console.log(`   Published: ${ann.publishDate}\n`);
    });
  } catch (error) {
    console.error("❌ Error:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

unarchivePublishedAnnouncements()
  .then(() => {
    console.log("🎉 Done! Check the parent announcements page now.\n");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Script failed:", error);
    process.exit(1);
  });
