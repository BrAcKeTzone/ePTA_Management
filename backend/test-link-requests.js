const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function testLinkRequests() {
  try {
    console.log("=== Testing Link Requests with Rejection Reason ===\n");

    // Assuming parentId 2 is Vincent Lagmay
    const parentId = 2;

    // Get all link requests (PENDING and REJECTED)
    const allRequests = await prisma.student.findMany({
      where: {
        parentId,
        linkStatus: {
          in: ["PENDING", "REJECTED"],
        },
      },
      include: {
        parent: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: [{ createdAt: "desc" }],
    });

    console.log(
      `Found ${allRequests.length} link requests for parent ID ${parentId}:\n`
    );

    allRequests.forEach((request, index) => {
      console.log(
        `${index + 1}. ${request.firstName} ${request.middleName || ""} ${
          request.lastName
        }`
      );
      console.log(`   Student ID: ${request.studentId}`);
      console.log(`   Year Enrolled: ${request.yearEnrolled || "N/A"}`);
      console.log(`   Link Status: ${request.linkStatus}`);
      console.log(`   Parent: ${request.parent?.name || "No parent"}`);
      if (request.rejectionReason) {
        console.log(`   Rejection Reason: ${request.rejectionReason}`);
      }
      console.log(`   Created: ${request.createdAt}`);
      console.log("");
    });

    // Count by status
    const pendingCount = allRequests.filter(
      (r) => r.linkStatus === "PENDING"
    ).length;
    const rejectedCount = allRequests.filter(
      (r) => r.linkStatus === "REJECTED"
    ).length;

    console.log("=== Summary ===");
    console.log(`Pending: ${pendingCount}`);
    console.log(`Rejected: ${rejectedCount}`);
    console.log(`Total: ${allRequests.length}`);
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

testLinkRequests();
